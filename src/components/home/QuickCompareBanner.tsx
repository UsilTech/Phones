import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Scale, ArrowRight, Smartphone } from 'lucide-react';

export default function QuickCompareBanner() {
  const { phones, addToCompare, clearCompare, setActiveTab } = useApp();
  const [phone1, setPhone1] = useState(phones[0]?.id || 'oneplus-12r');
  const [phone2, setPhone2] = useState(phones[1]?.id || 'google-pixel-8-pro');

  const handleCompareNow = (e: React.FormEvent) => {
    e.preventDefault();
    clearCompare();
    addToCompare(phone1);
    addToCompare(phone2);
    setActiveTab('compare');
  };

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Copy */}
        <div className="space-y-1.5 max-w-lg">
          <span className="text-[11px] font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400">
            Compare Smartphones
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Which phone is right for you?
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Put phones side by side and see which one wins on camera sensors, display clarity, battery endurance and chipset speed.
          </p>
        </div>

        {/* Form Selector */}
        <form onSubmit={handleCompareNow} className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-56">
            <select
              value={phone1}
              onChange={(e) => setPhone1(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {phones.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 px-1">VS</span>

          <div className="w-full sm:w-56">
            <select
              value={phone2}
              onChange={(e) => setPhone2(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {phones.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 shadow-lg"
          >
            <Scale className="w-4 h-4" />
            <span>Compare now</span>
          </button>
        </form>
      </div>
    </section>
  );
}
