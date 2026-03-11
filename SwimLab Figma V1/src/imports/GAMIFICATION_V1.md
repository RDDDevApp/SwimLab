# 🏅 Gamification SwimLab — Spécification V1

## Objectif

Créer un système de motivation et d'engagement social autour de l'entraînement en natation. Le nageur accumule des accomplissements qui se traduisent en **badges** (visuels collectionnables), **surnoms/titres** (affichés sur le profil) et **XP** (progression globale). Les **défis** (permanents, mensuels, secrets) alimentent l'ensemble et créent de l'émulation au sein du club.

**Version cible** : V1 (avec composante sociale)

---

## Architecture du Système

Trois couches qui s'alimentent mutuellement :

**Trackers** (données brutes, invisibles pour le nageur) — Distance totale cumulée, nombre de feedbacks donnés, semaines consécutives de présence, distance par type de nage, RPE moyen, nombre d'entraînements par intensité, etc. C'est la plomberie qui alimente tout le reste.

**Défis** (objectifs avec progression visible) — Permanents ou temporaires, avec barre de progression. C'est ce que le nageur suit activement dans l'app.

**Récompenses** (badges + titres + XP) — Débloquées quand un défi est complété ou un seuil franchi. C'est ce que le nageur montre aux autres.

Le moteur tourne en arrière-plan : à chaque événement dans l'app (entraînement complété, feedback donné, distance nagée…), il vérifie les seuils et déclenche les déblocages automatiquement.

---

## Badges

### Structure

Chaque badge appartient à une **famille** thématique et possède un **tier** (niveau de rareté). Débloquer un badge donne accès à un **titre** que le nageur peut afficher sur son profil.

Tiers : Bronze → Argent → Or → Diamant. Chaque tier a sa couleur distinctive et son indicateur visuel.

### Famille DISTANCE — Les Voyageurs 🌊

Récompense le volume cumulé, toutes nages confondues.

| Tier | Seuil | Badge | Titre débloqué |
|------|-------|-------|----------------|
| Bronze | 10 km | Première Vague | Le Têtard |
| Argent | 50 km | Courant Marin | Le Dauphin |
| Or | 200 km | Force de la Mer | Le Requin |
| Diamant | 1 000 km | Légende des Océans | Le Léviathan |

Déclinaisons par nage :
- Papillon de Nuit — 50 km en papillon
- Dos Crawlé — 100 km en dos
- Le Brasseur — 100 km en brasse
- L'Électrique — 100 km en crawl sprint

### Famille ASSIDUITÉ — Les Réguliers ⚡

Récompense la constance et la régularité de présence.

| Tier | Seuil | Badge | Titre débloqué |
|------|-------|-------|----------------|
| Bronze | 4 semaines consécutives sans absence | Ancré | Le Fidèle |
| Argent | 12 semaines consécutives | Insubmersible | La Marée Haute |
| Or | 6 mois consécutifs | Force Tranquille | Le Phare |
| Diamant | 1 an sans interruption | Éternel | Le Titan des Bassins |

### Famille FEEDBACK — Les Communicants 💬

Valorise les nageurs qui jouent le jeu du feedback, élément central de SwimLab.

| Tier | Seuil | Badge | Titre débloqué |
|------|-------|-------|----------------|
| Bronze | 10 feedbacks donnés | Première Voix | Le Reporter |
| Argent | 50 feedbacks | Voix du Bassin | L'Analyste |
| Or | 200 feedbacks | Oracle des Lignes | Le Sage |
| Diamant | 500 feedbacks dont 80% avec commentaire écrit | Légende Vocale | La Conscience du Club |

Le tier Diamant exige la qualité (commentaires écrits) en plus de la quantité, ce qui pousse à donner du feedback utile au coach.

### Famille INTENSITÉ — Les Guerriers 🔥

Récompense ceux qui repoussent leurs limites (RPE élevé de manière régulière).

| Tier | Seuil | Badge | Titre débloqué |
|------|-------|-------|----------------|
| Bronze | 5 entraînements avec RPE ≥ 16 | Premières Flammes | Le Courageux |
| Argent | 20 entraînements avec RPE ≥ 16 | Cœur en Feu | Le Forgé |
| Or | 50 entraînements avec RPE ≥ 17 | Limite Repoussée | La Machine |
| Diamant | 100 entraînements avec RPE ≥ 17 + jamais arrêté la semaine suivante | Indestructible | Le Berserker |

Le Diamant vérifie que le nageur revient après l'effort — pas juste qu'il se consume.

### Badges Secrets ✨

Le nageur ne sait pas qu'ils existent jusqu'au moment du déblocage. Notification surprise, effet "wow". Ils apparaissent comme "???" dans la collection tant qu'ils ne sont pas trouvés.

