import { useState, useEffect, useCallback, useRef } from "react";
import { addMonths, addWeeks, addDays, startOfToday } from "date-fns";

export type ViewMode = "month" | "week" | "day";

const VIEW_MODE_STORAGE_KEY = "calendar-view-mode";
const DEFAULT_VIEW_MODE: ViewMode = "month";
const NAVIGATION_DEBOUNCE_MS = 150; // Debounce rapid navigation clicks

// Get default view mode based on screen size
const getDefaultViewMode = (): ViewMode => {
  if (typeof window === "undefined") return DEFAULT_VIEW_MODE;
  
  // On mobile (< 768px), default to day view for better usability
  if (window.innerWidth < 768) {
    return "day";
  }
  
  return DEFAULT_VIEW_MODE;
};

interface CalendarState {
  currentDate: Date;
  viewMode: ViewMode;
  loading: boolean;
  error: string | null;
}

interface CalendarStateActions {
  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: Date) => void;
  navigateNext: () => void;
  navigatePrev: () => void;
  navigateToday: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Custom hook for managing calendar state
 * Handles view mode, date navigation, and localStorage persistence
 * Includes debouncing for rapid navigation clicks
 */
export function useCalendarState(): CalendarState & CalendarStateActions {
  // Initialize view mode from localStorage or default based on screen size
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return DEFAULT_VIEW_MODE;
    
    try {
      const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (stored && ["month", "week", "day"].includes(stored)) {
        return stored as ViewMode;
      }
    } catch (error) {
      console.error("Failed to load view mode from localStorage:", error);
    }
    
    return getDefaultViewMode();
  });

  const [currentDate, setCurrentDate] = useState<Date>(startOfToday());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce timer for navigation
  const navigationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Persist view mode to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch (error) {
      console.error("Failed to save view mode to localStorage:", error);
    }
  }, [viewMode]);
  
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  /**
   * Set view mode and persist to localStorage
   * Preserves the current date when switching modes
   */
  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
  }, []);

  /**
   * Set current date directly
   * Useful for navigating to a specific date
   */
  const setCurrentDateCallback = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  /**
   * Navigate to the next time period based on current view mode
   * - Month view: advance by 1 month
   * - Week view: advance by 1 week
   * - Day view: advance by 1 day
   * Debounced to prevent rapid navigation clicks
   */
  const navigateNext = useCallback(() => {
    // Clear existing timer
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
    }
    
    // Set new timer
    navigationTimerRef.current = setTimeout(() => {
      setCurrentDate((prevDate) => {
        switch (viewMode) {
          case "month":
            return addMonths(prevDate, 1);
          case "week":
            return addWeeks(prevDate, 1);
          case "day":
            return addDays(prevDate, 1);
          default:
            return prevDate;
        }
      });
    }, NAVIGATION_DEBOUNCE_MS);
  }, [viewMode]);

  /**
   * Navigate to the previous time period based on current view mode
   * - Month view: go back by 1 month
   * - Week view: go back by 1 week
   * - Day view: go back by 1 day
   * Debounced to prevent rapid navigation clicks
   */
  const navigatePrev = useCallback(() => {
    // Clear existing timer
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
    }
    
    // Set new timer
    navigationTimerRef.current = setTimeout(() => {
      setCurrentDate((prevDate) => {
        switch (viewMode) {
          case "month":
            return addMonths(prevDate, -1);
          case "week":
            return addWeeks(prevDate, -1);
          case "day":
            return addDays(prevDate, -1);
          default:
            return prevDate;
        }
      });
    }, NAVIGATION_DEBOUNCE_MS);
  }, [viewMode]);

  /**
   * Navigate to today's date
   * Returns the view to the current date
   * No debouncing needed as this is typically a single action
   */
  const navigateToday = useCallback(() => {
    // Clear any pending navigation
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
    }
    setCurrentDate(startOfToday());
  }, []);

  return {
    currentDate,
    viewMode,
    loading,
    error,
    setViewMode,
    setCurrentDate: setCurrentDateCallback,
    navigateNext,
    navigatePrev,
    navigateToday,
    setLoading,
    setError,
  };
}
