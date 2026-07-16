import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  StyleProp,
  ViewStyle,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color, font, space } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** Trailing icon (e.g. visibility toggle) */
  trailingIcon?: keyof typeof MaterialIcons.glyphMap;
  onTrailingIconPress?: () => void;
}

export function Input({
  label,
  icon,
  error,
  containerStyle,
  trailingIcon,
  onTrailingIconPress,
  onFocus,
  onBlur,
  style,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {/* Outer wrapper renders the 3px focus ring */}
      <View style={[styles.ring, focused && !hasError && styles.ringFocused]}>
        <View
          style={[
            styles.field,
            focused && !hasError && styles.fieldFocused,
            hasError && styles.fieldError,
          ]}
        >
          {icon && (
            <MaterialIcons
              name={icon}
              size={20}
              color={focused ? color.brand600 : color.ink300}
              style={styles.icon}
            />
          )}
          <TextInput
            placeholderTextColor={color.ink300}
            style={[styles.input, style]}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
          {trailingIcon && (
            <Pressable
              onPress={onTrailingIconPress}
              hitSlop={10}
              accessibilityRole="button"
              style={styles.trailing}
            >
              <MaterialIcons name={trailingIcon} size={20} color={color.ink400} />
            </Pressable>
          )}
        </View>
      </View>
      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: font.bold,
    fontSize: 12.5,
    color: color.ink600,
    marginBottom: 6,
  },
  ring: {
    borderRadius: 17,
    padding: 3,
    margin: -3,
  },
  ringFocused: {
    backgroundColor: 'rgba(27, 95, 217, 0.12)',
  },
  field: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: color.border,
    backgroundColor: color.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
  },
  fieldFocused: {
    borderColor: color.brand600,
  },
  fieldError: {
    borderColor: color.danger600,
    backgroundColor: '#FFF7F7',
  },
  icon: { marginRight: 10 },
  trailing: { marginLeft: 10 },
  input: {
    flex: 1,
    fontFamily: font.semibold,
    fontSize: 14.5,
    color: color.ink900,
    paddingVertical: 0,
  },
  errorText: {
    fontFamily: font.bold,
    fontSize: 12,
    color: color.danger600,
    marginTop: 6,
  },
});

export default Input;
