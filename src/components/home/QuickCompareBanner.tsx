import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown, Loader2 } from 'lucide-react';

export default function QuickCompareBanner() {
  const { phones, addToCompare, clearCompare, setActiveTab, startGlobalLoading, stopGlobalLoading, websiteContent } = useApp();

  // Pick Admin-configured default compare pair or fallback to Apple and Samsung Galaxy
  const defaultPhone1 =
    (websiteContent?.comparePhone1Id && phones.some((p) => p.id === websiteContent.comparePhone1Id)
      ? websiteContent.comparePhone1Id
      : phones.find(p => p.brand.toLowerCase() === 'apple')?.id) || phones[0]?.id || '';
  const defaultPhone2 =
    (websiteContent?.comparePhone2Id && phones.some((p) => p.id === websiteContent.comparePhone2Id)
      ? websiteContent.comparePhone2Id
      : phones.find(p => p.brand.toLowerCase() === 'samsung')?.id) || phones[1]?.id || '';

  const [phone1, setPhone1] = useState(defaultPhone1);
  const [phone2, setPhone2] = useState(defaultPhone2);
  const [isComparing, setIsComparing] = useState(false);

  React.useEffect(() => {
    if (websiteContent?.comparePhone1Id && phones.some((p) => p.id === websiteContent.comparePhone1Id)) {
      setPhone1(websiteContent.comparePhone1Id);
    }
    if (websiteContent?.comparePhone2Id && phones.some((p) => p.id === websiteContent.comparePhone2Id)) {
      setPhone2(websiteContent.comparePhone2Id);
    }
  }, [websiteContent?.comparePhone1Id, websiteContent?.comparePhone2Id, phones]);

  const phone1Obj = phones.find(p => p.id === phone1) || phones[0];
  const phone2Obj = phones.find(p => p.id === phone2) || phones[1];

  const handleCompareNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (isComparing) return;
    setIsComparing(true);
    startGlobalLoading();
    setTimeout(() => {
      clearCompare();
      if (phone1) addToCompare(phone1);
      if (phone2) addToCompare(phone2);
      setActiveTab('compare');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      stopGlobalLoading();
      setIsComparing(false);
    }, 350);
  };

  return (
    <section className="rounded-3xl bg-gradient-to-b from-[#051c11] via-[#03150d] to-[#010c07] border border-emerald-950/80 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <form onSubmit={handleCompareNow} className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        {/* Top Badge */}
        <div className="self-start">
          <span className="compare-smartphones-badge inline-block rounded-full bg-[#00a854] text-white font-bold tracking-wide shadow-sm">
            Compare smartphones
          </span>
        </div>

        {/* Heading & Subtitle - compact height */}
        <div className="w-full text-left mt-2.5 mb-4 space-y-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            {websiteContent?.compareHeadline?.trim() || 'Which phone is right for you?'}
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            {websiteContent?.compareSubtitle?.trim() || 'Put phones side by side and see which one wins on price, camera, battery and speed.'}
          </p>
        </div>

        {/* Side-by-side Phone Cards with VS in between */}
        <div className="w-full flex items-center justify-between gap-3 sm:gap-6">
          {/* Card 1 */}
          <div className="flex-1 rounded-2xl border border-dashed border-emerald-600/50 bg-[#061a11]/40 overflow-hidden flex flex-col items-center transition-all hover:border-emerald-500 shadow-sm">
            {/* Phone 1 Image fills top radius frame */}
            <div className="w-full h-24 sm:h-28 rounded-t-2xl overflow-hidden bg-slate-950/80 flex items-center justify-center p-0">
              {phone1Obj?.image ? (
                <img
                  src={phone1Obj.image}
                  alt={phone1Obj.name}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="text-slate-500 text-xs font-mono">No Image</div>
              )}
            </div>

            {/* Selected phone 1 name */}
            <div className="w-full text-center px-2 pt-2">
              <span className="text-xs sm:text-sm font-bold text-white truncate block">
                {phone1Obj?.brand} {phone1Obj?.name}
              </span>
            </div>

            {/* Dropdown 1 */}
            <div className="w-full relative p-2.5 pt-1.5">
              <select
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                className="w-full appearance-none bg-white text-slate-900 font-medium text-xs sm:text-sm py-1.5 sm:py-2 pl-2.5 pr-7 rounded-xl shadow-md border-0 focus:ring-2 focus:ring-[#00a854] cursor-pointer truncate"
              >
                {phones.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand} {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Center VS Badge */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#00a854] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-lg ring-4 ring-emerald-950/80">
              VS
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex-1 rounded-2xl border border-dashed border-emerald-600/50 bg-[#061a11]/40 overflow-hidden flex flex-col items-center transition-all hover:border-emerald-500 shadow-sm">
            {/* Phone 2 Image fills top radius frame */}
            <div className="w-full h-24 sm:h-28 rounded-t-2xl overflow-hidden bg-slate-950/80 flex items-center justify-center p-0">
              {phone2Obj?.image ? (
                <img
                  src={phone2Obj.image}
                  alt={phone2Obj.name}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="text-slate-500 text-xs font-mono">No Image</div>
              )}
            </div>

            {/* Selected phone 2 name */}
            <div className="w-full text-center px-2 pt-2">
              <span className="text-xs sm:text-sm font-bold text-white truncate block">
                {phone2Obj?.brand} {phone2Obj?.name}
              </span>
            </div>

            {/* Dropdown 2 */}
            <div className="w-full relative p-2.5 pt-1.5">
              <select
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                className="w-full appearance-none bg-white text-slate-900 font-medium text-xs sm:text-sm py-1.5 sm:py-2 pl-2.5 pr-7 rounded-xl shadow-md border-0 focus:ring-2 focus:ring-[#00a854] cursor-pointer truncate"
              >
                {phones.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand} {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Center Bottom Compare now Button */}
        <div className="w-full flex justify-center mt-4 sm:mt-5">
          <button
            type="submit"
            disabled={isComparing}
            className="w-full sm:w-auto px-8 sm:px-10 py-2.5 sm:py-3 bg-[#00a854] hover:bg-[#009247] disabled:opacity-70 active:scale-95 text-white font-normal rounded-xl text-sm shadow-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2"
          >
            {isComparing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Comparing...</span>
              </>
            ) : (
              <span>Compare now</span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
