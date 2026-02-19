// ============================================================
// CrashGuide Texas - Home Screen
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>CrashGuide</Text>
          <Text style={styles.logoSub}>TEXAS</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroText}>
            Were you just in an accident?
          </Text>
          <Text style={styles.heroSubtext}>
            Let's get you through this, step by step.
          </Text>
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          style={styles.primaryCTA}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Chat', { mode: 'urgent' })}
        >
          <Text style={styles.primaryCTAEmoji}>🆘</Text>
          <Text style={styles.primaryCTAText}>Get Help Now</Text>
          <Text style={styles.primaryCTASubtext}>
            Step-by-step guidance for what to do right now
          </Text>
        </TouchableOpacity>

        {/* Secondary CTAs */}
        <View style={styles.secondaryCTARow}>
          <TouchableOpacity
            style={styles.secondaryCTA}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Document')}
          >
            <Text style={styles.secondaryCTAEmoji}>📷</Text>
            <Text style={styles.secondaryCTATitle}>Document</Text>
            <Text style={styles.secondaryCTASubtext}>the Accident</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryCTA}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Checklist')}
          >
            <Text style={styles.secondaryCTAEmoji}>📋</Text>
            <Text style={styles.secondaryCTATitle}>Accident</Text>
            <Text style={styles.secondaryCTASubtext}>Checklist</Text>
          </TouchableOpacity>
        </View>

        {/* Lawyer CTA */}
        <TouchableOpacity
          style={styles.lawyerCTA}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ConnectLawyer', {})}
        >
          <Text style={styles.lawyerCTAEmoji}>⚖️</Text>
          <View style={styles.lawyerCTATextContainer}>
            <Text style={styles.lawyerCTATitle}>Talk to a Texas Injury Lawyer</Text>
            <Text style={styles.lawyerCTASubtext}>
              Free consultation · No obligation
            </Text>
          </View>
        </TouchableOpacity>

        {/* Trust Signals */}
        <View style={styles.trustSection}>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>🔒</Text>
            <Text style={styles.trustText}>Free, private, and designed for Texas</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>ℹ️</Text>
            <Text style={styles.trustText}>General info only — not legal advice</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>⭐</Text>
            <Text style={styles.trustText}>Trusted by Texans</Text>
          </View>
        </View>

        {/* Privacy Link */}
        <TouchableOpacity
          style={styles.privacyLink}
          onPress={() => navigation.navigate('Privacy')}
        >
          <Text style={styles.privacyText}>Privacy Policy & Terms</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  logo: {
    fontSize: FONT_SIZES.hero,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.accent,
    letterSpacing: 4,
    marginTop: -2,
  },
  heroSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  heroText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  heroSubtext: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  primaryCTA: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.emergency,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  primaryCTAEmoji: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  primaryCTAText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnPrimary,
  },
  primaryCTASubtext: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: SPACING.xs,
  },
  secondaryCTARow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  secondaryCTA: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  secondaryCTAEmoji: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  secondaryCTATitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  secondaryCTASubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lawyerCTA: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  lawyerCTAEmoji: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  lawyerCTATextContainer: {
    flex: 1,
  },
  lawyerCTATitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textOnPrimary,
  },
  lawyerCTASubtext: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  trustSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  trustIcon: {
    fontSize: 16,
  },
  trustText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  privacyLink: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginTop: SPACING.md,
  },
  privacyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});
