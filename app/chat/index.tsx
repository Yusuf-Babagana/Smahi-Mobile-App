import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ✅ Import artisanAPI for global search
import { chatAPI, artisanAPI } from '@/src/api/client';
import { colors, shadows } from '@/styles/commonStyles';
import { storage } from '@/src/utils/storage';

const CLOUD_NAME = 'dvj6cw5dq';

export default function ChatListScreen() {
    const router = useRouter();

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
            const response = await chatAPI.getConversations();

            let list = [];
            if (Array.isArray(response)) list = response;
            else if (response && Array.isArray(response.results)) list = response.results;

            const sorted = list.sort((a: any, b: any) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
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
        }, [])
    );

    // Polling (Only when not searching)
    useEffect(() => {
        const interval = setInterval(() => {
            if (searchQuery === '') loadConversations(false);
        }, 5000);
        return () => clearInterval(interval);
    }, [searchQuery]);

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
                // We map existing conversation IDs to a Set for O(1) lookup
                const existingChatPartnerIds = new Set(conversations.map(c => c.other_user?.id));

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
        if (days === 1) return 'Yesterday';
        if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // 3. ✅ MERGE DATA FOR LIST
    const getDisplayData = () => {
        // A. Filter existing conversations locally
        const localMatches = conversations.filter(c => {
            const name = `${c.other_user?.first_name} ${c.other_user?.last_name}`.toLowerCase();
            return name.includes(searchQuery.toLowerCase());
        });

        // B. Combine [Local Chats] + [New Search Results]
        // Add a 'type' flag to distinguish them
        const combined = [
            ...localMatches.map(item => ({ ...item, type: 'chat' })),
            ...searchResults.map(item => ({ ...item, type: 'new_artisan' }))
        ];

        return combined;
    };

    const renderItem = ({ item }: { item: any }) => {
        // --- CASE 1: EXISTING CHAT ---
        if (item.type === 'chat') {
            let other = item.other_user || { first_name: "Unknown", last_name: "" };
            const lastMsg = item.last_message;
            const avatar = getAvatar(other.profile_picture);
            const displayName = `${other.first_name || 'User'} ${other.last_name || ''}`;
            const isSelfMsg = lastMsg && Number(lastMsg.sender_id) === Number(currentUserId);

            return (
                <TouchableOpacity
                    style={styles.chatItem}
                    onPress={() => router.push({
                        pathname: '/chat/[id]',
                        params: { id: item.id, name: displayName, recipientId: other.id }
                    })}
                    activeOpacity={0.7}
                >
                    <View style={styles.avatarContainer}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholder]}>
                                <Text style={styles.initial}>{displayName.charAt(0)}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.content}>
                        <View style={styles.row}>
                            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                            <Text style={styles.time}>
                                {lastMsg ? formatTime(lastMsg.updated_at || lastMsg.created_at) : ''}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.message} numberOfLines={1}>
                                {isSelfMsg && <Text style={{ color: colors.primary }}>You: </Text>}
                                {lastMsg ? lastMsg.text : 'Start a conversation'}
                            </Text>
                            <Ionicons name="chevron-forward" size={16} color="#E5E7EB" />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        // --- CASE 2: NEW ARTISAN (FROM SEARCH) ---
        else {
            const avatar = getAvatar(item.profile_picture);
            const displayName = `${item.first_name} ${item.last_name}`;

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
                    <View style={styles.avatarContainer}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholder, { backgroundColor: '#9CA3AF' }]}>
                                <Text style={styles.initial}>{displayName.charAt(0)}</Text>
                            </View>
                        )}
                        {/* New Badge */}
                        <View style={styles.newBadge}>
                            <Ionicons name="add" size={12} color="#FFF" />
                        </View>
                    </View>
                    <View style={styles.content}>
                        <View style={styles.row}>
                            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                            <Text style={[styles.time, { color: colors.primary, fontWeight: '600' }]}>New</Text>
                        </View>
                        <Text style={[styles.message, { fontStyle: 'italic', color: colors.primary }]}>
                            Tap to start a new chat
                        </Text>
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
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* SEARCH BAR (Functional) */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        placeholder="Search chats or find people..."
                        style={styles.searchInput}
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery} // ✅ Triggers search
                        autoCapitalize="none"
                    />
                    {isSearching && <ActivityIndicator size="small" color={colors.primary} />}
                </View>
            </View>

            {/* LIST */}
            {loading && !searchQuery ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={getDisplayData()}
                    keyExtractor={(item) => `${item.type}_${item.id}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
                            </View>
                            <Text style={styles.emptyTitle}>
                                {searchQuery ? "No results found" : "No Messages"}
                            </Text>
                            <Text style={styles.emptyText}>
                                {searchQuery
                                    ? "Try searching for a different name."
                                    : "Connect with an artisan to start chatting."}
                            </Text>
                        </View>
                    }
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </SafeAreaView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },

    header: { paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#111' },
    backBtn: { paddingRight: 10 },

    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6',
        marginHorizontal: 16, padding: 10, borderRadius: 12, marginTop: 5
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#111' },

    list: { paddingBottom: 20 },
    separator: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 80 },

    chatItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFF' },

    avatarContainer: { marginRight: 15 },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E0E7FF' },
    placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0E7FF' },
    initial: { color: colors.primary, fontSize: 24, fontWeight: '700' },

    // New User Badge
    newBadge: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: colors.primary, width: 20, height: 20, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF'
    },

    content: { flex: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },

    name: { fontSize: 17, fontWeight: '600', color: '#1F2937' },
    time: { fontSize: 13, color: '#9CA3AF' },
    message: { fontSize: 15, color: '#6B7280', flex: 1, marginRight: 10 },

    empty: { alignItems: 'center', marginTop: 100 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8 },
    emptyText: { color: '#9CA3AF', fontSize: 14, width: '60%', textAlign: 'center' }
});