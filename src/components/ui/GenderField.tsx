import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, font, radius, space } from '@/constants/theme';

interface GenderFieldProps {
  /** '' | 'male' | 'female' */
  value: string;
  onChange: (value: '' | 'male' | 'female') => void;
  label?: string;
}

// Optional everywhere it's used (registration, Personal Information, artisan
// profile) — never required to complete anything. Powers a male/female
// fallback Avatar in place of initials when the account has no photo; a
// blank value just keeps showing initials exactly as before this existed.
export function GenderField({ value, onChange, label }: GenderFieldProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label ?? t('Gender (optional)')}</Text>
      <View style={styles.row}>
        {(['male', 'female'] as const).map((g) => {
          const selected = value === g;
          return (
            <Pressable
              key={g}
              onPress={() => onChange(selected ? '' : g)}
              style={[styles.pill, selected && styles.pillSelected]}
              accessibilityRole="button"
              accessibilityLabel={g === 'male' ? t('Male') : t('Female')}
              accessibilityState={{ selected }}
            >
              <MaterialIcons
                name={g === 'male' ? 'man' : 'woman'}
                size={18}
                color={selected ? '#FFF' : color.ink400}
              />
              <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                {g === 'male' ? t('Male') : t('Female')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: space.lg },
  label: {
    fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.5,
    textTransform: 'uppercase', color: color.ink400, marginBottom: space.sm, marginLeft: 4,
  },
  row: { flexDirection: 'row', gap: space.sm },
  pill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    flex: 1, height: 46, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: color.border, backgroundColor: color.surface,
  },
  pillSelected: { backgroundColor: color.brand600, borderColor: color.brand600 },
  pillText: { fontFamily: font.bold, fontSize: 13.5, color: color.ink600 },
  pillTextSelected: { color: '#FFF' },
});

export default GenderField;
