import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color, font } from '@/constants/theme';
import { languageName } from '@/src/constants/languages';

interface MessageBubbleProps {
  /** Text to display — already translated into the viewer's preferred
   * language by the backend (chat.serializers.MessageSerializer), or the
   * original if no translation was needed/possible. */
  text: string;
  mine: boolean;
  timestamp?: string;
  seen?: boolean;
  delivered?: boolean;
  style?: StyleProp<ViewStyle>;
  /** The untouched original — only meaningful when isTranslated is true. */
  originalText?: string;
  isTranslated?: boolean;
  /** ISO 639-1 code of the original message, for the "Translated from X" label. */
  sourceLanguage?: string;
}

export function MessageBubble({
  text, mine, timestamp, seen, delivered, style,
  originalText, isTranslated, sourceLanguage,
}: MessageBubbleProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  // Automatic, server-side translation (see chat.serializers.MessageSerializer)
  // means there's nothing to fetch here — the toggle just flips between two
  // strings the API already sent.
  const displayText = showOriginal && originalText ? originalText : text;

  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs, style]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.text, mine ? styles.textMine : styles.textTheirs]}>{displayText}</Text>
        {isTranslated && (
          <Text style={[styles.translationLabel, mine ? styles.translationLabelMine : styles.translationLabelTheirs]}>
            {showOriginal ? `Original (${languageName(sourceLanguage)})` : `Translated from ${languageName(sourceLanguage)}`}
          </Text>
        )}
      </View>
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
        {isTranslated && (
          <TouchableOpacity
            onPress={() => setShowOriginal((v) => !v)}
            style={styles.translateBtn}
            accessibilityRole="button"
            accessibilityLabel={showOriginal ? 'Show translation' : 'View original'}
            accessibilityState={{ selected: showOriginal }}
          >
            <MaterialIcons
              name={showOriginal ? 'undo' : 'translate'}
              size={14}
              color={showOriginal ? color.brand600 : color.ink400}
            />
          </TouchableOpacity>
        )}
      </View>
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
  translationLabel: {
    fontFamily: font.bold,
    fontSize: 9.5,
    marginTop: 4,
    opacity: 0.7,
  },
  translationLabelMine: { color: 'rgba(255,255,255,0.7)' },
  translationLabelTheirs: { color: color.ink400 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  time: { fontFamily: font.bold, fontSize: 10.5, color: color.ink300 },
  ticks: { marginLeft: 4 },
  translateBtn: {
    marginLeft: 6,
    padding: 4,
  },
});

export default MessageBubble;
