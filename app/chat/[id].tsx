import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity,
    Platform, StyleSheet, ActivityIndicator, Pressable, AppState, Keyboard,
} from 'react-native';
// Native-insets KeyboardAvoidingView in real builds, RN fallback in Expo Go.
import { KeyboardAvoidingView } from '@/src/components/Keyboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';

import { chatAPI } from '@/src/api/client';
import { storage } from '@/src/utils/storage';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { Avatar, MessageBubble, useToast } from '@/src/components/ui';

export default function ChatRoomScreen() {
    const { id: initialId, name, recipientId } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const { show: showToast } = useToast();

    // --- STATE ---
    const [conversationId, setConversationId] = useState<number | null>(
        initialId === 'new' ? null : Number(initialId)
    );
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [checkingHistory, setCheckingHistory] = useState(false);

    // 🔥 Anti-Infinite-Loop Refs
    const conversationIdRef = useRef(conversationId);
    const currentUserIdRef = useRef(currentUserId);

    useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);
    useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);

    const flatListRef = useRef<FlatList>(null);

    // --- SOUND LOGIC ---
    const playSound = async (type: 'send' | 'receive') => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                type === 'send'
                    ? require('@/assets/sounds/sent.wav')
                    : require('@/assets/sounds/received.wav')
            );
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.isLoaded && status.didJustFinish) await sound.unloadAsync();
            });
        } catch (error) {
            // Silent fail if files missing
        }
    };

    // --- EFFECTS ---
    useEffect(() => {
        storage.getCurrentUser().then(user => user && setCurrentUserId(Number(user.id)));
    }, []);

    // Creates/fetches the conversation for a brand-new chat (id === 'new').
    // Pulled out of the effect so handleSend can call it again as a retry —
    // previously a failed attempt (bad network, cold-starting backend, an
    // expired session the 401 interceptor couldn't recover) left
    // conversationId stuck at null forever, since the effect below only
    // ever ran once per screen mount. Every tap of Send just re-showed the
    // same "please wait" toast with nothing actually retrying underneath.
    const initChat = useCallback(async (): Promise<number | null> => {
        if (conversationIdRef.current) return conversationIdRef.current;
        if (initialId !== 'new' || !recipientId) return null;
        setCheckingHistory(true);
        try {
            const data = await chatAPI.getOrCreateConversation(Number(recipientId));
            if (data.id) {
                // React state updates aren't visible synchronously — set the
                // ref directly too so a caller awaiting this (handleSend's
                // retry) sees the id immediately, not on the next render.
                conversationIdRef.current = data.id;
                setConversationId(data.id);
                return data.id;
            }
            return null;
        } catch (error) {
            console.log("Init chat failed", error);
            return null;
        } finally {
            setCheckingHistory(false);
        }
    }, [initialId, recipientId]);

    useEffect(() => { initChat(); }, [initChat]);

    useEffect(() => {
        const fetchMessages = async () => {
            const convId = conversationIdRef.current;
            if (!convId || AppState.currentState !== 'active') return;

            try {
                const response = await chatAPI.getMessages(convId);
                const data = Array.isArray(response) ? response : (response.results || []);
                // Oldest first — normal chronological order, rendered in a
                // non-inverted FlatList (see the FlatList below for why).
                const sorted = data.sort((a: any, b: any) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );

                setMessages(prev => {
                    if (sorted.length > 0) {
                        const latest = sorted[sorted.length - 1];
                        const prevLatest = prev[prev.length - 1];
                        const isNew = !prevLatest || latest.id !== prevLatest.id;
                        if (isNew && currentUserIdRef.current && Number(latest.sender) !== currentUserIdRef.current) {
                            playSound('receive');
                        }
                        if (isNew || sorted.length !== prev.length) return sorted;
                    }
                    return prev;
                });

                // Read/unread status must be persisted server-side (not just
                // held in this screen's state) — this was the actual bug:
                // nothing anywhere ever called mark_as_read, so a message's
                // is_read never left False in the database. That's why the
                // conversation list's badge could never clear, and why a
                // message read once could reappear as unread later — it was
                // never really marked read in the first place. Runs on every
                // poll (not just on mount) so a message that arrives while
                // this screen is already open also gets marked read promptly,
                // and it's a cheap no-op server-side when there's nothing new
                // to mark. Guarded by the same AppState check above the poll
                // already uses, so this never fires while backgrounded.
                const hasUnreadFromOther = sorted.some((m: any) =>
                    !m.is_read && currentUserIdRef.current && Number(m.sender) !== currentUserIdRef.current
                );
                if (hasUnreadFromOther) {
                    chatAPI.markAsRead(convId).catch(() => {});
                }
            } catch (error) { console.log("Fetch messages err:", error); }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 4000); // Polling every 4s
        return () => clearInterval(interval);
    }, []); // ⚡ EMPTY ARRAY to prevent 500 req/min loops!

    // Without inverted, the list doesn't auto-anchor to the bottom — keep the
    // latest message in view when the keyboard opens (mirrors app/chat/ai.tsx).
    useEffect(() => {
        const showEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
        const sub = Keyboard.addListener(showEvent, () => {
            requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
        });
        return () => sub.remove();
    }, []);

    // --- HANDLERS ---
    const handleProfileClick = () => {
        let targetId = recipientId;
        if (!targetId && messages.length > 0) {
            const otherMsg = messages.find(m => Number(m.sender) !== currentUserId);
            if (otherMsg) targetId = otherMsg.sender;
        }

        if (targetId) {
            router.push({
                pathname: '/artisan-profile',
                params: { id: targetId }
            });
        } else {
            showToast("Profile details not available right now.", { type: 'info' });
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const textToSend = inputText.trim();
        setInputText('');
        setSending(true);
        playSound('send');

        try {
            // Not just "wait" — actively (re)creates the conversation if it
            // isn't ready yet, in case the first attempt failed (see initChat
            // above for why this used to get stuck on a dead-end toast).
            const activeConversationId = conversationIdRef.current ?? await initChat();
            if (!activeConversationId) {
                showToast("Couldn't start this conversation. Check your connection and try again.", { type: 'error' });
                setInputText(textToSend);
                return;
            }

            const payload: any = {
                conversation_id: activeConversationId,
                text: textToSend
            };

            const tempId = Math.random();
            const tempMsg = {
                id: tempId, text: textToSend, sender: currentUserId,
                created_at: new Date().toISOString(), is_temp: true
            };
            setMessages(prev => [...prev, tempMsg]);

            const newMsg = await chatAPI.sendMessage(payload);
            setMessages(prev => [...prev.filter(m => m.id !== tempId), newMsg]);

        } catch (error: any) {
            showToast("Message not sent.", { type: 'error' });
            setInputText(textToSend);
        } finally {
            setSending(false);
        }
    };

    const dayLabel = (iso: string) => {
        const date = new Date(iso);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return t('Today');
        if (date.toDateString() === yesterday.toDateString()) return t('Yesterday');
        return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isMe = Number(item.sender) === Number(currentUserId);
        // Chronological (oldest-first) list — the previous index holds the
        // OLDER message. Show a date pill above the first message of each
        // calendar day.
        const older = messages[index - 1];
        const showDate = !older ||
            new Date(older.created_at).toDateString() !== new Date(item.created_at).toDateString();

        return (
            <View>
                {showDate && (
                    <View style={styles.dateChipWrap}>
                        <View style={styles.dateChip}>
                            <Text style={styles.dateChipText}>{dayLabel(item.created_at)}</Text>
                        </View>
                    </View>
                )}
                <MessageBubble
                    text={item.text}
                    mine={isMe}
                    timestamp={new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    delivered={isMe && !item.is_temp}
                    // The real field is is_read (Message.is_read on the
                    // backend) — this was checking seen/is_seen/read, none
                    // of which exist on the API response, so the double-tick
                    // "seen" state could never actually show.
                    seen={isMe && !!item.is_read}
                    originalText={item.original_text}
                    isTranslated={!!item.is_translated}
                    sourceLanguage={item.original_language}
                />
            </View>
        );
    };

    const displayName = typeof name === 'string' && name ? name : t('Chat');

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* HEADER */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
                    <MaterialIcons name="arrow-back" size={22} color={color.ink900} />
                </Pressable>

                <TouchableOpacity style={styles.headerProfile} onPress={handleProfileClick} accessibilityRole="button">
                    <Avatar name={displayName} size={40} />
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle} numberOfLines={1}>{displayName}</Text>
                        <Text style={styles.statusText}>{t('Tap to view profile')}</Text>
                    </View>
                </TouchableOpacity>

                <Pressable style={styles.callBtn} accessibilityRole="button" accessibilityLabel={t('Call')}>
                    <MaterialIcons name="call" size={20} color={color.brand600} />
                </Pressable>
            </View>

            {/* "padding" on both platforms: Android edge-to-edge mode never
                resizes the window for the keyboard, so "height" is a no-op. */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            {checkingHistory ? (
                                <ActivityIndicator color={color.brand600} />
                            ) : (
                                <>
                                    <View style={styles.emptyIconCircle}>
                                        <MaterialIcons name="chat-bubble-outline" size={32} color={color.ink300} />
                                    </View>
                                    <Text style={styles.emptyText}>
                                        {t('Start a conversation with')} {displayName}
                                    </Text>
                                </>
                            )}
                        </View>
                    }
                />

                {/* COMPOSER */}
                <View style={styles.inputWrapper}>
                    <TouchableOpacity style={styles.attachBtn} accessibilityRole="button" accessibilityLabel={t('Attach')}>
                        <MaterialIcons name="add" size={22} color={color.brand600} />
                    </TouchableOpacity>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder={t('Message…')}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            placeholderTextColor={color.ink300}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={sending || !inputText.trim()}
                        style={[styles.sendBtn, (!inputText.trim() && !sending) && styles.disabledBtn]}
                        accessibilityRole="button"
                        accessibilityLabel={t('Send')}
                    >
                        {sending ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <MaterialIcons name="send" size={18} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: space.lg,
        paddingVertical: space.md,
        backgroundColor: color.surface,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: color.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: space.md,
    },
    headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    headerText: { flex: 1, marginLeft: space.md },
    headerTitle: { fontFamily: font.extrabold, fontSize: 15.5, color: color.ink900 },
    statusText: { fontFamily: font.bold, fontSize: 11.5, color: color.brand600, marginTop: 1 },
    callBtn: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: color.brand100,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: space.md,
    },

    list: { flexGrow: 1, paddingHorizontal: space.lg, paddingVertical: space.xl },

    dateChipWrap: { alignItems: 'center', marginVertical: space.md },
    dateChip: {
        backgroundColor: color.surfaceChip,
        borderRadius: radius.full,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    dateChipText: {
        fontFamily: font.extrabold,
        fontSize: 11,
        color: color.ink400,
    },

    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: space.md,
        backgroundColor: color.surface,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    attachBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: color.brand100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: space.sm,
    },
    inputContainer: {
        flex: 1,
        backgroundColor: color.surfaceSunken,
        borderRadius: radius.full,
        paddingHorizontal: space.lg,
        paddingVertical: 8,
        minHeight: 44,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#EEF2F8',
    },
    input: {
        fontFamily: font.semibold,
        fontSize: 14.5,
        maxHeight: 100,
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
        marginLeft: space.sm,
        ...shadow.cta,
    },
    disabledBtn: { backgroundColor: color.border, shadowOpacity: 0, elevation: 0 },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E9EEF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: space.lg,
    },
    emptyText: { fontFamily: font.bold, color: color.ink400, fontSize: 14 },
});
