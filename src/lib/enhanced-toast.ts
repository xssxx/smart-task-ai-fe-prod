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
    console.log('[Enhanced Toast] Success called:', { message, options });
    sonnerToast.success(message, options);
    if (globalNotificationHandler) {
      let fullMessage = message;
      if (options?.description) {
        const descText = typeof options.description === 'string'
          ? options.description
          : extractTextFromReactNode(options.description);
        fullMessage = `${message} - ${descText}`;
      }
      console.log('[Enhanced Toast] Calling notification handler:', { fullMessage, metadata: options?.metadata });
      globalNotificationHandler("success", fullMessage, options?.metadata);
    } else {
      console.warn('[Enhanced Toast] No global notification handler registered');
    }
  },
  error: (message: string, options?: any) => {
    console.log('[Enhanced Toast] Error called:', { message, options });
    sonnerToast.error(message, options);
    if (globalNotificationHandler) {
      let fullMessage = message;
      if (options?.description) {
        const descText = typeof options.description === 'string'
          ? options.description
          : extractTextFromReactNode(options.description);
        fullMessage = `${message} - ${descText}`;
      }
      console.log('[Enhanced Toast] Calling notification handler:', { fullMessage, metadata: options?.metadata });
      globalNotificationHandler("error", fullMessage, options?.metadata);
    } else {
      console.warn('[Enhanced Toast] No global notification handler registered');
    }
  },
  info: (message: string, options?: any) => {
    console.log('[Enhanced Toast] Info called:', { message, options });
    sonnerToast.info(message, options);
    if (globalNotificationHandler) {
      let fullMessage = message;
      if (options?.description) {
        const descText = typeof options.description === 'string'
          ? options.description
          : extractTextFromReactNode(options.description);
        fullMessage = `${message} - ${descText}`;
      }
      console.log('[Enhanced Toast] Calling notification handler:', { fullMessage, metadata: options?.metadata });
      globalNotificationHandler("info", fullMessage, options?.metadata);
    } else {
      console.warn('[Enhanced Toast] No global notification handler registered');
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
