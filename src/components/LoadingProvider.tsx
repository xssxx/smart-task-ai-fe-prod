"use client";

import { createContext, useContext, useState, useEffect, useCallback, useTransition, useRef } from "react";
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
  const prevPathRef = useRef(pathname);
  const prevSearchRef = useRef(searchParams?.toString());

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
    const currentSearch = searchParams?.toString();
    const hasRouteChanged = pathname !== prevPathRef.current || currentSearch !== prevSearchRef.current;
    
    if (hasRouteChanged && isLoading) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setIsLoading(false);
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
          setIsExiting(false);
        }, 300);
      });
    }
    
    prevPathRef.current = pathname;
    prevSearchRef.current = currentSearch;
  }, [pathname, searchParams, isLoading]);

  const shouldShowLoader = isLoading || isPending || isVisible;

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, isPending, startTransition }}>
      {shouldShowLoader && <PageLoader isExiting={isExiting && !isLoading && !isPending} />}
      {children}
    </LoadingContext.Provider>
  );
}
