# 📱 Product Specification - V0 (MVP)

## 🎯 Objectif V0

**Valider le concept** avec un club pilote en créant le flow minimal coach-nageur.

**Critère de succès** :
- 1 club pilote utilise l'app pendant 4 semaines
- 10+ entraînements créés et planifiés
- 50+ feedbacks collectés
- Taux de feedback > 60%

---

## 👥 Personas V0

### Coach Thomas (35 ans)
- Entraîne 2 groupes (Compétition 15 nageurs, Loisir 12 nageurs)
- 3 entraînements/semaine par groupe
- Veut gagner du temps sur la création d'entraînements
- Veut suivre l'assiduité et la fatigue de ses nageurs

### Nageuse Sophie (28 ans)
- Groupe Compétition
- 3-4 entraînements/semaine
- Veut savoir quand sont les entraînements
- Veut donner son ressenti au coach

---

## 🏗️ Architecture Hiérarchique

```
CLUB (ex: "Swim Club Paris")
 └─ COACH(s)
     └─ GROUPE(s) (ex: Compétition, Loisir)
         └─ NAGEUR(s)
```

**Règles** :
- Un club peut avoir plusieurs coachs
- Un coach peut avoir plusieurs groupes
- Un nageur peut être dans un seul groupe (V0) ou plusieurs (V0.5)
- Un coach crée des SLOTS (créneaux récurrents)
- Un coach crée des ENTRAÎNEMENTS et les assigne aux slots

---

## 📊 User Stories V0

### 1. Authentification & Setup Club

**US-001 : Inscription Coach**
```
EN TANT QUE Coach
JE VEUX créer un compte
POUR gérer mon club
```

**Critères d'acceptance** :
- Formulaire Register avec : email, password, nom, prénom
- Sélection rôle "Coach"
- Validation email (format valide)
- Redirect vers création de club après inscription

---

**US-002 : Création Club**
```
EN TANT QUE Coach
JE VEUX créer mon club
POUR y inviter mes nageurs
```

**Critères d'acceptance** :
- Formulaire : Nom du club (requis), Description (optionnel)
- Génération automatique code invitation unique (8 caractères)
- Affichage du code avec possibilité de copier
- Message : "Partagez ce code à vos nageurs"

---

**US-003 : Inscription Nageur**
```
EN TANT QUE Nageur
JE VEUX rejoindre un club avec un code
POUR accéder aux entraînements
```

**Critères d'acceptance** :
- Formulaire Register avec : email, password, nom, prénom
- Sélection rôle "Nageur"
- Champ "Code invitation club" (requis)
- Validation du code (erreur si invalide)
- Ajout automatique au club après validation
- Redirect vers dashboard nageur (vide tant que pas dans un groupe)

---

### 2. Gestion Groupes

**US-004 : Création Groupe**
```
EN TANT QUE Coach
JE VEUX créer des groupes d'entraînement
POUR organiser mes nageurs
```

**Critères d'acceptance** :
- Formulaire : Nom groupe (requis), Description (optionnel), Niveau (Débutant/Intermédiaire/Avancé/Compétition)
- Liste des groupes créés visible dans dashboard coach
- Possibilité de modifier/supprimer un groupe

---

**US-005 : Ajout Nageurs à Groupe**
```
EN TANT QUE Coach
JE VEUX ajouter des nageurs à un groupe
POUR les organiser
```

**Critères d'acceptance** :
- Vue détail groupe → Bouton "Ajouter nageurs"
- Liste des nageurs du club (pas encore dans ce groupe)
- Sélection multiple (checkboxes)
- Validation → Nageurs ajoutés au groupe
- Confirmation visuelle

---

### 3. Créneaux Récurrents (SLOTS)

**US-006 : Création Créneau**
```
EN TANT QUE Coach
JE VEUX créer des créneaux d'entraînement récurrents
POUR planifier ma saison
```

**Critères d'acceptance** :
- Formulaire slot :
  - Nom (ex: "Entraînement Compétition")
  - Groupe associé (dropdown)
  - Jour de la semaine (Lundi à Dimanche)
  - Heure début (ex: 18:00)
  - Durée (en minutes, ex: 90)
  - Lieu (ex: "Piscine Municipale")
  - Récurrent : Oui (toutes les semaines) - coché par défaut
- Slot créé apparaît dans calendrier coach (vide)
- Badge "Slot vide" visible

**Règles métier** :
- Un slot est toujours récurrent (chaque semaine même jour/heure)
- Un slot est lié à UN seul groupe
- Un slot peut avoir 0 ou 1 entraînement assigné

