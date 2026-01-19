import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = 'https://smahi1.pythonanywhere.com/api';

export default function ActivationScreen() {
    const router = useRouter();
    const [serial, setSerial] = useState('');
    const [loading, setLoading] = useState(false);

    const handleActivation = async () => {
        if (!serial.trim()) {
            Alert.alert("Error", "Please enter your serial number");
            return;
        }

        setLoading(true);
        try {
            // 1. Get the current user's token
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) {
                Alert.alert("Session Expired", "Please login again.");
                router.replace('/login'); // ✅ Updated path
                return;
            }

            // 2. Send Serial Number to Backend
            const response = await axios.post(
                `${BASE_URL}/auth/activate/`,
                { serial_number: serial.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 3. Success!
            Alert.alert("🎉 Success", "Account activated successfully!", [
                {
                    text: "Go to Dashboard",
                    onPress: () => router.replace('/(tabs)/(home)') // Or '/agent/dashboard' if you have one
                }
            ]);

        } catch (error: any) {
            console.log("Activation Error:", error.response?.data);
            const msg = error.response?.data?.error || "Invalid Serial Number. Please contact your administrator.";
            Alert.alert("Activation Failed", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
        router.replace('/login'); // ✅ Updated path
    };

    return (
        <LinearGradient
            colors={['#1e1b4b', '#312e81', '#4338ca']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >

                {/* Lock Icon Animation Area */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="lock-closed" size={50} color="#FFF" />
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>ACCOUNT LOCKED</Text>
                    </View>
                </View>

                <Text style={styles.title}>Activation Required</Text>
                <Text style={styles.subtitle}>
                    This dashboard is restricted. Please enter the unique
                    <Text style={{ fontWeight: 'bold', color: '#FFF' }}> Serial Number </Text>
                    issued by your State Coordinator or Administrator.
                </Text>

                {/* Input Field */}
                <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                        <Ionicons name="key" size={20} color="#6366F1" />
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Serial Number"
                        placeholderTextColor="#9CA3AF"
                        value={serial}
                        onChangeText={setSerial}
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleActivation}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Unlock Dashboard</Text>
                    )}
                </TouchableOpacity>

                {/* Footer Actions */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <Ionicons name="log-out-outline" size={20} color="#A5B4FC" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => Alert.alert("Support", "Contact your Admin for your code.")}>
                        <Text style={styles.helpText}>Need Help?</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        alignItems: 'center'
    },

    // Icon Styles
    iconContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    statusBadge: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 10,
        letterSpacing: 1,
    },

    // Text Styles
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 12,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 15,
        color: '#C7D2FE',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22
    },

    // Input Styles
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
        width: '100%',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5
    },
    inputIcon: {
        marginRight: 12,
        opacity: 0.8
    },
    input: {
        flex: 1,
        fontSize: 18,
        color: '#1F2937',
        fontWeight: '600',
        letterSpacing: 1
    },

    // Button Styles
    button: {
        backgroundColor: '#4ADE80',
        width: '100%',
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: "#4ADE80",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6
    },
    buttonText: {
        color: '#064E3B',
        fontSize: 18,
        fontWeight: 'bold'
    },

    // Footer Styles
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    logoutText: {
        color: '#A5B4FC',
        fontSize: 16,
        fontWeight: '500'
    },
    helpText: {
        color: '#FFF',
        fontSize: 14,
        textDecorationLine: 'underline',
        opacity: 0.8
    }
});