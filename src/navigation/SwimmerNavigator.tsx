import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/swimmer/DashboardScreen';
import CalendarScreen from '../screens/swimmer/CalendarScreen';
import SwimmerStatsScreen from '../screens/swimmer/SwimmerStatsScreen';
import ProfileScreen from '../screens/swimmer/ProfileScreen';
import FeedbackScreen from '../screens/swimmer/FeedbackScreen';
import WorkoutDetailScreen from '../screens/swimmer/WorkoutDetailScreen';
import SwimmerHistoryScreen from '../screens/swimmer/SwimmerHistoryScreen';
import SessionDetailModal from '../screens/swimmer/SessionDetailModal';
import { SwimmerTabParamList, SwimmerStackParamList } from '../types';

const Tab = createBottomTabNavigator<SwimmerTabParamList>();
const Stack = createNativeStackNavigator<SwimmerStackParamList>();

function SwimmerTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Stats':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: 'Entrainements' }}
      />
      <Tab.Screen
        name="Stats"
        component={SwimmerStatsScreen}
        options={{ tabBarLabel: 'Stats' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
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
