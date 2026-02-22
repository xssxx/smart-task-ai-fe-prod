import { toast as sonnerToast } from "sonner";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCallback } from "react";

export const useToastWithNotification = () => {
  const { addNotification } = useNotifications();

  const success = useCallback((message: string, options?: any) => {
    sonnerToast.success(message, options);
    addNotification("success", message);
  }, [addNotification]);

  const error = useCallback((message: string, options?: any) => {
    sonnerToast.error(message, options);
    addNotification("error", message);
  }, [addNotification]);

  const info = useCallback((message: string, options?: any) => {
    sonnerToast.info(message, options);
    addNotification("info", message);
  }, [addNotification]);

  return {
    success,
    error,
    info,
  };
};

export const createEnhancedToast = (addNotification: (type: any, message: string) => void) => ({
  success: (message: string, options?: any) => {
    sonnerToast.success(message, options);
    addNotification("success", message);
  },
  error: (message: string, options?: any) => {
    sonnerToast.error(message, options);
    addNotification("error", message);
  },
  info: (message: string, options?: any) => {
    sonnerToast.info(message, options);
    addNotification("info", message);
  },
  warning: sonnerToast.warning,
  loading: sonnerToast.loading,
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
  message: sonnerToast.message,
  dismiss: sonnerToast.dismiss,
});
