import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, font, radius, space } from '@/constants/theme';

export interface SearchablePickerItem {
  id: number;
  name: string;
}

interface SearchablePickerModalProps {
  visible: boolean;
  value?: string;
  items: SearchablePickerItem[];
  onSelect: (id: string) => void;
  onClose: () => void;
  title?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

// Generic bottom-sheet list with a live-filtering search box — the same
// "type to jump to it instead of scrolling" fix as CountryPickerModal, for
// any plain {id, name} list that has no flag/icon of its own (State/
// Province today; any future LGA/category-style list can reuse this
// directly rather than duplicating it).
export function SearchablePickerModal({
  visible, value, items, onSelect, onClose, title, searchPlaceholder, emptyText,
}: SearchablePickerModalProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Deliberately NOT autoFocus — on Android, a TextInput trying to focus
  // (and pull up the IME) while this Modal's own "slide" entrance
  // animation is still mid-transition is a known source of exactly the
  // instability being fixed here (the Dialog window's bounds aren't
  // settled yet, so the OS can end up confused about where touches/back
  // events should go once typing starts). Focusing only after the
  // animation has had time to finish avoids that race entirely.
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, [visible]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, query]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose} accessibilityRole="none">
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title ?? t('Select')}</Text>

          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={18} color={color.ink400} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder={searchPlaceholder ?? t('Search…')}
              placeholderTextColor={color.ink300}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
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
              <Text style={styles.emptyText}>{emptyText ?? t('No matches for "{{query}}"', { query })}</Text>
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
  rowText: { fontFamily: font.semibold, fontSize: 15, color: color.ink900, flexShrink: 1 },
  rowTextSelected: { fontFamily: font.extrabold, color: color.brand600 },
  emptyText: { fontFamily: font.medium, fontSize: 14, color: color.ink400, textAlign: 'center', paddingVertical: space.xxl },
});

export default SearchablePickerModal;
