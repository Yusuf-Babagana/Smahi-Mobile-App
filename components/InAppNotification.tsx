import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, shadows } from '@/styles/commonStyles';

interface Props {
    visible: boolean;
    message: string;
    senderName: string;
    chatId: number;
    onHide: () => void;
}

export const InAppNotification = ({ visible, message, senderName, chatId, onHide }: Props) => {
    const router = useRouter();
    const slideAnim = useRef(new Animated.Value(-100)).current; // Start hidden above screen

    useEffect(() => {
        if (visible) {
            // Slide Down
            Animated.spring(slideAnim, {
                toValue: Platform.OS === 'ios' ? 50 : 20, // Adjust for StatusBar
                useNativeDriver: true,
                speed: 12,
            }).start();

            // Auto Hide after 4 seconds
            const timer = setTimeout(() => {
                hide();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hide = () => {
        Animated.timing(slideAnim, {
            toValue: -150,
            duration: 300,
            useNativeDriver: true,
        }).start(() => onHide());
    };

    const handlePress = () => {
        hide();
        router.push({
            pathname: '/chat/[id]',
            params: { id: chatId, name: senderName }
        });
    };

    if (!visible) return null;

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.content} onPress={handlePress} activeOpacity={0.9}>
                <View style={styles.iconCircle}>
                    <Ionicons name="chatbubble" size={20} color="#FFF" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>{senderName}</Text>
                    <Text style={styles.message} numberOfLines={1}>{message}</Text>
                </View>
                <TouchableOpacity onPress={hide} style={styles.closeBtn}>
                    <Ionicons name="close" size={18} color="#999" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0, left: 20, right: 20,
        zIndex: 9999, // Floating above everything
    },
    content: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.medium, // Uses your common shadow
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    iconCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    textContainer: { flex: 1 },
    title: { fontWeight: '700', fontSize: 14, color: '#111', marginBottom: 2 },
    message: { fontSize: 13, color: '#666' },
    closeBtn: { padding: 5 },
});