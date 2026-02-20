'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

interface ThemeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemeModal({ open, onOpenChange }: ThemeModalProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const t = useTranslations('themeModal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <Button
            variant={currentTheme === 'light' ? 'default' : 'outline'}
            className="w-full justify-start text-left h-auto py-4"
            onClick={() => handleThemeChange('light')}
          >
            <Sun className="w-5 h-5 mr-3" />
            <span className="text-base">{t('light')}</span>
          </Button>
          <Button
            variant={currentTheme === 'dark' ? 'default' : 'outline'}
            className="w-full justify-start text-left h-auto py-4"
            onClick={() => handleThemeChange('dark')}
          >
            <Moon className="w-5 h-5 mr-3" />
            <span className="text-base">{t('dark')}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
