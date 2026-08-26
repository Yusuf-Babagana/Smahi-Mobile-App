import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, font, radius, space } from '@/constants/theme';
import { SearchablePickerModal, SearchablePickerItem } from './SearchablePickerModal';

interface SearchablePickerFieldProps {
  value: string;
  items: SearchablePickerItem[];
  onValueChange: (id: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
}

// Registration's State field — was a plain CustomPicker (a scrolling wheel
// with no way to jump to one by typing). Same tap-to-open-a-sheet pattern
// as CountryPickerField/LanguagePickerField, minus a flag (states/
// provinces don't have one) — generic enough for any other plain
// {id, name} list (e.g. a future LGA search) to reuse as-is.
export function SearchablePickerField({
  value, items, onValueChange, label, placeholder, error, disabled, searchPlaceholder,
}: SearchablePickerFieldProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const selected = items.find((i) => String(i.id) === value);

  return (
    <View style={styles.fieldBlock}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.input,
          error && styles.inputError,
          disabled && styles.inputDisabled,
          pressed && !disabled && { opacity: 0.8 },
        ]}
      >
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.name ?? (placeholder ?? t('Select'))}
        </Text>
        <MaterialIcons name="expand-more" size={20} color={color.ink400} />
      </Pressable>
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <SearchablePickerModal
        visible={open}
        value={value}
        items={items}
        title={label}
        searchPlaceholder={searchPlaceholder}
        onClose={() => setOpen(false)}
        onSelect={onValueChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldBlock: { flex: 1, marginBottom: space.lg },
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
  inputDisabled: { backgroundColor: color.surfaceChip },
  value: { fontFamily: font.semibold, fontSize: 15, color: color.ink900, flexShrink: 1 },
  placeholder: { color: color.ink300 },
  errorText: { fontFamily: font.semibold, fontSize: 12, color: color.danger600, marginTop: space.sm, marginLeft: 4 },
});

export default SearchablePickerField;
