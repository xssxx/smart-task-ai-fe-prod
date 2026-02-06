"use client";

import { memo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarErrorStateProps {
  error: string;
  onRetry: () => void;
}

function CalendarErrorState({ error, onRetry }: CalendarErrorStateProps) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-rose-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ไม่สามารถโหลดข้อมูลได้
        </h3>

        <p className="text-gray-600 mb-6">
          {error || "เกิดข้อผิดพลาดในการโหลดข้อมูลปฏิทิน กรุณาลองใหม่อีกครั้ง"}
        </p>

        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          ลองใหม่
        </Button>
      </div>
    </div>
  );
}

export default memo(CalendarErrorState);
