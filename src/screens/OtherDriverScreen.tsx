// ============================================================
// CrashGuide Texas - Other Driver Info Screen
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, OtherDriverInfo } from '../types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';

type OtherDriverScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OtherDriver'>;
};

export default function OtherDriverScreen({ navigation }: OtherDriverScreenProps) {
  const { state, dispatch } = useApp();
  const existing = state.report.otherDriverInfo;

  const [name, setName] = useState(existing?.name ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [licenseNumber, setLicenseNumber] = useState(existing?.licenseNumber ?? '');
  const [licensePlate, setLicensePlate] = useState(existing?.licensePlate ?? '');
  const [vehicleYear, setVehicleYear] = useState(existing?.vehicleYear ?? '');
  const [vehicleMake, setVehicleMake] = useState(existing?.vehicleMake ?? '');
  const [vehicleModel, setVehicleModel] = useState(existing?.vehicleModel ?? '');
  const [insuranceCompany, setInsuranceCompany] = useState(existing?.insuranceCompany ?? '');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState(existing?.insurancePolicyNumber ?? '');

  const isSaved = !!existing;

  function handleSave() {
    if (!name.trim() && !licensePlate.trim()) {
      Alert.alert('Missing Info', 'Please enter at least the other driver\'s name or license plate.');
      return;
    }
    const info: OtherDriverInfo = {
      name: name.trim(),
      phone: phone.trim(),
      licenseNumber: licenseNumber.trim(),
      licensePlate: licensePlate.trim().toUpperCase(),
      vehicleYear: vehicleYear.trim(),
      vehicleMake: vehicleMake.trim(),
      vehicleModel: vehicleModel.trim(),
      insuranceCompany: insuranceCompany.trim(),
      insurancePolicyNumber: insurancePolicyNumber.trim(),
    };
    dispatch({ type: 'SET_OTHER_DRIVER', payload: info });
    Alert.alert('Saved', 'Other driver information has been saved.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Other Driver Info</Text>
          </View>
          {isSaved ? (
            <View style={styles.savedBadge}>
              <Text style={styles.savedBadgeText}>✓</Text>
            </View>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Tip banner */}
          <View style={styles.tipBanner}>
            <View style={styles.tipAccent} />
            <Text style={styles.tipIcon}>⚠️</Text>
            <Text style={styles.tipText}>
              Collect this info at the scene. You'll need it for your insurance claim.
            </Text>
          </View>

          {/* Driver section */}
          <Text style={styles.sectionLabel}>Driver</Text>
          <View style={styles.card}>
            <Field label="Full Name" value={name} onChange={setName} placeholder="John Smith" autoCapitalize="words" />
            <Divider />
            <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="(555) 123-4567" keyboardType="phone-pad" />
            <Divider />
            <Field label="Driver's License #" value={licenseNumber} onChange={setLicenseNumber} placeholder="TX12345678" autoCapitalize="characters" />
          </View>

          {/* Vehicle section */}
          <Text style={styles.sectionLabel}>Vehicle</Text>
          <View style={styles.card}>
            <Field label="License Plate" value={licensePlate} onChange={setLicensePlate} placeholder="ABC-1234" autoCapitalize="characters" />
            <Divider />
            <View style={styles.rowFields}>
              <View style={styles.rowFieldSmall}>
                <Field label="Year" value={vehicleYear} onChange={setVehicleYear} placeholder="2020" keyboardType="number-pad" />
              </View>
              <View style={styles.rowFieldLarge}>
                <Field label="Make" value={vehicleMake} onChange={setVehicleMake} placeholder="Toyota" autoCapitalize="words" />
              </View>
            </View>
            <Divider />
            <Field label="Model" value={vehicleModel} onChange={setVehicleModel} placeholder="Camry" autoCapitalize="words" />
          </View>

          {/* Insurance section */}
          <Text style={styles.sectionLabel}>Insurance</Text>
          <View style={styles.card}>
            <Field label="Insurance Company" value={insuranceCompany} onChange={setInsuranceCompany} placeholder="State Farm" autoCapitalize="words" />
            <Divider />
            <Field label="Policy Number" value={insurancePolicyNumber} onChange={setInsurancePolicyNumber} placeholder="POL-123456789" autoCapitalize="characters" />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Information</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label, value, onChange, placeholder, keyboardType = 'default', autoCapitalize = 'none',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'characters';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.info,
  },
  backButton: {
    width: 36, height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.glass,
    justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { color: COLORS.textOnPrimary, fontSize: 22, fontWeight: FONT_WEIGHTS.bold, marginTop: -2 },
  headerContent: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnPrimary },
  headerSpacer: { width: 36 },
  savedBadge: {
    width: 28, height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.success,
    justifyContent: 'center', alignItems: 'center',
  },
  savedBadgeText: { color: COLORS.white, fontSize: 14, fontWeight: FONT_WEIGHTS.bold },

  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },

  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardAmber,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  tipAccent: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 3,
    backgroundColor: COLORS.accent,
  },
  tipIcon: { fontSize: 18 },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.heavy,
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  field: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    paddingVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.md,
  },
  rowFields: {
    flexDirection: 'row',
  },
  rowFieldSmall: { width: 80 },
  rowFieldLarge: { flex: 1 },

  saveButton: {
    backgroundColor: COLORS.info,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    marginTop: SPACING.xl,
    ...SHADOWS.lg,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnPrimary,
  },
});
