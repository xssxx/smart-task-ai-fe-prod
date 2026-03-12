"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface PageLoaderProps {
  message?: string;
  isExiting?: boolean;
}

export function PageLoader({ message, isExiting = false }: PageLoaderProps) {
  const t = useTranslations();
  const displayMessage = message || t('common.loading');

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm ${isExiting ? 'loading-fade-out' : 'loading-fade-in'
      }`}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">{displayMessage}</p>
      </div>
    </div>
  );
}

export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8 animate-in fade-in-0 duration-300">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
