"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications, type Notification } from "@/contexts/NotificationContext";
import { getRelativeTimeText } from "@/lib/time-utils";
import { cn } from "@/lib/utils";


const extractIds = (message: string) => {
  const taskIdMatch = message.match(/Task ID[:\s]+(\d+)/i);
  const projectIdMatch = message.match(/Project ID[:\s]+(\d+)/i);

  const ids = [];
  if (taskIdMatch) ids.push(`Task ID: ${taskIdMatch[1]}`);
  if (projectIdMatch) ids.push(`Project ID: ${projectIdMatch[1]}`);

  return ids.length > 0 ? ids.join(" • ") : null;
};

const extractName = (message: string) => {
  const taskNameMatch = message.match(/Task\s+(?:<strong>)?([^<]+?)(?:<\/strong>)?\s+(?:ถูก|ได้รับ|สำเร็จ)/i);
  if (taskNameMatch) return taskNameMatch[1].trim();

  const projectNameMatch = message.match(/Project\s+(?:<strong>)?([^<]+?)(?:<\/strong>)?\s+(?:ถูก|ได้รับ|สำเร็จ)/i);
  if (projectNameMatch) return projectNameMatch[1].trim();

  const quotedNameMatch = message.match(/['"]([^'"]+)['"]/);
  if (quotedNameMatch) return quotedNameMatch[1];

  return null;
};

const NotificationItem = ({
  notification,
}: {
  notification: Notification;
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const timeSuffixes = {
    second: t('time.second'),
    minute: t('time.minute'),
    hour: t('time.hour'),
    day: t('time.day'),
    month: t('time.month'),
    year: t('time.year'),
  };
  const [relativeTime, setRelativeTime] = useState(getRelativeTimeText(notification.timestamp, timeSuffixes));

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTimeText(notification.timestamp, timeSuffixes));
    }, 60000);

    return () => clearInterval(interval);
  }, [notification.timestamp, locale]);

  const actionMessage = notification.message.split(' - ')[0];
  const displayName = notification.metadata?.taskName
    || notification.metadata?.projectName
    || extractName(notification.message);

  const displayId = notification.metadata?.taskId
    ? `Task ID: ${notification.metadata.taskId}`
    : notification.metadata?.projectId
      ? `Project ID: ${notification.metadata.projectId}`
      : extractIds(notification.message);

  const getDotColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-lime-500";
      case "error":
        return "bg-rose-500";
      case "info":
        return "bg-sky-500";
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg transition-colors bg-background hover:bg-accent">
      <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", getDotColor())} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-sm text-muted-foreground font-medium truncate">
            {displayName || displayId || t('notification.notifications')}
          </p>
          <p className="text-xs text-muted-foreground shrink-0">{relativeTime}</p>
        </div>

        <p className="text-sm text-foreground wrap-break-word">
          {actionMessage}
        </p>
      </div>
    </div>
  );
};

export const NotificationDropdown = () => {
  const t = useTranslations();
  const { notifications, clearAllNotifications, unreadCount, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };


  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 sm:h-13 sm:w-13 hover:bg-transparent relative"
      >
        <Bell className="w-5.5! h-5.5! text-muted-foreground hover:text-foreground transition-colors" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 sm:h-13 sm:w-13 hover:bg-transparent relative"
        >
          <Bell className="w-5.5! h-5.5! text-muted-foreground hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "p-0 overflow-hidden bg-background",
          isMobile ? "w-[calc(95vw-10rem)] max-w-md mr-4" : "w-96"
        )}
      >
        <div className="flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2 bg-background sticky top-0 z-10 border-b border-border">
            <h4 className="font-semibold text-foreground">{t('notification.notifications')}</h4>
            {!isMobile && notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('notification.clearAll')}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div
            className={cn(
              "flex-1 overflow-y-auto",
              notifications.length > 2 ? "min-h-0" : ""
            )}
          >
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center">{t('notification.noNotifications')}</p>
              </div>
            ) : (
              <div className="px-3 pb-3 pt-1 space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mobile Footer */}
          {isMobile && notifications.length > 0 && (
            <div className="bg-background sticky bottom-0 z-10 p-3 border-t border-border">
              <button
                onClick={clearAllNotifications}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('notification.clearAll')}
              </button>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
