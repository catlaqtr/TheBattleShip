import { createContext, useContext } from "react";

export type Toast = {
  id: number;
  title?: string;
  description?: string;
  tone?: "info" | "success" | "warning" | "danger";
  duration?: number;
};

export type ToastContextType = {
  toasts: Toast[];
  show: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
};

export const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