---

**US-007 : Modification/Suppression Créneau**
```
EN TANT QUE Coach
JE VEUX modifier ou supprimer un créneau
POUR ajuster mon planning
```

**Critères d'acceptance** :
- Clic sur slot → Modal avec détails
- Bouton "Modifier" → Formulaire pré-rempli
- Bouton "Supprimer" → Confirmation si entraînements assignés
- Si suppression : tous les entraînements futurs assignés à ce slot sont désassignés

---

### 4. Création Entraînement

**US-008 : Créer Entraînement Structuré**
```
EN TANT QUE Coach
JE VEUX créer un entraînement structuré
POUR le donner à mes nageurs
```

**Critères d'acceptance** :

**Formulaire général** :
- Titre (requis, ex: "Endurance 3000m")
- Type (requis) : Endurance / Sprint / Technique / Récupération / Autre
- Description (optionnel, textarea)

**Éditeur de blocks hiérarchiques** :
- Bouton "+ Ajouter un block"
- Structure :
  - **BLOCK** (ex: Échauffement, Série Principale, Retour Calme)
    - Nom block (requis)
    - Type block (dropdown: warmup, main, cooldown, drill, sprint, endurance, autre)
    - Bouton "+ Ajouter sub-block"
    - **SUB-BLOCK** (ex: 4x150m, 10x200m)
      - Titre (requis, ex: "10x200m")
      - Séries (nombre, ex: 10)
      - Distance unitaire (ex: 200)
      - Départ (optionnel, ex: "@ 3'30" ou "départ 30s")
      - Notes (optionnel)
      - Bouton "+ Ajouter exercice"
      - **SUB-SUB-BLOCK / Exercice** (ex: 200m Crawl Modéré)
        - Distance (requis, en mètres)
        - Nage (requis, dropdown: Crawl, Dos, Brasse, Papillon, 4Nages, Choix, Éducatifs, Jambes, Bras, Palmes, Pull-Buoy, Plaquettes)
        - Intensité (requis, dropdown: Récupération, Facile, Modéré, Soutenu, Intense, Sprint)
        - Temps objectif (optionnel, ex: "1'30")
        - Notes (optionnel)

**Fonctionnalités** :
- Calcul automatique distance totale (somme de tous les exercices)
- Réorganisation blocks par drag & drop (V0.5)
- Dupliquer un block/sub-block/exercice
- Supprimer un élément (avec confirmation)
- Prévisualisation en temps réel

**Actions** :
- "Sauvegarder brouillon" → État brouillon, pas visible par nageurs
- "Publier" → Entraînement disponible pour assignation

**Règles métier** :
- Minimum 1 block pour publier
- Minimum 1 exercice par sub-block
- Distance totale calculée = somme distances de tous les exercices

---

**US-009 : Assigner Entraînement à Slot**
```
EN TANT QUE Coach
JE VEUX assigner un entraînement à un créneau
POUR le planifier
```

**Critères d'acceptance** :
- Méthode 1 : Depuis calendrier
  - Clic sur slot vide → Modal "Assigner un entraînement"
  - Liste entraînements publiés (filtre par type optionnel)
  - Bouton "Créer nouvel entraînement" aussi disponible
  - Sélection entraînement → Assignation
- Méthode 2 : Depuis entraînement
  - Page détail entraînement → Bouton "Planifier"
  - Sélection semaine puis slot
  - Assignation
- Après assignation :
  - Slot passe de "vide" à "rempli"
  - Badge type entraînement visible
  - Nageurs du groupe voient l'entraînement dans leur calendrier (masqué)

**Règles métier** :
- Un entraînement peut être assigné à plusieurs slots (réutilisable)
- Un slot ne peut avoir qu'un seul entraînement à la fois
- Assigner un nouvel entraînement à un slot déjà rempli = remplacement (avec confirmation)

---

**US-010 : Dupliquer Entraînement**
```
EN TANT QUE Coach
JE VEUX dupliquer un entraînement
POUR gagner du temps
```

**Critères d'acceptance** :
- Bouton "Dupliquer" sur page détail entraînement
- Copie exacte de la structure (titre avec "(copie)")
- État brouillon par défaut
- Redirection vers formulaire édition
- Possibilité de modifier avant publication

---

### 5. Calendrier Coach

**US-011 : Vue Calendrier Coach**
```
EN TANT QUE Coach
JE VEUX voir mon calendrier d'entraînements
POUR avoir une vue d'ensemble
```

