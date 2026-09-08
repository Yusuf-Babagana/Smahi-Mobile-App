import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput,
    ActivityIndicator, Pressable, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { aiAPI } from '@/src/api/client';
import {
    requestSpeechPermissions, startSpeechRecognition, stopSpeechRecognition,
} from '@/src/utils/speechRecognition';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { ArtisanCard, Avatar, EmptyState, useToast } from '@/src/components/ui';

// The S-MAHII Intent Engine's one-shot entry point: type or speak what you
// need, in any supported language, and get matched real providers directly
// — no category picker, no conversation. Distinct from app/chat/ai.tsx (the
// full conversational assistant, which can also book/cancel/track and
// remembers context across turns); this screen is the fast path for
// "I just want to describe my problem and see who can help."
export default function SmartSearchScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { show: showToast } = useToast();
    // Pre-filled when arriving from the home screen's category search after
    // it found no exact category match (app/(tabs)/(home)/index.tsx).
    const { q: prefilledQuery } = useLocalSearchParams<{ q?: string }>();

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVoiceSearching, setIsVoiceSearching] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);

    // 'idle' (nothing submitted yet), 'ask' (needs clarification),
    // 'results' (a search actually ran)
    const [phase, setPhase] = useState<'idle' | 'ask' | 'results'>('idle');
    const [question, setQuestion] = useState('');
    const [providers, setProviders] = useState<any[]>([]);
    const [serviceCategory, setServiceCategory] = useState<string | null>(null);
    const [profession, setProfession] = useState<string | null>(null);

    // Takes the text explicitly (rather than reading `message` state)
    // so the pre-filled-from-home-screen auto-submit effect below can call
    // this immediately without racing a same-render setMessage() update.
    const runClassify = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        setLoading(true);
        try {
            const data = await aiAPI.classifyIntent(trimmed);
            if (data.action === 'ask') {
                setPhase('ask');
                setQuestion(data.question || t("Could you tell me a bit more about what you need?"));
                setProviders([]);
            } else {
                setPhase('results');
                setProviders(data.providers || []);
                setServiceCategory(data.intent?.service_category || null);
                setProfession(data.intent?.profession || null);
            }
        } catch (error: any) {
            if (error?.response?.status === 503) {
                showToast(t('Smart search is not available right now — try browsing categories instead.'), { type: 'info' });
            } else {
                showToast(t('Could not process that — please try again.'), { type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => runClassify(message);

    useEffect(() => {
        if (prefilledQuery) {
            setMessage(prefilledQuery);
            runClassify(prefilledQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleVoice = async () => {
        if (isVoiceSearching) {
            setIsVoiceSearching(false);
            setIsTranscribing(true);
            const transcript = await stopSpeechRecognition();
            setIsTranscribing(false);
            if (transcript) {
                setMessage(transcript);
            } else {
                let msg = t('No speech detected. Please try again.');
                if (transcript === '___NO_API_KEY___' || transcript === '___QUOTA_ERROR___') {
                    msg = t('Voice search is temporarily unavailable. Please try again later or type your request.');
                }
                showToast(msg, { type: 'info' });
            }
            return;
        }

        const granted = await requestSpeechPermissions();
        if (!granted) {
            showToast(t('Microphone permission is needed for voice search.'), { type: 'error' });
            return;
        }
        setIsVoiceSearching(true);
        try {
            await startSpeechRecognition();
        } catch {
            setIsVoiceSearching(false);
            showToast(t('Failed to start voice recording. Please try again.'), { type: 'error' });
        }
    };

    const renderBusinessCard = (item: any) => {
        const owner = item.user_details || {};
        return (
            <View style={styles.businessCard} key={item.id}>
                <Avatar name={item.business_name} size={44} borderRadius={radius.sm} />
                <View style={{ flex: 1, marginLeft: space.md }}>
                    <Text style={styles.businessName} numberOfLines={1}>{item.business_name}</Text>
                    <Text style={styles.businessCategory} numberOfLines={1}>{item.category_name || t('Business')}</Text>
                    <View style={styles.locRow}>
                        <MaterialIcons name="place" size={11} color={color.ink300} />
                        <Text style={styles.locText} numberOfLines={1}>
                            {owner.lga_details?.name || t('Local')}, {owner.state_details?.name || ''}
                        </Text>
                    </View>
                </View>
                {!!owner.phone_number && (
                    <Pressable
                        style={styles.callBtn}
                        onPress={() => Linking.openURL(`tel:${owner.phone_number}`)}
                        accessibilityRole="button"
                        accessibilityLabel={t('Call')}
                    >
                        <MaterialIcons name="call" size={18} color={color.brand600} />
                    </Pressable>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color="#FFF" />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('Smart Search')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.inputSection}>
                    <Text style={styles.hint}>
                        {t('Describe what you need, in any language — we’ll find who can help.')}
                    </Text>
                    <View style={styles.searchBar}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder={t('e.g. "my pipe is leaking in Kumbotso, Kano"')}
                            placeholderTextColor={color.ink300}
                            value={message}
                            onChangeText={setMessage}
                            onSubmitEditing={handleSubmit}
                            returnKeyType="search"
                            multiline
                        />
                        <Pressable
                            style={[styles.voiceBtn, isVoiceSearching && styles.voiceBtnActive]}
                            onPress={toggleVoice}
                            accessibilityRole="button"
                            accessibilityLabel={t('Voice search')}
                        >
                            {isTranscribing ? (
                                <ActivityIndicator size="small" color={color.brand600} />
                            ) : (
                                <MaterialIcons
                                    name={isVoiceSearching ? 'mic' : 'mic-none'}
                                    size={20}
                                    color={isVoiceSearching ? '#FFF' : color.brand600}
                                />
                            )}
                        </Pressable>
                    </View>
                    <Pressable
                        style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.9 }, !message.trim() && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading || !message.trim()}
                        accessibilityRole="button"
                        accessibilityLabel={t('Search')}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>{t('Find providers')}</Text>}
                    </Pressable>
                </View>

                {phase === 'ask' && (
                    <View style={styles.askBanner}>
                        <MaterialIcons name="help-outline" size={18} color={color.brand600} />
                        <Text style={styles.askText}>{question}</Text>
                    </View>
                )}

                {phase === 'results' && (
                    <>
                        {providers.length > 0 && (
                            <Text style={styles.resultsLabel}>
                                {profession
                                    ? t('Showing results for "{{profession}}"', { profession })
                                    : t('Results')}
                            </Text>
                        )}
                        {providers.length === 0 ? (
                            <EmptyState
                                icon="search-off"
                                title={t('No matches found nearby')}
                                message={t('Try describing your need differently, or a different location.')}
                            />
                        ) : serviceCategory === 'business' ? (
                            <FlatList
                                data={providers}
                                keyExtractor={(item: any) => `biz-${item.id}`}
                                renderItem={({ item }) => renderBusinessCard(item)}
                                contentContainerStyle={styles.listContent}
                            />
                        ) : (
                            <FlatList
                                data={providers}
                                keyExtractor={(item: any) => `art-${item.id}`}
                                renderItem={({ item }) => (
                                    <ArtisanCard artisan={item} onPress={() => router.push(`/artisan/${item.id}`)} />
                                )}
                                contentContainerStyle={styles.listContent}
                            />
                        )}
                    </>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },

    headerSafe: { backgroundColor: color.brand900 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.xl,
        paddingVertical: space.md,
        backgroundColor: color.brand900,
    },
    headerTitle: { fontFamily: font.extrabold, fontSize: 16, color: '#FFF' },
    backButton: {
        width: 40, height: 40, borderRadius: radius.md,
        backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
    },

    inputSection: { padding: space.xl },
    hint: { fontFamily: font.medium, fontSize: 13, color: color.ink400, marginBottom: space.md },
    searchBar: {
        flexDirection: 'row', alignItems: 'flex-end', gap: space.sm,
        backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: color.border,
        paddingHorizontal: space.lg, paddingVertical: space.sm, minHeight: 52,
    },
    searchInput: { flex: 1, fontFamily: font.semibold, fontSize: 14.5, color: color.ink900, paddingVertical: 6, maxHeight: 100 },
    voiceBtn: {
        width: 36, height: 36, borderRadius: radius.md, backgroundColor: color.brand100,
        alignItems: 'center', justifyContent: 'center',
    },
    voiceBtnActive: { backgroundColor: color.accent600 },

    submitButton: {
        marginTop: space.md, height: 50, borderRadius: radius.lg,
        backgroundColor: color.brand600, alignItems: 'center', justifyContent: 'center',
        ...shadow.e2,
    },
    submitButtonDisabled: { opacity: 0.5 },
    submitText: { color: '#FFF', fontFamily: font.extrabold, fontSize: 15 },

    askBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: color.brand100, borderRadius: radius.md,
        padding: space.lg, marginHorizontal: space.xl,
    },
    askText: { flex: 1, fontFamily: font.semibold, fontSize: 13.5, color: color.brand600 },

    resultsLabel: { fontFamily: font.bold, fontSize: 12.5, color: color.ink400, paddingHorizontal: space.xl, marginBottom: space.sm },
    listContent: { padding: space.xl, paddingTop: 0, paddingBottom: 50 },

    businessCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: color.surface, padding: space.lg, borderRadius: radius.lg,
        marginBottom: space.md, borderWidth: 1, borderColor: '#EEF2F8',
    },
    businessName: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
    businessCategory: { fontFamily: font.bold, fontSize: 12, color: color.ink400, marginTop: 2 },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
    locText: { fontFamily: font.bold, fontSize: 11, color: color.ink300 },
    callBtn: {
        width: 38, height: 38, borderRadius: radius.md, backgroundColor: color.brand100,
        alignItems: 'center', justifyContent: 'center',
    },
});
