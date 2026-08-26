import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView } from '@/src/components/Keyboard';
import { color, font, radius, space } from '@/constants/theme';

export interface CountryOption {
  id: number;
  name: string;
  /** Flag emoji — already provided by the backend's Country.emoji field for
   * every country (CountryLiteSerializer), never guessed/generated here. */
  emoji?: string;
}

interface CountryPickerModalProps {
  visible: boolean;
  value?: string;
  countries: CountryOption[];
  onSelect: (id: string) => void;
  onClose: () => void;
  title?: string;
}

// Bottom-sheet country list with a flag next to every name and a search box
// that filters live as the user types — the ~250-country list a plain
// scrollable picker made tedious to use. Mirrors LanguagePickerModal's
// visual pattern (same bottom sheet, row, and selected-check styling).
export function CountryPickerModal({ visible, value, countries, onSelect, onClose, title }: CountryPickerModalProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, query]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      {/* This app runs Android edge-to-edge (app.json), which breaks React
          Native's own built-in KeyboardAvoidingView measurement — the
          keyboard covers the search box/list without this custom, OS-event-
          driven one (see src/components/Keyboard.tsx; same fix already
          used by app/chat/[id].tsx and app/chat/ai.tsx). "padding" is the
          only behavior that works on both platforms here. */}
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <Pressable style={styles.overlay} onPress={handleClose} accessibilityRole="none">
          <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title ?? t('Country')}</Text>

          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={18} color={color.ink400} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('Search country…')}
              placeholderTextColor={color.ink300}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel={t('Clear search')} hitSlop={8}>
                <MaterialIcons name="close" size={18} color={color.ink400} />
              </Pressable>
            )}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t('No countries match "{{query}}"', { query })}</Text>
            }
            renderItem={({ item }) => {
              const selected = String(item.id) === value;
              return (
                <Pressable
                  onPress={() => { onSelect(String(item.id)); handleClose(); }}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.flag}>{item.emoji || '🏳️'}</Text>
                    <Text style={[styles.rowText, selected && styles.rowTextSelected]}>{item.name}</Text>
                  </View>
                  {selected && <MaterialIcons name="check" size={20} color={color.brand600} />}
                </Pressable>
              );
            }}
          />
        </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(11,31,63,0.55)' },
  sheet: {
    backgroundColor: color.surface, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl,
    paddingTop: space.md, paddingHorizontal: space.xl, paddingBottom: space.xxl, maxHeight: '80%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: color.border, alignSelf: 'center', marginBottom: space.lg },
  title: { fontFamily: font.extrabold, fontSize: 17, color: color.ink900, marginBottom: space.md },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    backgroundColor: color.surfaceSunken, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border,
    paddingHorizontal: space.lg, height: 46, marginBottom: space.md,
  },
  searchInput: { flex: 1, fontFamily: font.semibold, fontSize: 15, color: color.ink900, paddingVertical: 0 },
  list: { maxHeight: 420 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: color.border,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexShrink: 1 },
  flag: { fontSize: 22 },
  rowText: { fontFamily: font.semibold, fontSize: 15, color: color.ink900, flexShrink: 1 },
  rowTextSelected: { fontFamily: font.extrabold, color: color.brand600 },
  emptyText: { fontFamily: font.medium, fontSize: 14, color: color.ink400, textAlign: 'center', paddingVertical: space.xxl },
});

export default CountryPickerModal;
