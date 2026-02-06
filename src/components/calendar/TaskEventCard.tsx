"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, MotionConfig, AnimatePresence } from "framer-motion";
import { getPriorityColor } from "@/constants";

interface Task {
  id: string;
  name: string;
  description?: string;
  priority: string;
  status: string;
  start_datetime?: string;
  end_datetime?: string;
  location?: string;
  color?: string;
}

interface Project {
  id: string;
  name: string;
  config?: {
    nickname?: string;
    context?: string;
    domain_knowledge?: string;
  };
}

interface TaskEventCardProps {
  task: Task;
  project?: Project;
  viewMode: "month" | "week" | "day";
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export default function TaskEventCard({
  task,
  viewMode,
  onClick,
  className,
}: TaskEventCardProps) {
  const isMonth = viewMode === "month";

  // Use priority color
  const colorClasses = getPriorityColor(task.priority);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          className={cn(
            "px-3 py-1.5 rounded-md truncate cursor-pointer transition-all duration-300 border",
            "hover:brightness-75",
            colorClasses,
            className
          )}
          onClick={onClick}
          initial={{
            opacity: 0,
            y: -3,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.98,
            transition: {
              duration: 0.15,
              ease: "easeOut",
            },
          }}
          transition={{
            duration: 0.2,
            ease: [0.25, 0.1, 0.25, 1],
            opacity: {
              duration: 0.2,
              ease: "linear",
            },
            layout: {
              duration: 0.2,
              ease: "easeOut",
            },
          }}
          layoutId={`task-${task.id}-${viewMode}`}
        >
          <motion.div
            className={cn(
              "flex flex-col w-full gap-0.5",
              isMonth && "text-xs"
            )}
            layout="position"
          >
            {/* Task name */}
            <div className="flex items-center justify-between w-full gap-2">
              <p className="font-semibold truncate flex-1">
                {task.name}
              </p>
              {isMonth && task.start_datetime && (
                <span className="text-xs whitespace-nowrap">
                  {format(new Date(task.start_datetime), "h:mm a")}
                </span>
              )}
            </div>

            {/* Time range row */}
            {!isMonth && task.start_datetime && task.end_datetime && (
              <div className="text-sm opacity-90">
                {format(new Date(task.start_datetime), "h:mm a")}-{format(new Date(task.end_datetime), "h:mm a")}
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
