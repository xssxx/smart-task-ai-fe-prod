import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, locales, Locale } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;

  const locale = locales.includes(localeCookie as Locale)
    ? (localeCookie as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    onError(error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[i18n] Translation error:', error.message);
      }
    },
    getMessageFallback({ namespace, key }) {
      const path = [namespace, key].filter((part) => part != null).join('.');

      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing translation key: ${path}`);
      }

      if (locale !== 'en') {
        try {
          const fallbackMessages = require(`../../messages/en.json`);
          const keys = path.split('.');
          let value = fallbackMessages;

          for (const k of keys) {
            value = value?.[k];
          }

          if (value && typeof value === 'string') {
            return value;
          }
        } catch (e) {
          // Fallback failed, return key path
        }
      }

      return path;
    }
  };
});
