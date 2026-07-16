import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLang = () => {
    const nextLang = i18n.language === 'en' ? 'ha' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <TouchableOpacity style={styles.chip} onPress={toggleLang}>
      <Ionicons name="language" size={14} color="#FFF" />
      <Text style={styles.chipText}>{i18n.language === 'en' ? 'EN' : 'HA'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  }
});