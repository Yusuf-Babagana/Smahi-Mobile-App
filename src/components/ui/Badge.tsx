import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { font, radius, statusTones } from '@/constants/theme';

export type BadgeStatus = keyof typeof statusTones;

interface BadgeProps {
  label: string;
  status?: BadgeStatus;
  /** Override tone colors for one-off badges. */
  bg?: string;
  fg?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, status = 'confirmed', bg, fg, icon, style }: BadgeProps) {
  const tone = statusTones[status];
  const background = bg ?? tone.bg;
  const foreground = fg ?? tone.fg;

  return (
    <View style={[styles.base, { backgroundColor: background }, style]}>
      {icon && <MaterialIcons name={icon} size={13} color={foreground} style={styles.icon} />}
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  icon: { marginRight: 4 },
  label: {
    fontFamily: font.extrabold,
    fontSize: 11,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
  },
});

export default Badge;
