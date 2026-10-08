import React, { useCallback, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ToastContext } from './toastContext';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (type, message, action) => {
      const id = ++seq.current;
      setToasts((list) => [...list.slice(-3), { id, type, message, action }]);
      setTimeout(() => dismiss(id), type === 'error' ? 6000 : action ? 6000 : 3500);
    },
    [dismiss]
  );

  // `action` = { label, onClick } adds a button such as "Undo".
  const api = useMemo(
    () => ({ success: (m, opts) => push('success', m, opts?.action), error: (m, opts) => push('error', m, opts?.action) }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[70] flex flex-col gap-2 sm:w-80" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-2.5 rounded-xl border border-theme bg-surface px-4 py-3 text-sm text-body shadow-lg animate-[fadeIn_.15s_ease-out]"
          >
            {t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
            )}
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <button
                type="button"
                className="font-semibold text-primaryGreen hover:underline"
                onClick={() => {
                  dismiss(t.id);
                  t.action.onClick();
                }}
              >
                {t.action.label}
              </button>
            )}
            <button type="button" onClick={() => dismiss(t.id)} className="text-muted hover:text-body" aria-label="Dismiss">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
