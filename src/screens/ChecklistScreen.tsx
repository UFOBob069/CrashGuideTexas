// ============================================================
// CrashGuide Texas - Accident Checklist Screen
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
import { RootStackParamList, ChecklistCategory } from '../types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';

type ChecklistScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Checklist'>;
};

const CATEGORY_INFO: Record<ChecklistCategory, { icon: string; title: string; color: string }> = {
  safety: { icon: '🚨', title: 'Immediate Safety', color: COLORS.emergency },
  medical: { icon: '🏥', title: 'Medical', color: '#E53E3E' },
  documentation: { icon: '📷', title: 'Documentation', color: COLORS.primaryLight },
  legal: { icon: '⚖️', title: 'Legal', color: COLORS.primary },
  insurance: { icon: '🛡️', title: 'Insurance', color: COLORS.accent },
};

const CATEGORY_ORDER: ChecklistCategory[] = [
  'safety',
  'medical',
  'documentation',
  'legal',
  'insurance',
];

export default function ChecklistScreen({ navigation }: ChecklistScreenProps) {
  const { state, dispatch } = useApp();
  const { checklist } = state;

  const completedCount = checklist.filter((i) => i.isCompleted).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  function getItemsByCategory(category: ChecklistCategory) {
    return checklist
      .filter((item) => item.category === category)
      .sort((a, b) => a.priority - b.priority);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Accident Checklist</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {completedCount} of {totalCount} completed
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {CATEGORY_ORDER.map((category) => {
          const info = CATEGORY_INFO[category];
          const items = getItemsByCategory(category);
          const categoryCompleted = items.filter((i) => i.isCompleted).length;

          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>{info.icon}</Text>
                <Text style={styles.categoryTitle}>{info.title}</Text>
                <Text style={styles.categoryCount}>
                  {categoryCompleted}/{items.length}
                </Text>
              </View>

              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.checklistItem,
                    item.isCompleted && styles.checklistItemCompleted,
                  ]}
                  onPress={() =>
                    dispatch({ type: 'TOGGLE_CHECKLIST_ITEM', payload: item.id })
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      item.isCompleted && styles.checkboxChecked,
                    ]}
                  >
                    {item.isCompleted && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.checklistContent}>
                    <Text
                      style={[
                        styles.checklistTitle,
                        item.isCompleted && styles.checklistTitleCompleted,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.checklistDescription}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Chat', { mode: 'urgent' })}
          >
            <Text style={styles.actionButtonText}>🆘 Get Help Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => navigation.navigate('Document')}
          >
            <Text style={styles.actionButtonTextSecondary}>
              📷 Document Accident
            </Text>
          </TouchableOpacity>
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
  progressSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  categorySection: {
    marginTop: SPACING.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryTitle: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  categoryCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  checklistItem: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: SPACING.md,
  },
  checklistItemCompleted: {
    backgroundColor: COLORS.successBg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.bold,
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  checklistTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  checklistDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomActions: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    gap: SPACING.md,
  },
  actionButton: {
    backgroundColor: COLORS.emergency,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textOnPrimary,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonTextSecondary: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
});
