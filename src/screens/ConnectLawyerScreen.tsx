// ============================================================
// CrashGuide Texas - Connect to Lawyer Screen
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, ContactInfo } from '../types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { qualifyLead, routeLead, getRamosJamesContact } from '../services/leadQualification';

type ConnectLawyerScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ConnectLawyer'>;
  route: RouteProp<RootStackParamList, 'ConnectLawyer'>;
};

type Step = 'info' | 'contact' | 'consent' | 'connected';
const STEPS: Step[] = ['info', 'contact', 'consent', 'connected'];

export default function ConnectLawyerScreen({ navigation, route }: ConnectLawyerScreenProps) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<Step>('info');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContact, setPreferredContact] = useState<'phone' | 'email' | 'text'>('phone');

  const ramosJames = getRamosJamesContact();
  const stepIndex = STEPS.indexOf(step);

  function handleContinueToContact() { setStep('contact'); }

  function handleSubmitContact() {
    if (!firstName.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please provide at least your first name and phone number.');
      return;
    }
    const contactInfo: ContactInfo = {
      firstName: firstName.trim(), lastName: lastName.trim(),
      phone: phone.trim(), email: email.trim(), preferredContact,
    };
    dispatch({ type: 'SET_CONTACT_INFO', payload: contactInfo });
    setStep('consent');
  }

  function handleConsent() {
    dispatch({ type: 'SET_CONSENT', payload: true });
    const qualification = qualifyLead(state.report);
    dispatch({ type: 'SET_QUALIFICATION', payload: qualification });
    const routing = routeLead(state.report, qualification);
    if (routing) dispatch({ type: 'SET_ROUTING_DECISION', payload: routing });
    setStep('connected');
  }

  function handleCallLawyer() {
    const tel = `tel:${ramosJames.phone.replace(/[^0-9]/g, '')}`;
    if (Platform.OS === 'web') {
      window.open(tel, '_self');
    } else {
      Linking.openURL(tel);
    }
  }
  function handleTextLawyer() {
    const sms = `sms:${ramosJames.phone.replace(/[^0-9]/g, '')}`;
    if (Platform.OS === 'web') {
      window.open(sms, '_self');
    } else {
      Linking.openURL(sms);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Talk to a Lawyer</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {step !== 'connected' && (
        <View style={styles.stepIndicator}>
          {STEPS.slice(0, 3).map((s, i) => (
            <View key={s} style={styles.stepDotRow}>
              <View style={[
                styles.stepDot,
                i <= stepIndex && styles.stepDotActive,
                i < stepIndex && styles.stepDotCompleted,
              ]}>
                {i < stepIndex && <Text style={styles.stepCheck}>✓</Text>}
              </View>
              {i < 2 && <View style={[styles.stepLine, i < stepIndex && styles.stepLineActive]} />}
            </View>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'info' && (
          <View>
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrap}><Text style={styles.infoIcon}>⚖️</Text></View>
              <Text style={styles.infoTitle}>Connect with a Texas{'\n'}Personal Injury Lawyer</Text>
              <Text style={styles.infoText}>A personal injury lawyer may be able to help. Here's what to expect:</Text>
              <View style={styles.benefitsList}>
                {['Free initial consultation','No obligation to hire','Licensed Texas attorney','They\'ll review your situation and advise next steps'].map((text, i) => (
                  <View key={i} style={styles.benefitItem}>
                    <View style={styles.benefitCheck}><Text style={styles.benefitCheckText}>✓</Text></View>
                    <Text style={styles.benefitText}>{text}</Text>
                  </View>
                ))}
              </View>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleContinueToContact}>
              <Text style={styles.primaryButtonText}>Get Connected — It's Free</Text>
            </TouchableOpacity>
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>This is not legal advice. Connecting you with a lawyer does not create an attorney-client relationship.</Text>
            </View>
          </View>
        )}

        {step === 'contact' && (
          <View>
            <Text style={styles.stepTitle}>Your Contact Information</Text>
            <Text style={styles.stepSubtitle}>So the lawyer can reach you for a free consultation.</Text>
            <View style={styles.form}>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor={COLORS.textMuted} autoCapitalize="words" />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" placeholderTextColor={COLORS.textMuted} autoCapitalize="words" />
                </View>
              </View>
              <View style={styles.formField}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="(555) 123-4567" placeholderTextColor={COLORS.textMuted} keyboardType="phone-pad" />
              </View>
              <View style={styles.formField}>
                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={COLORS.textMuted} keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View style={styles.formField}>
                <Text style={styles.label}>Preferred Contact Method</Text>
                <View style={styles.contactMethodRow}>
                  {(['phone', 'text', 'email'] as const).map((method) => (
                    <TouchableOpacity key={method} style={[styles.contactMethodChip, preferredContact === method && styles.contactMethodChipSelected]} onPress={() => setPreferredContact(method)}>
                      <Text style={[styles.contactMethodText, preferredContact === method && styles.contactMethodTextSelected]}>
                        {method === 'phone' ? '📞 Call' : method === 'text' ? '💬 Text' : '📧 Email'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSubmitContact}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'consent' && (
          <View>
            <View style={styles.consentCard}>
              <View style={styles.consentIconWrap}><Text style={styles.consentIconEmoji}>🔒</Text></View>
              <Text style={styles.consentTitle}>Permission to Share</Text>
              <Text style={styles.consentText}>By tapping "I Agree," you consent to sharing the following with a Texas personal injury lawyer:</Text>
              <View style={styles.consentList}>
                {['Your contact information (name, phone, email)','Details about your accident','Any photos or evidence you captured'].map((text, i) => (
                  <View key={i} style={styles.consentItem}>
                    <View style={styles.consentDot} />
                    <Text style={styles.consentItemText}>{text}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.consentDisclaimer}>Your information will only be used to evaluate your situation. It will not be sold or shared with other parties.</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleConsent}>
              <Text style={styles.primaryButtonText}>I Agree — Connect Me</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('contact')}>
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'connected' && (
          <View>
            <View style={styles.successCard}>
              <View style={styles.successIconWrap}><Text style={styles.successIconEmoji}>✅</Text></View>
              <Text style={styles.successTitle}>You're Connected!</Text>
              <Text style={styles.successText}>A Texas personal injury lawyer will be reaching out to you shortly.</Text>
              <View style={styles.firmCard}>
                <Text style={styles.firmName}>{ramosJames.name}</Text>
                <Text style={styles.firmPhone}>{ramosJames.phone}</Text>
              </View>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity style={styles.callButton} onPress={handleCallLawyer}>
                <Text style={styles.actionButtonText}>📞 Call Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.textButton} onPress={handleTextLawyer}>
                <Text style={styles.actionButtonText}>💬 Send Text</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.expectCard}>
              <Text style={styles.expectTitle}>What to Expect</Text>
              {[{icon:'📞',text:'Call or text within 24 hours'},{icon:'💬',text:'Free initial consultation'},{icon:'⚖️',text:'No obligation to hire'}].map((item, i) => (
                <View key={i} style={styles.expectItem}>
                  <View style={styles.expectIconWrap}>
                    <Text style={styles.expectItemIcon}>{item.icon}</Text>
                  </View>
                  <Text style={styles.expectItemText}>{item.text}</Text>
                </View>
              ))}
            </View>
            <View style={styles.reminderCard}>
              <Text style={styles.reminderTitle}>Important Reminders</Text>
              <Text style={styles.reminderText}>
                {'\u2022'} Seek medical attention if you haven't already{'\n'}
                {'\u2022'} Keep documenting any symptoms{'\n'}
                {'\u2022'} Don't discuss fault with the other driver's insurance{'\n'}
                {'\u2022'} Don't sign anything without consulting your lawyer
              </Text>
            </View>
            <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.homeButtonText}>Return Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.success,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { color: COLORS.textOnPrimary, fontSize: 22, fontWeight: FONT_WEIGHTS.bold, marginTop: -2 },
  headerContent: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnPrimary },
  headerSpacer: { width: 36 },

  // ── Step Indicator ──
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  stepDotRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.borderLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: { borderColor: COLORS.success, backgroundColor: COLORS.successBg },
  stepDotCompleted: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  stepCheck: { fontSize: 11, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },
  stepLine: { width: 48, height: 2, backgroundColor: COLORS.borderLight },
  stepLineActive: { backgroundColor: COLORS.success },

  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },

  // ── Info Card ──
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  infoIconWrap: {
    width: 68,
    height: 68,
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: COLORS.cardGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.12)',
  },
  infoIcon: { fontSize: 32 },
  infoTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  infoText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, lineHeight: 22, textAlign: 'center', marginBottom: SPACING.lg },
  benefitsList: { width: '100%', gap: SPACING.md },
  benefitItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  benefitCheck: { width: 22, height: 22, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center' },
  benefitCheckText: { color: COLORS.white, fontSize: 12, fontWeight: FONT_WEIGHTS.bold },
  benefitText: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, flex: 1, lineHeight: 22 },

  // ── Buttons ──
  primaryButton: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...SHADOWS.glow(COLORS.success, 0.25),
  },
  primaryButtonText: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnPrimary },
  secondaryButton: { paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  secondaryButtonText: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.medium, color: COLORS.textMuted },
  disclaimer: { paddingTop: SPACING.lg },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, lineHeight: 18, textAlign: 'center' },

  // ── Contact Form ──
  stepTitle: { fontSize: FONT_SIZES.xxl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  stepSubtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  form: { gap: SPACING.md },
  formRow: { flexDirection: 'row', gap: SPACING.md },
  formField: {},
  formFieldHalf: { flex: 1 },
  label: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactMethodRow: { flexDirection: 'row', gap: SPACING.sm },
  contactMethodChip: {
    flex: 1,
    paddingVertical: SPACING.sm + 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  contactMethodChipSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  contactMethodText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.textPrimary },
  contactMethodTextSelected: { color: COLORS.textOnPrimary },

  // ── Consent ──
  consentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  consentIconWrap: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.cardBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.12)',
  },
  consentIconEmoji: { fontSize: 28 },
  consentTitle: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  consentText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, lineHeight: 22, textAlign: 'center', marginBottom: SPACING.md },
  consentList: { width: '100%', marginBottom: SPACING.md, gap: SPACING.sm },
  consentItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  consentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 8 },
  consentItemText: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, lineHeight: 22, flex: 1 },
  consentDisclaimer: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, lineHeight: 20, textAlign: 'center' },

  // ── Success ──
  successCard: {
    backgroundColor: COLORS.successBg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  successIconWrap: {
    width: 68,
    height: 68,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  successIconEmoji: { fontSize: 32 },
  successTitle: { fontSize: FONT_SIZES.xxl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.success, marginBottom: SPACING.sm },
  successText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  firmCard: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  firmName: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary },
  firmPhone: { fontSize: FONT_SIZES.md, color: COLORS.success, marginTop: SPACING.xs, fontWeight: FONT_WEIGHTS.semibold },
  contactActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  callButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    ...SHADOWS.glow(COLORS.success, 0.25),
  },
  textButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  actionButtonText: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnPrimary },

  // ── Expect & Reminders ──
  expectCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  expectTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  expectItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  expectIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceTinted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expectItemIcon: { fontSize: 16 },
  expectItemText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  reminderCard: {
    backgroundColor: COLORS.cardAmber,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  reminderTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  reminderText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, lineHeight: 24 },
  homeButton: { marginTop: SPACING.lg, paddingVertical: SPACING.md, alignItems: 'center' },
  homeButtonText: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.medium, color: COLORS.textMuted, textDecorationLine: 'underline' },
});
