export function getLocalizedCategoryName(
  category: { name?: string; name_ha?: string } | null | undefined,
  language: string
): string {
  if (!category) return '';
  if (language === 'ha' && category.name_ha) return category.name_ha;
  return category.name || '';
}
