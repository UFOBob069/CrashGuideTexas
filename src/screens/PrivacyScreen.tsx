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
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../constants/theme';

type PrivacyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Privacy'>;
};

export default function PrivacyScreen({ navigation }: PrivacyScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Terms</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: February 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What This App Does</Text>
          <Text style={styles.body}>
            CrashGuide Texas provides general information and guidance to help people involved in accidents in Texas. It is not a law firm and does not provide legal advice. The information provided is for general informational purposes only.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.body}>
            When you use CrashGuide Texas, we may collect:{'\n\n'}
            • Information you provide in the chat (accident details, symptoms, etc.){'\n'}
            • Photos and evidence you capture through the app{'\n'}
            • Your location data (only when you grant permission, used to tag evidence){'\n'}
            • Contact information you voluntarily provide (name, phone, email){'\n'}
            • Device information and usage analytics
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.body}>
            • To provide accident guidance and generate your accident report{'\n'}
            • To connect you with a qualified Texas personal injury lawyer (only with your explicit consent){'\n'}
            • To improve our services and user experience{'\n'}
            • We never sell your personal information to third parties
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sharing Your Information</Text>
          <Text style={styles.body}>
            We only share your information with a lawyer or law firm when you explicitly consent to the connection. Before sharing, we will:{'\n\n'}
            • Clearly tell you what information will be shared{'\n'}
            • Ask for your explicit consent{'\n'}
            • Allow you to review the information before sharing
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage & Security</Text>
          <Text style={styles.body}>
            Your data is stored securely and encrypted. Photos and evidence are stored on your device unless you choose to share them. We use industry-standard security measures to protect your information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.body}>
            You have the right to:{'\n\n'}
            • Access your data{'\n'}
            • Request deletion of your data{'\n'}
            • Withdraw consent at any time{'\n'}
            • Opt out of data sharing{'\n\n'}
            To exercise these rights, contact us at privacy@crashguidetexas.com
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.title}>Terms of Use</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Not Legal Advice</Text>
          <Text style={styles.body}>
            CrashGuide Texas provides general information only. Nothing in this app constitutes legal advice, and using this app does not create an attorney-client relationship. For legal advice specific to your situation, consult a licensed attorney.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>No Guarantees</Text>
          <Text style={styles.body}>
            We do not guarantee any outcomes, case results, or that a lawyer will accept your case. The information provided is general in nature and may not apply to your specific situation.
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
            This app is designed specifically for accidents occurring in Texas and information is based on Texas law. It may not be applicable to incidents in other states.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.body}>
            Questions about privacy or terms?{'\n'}
            Email: privacy@crashguidetexas.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  backText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textOnPrimary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  lastUpdated: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  body: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xl,
  },
  contactSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
  },
});
