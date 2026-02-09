"use client";

import { memo, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CalendarSkeletonProps {
  viewMode: "month" | "week" | "day";
}

function CalendarSkeleton({ viewMode }: CalendarSkeletonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (viewMode === "month") {
    return (
      <div key="month-skeleton" className="h-full p-4">
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === "week") {
    return (
      <div key="week-skeleton" className="h-full p-4">
        <div className="flex gap-0">
          {/* Time margin skeleton */}
          <div className="w-12 space-y-1">
            <Skeleton className="h-8 w-full mb-2" />
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>

          {/* Week days skeleton */}
          <div className="flex-1 grid grid-cols-7 gap-0">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col border-l">
                <Skeleton className="h-8 w-full mb-2" />
                <div className="space-y-1">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Day view
  return (
    <div key="day-skeleton" className="h-full p-4">
      <div className="flex gap-0">
        {/* Time margin skeleton */}
        <div className="w-12 space-y-1">
          <Skeleton className="h-8 w-full mb-2" />
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>

        {/* Day content skeleton */}
        <div className="flex-1 border-l">
          <Skeleton className="h-8 w-full mb-2" />
          <div className="space-y-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CalendarSkeleton);
