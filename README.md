# 🏊 SwimLab

> Application mobile de gestion de clubs de natation

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)]()
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)]()

## 📱 Qu'est-ce que SwimLab ?

SwimLab digitalise l'entraînement en natation pour créer un lien fort entre coachs et nageurs.

**Pour les Coachs** :
- ✅ Créer des entraînements structurés rapidement
- ✅ Planifier la saison avec des créneaux récurrents
- ✅ Suivre l'assiduité et la fatigue des nageurs
- ✅ Analyser les feedbacks

**Pour les Nageurs** :
- ✅ Voir leur planning à l'avance
- ✅ Donner leur ressenti (RPE + commentaire)
- ✅ Suivre leur progression

## 🛠️ Stack Technique

- **Frontend** : React Native + Expo SDK 54
- **Langage** : TypeScript
- **Backend** : Supabase (PostgreSQL, Auth, RLS)
- **UI** : React Native Paper
- **Navigation** : React Navigation 6
- **State** : Zustand

## 📂 Structure du Projet

```
src/
├── screens/        # Écrans de l'app
├── components/     # Composants réutilisables
├── services/       # Logique métier + API calls
├── hooks/          # Custom hooks
├── types/          # Types TypeScript
└── utils/          # Fonctions utilitaires
```

## 🚀 Installation

```bash
# Cloner le repo
git clone https://github.com/TON_USERNAME/swimlab-app.git
cd swimlab-app

# Installer les dépendances
npm install

# Configurer Supabase
cp .env.example .env
# Éditer .env avec tes credentials Supabase

# Lancer l'app
npm start
```

## 📖 Documentation

- [Vision Produit](./docs/VISION.md)
- [Product Spec V0](./docs/PRODUCT_SPEC_V0.md)
- [Database Schema](./docs/DATABASE_SCHEMA_V0.md)
- [Technical Roadmap](./docs/TECHNICAL_ROADMAP_V0.md)

## 🗺️ Roadmap

### ✅ Fait (Setup)
- Auth & Profils
- Clubs + Code invitation
- Groupes d'entraînement
- Database schema

### 🚧 En Cours (V0 - MVP)
- Créneaux récurrents (slots)
- Création entraînements structurés
- Calendrier Coach
- Calendrier Nageur
- Émargement + Feedback
- Stats coach

### 📅 Prévu (V0.5)
- Bibliothèque d'exercices
- Templates d'entraînements
- Historique + Analytics
- Notifications push

### 🔮 Futur (V1+)
- Mode Nageur Solo
- IA Coach Virtuel
- Social & Communauté

## 🤝 Contributeurs

- **Raudi** (DI) - Créateur & Développeur
- **Claude** (Anthropic) - Assistant Technique

## 📝 Licence

Privé - Tous droits réservés

---

**Version** : V0 (MVP en cours)  
**Dernière mise à jour** : 29 Janvier 2026
