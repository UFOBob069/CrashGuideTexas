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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark Hero Section */}
        <View style={styles.heroContainer}>
          <SafeAreaView>
            <View style={styles.heroInner}>
              {/* Logo */}
              <View style={styles.logoRow}>
                <View style={styles.logoAccent} />
                <View>
                  <Text style={styles.logo}>CrashGuide</Text>
                  <Text style={styles.logoSub}>TEXAS</Text>
                </View>
              </View>

              {/* Hero Text */}
              <Text style={styles.heroText}>
                Were you just{'\n'}in an accident?
              </Text>
              <Text style={styles.heroSubtext}>
                Let's get you through this, step by step.
              </Text>

              {/* Primary CTA - Emergency */}
              <TouchableOpacity
                style={styles.primaryCTA}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Chat', { mode: 'urgent' })}
              >
                <View style={styles.primaryCTAInner}>
                  <View style={styles.primaryCTAIconWrap}>
                    <Text style={styles.primaryCTAEmoji}>🆘</Text>
                  </View>
                  <View style={styles.primaryCTAContent}>
                    <Text style={styles.primaryCTAText}>Get Help Now</Text>
                    <Text style={styles.primaryCTASubtext}>
                      Step-by-step guidance for what to do right now
                    </Text>
                  </View>
                  <Text style={styles.primaryCTAArrow}>›</Text>
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Content Section - Light Background */}
        <View style={styles.contentSection}>
          {/* Secondary CTAs */}
          <View style={styles.secondaryCTARow}>
            <TouchableOpacity
              style={styles.secondaryCTA}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Document')}
            >
              <View style={[styles.secondaryCTAIconWrap, { backgroundColor: COLORS.cardBlue }]}>
                <Text style={styles.secondaryCTAEmoji}>📷</Text>
              </View>
              <Text style={styles.secondaryCTATitle}>Document</Text>
              <Text style={styles.secondaryCTASubtext}>the Accident</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCTA}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Checklist')}
            >
              <View style={[styles.secondaryCTAIconWrap, { backgroundColor: COLORS.cardAmber }]}>
                <Text style={styles.secondaryCTAEmoji}>📋</Text>
              </View>
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
            <View style={styles.lawyerCTALeft}>
              <View style={styles.lawyerIconWrap}>
                <Text style={styles.lawyerCTAEmoji}>⚖️</Text>
              </View>
            </View>
            <View style={styles.lawyerCTATextContainer}>
              <Text style={styles.lawyerCTATitle}>Talk to a Texas Injury Lawyer</Text>
              <Text style={styles.lawyerCTASubtext}>
                Free consultation · No obligation
              </Text>
            </View>
            <Text style={styles.lawyerCTAArrow}>›</Text>
          </TouchableOpacity>

          {/* Trust Signals */}
          <View style={styles.trustSection}>
            <View style={styles.trustRow}>
              <View style={styles.trustItem}>
                <View style={styles.trustIconWrap}>
                  <Text style={styles.trustIcon}>🔒</Text>
                </View>
                <Text style={styles.trustText}>Private &{'\n'}Secure</Text>
              </View>
              <View style={styles.trustDivider} />
              <View style={styles.trustItem}>
                <View style={styles.trustIconWrap}>
                  <Text style={styles.trustIcon}>🏛️</Text>
                </View>
                <Text style={styles.trustText}>Built for{'\n'}Texas</Text>
              </View>
              <View style={styles.trustDivider} />
              <View style={styles.trustItem}>
                <View style={styles.trustIconWrap}>
                  <Text style={styles.trustIcon}>⭐</Text>
                </View>
                <Text style={styles.trustText}>100%{'\n'}Free</Text>
              </View>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerWrap}>
            <Text style={styles.disclaimerText}>
              General info only — not legal advice
            </Text>
          </View>

          {/* Privacy Link */}
          <TouchableOpacity
            style={styles.privacyLink}
            onPress={() => navigation.navigate('Privacy')}
          >
            <Text style={styles.privacyText}>Privacy Policy & Terms</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ── Hero Section (Dark) ──
  heroContainer: {
    backgroundColor: COLORS.primary,
    paddingBottom: SPACING.xl,
  },
  heroInner: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  logoAccent: {
    width: 4,
    height: 36,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  logo: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnDark,
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.heavy,
    color: COLORS.accent,
    letterSpacing: 6,
    marginTop: -2,
  },
  heroText: {
    fontSize: FONT_SIZES.display,
    fontWeight: FONT_WEIGHTS.heavy,
    color: COLORS.textOnDark,
    lineHeight: 42,
    marginBottom: SPACING.sm,
  },
  heroSubtext: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textOnDarkMuted,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },

  // ── Primary CTA ──
  primaryCTA: {
    backgroundColor: COLORS.emergency,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  primaryCTAInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  primaryCTAIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryCTAEmoji: {
    fontSize: 24,
  },
  primaryCTAContent: {
    flex: 1,
  },
  primaryCTAText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnPrimary,
  },
  primaryCTASubtext: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  primaryCTAArrow: {
    fontSize: 28,
    fontWeight: FONT_WEIGHTS.regular,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // ── Content Section (Light) ──
  contentSection: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // ── Secondary CTAs ──
  secondaryCTARow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  secondaryCTA: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  secondaryCTAIconWrap: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  secondaryCTAEmoji: {
    fontSize: 28,
  },
  secondaryCTATitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  secondaryCTASubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // ── Lawyer CTA ──
  lawyerCTA: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  lawyerCTALeft: {
    marginRight: SPACING.md,
  },
  lawyerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lawyerCTAEmoji: {
    fontSize: 22,
  },
  lawyerCTATextContainer: {
    flex: 1,
  },
  lawyerCTATitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnDark,
  },
  lawyerCTASubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textOnDarkMuted,
    marginTop: 2,
  },
  lawyerCTAArrow: {
    fontSize: 24,
    color: COLORS.textOnDarkMuted,
    marginLeft: SPACING.sm,
  },

  // ── Trust Signals ──
  trustSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trustIcon: {
    fontSize: 18,
  },
  trustText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  trustDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },

  // ── Bottom ──
  disclaimerWrap: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  disclaimerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  privacyLink: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  privacyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});
