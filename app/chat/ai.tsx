import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Pressable, ActivityIndicator, Platform, Keyboard,
} from 'react-native';
// Native-insets KeyboardAvoidingView in real builds, manual keyboard-height
// fallback in Expo Go (see src/components/Keyboard.tsx for why).
import { KeyboardAvoidingView } from '@/src/components/Keyboard';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';

import {
  requestSpeechPermissions, startSpeechRecognition,
  stopSpeechRecognition, abortSpeechRecognition
} from '@/src/utils/speechRecognition';
import { BACKEND_URL } from '@/src/constants/env';
import { color, font, radius, shadow, space, touch } from '@/constants/theme';
import { translateText } from '@/src/utils/translation';
import { AIAction } from '@/src/types';
import AIActionCard from '@/src/components/AIActionCard';
import { useToast, useConfirm } from '@/src/components/ui';

const MESSAGES_KEY = '@smaahi_ai_chat_messages';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  action?: AIAction;
}

const WELCOME_MESSAGE: Message = {
  id: '0',
  role: 'bot',
  text: 'Hello! I am the S-MAHII AI assistant. I can help you find skilled artisans like plumbers, electricians, mechanics, and more. What service do you need today?',
};

const SUGGESTED_PROMPTS = [
  'Translate Hausa to English',
  'Find a service',
  'What can you help me with?',
  'Help me write a message',
];

