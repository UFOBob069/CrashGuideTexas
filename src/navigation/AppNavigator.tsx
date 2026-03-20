// ============================================================
// CrashGuide Texas - App Navigation
// ============================================================

import React, { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useAutoSave } from '../hooks/useAutoSave';
import { useApp } from '../context/AppContext';
import { getAccidentList, getAccident, getMessages, createAccident } from '../services/accidentService';

import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen, { ONBOARDING_KEY } from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import AccidentsScreen from '../screens/AccidentsScreen';
import ChatScreen from '../screens/ChatScreen';
import DocumentScreen from '../screens/DocumentScreen';
import OtherDriverScreen from '../screens/OtherDriverScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import ConnectLawyerScreen from '../screens/ConnectLawyerScreen';
import ContactFormScreen from '../screens/ContactFormScreen';
import PrivacyScreen from '../screens/PrivacyScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> | undefined =
  Platform.OS === 'web'
    ? {
        prefixes: ['/'],
        config: {
          screens: {
            Auth: 'auth',
            Onboarding: 'onboarding',
            Home: '',
            Accidents: 'reports',
            Chat: 'chat',
            Document: 'document',
            OtherDriver: 'other-driver',
            Checklist: 'checklist',
            ConnectLawyer: 'connect',
            ContactForm: 'contact',
            Privacy: 'privacy',
          },
        },
      }
    : undefined;

// ── Inner navigator — rendered after auth is confirmed ────

function AppStack() {
  useAutoSave();

  const { user } = useAuth();
  const { state, dispatch } = useApp();
  const [initialRoute, setInitialRoute] =
    useState<'Onboarding' | 'Home' | null>(null);

  useEffect(() => {
    if (!user) return;

    async function bootstrap() {
      try {
        // Load accident list for the user
        const list = await getAccidentList(user!.uid);
        dispatch({ type: 'SET_ACCIDENTS', payload: list });

        if (list.length > 0 && !state.currentAccidentId) {
          // Load most recent accident
          const most = list[0];
          const result = await getAccident(user!.uid, most.id);
          if (result) {
            const messages = await getMessages(user!.uid, most.id);
            dispatch({
              type: 'LOAD_ACCIDENT',
              payload: {
                report: result.report,
                checklist: result.checklist,
                chatMessages: messages,
                accidentId: most.id,
              },
            });
          }
        } else if (list.length === 0 && !state.currentAccidentId) {
          // First time: create initial accident in Firestore
          const id = await createAccident(user!.uid, state.report, state.checklist);
          dispatch({ type: 'SET_CURRENT_ACCIDENT_ID', payload: id });
        }
      } catch (e) {
        console.warn('Bootstrap error:', e);
      } finally {
        const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
        setInitialRoute(seen === 'true' ? 'Home' : 'Onboarding');
      }
    }

    bootstrap();
  }, [user]);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Accidents" component={AccidentsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Document" component={DocumentScreen} />
      <Stack.Screen name="OtherDriver" component={OtherDriverScreen} />
      <Stack.Screen name="Checklist" component={ChecklistScreen} />
      <Stack.Screen name="ConnectLawyer" component={ConnectLawyerScreen} />
      <Stack.Screen name="ContactForm" component={ContactFormScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
    </Stack.Navigator>
  );
}

// ── Root navigator — shows Auth or App based on login state ─

export default function AppNavigator() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      {user ? (
        <AppStack />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
