// Edge Function : send-push
// Notifications push via l'API Expo. Trois types d'appel :
//   - { "type": "training_reminder" }  rappel des séances du lendemain (planifié, 18 h)
//   - { "type": "feedback_reminder" }  rappel des feedbacks en attente (planifié, 21 h)
//   - { "type": "feedback_request", "assignment_id": "..." }
//        appelé par le coach juste après l'émargement : notifie les nageurs présents.
//
// Sécurité :
//   - types planifiés : en-tête x-cron-secret égal au secret CRON_SECRET
//     (tâches pg_cron de la migration 022) ;
//   - feedback_request : utilisateur connecté ET coach du groupe de la séance.
//
// Déploiement :
//   secret CRON_SECRET à définir dans Supabase (Edge Functions > Secrets),
//   même valeur que le secret Vault « cron_secret » (migration 022)
//   supabase functions deploy send-push

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type PushMessage = { to: string; title: string; body: string; data: Record<string, string> };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const body = await req.json().catch(() => null);
    const type = body?.type;
    if (!['training_reminder', 'feedback_reminder', 'feedback_request'].includes(type)) {
      return json({ error: 'Type de notification inconnu' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    let messages: PushMessage[] = [];

    if (type === 'feedback_request') {
      const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
      const { data: userData } = await supabase.auth.getUser(jwt);
      const user = userData?.user;
      if (!user) return json({ error: 'Non connecté' }, 401);

      const assignmentId = String(body?.assignment_id ?? '');
      const { data: allowed, error: rpcError } = await supabase.rpc('get_coach_assignment_ids', {
        p_user_id: user.id,
      });
      if (rpcError) throw rpcError;
      const allowedIds = (allowed ?? []).map((r: any) => (typeof r === 'string' ? r : Object.values(r)[0]));
      if (!allowedIds.includes(assignmentId)) {
        return json({ error: "Tu n'es pas coach de cette séance" }, 403);
      }

      messages = await feedbackRequestMessages(supabase, assignmentId);
    } else {
      const cronSecret = Deno.env.get('CRON_SECRET');
      if (!cronSecret || req.headers.get('x-cron-secret') !== cronSecret) {
        return json({ error: 'Non autorisé' }, 401);
      }
      messages = type === 'training_reminder'
        ? await trainingReminderMessages(supabase)
        : await feedbackReminderMessages(supabase);
    }

    // Envoi par lots de 100 (limite Expo)
    let sent = 0;
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100).map((m) => ({ ...m, sound: 'default' }));
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
      if (res.ok) sent += batch.length;
    }

    return json({ type, queued: messages.length, sent });
  } catch (err) {
    console.error('send-push error:', err);
    return json({ error: 'Erreur lors de l’envoi des notifications' }, 500);
  }
});

/** Ids des profils qui n'ont pas désactivé ce type de notification. */
async function optedIn(
  supabase: SupabaseClient,
  userIds: string[],
  column: 'notification_reminder' | 'notification_feedback',
): Promise<string[]> {
  if (!userIds.length) return [];
  const { data, error } = await supabase.from('profiles').select(`id, ${column}`).in('id', userIds);
  if (error) throw error;
  return (data ?? []).filter((p: any) => p[column] !== false).map((p: any) => p.id);
}

async function tokensFor(supabase: SupabaseClient, userIds: string[]): Promise<string[]> {
  if (!userIds.length) return [];
  const { data, error } = await supabase.from('push_tokens').select('token').in('user_id', userIds);
  if (error) throw error;
  return [...new Set((data ?? []).map((t: any) => t.token))];
}

async function trainingReminderMessages(supabase: SupabaseClient): Promise<PushMessage[]> {
  // Séances de demain (heure de Paris) -> membres des groupes concernés
  const tomorrow = parisDate(1);
  const { data: assignments, error } = await supabase
    .from('workout_assignments')
    .select('id, training_slots!inner(start_time, group_id, name)')
    .eq('scheduled_date', tomorrow);
  if (error) throw error;

  const messages: PushMessage[] = [];
  for (const a of assignments ?? []) {
    const slot = (a as any).training_slots;
    // group_members.user_id pointe vers auth.users : pas de jointure profiles!user_id possible
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', slot.group_id);
    if (membersError) throw membersError;

    const ids = await optedIn(supabase, (members ?? []).map((m: any) => m.user_id), 'notification_reminder');
    for (const token of await tokensFor(supabase, ids)) {
      messages.push({
        to: token,
        title: 'Entraînement demain',
        body: `${slot.name} demain à ${String(slot.start_time).slice(0, 5)}`,
        data: { type: 'training_reminder' },
      });
    }
  }
  return messages;
}

async function feedbackReminderMessages(supabase: SupabaseClient): Promise<PushMessage[]> {
  // Présences des 3 derniers jours sans feedback (pas de relance sans fin)
  const { data: sessions, error } = await supabase
    .from('workout_sessions')
    .select('swimmer_id, workout_assignments!inner(scheduled_date)')
    .eq('attended', true)
    .is('completed_at', null)
    .gte('workout_assignments.scheduled_date', parisDate(-3));
  if (error) throw error;

  const swimmerIds = [...new Set((sessions ?? []).map((s: any) => s.swimmer_id))];
  const ids = await optedIn(supabase, swimmerIds, 'notification_feedback');
  return (await tokensFor(supabase, ids)).map((token) => ({
    to: token,
    title: 'Feedback en attente',
    body: 'Donne ton ressenti sur ta dernière séance !',
    data: { type: 'feedback_reminder' },
  }));
}

async function feedbackRequestMessages(
  supabase: SupabaseClient,
  assignmentId: string,
): Promise<PushMessage[]> {
  // Pas de titre de séance dans le message : l'émargement peut avoir lieu avant la fin
  // du cours, et le programme reste secret jusque-là (migration 020).
  const { data: sessions, error: sessionsError } = await supabase
    .from('workout_sessions')
    .select('swimmer_id')
    .eq('workout_assignment_id', assignmentId)
    .eq('attended', true);
  if (sessionsError) throw sessionsError;

  const ids = await optedIn(supabase, (sessions ?? []).map((s: any) => s.swimmer_id), 'notification_feedback');
  return (await tokensFor(supabase, ids)).map((token) => ({
    to: token,
    title: 'Feedback demandé',
    body: 'Donne ton ressenti sur la séance du jour.',
    data: { type: 'feedback_required', assignment_id: assignmentId },
  }));
}

/** Date AAAA-MM-JJ à Paris, décalée de `offsetDays` jours. */
function parisDate(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(d);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
