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

const CATEGORY_INFO: Record<ChecklistCategory, { icon: string; title: string; color: string; bg: string }> = {
  safety: { icon: '🚨', title: 'Immediate Safety', color: COLORS.emergency, bg: COLORS.cardRed },
  medical: { icon: '🏥', title: 'Medical', color: '#DC2626', bg: COLORS.cardRed },
  documentation: { icon: '📷', title: 'Documentation', color: '#3B82F6', bg: COLORS.cardBlue },
  legal: { icon: '⚖️', title: 'Legal', color: COLORS.primary, bg: COLORS.cardBlue },
  insurance: { icon: '🛡️', title: 'Insurance', color: COLORS.accent, bg: COLORS.cardAmber },
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
  const progressPercent = Math.round(progress * 100);

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
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Accident Checklist</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {completedCount} of {totalCount} tasks completed
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {CATEGORY_ORDER.map((category) => {
          const info = CATEGORY_INFO[category];
          const items = getItemsByCategory(category);
          const categoryCompleted = items.filter((i) => i.isCompleted).length;
          const allDone = categoryCompleted === items.length;

          return (
            <View key={category} style={styles.categorySection}>
              <View style={[styles.categoryHeader, { backgroundColor: info.bg }]}>
                <View style={[styles.categoryIconWrap, { backgroundColor: info.color }]}>
                  <Text style={styles.categoryIcon}>{info.icon}</Text>
                </View>
                <Text style={styles.categoryTitle}>{info.title}</Text>
                <View style={[
                  styles.categoryBadge,
                  allDone && styles.categoryBadgeDone,
                ]}>
                  <Text style={[
                    styles.categoryCount,
                    allDone && styles.categoryCountDone,
                  ]}>
                    {categoryCompleted}/{items.length}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsContainer}>
                {items.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.checklistItem,
                      item.isCompleted && styles.checklistItemCompleted,
                      index === items.length - 1 && styles.checklistItemLast,
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
                      <Text style={[
                        styles.checklistDescription,
                        item.isCompleted && styles.checklistDescCompleted,
                      ]}>
                        {item.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Chat', { mode: 'urgent' })}
          >
            <Text style={styles.actionButtonIcon}>🆘</Text>
            <Text style={styles.actionButtonText}>Get Help Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => navigation.navigate('Document')}
          >
            <Text style={styles.actionButtonIcon}>📷</Text>
            <Text style={styles.actionButtonTextSecondary}>
              Document Accident
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
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
  progressSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  progressPercent: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.success,
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
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.md,
  },
  categorySection: {
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    gap: SPACING.sm,
  },
  categoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  categoryBadge: {
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  categoryBadgeDone: {
    backgroundColor: COLORS.successBg,
  },
  categoryCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  categoryCountDone: {
    color: COLORS.success,
  },
  itemsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  checklistItemLast: {
    borderBottomWidth: 0,
  },
  checklistItemCompleted: {
    backgroundColor: COLORS.successBg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
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
    fontSize: 13,
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
  checklistDescCompleted: {
    color: COLORS.textMuted,
  },
  bottomActions: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  actionButton: {
    backgroundColor: COLORS.emergency,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnPrimary,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  actionButtonTextSecondary: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
});
