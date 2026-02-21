import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/swimmer/DashboardScreen';
import CalendarScreen from '../screens/swimmer/CalendarScreen';
import SwimmerStatsScreen from '../screens/swimmer/SwimmerStatsScreen';
import ProfileScreen from '../screens/swimmer/ProfileScreen';
import FeedbackScreen from '../screens/swimmer/FeedbackScreen';
import WorkoutDetailScreen from '../screens/swimmer/WorkoutDetailScreen';
import SwimmerHistoryScreen from '../screens/swimmer/SwimmerHistoryScreen';
import SessionDetailModal from '../screens/swimmer/SessionDetailModal';
import GlassTabBar from '../components/GlassTabBar';
import { SwimmerTabParamList, SwimmerStackParamList } from '../types';

const Tab = createBottomTabNavigator<SwimmerTabParamList>();
const Stack = createNativeStackNavigator<SwimmerStackParamList>();

const SWIMMER_TABS = [
  { name: 'Dashboard', icon: 'home', label: 'Accueil' },
  { name: 'Calendar', icon: 'calendar', label: 'Entrainements' },
  { name: 'Stats', icon: 'stats-chart', label: 'Stats' },
  { name: 'Profile', icon: 'person', label: 'Profil' },
];

function SwimmerTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} tabs={SWIMMER_TABS} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Stats" component={SwimmerStatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function SwimmerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SwimmerTabs" component={SwimmerTabs} />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailModal}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="SwimmerHistory" component={SwimmerHistoryScreen} />
    </Stack.Navigator>
  );
}
