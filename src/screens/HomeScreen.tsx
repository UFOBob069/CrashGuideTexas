// ============================================================
// CrashGuide Texas - Home Screen
// Premium, reassuring design
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
        {/* ── Dark Hero Section ── */}
        <View style={styles.heroContainer}>
          {/* Decorative orb in background */}
          <View style={styles.heroOrb} />
          <View style={styles.heroOrbSmall} />

          <SafeAreaView>
            <View style={styles.heroInner}>
              {/* Logo */}
              <View style={styles.logoRow}>
                <View style={styles.logoMark}>
                  <View style={styles.logoBar} />
                  <View style={styles.logoBarThin} />
                </View>
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
                Stay calm. We'll guide you through{'\n'}every step, right now.
              </Text>

              {/* Primary CTA - Emergency */}
              <TouchableOpacity
                style={styles.primaryCTA}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Chat', { mode: 'urgent' })}
              >
                <View style={styles.primaryCTAGlow} />
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
                  <View style={styles.primaryCTAArrowWrap}>
                    <Text style={styles.primaryCTAArrow}>›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Curved transition */}
          <View style={styles.heroBottomCurve} />
        </View>

        {/* ── Content Section ── */}
        <View style={styles.contentSection}>
          {/* Action Cards */}
          <View style={styles.actionCardsRow}>
            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Document')}
            >
              <View style={[styles.actionCardIconWrap, { backgroundColor: COLORS.infoBg }]}>
                <Text style={styles.actionCardEmoji}>📷</Text>
              </View>
              <Text style={styles.actionCardTitle}>Document</Text>
              <Text style={styles.actionCardSubtext}>Evidence & Photos</Text>
              <View style={[styles.actionCardAccent, { backgroundColor: COLORS.info }]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Checklist')}
            >
              <View style={[styles.actionCardIconWrap, { backgroundColor: COLORS.accentSubtle }]}>
                <Text style={styles.actionCardEmoji}>📋</Text>
              </View>
              <Text style={styles.actionCardTitle}>Checklist</Text>
              <Text style={styles.actionCardSubtext}>What to Do Next</Text>
              <View style={[styles.actionCardAccent, { backgroundColor: COLORS.accent }]} />
            </TouchableOpacity>
          </View>

          {/* Lawyer CTA */}
          <TouchableOpacity
            style={styles.lawyerCTA}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ConnectLawyer', {})}
          >
            <View style={styles.lawyerCTADecor} />
            <View style={styles.lawyerCTABody}>
              <View style={styles.lawyerIconWrap}>
                <Text style={styles.lawyerCTAEmoji}>⚖️</Text>
              </View>
              <View style={styles.lawyerCTATextContainer}>
                <Text style={styles.lawyerCTATitle}>Talk to a Texas Injury Lawyer</Text>
                <Text style={styles.lawyerCTASubtext}>
                  Free consultation · No obligation
                </Text>
              </View>
              <View style={styles.lawyerArrowWrap}>
                <Text style={styles.lawyerCTAArrow}>›</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Trust Signals */}
          <View style={styles.trustSection}>
            <View style={styles.trustRow}>
              {[
                { icon: '🔒', label: 'Private &\nSecure' },
                { icon: '🏛️', label: 'Built for\nTexas' },
                { icon: '⭐', label: '100%\nFree' },
              ].map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <View style={styles.trustDivider} />}
                  <View style={styles.trustItem}>
                    <View style={styles.trustIconWrap}>
                      <Text style={styles.trustIcon}>{item.icon}</Text>
                    </View>
                    <Text style={styles.trustText}>{item.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerWrap}>
            <View style={styles.disclaimerPill}>
              <Text style={styles.disclaimerText}>
                General info only — not legal advice
              </Text>
            </View>
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

  // ── Hero Section ──
  heroContainer: {
    backgroundColor: COLORS.primary,
    paddingBottom: SPACING.xxl,
    overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
  },
  heroOrbSmall: {
    position: 'absolute',
    bottom: 20,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(245, 166, 35, 0.04)',
  },
  heroInner: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
    marginBottom: SPACING.xl + 4,
  },
  logoMark: {
    flexDirection: 'row',
    gap: 3,
  },
  logoBar: {
    width: 4,
    height: 38,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  logoBarThin: {
    width: 2,
    height: 38,
    backgroundColor: 'rgba(245, 166, 35, 0.3)',
    borderRadius: 1,
  },
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
  heroText: {
    fontSize: FONT_SIZES.display,
    fontWeight: FONT_WEIGHTS.heavy,
    color: COLORS.textOnDark,
    lineHeight: 46,
    marginBottom: SPACING.sm + 2,
  },
  heroSubtext: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textOnDarkMuted,
    lineHeight: 26,
    marginBottom: SPACING.xl,
  },

  // ── Primary CTA ──
  primaryCTA: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.glow(COLORS.emergency, 0.35),
  },
  primaryCTAGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.emergency,
  },
  primaryCTAInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  primaryCTAIconWrap: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryCTAEmoji: {
    fontSize: 26,
  },
  primaryCTAContent: {
    flex: 1,
  },
  primaryCTAText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnPrimary,
    letterSpacing: 0.3,
  },
  primaryCTASubtext: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 3,
    lineHeight: 18,
  },
  primaryCTAArrowWrap: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryCTAArrow: {
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    marginTop: -1,
  },

  // ── Hero Bottom Curve ──
  heroBottomCurve: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // ── Content Section ──
  contentSection: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },

  // ── Action Cards ──
  actionCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  actionCardIconWrap: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm + 2,
  },
  actionCardEmoji: {
    fontSize: 28,
  },
  actionCardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  actionCardSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  actionCardAccent: {
    position: 'absolute',
    bottom: 0,
    left: SPACING.xl,
    right: SPACING.xl,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // ── Lawyer CTA ──
  lawyerCTA: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    ...SHADOWS.lg,
  },
  lawyerCTADecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  lawyerCTABody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.md + 4,
    gap: SPACING.md,
  },
  lawyerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.accentGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lawyerCTAEmoji: {
    fontSize: 24,
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
    marginTop: 3,
  },
  lawyerArrowWrap: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lawyerCTAArrow: {
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnDarkMuted,
    marginTop: -1,
  },

  // ── Trust Signals ──
  trustSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
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
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceTinted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
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
    height: 44,
    backgroundColor: COLORS.borderLight,
  },

  // ── Bottom ──
  disclaimerWrap: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  disclaimerPill: {
    backgroundColor: COLORS.surfaceTinted,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  disclaimerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
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
