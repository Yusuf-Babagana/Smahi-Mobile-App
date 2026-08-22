import type { ComponentProps } from 'react';
import type { MaterialIcons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

// Keyword buckets rather than one entry per exact category/subcategory name
// (there are 85+ of the latter and the list keeps growing) — every glyph
// below is confirmed to exist in @expo/vector-icons' MaterialIcons set.
// Order matters where a name could match more than one bucket.
const PROFESSION_ICONS: [RegExp, IconName][] = [
  [/plumb/i, 'plumbing'],
  [/electric/i, 'electrical-services'],
  [/mechanic|auto|vulcaniz|panel beater|towing|\bdriver\b/i, 'directions-car'],
  [/carpentry|furniture|upholstery/i, 'carpenter'],
  [/hair|barber|wig/i, 'content-cut'],
  [/makeup|cosmetic|nail|henna|tattoo|spa|massage/i, 'spa'],
  [/laundry|dry clean/i, 'local-laundry-service'],
  [/clean|pest|waste/i, 'cleaning-services'],
  [/paint/i, 'format-paint'],
  [/mason|concrete|\bpop\b|plaster|tiling|roofing|glass|gate|iron bend|steel|aluminum/i, 'construction'],
  [/security|cctv/i, 'security'],
  [/locksmith/i, 'lock'],
  [/photograph/i, 'camera-alt'],
  [/videograph/i, 'videocam'],
  [/\bdj\b|music|sound & equipment|entertainment/i, 'music-note'],
  [/event/i, 'event'],
  [/digital marketing|graphic design|virtual assistant/i, 'computer'],
  [/computer|phone repair|web |app develop/i, 'computer'],
  [/\btv\b|electronics repair|satellite|dstv|smart home/i, 'tv'],
  [/solar/i, 'solar-power'],
  [/generator|\bac \b|ac repair|ac technician|hvac|home appliance|interior/i, 'home-repair-service'],
  [/farm|poultry|livestock/i, 'agriculture'],
  [/cater|baking|confection|grill|suya|juice|beverage|butcher|meal prep|food/i, 'restaurant'],
  [/account|\btax\b|consult|legal|translat|tutor|education/i, 'work'],
  [/logistics|delivery|moving|relocation|errand|shopper|shipping|water tanker|borehole/i, 'local-shipping'],
  [/tailor|fashion|shoemak|sign writer|banner/i, 'checkroom'],
  [/watch repair/i, 'hardware'],
];

/** A generic, always-valid MaterialIcons glyph for any profession/category
 * name — used on artisan cards so a client always sees a relevant icon,
 * even for a category whose backend Category.icon field is blank or in a
 * different icon family (Category.icon is Ionicons-style, e.g.
 * "shirt-outline"; every card in this app uses MaterialIcons). */
export function professionIcon(name?: string | null): IconName {
  if (!name) return 'build';
  const match = PROFESSION_ICONS.find(([pattern]) => pattern.test(name));
  return match ? match[1] : 'build';
}

export default professionIcon;
