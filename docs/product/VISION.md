# 🌊 VISION PRODUIT - Swim Club App

## 🎯 Mission

**"Digitaliser et moderniser l'entraînement en natation pour créer une connexion plus forte entre coachs et nageurs."**

### Pourquoi Cette App Existe

**Problèmes identifiés** (vécus par le créateur en tant que nageur puis coach) :
- ❌ Manque de digitalisation dans les clubs
- ❌ Pas de visibilité pour les nageurs sur leur saison
- ❌ Communication coach-nageur inefficace (WhatsApp, papier, verbal)
- ❌ Pas de tracking des données (volume, progression, fatigue)
- ❌ Création d'entraînements chronophage pour les coachs
- ❌ Pas de feedback structuré des nageurs vers les coachs

**Ce qui existe déjà** :
- FFN Mon Espace Nageur : Focus compétitions officielles, pas l'entraînement quotidien
- TeamUnify (USA) : Interface vieillotte, pas mobile-friendly
- MySwimPro : Focus nageurs solo, pas club/coach

**Notre différence** :
- ✅ Focus sur le lien coach-nageur
- ✅ Mobile-first, UX moderne
- ✅ Feedback bidirectionnel (nageur → coach)
- ✅ IA pour assister (pas remplacer)

---

## 🗺️ Roadmap Versions

### V0 - MVP Club - COMPLETE

**Objectif** : Valider le concept avec un club pilote

**Pour qui** :
- Coachs en club
- Nageurs en club

**Fonctionnalités** :
- Auth & Profils (Coach/Nageur)
- Clubs + Code invitation
- Groupes d'entraînement
- **Créneaux récurrents** (slots hebdomadaires)
- Création entraînements structurés (blocks hiérarchiques)
- Entraînements typés (Endurance/Sprint/Technique/Récup)
- Assignation entraînements aux slots
- Calendrier Coach (vue semaine, entraînements détaillés)
- Calendrier Nageur (entraînements masqués avant émargement)
- Émargement par le coach
- Feedback nageur (RPE + commentaire)
- Stats coach par entraînement (présence, RPE moyen)

**Ce qui N'est PAS là** :
- Pas de cycles/phases multi-semaines
- Pas de bibliothèque d'exercices
- Pas de templates
- Pas d'historique/stats nageur
- Pas d'objectifs
- Pas de notifications push
- Pas de mode hors-ligne

**Critère de succès** :
- 1 club pilote × 4 semaines
- 10+ entraînements créés
- 50+ feedbacks collectés
- Taux feedback > 60%

---

### V0.5 - Enrichissement Club (1-2 mois)

**Objectif** : Rendre l'app indispensable au quotidien

**Ajouts** :
- Bibliothèque d'exercices (drag & drop)
- Templates d'entraînements
- Historique entraînements (coach + nageur)
- Graphiques nageur (volume, RPE, tendances)
- Stats nageur (assiduité, progression)
- Modification feedback < 24h
- Vue calendrier mois (coach)
- Export entraînement (PDF)
- Un nageur dans plusieurs groupes
- Notifications push basiques

---

### V1 - Nageur Solo + IA Coach (3-4 mois)

**Objectif** : Étendre à un nouveau segment (nageurs sans club)

**Pour qui** :
- Nageurs indépendants (pas en club)

**Architecture** :
```
Nageur Solo
 └─ IA Coach Virtuel
     ├─ Génère entraînements personnalisés
     ├─ Analyse feedbacks
     └─ Suggère ajustements
```

**Fonctionnalités Nageur Solo** :
- Profil "Nageur Indépendant" (pas de club)
- Accès à l'éditeur d'entraînement (comme un coach)
- IA Coach :
  - Génère entraînements selon objectif/niveau/temps dispo
  - Analyse RPE et suggère récup/intensification
  - Planification multi-semaines assistée
  - Chatbot pour conseils techniques
- Mode freemium :
  - Gratuit : Avec pub, 1 entraînement/semaine généré par IA
  - Premium (€4.99/mois) : Sans pub, entraînements illimités, analytics

