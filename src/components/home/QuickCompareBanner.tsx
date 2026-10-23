import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown } from 'lucide-react';

export default function QuickCompareBanner() {
  const { phones, addToCompare, clearCompare, setActiveTab } = useApp();

  // Pick iPhone and Samsung Galaxy as initial defaults if available
  const defaultPhone1 = phones.find(p => p.brand.toLowerCase() === 'apple')?.id || phones[0]?.id || '';
  const defaultPhone2 = phones.find(p => p.brand.toLowerCase() === 'samsung')?.id || phones[1]?.id || '';

  const [phone1, setPhone1] = useState(defaultPhone1);
  const [phone2, setPhone2] = useState(defaultPhone2);

  const phone1Obj = phones.find(p => p.id === phone1) || phones[0];
  const phone2Obj = phones.find(p => p.id === phone2) || phones[1];

  const handleCompareNow = (e: React.FormEvent) => {
    e.preventDefault();
    clearCompare();
    if (phone1) addToCompare(phone1);
    if (phone2) addToCompare(phone2);
    setActiveTab('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="rounded-3xl bg-gradient-to-b from-[#051c11] via-[#03150d] to-[#010c07] border border-emerald-950/80 p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <form onSubmit={handleCompareNow} className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        {/* Top Badge matching attachment */}
        <div className="self-start">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#00a854] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
            Compare smartphones
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="w-full text-left mt-4 mb-6 sm:mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            Which phone is right for you?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Put phones side by side and see which one wins on price, camera, battery and speed.
          </p>
        </div>

        {/* Side-by-side Phone Cards with VS in between */}
        <div className="w-full flex items-center justify-between gap-3 sm:gap-6">
          {/* Card 1 */}
          <div className="flex-1 rounded-2xl border border-dashed border-emerald-600/50 bg-[#061a11]/40 p-4 sm:p-5 flex flex-col items-center justify-between min-h-[210px] sm:min-h-[240px] transition-all hover:border-emerald-500">
            {/* Phone 1 Image */}
            <div className="w-full h-28 sm:h-36 flex items-center justify-center my-auto">
              {phone1Obj?.image ? (
                <img
                  src={phone1Obj.image}
                  alt={phone1Obj.name}
                  referrerPolicy="no-referrer"
                  className="max-h-24 sm:max-h-32 w-auto object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="text-slate-500 text-xs font-mono">No Image</div>
              )}
            </div>

            {/* Dropdown 1 */}
            <div className="w-full relative mt-3">
              <select
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                className="w-full appearance-none bg-white text-slate-900 font-medium text-xs sm:text-sm py-2 sm:py-2.5 pl-3 pr-8 rounded-xl shadow-md border-0 focus:ring-2 focus:ring-[#00a854] cursor-pointer truncate"
              >
                {phones.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand} {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Center VS Badge */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#00a854] text-white font-extrabold text-xs sm:text-base flex items-center justify-center shadow-lg ring-4 ring-emerald-950/80">
              VS
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex-1 rounded-2xl border border-dashed border-emerald-600/50 bg-[#061a11]/40 p-4 sm:p-5 flex flex-col items-center justify-between min-h-[210px] sm:min-h-[240px] transition-all hover:border-emerald-500">
            {/* Phone 2 Image */}
            <div className="w-full h-28 sm:h-36 flex items-center justify-center my-auto">
              {phone2Obj?.image ? (
                <img
                  src={phone2Obj.image}
                  alt={phone2Obj.name}
                  referrerPolicy="no-referrer"
                  className="max-h-24 sm:max-h-32 w-auto object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="text-slate-500 text-xs font-mono">No Image</div>
              )}
            </div>

            {/* Dropdown 2 */}
            <div className="w-full relative mt-3">
              <select
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                className="w-full appearance-none bg-white text-slate-900 font-medium text-xs sm:text-sm py-2 sm:py-2.5 pl-3 pr-8 rounded-xl shadow-md border-0 focus:ring-2 focus:ring-[#00a854] cursor-pointer truncate"
              >
                {phones.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand} {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Center Bottom Compare now Button */}
        <div className="w-full flex justify-center mt-6 sm:mt-8">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-3.5 bg-[#00a854] hover:bg-[#009247] active:scale-95 text-white font-bold rounded-2xl text-sm sm:text-base shadow-xl transition-all cursor-pointer text-center"
          >
            Compare now
          </button>
        </div>
      </form>
    </section>
  );
}
