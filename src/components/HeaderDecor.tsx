import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color } from '@/constants/theme';

// Decorative backdrop for the dark brand headers: optional brand gradient plus
// soft translucent circles. Drop it in as the FIRST child of a header that has
// `overflow: 'hidden'` — it never intercepts touches and adds no layout.
export function HeaderDecor({ gradient = false }: { gradient?: boolean }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {gradient && (
        <LinearGradient
          colors={[color.brand900, '#12428C', color.brand600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={[styles.circle, styles.big]} />
      <View style={[styles.circle, styles.small]} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' },
  big: { width: 220, height: 220, top: -90, right: -60 },
  small: { width: 120, height: 120, bottom: -40, left: -30, backgroundColor: 'rgba(255,255,255,0.05)' },
});
