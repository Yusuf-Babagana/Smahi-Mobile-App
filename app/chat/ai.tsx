import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet, Alert, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import {
  requestSpeechPermissions, startSpeechRecognition,
  stopSpeechRecognition, abortSpeechRecognition
} from '@/src/utils/speechRecognition';
import { BACKEND_URL } from '@/src/constants/env';
import { color, font, radius, shadow, space } from '@/constants/theme';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

export default function AIChatScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'bot', text: 'Hello! I am the S-MAHII AI assistant. How can I help you find services today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    return () => { abortSpeechRecognition(); };
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      const transcript = await stopSpeechRecognition();
      if (transcript) setInputText(transcript);
      return;
    }

    const granted = await requestSpeechPermissions();
    if (!granted) {
      Alert.alert('Permission Required', 'Microphone permission is needed to use voice input.');
      return;
    }

    setIsRecording(true);
    try {
      await startSpeechRecognition();
    } catch (err) {
      console.error('[AIChat] Failed to start:', err);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start voice recording. Please try again.');
    }
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    setInputText('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/ai/chat/`, { text });
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: res.data.reply
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorText = err.response?.status === 503
        ? 'AI service is not configured yet.'
        : err.response?.status === 500
          ? 'AI service is temporarily unavailable. Please try again.'
          : 'Sorry, I could not process your request. Please try again.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: errorText
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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
        ]}>{item.text}</Text>
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

        {/* Composer */}
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
    maxWidth: '78%',
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

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
