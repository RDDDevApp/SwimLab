import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
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
import { CoachTabParamList, CoachStackParamList } from '../types';

const Tab = createBottomTabNavigator<CoachTabParamList>();
const Stack = createNativeStackNavigator<CoachStackParamList>();

function CoachTabs() {
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
    </Stack.Navigator>
  );
}
