import { useTranslation } from 'react-i18next';

export type Locale = 'en' | 'zh' | 'mn';

export function useLocale(): Locale {
  const { i18n } = useTranslation();
  const l = (i18n.language || 'en').slice(0, 2).toLowerCase();
  return (['en', 'zh', 'mn'].includes(l) ? l : 'en') as Locale;
}

/**
 * Pick a localized value from a row that follows the `{field}_{locale}` pattern.
 * Priority: field_{locale} -> field_en -> field -> fallback
 */
export function pickLocale<T extends Record<string, any>>(
  row: T | null | undefined,
  field: string,
  locale: Locale,
  fallback = ''
): string {
  if (!row) return fallback;
  return (
    row[`${field}_${locale}`] ||
    row[`${field}_en`] ||
    row[field] ||
    fallback
  );
}

export function useLocaleField<T extends Record<string, any>>(
  row: T | null | undefined,
  field: string,
  fallback = ''
): string {
  const locale = useLocale();
  return pickLocale(row, field, locale, fallback);
}
