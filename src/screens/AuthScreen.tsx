// ============================================================
// CrashGuide Texas - Auth Screen
// Primary: Google / Apple  |  Fallback: Email + Password
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

WebBrowser.maybeCompleteAuthSession();

type EmailMode = 'signin' | 'signup' | 'reset';

export default function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth();

  // OAuth
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  // Email fallback
  const [showEmail, setShowEmail] = useState(false);
  const [emailMode, setEmailMode] = useState<EmailMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // ── Google ───────────────────────────────────────────────
  const [, response, promptGoogleAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token, access_token);
      signInWithCredential(auth, credential).catch((e) => {
        setOauthLoading(null);
        Alert.alert('Google Sign-In Error', friendlyError(e.code));
      });
    } else if (response?.type === 'error' || response?.type === 'dismiss') {
      setOauthLoading(null);
    }
  }, [response]);

  async function handleGoogle() {
    setOauthLoading('google');
    await promptGoogleAsync();
  }

  // ── Apple ────────────────────────────────────────────────
  async function handleApple() {
    setOauthLoading('apple');
    try {
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      const provider = new OAuthProvider('apple.com');
      const firebaseCredential = provider.credential({
        idToken: appleCredential.identityToken!,
        rawNonce,
      });
      await signInWithCredential(auth, firebaseCredential);
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Sign-In Error', 'Sign in with Apple failed. Please try again.');
      }
    } finally {
      setOauthLoading(null);
    }
  }

  // ── Email ────────────────────────────────────────────────
  async function handleEmailSubmit() {
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed) { Alert.alert('Required', 'Please enter your email.'); return; }

    if (emailMode === 'reset') {
      setEmailLoading(true);
      try {
        await resetPassword(emailTrimmed);
        Alert.alert('Email Sent', 'Check your inbox for a password reset link.');
        setEmailMode('signin');
      } catch (e: any) {
        Alert.alert('Error', friendlyError(e.code));
      } finally { setEmailLoading(false); }
      return;
    }

    if (!password) { Alert.alert('Required', 'Please enter your password.'); return; }
    if (emailMode === 'signup' && !name.trim()) { Alert.alert('Required', 'Please enter your name.'); return; }
    if (emailMode === 'signup' && password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return;
    }

    setEmailLoading(true);
    try {
      if (emailMode === 'signin') {
        await signIn(emailTrimmed, password);
      } else {
        await signUp(emailTrimmed, password, name.trim());
      }
    } catch (e: any) {
      Alert.alert('Error', friendlyError(e.code));
    } finally {
      setEmailLoading(false);
    }
  }

  const isReset = emailMode === 'reset';
  const isSignUp = emailMode === 'signup';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoMark}>
              <View style={styles.logoBar} />
              <View style={styles.logoBarThin} />
            </View>
            <View>
              <Text style={styles.logo}>CrashGuide</Text>
              <Text style={styles.logoSub}>TEXAS</Text>
            </View>
          </View>

          <Text style={styles.heading}>Your accident reports,{'\n'}saved securely.</Text>
          <Text style={styles.subheading}>
            Sign in to keep your reports and evidence backed up across devices.
          </Text>

          {/* ── Social buttons ── */}
          {!showEmail && (
            <View style={styles.socialButtons}>
              {/* Google */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogle}
                disabled={!!oauthLoading}
                activeOpacity={0.85}
              >
                {oauthLoading === 'google' ? (
                  <ActivityIndicator color="#1a1a1a" />
                ) : (
                  <>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.googleText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Apple — iOS only */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.appleButton}
                  onPress={handleApple}
                  disabled={!!oauthLoading}
                  activeOpacity={0.85}
                >
                  {oauthLoading === 'apple' ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Text style={styles.appleIcon}></Text>
                      <Text style={styles.appleText}>Continue with Apple</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Email fallback */}
              <TouchableOpacity
                style={styles.emailButton}
                onPress={() => setShowEmail(true)}
              >
                <Text style={styles.emailButtonText}>Continue with Email</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Email form ── */}
          {showEmail && (
            <View style={styles.emailForm}>
              <TouchableOpacity
                style={styles.backToSocial}
                onPress={() => { setShowEmail(false); setEmailMode('signin'); }}
              >
                <Text style={styles.backToSocialText}>← Other sign-in options</Text>
              </TouchableOpacity>

              <Text style={styles.emailFormTitle}>
                {isReset ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In with Email'}
              </Text>

              <View style={styles.form}>
                {isSignUp && (
                  <View style={styles.fieldWrap}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Jane Smith"
                      placeholderTextColor={COLORS.textMuted}
                      autoCapitalize="words"
                    />
                  </View>
                )}
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {!isReset && (
                  <View style={styles.fieldWrap}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
                      placeholderTextColor={COLORS.textMuted}
                      secureTextEntry
                    />
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleEmailSubmit}
                disabled={emailLoading}
              >
                {emailLoading
                  ? <ActivityIndicator color={COLORS.textOnAccent} />
                  : <Text style={styles.submitText}>
                      {isReset ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                }
              </TouchableOpacity>

              {!isReset && (
                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={() => setEmailMode(isSignUp ? 'signin' : 'signup')}
                >
                  <Text style={styles.toggleText}>
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <Text style={styles.toggleLink}>
                      {isSignUp ? 'Sign In' : 'Create one'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}

              {!isReset && !isSignUp && (
                <TouchableOpacity onPress={() => setEmailMode('reset')}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              )}

              {isReset && (
                <TouchableOpacity onPress={() => setEmailMode('signin')}>
                  <Text style={styles.forgotText}>← Back to Sign In</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text style={styles.disclaimer}>
            General information only — not legal advice
          </Text>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    paddingBottom: SPACING.xxl,
  },

  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
    marginBottom: SPACING.xl + SPACING.lg,
  },
  logoMark: { flexDirection: 'row', gap: 3 },
  logoBar: { width: 4, height: 38, backgroundColor: COLORS.accent, borderRadius: 2 },
  logoBarThin: { width: 2, height: 38, backgroundColor: 'rgba(245,166,35,0.3)', borderRadius: 1 },
  logo: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnDark,
    letterSpacing: 0.3,
  },
  logoSub: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.heavy,
    color: COLORS.accent,
    letterSpacing: 6,
    marginTop: -1,
  },

  heading: {
    fontSize: FONT_SIZES.display,
    fontWeight: FONT_WEIGHTS.heavy,
    color: COLORS.textOnDark,
    lineHeight: 42,
    marginBottom: SPACING.sm,
  },
  subheading: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textOnDarkMuted,
    lineHeight: 24,
    marginBottom: SPACING.xl + SPACING.md,
  },

  // ── Social ──
  socialButtons: { gap: SPACING.md },

  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md + 4,
    ...SHADOWS.md,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.heavy,
    color: '#4285F4',
    fontStyle: 'italic',
  },
  googleText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#1a1a1a',
  },

  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    backgroundColor: '#000000',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md + 4,
    ...SHADOWS.md,
  },
  appleIcon: {
    fontSize: 22,
    color: '#ffffff',
    lineHeight: 26,
  },
  appleText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#ffffff',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.xs,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  dividerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textOnDarkMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },

  emailButton: {
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md + 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  emailButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textOnDark,
  },

  // ── Email form ──
  emailForm: { gap: SPACING.md },
  backToSocial: { paddingVertical: SPACING.xs },
  backToSocialText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textOnDarkMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  emailFormTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnDark,
    marginBottom: SPACING.sm,
  },
  form: { gap: SPACING.md, marginBottom: SPACING.sm },
  fieldWrap: {},
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textOnDarkMuted,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textOnDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  submitButton: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md + 4,
    alignItems: 'center',
    ...SHADOWS.glow(COLORS.accent, 0.3),
  },
  submitText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnAccent,
  },

  toggleRow: { alignItems: 'center' },
  toggleText: { fontSize: FONT_SIZES.md, color: COLORS.textOnDarkMuted },
  toggleLink: { color: COLORS.accent, fontWeight: FONT_WEIGHTS.semibold },
  forgotText: {
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.textOnDarkMuted,
    paddingVertical: SPACING.xs,
  },

  disclaimer: {
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.25)',
    marginTop: SPACING.xl,
  },
});
