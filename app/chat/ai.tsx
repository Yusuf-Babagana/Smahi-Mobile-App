import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert, Pressable, ActivityIndicator,
} from 'react-native';
// The RN built-in KeyboardAvoidingView is unreliable on Android 15
// edge-to-edge (adjustResize is ignored); this drop-in reads real
// keyboard insets natively. Requires KeyboardProvider in app/_layout.tsx.
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { color, font, radius, shadow, space } from '@/constants/theme';
import { translateText } from '@/src/utils/translation';
import { AIAction } from '@/src/types';
import AIActionCard from '@/src/components/AIActionCard';

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

export default function AIChatScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      const transcript = await stopSpeechRecognition();
      if (transcript) {
        setInputText(transcript);
      } else {
        let message = 'No speech detected. Please try again.';
        if (transcript === '___NO_API_KEY___') {
          message = 'Voice transcription requires an OpenAI API key.';
        } else if (transcript === '___QUOTA_ERROR___') {
          message = 'Voice transcription is temporarily unavailable. Please try again later.';
        }
        Alert.alert('Voice Input', message);
      }
      return;
    }

    const granted = await requestSpeechPermissions();
    if (!granted) {
      Alert.alert('Permission Required', 'Microphone permission is needed to use voice input.');
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
      Alert.alert('Error', 'Failed to start voice recording. Please try again.');
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

  const sendMessage = async () => {
    const text = inputText.trim();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
          <MaterialIcons name="arrow-back" size={20} color="#FFF" />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <MaterialIcons name="auto-awesome" size={18} color="#FACC15" />
          </View>
          <View>
            <Text style={styles.headerTitle}>{t('AI Assistant')}</Text>
            <Text style={styles.headerSubtitle}>{t('S-MAHII Service Directory')}</Text>
          </View>
        </View>
      </View>

      {/* Android runs edge-to-edge (app.json edgeToEdgeEnabled), where the
          window does NOT resize for the keyboard and the "height" behavior is
          a no-op — "padding" is the only mode that works on both platforms. */}
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.flex}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListFooterComponent={isLoading ? renderTypingIndicator : null}
        />

        {/* Composer — wrapped in SafeAreaView for bottom inset */}
        <SafeAreaView edges={['bottom']} style={styles.inputBarWrap}>
          <View style={styles.inputBar}>
            <TouchableOpacity
              onPress={toggleRecording}
              style={[styles.micBtn, isRecording && styles.micBtnActive]}
              accessibilityRole="button"
              accessibilityLabel={t('Voice input')}
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
                onSubmitEditing={sendMessage}
              />
            </View>
            <TouchableOpacity
              onPress={sendMessage}
              style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
              disabled={!inputText.trim() || isLoading}
              accessibilityRole="button"
              accessibilityLabel={t('Send')}
            >
              <MaterialIcons name="send" size={18} color="#FFF" />
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
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: color.brand900,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontFamily: font.extrabold, fontSize: 15.5, color: '#FFF' },
  headerSubtitle: { fontFamily: font.bold, fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginTop: 1 },

  messageList: { padding: space.lg, paddingBottom: space.sm },

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
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    gap: space.sm,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.brand100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtnActive: { backgroundColor: color.danger600 },
  inputContainer: {
    flex: 1,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  textInput: {
    fontFamily: font.semibold,
    fontSize: 14.5,
    color: color.ink900,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.brand600,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.cta,
  },
  sendBtnDisabled: { backgroundColor: color.border, shadowOpacity: 0, elevation: 0 },
});
