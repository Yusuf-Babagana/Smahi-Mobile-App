import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import { chatAPI } from '@/src/api/client';
import { colors } from '@/styles/commonStyles';
import { storage } from '@/src/utils/storage';

export default function ChatRoomScreen() {
    const { id: initialId, name, recipientId } = useLocalSearchParams();
    const router = useRouter();

    // --- STATE ---
    const [conversationId, setConversationId] = useState<number | null>(
        initialId === 'new' ? null : Number(initialId)
    );
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [checkingHistory, setCheckingHistory] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    // --- SOUND LOGIC ---
    const playSound = async (type: 'send' | 'receive') => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                type === 'send'
                    ? require('@/assets/sounds/sent.mp3')
                    : require('@/assets/sounds/received.mp3')
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

    useEffect(() => {
        const checkExistingChat = async () => {
            if (!conversationId && recipientId) {
                setCheckingHistory(true);
                try {
                    const data = await chatAPI.findConversation(Number(recipientId));
                    if (data.exists && data.id) setConversationId(data.id);
                } catch (error) { console.log("New chat"); }
                finally { setCheckingHistory(false); }
            }
        };
        checkExistingChat();
    }, [recipientId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        const fetchMessages = async () => {
            if (!conversationId) return;
            try {
                const data = await chatAPI.getMessages(conversationId);
                setMessages(prev => {
                    if (data.length > 0) {
                        const isNew = prev.length === 0 || data[0].id !== prev[0].id;
                        if (isNew && currentUserId && data[0].sender_id !== currentUserId) {
                            playSound('receive');
                        }
                        if (isNew || data.length !== prev.length) return data;
                    }
                    return prev;
                });
            } catch (error) { }
        };
        fetchMessages();
        interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [conversationId, currentUserId]);

    // --- HANDLERS ---
    const handleProfileClick = () => {
        let targetId = recipientId;
        if (!targetId && messages.length > 0) {
            const otherMsg = messages.find(m => Number(m.sender_id) !== currentUserId);
            if (otherMsg) targetId = otherMsg.sender_id;
        }

        if (targetId) {
            router.push({
                pathname: '/artisan-profile',
                params: { id: targetId }
            });
        } else {
            Alert.alert("Info", "Profile details not available right now.");
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const textToSend = inputText.trim();
        setInputText('');
        setSending(true);
        playSound('send');

        try {
            const payload: any = { text: textToSend };
            if (conversationId) payload.conversation_id = conversationId;
            else if (recipientId) payload.recipient_id = Number(recipientId);

            const tempId = Math.random();
            const tempMsg = {
                id: tempId, text: textToSend, sender_id: currentUserId,
                created_at: new Date().toISOString(), is_temp: true
            };
            setMessages(prev => [tempMsg, ...prev]);

            const newMsg = await chatAPI.sendMessage(payload);
            setMessages(prev => [newMsg, ...prev.filter(m => m.id !== tempId)]);

            if (!conversationId && newMsg.conversation) setConversationId(newMsg.conversation);

        } catch (error: any) {
            Alert.alert("Failed", "Message not sent.");
            setInputText(textToSend);
        } finally {
            setSending(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isMe = Number(item.sender_id) === Number(currentUserId);
        return (
            <View style={[styles.row, isMe ? styles.rowRight : styles.rowLeft]}>
                <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
                    <Text style={[styles.msgText, isMe ? styles.textLight : styles.textDark]}>
                        {item.text}
                    </Text>
                    <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, isMe ? styles.timeLight : styles.timeDark]}>
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {item.is_temp && <Ionicons name="time-outline" size={10} style={{ marginLeft: 4 }} />}
                        </Text>
                        {isMe && !item.is_temp && (
                            <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.8)" style={{ marginLeft: 4 }} />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const displayInitial = typeof name === 'string' ? name.charAt(0) : '?';

    return (
        // ✅ 1. Remove 'bottom' from edges so KeyboardView controls the bottom padding
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerProfile} onPress={handleProfileClick}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{displayInitial}</Text>
                    </View>
                    <View>
                        <Text style={styles.headerTitle} numberOfLines={1}>{name || "Chat"}</Text>
                        <Text style={styles.statusText}>Tap to view profile</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <Ionicons name="call-outline" size={24} color={colors.primary} style={{ marginRight: 15 }} />
                    <Ionicons name="videocam-outline" size={24} color={colors.primary} />
                </View>
            </View>

            {/* ✅ 2. FIXED KEYBOARD AVOIDING VIEW */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                // On iOS 'padding' works best. On Android 'height' often works better than undefined.
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                // Offset accounts for Header (~60px) + Status Bar (~40px)
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    inverted
                    contentContainerStyle={styles.list}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            {checkingHistory ? (
                                <ActivityIndicator color={colors.primary} />
                            ) : (
                                <>
                                    <View style={styles.emptyIconCircle}>
                                        <Ionicons name="chatbubble-ellipses" size={40} color="#CCC" />
                                    </View>
                                    <Text style={styles.emptyText}>Start a conversation with {name}</Text>
                                </>
                            )}
                        </View>
                    }
                />

                {/* INPUT BAR */}
                <View style={styles.inputWrapper}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Message..."
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            placeholderTextColor="#999"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={sending || !inputText.trim()}
                        style={[styles.sendBtn, (!inputText.trim() && !sending) && styles.disabledBtn]}
                    >
                        {sending ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <Ionicons name="send" size={18} color="#FFF" style={{ marginLeft: 2 }} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F4F7' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF',
        borderBottomWidth: 1, borderBottomColor: '#EFEFEF',
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
        zIndex: 10, // Ensure header stays on top
    },
    backBtn: { marginRight: 8 },
    headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E7FF',
        justifyContent: 'center', alignItems: 'center', marginRight: 10
    },
    avatarText: { fontSize: 18, fontWeight: '700', color: colors.primary },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
    statusText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
    headerActions: { flexDirection: 'row', alignItems: 'center' },

    list: { paddingHorizontal: 16, paddingVertical: 20 },

    row: { marginBottom: 16, width: '100%' },
    rowLeft: { alignItems: 'flex-start' },
    rowRight: { alignItems: 'flex-end' },

    bubble: {
        padding: 12, borderRadius: 18, maxWidth: '75%',
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1
    },
    bubbleLeft: { backgroundColor: '#FFF', borderBottomLeftRadius: 4 },
    bubbleRight: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },

    msgText: { fontSize: 16, lineHeight: 22 },
    textDark: { color: '#1F2937' },
    textLight: { color: '#FFF' },

    timeContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
    timeText: { fontSize: 10, fontWeight: '500' },
    timeDark: { color: '#9CA3AF' },
    timeLight: { color: 'rgba(255,255,255,0.7)' },

    inputWrapper: {
        flexDirection: 'row', alignItems: 'flex-end', padding: 10, backgroundColor: '#FFF',
        borderTopWidth: 1, borderTopColor: '#F3F4F6',
        paddingBottom: Platform.OS === 'ios' ? 10 : 10 // Extra padding for safety
    },
    attachBtn: { padding: 10, marginRight: 5 },
    inputContainer: {
        flex: 1, backgroundColor: '#F3F4F6', borderRadius: 24,
        paddingHorizontal: 16, paddingVertical: 8, minHeight: 44, justifyContent: 'center'
    },
    input: { fontSize: 16, maxHeight: 100, color: '#1F2937' },

    sendBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center', marginLeft: 10,
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 3
    },
    disabledBtn: { backgroundColor: '#E5E7EB', shadowOpacity: 0, elevation: 0 },

    empty: { alignItems: 'center', marginTop: 100, transform: [{ scaleY: -1 }] },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyText: { color: '#9CA3AF', fontSize: 16 }
});