**Critères d'acceptance** :
- Vue semaine par défaut
- Navigation : semaine précédente / suivante
- Bouton "Aujourd'hui" pour revenir à la semaine courante
- Affichage par jour :
  - Tous les slots du jour (même si vides)
  - Pour chaque slot :
    - Heure (ex: 18h - 19h30)
    - Nom slot + Groupe
    - Lieu
    - Si entraînement assigné :
      - Badge type (couleur selon type)
      - Titre entraînement
      - Distance totale
      - Si entraînement passé : Stats feedbacks (ex: "12/15 feedbacks")
    - Si slot vide :
      - Badge "Slot vide"
      - Bouton "+ Créer entraînement"
- Clic sur entraînement → Détail entraînement
- Clic sur slot vide → Modal assignation

**Vue mois** (V0.5) :
- Vue calendrier mensuel
- Pastilles/dots pour indiquer entraînements
- Clic sur jour → Vue jour

---

### 6. Calendrier Nageur

**US-012 : Vue Calendrier Nageur**
```
EN TANT QUE Nageur
JE VEUX voir mes prochains entraînements
POUR m'organiser
```

**Critères d'acceptance** :
- Vue liste des 7-14 prochains jours
- Pour chaque entraînement futur :
  - Date + Heure
  - Lieu
  - Groupe
  - Type entraînement (badge couleur)
  - Icône 🔒 "Détails disponibles après"
  - Badge "À venir"
- Pour chaque entraînement passé :
  - Date + Heure (grisé)
  - Type entraînement
  - Si feedback donné : Badge "Feedback donné ✅" + RPE affiché
  - Si feedback non donné (mais présent) : Badge "Donner feedback" (orange)
  - Si absent : Badge "Absent" (gris)
  - Bouton "Voir détail" (déverrouillé après émargement)

**Règles métier** :
- Le nageur ne voit QUE les entraînements des groupes auxquels il appartient
- Les détails de l'entraînement sont masqués jusqu'à émargement
- Après émargement (présent), détails visibles même sans feedback donné

---

**US-013 : Voir Détail Entraînement Passé**
```
EN TANT QUE Nageur
JE VEUX voir le détail d'un entraînement passé
POUR savoir ce que j'ai fait
```

**Critères d'acceptance** :
- Clic sur entraînement déverrouillé
- Affichage complet :
  - Titre, type, description
  - Structure hiérarchique (blocks > sub-blocks > exercices)
  - Distance totale
  - Mon feedback si donné (RPE, commentaire)
  - Possibilité de modifier feedback si < 24h (V0.5)

---

### 7. Émargement & Feedback

**US-014 : Émargement Coach**
```
EN TANT QUE Coach
JE VEUX émarger les présents
POUR savoir qui était là
```

**Critères d'acceptance** :
- Déclenchement :
  - Automatique : Bouton "Émarger" apparaît 30 min avant l'entraînement
  - Manuel : Coach peut émarger à tout moment après l'heure de début
- Modal/Page émargement :
  - Liste tous les nageurs du groupe
  - Checkboxes : ☑ Présent / ☐ Absent
  - Tous cochés par défaut (optimiste)
  - Possibilité de tout décocher / tout cocher
  - Compteur : "X/Y nageurs présents"
- Bouton "Valider émargement"
- Après validation :
  - Émargement enregistré
  - Notifications envoyées aux présents : "Donne ton feedback sur l'entraînement"
  - Badge "Émargé" sur l'entraînement
  - Possibilité de modifier l'émargement dans les 24h

**Règles métier** :
- Un seul émargement par entraînement
- Seuls les nageurs marqués présents reçoivent demande feedback
- Les absents voient l'entraînement marqué "Absent" dans leur calendrier

---

**US-015 : Donner Feedback Nageur**
```
EN TANT QUE Nageur
JE VEUX donner mon feedback
POUR communiquer avec mon coach
```

**Critères d'acceptance** :
- Déclenchement :
  - Notification après émargement
  - Badge "Donner feedback" dans calendrier
  - Clic → Formulaire feedback
- Formulaire :
  - **RPE (Rating of Perceived Exertion)** :
    - Slider de 6 à 20 (échelle Borg)
    - Labels :
      - 6-8 : Très Très Facile
      - 9-10 : Très Facile
      - 11-12 : Facile
      - 13-14 : Un Peu Dur
      - 15-16 : Dur
      - 17-18 : Très Dur
      - 19-20 : Très Très Dur (Maximal)
    - Valeur affichée en gros
    - Couleur change selon intensité (vert → orange → rouge)
  - **Commentaire** (optionnel) :
    - Textarea
    - Placeholder : "Comment s'est passé l'entraînement ?"
    - Max 500 caractères
