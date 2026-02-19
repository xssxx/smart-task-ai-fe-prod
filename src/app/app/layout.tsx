import { Suspense } from "react";
import { Kanit, Momo_Signature } from "next/font/google";
import "../globals.css";
import { PageLoader } from "@/components/ui/page-loader";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, locales, Locale } from '@/i18n/config';
import { AppLayoutClient } from '@/components/AppLayoutClient';

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const momoSignature = Momo_Signature({
  variable: "--font-momo",
  subsets: ["latin"],
  weight: ["400"],
  adjustFontFallback: false,
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  
  const locale = locales.includes(localeCookie as Locale) 
    ? (localeCookie as Locale)
    : defaultLocale;

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${kanit.variable} ${momoSignature.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Suspense fallback={<PageLoader />}>
            <AppLayoutClient>
              {children}
            </AppLayoutClient>
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
