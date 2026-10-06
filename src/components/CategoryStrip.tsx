import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { avatarTones, color, font, radius, space } from '@/constants/theme';
import { CategoryGroup } from '@/src/types';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

// Keyword -> glyph so every category gets a recognisable graphic without any
// backend change. First match wins; unknown categories fall back to a toolbox.
const ICON_RULES: [RegExp, IconName][] = [
  [/plumb/, 'plumbing'],
  [/electr/, 'electrical-services'],
  [/carpent|wood|furnit/, 'carpenter'],
  [/paint|decor/, 'format-paint'],
  [/clean|laund/, 'cleaning-services'],
  [/mechanic|auto|car |vehicle|motor/, 'car-repair'],
  [/tailor|fashion|cloth|textile/, 'checkroom'],
  [/hair|barber|beaut|makeup|salon/, 'content-cut'],
  [/food|cater|cook|chef|bak/, 'restaurant'],
  [/build|construct|mason|brick|tile|weld|roof/, 'construction'],
  [/air|cool|refriger|\bac\b/, 'ac-unit'],
  [/tech|comput|phone|gadget|software|it /, 'devices'],
  [/garden|farm|agri|land/, 'grass'],
  [/driv|transport|logist|deliver/, 'local-shipping'],
  [/health|nurs|medic|care/, 'medical-services'],
  [/teach|tutor|educ|school/, 'school'],
  [/photo|video|media/, 'photo-camera'],
  [/event|party|entertain/, 'celebration'],
  [/secur|guard/, 'security'],
];

export const iconForCategory = (name: string): IconName => {
  const n = ` ${(name || '').toLowerCase()} `;
  return ICON_RULES.find(([re]) => re.test(n))?.[1] ?? 'handyman';
};

type Props = {
  categories: CategoryGroup[];
  language: string;
  activeParentId: number | null; // expanded parent or selected category
  allSelected: boolean;
  onSelectAll: () => void;
  onSelectParent: (id: number) => void;
  onBusinesses: () => void;
};

function Tile({
  label, icon, bg, fg, selected, onPress,
}: { label: string; icon: IconName; bg: string; fg: string; selected?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.tile}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: selected ? color.brand600 : bg }, selected && styles.iconBoxSelected]}>
        <MaterialIcons name={icon} size={26} color={selected ? '#FFF' : fg} />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

export function CategoryStrip({
  categories, language, activeParentId, allSelected, onSelectAll, onSelectParent, onBusinesses,
}: Props) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <Tile label={t('All')} icon="apps" bg={color.brand100} fg={color.brand600} selected={allSelected} onPress={onSelectAll} />
      {categories.map((cat, i) => {
        const tone = avatarTones[i % avatarTones.length];
        const label = language === 'ha' && cat.name_ha ? cat.name_ha : cat.name;
        return (
          <Tile
            key={cat.id}
            label={label}
            icon={iconForCategory(cat.name)}
            bg={tone.bg}
            fg={tone.fg}
            selected={activeParentId === cat.id}
            onPress={() => onSelectParent(cat.id)}
          />
        );
      })}
      <Tile label={t('Businesses')} icon="storefront" bg={color.accent100} fg={color.accent600} onPress={onBusinesses} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: space.xl, gap: space.md, paddingVertical: space.xs },
  tile: { width: 72, alignItems: 'center' },
  iconBox: { width: 60, height: 60, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  iconBoxSelected: {
    shadowColor: color.brand600, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  label: { fontFamily: font.bold, fontSize: 11.5, color: color.ink600, textAlign: 'center', marginTop: 6 },
  labelSelected: { color: color.brand600, fontFamily: font.extrabold },
});
