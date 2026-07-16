import React, { useEffect } from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { radius as r, space } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  /** Alternate (lighter) block color. */
  light?: boolean;
}

export function Skeleton({ width = '100%', height = 14, radius = 8, style, light = false }: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.55, { duration: 700 }), -1, true);
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: light ? '#EBF0F7' : '#E4EAF3' },
        animated,
        style,
      ]}
    />
  );
}

/** Placeholder matching the ArtisanCard layout, shown while lists load. */
export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        <Skeleton width={56} height={56} radius={18} />
        <View style={styles.lines}>
          <Skeleton width="62%" height={15} />
          <Skeleton width="40%" height={12} light style={{ marginTop: 8 }} />
          <Skeleton width="52%" height={12} light style={{ marginTop: 8 }} />
        </View>
      </View>
      <Skeleton height={40} radius={r.md} light style={{ marginTop: space.lg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: r.xl,
    padding: space.lg,
    marginBottom: space.md,
    borderWidth: 1,
    borderColor: '#EEF2F8',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  lines: { flex: 1, marginLeft: space.md },
});

export default Skeleton;
