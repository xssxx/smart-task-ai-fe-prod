import { memo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Grid3x3, Columns2, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/hooks/useCalendarState";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  taskCount: number;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigate: (direction: "prev" | "next" | "today") => void;
  onAddEvent: () => void;
}

function CalendarHeader({
  currentDate,
  viewMode,
  taskCount,
  onViewModeChange,
  onNavigate,
  onAddEvent,
}: CalendarHeaderProps) {
  const today = new Date();

  return (
    <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-4">
      {/* Calendar date icon and info */}
      <div className="flex items-center gap-2">
        <div className="flex size-14 flex-col items-start overflow-hidden rounded-lg border">
          <p className="flex h-6 w-full items-center justify-center bg-primary text-center text-xs font-semibold text-background uppercase">
            {format(today, "MMM")}
          </p>
          <p className="flex w-full items-center justify-center text-lg font-bold">
            {format(today, "dd")}
          </p>
        </div>

        <div>
          {/* Month/Year and Events count */}
          <div className="flex items-center gap-1">
            <p className="text-lg font-semibold">
              {format(currentDate, "MMMM yyyy")}
            </p>
            <div className="whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-xs">
              {taskCount} tasks
            </div>
          </div>

          {/* Today's date with navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onNavigate("prev")}
              aria-label="Previous"
              className="h-7 w-7 p-1"
            >
              <ChevronLeft className="min-w-5 min-h-5" />
            </Button>

            <span className="min-w-[140px] text-center font-medium">
              {format(today, "MMMM d, yyyy")}
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onNavigate("next")}
              aria-label="Next"
              className="h-7 w-7 p-1"
            >
              <ChevronRight className="min-w-5 min-h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* View mode toggle and New Task button */}
      <div className="flex md:justify-start justify-between items-center gap-2">
        <div className="flex items-center justify-center gap-0 -space-x-px rounded-sm border overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => onViewModeChange("day")}
            className={cn(
              "font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
              "h-9 px-2 min-w-9 rounded-none shadow-none focus-visible:z-10",
              "flex items-center justify-center gap-2 relative border-none",
              viewMode === "day" && "bg-accent text-accent-foreground z-10"
            )}
          >
            <div className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 transition-all duration-300",
              viewMode !== "day" && "scale-95"
            )}>
              <List className={cn("w-4 h-4 transition-transform duration-300", viewMode === "day" && "scale-110")} />
              {viewMode === "day" && (
                <p className="font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                  Day
                </p>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("week")}
            className={cn(
              "font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
              "h-9 px-2 min-w-9 rounded-none shadow-none focus-visible:z-10",
              "flex items-center justify-center gap-2 relative border-none",
              viewMode === "week" && "bg-accent text-accent-foreground z-10"
            )}
          >
            <div className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 transition-all duration-300",
              viewMode !== "week" && "scale-95"
            )}>
              <Columns2 className={cn("w-4 h-4 transition-transform duration-300", viewMode === "week" && "scale-110")} />
              {viewMode === "week" && (
                <p className="font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                  Week
                </p>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("month")}
            className={cn(
              "font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
              "h-9 px-2 min-w-9 rounded-none shadow-none focus-visible:z-10",
              "flex items-center justify-center gap-2 relative border-none",
              viewMode === "month" && "bg-accent text-accent-foreground z-10"
            )}
          >
            <div className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 transition-all duration-300",
              viewMode !== "month" && "scale-95"
            )}>
              <Grid3x3 className={cn("w-4 h-4 transition-transform duration-300", viewMode === "month" && "scale-110")} />
              {viewMode === "month" && (
                <p className="font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                  Month
                </p>
              )}
            </div>
          </button>
        </div>

        {/* New Task button */}
        <Button
          onClick={onAddEvent}
          className="flex items-center gap-1 bg-primary text-background shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>
    </div>
  );
}

export default memo(CalendarHeader);
