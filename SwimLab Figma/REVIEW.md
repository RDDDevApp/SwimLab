# Revue Complète — SwimLab Figma v1

**Date :** 10 mars 2026
**Projet :** SwimLab Figma (Prototype Web — React + Vite + Tailwind v4)
**Scope :** Design system, architecture, UX, accessibilité, performance, code quality

---

## 20 CHOSES BIEN

### 1. Architecture composants claire
Organisation logique et modulaire : `ui/` (51 composants shadcn), puis dossiers métier `planning/`, `workout/`, `profile/`, `social/`, `groups/`, `auth/`, `coach/`. Chaque domaine a son propre espace.

### 2. Design system cohérent
Tokens CSS centralisés dans `theme.css` avec variables OKLCH modernes, radius scale (`--radius` + sm/md/lg/xl), shadow system, et palette sémantique complète.

### 3. Accessibilité solide
Usage exemplaire de `aria-label`, `aria-describedby`, `aria-invalid`, `sr-only` (9 instances), `focus-visible:ring` (24 instances), rôles sémantiques (`role="alert"`, `role="navigation"`, etc.).

### 4. Responsive mobile-first
Hook `useIsMobile()` avec breakpoint 768px, patterns `hidden md:block`, grilles adaptatives, sidebar responsive avec mode drawer mobile.

### 5. Animations soignées
Motion (Framer Motion) pour transitions de pages, micro-interactions (`whileHover`, `whileTap`), `AnimatePresence` pour les transitions, animations d'entrée staggered.

### 6. SplashCoach IA créatif
9 états émotionnels, effet machine à écrire, personnalité unique avec batterie à 12% et crises existentielles aléatoires. Touche d'humour qui différencie l'app.

### 7. Glass-morphism cohérent
Pattern `bg-white/40 backdrop-blur-md border border-white/60` appliqué uniformément sur les cartes et overlays. Identité visuelle forte.

### 8. Bibliothèque UI complète (51 composants)
Accordion, Alert, Avatar, Badge, Button, Calendar, Card, Carousel, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, Input, InputOTP, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, ResizablePanel, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toggle, ToggleGroup, Tooltip, etc.

### 9. Dark mode préparé
Variables CSS light/dark complètes dans theme.css avec `.dark` class selector. Tous les tokens ont leurs variantes dark : background, foreground, muted, accent, destructive, chart colors.

### 10. Variants type-safe (CVA)
Class Variance Authority pour Button (6 variants × 4 sizes), Badge (4 variants), Alert, SidebarMenuButton. Gestion propre des variants avec TypeScript.

### 11. Validation formulaires robuste
React Hook Form + `aria-invalid` + ring destructive (`#d4183d`) + messages d'erreur liés par ID unique (`formItemId`, `formDescriptionId`, `formMessageId`).

### 12. 3 profils utilisateur distincts
Coach (`Home.tsx`), Nageur d'équipe (`SwimmerHome.tsx`), Nageur solo (`SoloSwimmerHome.tsx`) avec UX et fonctionnalités adaptées à chaque rôle.

### 13. Workout Builder complet
Création manuelle + génération IA, blocs éditables avec type/distance/allure, groupement par type (échauffement, technique, endurance, sprint, récupération), drag & drop préparé via `react-dnd`.

### 14. Planning riche et fonctionnel
Vue semaine/mois, filtrage par groupe, countdown timer pour les séances en cours, feedback RPE post-séance, système d'émargement.

### 15. Système de gamification
XP, badges avec `GlowBadge` animé (glow pulsant), records personnels, défis, streaks. Motivation intrinsèque bien pensée.

### 16. Data-slot attributes pour testing
245+ instances de `data-slot="..."` sur les composants UI. Facilite le ciblage CSS, les tests E2E, et le debugging.

### 17. Palette couleurs sémantique
Cyan = primaire/natation, Vert = récupération, Orange = intensité, Rose = défis, Violet = avancé. Les couleurs ont du sens.

### 18. Stack technique moderne
Vite 6.3, React Router v7, Tailwind v4 (via @tailwindcss/vite), Motion 12, TypeScript, Radix UI. Choix solides et à jour.

### 19. Gestion états vides et erreurs
Empty states (SlotCard vide avec bordure tiretée + CTA), Skeleton loading (avec largeurs randomisées), ImageWithFallback avec SVG de secours.

### 20. Navigation sidebar responsive
Collapse/expand animé, mode mobile drawer, raccourci clavier `Cmd+B`, persistance de l'état via cookie, 3 modes (expanded, collapsed, offcanvas).

