import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { API_URL as BASE_URL, CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from '@/src/constants/env';
import { useToast, useConfirm } from '@/src/components/ui';

export default function PortfolioScreen() {
    const router = useRouter();
    const { show: showToast } = useToast();
    const confirm = useConfirm();
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            const response = await axios.get(`${BASE_URL}/auth/profile/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setImages(response.data.portfolio_images || []);
        } catch (error) {
            console.log("Error fetching portfolio", error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            showToast("Allow access to photos to upload work samples.", { type: 'warn' });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0]);
        }
    };

    const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
        setUploading(true);
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            const formData = new FormData();

            const uri = asset.uri;
            const name = uri.split('/').pop();
            const type = 'image/jpeg';

            // @ts-ignore
            formData.append('image', { uri, name, type });
            formData.append('caption', 'My Work');

            const response = await axios.post(`${BASE_URL}/auth/portfolio/upload/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            showToast("Image uploaded!", { type: 'success' });
            setImages(prev => [response.data, ...prev]);

        } catch (error: any) {
            console.error("Upload Error:", error.response?.data || error.message);
            showToast("Upload failed — please check your internet connection.", { type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = async (id: number) => {
        const ok = await confirm({
            title: "Delete",
            message: "Remove this image?",
            confirmLabel: "Delete",
            destructive: true,
        });
        if (!ok) return;

        try {
            const token = await SecureStore.getItemAsync('accessToken');
            await axios.delete(`${BASE_URL}/auth/portfolio/${id}/delete/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setImages(prev => prev.filter(img => img.id !== id));
        } catch (error) {
            showToast("Could not delete image.", { type: 'error' });
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
                        <Text style={styles.title}>My Portfolio</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <Text style={styles.subtitle}>Showcase your best work to attract more clients.</Text>
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
                                <TouchableOpacity style={styles.addCard} onPress={pickImage} disabled={uploading}>
                                    {uploading ? (
                                        <ActivityIndicator color={color.brand600} />
                                    ) : (
                                        <>
                                            <View style={styles.iconCircle}>
                                                <Ionicons name="camera" size={24} color={color.brand600} />
                                            </View>
                                            <Text style={styles.addText}>Add Photo</Text>
                                        </>
                                    )}
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
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteImage(item.id)}>
                                    <Ionicons name="trash-outline" size={14} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                />
            )}
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
    deleteBtn: {
        position: 'absolute', top: 6, right: 6,
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
        width: 26, height: 26, borderRadius: 13,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: color.surface
    }
});
