// ============================================================
// CrashGuide Texas - Document Mode Screen
// Step-by-step accident documentation
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, EvidenceType, EvidenceItem } from '../types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import {
  capturePhoto,
  pickPhotoFromLibrary,
  formatEvidenceTypeLabel,
} from '../services/evidenceService';

type DocumentScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Document'>;
};

const EVIDENCE_TYPES: { type: EvidenceType; icon: string; label: string }[] = [
  { type: 'vehicle_damage', icon: '🚗', label: 'Vehicle Damage' },
  { type: 'license_plate', icon: '🔢', label: 'License Plates' },
  { type: 'scene', icon: '📍', label: 'Accident Scene' },
  { type: 'injury', icon: '🩹', label: 'Injuries' },
  { type: 'document', icon: '📄', label: 'Documents' },
  { type: 'other', icon: '📎', label: 'Other' },
];

const SCENE_CHECKLIST = [
  { id: 'damage', icon: '🚗', text: 'All vehicle damage photographed' },
  { id: 'plates', icon: '🔢', text: 'License plates captured' },
  { id: 'road', icon: '🛣️', text: 'Road conditions documented' },
  { id: 'weather', icon: '⛈️', text: 'Weather conditions noted' },
  { id: 'insurance', icon: '📝', text: 'Insurance cards photographed' },
  { id: 'witnesses', icon: '👥', text: 'Witness contact info collected' },
];

