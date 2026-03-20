// ============================================================
// CrashGuide Texas - Contact Form Screen (Standalone)
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ContactInfo } from '../types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';

type ContactFormScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ContactForm'>;
};

export default function ContactFormScreen({ navigation }: ContactFormScreenProps) {
  const { dispatch } = useApp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContact, setPreferredContact] = useState<'phone' | 'email' | 'text'>('phone');

  function handleSubmit() {
    if (!firstName.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please provide at least your first name and phone number.');
      return;
    }
    const contactInfo: ContactInfo = {
      firstName: firstName.trim(), lastName: lastName.trim(),
      phone: phone.trim(), email: email.trim(), preferredContact,
    };
    dispatch({ type: 'SET_CONTACT_INFO', payload: contactInfo });
    navigation.navigate('ConnectLawyer', { report: undefined });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Contact Information</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Your Information</Text>
        <Text style={styles.subtitle}>This will be shared with a lawyer for your free consultation.</Text>

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

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Continue</Text>
        </TouchableOpacity>
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
    backgroundColor: COLORS.primary,
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
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.lg },
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
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    marginTop: SPACING.xl,
    ...SHADOWS.lg,
  },
  submitButtonText: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnPrimary },
});
