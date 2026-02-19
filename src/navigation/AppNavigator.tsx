// ============================================================
// CrashGuide Texas - App Navigation
// ============================================================

import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import DocumentScreen from '../screens/DocumentScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import ConnectLawyerScreen from '../screens/ConnectLawyerScreen';
import ContactFormScreen from '../screens/ContactFormScreen';
import PrivacyScreen from '../screens/PrivacyScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Web linking config so "/" maps to the Home screen
const linking: LinkingOptions<RootStackParamList> | undefined =
  Platform.OS === 'web'
    ? {
        prefixes: ['/'],
        config: {
          screens: {
            Home: '',
            Chat: 'chat',
            Document: 'document',
            Checklist: 'checklist',
            ConnectLawyer: 'connect',
            ContactForm: 'contact',
            Privacy: 'privacy',
          },
        },
      }
    : undefined;

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Document" component={DocumentScreen} />
        <Stack.Screen name="Checklist" component={ChecklistScreen} />
        <Stack.Screen name="ConnectLawyer" component={ConnectLawyerScreen} />
        <Stack.Screen name="ContactForm" component={ContactFormScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