- Bouton "Envoyer mon feedback"
- Après envoi :
  - Feedback enregistré
  - Badge passe à "Feedback donné ✅"
  - Message de confirmation : "Merci ! Ton coach a reçu ton feedback"
  - Détails entraînement déverrouillés

**Règles métier** :
- Feedback possible uniquement si marqué présent
- Un feedback par entraînement
- Modification possible < 24h (V0.5)
- Sans feedback, détails entraînement visibles quand même (mais badge orange persistant)

---

**US-016 : Modifier Feedback** (V0.5)
```
EN TANT QUE Nageur
JE VEUX modifier mon feedback dans les 24h
POUR corriger si besoin
```

**Critères d'acceptance** :
- Bouton "Modifier feedback" visible si < 24h après envoi
- Formulaire pré-rempli avec valeurs actuelles
- Possibilité de modifier RPE et/ou commentaire
- Validation → Feedback mis à jour
- Pas de notification coach (il voit juste la version à jour)

---

### 8. Stats Coach

**US-017 : Voir Feedbacks d'un Entraînement**
```
EN TANT QUE Coach
JE VEUX voir les feedbacks d'un entraînement
POUR évaluer ma séance
```

**Critères d'acceptance** :
- Page détail entraînement (après émargement)
- Onglet "Feedbacks"
- **Section Stats Globales** :
  - Taux de présence : "X/Y (Z%)"
  - RPE moyen : "14.2/20" (avec jauge visuelle)
  - RPE min : "11/20"
  - RPE max : "17/20"
  - Nombre de commentaires : "X/Y"
  - Graphique distribution RPE (histogramme simple)
- **Section Feedbacks Individuels** :
  - Liste nageurs avec statut :
    - ✅ Présent + Feedback donné : RPE + Commentaire
    - ⏳ Présent + Feedback en attente : Badge "En attente"
    - ❌ Absent : Badge "Absent"
  - Si RPE > 17 : Badge "⚠️ RPE élevé" (alerte fatigue)
  - Tri par RPE décroissant (plus fatigués en haut)
  - Filtre : Tous / Avec commentaire / RPE élevé

**Règles métier** :
- Stats visibles uniquement après émargement
- Stats mises à jour en temps réel quand nageurs donnent feedback
- Calculs :
  - Taux présence = Présents / Total groupe
  - RPE moyen = Moyenne des RPE des présents ayant donné feedback
  - Si aucun feedback : "En attente des feedbacks"

---

## 🎨 Wireframes Textuels

### Écran Coach - Calendrier Semaine
```
╔════════════════════════════════════════╗
║  📅 Semaine 27 Jan - 2 Fév              ║
║  [< Précédent]  [Aujourd'hui]  [>]     ║
╠════════════════════════════════════════╣
║                                        ║
║  LUNDI 27 Janvier                      ║
║  ┌────────────────────────────────┐    ║
║  │ 18h - 19h30                    │    ║
║  │ 🏊 Entraînement Endurance       │    ║
║  │ 👥 Groupe Compétition          │    ║
║  │ 📍 Piscine Municipale          │    ║
║  │ 💧 3000m                        │    ║
║  │ ✅ Feedbacks : 12/15 (80%)      │    ║
║  └────────────────────────────────┘    ║
║                                        ║
║  MARDI 28 Janvier                      ║
║  ┌────────────────────────────────┐    ║
║  │ 19h - 20h                      │    ║
║  │ ⚡ Entraînement Sprint          │    ║
║  │ 👥 Groupe Loisir               │    ║
║  │ 📍 Piscine Municipale          │    ║
║  │ 💧 2500m                        │    ║
║  │ [+ Émarger]                    │    ║
║  └────────────────────────────────┘    ║
║                                        ║
║  MERCREDI 29 Janvier (AUJOURD'HUI)     ║
║  ┌────────────────────────────────┐    ║
║  │ 18h - 19h30                    │    ║
║  │ 📦 Slot vide                   │    ║
║  │ 👥 Groupe Compétition          │    ║
║  │ [+ Créer entraînement]         │    ║
║  └────────────────────────────────┘    ║
║                                        ║
╚════════════════════════════════════════╝
```

