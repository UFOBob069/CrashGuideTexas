// ============================================================
// CrashGuide Texas - Main App Entry Point
// ============================================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Inject desktop phone-frame styles on web
function useDesktopAppFrame() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const style = document.createElement('style');
    style.id = 'desktop-app-frame';
    style.textContent = `
      @media (min-width: 481px) {
        html, body {
          background: #0f172a;
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(30, 64, 175, 0.25) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
        }
        #root {
          max-width: 430px;
          margin: 0 auto;
          height: 100%;
          border-left: 1px solid rgba(255,255,255,0.08);
          border-right: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 0 80px rgba(30, 64, 175, 0.3),
            0 0 0 1px rgba(255,255,255,0.05);
          overflow: hidden;
          position: relative;
        }
      }
      @media (min-width: 600px) {
        #root {
          margin-top: 24px;
          margin-bottom: 24px;
          height: calc(100% - 48px);
          border-radius: 32px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        /* Subtle phone notch indicator */
        #root::before {
          content: '';
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 5px;
          background: rgba(255,255,255,0.12);
          border-radius: 3px;
          z-index: 9999;
          pointer-events: none;
        }
      }
    `;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);
}

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
  container: { flex: 1, backgroundColor: '#1E40AF', justifyContent: 'center' },
  content: { padding: 32, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#EF4444', marginBottom: 16 },
  message: { fontSize: 15, color: '#F8FAFC', lineHeight: 22, textAlign: 'center', marginBottom: 16 },
  hint: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },
});

export default function App() {
  useDesktopAppFrame();

  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
