// Edge Function : notify-parent
// Prévient par email le parent d'un nageur de moins de 15 ans qui vient de créer
// son compte (migration 023). Appelée toutes les heures par pg_cron (tâche
// « notify-parent ») avec l'en-tête x-cron-secret.
//
// Traite les comptes dont parent_email est renseigné et parent_notified_at vide,
// créés il y a moins de 14 jours, puis note l'heure d'envoi.
//
// Secrets (Edge Functions > Secrets) :
//   CRON_SECRET          même valeur que le secret Vault « cron_secret »
//   BREVO_API_KEY        clé API Brevo (lot 2) ; sans elle, rien n'est envoyé
//   BREVO_SENDER_EMAIL   adresse d'expédition validée dans Brevo
//
// Déploiement : supabase functions deploy notify-parent (verify_jwt = false)

import { createClient } from 'npm:@supabase/supabase-js@2';

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const SITE_URL = 'https://rdddevapp.github.io/SwimLab/';
const BATCH = 50;

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (!cronSecret || req.headers.get('x-cron-secret') !== cronSecret) {
    return json({ error: 'Non autorisé' }, 401);
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const since = new Date(Date.now() - 14 * 86400000).toISOString();
    const { data: pending, error } = await supabase
      .from('member_consents')
      .select('user_id, parent_email')
      .not('parent_email', 'is', null)
      .is('parent_notified_at', null)
      .gte('created_at', since)
      .limit(BATCH);
    if (error) throw error;
    if (!pending?.length) return json({ pending: 0, sent: 0 });

    const apiKey = Deno.env.get('BREVO_API_KEY');
    const sender = Deno.env.get('BREVO_SENDER_EMAIL');
    if (!apiKey || !sender) {
      // Service d'email pas encore branché : les envois attendent, rien n'est perdu
      return json({ pending: pending.length, sent: 0, waiting: 'BREVO_API_KEY ou BREVO_SENDER_EMAIL manquant' }, 503);
    }

    // member_consents.user_id pointe vers auth.users : prénoms lus à part dans profiles
    const ids = pending.map((p: any) => p.user_id);
    const { data: profiles } = await supabase.from('profiles').select('id, first_name').in('id', ids);
    const firstNames = new Map((profiles ?? []).map((p: any) => [p.id, p.first_name || 'ton enfant']));

    let sent = 0;
    for (const row of pending as { user_id: string; parent_email: string }[]) {
      const child = firstNames.get(row.user_id) ?? 'ton enfant';
      const res = await fetch(BREVO_URL, {
        method: 'POST',
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          sender: { name: 'SwimLab', email: sender },
          to: [{ email: row.parent_email }],
          subject: `${child} utilise SwimLab pour ses entraînements de natation`,
          htmlContent: parentEmailHtml(child),
        }),
      });
      if (!res.ok) {
        console.error('notify-parent: envoi refusé', res.status, await res.text());
        continue;
      }
      const { error: updateError } = await supabase
        .from('member_consents')
        .update({ parent_notified_at: new Date().toISOString() })
        .eq('user_id', row.user_id);
      if (updateError) throw updateError;
      sent++;
    }

    return json({ pending: pending.length, sent });
  } catch (err) {
    console.error('notify-parent error:', err);
    return json({ error: 'Erreur lors de l’envoi' }, 500);
  }
});

/** Email d'information au parent, aux couleurs de la DA (styles en ligne). */
function parentEmailHtml(child: string): string {
  const name = escapeHtml(child);
  const p = (t: string) => `<p style="margin:0 0 12px 0;font-size:16px;line-height:24px;color:#06184a;">${t}</p>`;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f7fc;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f7fc;"><tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;">
<tr><td style="background:#01236e;padding:24px;">
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;color:#ffffff;">SwimLab</p>
<p style="margin:4px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#ffffff;">Chaque longueur compte.</p>
</td></tr>
<tr><td style="padding:24px;font-family:Arial,Helvetica,sans-serif;">
<h1 style="margin:0 0 12px 0;font-size:22px;line-height:28px;color:#06184a;">Bonjour,</h1>
${p(`${name} vient de créer un compte SwimLab et a indiqué que tu étais d'accord. SwimLab est l'application de son club de natation : le coach y prépare les séances et fait l'appel, le nageur y voit son programme et dit comment il s'est senti après l'entraînement.`)}
${p("Ce que SwimLab enregistre : son prénom, son nom, son email, sa date de naissance, ses présences et ses ressentis d'entraînement. Seuls ses coachs voient ses présences et ses ressentis. Pas de publicité, pas de revente, données stockées dans l'Union européenne.")}
${p("Tu peux à tout moment demander à voir ou à supprimer ses données, en t'adressant à son club. Le compte peut aussi être supprimé depuis la page Profil de l'application.")}
${p("Tu n'es pas au courant ou tu n'es pas d'accord ? Contacte son club : le compte sera supprimé.")}
<p style="margin:24px 0 0 0;font-size:14px;line-height:20px;color:#465a82;">Découvrir SwimLab : <a href="${SITE_URL}" style="color:#044fb3;">${SITE_URL}</a></p>
</td></tr></table>
<p style="margin:16px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#465a82;">Tu reçois cet email parce que ton adresse a été indiquée comme celle d'un parent sur SwimLab.</p>
</td></tr></table></body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
