# Product Specification - V0 (MVP)

## Objectif V0

**Valider le concept** avec un club pilote en creant le flow minimal coach-nageur.

**Critere de succes** :
- 1 club pilote utilise l'app pendant 4 semaines
- 10+ entrainements crees et planifies
- 50+ feedbacks collectes
- Taux de feedback > 60%

---

## Architecture Hierarchique

```
CLUB (ex: "Swim Club Paris")
 +-- COACH(s)
      +-- GROUPE(s) (ex: Competition, Loisir)
           +-- NAGEUR(s)
```

**Regles** :
- Un club peut avoir plusieurs coachs
- Un coach peut avoir plusieurs groupes
- Un nageur peut etre dans un seul groupe (V0) ou plusieurs (V0.5)
- Un coach cree des SLOTS (creneaux recurrents)
- Un coach cree des ENTRAINEMENTS et les assigne aux slots

---

## User Stories V0

### 1. Authentification & Setup Club

| US | Description | Statut |
|----|-------------|--------|
| US-001 | Inscription Coach (email, password, nom, prenom, role coach) | DONE |
| US-002 | Creation Club (nom, description, code invitation auto-genere) | DONE |
| US-003 | Inscription Nageur + rejoindre club par code invitation | DONE |

### 2. Gestion Groupes

| US | Description | Statut |
|----|-------------|--------|
| US-004 | Creation Groupe (nom, description, niveau) | DONE |
| US-005 | Ajout/retrait Nageurs dans un Groupe (selection multiple) | DONE |

### 3. Creneaux Recurrents (Slots)

| US | Description | Statut |
|----|-------------|--------|
| US-006 | Creation Creneau (jour, heure, duree, lieu, groupe) | DONE |
| US-007 | Modification/Suppression Creneau | DONE |

### 4. Creation Entrainement

| US | Description | Statut |
|----|-------------|--------|
| US-008 | Creer Entrainement Structure (3 niveaux: block > sub-block > exercice) | DONE |
| US-009 | Assigner Entrainement a Slot (depuis calendrier, slot vide) | DONE |
| US-010 | Dupliquer Entrainement | DONE |

### 5. Calendrier Coach

| US | Description | Statut |
|----|-------------|--------|
| US-011 | Vue Calendrier Coach semaine (slots vides/remplis, navigation, stats) | DONE |

### 6. Calendrier Nageur

| US | Description | Statut |
|----|-------------|--------|
| US-012 | Vue Calendrier Nageur (entrainements a venir, badges statut) | DONE |
| US-013 | Voir Detail Entrainement Passe (structure hierarchique read-only) | DONE |

### 7. Emargement & Feedback

| US | Description | Statut |
|----|-------------|--------|
| US-014 | Emargement Coach (liste nageurs, checkboxes, validation) | DONE |
| US-015 | Donner Feedback Nageur (RPE 6-20 slider + commentaire) | DONE |
| US-016 | Modifier Feedback < 24h | V0.5 |

### 8. Stats Coach

| US | Description | Statut |
|----|-------------|--------|
| US-017 | Voir Feedbacks d'un Entrainement (stats globales + individuels) | DONE |

---

## Structure JSON Entrainement (content)

```json
{
  "blocks": [
    {
      "id": "block_1",
      "type": "warmup | main | cooldown | drill | sprint | endurance | other",
      "name": "Echauffement",
      "total_distance": 600,
      "sub_blocks": [
        {
          "id": "sub_block_1_1",
          "title": "4x150m",
          "series": 4,
          "distance": 150,
          "departure": "@ 2'30",
          "notes": "",
          "exercises": [
            {
              "id": "exercise_1_1_1",
              "distance": 100,
              "stroke": "freestyle",
              "intensity": "easy",
              "target_time": "",
              "notes": ""
            }
          ]
        }
      ]
    }
  ]
}
```

**Types de nage (stroke)** : freestyle, backstroke, breaststroke, butterfly, individual_medley, choice, kick, pull, drill, fins, pull_buoy, paddles

**Intensites (intensity)** : recovery, easy, moderate, threshold, hard, sprint

---

## Flows Principaux

### Flow 1 : Coach Cree et Planifie Entrainement
1. Coach ouvre calendrier → clic slot vide → "Assigner entrainement"
2. Choisit entrainement existant OU cree nouveau
3. Editeur blocks (echauffement, serie principale, retour calme)
4. Publie → assigne au slot
5. Nageurs du groupe voient dans calendrier

### Flow 2 : Nageur Donne Feedback
1. Entrainement a lieu
2. Coach fait emargement (coche presents/absents)
3. Nageurs presents voient "Donner feedback" dans calendrier
4. RPE slider (6-20) + commentaire optionnel → Envoyer
5. Coach voit stats dans WorkoutStats

---

## Hors Scope V0

### V0.5 (Nice-to-have)
- Bibliotheque d'exercices (drag & drop)
- Templates d'entrainements
- Historique entrainements
- Stats nageur (volume, graphiques)
- Modification feedback < 24h
- Vue calendrier mois
- Export PDF
- Un nageur dans plusieurs groupes
- Notifications push basiques

### V1 (6+ mois)
- Nageurs independants + IA Coach
- Planification cycles multi-semaines
- Objectifs nageurs
- Integration API FFN
- Notifications push
- Mode hors-ligne

---

**Version** : 1.1
**Date** : 14 Fevrier 2026
**Statut** : V0 complete - pret pour pilote
