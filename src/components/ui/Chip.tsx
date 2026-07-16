import React from 'react';
import { Pressable, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color, font, radius } from '@/constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Subcategory chips use a soft fill with no visible border. */
  subcategory?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, selected = false, onPress, subcategory = false, icon, style }: ChipProps) {
  const fg = selected ? color.surface : subcategory ? color.ink600 : color.ink600;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.base,
        subcategory ? styles.subcategory : styles.default,
        selected && styles.selected,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {icon && (
        <MaterialIcons name={icon} size={16} color={selected ? color.surface : color.ink400} style={styles.icon} />
      )}
      <Text style={[styles.label, { color: fg }, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: 14,
    height: 36,
  },
  default: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: '#DFE6F0',
  },
  subcategory: {
    backgroundColor: '#EEF2F8',
  },
  selected: {
    backgroundColor: color.brand600,
    borderColor: color.brand600,
  },
  icon: { marginRight: 6 },
  label: { fontFamily: font.bold, fontSize: 13 },
  labelSelected: { color: color.surface },
});

export default Chip;
