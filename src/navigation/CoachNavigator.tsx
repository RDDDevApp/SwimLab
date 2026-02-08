import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/coach/DashboardScreen';
import CalendarScreen from '../screens/coach/CalendarScreen';
import WorkoutsScreen from '../screens/coach/WorkoutsScreen';
import GroupsScreen from '../screens/coach/GroupsScreen';
import ProfileScreen from '../screens/coach/ProfileScreen';
import { CoachTabParamList } from '../types';

const Tab = createBottomTabNavigator<CoachTabParamList>();

export default function CoachNavigator() {
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
            case 'Workouts':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            case 'Groups':
              iconName = focused ? 'people' : 'people-outline';
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
        options={{ tabBarLabel: 'Calendrier' }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{ tabBarLabel: 'Seances' }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{ tabBarLabel: 'Groupes' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}
