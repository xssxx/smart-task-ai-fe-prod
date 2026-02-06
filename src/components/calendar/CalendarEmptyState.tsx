"use client";

import { memo } from "react";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarEmptyStateProps {
  onCreateTask?: () => void;
}

function CalendarEmptyState({ onCreateTask }: CalendarEmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ยังไม่มี Task
        </h3>

        <p className="text-gray-600 mb-6">
          เริ่มต้นสร้าง Task แรกของคุณเพื่อจัดการงานในปฏิทิน
          คุณสามารถคลิกที่ช่องว่างในปฏิทินเพื่อสร้าง Task ได้
        </p>

        {onCreateTask && (
          <Button onClick={onCreateTask} className="gap-2">
            <Plus className="w-4 h-4" />
            สร้าง Task
          </Button>
        )}
      </div>
    </div>
  );
}

export default memo(CalendarEmptyState);
