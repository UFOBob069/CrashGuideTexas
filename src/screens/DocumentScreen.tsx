// ============================================================
// CrashGuide Texas - Document Mode Screen
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
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

export default function DocumentScreen({ navigation }: DocumentScreenProps) {
  const { state, dispatch } = useApp();
  const [selectedType, setSelectedType] = useState<EvidenceType>('vehicle_damage');
  const evidence = state.report.evidence;

  async function handleCapturePhoto() {
    try {
      const item = await capturePhoto(selectedType, `${formatEvidenceTypeLabel(selectedType)} photo`);
      if (item) {
        dispatch({ type: 'ADD_EVIDENCE', payload: item });
        Alert.alert(
          'Photo Captured',
          `${formatEvidenceTypeLabel(selectedType)} photo saved with ${item.location ? 'GPS location' : 'no GPS'} data.`,
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Could not capture photo. Please check camera permissions.');
    }
  }

  async function handlePickPhoto() {
    try {
      const item = await pickPhotoFromLibrary(selectedType, `${formatEvidenceTypeLabel(selectedType)} photo`);
      if (item) {
        dispatch({ type: 'ADD_EVIDENCE', payload: item });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not access photo library. Please check permissions.');
    }
  }

  function handleRemoveEvidence(id: string) {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => dispatch({ type: 'REMOVE_EVIDENCE', payload: id }),
      },
    ]);
  }

  function getEvidenceByType(type: EvidenceType): EvidenceItem[] {
    return evidence.filter((e) => e.type === type);
  }

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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Instructions */}
        <View style={styles.instructions}>
          <View style={styles.instructionIconWrap}>
            <Text style={styles.instructionIcon}>📷</Text>
          </View>
          <View style={styles.instructionText}>
            <Text style={styles.instructionTitle}>Capture Evidence</Text>
            <Text style={styles.instructionBody}>
              Photos are tagged with time and GPS. Good documentation protects your rights.
            </Text>
          </View>
        </View>

        {/* Photo Type Selector */}
        <Text style={styles.sectionTitle}>What are you photographing?</Text>
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
                style={[
                  styles.typeChip,
                  isSelected && styles.typeChipSelected,
                ]}
                onPress={() => setSelectedType(et.type)}
              >
                <Text style={styles.typeChipIcon}>{et.icon}</Text>
                <Text
                  style={[
                    styles.typeChipLabel,
                    isSelected && styles.typeChipLabelSelected,
                  ]}
                >
                  {et.label}
                </Text>
                {count > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Capture Buttons */}
        <View style={styles.captureRow}>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapturePhoto}>
            <View style={styles.captureIconWrap}>
              <Text style={styles.captureIcon}>📸</Text>
            </View>
            <Text style={styles.captureLabel}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButtonSecondary} onPress={handlePickPhoto}>
            <View style={styles.captureIconWrapSecondary}>
              <Text style={styles.captureIcon}>🖼️</Text>
            </View>
            <Text style={styles.captureLabelSecondary}>From Library</Text>
          </TouchableOpacity>
        </View>

        {/* Evidence Gallery */}
        {evidence.length > 0 && (
          <View style={styles.gallery}>
            <Text style={styles.sectionTitle}>
              Captured Evidence ({evidence.length})
            </Text>
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
                        <TouchableOpacity
                          key={item.id}
                          style={styles.evidenceThumb}
                          onLongPress={() => handleRemoveEvidence(item.id)}
                        >
                          <Image
                            source={{ uri: item.uri }}
                            style={styles.evidenceImage}
                          />
                          {item.location && (
                            <View style={styles.gpsTag}>
                              <Text style={styles.gpsTagText}>📍 GPS</Text>
                            </View>
                          )}
                          <Text style={styles.evidenceTime}>
                            {item.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              );
            })}
            <Text style={styles.hintText}>Long-press a photo to remove it</Text>
          </View>
        )}

        {/* Reminders */}
        <View style={styles.reminders}>
          <Text style={styles.remindersTitle}>Don't forget to capture:</Text>
          <View style={styles.reminderGrid}>
            {[
              { icon: '🚗', text: 'All vehicle damage' },
              { icon: '🔢', text: 'License plates' },
              { icon: '🛣️', text: 'Road conditions' },
              { icon: '⛈️', text: 'Weather conditions' },
              { icon: '📝', text: 'Insurance cards' },
              { icon: '👥', text: 'Witness info' },
            ].map((reminder, idx) => (
              <View key={idx} style={styles.reminderItem}>
                <Text style={styles.reminderIcon}>{reminder.icon}</Text>
                <Text style={styles.reminderText}>{reminder.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Chat', { mode: 'intake' })}
        >
          <Text style={styles.continueButtonText}>
            Continue to Accident Details
          </Text>
          <Text style={styles.continueArrow}>›</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primaryLight,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: COLORS.textOnPrimary,
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: -2,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnPrimary,
  },
  headerSpacer: {
    width: 36,
  },
  evidenceBadge: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evidenceBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  instructions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    gap: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  instructionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.cardBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionIcon: {
    fontSize: 24,
  },
  instructionText: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  instructionBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  typeSelector: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  typeChipSelected: {
    backgroundColor: COLORS.primary,
  },
  typeChipIcon: {
    fontSize: 16,
  },
  typeChipLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  typeChipLabelSelected: {
    color: COLORS.textOnPrimary,
  },
  badge: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.full,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  captureRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    paddingTop: SPACING.md,
  },
  captureButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  captureButtonSecondary: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  captureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  captureIconWrapSecondary: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.cardBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  captureIcon: {
    fontSize: 22,
  },
  captureLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnPrimary,
  },
  captureLabelSecondary: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  gallery: {
    marginTop: SPACING.md,
  },
  evidenceSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  evidenceSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  evidenceRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  evidenceThumb: {
    width: 100,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.border,
    ...SHADOWS.sm,
  },
  evidenceImage: {
    width: '100%',
    height: 85,
  },
  gpsTag: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  gpsTagText: {
    fontSize: 9,
    color: COLORS.white,
  },
  evidenceTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 4,
  },
  hintText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },
  reminders: {
    marginTop: SPACING.md,
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  remindersTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  reminderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    width: '48%',
    paddingVertical: SPACING.xs,
  },
  reminderIcon: {
    fontSize: 16,
  },
  reminderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  continueButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  continueButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnAccent,
  },
  continueArrow: {
    fontSize: 24,
    color: COLORS.textOnAccent,
    marginLeft: SPACING.sm,
  },
});
