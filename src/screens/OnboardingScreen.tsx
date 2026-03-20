// ============================================================
// CrashGuide Texas - Onboarding Screen (first launch only)
// ============================================================

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export const ONBOARDING_KEY = 'cgt_onboarding_complete';

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🚗',
    emojiBg: COLORS.cardRed,
    title: 'Just had an accident?',
    body: "Stay calm — CrashGuide walks you through exactly what to do, step by step, in the moments after a crash.",
  },
  {
    id: '2',
    emoji: '📋',
    emojiBg: COLORS.cardBlue,
    title: 'Document everything',
    body: "Capture photos of the scene, collect the other driver's info, and build a timestamped evidence log — all in one place.",
  },
  {
    id: '3',
    emoji: '⚖️',
    emojiBg: COLORS.cardGreen,
    title: 'Know your rights',
    body: "Connect with a Texas personal injury lawyer for a free, no-obligation consultation whenever you're ready.",
  },
];

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  async function finish() {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    navigation.replace('Home');
  }

  function next() {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      finish();
    }
  }

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={finish} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.emojiCircle, { backgroundColor: item.emojiBg }]}>
              <Text style={styles.emojiText}>{item.emoji}</Text>
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideBody}>{item.body}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.35, 1, 0.35],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>

      {/* CTA */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.ctaButton} onPress={next}>
          <Text style={styles.ctaText}>{isLast ? "Let's Get Started" : 'Next'}</Text>
        </TouchableOpacity>

        {isLast && (
          <Text style={styles.disclaimer}>
            General information only — not legal advice
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  skipButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },

  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl + SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl + SPACING.md,
    ...SHADOWS.lg,
  },
  emojiText: {
    fontSize: 56,
  },
  slideTitle: {
    fontSize: FONT_SIZES.display,
    fontWeight: FONT_WEIGHTS.heavy,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: SPACING.lg,
  },
  slideBody: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  bottomSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === 'android' ? SPACING.xl : SPACING.lg,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md + 4,
    alignItems: 'center',
    ...SHADOWS.glow(COLORS.primary, 0.2),
  },
  ctaText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnPrimary,
  },
  disclaimer: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