**Fonctionnalités IA pour Coachs** (bonus V1) :
- Suggestion d'entraînements selon contexte
- Alertes surmenage (RPE trop élevés)
- Recommandations de récupération
- Assistant création entraînement

**Modèle économique** :
- **Clubs** : 200€/an (coach + 20 nageurs inclus, +5€/nageur supplémentaire)
- **Nageurs Solo Gratuit** : Avec pub
- **Nageurs Solo Premium** : €4.99/mois

---

### V2 - Social & Communauté (6+ mois)

**Objectif** : Devenir "le Strava de la natation"

**Fonctionnalités** :
- Profils publics (optionnel)
- Feed d'actualité (partage entraînements, résultats)
- Suivre d'autres nageurs
- Likes, commentaires
- Challenges mensuels (ex: "100km en janvier")
- Leaderboards (distance, assiduité)
- Badges & gamification
- Annuaire clubs (trouver un club près de chez soi)
- Groupes thématiques (Masters, Papillon, etc.)
- Marketplace (maillots d'occasion, stages, cours particuliers)

---

### V3+ - IA Avancée & Innovation

**Fonctionnalités** :
- Analyse vidéo technique (upload vidéo → IA détecte erreurs)
- Prédiction temps en compétition
- Intégration montres connectées (Garmin, Apple Watch)
- Sync Strava
- API publique
- Multi-langues
- Partenariats fédérations nationales
- Extension autres sports aquatiques (water-polo, natation synchro)

---

## 👥 Personas

### Coach Thomas (35 ans) - Utilisateur Principal V0
**Contexte** :
- Entraîne 2 groupes (Compétition 15 nageurs, Loisir 12 nageurs)
- 3 entraînements/semaine par groupe
- Travaille à temps plein à côté (ingénieur)
- Bénévole passionné

**Besoins** :
- Créer entraînements rapidement (< 10 min)
- Avoir une vue d'ensemble de la saison
- Suivre assiduité et fatigue des nageurs
- Communiquer efficacement avec les nageurs

**Pain Points Actuels** :
- Cahier papier désorganisé, parfois perdu
- Pas de visibilité sur qui vient/ne vient pas à l'avance
- Feedback verbal oublié
- Pas de données pour ajuster sa pédagogie

**Quote** : *"J'aimerais passer moins de temps à gérer l'administratif et plus de temps à coacher."*

---

### Sophie (28 ans) - Nageuse Compétition
**Contexte** :
- Groupe Compétition
- 3-4 entraînements/semaine
- Travaille en marketing, emploi du temps chargé
- Fait quelques compétitions régionales

**Besoins** :
- Voir son planning à l'avance
- Comprendre où elle va (progression, objectifs)
- Se comparer aux autres (motivation)
- Communiquer son ressenti au coach

**Pain Points Actuels** :
- Programme envoyé par WhatsApp (désorganisé, perdu)
- Pas de suivi de ses temps/progression
- Se sent seule dans sa progression
- Ne sait pas si elle s'améliore vraiment

**Quote** : *"J'aimerais voir concrètement ma progression et savoir si ce que je fais a du sens."*

---

### Marc (42 ans) - Nageur Loisir (Cible V1)
**Contexte** :
- Nage 2x/semaine pour la forme
- Pas en club (piscine municipale)
- Ancien nageur, a arrêté 10 ans

**Besoins** :
- Programme structuré (sinon fait toujours pareil)
- Motivation pour être régulier
- Progression visible

**Pain Points Actuels** :
- S'ennuie (fait des longueurs sans but)
- Manque de structure
- Pas de motivation sociale
- Ne sait pas comment progresser

**Quote** : *"J'aimerais un coach virtuel qui me guide sans avoir à payer 50€/mois."*

---

## 🎨 Identité Visuelle (Direction V0.5+)

### Style Général
- **Moderne & Énergique** : Couleurs vives, dynamique
- **Fluide** : Évoque l'eau, le mouvement
- **Premium mais Accessible** : Pas cheap, mais pas élitiste
- **Sport-Tech** : Mix entre app sportive et outil pro

### Palette de Couleurs (Proposée)

**Primaire**
- Turquoise vibrant : `#06B6D4` (cyan-500) - Énergie, eau
- Teal foncé : `#115E59` (teal-800) - Profondeur, fond

**Secondaire**
- Rose/Magenta : `#EC4899` (pink-500) - Dynamisme
- Orange : `#F59E0B` (amber-500) - Motivation

**Accent**
- Jaune : `#FBBF24` (amber-400) - Highlights
- Bleu électrique : `#3B82F6` (blue-500) - Focus

**Neutre**
- Fond clair : `#F8FAFC` (slate-50)
- Texte : `#0F172A` (slate-900)
- Gris : `#64748B` (slate-500)

### Inspirations Visuelles
- **Image 1** : Nageur stylisé, speed lines, couleurs vives
- **Image 2** : Vagues fluides 3D, immersion, profondeur

### Logo (V0.5)
- Nageur stylisé en mouvement
- Vagues/eau abstraite
- Nom app intégré
- Déclinaisons : couleur, monochrome, icône seule

---

## 🎯 Objectifs à 5 Ans (2031)

### Adoption
- **An 1** : 5 clubs, 100 nageurs actifs
- **An 2** : 50 clubs, 1000 nageurs actifs
- **An 3** : 500 clubs, 10 000 nageurs actifs
- **An 5** : 5000 clubs, 100 000 nageurs actifs

### Engagement
- Taux rétention 30j > 60%
- Feedbacks > 80% des entraînements
- Temps moyen dans app > 15 min/semaine
- Entraînements créés/coach > 3/semaine

### Business (V3+)
- Taux conversion freemium → premium > 10%
- ARR (Annual Recurring Revenue) > 100k€
- Partenariats marques > 5

### Impact
- Référence en France pour clubs de natation
- Présence dans top 10 clubs français
- Partenariat FFN ou fédérations régionales
- Extension internationale (Belgique, Suisse, Canada)

---

## 💡 Principes Fondamentaux

### Valeurs Produit
1. **Simplicité d'abord** : Chaque feature doit apporter de la valeur, pas de la complexité
2. **Mobile-first** : L'app doit être fluide sur téléphone (60% du temps d'usage)
3. **Feedback Loop** : Coach et nageur communiquent dans les deux sens
4. **Data au Service** : Les données aident à progresser, pas à juger
5. **IA Assistante** : L'IA aide, ne remplace pas l'humain

