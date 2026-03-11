# 🌊 Feed Social SwimLab — Spécification V2

## Objectif

Créer un feed d'activité style Strava où les nageurs peuvent voir les accomplissements des autres, réagir et interagir. Le contenu est généré automatiquement par l'activité dans l'app — le nageur nage, donne son feedback, et SwimLab crée le post pour lui. Le feed transforme l'activité sportive en contenu social.

**Version cible** : V2 (Social & Communauté)

**Philosophie** : Célébrer les accomplissements, pas le quotidien. Le feed ne montre que les moments forts (badges, records, défis) pour garder chaque post impactant et éviter le bruit.

---

## Types de Posts

### Post Badge Débloqué 🏅

Généré automatiquement quand un nageur débloque un nouveau badge.

**Contenu affiché** :
- Avatar du nageur avec niveau et ring de couleur
- Nom + club + horodatage
- Le badge en grand (icône, nom, tier avec couleur)
- Le titre débloqué associé
- La description du critère atteint
- Tag "SECRET" violet si badge secret (plus impactant visuellement)

**Mise en forme** : Card premium avec fond gradient basé sur la couleur du tier (bronze, argent, or, diamant). Effet glow sur le badge. Les badges Diamant et les badges secrets ont un traitement visuel supérieur pour marquer la rareté.

**Déclenchement** : Immédiat au moment du déblocage par le moteur de gamification.

---

### Post Record Personnel 📈

Généré automatiquement quand le nageur bat un de ses propres records.

**Records trackés** :
- Meilleure distance hebdomadaire
- Meilleure assiduité mensuelle (nombre de semaines consécutives)
- RPE moyen mensuel le plus bas (meilleure maîtrise)
- Plus grande distance en une seule séance
- Nouveau tier dans une famille de badges

**Contenu affiché** :
- Avatar du nageur
- Tag "RECORD" en jaune
- Card dorée avec l'icône du type de record
- Ancien record barré + nouveau record en gros
- Pourcentage ou label d'amélioration en vert
- Texte descriptif

**Mise en forme** : Card avec fond gradient jaune subtil, ancien record en strikethrough gris, nouveau record en gras jaune, badge d'amélioration vert.

**Déclenchement** : À la fin de la période concernée (fin de semaine pour les records hebdo, fin de mois pour les mensuels) ou en temps réel pour les records par séance.

---

### Post Défi Complété 🎯

Généré quand un nageur complète un défi mensuel ou permanent.

**Deux variantes** :

**Défi individuel** — Le nageur a atteint l'objectif personnel d'un défi mensuel (ex: 10 km de papillon). Affiche le nom du défi, l'objectif atteint, le temps mis pour y arriver, et le nombre total de participants / combien ont terminé.

**Défi collectif** — Le club entier a atteint un objectif commun (ex: Marathon Collectif 500 km). Post spécial visible par tout le club. Affiche l'objectif, le résultat final, le nombre de contributeurs. Ce post est partagé — il n'appartient pas à un nageur mais au club.

**Contenu affiché** :
- Avatar du nageur (ou icône club si collectif)
- Tag "DÉFI" ou "CLUB" selon le type
- Card centrée avec icône du défi, nom, objectif, résultat
- Badge "Complété" en vert
- Texte descriptif

**Mise en forme** : Card avec fond gradient de la couleur du défi. Les défis collectifs ont un traitement plus large et les commentaires sont affichés en entier (moment communautaire).

**Déclenchement** : Au moment où le seuil est franchi.

---

## Interactions Sociales

### Réactions

Système double : un like rapide ❤️ accessible en un tap, plus un picker de réactions thématiques natation accessible via un bouton "+".

**Les 5 réactions** :
- ❤️ J'aime — Réaction universelle, quick tap
- 💦 Splash — L'équivalent du "Kudos" Strava, réaction signature SwimLab
- 🔥 En feu — Impressionnant, performance remarquable
- 💪 Force — Bravo pour l'effort, encouragement
- 🌊 Respect — Admiration, accomplissement de long terme

Un nageur peut mettre plusieurs réactions sur un même post. Les réactions actives sont surlignées visuellement. Le résumé à droite de chaque post montre les 3 emojis les plus utilisés + le total de réactions.

### Commentaires

Courts et encourageants. Affichés sous le post avec avatar + prénom + texte. Un seul commentaire visible par défaut, avec un lien "Voir X autres commentaires" pour déplier.

Pas de fil de discussion (pas de réponse à un commentaire). L'objectif est de garder l'énergie positive et la simplicité. Limite de 200 caractères par commentaire.

### Suivre

**Intra-club** : Par défaut, tous les membres du club sont suivis automatiquement. Leurs posts apparaissent dans le feed club et le feed général.

