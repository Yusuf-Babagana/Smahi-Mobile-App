import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { colors, shadows } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { bookingAPI } from '@/src/api/client';

interface BookingModalProps {
    visible: boolean;
    onClose: () => void;
    artisan: any;
}

export const BookingModal = ({ visible, onClose, artisan }: BookingModalProps) => {
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(''); // Simple text for now, use DatePicker later
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!description || !date) {
            Alert.alert('Missing Info', 'Please describe the job and provide a date.');
            return;
        }

        setLoading(true);
        try {
            await bookingAPI.create(artisan.id, description, date);
            Alert.alert('Success', 'Booking request sent!');
            onClose();
            setDescription('');
            setDate('');
        } catch (error) {
            Alert.alert('Error', 'Failed to send booking request.');
        } finally {
            setLoading(false);
        }
    };

    if (!artisan) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Book {artisan.user?.first_name || 'Artisan'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <IconSymbol name="xmark.circle.fill" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Job Description</Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        placeholder="I need help fixing my kitchen sink..."
                        multiline
                        value={description}
                        onChangeText={setDescription}
                    />

                    <Text style={styles.label}>Preferred Date</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        value={date}
                        onChangeText={setDate}
                    />

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Confirm Booking</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 400 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    title: { fontSize: 20, fontWeight: '800', color: colors.text },
    label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 16 },
    submitBtn: { backgroundColor: colors.primary, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});