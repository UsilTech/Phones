import { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PRIVACY_NOTICE_STORAGE_KEY = 'gsmscope_privacy_notice_v1';

export default function PrivacyNotice() {
  const { setActiveTab, setSelectedPhone, setSelectedArticle, triggerNavigation } = useApp();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const savedStatus = localStorage.getItem(PRIVACY_NOTICE_STORAGE_KEY);
      if (!savedStatus) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDecision = (decision: 'accepted' | 'disagreed' | 'dismissed') => {
    try {
      localStorage.setItem(PRIVACY_NOTICE_STORAGE_KEY, decision);
    } catch {
      // Ignore storage errors in restricted environments
    }
    setIsVisible(false);
  };

  const handleLearnMore = () => {
    triggerNavigation(() => {
      setSelectedPhone(null);
      setSelectedArticle(null);
      setActiveTab('privacy');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Privacy notice"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 pointer-events-none"
    >
      <div className="pointer-events-auto relative max-w-4xl mx-auto rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-5 pr-10 sm:pr-11">
        {/* Top-right X button to cancel/dismiss */}
        <button
          type="button"
          onClick={() => handleDecision('dismissed')}
          aria-label="Cancel and close privacy notice"
          title="Close"
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-1 text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                GsmScope uses cookies to remember your preferences and improve site performance.{' '}
                <button
                  type="button"
                  onClick={handleLearnMore}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 underline underline-offset-2 cursor-pointer"
                >
                  Learn more
                </button>
                .
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 shrink-0 sm:pl-2">
            <button
              type="button"
              onClick={() => handleDecision('accepted')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-colors cursor-pointer"
            >
              Agree
            </button>
            <button
              type="button"
              onClick={() => handleDecision('disagreed')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Disagree
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
