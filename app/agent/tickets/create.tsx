import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ticketAPI } from '@/src/api/client';
import { colors } from '@/styles/commonStyles';

export default function CreateTicketScreen() {
    const router = useRouter();
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!subject || !description) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await ticketAPI.createTicket({ subject, description, priority });
            Alert.alert('Success', 'Complaint submitted successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    const PriorityChip = ({ level, label, color }: any) => (
        <TouchableOpacity
            style={[styles.chip, priority === level && { backgroundColor: color, borderColor: color }]}
            onPress={() => setPriority(level)}
        >
            <Text style={[styles.chipText, priority === level ? { color: '#FFF' } : { color: '#6B7280' }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Complaint</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.form}>
                <Text style={styles.label}>Subject</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Verification Issue"
                    value={subject}
                    onChangeText={setSubject}
                />

                <Text style={styles.label}>Priority Level</Text>
                <View style={styles.priorityRow}>
                    <PriorityChip level="low" label="Low" color="#10B981" />
                    <PriorityChip level="medium" label="Medium" color="#F59E0B" />
                    <PriorityChip level="high" label="High" color="#EF4444" />
                </View>

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Submit Complaint</Text>}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
        borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    backButton: { padding: 4 },

    form: { padding: 24 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
    input: {
        backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
        borderRadius: 12, padding: 14, fontSize: 16, color: '#1F2937'
    },
    textArea: { height: 120 },

    priorityRow: { flexDirection: 'row', gap: 10 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFF'
    },
    chipText: { fontWeight: '600', fontSize: 13 },

    submitButton: {
        backgroundColor: colors.primary, borderRadius: 12, height: 50,
        justifyContent: 'center', alignItems: 'center', marginTop: 32,
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
    },
    submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});