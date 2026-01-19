import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from './IconSymbol';

interface CustomPickerProps {
    label: string;
    value: string;
    placeholder: string;
    items?: { label: string; value: string }[];
    onValueChange: (val: string) => void;
    loading?: boolean;
}

export default function CustomPicker({
    label,
    value,
    placeholder,
    items = [],
    onValueChange,
    loading
}: CustomPickerProps) {
    const theme = useTheme();
    const [showModal, setShowModal] = useState(false);

    // Find label for the selected value
    const selectedLabel = items.find((i) => i.value === value)?.label || placeholder;

    // --- ANDROID FIX ---
    if (Platform.OS === 'android') {
        return (
            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
                <View style={[
                    styles.androidPickerContainer,
                    {
                        // Force a slight background color to ensure contrast if text is white
                        backgroundColor: theme.dark ? '#2C2C2E' : '#F2F2F7',
                        borderColor: theme.colors.border
                    }
                ]}>
                    <Picker
                        selectedValue={value}
                        onValueChange={onValueChange}
                        // 1. Color of the Selected Text shown in the box
                        style={{ color: theme.colors.text }}
                        // 2. Color of the Arrow icon
                        dropdownIconColor={theme.colors.text}
                        enabled={!loading}
                        mode="dialog" // Popup dialog is safer than dropdown on Android
                    >
                        {/* Placeholder Item */}
                        <Picker.Item
                            label={placeholder}
                            value=""
                            color={theme.dark ? '#999999' : '#666666'}
                            style={{ fontSize: 14 }}
                        />

                        {/* List Items */}
                        {items.map((item) => (
                            <Picker.Item
                                key={item.value}
                                label={item.label}
                                value={item.value}
                                // 3. CRITICAL: Force text color for items in the list
                                color={theme.dark ? '#FFFFFF' : '#000000'}
                                style={{ fontSize: 16 }}
                            />
                        ))}
                    </Picker>
                </View>
            </View>
        );
    }

    // --- iOS (No Changes needed usually, but ensured colors) ---
    return (
        <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>

            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowModal(true)}
                style={[styles.iosPickerButton, {
                    backgroundColor: theme.dark ? '#1C1C1E' : '#F2F2F7',
                    borderColor: theme.colors.border
                }]}
            >
                <Text style={[styles.iosPickerText, { color: value ? theme.colors.text : '#999' }]}>
                    {value ? selectedLabel : placeholder}
                </Text>
                <IconSymbol name="chevron.up.chevron.down" size={16} color={theme.dark ? '#666' : '#999'} />
            </TouchableOpacity>

            <Modal visible={showModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.modalToolbar, { borderBottomColor: theme.colors.border }]}>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Text style={{ color: theme.colors.primary, fontSize: 16 }}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{label}</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 16 }}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <Picker
                            selectedValue={value}
                            onValueChange={onValueChange}
                            style={{ height: 215 }}
                            itemStyle={{ color: theme.colors.text }}
                        >
                            <Picker.Item label={placeholder} value="" color="#999" />
                            {items.map((item) => (
                                <Picker.Item key={item.value} label={item.label} value={item.value} color={theme.colors.text} />
                            ))}
                        </Picker>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },

    androidPickerContainer: {
        borderRadius: 12,
        borderWidth: 1,
        height: 54, // Fixed height to align with text inputs
        justifyContent: 'center',
    },

    iosPickerButton: {
        height: 50, borderRadius: 16, borderWidth: 1,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16
    },
    iosPickerText: { fontSize: 16 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
    modalToolbar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderBottomWidth: StyleSheet.hairlineWidth
    },
    modalTitle: { fontWeight: '600', fontSize: 16 },
});