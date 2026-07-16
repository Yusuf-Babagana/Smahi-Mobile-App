import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';

export default function CreateAgentScreen() {
    const router = useRouter();
    const { user } = useAuth(); // LG Admin's user object
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: 'AgentPassword123', // Default
    });

    const handleCreate = async () => {
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
            Alert.alert("Error", "Please fill all fields.");
            return;
        }

        setLoading(true);
        try {
            // Auto-assign LGA/State from the logged-in LG Admin
            const payload = {
                name: `${formData.first_name} ${formData.last_name}`,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: 'agent', // Force role

                // 🔒 LOCK LOCATION to Admin's Location
                country: user?.country,
                state: user?.state,
                lga: user?.lga
            };

            // @ts-ignore
            await adminAPI.createAgent(payload);

            Alert.alert("Success", "Agent created successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            const msg = error.response?.data ? JSON.stringify(error.response.data) : "Failed to create agent.";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Field Agent</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.form}>
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#3B82F6" />
                    <Text style={styles.infoText}>
                        This agent will be assigned to <Text style={{ fontWeight: 'bold' }}>{user?.lga_details?.name}</Text>.
                    </Text>
                </View>

                <Text style={styles.label}>First Name</Text>
                <TextInput style={styles.input} value={formData.first_name} onChangeText={t => setFormData({ ...formData, first_name: t })} />

                <Text style={styles.label}>Last Name</Text>
                <TextInput style={styles.input} value={formData.last_name} onChangeText={t => setFormData({ ...formData, last_name: t })} />

                <Text style={styles.label}>Email Address</Text>
                <TextInput style={styles.input} value={formData.email} onChangeText={t => setFormData({ ...formData, email: t })} keyboardType="email-address" autoCapitalize="none" />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput style={styles.input} value={formData.phone} onChangeText={t => setFormData({ ...formData, phone: t })} keyboardType="phone-pad" />

                <Text style={styles.label}>Default Password</Text>
                <TextInput style={[styles.input, { backgroundColor: '#F3F4F6', color: '#6B7280' }]} value={formData.password} editable={false} />

                <TouchableOpacity style={styles.submitButton} onPress={handleCreate} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Create Agent</Text>}
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    backButton: { padding: 4 },

    form: { padding: 24 },
    infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginBottom: 20, alignItems: 'center', gap: 10 },
    infoText: { color: '#1E40AF', fontSize: 13, flex: 1 },

    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16 },

    submitButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
    submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});