### Écran Nageur - Calendrier
```
╔════════════════════════════════════════╗
║  📅 Mes Entraînements                   ║
║  Cette semaine                         ║
╠════════════════════════════════════════╣
║                                        ║
║  ✅ LUN 27 - 18h                        ║
║  ┌────────────────────────────────┐    ║
║  │ 🏊 Entraînement Endurance       │    ║
║  │ 📍 Piscine Municipale          │    ║
║  │ 👥 Groupe Compétition          │    ║
║  │                                │    ║
║  │ ✅ Feedback donné (RPE: 14/20) │    ║
║  │ [Voir le détail]               │    ║
║  └────────────────────────────────┘    ║
║                                        ║
║  📅 MER 29 (AUJOURD'HUI) - 18h          ║
║  ┌────────────────────────────────┐    ║
║  │ 🏊 Entraînement Endurance       │    ║
║  │ 📍 Piscine Municipale          │    ║
║  │ 👥 Groupe Compétition          │    ║
║  │                                │    ║
║  │ 🔒 Détails disponibles après   │    ║
║  └────────────────────────────────┘    ║
║                                        ║
║  📅 VEN 31 - 18h                        ║
║  ┌────────────────────────────────┐    ║
║  │ ⚡ Entraînement Sprint          │    ║
║  │ 📍 Piscine Municipale          │    ║
║  │                                │    ║
║  │ 🔒 Détails disponibles après   │    ║
║  └────────────────────────────────┘    ║
║                                        ║
╚════════════════════════════════════════╝
```

### Écran Coach - Créer Entraînement
```
╔════════════════════════════════════════╗
║  Créer un Entraînement                 ║
╠════════════════════════════════════════╣
║  Titre: [Endurance 3000m_________]     ║
║  Type:  (•) Endurance  ( ) Sprint      ║
║         ( ) Technique  ( ) Récupération║
║  Description: [___________________]    ║
║                                        ║
║  ─── Structure ──────────────────────  ║
║                                        ║
║  📦 Échauffement                [✏️][🗑️]║
║     └─ 4x150m                          ║
║        └─ 100m Crawl Facile            ║
║        └─ 50m Dos Facile               ║
║                                        ║
║  📦 Série Principale            [✏️][🗑️]║
║     └─ 10x200m @ 3'30                  ║
║        └─ 200m Crawl Modéré            ║
║                                        ║
║  📦 Retour Calme                [✏️][🗑️]║
║     └─ 400m continu                    ║
║        └─ 200m Crawl Facile            ║
║        └─ 200m Brasse Facile           ║
║                                        ║
║  [+ Ajouter un block]                  ║
║                                        ║
║  💧 Distance totale: 3000m             ║
║                                        ║
║  [Sauvegarder brouillon]  [Publier]   ║
╚════════════════════════════════════════╝
```

### Écran Nageur - Donner Feedback
```
╔════════════════════════════════════════╗
║  Feedback - Lundi 18h                  ║
╠════════════════════════════════════════╣
║  Comment s'est passé l'entraînement ?  ║
║                                        ║
║  RPE (Effort ressenti) :               ║
║                                        ║
║  6  ●─────●─────●─────●─────●─────● 20 ║
║   Très     Facile      Dur      Max    ║
║   Facile                               ║
║                                        ║
║  ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░                 ║
║  14 / 20                               ║
║  💪 Un peu dur                         ║
║                                        ║
║  ────────────────────────────────────  ║
║                                        ║
║  Commentaire (optionnel):              ║
║  ┌──────────────────────────────────┐  ║
║  │ Bonne séance, un peu fatigué     │  ║
║  │ sur la fin mais ça va            │  ║
║  │                                  │  ║
║  └──────────────────────────────────┘  ║
║                                        ║
║  [Envoyer mon feedback]                ║
╚════════════════════════════════════════╝
```

### Écran Coach - Stats Entraînement
```
╔════════════════════════════════════════╗
║  Lundi 18h - Feedbacks                 ║
╠════════════════════════════════════════╣
║  📊 Statistiques Globales              ║
║  ┌──────────────────────────────────┐  ║
║  │ Présence: 12/15 (80%)            │  ║
║  │ RPE moyen: 14.2/20               │  ║
║  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░                │  ║
║  │ RPE min: 11  -  RPE max: 17      │  ║
║  │ Commentaires: 10/12              │  ║
║  └──────────────────────────────────┘  ║
║                                        ║
║  📋 Feedbacks Individuels              ║
║                                        ║
║  ✅ Bob Martin - RPE: 17/20            ║
║  ⚠️ RPE élevé                          ║
║  💬 "Très dur, pas en forme"           ║
║                                        ║
║  ✅ Alice Dupont - RPE: 13/20          ║
║  💬 "Super séance !"                   ║
║                                        ║
║  ✅ Claire Durand - RPE: 14/20         ║
║  💬 (Pas de commentaire)               ║
║                                        ║
║  ⏳ David Lefebvre                     ║
║  📝 Présent, feedback en attente       ║
║                                        ║
║  ❌ Emma Rousseau                      ║
║  🚫 Absente                            ║
║                                        ║
╚════════════════════════════════════════╝
```

