import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    ActivityIndicator, RefreshControl, TextInput, Pressable,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// ✅ Import artisanAPI for global search
import { chatAPI, artisanAPI } from '@/src/api/client';
import { storage } from '@/src/utils/storage';
import { CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from '@/src/constants/env';
import { color, font, radius, space, type } from '@/constants/theme';
import { Avatar, EmptyState } from '@/src/components/ui';

export default function ChatListScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const searchRef = useRef<TextInput>(null);

    // --- Data State ---
    const [conversations, setConversations] = useState<any[]>([]); // Existing chats
    const [searchResults, setSearchResults] = useState<any[]>([]); // New artisans from API

    // --- UI State ---
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        storage.getCurrentUser().then(u => u && setCurrentUserId(u.id));
    }, []);

    // 1. Load Existing Conversations
    const loadConversations = async (showLoader = false) => {
        if (showLoader) setLoading(true);
        try {
            const data = await chatAPI.getConversations();

            const list = Array.isArray(data) ? data : (data.results || []);

            const sorted = list.sort((a: any, b: any) =>
                new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
            );

            setConversations(sorted);
        } catch (error) {
            console.log("Error loading chats", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadConversations(true);
        }, [currentUserId])
    );

    // Polling (Only when not searching)
    useEffect(() => {
        const interval = setInterval(() => {
            if (searchQuery === '' && !loading) loadConversations(false);
        }, 5000);
        return () => clearInterval(interval);
    }, [searchQuery, loading, currentUserId]);

    // 2. ✅ GLOBAL SEARCH LOGIC (Debounced)
    useEffect(() => {
        // Clear results if query is empty
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                // Fetch artisans matching name
                const data = await artisanAPI.getArtisans({ search: searchQuery });
                const apiList = Array.isArray(data) ? data : (data.results || []);

                // Filter out people we ALREADY have a chat with
                const existingChatPartnerIds = new Set();
                conversations.forEach(c => {
                    const other = c.participants_details?.find((p: any) => p.id !== currentUserId);
                    if (other) existingChatPartnerIds.add(other.id);
                });

                // Only keep artisans who are NOT in our conversation list
                const newPeople = apiList.filter((p: any) => !existingChatPartnerIds.has(p.id));

                setSearchResults(newPeople);
            } catch (error) {
                console.log("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        }, 500); // Wait 500ms after typing stops

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, conversations]);

    const onRefresh = () => {
        setRefreshing(true);
        loadConversations(false);
    };

    // --- Helpers ---
    const getAvatar = (url: string | null) => {
        if (!url) return null;
        if (url.includes('image/upload') && !url.startsWith('http')) {
            return `https://res.cloudinary.com/${CLOUD_NAME}/${url}`;
        }
        return url;
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (days === 1) return t('Yesterday');
        if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // 3. ✅ MERGE DATA FOR LIST
    const getDisplayData = () => {
        // A. Filter existing conversations locally
        const localMatches = conversations.filter(c => {
            const other = c.participants_details?.find((p: any) => p.id !== currentUserId);
            const name = other ? `${other.first_name} ${other.last_name}`.toLowerCase() : "unknown";
            return name.includes(searchQuery.toLowerCase());
        });

        // B. Combine [Local Chats] + [New Search Results]
        const combined = [
            ...localMatches.map(item => ({ ...item, type: 'chat' })),
            ...searchResults.map(item => ({ ...item, type: 'new_artisan' }))
        ];

        return combined;
    };

    const renderItem = ({ item }: { item: any }) => {
        // --- CASE 1: EXISTING CHAT ---
        if (item.type === 'chat') {
            const other = item.participants_details?.find((p: any) => p.id !== currentUserId) || { first_name: "User", last_name: "" };
            const lastMsg = item.last_message;
            const avatar = getAvatar(other.profile_picture);
            const displayName = `${other.first_name || 'User'} ${other.last_name || ''}`.trim();
            const isSelfMsg = lastMsg && Number(lastMsg.sender_id) === Number(currentUserId);
            const unreadCount = Number(item.unread_count || 0);
            const hasUnread = unreadCount > 0;
            const msgSeen = !!(lastMsg?.seen || lastMsg?.is_seen || lastMsg?.read);

            return (
                <TouchableOpacity
                    style={styles.chatItem}
                    onPress={() => router.push({
                        pathname: '/chat/[id]',
                        params: { id: item.id, name: displayName, recipientId: other.id }
                    })}
                    activeOpacity={0.7}
                >
                    <Avatar
                        name={displayName}
                        uri={avatar}
                        size={50}
                        online={!!(other.is_online || other.online)}
                    />
                    <View style={styles.content}>
                        <View style={styles.row}>
                            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                            <Text style={[styles.time, hasUnread && styles.timeUnread]}>
                                {lastMsg ? formatTime(lastMsg.updated_at || lastMsg.created_at) : ''}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.previewRow}>
                                {isSelfMsg && (
                                    <MaterialIcons
                                        name="done-all"
                                        size={15}
                                        color={msgSeen ? color.brand600 : color.ink300}
                                        style={styles.ticks}
                                    />
                                )}
                                <Text
                                    style={[styles.message, hasUnread && styles.messageUnread]}
                                    numberOfLines={1}
                                >
                                    {lastMsg ? lastMsg.text : t('Start a conversation')}
                                </Text>
                            </View>
                            {hasUnread && (
                                <View style={styles.unreadPill}>
                                    <Text style={styles.unreadPillText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        // --- CASE 2: NEW ARTISAN (FROM SEARCH) ---
        else {
            const avatar = getAvatar(item.profile_picture);
            const displayName = `${item.first_name} ${item.last_name}`.trim();

            return (
                <TouchableOpacity
                    style={styles.chatItem}
                    onPress={() => router.push({
                        pathname: '/chat/[id]',
                        // ✅ Pass 'new' to start fresh
                        params: { id: 'new', name: displayName, recipientId: item.id }
                    })}
                    activeOpacity={0.7}
                >
                    <View>
                        <Avatar name={displayName} uri={avatar} size={50} />
                        <View style={styles.newBadge}>
                            <MaterialIcons name="add" size={12} color="#FFF" />
                        </View>
                    </View>
                    <View style={styles.content}>
                        <View style={styles.row}>
                            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                            <Text style={styles.newLabel}>{t('New')}</Text>
                        </View>
                        <Text style={styles.newHint}>{t('Tap to start a new chat')}</Text>
                    </View>
                </TouchableOpacity>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    {/* Hidden when rendered as the Chat tab (nothing to go back to). */}
                    {router.canGoBack() ? (
                        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
                            <MaterialIcons name="arrow-back" size={22} color={color.ink900} />
                        </Pressable>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                    <Text style={styles.headerTitle}>{t('Messages')}</Text>
                    <Pressable
                        onPress={() => searchRef.current?.focus()}
                        style={styles.composeBtn}
                        accessibilityRole="button"
                        accessibilityLabel={t('New chat')}
                    >
                        <MaterialIcons name="edit" size={18} color="#FFF" />
                    </Pressable>
                </View>

                {/* SEARCH BAR — chats + new-people search in one field */}
                <View style={styles.searchBar}>
                    <MaterialIcons name="search" size={20} color={color.ink300} />
                    <TextInput
                        ref={searchRef}
                        placeholder={t('Search people or start a new chat')}
                        style={styles.searchInput}
                        placeholderTextColor={color.ink300}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                    {isSearching && <ActivityIndicator size="small" color={color.brand600} />}
                </View>
            </View>

            {/* LIST */}
            {loading && !searchQuery ? (
                <ActivityIndicator size="large" color={color.brand600} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={getDisplayData()}
                    keyExtractor={(item) => `${item.type}_${item.id}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.brand600} />}
                    ListEmptyComponent={
                        <EmptyState
                            icon={searchQuery ? 'search-off' : 'chat-bubble-outline'}
                            title={searchQuery ? t('No results found') : t('No Messages')}
                            message={searchQuery
                                ? t('Try searching for a different name.')
                                : t('Connect with an artisan to start chatting.')}
                            style={{ marginTop: 60 }}
                        />
                    }
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </SafeAreaView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surface },

    header: { paddingBottom: space.md, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.lg,
        paddingVertical: space.md,
    },
    headerTitle: { ...type.titleLg },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: color.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    composeBtn: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: color.brand600,
        alignItems: 'center',
        justifyContent: 'center',
    },

    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: color.surfaceSunken,
        marginHorizontal: space.lg,
        paddingHorizontal: space.md,
        height: 46,
        borderRadius: radius.lg,
    },
    searchInput: {
        flex: 1,
        fontFamily: font.semibold,
        fontSize: 14,
        color: color.ink900,
        paddingVertical: 0,
    },

    list: { paddingBottom: 100 },
    separator: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 82 },

    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: space.lg,
        backgroundColor: color.surface,
    },

    newBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: color.brand600,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },

    content: { flex: 1, marginLeft: space.md },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },

    name: { fontFamily: font.extrabold, fontSize: 15, color: color.ink900, flexShrink: 1 },
    time: { fontFamily: font.bold, fontSize: 12, color: color.ink300, marginLeft: 8 },
    timeUnread: { color: color.brand600 },
    previewRow: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10 },
    ticks: { marginRight: 4 },
    message: { fontFamily: font.semibold, fontSize: 13.5, color: color.ink400, flexShrink: 1 },
    messageUnread: { fontFamily: font.extrabold, color: color.ink900 },
    unreadPill: {
        minWidth: 19,
        height: 19,
        borderRadius: 10,
        backgroundColor: color.brand600,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    unreadPillText: { fontFamily: font.extrabold, fontSize: 10.5, color: '#FFF' },

    newLabel: { fontFamily: font.extrabold, fontSize: 12, color: color.brand600 },
    newHint: { fontFamily: font.semibold, fontSize: 13, color: color.brand600, fontStyle: 'italic' },
});
