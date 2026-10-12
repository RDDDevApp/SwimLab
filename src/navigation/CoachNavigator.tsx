import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/coach/DashboardScreen';
import CalendarScreen from '../screens/coach/CalendarScreen';
import WorkoutsScreen from '../screens/coach/WorkoutsScreen';
import GroupsScreen from '../screens/coach/GroupsScreen';
import ProfileScreen from '../screens/coach/ProfileScreen';
import CreateGroupScreen from '../screens/coach/CreateGroupScreen';
import SlotsScreen from '../screens/coach/SlotsScreen';
import CreateSlotScreen from '../screens/coach/CreateSlotScreen';
import CreateWorkoutScreen from '../screens/coach/CreateWorkoutScreen';
import AssignWorkoutScreen from '../screens/coach/AssignWorkoutScreen';
import AttendanceScreen from '../screens/coach/AttendanceScreen';
import GroupDetailScreen from '../screens/coach/GroupDetailScreen';
import WorkoutStatsScreen from '../screens/coach/WorkoutStatsScreen';
import CoachStatsScreen from '../screens/coach/CoachStatsScreen';
import WorkoutDetailScreen from '../screens/coach/WorkoutDetailScreen';
import BlockLibraryScreen from '../screens/coach/BlockLibraryScreen';
import WorkoutHistoryScreen from '../screens/coach/WorkoutHistoryScreen';
import SessionDetailModal from '../screens/coach/SessionDetailModal';
import GenerateWorkoutScreen from '../screens/shared/GenerateWorkoutScreen';
import UIKitScreen from '../screens/dev/UIKitScreen';
import GlassTabBar from '../components/GlassTabBar';
import { CoachTabParamList, CoachStackParamList } from '../types';

const Tab = createBottomTabNavigator<CoachTabParamList>();
const Stack = createNativeStackNavigator<CoachStackParamList>();

const COACH_TABS = [
  { name: 'Dashboard', icon: 'home', label: 'Accueil' },
  { name: 'Calendar', icon: 'calendar', label: 'Calendrier' },
  { name: 'Workouts', icon: 'fitness', label: 'Séances' },
  { name: 'Groups', icon: 'people', label: 'Groupes' },
  { name: 'Profile', icon: 'person', label: 'Profil' },
];

function CoachTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} tabs={COACH_TABS} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function CoachNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CoachTabs" component={CoachTabs} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="Slots" component={SlotsScreen} />
      <Stack.Screen name="CreateSlot" component={CreateSlotScreen} />
      <Stack.Screen name="CreateWorkout" component={CreateWorkoutScreen} />
      <Stack.Screen name="AssignWorkout" component={AssignWorkoutScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="WorkoutStats" component={WorkoutStatsScreen} />
      <Stack.Screen name="CoachStats" component={CoachStatsScreen} />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailModal}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="BlockLibrary" component={BlockLibraryScreen} />
      <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
      <Stack.Screen name="GenerateWorkout" component={GenerateWorkoutScreen} />
      {__DEV__ && <Stack.Screen name="UIKit" component={UIKitScreen} />}
    </Stack.Navigator>
  );
}
