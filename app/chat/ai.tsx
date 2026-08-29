import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Pressable, ActivityIndicator, Platform, Keyboard, Linking,
} from 'react-native';
// Native-insets KeyboardAvoidingView in real builds, manual keyboard-height
// fallback in Expo Go (see src/components/Keyboard.tsx for why).
import { KeyboardAvoidingView } from '@/src/components/Keyboard';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';

import {
  requestSpeechPermissions, startSpeechRecognition,
  stopSpeechRecognition, abortSpeechRecognition
} from '@/src/utils/speechRecognition';
import apiClient from '@/src/api/config';
import { bookingAPI } from '@/src/api/client';
import { color, font, radius, shadow, space, touch } from '@/constants/theme';
import { translateText } from '@/src/utils/translation';
import { AIAction } from '@/src/types';
import AIActionCard from '@/src/components/AIActionCard';
import { useToast, useConfirm } from '@/src/components/ui';
import { useLocation } from '@/src/contexts/LocationContext';
import { useAuth } from '@/src/contexts/AuthContext';

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

// AI access strictly limited to Agent information (audit-trail spec item
// 7) — only offered as a suggestion to a State Coordinator, the one role
// the backend actually allows to use this (see core.services.search_agents
// / AIChatView._tools_for_request). Suggesting it to anyone else would be
// pointless: the tool isn't even offered to the model for them.
const COORDINATOR_SUGGESTED_PROMPT = 'Find the agent for my LGA';

// Feature 10 (Booking + Actions) needs the model to resolve "book this
// mechanic"/"call Ahmed" to a real artisan_id across conversation TURNS —
// but each turn rebuilds `messages` from this screen's own plain
// {role, text} history, and the visible reply text ("Ahmed is 1.2 km
// away...") never actually contains the numeric id that was in that
// turn's tool result. Without this, book_artisan/open_chat_with_artisan/
// call_artisan would have no reliable id to resolve on a later turn.
// Appends a compact, invisible-to-the-user id hint onto a bot message's
// own content before it's sent back as conversation history, so the
// model can still see "Ahmed Bello -> id 42" on the next turn even
// though the chat bubble itself never shows that.
function apiContentFor(message: Message): string {
  if (message.role !== 'bot' || !message.action) return message.text;
  const a = message.action;
  let candidates: { name: string; id: number; user_id: number }[] = [];
  if (a.type === 'search_results' || a.type === 'category_filter') {
    candidates = a.data.results.map((r) => ({ name: r.name, id: r.id, user_id: r.user_id }));
  } else if (a.type === 'artisan_profile' && a.data.found && a.data.id != null && a.data.user_id != null) {
    candidates = [{ name: a.data.name, id: a.data.id, user_id: a.data.user_id }];
  } else if (a.type === 'start_booking' || a.type === 'contact_artisan') {
    candidates = [{ name: a.data.name, id: a.data.id, user_id: a.data.user_id }];
  }
  if (candidates.length === 0) return message.text;
  const hint = candidates.map((c) => `${c.name} -> artisan_id ${c.id}`).join(', ');
  return `${message.text}\n\n[internal, not shown to user: ${hint}]`;
}

