import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { color, font, radius } from '@/constants/theme';

interface StepHeaderProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  /** Localized "Step {n} of {m}" text; falls back to English. */
  stepLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function StepHeader({ step, totalSteps, onBack, stepLabel, style }: StepHeaderProps) {
  const progress = useSharedValue(step / totalSteps);

  useEffect(() => {
    progress.value = withTiming(step / totalSteps, { duration: 300 });
  }, [step, totalSteps, progress]);

  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={style}>
      <View style={styles.row}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
        </Pressable>
        <Text style={styles.stepText}>{stepLabel ?? `Step ${step} of ${totalSteps}`}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontFamily: font.bold,
    fontSize: 12.5,
    color: color.ink400,
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: color.surfaceChip,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: color.brand600,
  },
});

export default StepHeader;
