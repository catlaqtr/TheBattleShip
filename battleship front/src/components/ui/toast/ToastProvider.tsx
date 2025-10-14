import React, { useCallback, useMemo, useState } from 'react';
import { ToastContext, type Toast } from './ToastContext';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => {
    setToasts((xs) => xs.filter((t) => t.id !== id));
  }, []);
  const show = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const toast: Toast = { id, duration: 3000, tone: 'info', ...t };
      setToasts((xs) => [...xs, toast]);
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => dismiss(id), toast.duration);
      }
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toasts, show, dismiss }), [toasts, show, dismiss]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
