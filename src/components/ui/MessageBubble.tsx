import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color, font } from '@/constants/theme';
import { translateText } from '@/src/utils/translation';

interface MessageBubbleProps {
  text: string;
  mine: boolean;
  timestamp?: string;
  seen?: boolean;
  delivered?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function MessageBubble({ text, mine, timestamp, seen, delivered, style }: MessageBubbleProps) {
  const [translated, setTranslated] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  const handleTranslate = async () => {
    if (translated) {
      setTranslated(null);
      return;
    }
    setTranslating(true);
    try {
      const targetLang = mine ? 'ha' : 'en';
      const result = await translateText(text, 'auto', targetLang);
      if (result !== text) setTranslated(result);
    } catch {}
    setTranslating(false);
  };

  const displayText = translated || text;

  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs, style]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.text, mine ? styles.textMine : styles.textTheirs]}>{displayText}</Text>
        {translated && (
          <Text style={[styles.translationLabel, mine ? styles.translationLabelMine : styles.translationLabelTheirs]}>
            {mine ? 'Translated to Hausa' : 'Translated to English'}
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
        {!mine && (
          <TouchableOpacity
            onPress={handleTranslate}
            style={styles.translateBtn}
            accessibilityRole="button"
            accessibilityLabel={translated ? 'Show original' : 'Translate'}
          >
            {translating ? (
              <ActivityIndicator size={12} color={color.ink400} />
            ) : (
              <MaterialIcons
                name={translated ? 'undo' : 'translate'}
                size={14}
                color={translated ? color.brand600 : color.ink400}
              />
            )}
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
