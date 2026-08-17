import React, { useEffect, useState } from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { authAPI } from '@/src/api/client';
import { storage } from '@/src/utils/storage';
import { color, font, radius } from '@/constants/theme';
import { useToast } from './Toast';
import { LanguagePickerModal } from './LanguagePickerModal';

interface LanguagePickerChipProps {
  /** 'dark' for a glassy pill on a brand-colored header (client dashboard);
   * 'light' for a surface-colored pill on a white background. */
  variant?: 'dark' | 'light';
}

// Compact, self-contained "message language" control for dashboard headers —
// drop it in and it just works: loads the signed-in user's preferred_language
// on mount and saves any change immediately (authAPI.updateProfile +
// storage.updateCurrentUser), the same way artisan/profile.tsx's picker does.
// No props needed beyond visual variant. See LanguagePickerField for the
// labeled form-field version used in Personal Information / artisan profile.
export function LanguagePickerChip({ variant = 'dark' }: LanguagePickerChipProps) {
  const { t } = useTranslation();
  const { show: showToast } = useToast();
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    storage.getCurrentUser().then((user) => setValue(user?.preferred_language || ''));
  }, []);

  const handleSelect = async (code: string) => {
    setOpen(false);
    if (code === value) return;
    const previous = value;
    setValue(code); // optimistic
    setSaving(true);
    try {
      await authAPI.updateProfile({ preferred_language: code });
      await storage.updateCurrentUser({ preferred_language: code });
      showToast(t('Message language updated.'), { type: 'success' });
    } catch (error) {
      setValue(previous);
      showToast(t('Failed to update message language. Please try again.'), { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const dark = variant === 'dark';
  const iconColor = dark ? '#FFF' : color.brand600;
  const caretColor = dark ? 'rgba(255,255,255,0.75)' : color.ink400;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={saving}
        style={[styles.chip, dark ? styles.chipDark : styles.chipLight, saving && { opacity: 0.7 }]}
        accessibilityRole="button"
        accessibilityLabel={t('Change message language')}
      >
        {saving ? (
          <ActivityIndicator size={12} color={iconColor} />
        ) : (
          <MaterialIcons name="translate" size={13} color={iconColor} />
        )}
        <Text style={[styles.chipText, dark ? styles.chipTextDark : styles.chipTextLight]}>
          {(value || 'en').toUpperCase()}
        </Text>
        <MaterialIcons name="expand-more" size={14} color={caretColor} />
      </Pressable>

      <LanguagePickerModal
        visible={open}
        value={value}
        title={t('Message language')}
        onClose={() => setOpen(false)}
        onSelect={handleSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  chipDark: { backgroundColor: 'rgba(255,255,255,0.12)' },
  chipLight: { backgroundColor: color.brand100 },
  chipText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.4 },
  chipTextDark: { color: '#FFF' },
  chipTextLight: { color: color.brand600 },
});

export default LanguagePickerChip;
