// ============================================================
// CrashGuide Texas - My Accident Reports Screen
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, AccidentSummary } from '../types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getAccidentList, getAccident, getMessages, deleteAccident } from '../services/accidentService';

type AccidentsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Accidents'>;
};

const SEVERITY_COLOR: Record<string, string> = {
  severe: COLORS.emergency,
  moderate: '#F59E0B',
  minor: COLORS.success,
  none: COLORS.textMuted,
  unknown: COLORS.textMuted,
};

export default function AccidentsScreen({ navigation }: AccidentsScreenProps) {
  const { user } = useAuth();
  const { state, dispatch } = useApp();
  const [accidents, setAccidents] = useState<AccidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAccidents = useCallback(async () => {
    if (!user) return;
    try {
      const list = await getAccidentList(user.uid);
      setAccidents(list);
      dispatch({ type: 'SET_ACCIDENTS', payload: list });
    } catch (e) {
      Alert.alert('Error', 'Could not load accident reports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchAccidents(); }, [fetchAccidents]);

  async function handleLoadAccident(summary: AccidentSummary) {
    if (!user) return;
    setLoadingId(summary.id);
    try {
      const result = await getAccident(user.uid, summary.id);
      if (!result) { Alert.alert('Error', 'Report not found.'); return; }
      const messages = await getMessages(user.uid, summary.id);
      dispatch({
        type: 'LOAD_ACCIDENT',
        payload: {
          report: result.report,
          checklist: result.checklist,
          chatMessages: messages,
          accidentId: summary.id,
        },
      });
      navigation.navigate('Home');
    } catch {
      Alert.alert('Error', 'Could not load this report.');
    } finally {
      setLoadingId(null);
    }
  }

  function handleNewAccident() {
    Alert.alert(
      'Start New Report',
      'This will start a fresh accident report. Your current report is already saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start New',
          onPress: () => {
            dispatch({ type: 'NEW_ACCIDENT' });
            navigation.navigate('Home');
          },
        },
      ],
    );
  }

  function handleDeleteAccident(item: AccidentSummary) {
    Alert.alert(
      'Delete Report',
      `Delete "${item.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            setDeletingId(item.id);
            try {
              await deleteAccident(user.uid, item.id);
              // If we just deleted the active report, clear it
              if (item.id === state.currentAccidentId) {
                dispatch({ type: 'NEW_ACCIDENT' });
              }
              setAccidents((prev) => prev.filter((a) => a.id !== item.id));
            } catch {
              Alert.alert('Error', 'Could not delete this report. Please try again.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  }

  function renderItem({ item }: { item: AccidentSummary }) {
    const isActive = item.id === state.currentAccidentId;
    const isLoading = loadingId === item.id;
    const severityColor = SEVERITY_COLOR[item.injurySeverity] ?? COLORS.textMuted;
    const date = item.incidentDate ?? item.createdAt;

    const isDeleting = deletingId === item.id;

    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={[styles.card, isActive && styles.cardActive]}
          onPress={() => handleLoadAccident(item)}
          activeOpacity={0.75}
          disabled={!!loadingId || !!deletingId}
        >
          {isActive && <View style={styles.activeBar} />}
          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              {isActive && (
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>Current</Text>
                </View>
              )}
            </View>

            <View style={styles.cardMeta}>
              <Text style={styles.cardDate}>
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
              <Text style={[styles.severityText, { color: severityColor }]}>
                {item.injurySeverity.replace(/_/g, ' ')}
              </Text>
              {item.evidenceCount > 0 && (
                <Text style={styles.evidenceCount}>· 📷 {item.evidenceCount}</Text>
              )}
            </View>

            <Text style={styles.cardUpdated}>
              Updated {item.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>

          <View style={styles.cardArrowWrap}>
            {isLoading
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <Text style={styles.cardArrow}>›</Text>
            }
          </View>
        </TouchableOpacity>

        {/* Delete X button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAccident(item)}
          disabled={!!loadingId || !!deletingId}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          {isDeleting
            ? <ActivityIndicator size="small" color={COLORS.white} />
            : <Text style={styles.deleteButtonText}>✕</Text>
          }
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Reports</Text>
        </View>
        <TouchableOpacity style={styles.newButton} onPress={handleNewAccident}>
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : accidents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No reports yet</Text>
          <Text style={styles.emptyBody}>
            Your accident reports will appear here once you start documenting.
          </Text>
        </View>
      ) : (
        <FlatList
          data={accidents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchAccidents(); }}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {accidents.length} report{accidents.length !== 1 ? 's' : ''} saved to your account
            </Text>
          }
        />
      )}
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
    width: 36, height: 36, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.glass, justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { color: COLORS.textOnPrimary, fontSize: 22, fontWeight: FONT_WEIGHTS.bold, marginTop: -2 },
  headerContent: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnPrimary },
  newButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
  },
  newButtonText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnAccent },

  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  loadingText: { fontSize: FONT_SIZES.md, color: COLORS.textMuted },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  emptyBody: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },

  list: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  listHeader: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },

  cardWrapper: {
    marginBottom: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.emergency,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  deleteButtonText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
  },
  cardActive: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  activeBar: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
  },
  cardBody: { flex: 1, padding: SPACING.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
  cardTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary, textTransform: 'capitalize' },
  activePill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  activePillText: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textOnPrimary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs + 2, marginBottom: 4 },
  cardDate: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  severityDot: { width: 6, height: 6, borderRadius: 3 },
  severityText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold, textTransform: 'capitalize' },
  evidenceCount: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  cardUpdated: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  cardArrowWrap: { paddingRight: SPACING.md, width: 36, alignItems: 'center' },
  cardArrow: { fontSize: 24, color: COLORS.textMuted, fontWeight: FONT_WEIGHTS.bold },
});
