import { toast as sonnerToast } from "sonner";

// Global notification handler
let globalNotificationHandler: ((type: "success" | "error" | "info", message: string, metadata?: any) => void) | null = null;

export const setGlobalNotificationHandler = (
  handler: (type: "success" | "error" | "info", message: string, metadata?: any) => void
) => {
  globalNotificationHandler = handler;
};

export const toast = {
  success: (message: string, options?: any) => {
    sonnerToast.success(message, options);
    if (globalNotificationHandler) {
      let fullMessage = message;
      if (options?.description) {
        const descText = typeof options.description === 'string'
          ? options.description
          : extractTextFromReactNode(options.description);
        fullMessage = `${message} - ${descText}`;
      }
      globalNotificationHandler("success", fullMessage, options?.metadata);
    }
  },
  error: (message: string, options?: any) => {
    sonnerToast.error(message, options);
    if (globalNotificationHandler) {
      let fullMessage = message;
      if (options?.description) {
        const descText = typeof options.description === 'string'
          ? options.description
          : extractTextFromReactNode(options.description);
        fullMessage = `${message} - ${descText}`;
      }
      globalNotificationHandler("error", fullMessage, options?.metadata);
    }
  },
  info: (message: string, options?: any) => {
    sonnerToast.info(message, options);
    if (globalNotificationHandler) {
      let fullMessage = message;
      if (options?.description) {
        const descText = typeof options.description === 'string'
          ? options.description
          : extractTextFromReactNode(options.description);
        fullMessage = `${message} - ${descText}`;
      }
      globalNotificationHandler("info", fullMessage, options?.metadata);
    }
  },
  warning: sonnerToast.warning,
  loading: sonnerToast.loading,
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
  message: sonnerToast.message,
  dismiss: sonnerToast.dismiss,
};

function extractTextFromReactNode(node: any): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';

  if (node.props) {
    if (node.props.children) {
      if (Array.isArray(node.props.children)) {
        return node.props.children.map(extractTextFromReactNode).join('');
      }
      return extractTextFromReactNode(node.props.children);
    }
  }

  if (Array.isArray(node)) {
    return node.map(extractTextFromReactNode).join('');
  }

  return '';
}
