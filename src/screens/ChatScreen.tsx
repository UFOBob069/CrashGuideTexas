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
  ActivityIndicator,
  SafeAreaView,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { RootStackParamList, ChatMessage, ChatMode, SuggestedAction } from '../types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { sendChatMessage } from '../services/llmService';

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
  const flatListRef = useRef<FlatList>(null);
  const messages = state.chatMessages[mode];
  const modeInfo = MODE_HEADERS[mode];

  useEffect(() => {
    // Send initial greeting if no messages
    if (messages.length === 0) {
      sendInitialMessage();
    }
  }, []);

  async function sendInitialMessage() {
    setIsTyping(true);
    const greeting = getInitialGreeting(mode);
    const botMessage: ChatMessage = {
      id: uuidv4(),
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

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
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
        id: uuidv4(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        mode,
        metadata: response.extractedData ? { extractedData: response.extractedData } : undefined,
      };
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { mode, message: assistantMessage } });

      // Update report with extracted data
      if (response.extractedData) {
        dispatch({ type: 'UPDATE_REPORT', payload: response.extractedData });
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: uuidv4(),
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

  function handleQuickAction(action: string) {
    switch (action) {
      case 'call_911':
        Linking.openURL('tel:911');
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
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {item.content}
        </Text>
        <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Mode Header */}
      <View style={[styles.modeHeader, { backgroundColor: modeInfo.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.modeIcon}>{modeInfo.icon}</Text>
        <Text style={styles.modeTitle}>{modeInfo.title}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {mode === 'urgent' && (
          <>
            <TouchableOpacity
              style={[styles.quickAction, styles.emergencyAction]}
              onPress={() => handleQuickAction('call_911')}
            >
              <Text style={styles.quickActionText}>📞 Call 911</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => handleQuickAction('take_photo')}
            >
              <Text style={styles.quickActionText}>📷 Photos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => handleQuickAction('checklist')}
            >
              <Text style={styles.quickActionText}>📋 Checklist</Text>
            </TouchableOpacity>
          </>
        )}
        {mode === 'document' && (
          <>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => handleQuickAction('take_photo')}
            >
              <Text style={styles.quickActionText}>📷 Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => handleQuickAction('switch_intake')}
            >
              <Text style={styles.quickActionText}>📝 Start Intake</Text>
            </TouchableOpacity>
          </>
        )}
        {mode === 'intake' && (
          <TouchableOpacity
            style={[styles.quickAction, styles.connectAction]}
            onPress={() => handleQuickAction('connect_lawyer')}
          >
            <Text style={styles.quickActionText}>⚖️ Talk to a Lawyer</Text>
          </TouchableOpacity>
        )}
        {mode === 'connect' && (
          <TouchableOpacity
            style={[styles.quickAction, styles.connectAction]}
            onPress={() => handleQuickAction('connect_lawyer')}
          >
            <Text style={styles.quickActionText}>📞 Call Now</Text>
          </TouchableOpacity>
        )}
      </View>

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
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.typingText}>CrashGuide is typing...</Text>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
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
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Compliance Footer */}
        <View style={styles.complianceFooter}>
          <Text style={styles.complianceText}>
            General information only — not legal advice
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  backText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  modeIcon: {
    fontSize: 22,
    marginRight: SPACING.sm,
  },
  modeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textOnPrimary,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  quickAction: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emergencyAction: {
    backgroundColor: COLORS.emergencyBg,
    borderColor: COLORS.emergency,
  },
  connectAction: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  messagesList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: 'rgba(255, 255, 255, 0.6)',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  sendButtonText: {
    color: COLORS.textOnPrimary,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: FONT_SIZES.md,
  },
  complianceFooter: {
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  complianceText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