**Inter-club** (V2+) : Le nageur peut chercher et suivre des nageurs d'autres clubs. Leur activité apparaît dans le feed général mais pas dans le feed club.

**Suggestions de follow** : Insérées naturellement dans le feed (après le 2ème post). Basées sur les amis en commun, le même niveau, la même ville, ou les mêmes types de défis en cours.

---

## Structure du Feed

### Feed Général 🌍

Feed par défaut. Mix de tous les posts des nageurs suivis (intra-club et inter-club). Trié par pertinence pondérée :

- Posts récents en priorité (décroissance temporelle)
- Posts des gens qu'on suit activement > posts algorithmiques
- Badges rares (Diamant, secrets) remontent naturellement
- Défis collectifs complétés remontent pour tout le club
- Records significatifs (gros pourcentage d'amélioration) remontent

Le feed général est le point d'entrée social de l'app.

### Feed Club 🏠

Uniquement l'activité des membres du club du nageur. Plus intime, tout le monde se connaît. Trié chronologiquement (le plus récent en haut).

Le toggle Général / Mon Club est accessible en haut du feed avec un compteur de posts pour chaque onglet.

### Profil d'un Nageur

Accessible en cliquant sur l'avatar d'un nageur dans le feed. Affiche :
- Son profil social complet (titre, badges épinglés, stats, niveau XP — cf. GAMIFICATION_V1.md)
- Son historique d'activité (ses posts dans le feed)
- Bouton Suivre / Ne plus suivre

---

## Barre de Stories

En haut du feed, une rangée horizontale scrollable d'avatars des nageurs suivis qui ont eu une activité récente (dernières 24h). Chaque avatar est entouré d'un dégradé turquoise→pink (indicateur d'activité non vue). Cliquer sur un avatar ouvre le profil du nageur.

Ordre d'affichage : activité la plus récente en premier, puis par proximité (même club > suivi > suggestions).

---

## Visibilité & Contrôle

### Profil public / privé

Chaque nageur choisit son niveau de visibilité :
- **Club uniquement** (par défaut) : Profil et posts visibles uniquement par les membres du club
- **Public** : Profil et posts visibles par tous les utilisateurs SwimLab

### Contrôle des posts

Le nageur peut masquer un post automatique de son profil après sa publication (le post disparaît du feed des autres). Il peut aussi choisir en amont quels types de posts sont publiés automatiquement dans ses paramètres (opt-in par type : badges, records, défis).

---

## Notifications Sociales

### Notifications liées au feed

- "Sophie a réagi 💦 à ton badge Indestructible"
- "Marc a commenté ton record : Bravo !"
- "3 personnes ont réagi à ton défi complété"
- "Thomas (Aqua Lyon) a commencé à te suivre"
- "Ton club a complété le Marathon Collectif ! 🎉"

### Regroupement

Les notifications sont regroupées pour éviter le spam : "Sophie, Marc et 5 autres ont réagi à ton badge" plutôt que 7 notifications séparées.

### Paramètres

Le nageur peut désactiver les notifications par type : réactions, commentaires, nouveaux followers, activité club.

---

## Partage Externe

Chaque post peut être partagé en dehors de l'app via un visuel généré automatiquement.

**Format** : Image 1080×1920 (format story Instagram/WhatsApp) aux couleurs SwimLab (fond deep blue, accents turquoise/jaune/pink).

**Contenu du visuel** :
- Le badge / record / défi en grand
- Les stats clés associées
- Nom du nageur + titre
- Logo SwimLab + lien app store
- QR code optionnel vers le profil public

**Canaux** : Partage natif iOS/Android (Instagram Story, WhatsApp, SMS, etc.). C'est du marketing organique gratuit pour SwimLab.

---

## Modération & Sécurité

### Commentaires

Filtre automatique des contenus inappropriés (insultes, spam). Possibilité de signaler un commentaire. Le coach du club peut modérer les commentaires de son club.

### Anti-toxicité

Pas de classement public permanent (le leaderboard est uniquement dans les défis mensuels, limité dans le temps). Pas de compteur de followers visible publiquement (éviter la course aux followers). L'accent est sur les accomplissements personnels, pas la comparaison.

### Mineurs

Si un nageur est mineur (< 18 ans), son profil est en mode "Club uniquement" par défaut et ne peut pas être rendu public sans validation parentale (V2+).

---

## Schéma Base de Données

5 nouvelles tables pour V2 :

**feed_posts** — Les posts du feed. Champs : id, user_id (nullable pour les posts collectifs), club_id, type (badge/record/challenge/challenge_collective), content (JSONB contenant les détails spécifiques au type), scope (club/public), visibility (visible/hidden), created_at.

**feed_reactions** — Les réactions sur les posts. Champs : id, post_id, user_id, reaction_type (like/splash/fire/muscle/wave), created_at. Contrainte unique sur (post_id, user_id, reaction_type) pour éviter les doublons.

**feed_comments** — Les commentaires. Champs : id, post_id, user_id, text (max 200 chars), created_at. Index sur post_id pour les requêtes fréquentes.

**user_follows** — Le graphe social. Champs : id, follower_id, following_id, created_at. Contrainte unique sur (follower_id, following_id).

**feed_settings** — Préférences de publication et notification par nageur. Champs : id, user_id, auto_post_badges (boolean, default true), auto_post_records (boolean, default true), auto_post_challenges (boolean, default true), profile_visibility (club/public, default club), notify_reactions (boolean, default true), notify_comments (boolean, default true), notify_follows (boolean, default true).

### Génération des posts

Les posts sont générés par des Supabase Edge Functions déclenchées par les mêmes événements que le moteur de gamification :
1. Badge débloqué → insert dans feed_posts si auto_post_badges = true
2. Record battu → insert si auto_post_records = true
3. Défi complété → insert si auto_post_challenges = true
4. Défi collectif atteint → insert avec user_id = null et club_id

### Requête du feed

Le feed général combine :
- Posts des nageurs suivis (via user_follows)
- Posts du club (via club_members)
- Posts publics des nageurs populaires (bonus algorithmique)

Trié par score = récence × (1 + bonus_rareté + bonus_réactions). Paginé par cursor (created_at) pour le scroll infini.

Le feed club est plus simple : tous les posts où club_id = mon club, triés par created_at DESC.

---

## Identité Visuelle

### Couleurs par type de post
- Badge classique : fond gradient basé sur le tier (bronze/argent/or/diamant)
- Badge secret : fond gradient violet→pink avec tag "SECRET"
- Record : fond gradient jaune subtil, ancien record barré, nouveau en gras
- Défi individuel : fond gradient de la couleur du défi
- Défi collectif : traitement élargi, couleur turquoise (couleur club)

### Cards
- Fond : #0C1A2E (bgCard) avec border 1px solid rgba(240,246,255,0.05)
- Border-radius : 20px
- Padding : 20px
- Les posts premium (badges diamant, secrets, collectifs) ont un glow subtil via box-shadow

### Réactions
- Picker : fond élevé #1A3358, border-radius 16px, shadow forte
- Réaction active : background turquoise dim, border turquoise
- Résumé : top 3 emojis + total en gris

### Commentaires
- Séparés du contenu principal par un border-top subtil
- Avatar 26px + prénom bold + texte en gris clair
- Max 1 visible par défaut, "Voir X autres" pour déplier

---

## Connexion avec les Autres Modules

### Gamification (GAMIFICATION_V1.md)
- Les badges débloqués génèrent des posts
- Les défis complétés génèrent des posts
- Le profil social affiche les badges épinglés et le titre actif
- Les badges secrets apparaissent avec un traitement spécial dans le feed

### Calendrier / Entraînements
- Les records sont calculés à partir des données de workout_sessions et workout_assignments
- La distance hebdomadaire vient de la somme des entraînements complétés
- L'assiduité vient du tracking de présence (émargement)

### Profil
- Le profil existant est enrichi avec le volet social (followers, historique de posts)
- Le titre actif et les badges épinglés sont visibles dans le feed à chaque post

---

## Priorités d'Implémentation

**Phase 1 — Feed de base** : Tables BDD, Edge Functions de génération des posts, feed chronologique club uniquement, affichage des 3 types de posts.

**Phase 2 — Réactions & Commentaires** : Système de like + picker de réactions thématiques, commentaires courts, notifications de réactions/commentaires.

**Phase 3 — Social** : Système de follow (intra-club auto + inter-club manuel), feed général avec tri par pertinence, suggestions de follow, barre de stories.

**Phase 4 — Contrôle & Partage** : Paramètres de visibilité (profil public/privé), opt-in par type de post, masquage de posts, génération de visuels partageables (story 1080×1920), partage natif.

---

## Questions Ouvertes

- **Posts manuels** : Le nageur peut-il poster du texte libre en plus des posts automatiques ? (texte d'humeur, motivation, question) — À valider.
- **Réactions du coach** : Le coach voit-il le feed comme les nageurs ? A-t-il des réactions spéciales (ex: encouragement officiel visible différemment) ?
- **Cross-club V2+** : Jusqu'où va l'ouverture inter-clubs ? Faut-il un système de clubs "amis" ou "jumelés" ?
- **Feed algorithmique** : Quel poids donner à la pertinence vs la chronologie dans le feed général ? Commencer 100% chrono puis itérer ?

---

**Version** : 1.0
**Date** : 9 Mars 2026
**Statut** : Brainstorm validé, prêt pour développement V2
