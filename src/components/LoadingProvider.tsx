"use client";

import { createContext, useContext, useState, useEffect, useCallback, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  isPending: boolean;
  startTransition: (callback: () => void) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setIsVisible(true);
    setIsExiting(false);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setIsExiting(true);
    // Delay hiding to allow fade out animation
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
    }, 300);
  }, []);

  // Stop loading when route changes complete
  useEffect(() => {
    if (isLoading) {
      stopLoading();
    }
  }, [pathname, searchParams, isLoading, stopLoading]);

  const shouldShowLoader = isLoading || isPending || isVisible;

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, isPending, startTransition }}>
      {shouldShowLoader && <PageLoader isExiting={isExiting && !isLoading && !isPending} />}
      {children}
    </LoadingContext.Provider>
  );
}
