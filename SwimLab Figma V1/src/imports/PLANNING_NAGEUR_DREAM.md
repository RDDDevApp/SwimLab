# 📅 Planning Nageur de Rêve — Spécification

## Objectif

Transformer le planning du nageur d'un simple calendrier en un **hub central motivationnel**. Chaque ouverture de l'app raconte une histoire : les séances passées brillent de leurs feedbacks, la séance d'aujourd'hui appelle avec un countdown live, les séances futures teasent ce qui attend, et entre tout ça, les badges, streaks et défis rappellent que chaque mètre nagé compte.

Le planning intègre trois dimensions : le **temps** (quand), l'**action** (quoi faire), et la **motivation** (pourquoi y aller).

**Version cible** : V0.5 (structure de base) → V1 (gamification intégrée) → V2 (social intégré)

---

## Architecture — Les 5 Couches

### Couche 1 — Le Header Vivant

Le header n'est pas statique. Il respire avec l'activité du nageur.

**Contenu du header étendu** (au repos, scroll en haut) :
- Avatar du nageur avec bordure turquoise et badge niveau
- Prénom + salutation contextuelle ("Hey Sophie 👋")
- Titre actif en jaune ("⚡ La Machine")
- Badge streak pulsant (ex: "12 🔥") avec animation pulse continue
- Icône notifications avec pastille si non lues
- Barre XP mini entre le niveau actuel et le prochain (gradient turquoise→jaune)
- Toggle Semaine / Mois
- Navigation semaine (flèches + bouton "Auj.")

**Contenu du header compact** (quand le nageur scrolle) :
- Avatar réduit
- Prénom seul (sans salutation ni titre)
- Badge streak toujours visible
- Notifications toujours visible
- Barre XP masquée
- Toggle + navigation toujours visibles

La transition entre étendu et compact est fluide (300ms ease). Le header compact libère de l'espace pour le contenu tout en gardant les informations essentielles.

**Comportement contextuel** : Si un entraînement est prévu dans moins d'une heure, le header pourrait passer en mode "countdown" avec une teinte turquoise plus prononcée pour signaler l'urgence.

---

### Couche 2 — La Vue Semaine Immersive

Chaque jour de la semaine est représenté par un badge date + une zone de contenu.

**Badge date** : Carré arrondi (38×38px, borderRadius 10) affichant le jour abrégé (Lun, Mar...) en petit et le numéro en gros. Le jour actuel est en fond turquoise plein avec glow (box-shadow turquoise à 30% opacité) et le texte en couleur sombre. Les autres jours ont un fond transparent avec bordure subtile.

**Séparateur** : Une ligne horizontale fine (1px, très faible opacité) relie le badge date au bord droit, créant une timeline visuelle verticale.

**Jours sans entraînement** : Affichent "Repos 😴" dans un cadre en pointillés subtils. Pas de vide — chaque jour a une présence visuelle.

**Navigation entre semaines** : Flèches gauche/droite + bouton central qui affiche "Auj." si on est sur la semaine courante, ou le label de la semaine sinon ("Sem. dernière", "Sem. prochaine", "Sem. du 17"). Le bouton "Auj." est teinté turquoise pour inciter à revenir à la semaine courante.

**Animation d'entrée** : Les cards apparaissent avec un stagger (décalage de 60ms par jour) en fadeUp — chaque jour glisse vers le haut depuis une position décalée de 12px. Ça donne un effet de cascade fluide à chaque changement de semaine.

---

### Couche 3 — Les Cards d'Entraînement Enrichies

Chaque créneau d'entraînement est représenté par une card avec 5 états visuels distincts.

#### État 1 — Aujourd'hui (state: "today")

La card la plus impactante. Bordure turquoise pleine avec glow subtil (box-shadow 24px). En haut, la barre d'accent de 3px en gradient du type d'entraînement.

Contenu : icône type dans un carré arrondi (fond dim de la couleur du type), titre "Endurance — 3200m", horaire + durée + groupe, lieu + coach.

**Countdown live** : Bloc spécial en fond turquoise dim avec bordure turquoise. Affiche un décompte en temps réel au format HH:MM:SS en police monospace (JetBrains Mono), accompagné d'un point pulsant turquoise et du texte "avant ta séance". Le countdown tourne seconde par seconde.

#### État 2 — Futur (state: "future")

Card sobre. Bordure très subtile (white 10%). Icône 🔒 en faible opacité dans le coin.

Le contenu principal (type, distance, horaire, lieu) est visible mais les détails de l'entraînement restent masqués (principe du verrouillage avant émargement).

**Teaser motivationnel** : Un texte court en italique, faible opacité, qui varie selon le type d'entraînement :
- Sprint : "Prête à exploser tes chronos ?"
- Technique : "Éducatifs et finesse au programme"
- Récup : "Ton corps va te remercier"
- Endurance : "Chaque mètre compte vers tes objectifs"

