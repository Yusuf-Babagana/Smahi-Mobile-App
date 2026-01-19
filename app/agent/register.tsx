import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/src/contexts/AuthContext';
import { agentAPI, authAPI } from '@/src/api/client';
import { colors } from '@/styles/commonStyles';

export default function AgentRegisterScreen() {
    const router = useRouter();
    const { user } = useAuth(); // Get Agent's details

    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '', // Optional or auto-generated? Let's require it for now.
        phone: '',
        password: 'Password@123', // Default password for Agent registrations
        service_category: '',
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await authAPI.getServices();
            setServices(data);
        } catch (e) {
            console.log("Failed to load services");
        }
    };

    const handleRegister = async () => {
        if (!formData.first_name || !formData.last_name || !formData.phone || !formData.service_category) {
            Alert.alert("Missing Fields", "Please fill all required fields.");
            return;
        }

        setLoading(true);
        try {
            // Construct the payload
            // Note: We use the Agent's location to lock the Artisan to the same area
            const payload = {
                name: `${formData.first_name} ${formData.last_name}`,
                email: formData.email || `${formData.phone}@smahi.com`, // Fallback email
                phone: formData.phone,
                password: formData.password,
                role: 'artisan',
                service_category: formData.service_category,
                country: user?.country, // 🔒 Locked to Agent
                state: user?.state,     // 🔒 Locked to Agent
                lga: user?.lga          // 🔒 Locked to Agent
            };

            await agentAPI.registerArtisan(payload);

            Alert.alert(
                "Success",
                "Artisan Registered & Verified!",
                [
                    { text: "Register Another", onPress: () => resetForm() },
                    { text: "Done", onPress: () => router.back() }
                ]
            );
        } catch (error: any) {
            const msg = error.response?.data ? JSON.stringify(error.response.data) : "Registration failed.";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ ...formData, first_name: '', last_name: '', email: '', phone: '' });
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Register New Artisan</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.subText}>
                    You are registering this artisan in <Text style={{ fontWeight: 'bold' }}>{user?.lga_details?.name}</Text>.
                </Text>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Ibrahim"
                        value={formData.first_name}
                        onChangeText={t => setFormData({ ...formData, first_name: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Musa"
                        value={formData.last_name}
                        onChangeText={t => setFormData({ ...formData, last_name: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="080..."
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={t => setFormData({ ...formData, phone: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="artisan@gmail.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.email}
                        onChangeText={t => setFormData({ ...formData, email: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Service Category</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.service_category}
                            onValueChange={(itemValue) => setFormData({ ...formData, service_category: itemValue })}
                        >
                            <Picker.Item label="Select Service..." value="" />
                            {services.map((s: any) => (
                                <Picker.Item key={s.value} label={s.label} value={s.value} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Default Password</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#F3F4F6', color: '#6B7280' }]}
                        value={formData.password}
                        editable={false}
                    />
                    <Text style={styles.hint}>Share this password with the artisan.</Text>
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>REGISTER & VERIFY</Text>}
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    header: { height: 100, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 16, paddingHorizontal: 20 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', marginLeft: 16, marginBottom: 2 },
    backButton: { marginBottom: 2 },

    content: { padding: 24, backgroundColor: '#FFF', flexGrow: 1 },
    subText: { fontSize: 14, color: '#4B5563', marginBottom: 24, backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 },

    formGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16 },

    pickerContainer: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, overflow: 'hidden' },

    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 20 },
    hint: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },

    submitButton: { backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    submitText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }
});