export default function AIChatScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { show: showToast } = useToast();
  const confirm = useConfirm();
  // Lets the AI's artisan results carry a real distance instead of never
  // showing one — same GPS the Home screen already uses, not a fresh permission ask.
  const { location } = useLocation();
  const { user } = useAuth();
  const suggestedPrompts = user?.role === 'state_coordinator'
    ? [COORDINATOR_SUGGESTED_PROMPT, ...SUGGESTED_PROMPTS]
    : SUGGESTED_PROMPTS;
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  // Voice AI (feature 7): a reply is only spoken aloud when the question
  // that prompted it was itself asked by voice — typed questions stay
  // text-only, matching how a real voice assistant behaves. Tracks which
  // bot message is currently being read out, so its bubble can show a
  // "speaking" indicator with tap-to-stop.
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
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
    return () => { abortSpeechRecognition(); Speech.stop(); };
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
        // Auto-send — feature 7 (Voice AI) is a talk-and-get-an-answer
        // flow, not dictation-then-review. Marks this exchange as
        // fromVoice so the reply is spoken back, not just shown as text.
        sendMessage(transcript, { fromVoice: true });
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

    // Don't talk over the user while they're about to ask something new.
    Speech.stop();
    setSpeakingMessageId(null);

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

  // ArtisanProfile.id (not User.id) — see the comment on AIActionCardProps
  // for why the two must never be confused here.
  const handleArtisanPress = useCallback((artisanProfileId: number) => {
    router.push(`/artisan/${artisanProfileId}`);
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

  // --- Feature 10 (Booking + Actions): the AI actually performing an
  // action, not just describing one. ---

  // ArtisanProfile.id — opens the existing booking screen pre-selected;
  // the user still picks a date/time and confirms there themselves (the
  // AI never invents those on their behalf).
  const handleStartBooking = useCallback((artisanProfileId: number) => {
    router.push({ pathname: '/booking/[artisanId]', params: { artisanId: String(artisanProfileId) } });
  }, [router]);

  // The only place that actually mutates a booking for this feature —
  // reuses the same PATCH endpoint the app's own cancel button already
  // uses (already permission-checked server-side), never a bespoke AI
  // mutation path.
  const handleConfirmCancel = useCallback(async (bookingId: number): Promise<boolean> => {
    try {
      await bookingAPI.updateBooking(bookingId, { status: 'cancelled' });
      showToast(t('Booking cancelled.'), { type: 'success' });
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.cancellation_reason?.[0]
        || err?.response?.data?.status?.[0]
        || t('Could not cancel this booking. Please try again.');
      showToast(message, { type: 'error' });
      return false;
    }
  }, [showToast, t]);

  const handleViewBooking = useCallback((bookingId: number) => {
    router.push(`/booking/detail/${bookingId}`);
  }, [router]);

  const handleContactArtisan = useCallback((
    recipientUserId: number, method: 'chat' | 'call', name: string, phone: string
  ) => {
    if (method === 'call') {
      if (!phone) {
        showToast(t("This artisan's phone number isn't available."), { type: 'info' });
        return;
      }
      Linking.openURL(`tel:${phone}`);
    } else {
      router.push({ pathname: '/chat/[id]', params: { id: 'new', name, recipientId: recipientUserId } });
    }
  }, [router, showToast, t]);

  // Speaks a bot reply aloud (Voice AI, feature 7) — only ever called for
  // an exchange that itself started as a voice question. Picks the TTS
  // language from the app's own EN/HA toggle as a simple, already-set
  // proxy for which language the reply is actually in.
  const speakReply = useCallback((messageId: string, text: string) => {
    Speech.stop();
    setSpeakingMessageId(messageId);
    Speech.speak(text, {
      language: i18n.language === 'ha' ? 'ha-NG' : 'en-US',
      onDone: () => setSpeakingMessageId((id) => (id === messageId ? null : id)),
      onStopped: () => setSpeakingMessageId((id) => (id === messageId ? null : id)),
      onError: () => setSpeakingMessageId((id) => (id === messageId ? null : id)),
    });
  }, [i18n.language]);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setSpeakingMessageId(null);
  }, []);

  const sendMessage = async (overrideText?: string, options?: { fromVoice?: boolean }) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || isLoading) return;
    const fromVoice = !!options?.fromVoice;

    setInputText('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.role === 'bot' ? 'assistant' as const : 'user' as const,
        content: apiContentFor(m),
      }));

      // apiClient (not raw axios) — attaches the logged-in user's JWT, so
      // the backend actually knows who's asking. Without this, book/
      // cancel/track/status actions (feature 10) have no client account
      // to act on, and every request looked anonymous even when logged in.
      const res = await apiClient.post(
        'ai/chat/',
        {
          messages: apiMessages,
          // Omitted entirely (not sent as null/0) when location permission
          // hasn't been granted yet — the backend then falls back to the
          // user's saved profile location, or leaves distance_km null.
          ...(location ? { latitude: location.latitude, longitude: location.longitude } : {}),
        },
        { timeout: 30000 }
      );

      const reply = res.data.reply || 'Sorry, I could not generate a response.';
      const action: AIAction | undefined = res.data.action || undefined;
      const botMsgId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'bot',
        text: reply,
        action,
      }]);
      if (fromVoice) speakReply(botMsgId, reply);
    } catch (err: any) {
      const errorText = err.response?.status === 429
        ? 'Too many requests. Please wait a moment and try again.'
        : err.response?.status === 503
          ? 'AI service is not configured yet.'
          : 'Sorry, I could not process your request. Please try again.';
      const errorMsgId = (Date.now() + 1).toString();
      if (fromVoice) speakReply(errorMsgId, errorText);
      setMessages(prev => [...prev, {
        id: errorMsgId,
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
    stopSpeaking();
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

  const handleCopyMessage = useCallback(async (text: string) => {
    await Clipboard.setStringAsync(text);
    showToast(t('Copied to clipboard.'), { type: 'success' });
  }, [showToast, t]);

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
            <View style={styles.bubbleActions}>
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
              <TouchableOpacity
                onPress={() => handleCopyMessage(translatedMap[item.id] || item.text)}
                style={styles.translateBtn}
                accessibilityRole="button"
                accessibilityLabel={t('Copy answer')}
              >
                <MaterialIcons name="content-copy" size={12} color={color.ink400} />
                <Text style={styles.translateText}>{t('Copy')}</Text>
              </TouchableOpacity>
              {speakingMessageId === item.id && (
                <TouchableOpacity
                  onPress={stopSpeaking}
                  style={styles.translateBtn}
                  accessibilityRole="button"
                  accessibilityLabel={t('Stop speaking')}
                >
                  <MaterialIcons name="volume-up" size={13} color={color.brand600} />
                  <Text style={[styles.translateText, { color: color.brand600 }]}>{t('Stop')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        {item.role === 'bot' && item.action && (
          <AIActionCard
            action={item.action}
            onArtisanPress={handleArtisanPress}
            onNavigate={handleNavigate}
            onSearchLocal={handleSearchLocal}
            onCategoryLocal={handleCategoryLocal}
            onStartBooking={handleStartBooking}
            onConfirmCancel={handleConfirmCancel}
            onViewBooking={handleViewBooking}
            onContactArtisan={handleContactArtisan}
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
              {suggestedPrompts.map((prompt) => (
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

  bubbleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: 6,
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
