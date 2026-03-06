import { createBrowserRouter } from "react-router";
import { Dashboard } from "./components/dashboard/Dashboard";
import { Home } from "./components/home/Home";
import { SwimmerHome } from "./components/home/SwimmerHome";
import { SoloSwimmerHome } from "./components/home/SoloSwimmerHome";
import { WorkoutBuilder } from "./components/workout/WorkoutBuilder";

export const router = createBrowserRouter([
  {
    path: "/",
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
    path: "/stats",
    Component: Dashboard,
  },
  {
    path: "/workout",
    Component: WorkoutBuilder,
  },
]);