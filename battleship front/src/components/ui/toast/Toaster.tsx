import { useToast } from './ToastContext';

function toneClasses(tone?: 'info' | 'success' | 'warning' | 'danger') {
  switch (tone) {
    case 'success':
      return 'bg-emerald-600 text-white border-emerald-700';
    case 'warning':
      return 'bg-amber-500 text-black border-amber-600';
    case 'danger':
      return 'bg-rose-600 text-white border-rose-700';
    default:
      return 'bg-slate-800 text-white border-slate-700';
  }
}

function ToneIcon({ tone }: { tone?: 'info' | 'success' | 'warning' | 'danger' }) {
  const common = 'w-6 h-6 shrink-0 mt-0.5';
  if (tone === 'success')
    return (
      <svg className={`${common}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  if (tone === 'warning')
    return (
      <svg className={`${common}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.59c.75 1.334-.213 2.99-1.742 2.99H3.48c-1.53 0-2.492-1.656-1.742-2.99L8.257 3.1z" />
        <path
          d="M11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-2a1 1 0 01-1-1V7a1 1 0 112 0v4a1 1 0 01-1 1z"
          fill="#000"
          opacity=".6"
        />
      </svg>
    );
  if (tone === 'danger')
    return (
      <svg className={`${common}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 102 0 1 1 0 00-2 0zm1-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    );
  return (
    <svg className={`${common}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-8-3a1 1 0 100-2 1 1 0 000 2zm-1 2a1 1 0 012 0v5a1 1 0 01-2 0v-5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute bottom-4 right-4 space-y-4 w-[94vw] max-w-xl md:w-[32rem]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${toneClasses(
              t.tone
            )} relative border-2 shadow-2xl rounded-2xl p-6 pr-5 pointer-events-auto animate-[fadeIn_150ms_ease-out]`}
            role="status"
          >
            <div className="flex items-start gap-5">
              <ToneIcon tone={t.tone} />
              <div className="flex-1 min-w-0">
                {t.title && (
                  <div className="font-semibold leading-tight truncate text-lg">{t.title}</div>
                )}
                {t.description && (
                  <div className="text-base opacity-90 break-words">{t.description}</div>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="ml-2 text-white/80 hover:text-white"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
            {typeof t.duration === 'number' && t.duration > 0 && (
              <div className="absolute left-0 right-0 bottom-0 h-1/2">
                <div
                  className="h-1 bg-white/70 toast-progress"
                  style={{ animationDuration: `${t.duration}ms` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
