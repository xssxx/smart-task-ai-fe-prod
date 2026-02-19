'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { locales, localeNames, localeFlags, Locale } from '@/i18n/config';
import { setLanguage } from '@/actions/language';
import { toast } from '@/lib/enhanced-toast';

interface LanguageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguageModal({ open, onOpenChange }: LanguageModalProps) {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedLocale, setSelectedLocale] = useState<Locale>(currentLocale);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Focus first button when modal opens
  useEffect(() => {
    if (open && firstButtonRef.current) {
      const timer = setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleLanguageChange = async (locale: Locale) => {
    setSelectedLocale(locale);
    
    startTransition(async () => {
      try {
        await setLanguage(locale);
        router.refresh();
        onOpenChange(false);
      } catch (error) {
        console.error('Failed to change language:', error);
        toast.error('Failed to change language. Please try again.');
      }
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, locale: Locale, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLanguageChange(locale);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const buttons = document.querySelectorAll('[data-language-button]');
      const nextIndex = e.key === 'ArrowDown' 
        ? (index + 1) % buttons.length 
        : (index - 1 + buttons.length) % buttons.length;
      (buttons[nextIndex] as HTMLButtonElement)?.focus();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Select Language / เลือกภาษา</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4" role="radiogroup" aria-label="Language selection">
          {locales.map((locale, index) => (
            <Button
              key={locale}
              ref={index === 0 ? firstButtonRef : null}
              variant={selectedLocale === locale ? 'default' : 'outline'}
              className="w-full justify-start text-left h-auto py-3 sm:py-4"
              onClick={() => handleLanguageChange(locale)}
              onKeyDown={(e) => handleKeyDown(e, locale, index)}
              disabled={isPending}
              data-language-button
              role="radio"
              aria-checked={selectedLocale === locale}
              aria-label={`${localeNames[locale]} ${localeFlags[locale]}`}
            >
              <span 
                className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 rounded-md bg-gray-100 text-gray-700 font-semibold text-xs sm:text-sm" 
                aria-hidden="true"
              >
                {localeFlags[locale]}
              </span>
              <span className="text-sm sm:text-base">{localeNames[locale]}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
