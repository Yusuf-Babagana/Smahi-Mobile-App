import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, font, radius, space } from '@/constants/theme';
import { CountryPickerModal, CountryOption } from './CountryPickerModal';

interface CountryPickerFieldProps {
  /** Selected country id, as a string (matches how the rest of the
   * registration form already stores country/state/lga ids). */
  value: string;
  countries: CountryOption[];
  onValueChange: (id: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

// Registration's Country field — was a plain CustomPicker (a native
// scrolling wheel over all ~250 countries, no flags, no way to jump to one
// by typing). Same tap-to-open-a-sheet pattern as LanguagePickerField, with
// a flag next to every name and a live search box in the sheet itself.
export function CountryPickerField({
  value, countries, onValueChange, label, placeholder, error,
}: CountryPickerFieldProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const selected = countries.find((c) => String(c.id) === value);

  return (
    <View style={styles.fieldBlock}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label ?? t('Country')}
        style={({ pressed }) => [styles.input, error && styles.inputError, pressed && { opacity: 0.8 }]}
      >
        <View style={styles.valueRow}>
          {selected?.emoji ? <Text style={styles.flag}>{selected.emoji}</Text> : null}
          <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
            {selected?.name ?? (placeholder ?? t('Select Country'))}
          </Text>
        </View>
        <MaterialIcons name="expand-more" size={20} color={color.ink400} />
      </Pressable>
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <CountryPickerModal
        visible={open}
        value={value}
        countries={countries}
        title={label ?? t('Country')}
        onClose={() => setOpen(false)}
        onSelect={onValueChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldBlock: { marginBottom: space.lg },
  fieldLabel: {
    fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.5,
    textTransform: 'uppercase', color: color.ink400, marginBottom: space.sm, marginLeft: 4,
  },
  input: {
    backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1.5,
    borderColor: color.border, paddingHorizontal: space.lg, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inputError: { borderColor: color.danger600 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexShrink: 1 },
  flag: { fontSize: 18 },
  value: { fontFamily: font.semibold, fontSize: 15, color: color.ink900, flexShrink: 1 },
  placeholder: { color: color.ink300 },
  errorText: { fontFamily: font.semibold, fontSize: 12, color: color.danger600, marginTop: space.sm, marginLeft: 4 },
});

export default CountryPickerField;
