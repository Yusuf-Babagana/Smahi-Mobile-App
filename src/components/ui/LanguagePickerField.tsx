import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, font, radius, space } from '@/constants/theme';
import { SUPPORTED_LANGUAGES, languageName } from '@/src/constants/languages';

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
// Used on both the client Personal Information screen and the artisan/
// service-provider profile screen — one picker, one behavior, everywhere.
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

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} accessibilityRole="none">
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.title}>{label ?? t('Message language')}</Text>
            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={(item) => item.code}
              style={styles.list}
              renderItem={({ item }) => {
                const selected = item.code === value;
                return (
                  <Pressable
                    onPress={() => { onChange(item.code); setOpen(false); }}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={[styles.rowText, selected && styles.rowTextSelected]}>{item.name}</Text>
                    {selected && <MaterialIcons name="check" size={20} color={color.brand600} />}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
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

  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(11,31,63,0.55)' },
  sheet: {
    backgroundColor: color.surface, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl,
    paddingTop: space.md, paddingHorizontal: space.xl, paddingBottom: space.xxl, maxHeight: '70%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: color.border, alignSelf: 'center', marginBottom: space.lg },
  title: { fontFamily: font.extrabold, fontSize: 17, color: color.ink900, marginBottom: space.md },
  list: { maxHeight: 400 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: color.border,
  },
  rowText: { fontFamily: font.semibold, fontSize: 15, color: color.ink900 },
  rowTextSelected: { fontFamily: font.extrabold, color: color.brand600 },
});

export default LanguagePickerField;
