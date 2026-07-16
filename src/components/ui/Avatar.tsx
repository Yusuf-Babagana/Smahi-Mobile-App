import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { avatarTones, color, font } from '@/constants/theme';

interface AvatarProps {
  name?: string;
  /** Optional photo; falls back to tonal initials when missing or on load error. */
  uri?: string | null;
  size?: number;
  /** Circular by default; pass a radius for rounded-square avatars (e.g. profile head card). */
  borderRadius?: number;
  verified?: boolean;
  online?: boolean;
  style?: StyleProp<ViewStyle>;
}

function toneFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return avatarTones[Math.abs(hash) % avatarTones.length];
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name = '',
  uri,
  size = 50,
  borderRadius,
  verified = false,
  online = false,
  style,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const tone = toneFor(name || '?');
  const r = borderRadius ?? size / 2;
  const badgeSize = Math.max(16, Math.round(size * 0.34));
  const dotSize = Math.max(10, Math.round(size * 0.26));

  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri && !failed ? (
        <Image
          source={{ uri }}
          onError={() => setFailed(true)}
          style={{ width: size, height: size, borderRadius: r, backgroundColor: tone.bg }}
        />
      ) : (
        <View
          style={[
            styles.initialsBox,
            { width: size, height: size, borderRadius: r, backgroundColor: tone.bg },
          ]}
        >
          <Text style={[styles.initials, { color: tone.fg, fontSize: size * 0.36 }]}>
            {initialsFor(name)}
          </Text>
        </View>
      )}
      {verified && (
        <View style={[styles.badgeDisc, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}>
          <MaterialIcons name="verified" size={badgeSize - 3} color={color.accent600} />
        </View>
      )}
      {online && (
        <View
          style={[
            styles.onlineDot,
            { width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  initialsBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: font.extrabold,
  },
  badgeDisc: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: color.online,
    borderWidth: 2,
    borderColor: color.surface,
  },
});

export default Avatar;