export default function AIChatScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { show: showToast } = useToast();
  const confirm = useConfirm();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  // Measured (not hardcoded) so the iOS keyboard offset always matches this
  // screen's actual header, however tall it ends up being.
  const [headerHeight, setHeaderHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Nothing beyond the initial greeting yet — show the hero empty state
  // instead of a near-blank transcript.
  const isEmpty = messages.length <= 1;

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(MESSAGES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch {}
    })();
    return () => { abortSpeechRecognition(); };
  }, []);

  useEffect(() => {
    // Persist messages, but strip actions before saving (they contain route data, not needed in storage)
    const toStore = messages.map(m => ({ ...m, action: undefined }));
    AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(toStore)).catch(() => {});
  }, [messages]);

  // The composer's "padding" offset only accounts for the keyboard height,
  // not for the transcript's scroll position — without this, the last
  // message can end up hidden above the fold when the keyboard opens.
  useEffect(() => {
    const showEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const sub = Keyboard.addListener(showEvent, () => {
      requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
    });
    return () => sub.remove();
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      const transcript = await stopSpeechRecognition();
      if (transcript) {
        setInputText(transcript);
      } else {
        // ___NO_API_KEY___/___QUOTA_ERROR___ are internal sentinels from
        // stopSpeechRecognition() — neither is meaningful to a user, both
        // just mean "voice input isn't available right now."
        let message = t('No speech detected. Please try again.');
        if (transcript === '___NO_API_KEY___' || transcript === '___QUOTA_ERROR___') {
          message = t('Voice input is temporarily unavailable. Please try again later.');
        }
        showToast(message, { type: 'info' });
      }
      return;
    }

    const granted = await requestSpeechPermissions();
    if (!granted) {
      showToast('Microphone permission is needed to use voice input.', { type: 'error' });
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/sent.wav'));
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) await sound.unloadAsync();
      });
    } catch {}

    setIsRecording(true);
    try {
      await startSpeechRecognition();
    } catch (err) {
      console.error('[AIChat] Failed to start:', err);
      setIsRecording(false);
      showToast('Failed to start voice recording. Please try again.', { type: 'error' });
    }
  };

  // --- Action handlers: bridge AI actions to app navigation/search ---

  const handleArtisanPress = useCallback((artisanUserId: number) => {
    router.push(`/artisan/${artisanUserId}`);
  }, [router]);

  const handleNavigate = useCallback((route: string) => {
    router.push(route as any);
  }, [router]);

  const handleSearchLocal = useCallback((query: string) => {
    // Navigate to home screen with search query as a param
    router.push({
      pathname: '/(tabs)/(home)',
      params: { aiSearch: query },
    });
  }, [router]);

  const handleCategoryLocal = useCallback((categoryId: number, categoryName: string) => {
    // Navigate to home screen with category filter params
    router.push({
      pathname: '/(tabs)/(home)',
      params: { aiCategoryId: String(categoryId), aiCategoryName: categoryName },
    });
  }, [router]);

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.role === 'bot' ? 'assistant' as const : 'user' as const,
        content: m.text,
      }));

      const res = await axios.post(
        `${BACKEND_URL}/api/ai/chat/`,
        { messages: apiMessages },
        { timeout: 30000 }
      );

      const reply = res.data.reply || 'Sorry, I could not generate a response.';
      const action: AIAction | undefined = res.data.action || undefined;

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: reply,
        action,
      }]);
    } catch (err: any) {
      const errorText = err.response?.status === 429
        ? 'Too many requests. Please wait a moment and try again.'
        : err.response?.status === 503
          ? 'AI service is not configured yet.'
          : 'Sorry, I could not process your request. Please try again.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: errorText,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (isLoading) return;
    const ok = await confirm({
      title: t('Start a new chat?'),
      message: t('This clears your current conversation with the AI assistant.'),
      confirmLabel: t('Start new chat'),
      cancelLabel: t('Cancel'),
      destructive: true,
    });
    if (!ok) return;
    setMessages([WELCOME_MESSAGE]);
    setTranslatedMap({});
    AsyncStorage.removeItem(MESSAGES_KEY).catch(() => {});
  };

  const [translatedMap, setTranslatedMap] = useState<Record<string, string>>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const handleTranslateMessage = useCallback(async (msgId: string, text: string) => {
    if (translatedMap[msgId]) {
      setTranslatedMap(prev => {
        const next = { ...prev };
        delete next[msgId];
        return next;
      });
      return;
    }
    setTranslatingId(msgId);
    try {
      const result = await translateText(text, 'auto', 'ha');
      if (result !== text) setTranslatedMap(prev => ({ ...prev, [msgId]: result }));
    } catch {}
    setTranslatingId(null);
  }, [translatedMap]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.bubbleRow,
      item.role === 'user' ? styles.userRow : styles.botRow
    ]}>
      {item.role === 'bot' && (
        <View style={styles.botAvatar}>
          <MaterialIcons name="auto-awesome" size={15} color="#FFF" />
        </View>
      )}
      <View style={{ maxWidth: '78%' }}>
        <View style={[
          styles.bubble,
          item.role === 'user' ? styles.userBubble : styles.botBubble
        ]}>
          {item.role === 'bot' && (
            <Text style={styles.botName}>S-MAHII AI</Text>
          )}
          <Text style={[
            styles.bubbleText,
            item.role === 'user' ? styles.userText : styles.botText
          ]}>{translatedMap[item.id] || item.text}</Text>
          {item.role === 'bot' && (
            <TouchableOpacity
              onPress={() => handleTranslateMessage(item.id, item.text)}
              style={styles.translateBtn}
              accessibilityRole="button"
              accessibilityLabel={translatedMap[item.id] ? t('Show original text') : t('Translate to Hausa')}
            >
              {translatingId === item.id ? (
                <ActivityIndicator size={11} color={color.ink400} />
              ) : (
                <MaterialIcons
                  name={translatedMap[item.id] ? 'undo' : 'translate'}
                  size={13}
                  color={translatedMap[item.id] ? color.brand600 : color.ink400}
                />
              )}
              <Text style={[styles.translateText, translatedMap[item.id] && { color: color.brand600 }]}>
                {translatedMap[item.id] ? 'Original' : 'Hausa'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {item.role === 'bot' && item.action && (
          <AIActionCard
            action={item.action}
            onArtisanPress={handleArtisanPress}
            onNavigate={handleNavigate}
            onSearchLocal={handleSearchLocal}
            onCategoryLocal={handleCategoryLocal}
          />
        )}
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.bubbleRow, styles.botRow]}>
      <View style={styles.botAvatar}>
        <MaterialIcons name="auto-awesome" size={15} color="#FFF" />
      </View>
      <View style={[styles.bubble, styles.botBubble]}>
        <Text style={styles.botName}>S-MAHII AI</Text>
        <Text style={styles.typingText}>…</Text>
      </View>
    </View>
  );

  const sendDisabled = !inputText.trim() || isLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header — the only header on this screen; the framework's default
          Stack header is disabled for this route (see app/_layout.tsx) so
          there's never a duplicate title bar or back button. */}
      <View style={styles.header} onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
          <MaterialIcons name="arrow-back" size={19} color="#FFF" />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <MaterialIcons name="auto-awesome" size={16} color="#FACC15" />
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle} numberOfLines={1}>{t('AI Assistant')}</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{t('S-MAHII Service Directory')}</Text>
          </View>
        </View>
        <Pressable
          onPress={handleNewChat}
          disabled={isLoading}
          style={[styles.iconBtn, isLoading && styles.iconBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={t('Start new chat')}
        >
          <MaterialIcons name="restart-alt" size={19} color="#FFF" />
        </Pressable>
      </View>

      {/* Android runs edge-to-edge (app.json edgeToEdgeEnabled), where the
          window does NOT resize for the keyboard and the "height" behavior is
          a no-op — "padding" is the only mode that works on both platforms.
          keyboardVerticalOffset compensates for the header rendered above
          this view (measured via onLayout above, not hardcoded), which
          "padding" doesn't otherwise account for on iOS. */}
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
        style={styles.flex}
      >
        {isEmpty ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="auto-awesome" size={30} color={color.brand600} />
            </View>
            <Text style={styles.emptyTitle}>{t('How can I help you?')}</Text>
            <Text style={styles.emptyDesc}>
              {t('Ask me about S-MAHII services, translations, locations, or general questions.')}
            </Text>
            <View style={styles.chipsWrap}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  style={styles.chip}
                  onPress={() => sendMessage(prompt)}
                  accessibilityRole="button"
                  accessibilityLabel={prompt}
                >
                  <Text style={styles.chipText}>{t(prompt)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={isLoading ? renderTypingIndicator : null}
          />
        )}

        {/* Composer — wrapped in SafeAreaView for bottom inset */}
        <SafeAreaView edges={['bottom']} style={styles.inputBarWrap}>
          <View style={styles.inputBar}>
            <TouchableOpacity
              onPress={toggleRecording}
              style={[styles.micBtn, isRecording && styles.micBtnActive]}
              accessibilityRole="button"
              accessibilityLabel={isRecording ? t('Stop voice input') : t('Voice input')}
              accessibilityState={{ selected: isRecording }}
            >
              <MaterialIcons
                name={isRecording ? 'mic' : 'mic-none'}
                size={22}
                color={isRecording ? '#FFF' : color.brand600}
              />
            </TouchableOpacity>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder={isRecording ? t('Recording…') : t('Type a message…')}
                placeholderTextColor={color.ink300}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => sendMessage()}
                multiline
              />
            </View>
            <TouchableOpacity
              onPress={() => sendMessage()}
              style={[styles.sendBtn, sendDisabled && styles.sendBtnDisabled]}
              disabled={sendDisabled}
              accessibilityRole="button"
              accessibilityLabel={t('Send')}
              accessibilityState={{ disabled: sendDisabled }}
            >
              <MaterialIcons name="send" size={18} color={sendDisabled ? color.ink300 : '#FFF'} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    backgroundColor: color.brand900,
    gap: space.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDisabled: { opacity: 0.5 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextBlock: { flexShrink: 1 },
  headerTitle: { fontFamily: font.extrabold, fontSize: 14.5, color: '#FFF' },
  headerSubtitle: { fontFamily: font.bold, fontSize: 10.5, color: 'rgba(255,255,255,0.7)', marginTop: 1 },

  messageList: { padding: space.lg, paddingBottom: space.sm },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xxl,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.brand100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  emptyTitle: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.19, color: color.ink900 },
  emptyDesc: {
    fontFamily: font.medium,
    fontSize: 13.5,
    lineHeight: 20,
    color: color.ink400,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.xl,
  },
  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    minHeight: touch.min,
    justifyContent: 'center',
    ...shadow.e1,
  },
  chipText: { fontFamily: font.bold, fontSize: 13, color: color.brand600 },

  bubbleRow: { flexDirection: 'row', marginBottom: space.lg, alignItems: 'flex-end' },
  botRow: { justifyContent: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },

  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: color.brand600,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  bubble: {
    maxWidth: '100%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  botBubble: {
    backgroundColor: color.surface,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#EEF2F8',
  },
  userBubble: {
    backgroundColor: color.brand600,
    borderBottomRightRadius: 6,
  },

  botName: {
    fontFamily: font.extrabold,
    fontSize: 10.5,
    color: color.brand600,
    marginBottom: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  bubbleText: { fontFamily: font.medium, fontSize: 14.5, lineHeight: 21 },
  botText: { color: color.ink900 },
  userText: { color: '#FFF' },

  typingText: { fontSize: 22, color: color.ink300, lineHeight: 26, letterSpacing: 3 },

  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  translateText: {
    fontFamily: font.bold,
    fontSize: 10,
    color: color.ink400,
  },

  inputBarWrap: {
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    gap: space.sm,
  },
  micBtn: {
    width: touch.min,
    height: touch.min,
    borderRadius: touch.min / 2,
    backgroundColor: color.brand100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtnActive: { backgroundColor: color.danger600 },
  inputContainer: {
    flex: 1,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    minHeight: touch.min,
    maxHeight: 120,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: 10,
  },
  textInput: {
    fontFamily: font.semibold,
    fontSize: 14.5,
    lineHeight: 19,
    color: color.ink900,
    paddingVertical: 0,
  },
  sendBtn: {
    width: touch.min,
    height: touch.min,
    borderRadius: touch.min / 2,
    backgroundColor: color.brand600,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.cta,
  },
  sendBtnDisabled: { backgroundColor: color.border, shadowOpacity: 0, elevation: 0 },
});
