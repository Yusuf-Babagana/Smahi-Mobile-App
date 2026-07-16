import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color, font } from '@/constants/theme';

interface BookingTimelineProps {
  /** Index of the current step, 0-based. Steps before it render as done. */
  currentStep: number;
  /** Defaults to Requested → Accepted → In progress → Done. */
  steps?: string[];
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_STEPS = ['Requested', 'Accepted', 'In progress', 'Done'];

export function BookingTimeline({ currentStep, steps = DEFAULT_STEPS, style }: BookingTimelineProps) {
  return (
    <View style={[styles.row, style]}>
      {steps.map((label, i) => {
        const done = i < currentStep;
        const current = i === currentStep;
        return (
          <React.Fragment key={label}>
            {i > 0 && (
              <View
                style={[styles.connector, { backgroundColor: i <= currentStep ? color.brand600 : color.border }]}
              />
            )}
            <View style={styles.step}>
              <View
                style={[
                  styles.disc,
                  done && styles.discDone,
                  current && styles.discCurrent,
                ]}
              >
                {done ? (
                  <MaterialIcons name="check" size={13} color="#FFFFFF" />
                ) : current ? (
                  <MaterialIcons name="more-horiz" size={13} color={color.brand600} />
                ) : (
                  <View style={styles.dot} />
                )}
              </View>
              <Text
                style={[styles.label, (done || current) && styles.labelActive]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  step: { alignItems: 'center', width: 68 },
  disc: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: color.surfaceChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discDone: { backgroundColor: color.brand600 },
  discCurrent: { backgroundColor: color.brand100 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.ink300,
  },
  connector: {
    flex: 1,
    height: 2,
    marginTop: 10,
    marginHorizontal: -14,
  },
  label: {
    fontFamily: font.bold,
    fontSize: 10.5,
    color: color.ink300,
    marginTop: 6,
    textAlign: 'center',
  },
  labelActive: { color: color.ink600 },
});

export default BookingTimeline;
