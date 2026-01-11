import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { colors, shadows } from '@/styles/commonStyles';

const BASE_URL = 'https://smahi1.pythonanywhere.com/api';
const CLOUD_NAME = 'dvj6cw5dq'; // ✅ Your Cloud Name

export default function PortfolioScreen() {
    const router = useRouter();
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
            console.log("Portfolio Data:", response.data.portfolio_images);
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
            Alert.alert("Permission Required", "Allow access to photos to upload work samples.");
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

            Alert.alert("Success", "Image uploaded!");
            setImages(prev => [response.data, ...prev]);

        } catch (error: any) {
            console.error("Upload Error:", error.response?.data || error.message);
            Alert.alert("Upload Failed", "Please check your internet connection.");
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = async (id: number) => {
        Alert.alert("Delete", "Remove this image?", [
            { text: "Cancel" },
            {
                text: "Delete", style: 'destructive', onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('accessToken');
                        await axios.delete(`${BASE_URL}/auth/portfolio/${id}/delete/`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setImages(prev => prev.filter(img => img.id !== id));
                    } catch (error) {
                        Alert.alert("Error", "Could not delete image.");
                    }
                }
            }
        ]);
    };

    // ✅ INTELLIGENT URL RESOLVER
    const getImageUrl = (item: any) => {
        if (!item) return null;

        let url = '';

        // 1. Extract URL string from object or string
        if (typeof item.image === 'string') {
            url = item.image;
        } else if (item.image && item.image.url) {
            url = item.image.url;
        }

        if (!url) return null;

        // 2. Fix Relative Paths (The Cloudinary Fix)
        // If it starts with "image/upload", it's missing the domain
        if (!url.startsWith('http') && url.includes('image/upload')) {
            return `https://res.cloudinary.com/${CLOUD_NAME}/${url}`;
        }

        // 3. Fix Insecure HTTP
        if (url.startsWith('http:')) {
            return url.replace('http:', 'https:');
        }

        return url;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* --- GRADIENT HEADER --- */}
            <LinearGradient
                colors={['#103d75', '#1e64bc']}
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
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
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
                                        <ActivityIndicator color={colors.primary} />
                                    ) : (
                                        <>
                                            <View style={styles.iconCircle}>
                                                <Ionicons name="camera" size={24} color={colors.primary} />
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
                                        <Ionicons name="image-outline" size={24} color="#CCC" />
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
    container: { flex: 1, backgroundColor: '#F8F9FA' },

    // Header
    header: {
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...shadows.medium
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 8
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    title: { fontSize: 20, fontWeight: '700', color: '#FFF' },
    subtitle: {
        paddingHorizontal: 20,
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        textAlign: 'center'
    },

    // Grid
    grid: { padding: 16, paddingBottom: 50 },

    // Cards
    addCard: {
        width: '31%',
        aspectRatio: 1,
        margin: '1.15%',
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#BAE6FD',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconCircle: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF',
        justifyContent: 'center', alignItems: 'center', marginBottom: 6,
        ...shadows.small
    },
    addText: { fontSize: 11, fontWeight: '600', color: '#0284C7' },

    imageCard: {
        width: '31%',
        aspectRatio: 1,
        margin: '1.15%',
        borderRadius: 16,
        overflow: 'hidden',
        ...shadows.small,
        backgroundColor: '#FFF'
    },
    image: { width: '100%', height: '100%' },
    deleteBtn: {
        position: 'absolute', top: 6, right: 6,
        backgroundColor: 'rgba(239, 68, 68, 0.9)', // Red semi-transparent
        width: 26, height: 26, borderRadius: 13,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#FFF'
    }
});