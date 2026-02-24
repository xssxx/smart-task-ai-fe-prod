export const locales = ['en', 'th'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  th: 'ภาษาไทย',
};

export const localeFlags: Record<Locale, string> = {
  en: 'EN',
  th: 'TH',
};
