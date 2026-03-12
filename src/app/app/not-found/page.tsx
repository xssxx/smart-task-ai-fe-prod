"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8 bg-background">
      <div className="text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-full flex items-center justify-center">
              <FileQuestion className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
            </div>
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl md:text-8xl font-bold text-muted-foreground/40 mb-2">
          404
        </h1>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
          {t('notFound.title')}
        </h2>

        {/* Description */}
        <p className="text-muted-foreground mb-8 text-sm md:text-base leading-relaxed">
          {t('notFound.description')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-2 px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('notFound.goBack')}
          </Button>
          <Button
            onClick={() => router.push("/app/home")}
            className="flex items-center gap-2 px-6"
          >
            <Home className="w-4 h-4" />
            {t('notFound.goHome')}
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-muted/50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-muted/30 rounded-full blur-3xl opacity-30" />
      </div>
    </div>
  );
}
