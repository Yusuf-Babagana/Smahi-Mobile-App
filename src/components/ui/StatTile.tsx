import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color, font, radius, space } from '@/constants/theme';

interface StatTileProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string | number;
  label: string;
  /** Tonal icon tile colors (defaults to brand tones). */
  tileBg?: string;
  tileFg?: string;
  /** On dark headers use the translucent variant. */
  translucent?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function StatTile({
  icon,
  value,
  label,
  tileBg = color.brand100,
  tileFg = color.brand600,
  translucent = false,
  style,
}: StatTileProps) {
  return (
    <View style={[styles.container, translucent && styles.translucent, style]}>
      <View
        style={[
          styles.iconTile,
          { backgroundColor: translucent ? 'rgba(255,255,255,0.14)' : tileBg },
        ]}
      >
        <MaterialIcons name={icon} size={20} color={translucent ? '#FFFFFF' : tileFg} />
      </View>
      <Text style={[styles.value, translucent && styles.valueLight]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.label, translucent && styles.labelLight]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: '#EEF2F8',
  },
  translucent: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  value: {
    fontFamily: font.extrabold,
    fontSize: 16,
    color: color.ink900,
  },
  valueLight: { color: '#FFFFFF' },
  label: {
    fontFamily: font.bold,
    fontSize: 12,
    color: color.ink400,
    marginTop: 2,
  },
  labelLight: { color: 'rgba(255,255,255,0.72)' },
});

export default StatTile;
