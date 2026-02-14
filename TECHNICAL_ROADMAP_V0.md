# Technical Roadmap - SwimLab

## V0 - Sprints Completes

### Sprint 1 : Foundation (DONE)
- Auth (login, register, logout) avec Supabase Auth
- Navigation (AppNavigator, CoachNavigator, SwimmerNavigator)
- Schema DB (9 tables avec RLS)
- Types TypeScript complets
- Theme React Native Paper (MD3)
- Zustand auth store (session, user, profile, clubId)

### Sprint 2 : Slots & Workouts (DONE)
- CRUD Creneaux (training_slots)
- Editeur d'entrainements hierarchique (block > sub-block > exercice)
- Calcul auto distance totale
- Brouillon / Publication
- Calendrier coach vue semaine (WeekView)
- Assignation entrainement a un slot depuis le calendrier

### Sprint 3 : Calendrier & Emargement (DONE)
- Calendrier nageur (vue semaine avec badges statut)
- Emargement coach (AttendanceScreen, checkboxes par nageur)
- Creation workout_sessions pour presents/absents

### Sprint 4 : Feedback (DONE)
- RPESlider composant (echelle Borg 6-20, couleurs vert/orange/rouge)
- FeedbackScreen nageur (RPE + commentaire)
- Badges statut dans calendrier nageur (present, feedback donne, absent)

### Sprint 5 : Onboarding & Polish (DONE)
- Onboarding coach : ClubSetupScreen (creation club)
- Onboarding nageur : JoinClubScreen (code invitation)
- GroupDetailScreen (ajout/retrait nageurs)
- WorkoutStatsScreen (RPE moyen, distribution, feedbacks individuels)
- WorkoutDetailScreen (lecture seule pour nageur)
- Duplication d'entrainements
- Dashboard coach (groupes, stats globales)

### Sprint 6 : Dashboards & Profils (DONE)
- Dashboard nageur (vrais entrainements a venir, stats, feedback en attente)
- Calendrier coach : navigation vers Attendance ou WorkoutStats au clic
- Calendrier nageur : navigation vers WorkoutDetail au clic
- ProfileScreen coach (infos club, code invitation, nb membres)
- ProfileScreen nageur (club, groupes, email)
- Fix onboarding (navigation reactive via clubId store, RLS migration 002)
- Compatibilite web (SecureStore fallback localStorage)
- 12 suites de tests, 136 tests passing

---

## Ecrans Existants (17 ecrans)

### Coach (14 ecrans)
| Ecran | Fichier | Description |
|-------|---------|-------------|
| Dashboard | `screens/coach/DashboardScreen` | Groupes, stats globales |
| Calendrier | `screens/coach/CalendarScreen` | Vue semaine, slots, navigation |
| Entrainements | `screens/coach/WorkoutsScreen` | Liste entrainements |
| Creneaux | `screens/coach/SlotsScreen` | Liste creneaux par groupe |
| Groupes | `screens/coach/GroupsScreen` | Liste groupes |
| Profil | `screens/coach/ProfileScreen` | Infos coach + club |
| Creation Groupe | `screens/coach/CreateGroupScreen` | Formulaire groupe |
| Detail Groupe | `screens/coach/GroupDetailScreen` | Nageurs + ajout/retrait |
| Creation Creneau | `screens/coach/CreateSlotScreen` | Formulaire creneau |
| Creation Entrainement | `screens/coach/CreateWorkoutScreen` | Editeur hierarchique |
| Edition Entrainement | `screens/coach/EditWorkoutScreen` | Modification entrainement |
| Assignation | `screens/coach/AssignWorkoutScreen` | Assigner entrainement a slot |
| Emargement | `screens/coach/AttendanceScreen` | Checkboxes presence |
| Stats Entrainement | `screens/coach/WorkoutStatsScreen` | RPE stats + feedbacks |

### Nageur (5 ecrans)
| Ecran | Fichier | Description |
|-------|---------|-------------|
| Dashboard | `screens/swimmer/DashboardScreen` | Prochains entrainements, stats |
| Calendrier | `screens/swimmer/CalendarScreen` | Vue semaine avec badges |
| Profil | `screens/swimmer/ProfileScreen` | Infos nageur + club |
| Feedback | `screens/swimmer/FeedbackScreen` | RPE slider + commentaire |
| Detail Entrainement | `screens/swimmer/WorkoutDetailScreen` | Structure read-only |

### Onboarding (2 ecrans)
| Ecran | Fichier | Description |
|-------|---------|-------------|
| Creation Club | `screens/onboarding/ClubSetupScreen` | Coach cree son club |
| Rejoindre Club | `screens/onboarding/JoinClubScreen` | Nageur rejoint par code |

