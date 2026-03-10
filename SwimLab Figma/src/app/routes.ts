import { createBrowserRouter } from "react-router";
import { Home } from "./components/home/Home";
import { SwimmerHome } from "./components/home/SwimmerHome";
import { SoloSwimmerHome } from "./components/home/SoloSwimmerHome";
import { WorkoutBuilder } from "./components/workout/WorkoutBuilder";
import { DreamPlanning } from "./components/planning/DreamPlanning";
import { SwimmerPlanning } from "./components/planning/SwimmerPlanning";
import { GroupsManager } from "./components/groups/GroupsManager";
import { AuthPage } from "./components/auth/AuthPage";
import { SocialFeed } from "./components/social/SocialFeed";
import { ProfileDashboardPage } from "./components/profile/ProfileDashboard";
import { SwimmerProfile } from "./components/profile/SwimmerProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DreamPlanning,
  },
  {
    path: "/login",
    Component: AuthPage,
  },
  {
    path: "/swimmer",
    Component: SwimmerHome,
  },
  {
    path: "/coach",
    Component: Home,
  },
  {
    path: "/solo",
    Component: SoloSwimmerHome,
  },
  {
    path: "/social",
    Component: SocialFeed,
  },
  {
    path: "/challenges",
    Component: ProfileDashboardPage,
  },
  {
    path: "/stats",
    Component: ProfileDashboardPage,
  },
  {
    path: "/records",
    Component: ProfileDashboardPage,
  },
  {
    path: "/workout",
    Component: WorkoutBuilder,
  },
  {
    path: "/planning",
    Component: DreamPlanning,
  },
  {
    path: "/planning-nageur",
    Component: SwimmerPlanning,
  },
  {
    path: "/groups",
    Component: GroupsManager,
  },
  {
    path: "/profil-nageur",
    Component: SwimmerProfile,
  }
]);