#### État 3 — Feedback donné (state: "feedback_done")

Card avec bordure verte atténuée. Badge ✅ dans le coin.

Affiche un tag RPE coloré selon la valeur : vert (RPE ≤ 12), jaune (RPE 13-15), rose (RPE ≥ 16). Le tag est compact (ex: "💪 RPE 14") avec fond de la couleur correspondante en dim.

**Intégration sociale** : À côté du RPE, si le post automatique généré dans le feed a reçu des réactions, elles sont affichées (ex: "💦🔥 8 réactions"). Ça crée un pont entre le planning et le feed social.

**Détail expandable** : Au clic, la card s'étend pour montrer le commentaire de feedback en italique dans un bloc teinté.

#### État 4 — Feedback en attente (state: "feedback_pending")

Card avec bordure jaune prononcée. Pas de badge dans le coin — à la place, un CTA pulsant.

**CTA "Donne ton feedback"** : Bloc en fond jaune dim avec bordure jaune, contenant un point pulsant jaune, le texte "Donne ton feedback" en gras jaune, et une flèche "→". L'ensemble pulse doucement (animation softPulse 3s) pour attirer l'attention sans être agressif.

#### État 5 — Absent (state: "absent")

Card quasi invisible. Opacité réduite à 40%. Fond à peine perceptible. Barre d'accent grise. Tous les textes en gris très faible. Texte "Absente" en bas. Pas de CTA, pas d'interaction.

#### Éléments communs à toutes les cards

**Barre d'accent** : 3px en haut de chaque card, en gradient de la couleur du type d'entraînement (turquoise pour endurance, jaune pour sprint, violet pour technique, vert pour récup, corail pour autre). Grise pour les absents.

**Bloc type** : Carré arrondi (38×38) avec emoji du type (🏊, ⚡, 🎯, 🧘, 🌊) sur fond dim de la couleur du type.

**Infos de base** : Toujours visibles — type + distance en gras, horaire + durée + groupe en gris, lieu + coach en gris avec icônes 📍 et 👤.

---

### Couche 4 — Les Widgets de Motivation

Intercalés entre les jours dans la vue semaine (pas entre chaque jour — environ un widget tous les deux jours pour ne pas surcharger). Trois types qui alternent.

#### Widget Badge Prochain 🐬

Fond gradient turquoise dim. Affiche l'émoji du prochain badge, le texte "Plus que X.X km pour [Nom du badge]", et une barre de progression fine. Pousse le nageur à voir chaque séance comme un pas vers le prochain accomplissement.

#### Widget Streak 🔥

Fond gradient jaune dim. Affiche le streak actuel en gras jaune et le rang dans le club ("12 semaines de streak — tu es 2ème du club"). Crée de la compétition saine et valorise la régularité.

#### Widget Défi Mensuel 🦋

Fond gradient de la couleur du défi. Affiche le nom du défi, la progression actuelle/cible, et une barre de progression. Rappelle le défi en cours sans que le nageur ait besoin d'aller dans l'onglet Défis.

#### Placement

En vue semaine, un widget apparaît après le premier jour avec entraînement, puis environ tous les deux jours (jours pairs). Maximum 3 widgets par semaine. L'ordre alterne : badge → streak → défi.

En vue mois, les widgets apparaissent sous les stats mensuelles (2 widgets max).

---

### Couche 5 — La Vue Mois

Toggle accessible depuis le header. Affiche le mois en cours en grille 7 colonnes (Lun→Dim).

**Grille calendaire** : Chaque cellule est un carré (aspect-ratio 1:1, borderRadius 10). Le jour actuel est en fond turquoise plein avec glow. Les cellules avec entraînement passé ont un fond très subtil et une bordure légèrement plus visible.

**Dots colorés** : En bas de chaque cellule, des petits points (5px) de la couleur du type d'entraînement. Si plusieurs entraînements le même jour, plusieurs dots. Les couleurs des dots changent selon l'état :
- Futur : couleur du type à 50% opacité
- Passé avec feedback : vert
- Passé sans feedback : jaune
- Absent : gris très faible

**Check de feedback** : Un petit "✓" vert dans le coin supérieur droit des jours passés où le feedback a été donné.

**Légende** : Sous la grille, une légende horizontale avec les dots de couleur et leur signification (Endurance, Sprint, Technique, Récup, Feedback ✓, En attente).

**Stats mensuelles** : Trois cards compactes en grille 3 colonnes sous la légende :
- Séances : "12/16" en turquoise (complétées / prévues)
- Distance : "38.4 km" en jaune
- Assiduité : "92%" en vert

**Widgets de motivation** : Sous les stats, les widgets défi mensuel et badge prochain s'affichent.

---

## Micro-Interactions & Animations

### Transitions entre vues

