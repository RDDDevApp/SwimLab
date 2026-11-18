# Brevo : brancher les emails de SwimLab (lot 2)

Aujourd'hui, Supabase envoie lui-même les emails de connexion (confirmation de compte,
mot de passe oublié). Ce service de dépannage est limité à quelques emails par heure et
finit souvent dans les indésirables. Brevo (service français, offre gratuite de
300 emails par jour) prend le relais pour :

- les **emails de connexion** de Supabase (confirmation, mot de passe oublié,
  changement d'email) ;
- l'**email au parent** d'un nageur de moins de 15 ans (fonction `notify-parent`, déjà
  déployée, qui attend ses clés).

Compter 30 minutes, plus le délai de validation de Brevo (de quelques minutes à un jour).

> Les clés Brevo sont secrètes : elles ne se collent que dans Supabase, jamais dans
> une conversation, un email ou un fichier du dépôt.

## 1. Créer le compte Brevo

1. Aller sur https://www.brevo.com/fr/ et cliquer sur **S'inscrire gratuitement**.
2. Choisir l'offre **Free**.
3. Remplir le profil (nom du club ou « SwimLab », adresse) : Brevo l'exige avant tout
   envoi.

## 2. Choisir l'adresse d'expédition

C'est l'adresse qui apparaît dans « De : » des emails.

- **Le mieux : une adresse sur ton propre nom de domaine** (par exemple
  `contact@swimlab.fr`). Dans Brevo : **Paramètres** → **Expéditeurs, domaines et IP**
  → onglet **Domaines** → **Ajouter un domaine**. Brevo donne trois ou quatre lignes à
  ajouter chez l'hébergeur du domaine (OVH, Gandi…). Une fois le domaine marqué
  « Authentifié », les emails arrivent bien mieux en boîte de réception.
- **Pour commencer sans domaine** : onglet **Expéditeurs** → **Ajouter un expéditeur**,
  avec une adresse que tu consultes. Brevo envoie un code de validation à cette adresse.
  Les adresses Gmail ou Outlook passent plus souvent en indésirables : à remplacer par
  un domaine avant le pilote.

Note l'adresse d'expédition validée : elle sert aux étapes 3 et 4.

## 3. Emails de connexion : SMTP dans Supabase

1. Dans Brevo : **Paramètres** → **SMTP et API** → onglet **SMTP**.
   - Noter le **Serveur SMTP** (`smtp-relay.brevo.com`), le **Port** (`587`) et
     l'**Identifiant** (une adresse en `@smtp-brevo.com`).
   - Cliquer sur **Générer une nouvelle clé SMTP**, la nommer « Supabase », et la copier
     (elle n'est affichée qu'une fois).
2. Dans Supabase : https://supabase.com/dashboard/project/kwzghvmwsrodpomtmfjt/auth/smtp
   (**Authentication** → **Emails** → onglet **SMTP Settings**).
3. Activer **Enable Custom SMTP** et remplir :

   | Champ | Valeur |
   | --- | --- |
   | Sender email | l'adresse d'expédition validée (étape 2) |
   | Sender name | `SwimLab` |
   | Host | `smtp-relay.brevo.com` |
   | Port number | `587` |
   | Username | l'identifiant SMTP de Brevo |
   | Password | la clé SMTP générée |

4. Cliquer sur **Save changes**.
5. Limite d'envoi : **Authentication** → **Rate Limits** → « Rate limit for sending
   emails » : mettre `100` par heure (largement assez pour le pilote).

**Modèles en français** : ils sont dans la pull request « Modèles d'emails en
français » (`supabase/email-templates/`, avec son propre mode d'emploi). Les coller dans
**Authentication** → **Emails** → onglet **Templates**, un par type d'email.

**Essai** : sur le site, page de connexion, **Mot de passe oublié** avec ton adresse.
L'email doit arriver en moins d'une minute, en français, expédié par ton adresse.

## 4. Email au parent : clé API pour `notify-parent`

1. Dans Brevo : **Paramètres** → **SMTP et API** → onglet **Clés API** →
   **Générer une nouvelle clé API**, la nommer « notify-parent », la copier.
2. Dans Supabase : https://supabase.com/dashboard/project/kwzghvmwsrodpomtmfjt/functions/secrets
   (**Edge Functions** → **Secrets**), ajouter deux secrets :

   | Name | Value |
   | --- | --- |
   | `BREVO_API_KEY` | la clé API copiée |
   | `BREVO_SENDER_EMAIL` | l'adresse d'expédition validée (étape 2) |

3. Cliquer sur **Save**.

La tâche horaire `notify-parent` enverra alors les emails en attente au prochain passage
(à la 5e minute de chaque heure). Elle a aussi besoin du secret `CRON_SECRET` (et du
secret Vault `cron_secret`, même valeur), à créer si ce n'est pas déjà fait.

## 5. Prévenir Claude

Dire simplement « Brevo est branché ». Claude vérifiera de son côté, sans voir les clés :

- que la tâche `notify-parent` répond bien (et n'attend plus ses clés) ;
- qu'un email de test part (inscription d'un compte de test) ;
- puis mettra CLAUDE.md à jour (lot 2 fait).

## En cas de souci

- **Email jamais reçu** : regarder les indésirables, puis Brevo → **Transactionnel** →
  **Logs** : l'email y apparaît avec son état (envoyé, refusé, bloqué).
- **« Sender not valid »** dans les logs : l'adresse d'expédition n'est pas validée dans
  Brevo (étape 2), ou ne correspond pas exactement à celle saisie dans Supabase.
- **Compte Brevo suspendu ou en attente** : Brevo vérifie les nouveaux comptes ; répondre
  à leur email de vérification (activité : application de suivi d'entraînement pour clubs
  de natation, emails de compte uniquement).
