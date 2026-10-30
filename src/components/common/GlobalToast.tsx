import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function GlobalToast() {
  const { globalToast, hideGlobalToast } = useApp();

  if (!globalToast) return null;

  const isSuccess = globalToast.type === 'success';
  const isError = globalToast.type === 'error';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[999990] max-w-sm w-auto animate-slideIn flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-xs text-slate-800 dark:text-slate-100"
    >
      <div className="shrink-0">
        {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        {isError && <AlertTriangle className="w-4 h-4 text-rose-500" />}
        {!isSuccess && !isError && <Info className="w-4 h-4 text-teal-400" />}
      </div>

      <div className="flex-1 font-medium leading-relaxed pr-1">
        {globalToast.message}
      </div>

      <button
        type="button"
        onClick={hideGlobalToast}
        aria-label="Close notification"
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