Le switch Semaine↔Mois est instantané (pas de transition lourde). Le contenu change avec un fade rapide (150ms).

### Navigation semaine

Le changement de semaine déclenche un fadeUp staggeré (chaque jour apparaît avec 60ms de décalage). Donne un effet de cascade fluide.

### Scroll du header

La compaction du header est progressive (transition 300ms ease sur padding, taille de l'avatar, et opacité des éléments masqués). Le header compact se déclenche quand le scroll dépasse 50px.

### Pulse du streak

Le badge streak dans le header a une animation pulse continue (2.5s) — un cercle qui s'étend et disparaît derrière le point. Subtil mais vivant.

### Pulse du CTA feedback

Le bloc "Donne ton feedback" pulse doucement (3s ease-in-out) en alternant entre opacité 1 et 0.7. Pas agressif, juste un rappel visuel.

### Countdown live

Le décompte tourne seconde par seconde en police monospace pour l'effet "timer de mission". Le point pulsant à côté pulse plus vite (1.5s) que le streak pour signaler l'urgence.

### Expansion des cards

Au clic sur une card feedback_done, le commentaire apparaît en slideDown (200ms). Recliquer masque le commentaire.

---

## Intégration avec les Autres Modules

### Gamification (GAMIFICATION_V1.md)

- La barre XP dans le header reflète la progression en temps réel
- Le badge de niveau est affiché sur l'avatar
- Les widgets de motivation tirent les données du moteur de gamification (prochain badge, streak, défi en cours)
- Chaque card feedback_done contribue visuellement à l'avancement (le nageur voit l'impact)

### Feed Social (SOCIAL_FEED_V2.md)

- Les cards feedback_done affichent les réactions du post automatique généré dans le feed
- Cliquer sur les réactions pourrait ouvrir le post dans le feed (navigation croisée)
- Les teasers des cards futures rappellent que l'activité sera partagée ("Tes coéquipiers verront ta perf")

### Calendrier Coach (vue parallèle)

- Le planning nageur est la version personnelle du calendrier coach
- Les données viennent des mêmes tables (workout_assignments, training_slots, workout_sessions)
- L'émargement du coach déclenche le changement d'état des cards (future → feedback_pending ou absent)

---

## Design System Appliqué

### Couleurs des types d'entraînement
- Endurance : turquoise #00D4D4
- Sprint : jaune #FFB800
- Technique : violet #8B5CF6
- Récup : vert #22C55E
- Autre : corail #FF6B6B

### Couleurs des états
- Aujourd'hui : bordure turquoise + glow
- Futur : bordure white 10%
- Feedback donné : bordure verte 40%
- Feedback en attente : bordure jaune 50%
- Absent : bordure white 5%, opacité 40%

### Couleurs RPE
- RPE ≤ 12 : vert #22C55E (facile)
- RPE 13-15 : jaune #FFB800 (modéré)
- RPE ≥ 16 : rose #FF3B8F (intense)

### Typographie
- Titres : DM Sans 900 (black)
- Corps : DM Sans 500-700
- Countdown : JetBrains Mono 800 (monospace pour l'effet timer)
- Teasers : DM Sans 400 italic

### Fonds
- Background app : #050D17
- Cards : #0E1E38
- Surface (header, éléments élevés) : #162D50
- Widgets motivation : gradient dim de la couleur de famille vers transparent

---

## Données Requises (API)

Pour alimenter la vue semaine, la requête principale récupère :

**workout_assignments** filtrés par les groupes du nageur, avec jointures sur workouts (type, distance, contenu), training_slots (horaire, lieu, groupe, coach), et workout_sessions (attended, rpe_score, feedback_text, completed_at).

**Données de gamification** : streak actuel (calculé depuis les présences consécutives), prochain badge (comparaison trackers vs seuils), défi mensuel en cours (challenge_progress), niveau + XP (depuis profiles).

**Données sociales** : nombre de réactions sur le feed_post associé à chaque workout_session (jointure feed_posts → feed_reactions COUNT).

Le tout est récupérable en une ou deux requêtes Supabase avec les jointures appropriées. Le calcul du streak et du prochain badge peut être fait côté client ou via une Edge Function pré-calculée.

---

## Priorités d'Implémentation

**V0.5 — Structure de base** : Vue semaine avec les 5 états de cards (sans gamification ni social), navigation entre semaines, header avec toggle semaine/mois, vue mois avec dots colorés et stats.

**V1 — Gamification intégrée** : Header vivant (streak pulsant, barre XP, niveau), widgets de motivation intercalés, tags RPE colorés, teasers motivationnels sur les cards futures, countdown live.

**V2 — Social intégré** : Réactions du feed affichées sur les cards, liens croisés planning↔feed, stats sociales dans la vue mois.

---

**Version** : 1.0
**Date** : 10 Mars 2026
**Statut** : Vision complète, prêt pour implémentation progressive