export default function DocumentScreen({ navigation }: DocumentScreenProps) {
  const { state, dispatch } = useApp();
  const [selectedType, setSelectedType] = useState<EvidenceType>('vehicle_damage');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [capturing, setCapturing] = useState<'camera' | 'library' | null>(null);
  const evidence = state.report.evidence;
  const hasOtherDriver = !!state.report.otherDriverInfo;

  async function handleCapturePhoto() {
    if (capturing) return;
    setCapturing('camera');
    try {
      const item = await capturePhoto(selectedType, `${formatEvidenceTypeLabel(selectedType)} photo`);
      if (item) {
        dispatch({ type: 'ADD_EVIDENCE', payload: item });
      }
    } catch {
      Alert.alert('Error', 'Could not capture photo. Please check camera permissions.');
    } finally {
      setCapturing(null);
    }
  }

  async function handlePickPhoto() {
    if (capturing) return;
    setCapturing('library');
    try {
      const item = await pickPhotoFromLibrary(selectedType, `${formatEvidenceTypeLabel(selectedType)} photo`);
      if (item) {
        dispatch({ type: 'ADD_EVIDENCE', payload: item });
      }
    } catch {
      Alert.alert('Error', 'Could not access photo library. Please check permissions.');
    } finally {
      setCapturing(null);
    }
  }

  function handleRemoveEvidence(id: string) {
    Alert.alert('Remove Photo', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => dispatch({ type: 'REMOVE_EVIDENCE', payload: id }) },
    ]);
  }

  function toggleChecked(id: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function getEvidenceByType(type: EvidenceType): EvidenceItem[] {
    return evidence.filter((e) => e.type === type);
  }

  const checkedCount = checkedItems.size;
  const allChecked = checkedCount === SCENE_CHECKLIST.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Document Accident</Text>
        </View>
        {evidence.length > 0 ? (
          <View style={styles.evidenceBadge}>
            <Text style={styles.evidenceBadgeText}>{evidence.length}</Text>
          </View>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Step 1: Other Driver Info ── */}
        <StepHeader number={1} title="Other Driver Info" done={hasOtherDriver} />
        <TouchableOpacity
          style={[styles.otherDriverCard, hasOtherDriver && styles.otherDriverCardDone]}
          onPress={() => navigation.navigate('OtherDriver')}
          activeOpacity={0.75}
        >
          {hasOtherDriver && <View style={styles.stepDoneBar} />}
          <View style={styles.otherDriverCardBody}>
            <View style={[styles.otherDriverIconWrap, hasOtherDriver && styles.otherDriverIconDone]}>
              <Text style={styles.otherDriverIconEmoji}>🚗</Text>
            </View>
            <View style={styles.otherDriverTextWrap}>
              {hasOtherDriver ? (
                <>
                  <Text style={styles.otherDriverName}>
                    {state.report.otherDriverInfo!.name || 'Other driver saved'}
                  </Text>
                  <Text style={styles.otherDriverMeta}>
                    {[state.report.otherDriverInfo!.licensePlate, state.report.otherDriverInfo!.insuranceCompany]
                      .filter(Boolean).join(' · ') || 'Tap to edit'}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.otherDriverTitle}>Record other driver details</Text>
                  <Text style={styles.otherDriverSubtext}>Name, plate, insurance — needed for your claim</Text>
                </>
              )}
            </View>
            <Text style={styles.otherDriverArrow}>›</Text>
          </View>
        </TouchableOpacity>

        {/* ── Step 2: Take Photos ── */}
        <StepHeader number={2} title="Photograph the Scene" done={evidence.length > 0} />

        {/* Type selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeSelector}
        >
          {EVIDENCE_TYPES.map((et) => {
            const count = getEvidenceByType(et.type).length;
            const isSelected = selectedType === et.type;
            return (
              <TouchableOpacity
                key={et.type}
                style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                onPress={() => setSelectedType(et.type)}
              >
                <Text style={styles.typeChipIcon}>{et.icon}</Text>
                <Text style={[styles.typeChipLabel, isSelected && styles.typeChipLabelSelected]}>
                  {et.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.badge, isSelected && styles.badgeSelected]}>
                    <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Capture buttons */}
        <View style={styles.captureRow}>
          <TouchableOpacity
            style={[styles.captureButton, capturing === 'camera' && styles.captureButtonBusy]}
            onPress={handleCapturePhoto}
            disabled={!!capturing}
          >
            {capturing === 'camera' ? (
              <>
                <ActivityIndicator color={COLORS.white} size="small" />
                <Text style={styles.captureLabel}>Adding GPS tag…</Text>
              </>
            ) : (
              <>
                <Text style={styles.captureIcon}>📸</Text>
                <Text style={styles.captureLabel}>Take Photo</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.captureButtonSecondary, capturing === 'library' && styles.captureButtonSecondaryBusy]}
            onPress={handlePickPhoto}
            disabled={!!capturing}
          >
            {capturing === 'library' ? (
              <>
                <ActivityIndicator color={COLORS.primary} size="small" />
                <Text style={styles.captureLabelSecondary}>Adding GPS tag…</Text>
              </>
            ) : (
              <>
                <Text style={styles.captureIcon}>🖼️</Text>
                <Text style={styles.captureLabelSecondary}>From Library</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Evidence gallery */}
        {evidence.length > 0 && (
          <View style={styles.gallery}>
            {EVIDENCE_TYPES.map((et) => {
              const items = getEvidenceByType(et.type);
              if (items.length === 0) return null;
              return (
                <View key={et.type} style={styles.evidenceSection}>
                  <Text style={styles.evidenceSectionTitle}>
                    {et.icon} {et.label} ({items.length})
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.evidenceRow}>
                      {items.map((item) => (
                        <View key={item.id} style={styles.evidenceThumb}>
                          <Image source={{ uri: item.uri }} style={styles.evidenceImage} />
                          {item.location && (
                            <View style={styles.gpsTag}>
                              <Text style={styles.gpsTagText}>📍</Text>
                            </View>
                          )}
                          <Text style={styles.evidenceTime}>
                            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          {/* X remove button */}
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveEvidence(item.id)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Text style={styles.removeButtonText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Step 3: Scene Checklist ── */}
        <StepHeader
          number={3}
          title="Scene Checklist"
          done={allChecked}
          badge={`${checkedCount}/${SCENE_CHECKLIST.length}`}
        />
        <View style={styles.checklistCard}>
          {SCENE_CHECKLIST.map((item, idx) => {
            const checked = checkedItems.has(item.id);
            const isLast = idx === SCENE_CHECKLIST.length - 1;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.checklistRow, checked && styles.checklistRowChecked, isLast && styles.checklistRowLast]}
                onPress={() => toggleChecked(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  {checked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checklistIcon}>{item.icon}</Text>
                <Text style={[styles.checklistText, checked && styles.checklistTextChecked]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Step 4: Tell Us What Happened ── */}
        <StepHeader number={4} title="Tell Us What Happened" />
        <TouchableOpacity
          style={styles.intakeButton}
          onPress={() => navigation.navigate('Chat', { mode: 'intake' })}
          activeOpacity={0.85}
        >
          <View style={styles.intakeButtonGlow} />
          <View style={styles.intakeButtonInner}>
            <View style={styles.intakeIconWrap}>
              <Text style={styles.intakeIcon}>💬</Text>
            </View>
            <View style={styles.intakeTextWrap}>
              <Text style={styles.intakeTitle}>Describe the Accident</Text>
              <Text style={styles.intakeSubtext}>
                Answer a few questions — we'll build your incident summary
              </Text>
            </View>
            <View style={styles.intakeArrowWrap}>
              <Text style={styles.intakeArrow}>›</Text>
            </View>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Step header component ─────────────────────────────────

function StepHeader({
  number, title, done = false, badge,
}: {
  number: number; title: string; done?: boolean; badge?: string;
}) {
  return (
    <View style={stepStyles.row}>
      <View style={[stepStyles.numberBadge, done && stepStyles.numberBadgeDone]}>
        {done
          ? <Text style={stepStyles.checkIcon}>✓</Text>
          : <Text style={stepStyles.numberText}>{number}</Text>
        }
      </View>
      <Text style={stepStyles.title}>{title}</Text>
      {badge && !done && (
        <View style={stepStyles.badge}>
          <Text style={stepStyles.badgeText}>{badge}</Text>
        </View>
      )}
      {done && <Text style={stepStyles.doneText}>Done</Text>}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  numberBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  numberBadgeDone: { backgroundColor: COLORS.success },
  numberText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },
  checkIcon: { fontSize: 13, color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },
  title: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary },
  badge: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.semibold },
  doneText: { fontSize: FONT_SIZES.xs, color: COLORS.success, fontWeight: FONT_WEIGHTS.semibold },
});

// ── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: SPACING.xxl },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    backgroundColor: COLORS.primaryLight,
  },
  backButton: {
    width: 36, height: 36, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.glass, justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { color: COLORS.textOnPrimary, fontSize: 22, fontWeight: FONT_WEIGHTS.bold, marginTop: -2 },
  headerContent: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnPrimary },
  headerSpacer: { width: 36 },
  evidenceBadge: {
    width: 28, height: 28, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.glow(COLORS.accent, 0.3),
  },
  evidenceBadgeText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },

  // Step 1 — Other Driver
  otherDriverCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  otherDriverCardDone: { borderColor: COLORS.success },
  stepDoneBar: { height: 3, backgroundColor: COLORS.success },
  otherDriverCardBody: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.md,
  },
  otherDriverIconWrap: {
    width: 48, height: 48, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.cardBlue, justifyContent: 'center', alignItems: 'center',
  },
  otherDriverIconDone: { backgroundColor: COLORS.successBg },
  otherDriverIconEmoji: { fontSize: 22 },
  otherDriverTextWrap: { flex: 1 },
  otherDriverName: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary },
  otherDriverMeta: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  otherDriverTitle: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary },
  otherDriverSubtext: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  otherDriverArrow: { fontSize: 22, color: COLORS.textMuted, fontWeight: FONT_WEIGHTS.bold },

  // Step 2 — Photos
  typeSelector: { paddingHorizontal: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.sm },
  typeChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs + 2, marginRight: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.sm,
  },
  typeChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipIcon: { fontSize: 16 },
  typeChipLabel: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.textPrimary },
  typeChipLabelSelected: { color: COLORS.textOnPrimary },
  badge: {
    backgroundColor: COLORS.accent, borderRadius: BORDER_RADIUS.full,
    width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  badgeSelected: { backgroundColor: COLORS.glassLight },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },
  badgeTextSelected: { color: COLORS.textOnPrimary },

  captureRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.md, paddingTop: SPACING.sm },
  captureButton: {
    flex: 1, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.lg,
  },
  captureButtonSecondary: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.soft,
  },
  captureButtonBusy: { opacity: 0.75 },
  captureButtonSecondaryBusy: { opacity: 0.6 },
  captureIcon: { fontSize: 24, marginBottom: SPACING.xs },
  captureLabel: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnPrimary },
  captureLabelSecondary: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary },

  gallery: { marginTop: SPACING.md },
  evidenceSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  evidenceSectionTitle: {
    fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary, marginBottom: SPACING.sm,
  },
  evidenceRow: { flexDirection: 'row', gap: SPACING.sm },
  evidenceThumb: {
    width: 100, height: 120, borderRadius: BORDER_RADIUS.md,
    overflow: 'visible', backgroundColor: COLORS.border,
    borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.sm,
  },
  evidenceImage: { width: 100, height: 85, borderRadius: BORDER_RADIUS.md },
  gpsTag: {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 4, paddingVertical: 2,
  },
  gpsTagText: { fontSize: 10 },
  evidenceTime: {
    fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 4,
  },
  removeButton: {
    position: 'absolute', top: -8, right: -8,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.emergency,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.sm,
  },
  removeButtonText: { fontSize: 10, color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },

  // Step 3 — Checklist
  checklistCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.borderLight,
    overflow: 'hidden', ...SHADOWS.sm,
  },
  checklistRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  checklistRowChecked: { backgroundColor: COLORS.successBg },
  checklistRowLast: { borderBottomWidth: 0 },
  checkbox: {
    width: 24, height: 24, borderRadius: BORDER_RADIUS.full,
    borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: FONT_WEIGHTS.bold },
  checklistIcon: { fontSize: 16 },
  checklistText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  checklistTextChecked: { textDecorationLine: 'line-through', color: COLORS.textMuted },

  // Step 4 — Intake CTA
  intakeButton: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.glow(COLORS.primary, 0.2),
  },
  intakeButtonGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
  },
  intakeButtonInner: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.md + 2, paddingHorizontal: SPACING.md, gap: SPACING.md,
  },
  intakeIconWrap: {
    width: 48, height: 48, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.glassLight,
    justifyContent: 'center', alignItems: 'center',
  },
  intakeIcon: { fontSize: 24 },
  intakeTextWrap: { flex: 1 },
  intakeTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnPrimary },
  intakeSubtext: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.75)', marginTop: 3, lineHeight: 18 },
  intakeArrowWrap: {
    width: 32, height: 32, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.glassLight, justifyContent: 'center', alignItems: 'center',
  },
  intakeArrow: { fontSize: 22, color: COLORS.white, fontWeight: FONT_WEIGHTS.bold, marginTop: -1 },
});
