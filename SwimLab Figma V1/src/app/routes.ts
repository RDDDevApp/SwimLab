import { createBrowserRouter } from "react-router";
import React, { Suspense } from "react";
import { Navigate } from "react-router";

const AuthPage = React.lazy(() => import("./components/auth/AuthPage").then(m => ({ default: m.AuthPage })));
const Home = React.lazy(() => import("./components/home/Home").then(m => ({ default: m.Home })));
const SwimmerHome = React.lazy(() => import("./components/home/SwimmerHome").then(m => ({ default: m.SwimmerHome })));
const SoloSwimmerHome = React.lazy(() => import("./components/home/SoloSwimmerHome").then(m => ({ default: m.SoloSwimmerHome })));
const WorkoutBuilder = React.lazy(() => import("./components/workout/WorkoutBuilder").then(m => ({ default: m.WorkoutBuilder })));
const DreamPlanning = React.lazy(() => import("./components/planning/DreamPlanning").then(m => ({ default: m.DreamPlanning })));
const SwimmerPlanning = React.lazy(() => import("./components/planning/SwimmerPlanning").then(m => ({ default: m.SwimmerPlanning })));
const GroupsManager = React.lazy(() => import("./components/groups/GroupsManager").then(m => ({ default: m.GroupsManager })));
const SocialFeed = React.lazy(() => import("./components/social/SocialFeed").then(m => ({ default: m.SocialFeed })));
const ProfileDashboardPage = React.lazy(() => import("./components/profile/ProfileDashboard").then(m => ({ default: m.ProfileDashboardPage })));
const SwimmerProfile = React.lazy(() => import("./components/profile/SwimmerProfile").then(m => ({ default: m.SwimmerProfile })));

const PageLoader = () => React.createElement('div', { className: "min-h-screen w-full flex items-center justify-center bg-slate-50" },
  React.createElement('div', { className: "w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" })
);

const withSuspense = (Component: React.ComponentType) => 
  React.createElement(Suspense, { fallback: React.createElement(PageLoader) }, React.createElement(Component));

export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(AuthPage),
  },
  {
    path: "/login",
    element: withSuspense(AuthPage),
  },
  {
    path: "/swimmer",
    element: withSuspense(SwimmerHome),
  },
  {
    path: "/coach",
    element: withSuspense(Home),
  },
  {
    path: "/solo",
    element: withSuspense(SoloSwimmerHome),
  },
  {
    path: "/social",
    element: withSuspense(SocialFeed),
  },
  {
    path: "/challenges",
    element: withSuspense(ProfileDashboardPage),
  },
  {
    path: "/stats",
    element: withSuspense(ProfileDashboardPage),
  },
  {
    path: "/records",
    element: withSuspense(ProfileDashboardPage),
  },
  {
    path: "/profile",
    element: withSuspense(ProfileDashboardPage),
  },
  {
    path: "/workout",
    element: withSuspense(WorkoutBuilder),
  },
  {
    path: "/planning",
    element: withSuspense(DreamPlanning),
  },
  {
    path: "/planning-nageur",
    element: React.createElement(Navigate, { to: "/swimmer-planning", replace: true })
  },
  {
    path: "/swimmer-planning",
    element: withSuspense(SwimmerPlanning),
  },
  {
    path: "/groups",
    element: withSuspense(GroupsManager),
  },
  {
    path: "/swimmer-profile",
    element: withSuspense(SwimmerProfile),
  }
]);