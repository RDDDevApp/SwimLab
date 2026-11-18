# Modèles d'emails (Supabase Auth)

Emails envoyés par Supabase lors de l'inscription, du mot de passe oublié, etc.
En français, au tutoiement, aux couleurs de la DA « La vague ». À coller à la main
dans Supabase : ils ne sont pas déployés automatiquement.

## Où les coller

Supabase → **Authentication** → **Emails** → onglet **Templates**. Pour chaque
modèle : remplir le **Subject**, coller le contenu du fichier dans **Message
body** (vue « Source »), puis **Save changes**.

| Modèle Supabase | Fichier | Objet (Subject) |
|---|---|---|
| Confirm signup | `confirmation.html` | Confirme ton adresse SwimLab |
| Reset password | `recovery.html` | Ton nouveau mot de passe SwimLab |
| Change email address | `email-change.html` | Confirme ta nouvelle adresse SwimLab |
| Magic link | `magic-link.html` | Ton lien de connexion SwimLab |
| Invite user | `invite.html` | Ton club t'invite sur SwimLab |

## Bon à savoir

- Les `{{ .ConfirmationURL }}`, `{{ .Email }}` et `{{ .NewEmail }}` sont remplis par
  Supabase : ne pas les traduire ni les modifier.
- Mise en page en tableaux et styles en ligne : c'est la seule forme qui s'affiche
  correctement dans Gmail, Outlook et les applications mobiles. Pas d'image : rien
  à héberger, rien de bloqué par la messagerie.
- Les polices Sora et Figtree s'affichent si la messagerie les connaît, sinon Arial.
- Avec le service gratuit de Supabase, seuls quelques emails partent par heure : le
  lot 2 (Brevo) lève cette limite, sans changer ces modèles.