---

## V0 → Pilote : Polish restant

Avant de deployer le pilote :

- [ ] Loading skeletons sur les ecrans principaux
- [ ] Toasts de confirmation (succes/erreur)
- [ ] Pull-to-refresh sur toutes les listes
- [ ] Badge RPE moyen sur les assignments passes dans le calendrier coach
- [ ] Empty states clairs (pas de groupes, pas d'entrainements)
- [ ] EAS Build (iOS + Android)
- [ ] Creer club pilote, inviter nageurs, 4 semaines de test

---

## V0.5 - Enrichissement Club

### Sprint 7 : Bibliotheque & Templates
- [ ] Table `exercise_library` (exercices reutilisables par club)
- [ ] Ecran bibliotheque d'exercices (CRUD)
- [ ] Drag & drop exercices dans l'editeur d'entrainement
- [ ] Table `workout_templates` (sauvegarder un entrainement comme template)
- [ ] Ecran templates (liste, creer depuis template)
- [ ] Dupliquer un template en entrainement

### Sprint 8 : Historique & Stats Nageur
- [ ] Historique entrainements coach (liste filtrable par date/type/groupe)
- [ ] Historique entrainements nageur (ses entrainements passes)
- [ ] Stats nageur : volume total (m) par semaine/mois (graphique)
- [ ] Stats nageur : evolution RPE dans le temps (graphique)
- [ ] Stats nageur : assiduite (% presence par mois)
- [ ] Dashboard nageur enrichi avec mini-graphiques

### Sprint 9 : Calendrier Mois & Multi-groupes
- [ ] Vue calendrier mois coach (pastilles par jour, clic → vue jour)
- [ ] Enlever contrainte UNIQUE sur group_members (multi-groupes)
- [ ] UI ajout nageur a plusieurs groupes
- [ ] Modification feedback nageur < 24h apres envoi
- [ ] Export entrainement en PDF (generation + partage)

### Sprint 10 : Notifications Push
- [ ] Setup Expo Notifications (push tokens)
- [ ] Notification apres emargement : "Donne ton feedback"
- [ ] Notification rappel entrainement (1h avant)
- [ ] Preferences notifications dans profil
- [ ] Badge compteur notifications non lues

---

## V1 - Nageur Solo + IA Coach

### Sprint 11 : Profil Nageur Independant
- [ ] Nouveau role "solo" dans profiles
- [ ] Ecran inscription nageur solo (sans club)
- [ ] Dashboard nageur solo (pas de club, acces editeur)
- [ ] Nageur solo peut creer ses propres entrainements
- [ ] Auto-assignation et auto-emargement pour nageur solo

### Sprint 12 : IA Coach - Generation Entrainements
- [ ] Integration API Claude/GPT pour generation
- [ ] Formulaire : objectif, niveau, temps dispo, materiel
- [ ] Generation entrainement structure (meme format JSON blocks)
- [ ] Preview + edition avant publication
- [ ] Historique des entrainements generes

### Sprint 13 : IA Coach - Analyse & Recommandations
- [ ] Analyse RPE tendance (surmenage, sous-entrainement)
- [ ] Alertes automatiques si RPE moyen > 17 sur 3 seances
- [ ] Suggestions recuperation / intensification
- [ ] Planification multi-semaines assistee (cycles)
- [ ] Chatbot conseils techniques (integration IA conversationnelle)

### Sprint 14 : IA pour Coachs
- [ ] Suggestion d'entrainements selon contexte (groupe, historique, RPE)
- [ ] Assistant creation entrainement (IA pre-remplit le formulaire)
- [ ] Rapport hebdomadaire auto (resume RPE, assiduite, alertes)
- [ ] Recommandations de periodisation

### Sprint 15 : Monetisation & Infra
- [ ] Mode freemium nageur solo (gratuit avec pub, premium sans pub)
- [ ] Integration paiement (Stripe / RevenueCat)
- [ ] Pub integration (AdMob ou equivalent)
- [ ] Pricing clubs (200 EUR/an)
- [ ] Dashboard admin (metriques, utilisateurs, revenus)
- [ ] Objectifs nageurs (table `swimmer_goals`, suivi progression)
- [ ] Mode hors-ligne basique (cache derniers entrainements)

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Framework | React Native (Expo SDK 54) |
| Langage | TypeScript |
| UI | React Native Paper (MD3) |
| Navigation | React Navigation 6 (native-stack + bottom-tabs) |
| State | Zustand |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Tests | Jest + ts-jest |
| Build | EAS Build (a venir) |

---

**Version** : 2.0
**Date** : 14 Fevrier 2026
**Statut** : V0 complete, roadmap V0.5/V1 defini