---

## 20 CHOSES A AMELIORER (avec remédiation)

### 1. Fichiers composants trop longs
**Problème :** `WorkoutBuilder.tsx` fait 850+ lignes, `DreamPlanning.tsx` est très dense.
**Remédiation :** Extraire en sous-composants : `WorkoutHeader`, `WorkoutBlockList`, `WorkoutAIPanel`, `PlanningWeekView`, `PlanningMonthView`. Viser max 200-300 lignes par fichier.

### 2. Données mock inline
**Problème :** Toutes les données de démonstration sont codées en dur dans les composants (listes de nageurs, workouts, groupes).
**Remédiation :** Créer `src/mocks/` avec fichiers séparés (`swimmers.ts`, `workouts.ts`, `groups.ts`, `planning.ts`) importés par les composants.

### 3. Mélange FR/EN dans le code
**Problème :** Routes en FR (`/planning-nageur`), variables en EN, labels UI en FR. Inconsistant.
**Remédiation :** Convention : code 100% EN, UI 100% FR. Renommer routes : `/swimmer-planning`, `/swimmer-profile`, `/swimmer-workout`.

### 4. Pas d'Error Boundaries
**Problème :** Un crash dans un composant = page blanche complète.
**Remédiation :** Ajouter `ErrorBoundary` wrapper dans `App.tsx` + composants d'erreur dédiés par section avec bouton "Réessayer".

### 5. Pas de lazy loading des routes
**Problème :** Toutes les pages sont chargées au démarrage = bundle initial lourd.
**Remédiation :** `React.lazy()` + `Suspense` dans `routes.ts` pour chaque page avec Skeleton comme fallback.

### 6. Guidelines quasi vides
**Problème :** `guidelines/Guidelines.md` = template placeholder avec des commentaires.
**Remédiation :** Documenter : palette complète, spacing scale, breakpoints, patterns de composants, do's & don'ts, exemples d'utilisation.

### 7. fonts.css vide
**Problème :** Le fichier `src/styles/fonts.css` existe mais est vide. Aucune police définie.
**Remédiation :** Définir les `@font-face` pour les polices utilisées, ou documenter l'utilisation des polices système. Recommandation : ajouter Inter ou Plus Jakarta Sans comme police display.

### 8. Pas de tests
**Problème :** Zéro test unitaire, d'intégration ou E2E.
**Remédiation :** Ajouter Vitest + @testing-library/react. Priorité : WorkoutBuilder, SlotCard, AuthPage, FormValidation. Objectif : 80% coverage sur les composants critiques.

### 9. Animations infinies non optimisées
**Problème :** Orbes animés en boucle (durée 19-30s) = consommation GPU permanente.
**Remédiation :** Ajouter `will-change: transform`, respecter `prefers-reduced-motion` pour désactiver les animations, et utiliser `IntersectionObserver` pour pauser hors viewport.

