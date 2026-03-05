import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo } from "react";
import { toast } from "sonner";
import { Toaster } from "@/shared/ui/sonner";

type ToastPayload = {
  title: string;
  description?: string;
  duration?: number;
};

type ToastContextValue = {
  success: (payload: ToastPayload) => void;
  error: (payload: ToastPayload) => void;
  info: (payload: ToastPayload) => void;
  warning: (payload: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const value = useMemo<ToastContextValue>(
    () => ({
      success: ({ title, description, duration }) =>
        toast.success(title, { description, duration }),
      error: ({ title, description, duration }) =>
        toast.error(title, { description, duration }),
      info: ({ title, description, duration }) =>
        toast.info(title, { description, duration }),
      warning: ({ title, description, duration }) =>
        toast.warning(title, { description, duration }),
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        closeButton
        richColors
        toastOptions={{
          classNames: {
            toast:
              "[zoom:var(--app-scale)] border border-border/70 shadow-[0_8px_30px_rgba(12,17,29,0.12)]",
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAppToast must be used inside ToastProvider");
  }

  return context;
}
