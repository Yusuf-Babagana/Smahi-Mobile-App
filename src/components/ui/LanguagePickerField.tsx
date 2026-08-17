import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, font, radius, space } from '@/constants/theme';
import { languageName } from '@/src/constants/languages';
import { LanguagePickerModal } from './LanguagePickerModal';

interface LanguagePickerFieldProps {
  /** Current preferred_language code, e.g. 'en' — blank/undefined shows "English". */
  value?: string;
  /** Fires with the chosen code as soon as the user taps a language — caller
   * is responsible for persisting it (e.g. authAPI.updateProfile). */
  onChange: (code: string) => void;
  label?: string;
  hint?: string;
}

// Sets a user's default communication language (chat.translation on the
// backend automatically translates every message they receive into it).
// A labeled form field for settings screens (Personal Information, artisan
// profile) — see LanguagePickerChip for the compact dashboard-header version.
export function LanguagePickerField({ value, onChange, label, hint }: LanguagePickerFieldProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label ?? t('Message language')}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('Change message language')}
        style={({ pressed }) => [styles.input, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.value}>{languageName(value)}</Text>
        <MaterialIcons name="expand-more" size={20} color={color.ink400} />
      </Pressable>
      <Text style={styles.hint}>
        {hint ?? t('Messages you receive are automatically translated into this language.')}
      </Text>

      <LanguagePickerModal
        visible={open}
        value={value}
        title={label ?? t('Message language')}
        onClose={() => setOpen(false)}
        onSelect={(code) => { onChange(code); setOpen(false); }}
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
  value: { fontFamily: font.semibold, fontSize: 15, color: color.ink900 },
  hint: { fontFamily: font.medium, fontSize: 12, color: color.ink400, marginTop: space.sm, marginLeft: 4, lineHeight: 16 },
});

export default LanguagePickerField;
