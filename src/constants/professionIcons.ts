import type { ComponentProps } from 'react';
import type { MaterialIcons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

// Every artisan picks their profession from the fixed Category list at
// registration (~85 entries today, growing over time) — the icon shown
// for it must never require a code change per new profession. Keyword
// buckets (not one entry per exact category name) are what makes that
// hold: any category whose name contains a recognized keyword gets a
// meaningful icon automatically, including ones added to the database
// after this file was last touched, as long as the name uses ordinary
// words (e.g. a newly added "Veterinary Services" category would already
// match /health/ below and get the medical icon, with zero code change).
// Only a genuinely novel profession with no matching keyword falls back
// to the generic icon (see professionIcon() below) — that's the one case
// this can't fully automate, since nothing here can guess a symbol for a
// word it's never seen.
//
// Every glyph below is confirmed to exist in @expo/vector-icons'
// MaterialIcons set. Order matters where a name could match more than
// one bucket — more specific patterns are listed first.
const PROFESSION_ICONS: [RegExp, IconName][] = [
  [/plumb|\btap\b|pipe/i, 'plumbing'],
  [/electric|lightning/i, 'electrical-services'],
  [/mechanic|auto|vulcaniz|panel beater|towing|\bdriver\b|vehicle/i, 'directions-car'],
  [/weld/i, 'local-fire-department'],
  [/carpentry|furniture|upholstery|builder|building/i, 'carpenter'],
  [/hair|barber|wig/i, 'content-cut'],
  [/makeup|cosmetic|nail|henna|tattoo|spa|massage/i, 'spa'],
  [/laundry|dry clean/i, 'local-laundry-service'],
  [/clean|pest|waste/i, 'cleaning-services'],
  [/paint/i, 'format-paint'],
  [/mason|concrete|\bpop\b|plaster|tiling|roofing|glass|gate|iron bend|steel|aluminum|metalwork/i, 'construction'],
  [/landscap|garden/i, 'yard'],
  [/security|cctv/i, 'security'],
  [/locksmith/i, 'lock'],
  [/photograph/i, 'camera-alt'],
  [/videograph/i, 'videocam'],
  [/\bdj\b|music|sound & equipment|entertainment/i, 'music-note'],
  [/event/i, 'event'],
  // Professional/service roles the earlier version lumped under a generic
  // "work" briefcase — each gets its own recognizable symbol instead.
  [/doctor|medical|clinic|nurse|\bhealth\b|pharmac/i, 'local-hospital'],
  [/legal|lawyer|\blaw\b/i, 'gavel'],
  [/teach|tutor|education|\bschool\b/i, 'school'],
  [/merchant|\bshop\b|\bstore\b|retail/i, 'storefront'],
  [/phone|mobile/i, 'smartphone'],
  [/digital marketing|graphic design|virtual assistant/i, 'computer'],
  [/computer|\bit\b|web |app develop/i, 'computer'],
  [/\btv\b|electronics repair|satellite|dstv|smart home/i, 'tv'],
  [/solar/i, 'solar-power'],
  [/generator|\bac \b|ac repair|ac technician|hvac|home appliance|interior|\brepair(s|ing)?\b/i, 'home-repair-service'],
  [/farm|agricultur|poultry|livestock/i, 'agriculture'],
  [/cater|baking|confection|grill|suya|juice|beverage|butcher|meal prep|food/i, 'restaurant'],
  [/account|\btax\b|consult|translat/i, 'work'],
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
