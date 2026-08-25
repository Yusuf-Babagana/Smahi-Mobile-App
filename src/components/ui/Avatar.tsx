import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { avatarTones, color, font } from '@/constants/theme';

// Generic African man/woman placeholder photos for the gender fallback —
// used when an account has no uploaded photo but has set a gender, to
// match this app's audience (Nigeria / northern Nigeria) instead of a
// mismatched ethnicity. Fixed, individually verified images (not a random
// per-render pick, and not pravatar.cc — its set turned out to include at
// least one photo resembling a recognizable public figure, a real risk
// for a shipped app regardless of ethnicity match) so the same account
// always shows the same fallback face. randomuser.me is a long-established
// service built specifically for generic dummy-user photos. Falls through
// to tonal initials if these fail to load too (e.g. offline) — see the
// failed/genderPhotoFailed states.
const GENDER_PLACEHOLDER: Record<'male' | 'female', string> = {
  male: 'https://randomuser.me/api/portraits/men/91.jpg',
  female: 'https://randomuser.me/api/portraits/women/6.jpg',
};

interface AvatarProps {
  name?: string;
  /** Optional photo; falls back to a generic same-gender placeholder photo
   * (if gender is set) or tonal initials when missing or on load error. */
  uri?: string | null;
  /** 'male' | 'female' | '' — only used when there's no photo. Blank (the
   * default for every account created before this field existed, and for
   * anyone who hasn't set it) falls back to initials exactly as before. */
  gender?: string | null;
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
  gender,
  size = 50,
  borderRadius,
  verified = false,
  online = false,
  style,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const [genderPhotoFailed, setGenderPhotoFailed] = useState(false);
  const tone = toneFor(name || '?');
  const r = borderRadius ?? size / 2;
  const badgeSize = Math.max(16, Math.round(size * 0.34));
  const dotSize = Math.max(10, Math.round(size * 0.26));
  const genderPhoto = gender === 'male' || gender === 'female' ? GENDER_PLACEHOLDER[gender] : null;

  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri && !failed ? (
        <Image
          source={{ uri }}
          onError={() => setFailed(true)}
          style={{ width: size, height: size, borderRadius: r, backgroundColor: tone.bg }}
        />
      ) : genderPhoto && !genderPhotoFailed ? (
        <Image
          source={{ uri: genderPhoto }}
          onError={() => setGenderPhotoFailed(true)}
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
