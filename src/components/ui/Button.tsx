import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color, font, radius, shadow, touch } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'pill-tonal' | 'pill-outline';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** 44pt compact height instead of the 54pt default (pill variants are always compact). */
  compact?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  compact = false,
  disabled = false,
  loading = false,
  icon,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const isPill = variant === 'pill-tonal' || variant === 'pill-outline';
  const height = isPill || compact ? touch.buttonCompact : touch.button;

  const container: ViewStyle[] = [styles.base, { height, borderRadius: isPill ? radius.full : radius.lg }];
  let textColor = color.surface;

  if (disabled) {
    container.push({ backgroundColor: color.border });
    textColor = color.ink300;
  } else if (variant === 'primary') {
    container.push({ backgroundColor: color.brand600 }, shadow.cta as ViewStyle);
    textColor = color.surface;
  } else if (variant === 'secondary') {
    container.push({ backgroundColor: color.surface, borderWidth: 1.5, borderColor: color.border });
    textColor = color.ink900;
  } else if (variant === 'pill-tonal') {
    container.push({ backgroundColor: color.brand100, paddingHorizontal: 18 });
    textColor = color.brand600;
  } else {
    container.push({
      backgroundColor: color.surface,
      borderWidth: 1.5,
      borderColor: color.border,
      paddingHorizontal: 18,
    });
    textColor = color.ink600;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [container, pressed && !disabled && styles.pressed, style]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && <MaterialIcons name={icon} size={20} color={textColor} style={styles.icon} />}
          <Text style={[styles.label, isPill && styles.labelCompact, { color: textColor }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pressed: { opacity: 0.85 },
  icon: { marginRight: 8 },
  label: { fontFamily: font.extrabold, fontSize: 15.5, letterSpacing: -0.1 },
  labelCompact: { fontSize: 13.5 },
});

export default Button;
