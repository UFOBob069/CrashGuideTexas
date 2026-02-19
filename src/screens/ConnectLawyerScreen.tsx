// ============================================================
// CrashGuide Texas - Connect to Lawyer Screen
// ============================================================

import React, { useState, useEffect } from 'react';
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

export default function ConnectLawyerScreen({ navigation, route }: ConnectLawyerScreenProps) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<Step>('info');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContact, setPreferredContact] = useState<'phone' | 'email' | 'text'>('phone');

  const ramosJames = getRamosJamesContact();

  function handleContinueToContact() {
    setStep('contact');
  }

  function handleSubmitContact() {
    if (!firstName.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please provide at least your first name and phone number.');
      return;
    }

    const contactInfo: ContactInfo = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      preferredContact,
    };

    dispatch({ type: 'SET_CONTACT_INFO', payload: contactInfo });
    setStep('consent');
  }

  function handleConsent() {
    dispatch({ type: 'SET_CONSENT', payload: true });

    // Run qualification
    const qualification = qualifyLead(state.report);
    dispatch({ type: 'SET_QUALIFICATION', payload: qualification });

    // Run routing
    const routing = routeLead(state.report, qualification);
    if (routing) {
      dispatch({ type: 'SET_ROUTING_DECISION', payload: routing });
    }

    setStep('connected');
  }

  function handleCallLawyer() {
    const phoneNumber = ramosJames.phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  }

  function handleTextLawyer() {
    const phoneNumber = ramosJames.phone.replace(/[^0-9]/g, '');
    Linking.openURL(`sms:${phoneNumber}`);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚖️ Talk to a Lawyer</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'info' && (
          <View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>
                Connect with a Texas Personal Injury Lawyer
              </Text>
              <Text style={styles.infoText}>
                Based on what you've shared, a personal injury lawyer may be able to help you. Here's what to expect:
              </Text>

              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>✅</Text>
                  <Text style={styles.benefitText}>Free initial consultation</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>✅</Text>
                  <Text style={styles.benefitText}>No obligation to hire</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>✅</Text>
                  <Text style={styles.benefitText}>Licensed Texas attorney</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>✅</Text>
                  <Text style={styles.benefitText}>They'll review your situation and advise next steps</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContinueToContact}
            >
              <Text style={styles.primaryButtonText}>
                Get Connected — It's Free
              </Text>
            </TouchableOpacity>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                This is not legal advice. Connecting you with a lawyer does not create an attorney-client relationship. The lawyer will independently evaluate your situation.
              </Text>
            </View>
          </View>
        )}

        {step === 'contact' && (
          <View>
            <Text style={styles.stepTitle}>Your Contact Information</Text>
            <Text style={styles.stepSubtitle}>
              So the lawyer can reach you for a free consultation.
            </Text>

            <View style={styles.form}>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Preferred Contact Method</Text>
                <View style={styles.contactMethodRow}>
                  {(['phone', 'text', 'email'] as const).map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.contactMethodChip,
                        preferredContact === method && styles.contactMethodChipSelected,
                      ]}
                      onPress={() => setPreferredContact(method)}
                    >
                      <Text
                        style={[
                          styles.contactMethodText,
                          preferredContact === method && styles.contactMethodTextSelected,
                        ]}
                      >
                        {method === 'phone' ? '📞 Call' : method === 'text' ? '💬 Text' : '📧 Email'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmitContact}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'consent' && (
          <View>
            <View style={styles.consentCard}>
              <Text style={styles.consentTitle}>
                Permission to Share Your Information
              </Text>
              <Text style={styles.consentText}>
                By tapping "I Agree," you consent to sharing the following with a Texas personal injury lawyer:
              </Text>

              <View style={styles.consentList}>
                <Text style={styles.consentItem}>
                  • Your contact information (name, phone, email)
                </Text>
                <Text style={styles.consentItem}>
                  • Details about your accident that you shared with CrashGuide
                </Text>
                <Text style={styles.consentItem}>
                  • Any photos or evidence you captured
                </Text>
              </View>

              <Text style={styles.consentText}>
                Your information will only be used to evaluate your situation and contact you. It will not be sold or shared with other parties.
              </Text>

              <Text style={styles.consentText}>
                You can request deletion of your data at any time.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleConsent}
            >
              <Text style={styles.primaryButtonText}>
                I Agree — Connect Me with a Lawyer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setStep('contact')}
            >
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'connected' && (
          <View>
            <View style={styles.successCard}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>
                You're Connected!
              </Text>
              <Text style={styles.successText}>
                A Texas personal injury lawyer will be reaching out to you shortly. You can also reach them directly:
              </Text>

              <View style={styles.firmCard}>
                <Text style={styles.firmName}>{ramosJames.name}</Text>
                <Text style={styles.firmPhone}>{ramosJames.phone}</Text>
              </View>
            </View>

            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallLawyer}
              >
                <Text style={styles.callButtonText}>📞 Call Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.textButton}
                onPress={handleTextLawyer}
              >
                <Text style={styles.textButtonText}>💬 Send Text</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.expectCard}>
              <Text style={styles.expectTitle}>What to Expect</Text>
              <View style={styles.expectList}>
                <Text style={styles.expectItem}>
                  📞 You'll receive a call or text within 24 hours
                </Text>
                <Text style={styles.expectItem}>
                  💬 The initial consultation is completely free
                </Text>
                <Text style={styles.expectItem}>
                  ⚖️ There's no obligation to hire anyone
                </Text>
              </View>
            </View>

            <View style={styles.reminderCard}>
              <Text style={styles.reminderTitle}>Important Reminders</Text>
              <Text style={styles.reminderText}>
                • Seek medical attention if you haven't already{'\n'}
                • Keep documenting any symptoms{'\n'}
                • Don't discuss fault with the other driver's insurance{'\n'}
                • Don't sign anything without consulting your lawyer
              </Text>
            </View>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.homeButtonText}>Return Home</Text>
            </TouchableOpacity>
          </View>
        )}
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
    backgroundColor: COLORS.success,
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
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  infoTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  infoText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  benefitsList: {
    gap: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  benefitIcon: {
    fontSize: 16,
  },
  benefitText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...SHADOWS.md,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnPrimary,
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textMuted,
  },
  disclaimer: {
    paddingTop: SPACING.lg,
  },
  disclaimerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    lineHeight: 18,
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  form: {
    gap: SPACING.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  formField: {},
  formFieldHalf: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactMethodRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  contactMethodChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  contactMethodChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  contactMethodText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  contactMethodTextSelected: {
    color: COLORS.textOnPrimary,
  },
  consentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  consentTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  consentText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  consentList: {
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  consentItem: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  successCard: {
    backgroundColor: COLORS.successBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  firmCard: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  firmName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  firmPhone: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  contactActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  callButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  callButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnPrimary,
  },
  textButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  textButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnPrimary,
  },
  expectCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  expectTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  expectList: {
    gap: SPACING.sm,
  },
  expectItem: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  reminderCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#F6E05E',
  },
  reminderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  reminderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  homeButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});
