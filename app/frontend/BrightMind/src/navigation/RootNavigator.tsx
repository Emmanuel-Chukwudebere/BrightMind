// src/navigation/RootNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabBar } from '../components/navigation/TabBar';

// Screen imports
import   HomeScreen   from '../screens/HomeScreen';
import   ExploreScreen   from '../screens/ExploreScreen';
import   LearnScreen   from '../screens/Learn/LearnScreen';
import   ProfileScreen   from '../screens/ProfileScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import   ForgotPasswordEmail   from '../screens/ForgotPasswordEmail';
import   ForgotPasswordEmailSent   from '../screens/ForgotPasswordEmailSent';
import   ForgotPasswordReset   from '../screens/ForgotPasswordReset';
import   ForgotPasswordSuccess   from '../screens/ForgotPasswordSuccess';
import   EditProfileScreen   from '../screens/EditProfileScreen';
import { ProfileImageScreen } from '../screens/ProfileImageScreen';
import   NotificationSettingsScreen   from '../screens/NotificationSettingsScreen';
import   NotificationScreen   from '../screens/NotificationScreen';
import   OfflineContentScreen   from '../screens/OfflineContentScreen';
import { LearningLevelScreen } from '../screens/LearningLevelScreen';
import   LessonContentScreen   from '../screens/LessonContentScreen';
import   QuizScreen  from '../screens/QuizScreen';
import { StreamingScreen } from '../screens/StreamingScreen';
import   TopicSummaryScreen   from '../screens/TopicSummaryScreen';

// Navigation Types
import { RootStackParamList, TabNavigatorParamList } from './types';

// Theme
import { navigationTheme } from '../constants/navigationTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabNavigatorParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <TabBar {...props} />}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explore'
        }}
      />
      <Tab.Screen 
        name="Learn" 
        component={LearnScreen}
        options={{
          tabBarLabel: 'Learn'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#fff' },
        }}
      >
        {/* Initial Screens */}
        <Stack.Group screenOptions={{ gestureEnabled: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Group>

        {/* Auth Stack */}
        <Stack.Group screenOptions={{ 
          headerShown: true,
          headerBackTitle: '',
          headerTitleAlign: 'center',
          animation: 'slide_from_right'
        }}>
          <Stack.Screen 
            name="SignIn" 
            component={SignInScreen}
            options={{ headerTitle: 'Sign In' }}
          />
          <Stack.Screen 
            name="SignUp" 
            component={SignUpScreen}
            options={{ headerTitle: 'Create Account' }}
          />
          <Stack.Screen 
            name="ForgotPasswordEmail" 
            component={ForgotPasswordEmail}
            options={{ headerTitle: 'Reset Password' }}
          />
          <Stack.Screen 
            name="ForgotPasswordEmailSent" 
            component={ForgotPasswordEmailSent}
            options={{ headerTitle: 'Check Your Email' }}
          />
          <Stack.Screen 
            name="ForgotPasswordReset" 
            component={ForgotPasswordReset}
            options={{ headerTitle: 'New Password' }}
          />
          <Stack.Screen 
            name="ForgotPasswordSuccess" 
            component={ForgotPasswordSuccess}
            options={{ headerTitle: 'Success' }}
          />
        </Stack.Group>

        {/* Main Tab Navigator */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />

        {/* Learning & Content Screens */}
        <Stack.Group screenOptions={{ 
          headerShown: true,
          headerBackTitle: '',
          headerTitleAlign: 'center',
          animation: 'slide_from_bottom'
        }}>
          <Stack.Screen 
            name="LearningLevel" 
            component={LearningLevelScreen}
            options={{ headerTitle: 'Choose Level' }}
          />
          <Stack.Screen 
            name="LessonContent" 
            component={LessonContentScreen}
            options={{ headerTitle: 'Lesson' }}
          />
          <Stack.Screen 
            name="Quiz" 
            component={QuizScreen}
            options={{ headerTitle: 'Quiz' }}
          />
          <Stack.Screen 
            name="Streaming" 
            component={StreamingScreen}
            options={{ headerTitle: 'Live Session' }}
          />
          <Stack.Screen 
            name="TopicSummary" 
            component={TopicSummaryScreen}
            options={{ headerTitle: 'Summary' }}
          />
          <Stack.Screen 
            name="OfflineContent" 
            component={OfflineContentScreen}
            options={{ headerTitle: 'Offline Content' }}
          />
        </Stack.Group>

        {/* Profile & Settings Screens */}
        <Stack.Group screenOptions={{ 
          headerShown: true,
          headerBackTitle: '',
          headerTitleAlign: 'center',
          animation: 'slide_from_right'
        }}>
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ headerTitle: 'Edit Profile' }}
          />
          <Stack.Screen 
            name="ProfileImage" 
            component={ProfileImageScreen}
            options={{ headerTitle: 'Profile Picture' }}
          />
          <Stack.Screen 
            name="NotificationSettings" 
            component={NotificationSettingsScreen}
            options={{ headerTitle: 'Notification Settings' }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationScreen}
            options={{ headerTitle: 'Notifications' }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}