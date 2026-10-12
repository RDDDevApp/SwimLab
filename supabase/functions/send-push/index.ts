// Edge Function : send-push
// Rappels planifies via Expo Push API. A invoquer par pg_cron / Scheduled
// Functions avec un body { "type": "training_reminder" | "feedback_reminder" }.
//
// Deploiement :
//   supabase functions deploy send-push
// Planification (SQL editor, extension pg_cron + pg_net requises) :
//   -- Rappel seance du lendemain, tous les jours a 18h
//   select cron.schedule('training-reminder', '0 18 * * *', $$
//     select net.http_post(
//       url := '<PROJECT_URL>/functions/v1/send-push',
//       headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
//       body := '{"type": "training_reminder"}'::jsonb
//     );
//   $$);
//   -- Rappel feedback en attente, tous les jours a 21h
//   select cron.schedule('feedback-reminder', '0 21 * * *', $$ ... "feedback_reminder" ... $$);

import { createClient } from 'npm:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (req) => {
  try {
    const { type } = await req.json().catch(() => ({ type: 'training_reminder' }));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    let messages: { to: string; title: string; body: string; data: Record<string, string> }[] = [];

    if (type === 'training_reminder') {
      // Seances de demain -> nageurs des groupes concernes (opt-in reminder)
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

      const { data: assignments, error } = await supabase
        .from('workout_assignments')
        .select('id, scheduled_date, training_slots!inner(start_time, group_id, name)')
        .eq('scheduled_date', tomorrow);
      if (error) throw error;

      for (const a of assignments ?? []) {
        const slot = (a as any).training_slots;
        const { data: members } = await supabase
          .from('group_members')
          .select('user_id, profiles!user_id(notification_reminder)')
          .eq('group_id', slot.group_id);

        const optedIn = (members ?? [])
          .filter((m: any) => m.profiles?.notification_reminder !== false)
          .map((m: any) => m.user_id);
        if (!optedIn.length) continue;

        const { data: tokens } = await supabase
          .from('push_tokens')
          .select('token')
          .in('user_id', optedIn);

        for (const t of tokens ?? []) {
          messages.push({
            to: t.token,
            title: 'Entraînement demain',
            body: `${slot.name} demain à ${String(slot.start_time).slice(0, 5)}`,
            data: { type: 'training_reminder' },
          });
        }
      }
    }

    if (type === 'feedback_reminder') {
      // Sessions assistees sans feedback -> nageurs (opt-in feedback)
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('swimmer_id, profiles!swimmer_id(notification_feedback)')
        .eq('attended', true)
        .is('completed_at', null);
      if (error) throw error;

      const swimmerIds = [
        ...new Set(
          (sessions ?? [])
            .filter((s: any) => s.profiles?.notification_feedback !== false)
            .map((s: any) => s.swimmer_id),
        ),
      ];
      if (swimmerIds.length) {
        const { data: tokens } = await supabase
          .from('push_tokens')
          .select('token')
          .in('user_id', swimmerIds);

        for (const t of tokens ?? []) {
          messages.push({
            to: t.token,
            title: 'Feedback en attente',
            body: 'Donne ton ressenti sur ta dernière séance !',
            data: { type: 'feedback_reminder' },
          });
        }
      }
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

    return new Response(JSON.stringify({ type, queued: messages.length, sent }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
