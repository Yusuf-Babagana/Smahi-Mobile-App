import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color, font, space } from '@/constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon = 'search-off',
  title,
  message,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.disc}>
        <MaterialIcons name={icon} size={28} color={color.ink400} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="pill-outline" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: space.xxxl,
    paddingHorizontal: space.xxl,
  },
  disc: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E9EEF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  title: {
    fontFamily: font.extrabold,
    fontSize: 16.5,
    letterSpacing: -0.165,
    color: color.ink900,
    textAlign: 'center',
  },
  message: {
    fontFamily: font.medium,
    fontSize: 14,
    lineHeight: 22.4,
    color: color.ink400,
    textAlign: 'center',
    marginTop: 6,
  },
  action: { marginTop: space.xl },
});

export default EmptyState;
