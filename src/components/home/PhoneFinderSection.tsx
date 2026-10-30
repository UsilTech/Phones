import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Smartphone, Loader2 } from 'lucide-react';

export default function PhoneFinderSection() {
  const { 
    brands, 
    setFilterState, 
    setActiveTab, 
    setSelectedPhone, 
    setSelectedArticle, 
    startGlobalLoading, 
    stopGlobalLoading 
  } = useApp();

  const [finderBrand, setFinderBrand] = useState('any');
  const [finderMaxPrice, setFinderMaxPrice] = useState('any');
  const [finderMinRam, setFinderMinRam] = useState('any');
  const [finderMemory, setFinderMemory] = useState('any');
  const [finderBattery, setFinderBattery] = useState('any');
  const [finder5G, setFinder5G] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleFinderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearching) return;

    setIsSearching(true);
    startGlobalLoading();

    setTimeout(() => {
      setFilterState(prev => {
        let maxP = 50000000;
        if (finderMaxPrice !== 'any') {
          maxP = Number(finderMaxPrice);
        }

        let ramArr: string[] = [];
        if (finderMinRam === '4') ramArr = ['4GB', '6GB', '8GB', '12GB', '16GB'];
        if (finderMinRam === '6') ramArr = ['6GB', '8GB', '12GB', '16GB'];
        if (finderMinRam === '8') ramArr = ['8GB', '12GB', '12 GB', '16GB'];
        if (finderMinRam === '12') ramArr = ['12GB', '16GB'];

        let storageArr: string[] = [];
        if (finderMemory === '64') storageArr = ['64GB', '128GB', '256GB', '512GB', '1TB'];
        if (finderMemory === '128') storageArr = ['128GB', '256GB', '512GB', '1TB'];
        if (finderMemory === '256') storageArr = ['256GB', '512GB', '1TB'];
        if (finderMemory === '512') storageArr = ['512GB', '1TB'];
        if (finderMemory === '1024') storageArr = ['1TB'];

        const minBat = finderBattery === 'any' ? 0 : Number(finderBattery);

        return {
          ...prev,
          searchQuery: '',
          selectedBrands: finderBrand === 'any' ? [] : [finderBrand],
          minPrice: 0,
          maxPrice: maxP,
          ram: ramArr,
          storage: storageArr,
          minBattery: minBat,
          minCameraMP: 0,
          only5G: finder5G,
          categoryPreset: undefined
        };
      });

      setSelectedPhone(null);
      setSelectedArticle(null);
      stopGlobalLoading();
      setIsSearching(false);
      setActiveTab('phones');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 350);
  };

  return (
    <section className="rounded-2xl bg-white dark:bg-gradient-to-br dark:from-[#061a11] dark:via-slate-900 dark:to-[#0a2a1a] border border-slate-200 dark:border-emerald-950 p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left copy */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="site-badge text-[9px] font-mono uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-px rounded">
              Phone Finder
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
            Not sure what to buy?
          </h2>
          <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Over 20+ models tracked with full specifications</span>
          </div>
        </div>

        {/* Right Form */}
        <form onSubmit={handleFinderSubmit} className="lg:col-span-7 bg-slate-50 dark:bg-[#061a11]/90 border border-slate-200 dark:border-emerald-950/80 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {/* Brand select */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Brand</label>
              <select
                value={finderBrand}
                onChange={(e) => setFinderBrand(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="any">Any brand</option>
                {brands.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Max price */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Maximum price</label>
              <select
                value={finderMaxPrice}
                onChange={(e) => setFinderMaxPrice(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="any">Any price</option>
                <option value="100000">Under 100,000</option>
                <option value="200000">Under 200,000</option>
                <option value="300000">Under 300,000</option>
                <option value="500000">Under 500,000</option>
                <option value="1000000">Under 1,000,000</option>
                <option value="2000000">Under 2,000,000</option>
              </select>
            </div>

            {/* Min RAM */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Minimum RAM</label>
              <select
                value={finderMinRam}
                onChange={(e) => setFinderMinRam(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="any">Any RAM</option>
                <option value="4">4 GB or more</option>
                <option value="6">6 GB or more</option>
                <option value="8">8 GB or more</option>
                <option value="12">12 GB or more</option>
              </select>
            </div>

            {/* Memory (Storage) */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Memory</label>
              <select
                value={finderMemory}
                onChange={(e) => setFinderMemory(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="any">Any memory</option>
                <option value="64">64 GB or more</option>
                <option value="128">128 GB or more</option>
                <option value="256">256 GB or more</option>
                <option value="512">512 GB or more</option>
                <option value="1024">1 TB</option>
              </select>
            </div>

            {/* Battery */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Battery</label>
              <select
                value={finderBattery}
                onChange={(e) => setFinderBattery(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="any">Any battery</option>
                <option value="4000">4000 mAh or more</option>
                <option value="4500">4500 mAh or more</option>
                <option value="5000">5000 mAh or more</option>
                <option value="5500">5500 mAh or more</option>
                <option value="6000">6000 mAh or more</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-emerald-950/60">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={finder5G}
                onChange={(e) => setFinder5G(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:ring-emerald-400 cursor-pointer"
              />
              <span>5G phones only</span>
            </label>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-normal flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching phones...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Show matching phones</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
