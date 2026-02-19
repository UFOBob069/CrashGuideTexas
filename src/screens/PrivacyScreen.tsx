// ============================================================
// CrashGuide Texas - Privacy Policy Screen
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

type PrivacyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Privacy'>;
};

export default function PrivacyScreen({ navigation }: PrivacyScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Privacy & Terms</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: February 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What This App Does</Text>
          <Text style={styles.body}>
            CrashGuide Texas provides general information and guidance to help people involved in accidents in Texas. It is not a law firm and does not provide legal advice.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.body}>
            {'\u2022'} Information you provide in the chat{'\n'}
            {'\u2022'} Photos and evidence you capture{'\n'}
            {'\u2022'} Location data (only with permission){'\n'}
            {'\u2022'} Contact information you voluntarily provide{'\n'}
            {'\u2022'} Device information and usage analytics
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.body}>
            {'\u2022'} To provide accident guidance{'\n'}
            {'\u2022'} To connect you with a lawyer (only with consent){'\n'}
            {'\u2022'} To improve our services{'\n'}
            {'\u2022'} We never sell your personal information
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sharing Your Information</Text>
          <Text style={styles.body}>
            We only share your information with a lawyer when you explicitly consent. Before sharing, we will clearly tell you what will be shared and ask for your explicit consent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage & Security</Text>
          <Text style={styles.body}>
            Your data is stored securely and encrypted. Photos are stored on your device unless you choose to share them. We use industry-standard security measures.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.body}>
            {'\u2022'} Access your data{'\n'}
            {'\u2022'} Request deletion of your data{'\n'}
            {'\u2022'} Withdraw consent at any time{'\n'}
            {'\u2022'} Opt out of data sharing{'\n\n'}
            Contact: privacy@crashguidetexas.com
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.title}>Terms of Use</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Not Legal Advice</Text>
          <Text style={styles.body}>
            Nothing in this app constitutes legal advice. Using this app does not create an attorney-client relationship.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>No Guarantees</Text>
          <Text style={styles.body}>
            We do not guarantee any outcomes, case results, or that a lawyer will accept your case.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Situations</Text>
          <Text style={styles.body}>
            If you are in immediate danger or experiencing a medical emergency, call 911. This app is not a substitute for emergency services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Texas Only</Text>
          <Text style={styles.body}>
            This app is designed for Texas accidents and based on Texas law. It may not apply to other states.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <Text style={styles.contactBody}>
            Questions about privacy or terms?{'\n'}
            Email: privacy@crashguidetexas.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, backgroundColor: COLORS.primary },
  backButton: { width: 36, height: 36, borderRadius: BORDER_RADIUS.full, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: COLORS.textOnPrimary, fontSize: 22, fontWeight: FONT_WEIGHTS.bold, marginTop: -2 },
  headerContent: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnPrimary },
  headerSpacer: { width: 36 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  lastUpdated: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginBottom: SPACING.lg },
  section: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  body: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, lineHeight: 22 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xl },
  contactSection: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginTop: SPACING.md },
  contactTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnDark, marginBottom: SPACING.sm },
  contactBody: { fontSize: FONT_SIZES.md, color: COLORS.textOnDarkMuted, lineHeight: 22 },
});
