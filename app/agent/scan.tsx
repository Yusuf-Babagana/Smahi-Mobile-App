import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { font } from '@/constants/theme';

// QR scanning needs the expo-camera package plus a development build (Expo
// Go can't load custom native modules) — this is a placeholder until that's
// in place, not a working scanner.
export default function QRScannerScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[StyleSheet.absoluteFillObject, styles.placeholder]}>
                <Ionicons name="camera-outline" size={80} color="#374151" />
                <Text style={styles.placeholderTitle}>Scanning is coming soon</Text>
                <Text style={styles.placeholderBody}>
                    For now, find the artisan by name or ID from the artisan list instead.
                </Text>
            </View>

            <View style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Scan Artisan ID</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },

    placeholder: { backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
    placeholderTitle: { color: '#9CA3AF', marginTop: 20, textAlign: 'center', paddingHorizontal: 40, fontFamily: font.extrabold, fontSize: 15 },
    placeholderBody: { color: '#6B7280', marginTop: 6, textAlign: 'center', paddingHorizontal: 48, fontFamily: font.medium, fontSize: 13 },

    overlay: { flex: 1, justifyContent: 'space-between', paddingVertical: 50 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
    closeButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
    title: { color: '#FFF', fontFamily: font.extrabold, fontSize: 16.5 },
});
