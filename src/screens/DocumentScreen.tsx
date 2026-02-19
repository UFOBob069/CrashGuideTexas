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
  Modal,
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
  const [showTypeModal, setShowTypeModal] = useState(false);
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
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📷 Document Accident</Text>
        <Text style={styles.evidenceCount}>{evidence.length} photos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Capture Evidence</Text>
          <Text style={styles.instructionText}>
            Take photos of everything. Good documentation protects your rights. Photos are automatically tagged with time and GPS location.
          </Text>
        </View>

        {/* Photo Type Selector */}
        <Text style={styles.sectionTitle}>What are you photographing?</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeSelector}
        >
          {EVIDENCE_TYPES.map((et) => (
            <TouchableOpacity
              key={et.type}
              style={[
                styles.typeChip,
                selectedType === et.type && styles.typeChipSelected,
              ]}
              onPress={() => setSelectedType(et.type)}
            >
              <Text style={styles.typeChipIcon}>{et.icon}</Text>
              <Text
                style={[
                  styles.typeChipLabel,
                  selectedType === et.type && styles.typeChipLabelSelected,
                ]}
              >
                {et.label}
              </Text>
              {getEvidenceByType(et.type).length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {getEvidenceByType(et.type).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Capture Buttons */}
        <View style={styles.captureRow}>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapturePhoto}>
            <Text style={styles.captureIcon}>📸</Text>
            <Text style={styles.captureLabel}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButtonSecondary} onPress={handlePickPhoto}>
            <Text style={styles.captureIcon}>🖼️</Text>
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
          <Text style={styles.sectionTitle}>Don't forget to capture:</Text>
          <View style={styles.reminderList}>
            {[
              { icon: '🚗', text: 'All vehicle damage from multiple angles' },
              { icon: '🔢', text: 'License plates of all vehicles' },
              { icon: '🛣️', text: 'Road conditions, signs, and signals' },
              { icon: '⛈️', text: 'Weather and visibility conditions' },
              { icon: '📝', text: 'Other driver\'s insurance card' },
              { icon: '👥', text: 'Witness names and contact info' },
            ].map((reminder, idx) => (
              <View key={idx} style={styles.reminderItem}>
                <Text style={styles.reminderIcon}>{reminder.icon}</Text>
                <Text style={styles.reminderText}>{reminder.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Continue to Chat */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Chat', { mode: 'intake' })}
        >
          <Text style={styles.continueButtonText}>
            Continue to Accident Details →
          </Text>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primaryLight,
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
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textOnPrimary,
  },
  evidenceCount: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FONT_WEIGHTS.medium,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  instructions: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  instructionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  instructionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
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
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
    marginRight: SPACING.sm,
  },
  typeChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeChipIcon: {
    fontSize: 16,
  },
  typeChipLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
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
    color: COLORS.textOnPrimary,
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
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  captureButtonSecondary: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  captureIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  captureLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textOnPrimary,
  },
  captureLabelSecondary: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
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
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
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
    backgroundColor: COLORS.surface,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reminderList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  reminderIcon: {
    fontSize: 16,
  },
  reminderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  continueButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  continueButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textOnAccent,
  },
});
