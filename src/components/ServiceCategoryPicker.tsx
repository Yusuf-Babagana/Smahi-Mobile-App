import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { professionIcon } from '@/src/constants/professionIcons';

interface Item {
  label: string;
  value: string;
}

interface ServiceCategoryPickerProps {
  label: string;
  placeholder: string;
  value: string;
  items: Item[];
  onValueChange: (val: string) => void;
  loading?: boolean;
}

// Step 4 of artisan registration (app/register.tsx) — the one CustomPicker
// use where showing a profession icon actually matters. CustomPicker itself
// can't do this: it renders @react-native-picker/picker's native OS dropdown
// (Android's native dialog / iOS's native wheel), and a native Picker.Item
// only accepts label/value/color — there's no way to put a custom icon
// glyph inside an OS-rendered row. This is a plain React Native list in a
// bottom sheet instead, specifically so each row can show its
// professionIcon() next to the name — same icon shown everywhere else in
// the app (Service Directory, AI assistant) once this artisan is live.
export default function ServiceCategoryPicker({
  label,
  placeholder,
  value,
  items,
  onValueChange,
  loading,
}: ServiceCategoryPickerProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.value === value);
  // The "Other (type below…)" option has no real profession name to match
  // against — give it its own clear icon rather than falling through to
  // the generic fallback professionIcon() uses for a genuinely unknown word.
  const iconFor = (item: Item) => (item.value === '__custom__' ? 'edit' : professionIcon(item.label));

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>

      <Pressable
        onPress={() => setOpen(true)}
        disabled={loading}
        style={[
          styles.field,
          { backgroundColor: theme.dark ? '#1C1C1E' : '#F2F2F7', borderColor: theme.colors.border },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={styles.fieldContent}>
          {selected && (
            <MaterialIcons
              name={iconFor(selected)}
              size={18}
              color={theme.colors.primary}
              style={styles.fieldIcon}
            />
          )}
          <Text
            style={[styles.fieldText, { color: value ? theme.colors.text : '#999' }]}
            numberOfLines={1}
          >
            {selected ? selected.label : placeholder}
          </Text>
        </View>
        <MaterialIcons name="expand-more" size={20} color={theme.dark ? '#666' : '#999'} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} accessibilityRole="none">
          <Pressable style={[styles.sheet, { backgroundColor: theme.colors.card }]} onPress={() => {}}>
            <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>{label}</Text>
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onValueChange(item.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.row,
                      { borderBottomColor: theme.colors.border },
                      pressed && { opacity: 0.7 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View
                      style={[
                        styles.iconTile,
                        { backgroundColor: theme.dark ? '#2C2C2E' : '#F2F2F7' },
                      ]}
                    >
                      <MaterialIcons name={iconFor(item)} size={17} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.rowText, { color: theme.colors.text }]} numberOfLines={1}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                    )}
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
  container: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },

  field: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  fieldContent: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  fieldIcon: { marginRight: 8 },
  fieldText: { fontSize: 16, flexShrink: 1 },

  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '75%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  list: { maxHeight: 440 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconTile: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, fontSize: 15 },
});