### Approche Développement
- **Itératif** : Versions courtes, feedback rapide
- **Éducatif** : Apprendre en construisant
- **Pragmatique** : MVP d'abord, perfection ensuite
- **Documenté** : Tout est écrit, rien n'est implicite

---

## 🚫 Ce Qu'on Ne Veut PAS Être

- ❌ Un outil complexe réservé aux pros
- ❌ Une app "tout-en-un" qui fait mal tout
- ❌ Un réseau social toxique (comparaisons malsaines)
- ❌ Un abonnement cher qui exclut
- ❌ Une app lente et bugguée

---

## 🤝 Collaborateurs

- **Créateur & Développeur** : Raudi (dev junior, nageur/coach expérimenté)
- **Assistant Technique** : Claude (Anthropic)
- **Pilote V0** : [Club à définir - ancien club de Raudi]

---

## 📝 Notes & Idées en Vrac

### Idées à Creuser
- Page "Records" par nageur (sync avec API FFN si dispo)
- Compétitions virtuelles entre clubs (gamification)
- Mode "Coach IA" explique pourquoi tel exercice
- Intégration piscines (réserver créneaux via app ?)
- Marketplace stages vacances
- Partenariat marques maillots (affiliation)

### Risques Identifiés
- **Adoption** : Clubs conservateurs, résistants au changement
- **Concurrence** : Strava lance un mode natation ?
- **Technique** : Scalabilité si succès rapide
- **Légal** : RGPD, données mineurs, responsabilité

### Questions Ouvertes
- Faut-il un tableau de bord "Parents" en V1 ? (voir notes fils mineurs)
- Multi-clubs dès V0 ou V1 ?
- Badges/Gamification : trop gadget ou réelle motivation ?

---

**Ce document est vivant !** À enrichir au fil de l'eau.

**Derniere mise a jour** : 14 Fevrier 2026
**Prochaine revision** : Apres pilote V0
