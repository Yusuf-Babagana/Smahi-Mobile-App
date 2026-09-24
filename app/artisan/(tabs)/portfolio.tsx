import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, StatusBar,
    Modal, TextInput, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { color, font, radius, shadow, space } from '@/constants/theme';
import { CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from '@/src/constants/env';
import { portfolioAPI } from '@/src/api/client';
import { Button, useToast, useConfirm } from '@/src/components/ui';

const MAX_ITEMS = 12;

export default function PortfolioScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { show: showToast } = useToast();
    const confirm = useConfirm();

    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [pickedAsset, setPickedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [kind, setKind] = useState<'service' | 'for_sale'>('service');
    const [priceLabel, setPriceLabel] = useState('');
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);

    const fetchPortfolio = useCallback(async () => {
        try {
            const data = await portfolioAPI.getMine();
            setImages(data || []);
        } catch (error) {
            console.log("Error fetching portfolio", error);
            showToast(t('Could not load your photos.'), { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [t]);

    useFocusEffect(
        useCallback(() => {
            fetchPortfolio();
        }, [fetchPortfolio])
    );

    const closeSheet = () => {
        setPickedAsset(null);
        setKind('service');
        setPriceLabel('');
        setCaption('');
    };

    const pickImage = async () => {
        if (images.length >= MAX_ITEMS) {
            showToast(t('You can have up to {{max}} photos — remove one first.', { max: MAX_ITEMS }), { type: 'warn' });
            return;
        }
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            showToast(t("Allow access to photos to upload work samples."), { type: 'warn' });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setPickedAsset(result.assets[0]);
        }
    };

    const submitUpload = async () => {
        if (!pickedAsset) return;
        setUploading(true);
        try {
            const created = await portfolioAPI.add(
                { uri: pickedAsset.uri, type: pickedAsset.mimeType },
                { kind, caption: caption.trim(), price_label: kind === 'for_sale' ? priceLabel.trim() : '' }
            );
            setImages(prev => [created, ...prev]);
            showToast(t('Photo added.'), { type: 'success' });
            closeSheet();
        } catch (error: any) {
            const msg = error.response?.data?.error || t('Could not upload this photo. Please try again.');
            showToast(msg, { type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = async (id: number) => {
        const ok = await confirm({
            title: t("Delete"),
            message: t("Remove this image?"),
            confirmLabel: t("Delete"),
            destructive: true,
        });
        if (!ok) return;

        setDeletingId(id);
        try {
            await portfolioAPI.remove(id);
            setImages(prev => prev.filter(img => img.id !== id));
        } catch (error) {
            showToast(t("Could not delete image."), { type: 'error' });
        } finally {
            setDeletingId(null);
        }
    };

    const getImageUrl = (item: any) => {
        if (!item) return null;

        let url = '';

        if (typeof item.image === 'string') {
            url = item.image;
        } else if (item.image && item.image.url) {
            url = item.image.url;
        }

        if (!url) return null;

        if (!url.startsWith('http') && url.includes('image/upload')) {
            return `https://res.cloudinary.com/${CLOUD_NAME}/${url}`;
        }

        if (url.startsWith('http:')) {
            return url.replace('http:', 'https:');
        }

        return url;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={[color.brand900, color.brand600]}
                style={styles.header}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={20} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.title}>{t('My Portfolio')}</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <Text style={styles.subtitle}>{t('Showcase your best work to attract more clients.')}</Text>
                </SafeAreaView>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={color.brand600} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={[{ id: 'add_btn' }, ...images]}
                    keyExtractor={(item) => item.id ? item.id.toString() : 'add'}
                    numColumns={3}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        if (item.id === 'add_btn') {
                            return (
                                <TouchableOpacity style={styles.addCard} onPress={pickImage}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="camera" size={24} color={color.brand600} />
                                    </View>
                                    <Text style={styles.addText}>{t('Add Photo')}</Text>
                                </TouchableOpacity>
                            );
                        }

                        const imageUrl = getImageUrl(item);

                        return (
                            <View style={styles.imageCard}>
                                {imageUrl ? (
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={styles.image}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
                                        <Ionicons name="image-outline" size={24} color={color.ink300} />
                                    </View>
                                )}
                                {(item.caption || item.price_label) ? (
                                    <View style={styles.captionWrap}>
                                        {item.caption ? (
                                            <Text style={styles.captionText} numberOfLines={1}>{item.caption}</Text>
                                        ) : null}
                                        {item.kind === 'for_sale' && item.price_label ? (
                                            <Text style={styles.priceText} numberOfLines={1}>{item.price_label}</Text>
                                        ) : null}
                                    </View>
                                ) : null}
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => deleteImage(item.id)}
                                    disabled={deletingId === item.id}
                                >
                                    {deletingId === item.id ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Ionicons name="trash-outline" size={14} color="#FFF" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                />
            )}

            <Modal
                visible={pickedAsset !== null}
                transparent
                animationType="fade"
                onRequestClose={closeSheet}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalTop}>
                            <Text style={styles.modalTitle}>{t('Add a photo')}</Text>
                            <Pressable onPress={closeSheet} accessibilityRole="button" accessibilityLabel={t('Close')} style={styles.modalCloseBtn}>
                                <MaterialIcons name="close" size={16} color={color.ink900} />
                            </Pressable>
                        </View>

                        {pickedAsset ? (
                            <Image source={{ uri: pickedAsset.uri }} style={styles.previewImage} resizeMode="cover" />
                        ) : null}

                        <Text style={styles.fieldLabel}>{t('What is this photo?')}</Text>
                        <View style={styles.kindRow}>
                            <Pressable
                                onPress={() => setKind('service')}
                                style={[styles.kindChip, kind === 'service' && styles.kindChipActive]}
                                accessibilityRole="button"
                            >
                                <Text style={[styles.kindChipText, kind === 'service' && styles.kindChipTextActive]}>{t('My work')}</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setKind('for_sale')}
                                style={[styles.kindChip, kind === 'for_sale' && styles.kindChipActive]}
                                accessibilityRole="button"
                            >
                                <Text style={[styles.kindChipText, kind === 'for_sale' && styles.kindChipTextActive]}>{t('Item for sale')}</Text>
                            </Pressable>
                        </View>

                        {kind === 'for_sale' ? (
                            <>
                                <Text style={styles.fieldLabel}>{t('Price')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={t('e.g. ₦18,000')}
                                    placeholderTextColor={color.ink300}
                                    value={priceLabel}
                                    onChangeText={setPriceLabel}
                                />
                            </>
                        ) : null}

                        <Text style={styles.fieldLabel}>{t('Caption (optional)')}</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder={t('e.g. Kitchen cabinet install')}
                            placeholderTextColor={color.ink300}
                            value={caption}
                            onChangeText={setCaption}
                        />

                        <View style={styles.modalActions}>
                            <Button title={t('Cancel')} variant="secondary" onPress={closeSheet} disabled={uploading} style={{ flex: 1 }} />
                            <Button title={t('Upload')} onPress={submitUpload} loading={uploading} style={{ flex: 1 }} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },

    header: {
        paddingBottom: space.xxl,
        borderBottomLeftRadius: radius.xxl,
        borderBottomRightRadius: radius.xxl,
        ...shadow.e2
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.xl,
        marginTop: space.sm,
        marginBottom: space.sm
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.16)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)'
    },
    title: { fontFamily: font.extrabold, fontSize: 20, color: '#FFF' },
    subtitle: {
        paddingHorizontal: space.xl,
        color: 'rgba(255,255,255,0.80)',
        fontFamily: font.medium,
        fontSize: 13,
        textAlign: 'center'
    },

    grid: { padding: space.lg, paddingBottom: 50 },

    addCard: {
        width: '31%',
        aspectRatio: 1,
        margin: '1.15%',
        backgroundColor: color.brand100,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: color.brand100,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconCircle: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: color.surface,
        justifyContent: 'center', alignItems: 'center', marginBottom: 6,
        ...shadow.e1
    },
    addText: { fontFamily: font.semibold, fontSize: 11, color: color.brand600 },

    imageCard: {
        width: '31%',
        aspectRatio: 1,
        margin: '1.15%',
        borderRadius: radius.lg,
        overflow: 'hidden',
        ...shadow.e1,
        backgroundColor: color.surface
    },
    image: { width: '100%', height: '100%' },
    captionWrap: {
        position: 'absolute', left: 0, right: 0, bottom: 0,
        paddingHorizontal: 6, paddingTop: 14, paddingBottom: 5,
        backgroundColor: 'rgba(11,31,63,0.55)',
    },
    captionText: { fontFamily: font.extrabold, fontSize: 9.5, color: '#FFF' },
    priceText: { fontFamily: font.bold, fontSize: 9, color: '#FDE68A', marginTop: 1 },
    deleteBtn: {
        position: 'absolute', top: 6, right: 6,
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
        width: 26, height: 26, borderRadius: 13,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: color.surface
    },

    modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
    modalCard: {
        backgroundColor: color.surface,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        padding: space.xl,
        paddingBottom: space.xxl,
    },
    modalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
    modalTitle: { fontFamily: font.extrabold, fontSize: 16, color: color.ink900 },
    modalCloseBtn: {
        width: 32, height: 32, borderRadius: radius.md,
        backgroundColor: color.surfaceSunken,
        alignItems: 'center', justifyContent: 'center',
    },
    previewImage: { width: '100%', height: 160, borderRadius: radius.lg, marginBottom: space.lg, backgroundColor: color.surfaceSunken },
    fieldLabel: { fontFamily: font.extrabold, fontSize: 12, color: color.ink900, marginBottom: space.sm },
    kindRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.lg },
    kindChip: {
        flex: 1, paddingVertical: 11, borderRadius: radius.md,
        borderWidth: 1.5, borderColor: color.border, backgroundColor: color.surface,
        alignItems: 'center',
    },
    kindChipActive: { backgroundColor: color.brand600, borderColor: color.brand600 },
    kindChipText: { fontFamily: font.extrabold, fontSize: 12.5, color: color.ink600 },
    kindChipTextActive: { color: '#FFF' },
    textInput: {
        height: 46, borderWidth: 1.5, borderColor: color.border, borderRadius: radius.md,
        paddingHorizontal: space.md, fontFamily: font.semibold, fontSize: 14, color: color.ink900,
        marginBottom: space.lg,
    },
    modalActions: { flexDirection: 'row', gap: space.md, marginTop: space.xs },
});
