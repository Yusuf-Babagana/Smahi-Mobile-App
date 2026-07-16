import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color, font } from '@/constants/theme';

interface MessageBubbleProps {
  text: string;
  mine: boolean;
  timestamp?: string;
  /** Delivery state for my messages; drives the tick icons. */
  seen?: boolean;
  delivered?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function MessageBubble({ text, mine, timestamp, seen, delivered, style }: MessageBubbleProps) {
  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs, style]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.text, mine ? styles.textMine : styles.textTheirs]}>{text}</Text>
      </View>
      {(timestamp || mine) && (
        <View style={styles.meta}>
          {timestamp ? <Text style={styles.time}>{timestamp}</Text> : null}
          {mine && (
            <MaterialIcons
              name={seen || delivered ? 'done-all' : 'done'}
              size={14}
              color={seen ? '#7FD6C8' : color.ink300}
              style={styles.ticks}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 10, maxWidth: '78%' },
  rowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  rowTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: color.brand600,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 6,
    borderBottomLeftRadius: 18,
  },
  bubbleTheirs: {
    backgroundColor: color.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#EEF2F8',
  },
  text: { fontFamily: font.medium, fontSize: 14.5, lineHeight: 21 },
  textMine: { color: '#FFFFFF' },
  textTheirs: { color: color.ink900 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  time: { fontFamily: font.bold, fontSize: 10.5, color: color.ink300 },
  ticks: { marginLeft: 4 },
});

export default MessageBubble;
