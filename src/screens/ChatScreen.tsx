// ============================================================
// CrashGuide Texas - LLM Chat Screen
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { randomUUID } from 'expo-crypto';
import { RootStackParamList, ChatMessage, ChatMode } from '../types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { sendChatMessage, extractReportData } from '../services/llmService';

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chat'>;
  route: RouteProp<RootStackParamList, 'Chat'>;
};

const MODE_HEADERS: Record<ChatMode, { title: string; color: string; icon: string }> = {
  urgent: { title: 'Urgent Help', color: COLORS.emergency, icon: '🚑' },
  document: { title: 'Document Accident', color: COLORS.primaryLight, icon: '📷' },
  intake: { title: 'Tell Us What Happened', color: COLORS.primary, icon: '📝' },
  connect: { title: 'Connect with Lawyer', color: COLORS.success, icon: '⚖️' },
};

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { mode } = route.params;
  const { state, dispatch } = useApp();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const messages = state.chatMessages[mode];
  const modeInfo = MODE_HEADERS[mode];

  useEffect(() => {
    if (messages.length === 0) {
      sendInitialMessage();
    }
  }, []);

  useEffect(() => {
    if (!isTyping) return;
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(560),
        ]),
      );
    const anim = Animated.parallel([pulse(dot1, 0), pulse(dot2, 200), pulse(dot3, 400)]);
    anim.start();
    return () => anim.stop();
  }, [isTyping]);

  async function sendInitialMessage() {
    setIsTyping(true);
    const greeting = getInitialGreeting(mode);
    const botMessage: ChatMessage = {
      id: randomUUID(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
      mode,
    };
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { mode, message: botMessage } });
    setIsTyping(false);
  }

  async function handleSend() {
    const text = inputText.trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      mode,
    };
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { mode, message: userMessage } });
    setInputText('');
    setIsTyping(true);

    try {
      const allMessages = [...messages, userMessage];
      const response = await sendChatMessage(allMessages, mode);

      const assistantMessage: ChatMessage = {
        id: randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        mode,
        metadata: response.extractedData ? { extractedData: response.extractedData } : undefined,
      };
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { mode, message: assistantMessage } });

      if (response.extractedData) {
        dispatch({ type: 'UPDATE_REPORT', payload: response.extractedData });
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: randomUUID(),
        role: 'assistant',
        content: 'I apologize, but I had trouble responding. Please try again.',
        timestamp: new Date(),
        mode,
      };
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { mode, message: errorMessage } });
    } finally {
      setIsTyping(false);
    }
  }

  async function handleFinalize() {
    if (isFinalizing || isTyping) return;
    setIsFinalizing(true);
    try {
      const extracted = await extractReportData(messages);
      const summary = messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .join(' ');
      dispatch({
        type: 'UPDATE_REPORT',
        payload: { ...extracted, incidentDescription: summary },
      });
    } catch {
      // non-fatal — still navigate
    } finally {
      setIsFinalizing(false);
    }
    navigation.navigate('ConnectLawyer', { report: state.report });
  }

  const userMessageCount = messages.filter((m) => m.role === 'user').length;

  function handleQuickAction(action: string) {
    switch (action) {
      case 'call_911':
        if (Platform.OS === 'web') {
          window.open('tel:911', '_self');
        } else {
          Linking.openURL('tel:911');
        }
        break;
      case 'take_photo':
        navigation.navigate('Document');
        break;
      case 'checklist':
        navigation.navigate('Checklist');
        break;
      case 'connect_lawyer':
        navigation.navigate('ConnectLawyer', { report: state.report });
        break;
      case 'switch_document':
        navigation.navigate('Chat', { mode: 'document' });
        break;
      case 'switch_intake':
        navigation.navigate('Chat', { mode: 'intake' });
        break;
      case 'switch_connect':
        navigation.navigate('Chat', { mode: 'connect' });
        break;
    }
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <Text style={styles.assistantAvatarText}>CG</Text>
          </View>
        )}
        <View style={[
          styles.bubbleContent,
          isUser ? styles.userBubbleContent : styles.assistantBubbleContent,
        ]}>
          {isUser ? (
            <Text style={[styles.messageText, styles.userText]}>
              {item.content}
            </Text>
          ) : (
            <Markdown style={markdownStyles}>{item.content}</Markdown>
          )}
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Mode Header */}
        <View style={[styles.modeHeader, { backgroundColor: modeInfo.color }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={styles.modeHeaderContent}>
            <Text style={styles.modeIcon}>{modeInfo.icon}</Text>
            <Text style={styles.modeTitle}>{modeInfo.title}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Quick Actions — hidden for intake (no top buttons needed) */}
        {mode !== 'intake' && (
        <View style={styles.quickActions}>
          {mode === 'urgent' && (
            <>
              <TouchableOpacity
                style={[styles.quickAction, styles.emergencyAction]}
                onPress={() => handleQuickAction('call_911')}
              >
                <Text style={styles.quickActionEmoji}>📞</Text>
                <Text style={[styles.quickActionText, styles.emergencyActionText]}>Call 911</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => handleQuickAction('take_photo')}
              >
                <Text style={styles.quickActionEmoji}>📷</Text>
                <Text style={styles.quickActionText}>Photos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => handleQuickAction('checklist')}
              >
                <Text style={styles.quickActionEmoji}>📋</Text>
                <Text style={styles.quickActionText}>Checklist</Text>
              </TouchableOpacity>
            </>
          )}
          {mode === 'document' && (
            <>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => handleQuickAction('take_photo')}
              >
                <Text style={styles.quickActionEmoji}>📷</Text>
                <Text style={styles.quickActionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => handleQuickAction('switch_intake')}
              >
                <Text style={styles.quickActionEmoji}>📝</Text>
                <Text style={styles.quickActionText}>Start Intake</Text>
              </TouchableOpacity>
            </>
          )}
          {mode === 'connect' && (
            <TouchableOpacity
              style={[styles.quickAction, styles.connectAction]}
              onPress={() => handleQuickAction('connect_lawyer')}
            >
              <Text style={styles.quickActionEmoji}>📞</Text>
              <Text style={[styles.quickActionText, styles.connectActionText]}>Call Now</Text>
            </TouchableOpacity>
          )}
        </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Starting conversation...</Text>
            </View>
          }
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDots}>
              {[dot1, dot2, dot3].map((dot, i) => (
                <Animated.View
                  key={i}
                  style={[styles.typingDot, {
                    opacity: dot,
                    transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
                  }]}
                />
              ))}
            </View>
            <Text style={styles.typingText}>CrashGuide is thinking...</Text>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={2000}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
          >
            <Text style={styles.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.complianceFooter}>
          <Text style={styles.complianceText}>
            General information only — not legal advice
          </Text>
        </View>

        {/* Finalize Banner — sits at the very bottom, intake only */}
        {mode === 'intake' && userMessageCount >= 1 && (
          <TouchableOpacity
            style={[styles.finalizeBanner, isFinalizing && styles.finalizeBannerLoading]}
            onPress={handleFinalize}
            disabled={isFinalizing || isTyping}
            activeOpacity={0.85}
          >
            {isFinalizing ? (
              <>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text style={styles.finalizeBannerText}>Building your summary…</Text>
              </>
            ) : (
              <>
                <Text style={styles.finalizeBannerEmoji}>⚖️</Text>
                <View style={styles.finalizeBannerBody}>
                  <Text style={styles.finalizeBannerTitle}>Done? Connect with a Lawyer</Text>
                  <Text style={styles.finalizeBannerSub}>Saves your summary and starts the consultation</Text>
                </View>
                <Text style={styles.finalizeBannerArrow}>›</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const markdownStyles = {
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  strong: {
    fontWeight: FONT_WEIGHTS.bold as any,
    color: COLORS.textPrimary,
  },
  bullet_list: {
    marginTop: 4,
  },
  ordered_list: {
    marginTop: 4,
  },
  list_item: {
    marginBottom: 4,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 6,
  },
};

function getInitialGreeting(mode: ChatMode): string {
  switch (mode) {
    case 'urgent':
      return 'I\'m here to help. Let\'s take this one step at a time.\n\n**First — are you in a safe place right now?** Are you off the road and away from traffic?\n\nIf anyone is seriously injured, please call **911** right away.';
    case 'document':
      return 'Let\'s document your accident thoroughly. Good documentation protects your rights.\n\n**Start by taking photos of:**\n1. All vehicle damage (every angle)\n2. License plates of all vehicles involved\n3. The overall accident scene\n4. Any visible injuries\n\nTap the camera button above to start capturing photos.';
    case 'intake':
      return 'I\'d like to understand what happened so I can point you in the right direction.\n\n**Can you tell me briefly what happened?** For example:\n- What type of accident was it?\n- Where did it happen?';
    case 'connect':
      return 'I can connect you with a **Texas personal injury lawyer** who handles accident cases.\n\nHere\'s how it works:\n- You share your contact info\n- A qualified Texas lawyer will reach out to you\n- The initial consultation is **free and no-obligation**\n\nWould you like to get started?';
    default:
      return 'How can I help you?';
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: COLORS.textOnPrimary,
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: -2,
  },
  modeHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  modeIcon: {
    fontSize: 20,
  },
  modeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textOnPrimary,
  },
  headerSpacer: {
    width: 36,
  },

  // ── Quick Actions ──
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceTinted,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  emergencyAction: {
    backgroundColor: COLORS.emergencyBg,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  connectAction: {
    backgroundColor: COLORS.successBg,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  quickActionEmoji: {
    fontSize: 14,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  emergencyActionText: {
    color: COLORS.emergencyDark,
  },
  connectActionText: {
    color: COLORS.successDark,
  },

  // ── Messages ──
  messagesList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexGrow: 1,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    maxWidth: '85%',
    flexShrink: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    gap: SPACING.sm,
  },
  assistantAvatar: {
    width: 30,
    height: 30,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  assistantAvatarText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.accent,
  },
  bubbleContent: {
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    flexShrink: 1,
  },
  userBubbleContent: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  assistantBubbleContent: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.textOnPrimary,
  },
  assistantText: {
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // ── Typing ──
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
  },
  typingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },

  // ── Input ──
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  textInput: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  sendButtonText: {
    color: COLORS.textOnPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.lg,
  },
  complianceFooter: {
    paddingVertical: SPACING.xs + 2,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  complianceText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },

  // ── Finalize banner ──
  finalizeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
    ...SHADOWS.glow(COLORS.success, 0.25),
  },
  finalizeBannerLoading: { opacity: 0.7 },
  finalizeBannerEmoji: { fontSize: 20 },
  finalizeBannerBody: { flex: 1 },
  finalizeBannerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  finalizeBannerSub: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  finalizeBannerArrow: {
    fontSize: 22,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
  },
  finalizeBannerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
