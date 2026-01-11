import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

// ✅ FIX: Use the correct path '@styles/commonStyles'
import { colors } from '@/styles/commonStyles';

export const LanguageToggle = () => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        Alert.alert(
            t('settings.select'),
            "",
            [
                { text: "English", onPress: () => i18n.changeLanguage('en') },
                { text: "Hausa", onPress: () => i18n.changeLanguage('ha') },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    return (
        <TouchableOpacity onPress={toggleLanguage} style={styles.btn}>
            <Ionicons name="globe-outline" size={24} color={colors.primary} />
            <Text style={styles.text}>{i18n.language === 'ha' ? 'HA' : 'EN'}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    btn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#FFF', padding: 8, borderRadius: 20,
        borderWidth: 1, borderColor: '#EEE'
    },
    text: { fontWeight: '700', color: colors.primary, fontSize: 12 }
});