### 10. Pas de gestion d'état global
**Problème :** `useState` local partout, pas de contexte partagé entre les pages.
**Remédiation :** Ajouter Zustand (déjà utilisé dans l'app React Native principale) pour : user profile, theme, sidebar state, selected group.

### 11. Images externes non optimisées
**Problème :** URLs Unsplash directement dans le code, sans lazy loading ni responsive.
**Remédiation :** Ajouter `loading="lazy"`, attribut `srcset` pour tailles responsive, composant `OptimizedImage` avec placeholder blur-up.

### 12. Pas de pagination/virtualisation des listes
**Problème :** Listes longues (social feed, liste nageurs) rendues intégralement dans le DOM.
**Remédiation :** Implémenter `@tanstack/react-virtual` pour les listes de 50+ éléments (feed social, liste de nageurs, historique workouts).

### 13. Incohérence cn() vs clsx()
**Problème :** `StatCard.tsx` utilise `clsx` directement au lieu de `cn()` (tailwind-merge wrapper).
**Remédiation :** Remplacer tous les appels `clsx()` par `cn()` dans les composants métier pour bénéficier du merge intelligent de classes Tailwind.

### 14. Couleurs hardcodées
**Problème :** `bg-gray-100` dans ImageWithFallback, objet COLORS inline dans SlotCard.
**Remédiation :** Migrer vers les tokens design : `bg-muted` au lieu de `bg-gray-100`. Centraliser COLORS dans `src/constants/colors.ts`.

### 15. Pas de Storybook
**Problème :** Impossible de visualiser et tester les composants isolément.
**Remédiation :** Ajouter Storybook 8 avec stories pour chaque composant UI + composants métier principaux (SlotCard, StatCard, WorkoutBlock).

### 16. Routes multiples → même composant
**Problème :** `/challenges`, `/stats`, `/records` redirigent tous vers `ProfileDashboardPage`.
**Remédiation :** Utiliser des sous-routes ou query params : `/profile?tab=challenges`, `/profile?tab=stats`, `/profile?tab=records`. Ou bien des routes imbriquées : `/profile/challenges`.

### 17. Loading states async insuffisants
**Problème :** La génération IA de workout n'a pas d'indicateur de chargement visible et contextuel.
**Remédiation :** Ajouter Skeleton + spinner + texte "Génération en cours..." avec progress bar simulée. Afficher des tips natation pendant l'attente.

### 18. TypeScript partiel
**Problème :** Certains types `any` implicites, props pas toujours explicitement typées.
**Remédiation :** Activer `strict: true` dans tsconfig.json, typer exhaustivement les props et les états. Créer des interfaces dans `src/types/` pour les entités métier.

### 19. Pas de configuration PWA
**Problème :** Pas de `manifest.json` ni service worker. L'app ne peut pas être installée.
**Remédiation :** Ajouter `vite-plugin-pwa` avec manifest, icons, et stratégie de cache pour support offline et installation sur l'écran d'accueil.

### 20. Pas de SEO / meta tags
**Problème :** `index.html` minimal, pas d'Open Graph, pas de title dynamique.
**Remédiation :** Ajouter `react-helmet-async` pour title/description dynamiques par page, OG tags pour le partage social, favicon adaptatif.

---

## 20 CHOSES A CHANGER (avec proposition)

### 1. Nom du package
**Actuel :** `@figma/my-make-file` — nom générique auto-généré par Figma.
**Proposition :** Renommer en `@swimlab/design-system` ou `@swimlab/figma-prototype` dans `package.json`.

### 2. Route par défaut `/` → DreamPlanning
**Actuel :** Un utilisateur non connecté arrive directement sur le planning coach.
**Proposition :** Changer la route `/` vers `/login` (AuthPage) avec redirection post-authentification vers le dashboard correspondant au rôle.

### 3. Pas d'auth middleware
**Actuel :** Toutes les routes sont accessibles sans connexion, aucune protection.
**Proposition :** Ajouter un composant `ProtectedRoute` wrapper qui vérifie l'état d'authentification et redirige vers `/login` si non connecté.

### 4. SplashCoach batterie fixe à 12%
**Actuel :** Le niveau de batterie est hardcodé à 12%, gag statique.
**Proposition :** Rendre la batterie dynamique basée sur l'heure de la journée (100% le matin → 5% le soir) tout en gardant les crises existentielles aléatoires.

### 5. Structure de routes à plat
**Actuel :** 13+ routes au même niveau dans le router, pas de hiérarchie.
**Proposition :** Structurer en sous-routes avec layouts partagés :
```
/coach/* → CoachLayout (planning, workouts, groups, swimmers)
/swimmer/* → SwimmerLayout (planning, workouts, profile, social)
/solo/* → SoloLayout (workouts, profile, challenges)
```

### 6. next-themes en dépendance
**Actuel :** Package `next-themes` (spécifique Next.js) utilisé dans un projet Vite.
**Proposition :** Remplacer par une implémentation custom du dark mode : `ThemeContext` + `localStorage` + `<html class="dark">`. 10 lignes de code suffisent.

### 7. react-popper + @popperjs/core redondants
**Actuel :** Ces packages sont installés alors que Radix UI gère son propre positionnement de popups.
**Proposition :** Supprimer `react-popper` et `@popperjs/core`. Utiliser uniquement les primitives Radix (Popover, Tooltip, DropdownMenu) qui incluent déjà le positionnement.

### 8. react-slick redondant avec embla-carousel
**Actuel :** `react-slick` installé alors que `embla-carousel-react` (plus moderne et léger) est déjà présent.
**Proposition :** Supprimer `react-slick`, migrer vers Embla qui est déjà configuré dans le composant Carousel de shadcn/ui.

### 9. MUI + Emotion = +500KB inutiles
**Actuel :** `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` installés malgré Tailwind + shadcn.
**Proposition :** Supprimer les 4 packages MUI/Emotion. Utiliser `lucide-react` (déjà installé) pour les icônes. Économie : ~500KB sur le bundle.

### 10. Échelle RPE incohérente avec l'app principale
**Actuel :** Échelle RPE 1-10 dans le prototype Figma vs Borg 6-20 dans l'app React Native.
**Proposition :** Aligner sur l'échelle Borg 6-20 utilisée dans l'app principale pour garantir la cohérence des données.

### 11. FAB (Floating Action Button) qui masque du contenu
**Actuel :** Bouton flottant permanent qui recouvre le contenu en bas de page sur mobile.
**Proposition :** Remplacer par un bottom sheet d'actions contextuel ou intégrer les actions dans la navigation bottom tab.

### 12. Calendrier planning trop dense
**Actuel :** Vue semaine avec 7 colonnes = illisible sur tablette et petit écran.
**Proposition :** Ajouter une vue "3 jours" intermédiaire et un mode liste pour les écrans moyens. Ordre : Liste (mobile) → 3 jours (tablette) → Semaine (desktop).

### 13. AuthPage multi-step sans indicateur
**Actuel :** Flow complexe (email → code OTP → profil) sans barre de progression.
**Proposition :** Ajouter un stepper visuel : `Étape 1/3 — Connexion` → `Étape 2/3 — Vérification` → `Étape 3/3 — Profil`.

### 14. Feedback nageur limité au RPE seul
**Actuel :** Post-séance, le nageur ne peut donner qu'une note RPE.
**Proposition :** Enrichir : RPE + fatigue musculaire (échelle) + qualité technique perçue (auto-évaluation 1-5) + zones de douleur (schéma corporel interactif) + commentaire libre.

### 15. Social Feed trop basique
**Actuel :** Feed linéaire simple, pas d'interaction possible.
**Proposition :** Ajouter : réactions emoji (🔥💪👏), commentaires, partage de workouts, bouton "Bravo" rapide, photos de séance, classement hebdo.

### 16. GroupsManager = simple CRUD
**Actuel :** Juste créer/supprimer des groupes et y ajouter des nageurs.
**Proposition :** Enrichir avec : statistiques par groupe (assiduité, progression), comparaison entre groupes, planning collectif, fil de communication interne.

### 17. Profil nageur trop statique
**Actuel :** Dashboard d'achievements avec données fixes.
**Proposition :** Ajouter : graphiques d'évolution temporelle (Recharts déjà installé), objectifs personnels avec jauge, historique de performances filtrable, export PDF du bilan.

### 18. Pas de mode offline
**Actuel :** Aucune gestion de la perte de connexion, l'app est inutilisable sans réseau.
**Proposition :** Implémenter : cache local des dernières données consultées, queue de synchronisation pour les actions offline, bannière de statut réseau.

### 19. Navigation identique coach vs nageur
**Actuel :** Même sidebar pour tous les rôles, contenu filtré dynamiquement.
**Proposition :** Créer 2 layouts distincts : `CoachLayout` (sidebar complète avec gestion groupes/nageurs) et `SwimmerLayout` (navigation simplifiée bottom-tab style).

### 20. Pas d'onboarding
**Actuel :** L'utilisateur arrive directement sur l'app sans aucun guide.
**Proposition :** Ajouter un flow d'onboarding : tour guidé avec tooltips (3-5 écrans), choix du rôle (coach/nageur/solo), configuration initiale (club, niveau, objectifs), import des nageurs pour les coachs.

---

## Résumé

| Catégorie | Score | Commentaire |
|-----------|-------|-------------|
| Design System | ⭐⭐⭐⭐ | Solide, tokens bien structurés, manque documentation |
| Accessibilité | ⭐⭐⭐⭐ | Excellente base ARIA + focus, peut encore progresser |
| Architecture | ⭐⭐⭐ | Bonne structure mais fichiers trop longs, routes à revoir |
| Performance | ⭐⭐⭐ | Pas de lazy loading ni virtualisation, deps lourdes inutiles |
| UX/Fonctionnel | ⭐⭐⭐⭐ | Riche en features, quelques flows à enrichir |
| Code Quality | ⭐⭐⭐ | Bon mais pas de tests, TypeScript partiel |
| Dependencies | ⭐⭐ | Redondances (MUI+shadcn, Slick+Embla, Popper+Radix) |

**Verdict global :** Très bonne base, le design system et l'UX sont bien pensés. Les priorités d'amélioration sont : (1) nettoyer les dépendances redondantes (-500KB), (2) structurer les routes par rôle, (3) ajouter des tests, (4) documenter les guidelines.
