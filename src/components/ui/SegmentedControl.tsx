import React from 'react';
import { Pressable, StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { color, font, radius, shadow } from '@/constants/theme';

export interface Segment<T extends string = string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
  /** Compact variant for headers (e.g. EN/HA toggle). */
  compact?: boolean;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  style,
  compact = false,
}: SegmentedControlProps<T>) {
  return (
    <View style={[styles.track, compact && styles.trackCompact, style]}>
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <Pressable
            key={seg.value}
            onPress={() => onChange(seg.value)}
            accessibilityRole="button"
            accessibilityLabel={seg.label}
            accessibilityState={{ selected: active }}
            style={[styles.segment, compact && styles.segmentCompact, active && styles.segmentActive]}
          >
            <Text
              style={[
                styles.label,
                compact && styles.labelCompact,
                { color: active ? color.brand600 : color.ink400 },
              ]}
            >
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: color.surfaceChip,
    borderRadius: radius.full,
    padding: 3,
  },
  trackCompact: {
    alignSelf: 'flex-start',
  },
  segment: {
    flex: 1,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  segmentCompact: {
    flex: 0,
    height: 30,
    paddingHorizontal: 12,
  },
  segmentActive: {
    backgroundColor: color.surface,
    ...shadow.e1,
  },
  label: { fontFamily: font.extrabold, fontSize: 13.5 },
  labelCompact: { fontSize: 12 },
});

export default SegmentedControl;
