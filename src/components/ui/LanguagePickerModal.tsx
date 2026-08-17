import React from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, font, radius, space } from '@/constants/theme';
import { SUPPORTED_LANGUAGES } from '@/src/constants/languages';

interface LanguagePickerModalProps {
  visible: boolean;
  /** Current preferred_language code, e.g. 'en'. */
  value?: string;
  onSelect: (code: string) => void;
  onClose: () => void;
  title?: string;
}

// Shared bottom-sheet language list — used by both LanguagePickerField (a
// labeled form field, e.g. Personal Information) and LanguagePickerChip (a
// compact header control, e.g. the client dashboard) so there's one place
// that renders the actual list of supported languages.
export function LanguagePickerModal({ visible, value, onSelect, onClose, title }: LanguagePickerModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} accessibilityRole="none">
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title ?? t('Message language')}</Text>
          <FlatList
            data={SUPPORTED_LANGUAGES}
            keyExtractor={(item) => item.code}
            style={styles.list}
            renderItem={({ item }) => {
              const selected = item.code === value;
              return (
                <Pressable
                  onPress={() => onSelect(item.code)}
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
  );
}

const styles = StyleSheet.create({
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

export default LanguagePickerModal;