---

## 🔄 Flows Principaux

### Flow 1 : Coach Crée et Planifie Entraînement
```
1. Coach ouvre calendrier
   ↓
2. Clic sur slot vide (ex: Mercredi 18h Compétition)
   ↓
3. Modal : "Créer ou assigner entraînement"
   → Clic "Créer nouvel entraînement"
   ↓
4. Formulaire entraînement
   - Titre: "Endurance 3000m"
   - Type: Endurance
   ↓
5. Éditeur blocks
   - Ajoute Échauffement 600m
   - Ajoute Série Principale 2000m
   - Ajoute Retour Calme 400m
   ↓
6. Clic "Publier"
   ↓
7. Entraînement sauvegardé
   ↓
8. Modal "Assigner au slot Mercredi 18h ?"
   → Oui
   ↓
9. Entraînement planifié
   ↓
10. Nageurs du groupe voient dans calendrier :
    "Mercredi 18h - Entraînement Endurance 🔒"
```

### Flow 2 : Nageur Donne Feedback
```
1. Mercredi 18h : Entraînement a lieu
   ↓
2. Mercredi 19h : Coach fait émargement
   - Coche Alice, Bob, Claire (présents)
   → Clic "Valider"
   ↓
3. Alice, Bob, Claire reçoivent notification :
   "Donne ton feedback sur l'entraînement Mercredi 18h"
   ↓
4. Alice ouvre l'app (20h, chez elle)
   ↓
5. Clic sur entraînement → Badge "Donner feedback"
   ↓
6. Formulaire feedback
   - RPE: Slider → 14/20
   - Commentaire: "Bonne séance"
   ↓
7. Clic "Envoyer"
   ↓
8. Feedback sauvegardé
   ↓
9. Badge passe à "Feedback donné ✅"
   ↓
10. Alice peut voir détail entraînement
```

---

## ✅ Critères de Validation V0

### Fonctionnels
- [ ] Coach peut créer un club et inviter nageurs
- [ ] Coach peut créer des groupes et y ajouter nageurs
- [ ] Coach peut créer des slots récurrents
- [ ] Coach peut créer un entraînement structuré (3 niveaux hiérarchiques)
- [ ] Coach peut assigner un entraînement à un slot
- [ ] Coach peut voir son calendrier semaine avec entraînements
- [ ] Nageur voit calendrier avec entraînements à venir (détails masqués)
- [ ] Coach peut émarger les présents après entraînement
- [ ] Nageur présent reçoit demande de feedback
- [ ] Nageur peut donner feedback (RPE + commentaire)
- [ ] Nageur peut voir détail entraînement passé après émargement
- [ ] Coach peut voir feedbacks + stats par entraînement

### Techniques
- [ ] App fonctionne sur web (desktop + mobile)
- [ ] Authentification sécurisée (Supabase Auth)
- [ ] Base de données avec RLS (Row Level Security)
- [ ] Temps de chargement < 3s
- [ ] Interface responsive (mobile-friendly)
- [ ] Pas de bugs bloquants

### Utilisateurs
- [ ] 1 club pilote actif pendant 4 semaines
- [ ] 1 coach créé 10+ entraînements
- [ ] 5-10 nageurs utilisent l'app
- [ ] 50+ feedbacks collectés
- [ ] Taux de feedback > 60%

---

## 🚫 Hors Scope V0

### V0.5 (Nice-to-have)
- Bibliothèque d'exercices (drag & drop)
- Templates d'entraînements
- Historique entraînements
- Stats nageur (volume, graphiques)
- Modification feedback < 24h
- Vue calendrier mois
- Export PDF
- Un nageur dans plusieurs groupes

### V1 (6+ mois)
- Nageurs indépendants + IA Coach
- Planification cycles multi-semaines
- Objectifs nageurs
- Intégration API FFN
- Notifications push
- Mode hors-ligne

---

**Version** : 1.0  
**Date** : 29 Janvier 2026  
**Statut** : Validé
