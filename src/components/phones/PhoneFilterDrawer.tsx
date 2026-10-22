import { useApp } from '../../context/AppContext';
import { Search, RotateCcw, Check, Filter } from 'lucide-react';

interface PhoneFilterProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function PhoneFilterDrawer({ isMobileOpen, onCloseMobile }: PhoneFilterProps) {
  const { filterState, setFilterState, resetFilters, brands } = useApp();

  const handleBrandToggle = (brandName: string) => {
    setFilterState(prev => {
      const exists = prev.selectedBrands.includes(brandName);
      return {
        ...prev,
        selectedBrands: exists 
          ? prev.selectedBrands.filter(b => b !== brandName)
          : [...prev.selectedBrands, brandName]
      };
    });
  };

  const priceOptions = [
    { label: 'Any price', max: 3000000 },
    { label: 'Under 100,000', max: 100000 },
    { label: 'Under 200,000', max: 200000 },
    { label: 'Under 300,000', max: 300000 },
    { label: 'Under 500,000', max: 500000 },
    { label: 'Under 1,000,000', max: 1000000 },
    { label: 'Under 2,000,000', max: 2000000 },
  ];

  const content = (
    <div className="space-y-5 text-xs text-slate-300">
      {/* Header and Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white text-sm font-['Space_Grotesk']">Filters</span>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1.5">Search phones by name or brand</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) => setFilterState(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search phones..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none text-xs"
          />
        </div>
      </div>

      {/* Sort By matching GsmScope options */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1.5">Sort</label>
        <select
          value={filterState.sortBy}
          onChange={(e) => setFilterState(prev => ({ ...prev, sortBy: e.target.value as any }))}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs"
        >
          <option value="newest">Newest first</option>
          <option value="rating">Top rated</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="battery">Biggest battery</option>
          <option value="popular">Most popular</option>
        </select>
      </div>

      {/* 5G phones only toggle */}
      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="font-semibold text-white block">5G phones only</span>
          <span className="text-[11px] text-slate-400">Ready for Nigerian 5G</span>
        </div>
        <button
          onClick={() => setFilterState(prev => ({ ...prev, only5G: !prev.only5G }))}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
            filterState.only5G ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
        </button>
      </div>

      {/* Maximum Price Dropdown */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1.5">Maximum price (₦)</label>
        <select
          value={filterState.maxPrice}
          onChange={(e) => setFilterState(prev => ({ ...prev, maxPrice: Number(e.target.value), minPrice: 0, categoryPreset: undefined }))}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs font-mono"
        >
          {priceOptions.map(opt => (
            <option key={opt.max} value={opt.max}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Brand Select */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1.5">Brand</label>
        <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
          {brands.map((brand) => {
            const isChecked = filterState.selectedBrands.includes(brand.name);
            return (
              <button
                key={brand.id}
                onClick={() => handleBrandToggle(brand.name)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                  isChecked
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80'
                }`}
              >
                <span>{brand.name}</span>
                {isChecked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum RAM */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1.5">Minimum RAM</label>
        <select
          value={filterState.ram.length > 0 ? filterState.ram[0] : 'any'}
          onChange={(e) => {
            const val = e.target.value;
            let arr: string[] = [];
            if (val === '4GB') arr = ['4GB', '6GB', '8GB', '12GB', '16GB'];
            if (val === '6GB') arr = ['6GB', '8GB', '12GB', '16GB'];
            if (val === '8GB') arr = ['8GB', '12GB', '16GB'];
            if (val === '12GB') arr = ['12GB', '16GB'];
            setFilterState(prev => ({ ...prev, ram: arr }));
          }}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs"
        >
          <option value="any">Any RAM</option>
          <option value="4GB">4 GB or more</option>
          <option value="6GB">6 GB or more</option>
          <option value="8GB">8 GB or more</option>
          <option value="12GB">12 GB or more</option>
        </select>
      </div>

      {/* Minimum Camera */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1.5">Minimum camera</label>
        <select
          value={filterState.minCameraMP}
          onChange={(e) => setFilterState(prev => ({ ...prev, minCameraMP: Number(e.target.value) }))}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs"
        >
          <option value={0}>Any camera</option>
          <option value={13}>13 MP or more</option>
          <option value={50}>50 MP or more</option>
          <option value={64}>64 MP or more</option>
          <option value={108}>108 MP or more</option>
          <option value={200}>200 MP or more</option>
        </select>
      </div>

      {/* Minimum Battery */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1.5">Minimum battery</label>
        <select
          value={filterState.minBattery}
          onChange={(e) => setFilterState(prev => ({ ...prev, minBattery: Number(e.target.value) }))}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs"
        >
          <option value={0}>Any battery</option>
          <option value={4500}>4500 mAh or more</option>
          <option value={5000}>5000 mAh or more</option>
          <option value={5500}>5500 mAh or more</option>
        </select>
      </div>

      {/* Minimum Screen Size */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1.5">Minimum screen</label>
        <select
          value={filterState.minScreenSize || 0}
          onChange={(e) => setFilterState(prev => ({ ...prev, minScreenSize: Number(e.target.value) }))}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs"
        >
          <option value={0}>Any screen size</option>
          <option value={6.1}>6.1 inches or more</option>
          <option value={6.5}>6.5 inches or more</option>
          <option value={6.7}>6.7 inches or more</option>
        </select>
      </div>

      {/* Released From */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1.5">Released from</label>
        <select
          value={filterState.releaseYearFilter || 0}
          onChange={(e) => setFilterState(prev => ({ ...prev, releaseYearFilter: Number(e.target.value) }))}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs"
        >
          <option value={0}>Any year</option>
          <option value={2026}>2026</option>
          <option value={2025}>2025</option>
          <option value={2024}>2024 or newer</option>
          <option value={2023}>2023 or newer</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      <aside aria-label="Phone specification filters" className="hidden lg:block w-72 shrink-0 bg-[#061a11]/90 p-5 rounded-2xl border border-emerald-950/80 sticky top-20 self-start">
        {content}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-[#061a11] h-full p-6 overflow-y-auto border-l border-emerald-950 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-white text-base font-['Space_Grotesk']">Filters</span>
              <button 
                onClick={onCloseMobile}
                className="text-slate-400 hover:text-white px-2 py-1 bg-slate-900 rounded"
              >
                Close
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