- **Le Fantôme** — Être émargé en premier à un entraînement 10 fois. Titre : L'Ombre du Bassin.
- **Le Phénix** — Revenir après 3+ semaines d'absence et compléter 4 entraînements d'affilée. Titre : Ressuscité.
- **L'Empathique** — Donner un commentaire de feedback à chaque entraînement pendant 1 mois complet. Titre : Le Cœur du Groupe.
- **Le Caméléon** — Avoir nagé au moins 5 km dans chacune des 4 nages (crawl, dos, brasse, papillon). Titre : Maître des Éléments.
- **Le Noctambule** — Compléter 20 entraînements qui commencent après 20h. Titre : Le Requin de Minuit.
- **L'Équilibriste** — Donner exactement RPE 13 cinq fois de suite. Titre : L'Équilibriste. (Quasi du hasard, côté fun.)
- **Le Survivant** — Compléter un entraînement avec RPE 20 puis donner un feedback avec commentaire. Titre : Toujours Debout.

---

## Surnoms & Titres

### Obtention

Chaque badge débloqué donne accès à un titre. Le nageur choisit lequel afficher parmi tous ses titres débloqués. Le titre apparaît sous le nom sur le profil : "Sophie Dupont — La Machine".

Sources de titres :
- **Badges classiques** : un titre par badge débloqué.
- **Badges secrets** : titres exclusifs et rares.
- **Titres automatiques** (bonus) : détectés via les patterns du nageur. Beaucoup de sprint → "L'Éclair". Beaucoup d'endurance → "Le Diesel". Beaucoup de papillon → "Le Papillon de Nuit". Générés automatiquement selon le profil d'entraînement.
- **Titres attribués par le coach** (V1.5) : le coach pourrait donner un surnom personnalisé à un nageur, renforçant le lien coach-nageur.

### Affichage

Le titre actif est visible partout où le nom du nageur apparaît : profil, leaderboards, mur des défis, liste des feedbacks côté coach.

---

## Système XP & Niveau

### Principe

Chaque action dans l'app rapporte des points d'expérience. L'XP cumulée détermine un niveau global (1 à 99) affiché sur le profil. C'est purement cosmétique mais donne un sentiment de progression constant entre deux badges.

### Sources d'XP

- **Entraînement complété** (marqué présent) : +20 XP
- **Feedback donné** : +10 XP (bonus +5 si commentaire écrit)
- **Badge débloqué** : Bronze +50, Argent +100, Or +250, Diamant +500
- **Badge secret débloqué** : +300 XP
- **Défi mensuel complété** : +100 XP
- **Bonus streak** : +5 XP par semaine consécutive de présence (cumulatif)

### Paliers de niveau

Les seuils s'espacent progressivement. Premiers niveaux rapides (encouragement), hauts niveaux plus longs (prestige). Formule indicative : XP nécessaire pour le niveau N = N × 150 + (N² × 5).

### Affichage

Barre de progression XP visible sur le profil avec le niveau actuel et le prochain. Pastille de niveau sur l'avatar. XP total affiché dans le header de l'app.

---

## Défis

### Défis Permanents

Toujours actifs, progression long terme. Ce sont les jalons des familles de badges. Le nageur voit sa progression vers le prochain tier dans chaque famille. Exemples : atteindre 1 000 km nagés, maintenir 6 mois de présence consécutive, donner 200 feedbacks.

### Défis Mensuels Communautaires

Limités dans le temps, visibles par tout le club. Créent de l'émulation et de la compétition saine. Le mur des défis montre la progression de chacun.

**Marathon Collectif** — Le club entier doit atteindre X km cumulés ce mois. Chaque nageur contribue au total commun. Badge spécial si le club réussit. Crée de la solidarité.

**Roi/Reine du Mois** — Le nageur avec le plus de distance ce mois gagne un badge temporaire doré affiché sur son profil pendant 30 jours.

**Le Mois du [Nage]** — Chaque mois une nage est mise à l'honneur. Objectif personnel : nager X km dans cette nage. Janvier = crawl, Février = dos, Mars = brasse, Avril = papillon, etc.

**Streak Challenge** — Qui peut maintenir la plus longue série de présences consécutives ce mois ? Leaderboard live classant tous les nageurs du club.

**Feedback Champion** — Le nageur avec le taux de feedback le plus élevé + le plus de commentaires écrits ce mois. Valorise la communication, pas juste la performance physique.

### Défis Coach (Nice-to-have, V1.5)

