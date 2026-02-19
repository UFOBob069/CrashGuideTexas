// ============================================================
// CrashGuide Texas - Main App Entry Point
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

// Error Boundary to catch and display runtime errors (prevents blank screen)
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <ScrollView contentContainerStyle={errorStyles.content}>
            <Text style={errorStyles.title}>Something went wrong</Text>
            <Text style={errorStyles.message}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            {Platform.OS === 'web' && (
              <Text style={errorStyles.hint}>
                Check browser console for more details.
              </Text>
            )}
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1A2F', justifyContent: 'center' },
  content: { padding: 32, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#EF4444', marginBottom: 16 },
  message: { fontSize: 15, color: '#F8FAFC', lineHeight: 22, textAlign: 'center', marginBottom: 16 },
  hint: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },
});

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AppProvider>
    </ErrorBoundary>
  );
}