Le coach pourra créer ses propres défis pour son club ou un groupe spécifique. Exemples : "Objectif 100% de présence cette semaine", "Tout le groupe sous RPE 14 de moyenne". Interface de création simple avec titre, description, métrique cible, et durée.

---

## Profil Social — La Vitrine

### Carte de profil

Visible par tous les membres du club. Contient :
- Nom + titre actif (choisi par le nageur)
- Niveau global + barre XP
- 3 badges épinglés (choisis par le nageur parmi sa collection, mis en avant avec effet glow)
- Statistiques clés : distance totale, assiduité (%), RPE moyen, nombre de feedbacks
- Club et groupe(s)

### Collection de badges

Page dédiée accessible depuis le profil. Tous les badges organisés par famille, avec les tiers visibles. Les badges non débloqués apparaissent grisés (ou "???" pour les secrets). Progression affichée pour chaque badge en cours.

### Mur des défis

Écran commun au club montrant :
- Les défis mensuels actifs avec compte à rebours
- La progression de chaque nageur (barres, leaderboards)
- Les défis permanents du nageur connecté avec sa progression personnelle
- Sous-onglets : "Ce Mois" / "Permanents"

### Partage externe

Quand un badge est débloqué, le nageur peut générer un visuel au format story (1080×1920) aux couleurs SwimLab, partageable sur Instagram, WhatsApp, etc. Le visuel contient le badge en grand, les stats clés, et le branding SwimLab. C'est du marketing organique gratuit.

---

## Schéma Base de Données

4 nouvelles tables pour V1 :

**achievements** — Catalogue de tous les badges possibles. Champs : id, family (distance/assiduité/feedback/intensité/secret), tier (bronze/silver/gold/diamond), name, description, icon, unlocked_title, threshold_value, threshold_metric, conditions (JSONB pour les règles complexes comme le Diamant Intensité), is_secret (boolean), xp_reward.

**user_achievements** — Badges débloqués par chaque nageur. Champs : id, user_id, achievement_id, unlocked_at, is_pinned (max 3), is_active_title.

**challenges** — Défis mensuels actifs. Champs : id, club_id, title, description, type (collectif/individuel/compétitif), icon, target_value, target_metric, start_date, end_date, created_by (system ou coach_id pour V1.5).

**challenge_progress** — Progression de chaque nageur sur chaque défi. Champs : id, user_id, challenge_id, current_value, completed_at, rank.

Le champ XP total et level sont stockés directement dans la table **profiles** existante (ajout de colonnes total_xp INTEGER et level INTEGER).

### Moteur de vérification

Supabase Edge Function déclenchée à chaque insertion/update dans workout_sessions. La fonction :
1. Recalcule les trackers du nageur (distance totale, streak, etc.)
2. Compare aux seuils de chaque achievement non débloqué
3. Insère dans user_achievements si seuil franchi
4. Met à jour total_xp et level dans profiles
5. Met à jour challenge_progress si défi mensuel actif

---

## Identité Visuelle des Badges

### Couleurs par tier
- Bronze : #CD7F32 (cuivré chaud)
- Argent : #C0C0C0 (gris lumineux)
- Or : #FFD700 (doré vif)
- Diamant : #B9F2FF (bleu glacé lumineux)

### Couleurs par famille
- Distance : turquoise #00D4D4
- Assiduité : vert #22C55E
- Feedback : jaune #FFB800
- Intensité : rose #FF3B8F
- Secret : violet #8B5CF6

### Forme

Chaque badge est un cercle avec :
- L'icône emoji au centre (grande, lisible)
- Un fond radial gradient utilisant la couleur du tier
- Une bordure de la couleur du tier (plus épaisse pour les tiers élevés)
- Un petit indicateur de tier en bas à droite (●, ◆, ★, 💎)
- Un effet glow (box-shadow) pour les badges débloqués et épinglés

Les badges verrouillés sont grisés (grayscale + opacité réduite) avec un 🔒 au centre.

---

## Résumé des Priorités d'Implémentation

**Phase 1 — Fondations** : Tables BDD, moteur de vérification Edge Function, badges des 4 familles classiques (16 badges), système XP + level dans profiles.

**Phase 2 — Social** : Profil social avec titre + badges épinglés + stats, collection de badges avec filtres par famille, partage externe (génération d'image).

**Phase 3 — Défis** : Défis mensuels (3 types : collectif, individuel, compétitif), mur des défis avec leaderboards et progression, défis permanents avec suivi.

**Phase 4 — Enrichissement** : Badges secrets (7 badges), badges par nage (4 badges), titres automatiques basés sur les patterns, défis coach (V1.5).

---

**Version** : 1.0
**Date** : 9 Mars 2026
**Statut** : Validé — Brainstorm complet, prêt pour implémentation V1
