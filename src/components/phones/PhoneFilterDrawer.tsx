import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, RotateCcw, Check, Filter, ArrowUpDown, ChevronDown, Battery, Loader2, X, Cpu, Tag, SlidersHorizontal } from 'lucide-react';

interface PhoneFilterProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  resultCount?: number;
}

export default function PhoneFilterDrawer({ isMobileOpen, onCloseMobile, resultCount }: PhoneFilterProps) {
  const { filterState, setFilterState, resetFilters, brands, startGlobalLoading, stopGlobalLoading } = useApp();
  const [isSearching, setIsSearching] = useState(false);

  // Close mobile drawer on Escape key for keyboard accessibility
  useEffect(() => {
    if (!isMobileOpen || !onCloseMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const handleDrawerSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearching) return;
    setIsSearching(true);
    startGlobalLoading();
    setTimeout(() => {
      stopGlobalLoading();
      setIsSearching(false);
    }, 350);
  };

  const handleBrandToggle = (brandName: string) => {
    startGlobalLoading();
    setFilterState(prev => {
      const exists = prev.selectedBrands.includes(brandName);
      return {
        ...prev,
        selectedBrands: exists 
          ? prev.selectedBrands.filter(b => b !== brandName)
          : [...prev.selectedBrands, brandName]
      };
    });
    setTimeout(stopGlobalLoading, 250);
  };

  const handleReset = () => {
    startGlobalLoading();
    resetFilters();
    setTimeout(stopGlobalLoading, 250);
  };

  const activeFilterCount =
    (filterState.searchQuery.trim() ? 1 : 0) +
    (filterState.only5G ? 1 : 0) +
    (filterState.maxPrice < 3000000 ? 1 : 0) +
    filterState.selectedBrands.length +
    (filterState.ram.length > 0 ? 1 : 0) +
    (filterState.minCameraMP > 0 ? 1 : 0) +
    (filterState.minBattery > 0 ? 1 : 0) +
    (filterState.minScreenSize && filterState.minScreenSize > 0 ? 1 : 0) +
    (filterState.releaseYearFilter && filterState.releaseYearFilter > 0 ? 1 : 0);

  const priceOptions = [
    { label: 'Any price', max: 3000000 },
    { label: 'Under 100,000', max: 100000 },
    { label: 'Under 200,000', max: 200000 },
    { label: 'Under 300,000', max: 300000 },
    { label: 'Under 500,000', max: 500000 },
    { label: 'Under 1,000,000', max: 1000000 },
    { label: 'Under 2,000,000', max: 2000000 },
  ];

  const renderFilterGroups = (idPrefix: string) => (
    <div className="space-y-6 text-xs text-slate-300">
      {/* Group 1: Search & Sort */}
      <div role="group" aria-labelledby={`${idPrefix}-group-search-sort`} className="space-y-3.5">
        <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-800/80">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <h3
            id={`${idPrefix}-group-search-sort`}
            className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-['Space_Grotesk']"
          >
            Search &amp; Sort
          </h3>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleDrawerSearchSubmit}>
          <label htmlFor={`${idPrefix}-search-input`} className="block text-slate-200 font-semibold mb-1.5">
            Keyword or Model
          </label>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
            <input
              id={`${idPrefix}-search-input`}
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => setFilterState(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search phones..."
              className="w-full pl-9 pr-9 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none text-xs"
            />
            <button
              type="submit"
              disabled={isSearching}
              title="Search phones"
              aria-label="Search phones"
              className="absolute right-1.5 p-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </form>

        {/* Quick Sort Dropdown Menu */}
        <div>
          <label htmlFor={`${idPrefix}-sort-select`} className="block text-slate-200 font-semibold mb-1.5 flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sort Results By</span>
          </label>
          <div className="relative">
            <select
              id={`${idPrefix}-sort-select`}
              aria-label="Sort Results By"
              value={filterState.sortBy}
              onChange={(e) => setFilterState(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs cursor-pointer appearance-none"
            >
              <option value="newest">Newest Releases</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="battery">Biggest Battery</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Group 2: Budget & Brand */}
      <div role="group" aria-labelledby={`${idPrefix}-group-budget-brand`} className="space-y-3.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <h3
              id={`${idPrefix}-group-budget-brand`}
              className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-['Space_Grotesk']"
            >
              Budget &amp; Brand
            </h3>
          </div>
          {filterState.selectedBrands.length > 0 && (
            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-500/30">
              {filterState.selectedBrands.length} selected
            </span>
          )}
        </div>

        {/* Maximum Price Dropdown */}
        <div>
          <label htmlFor={`${idPrefix}-max-price`} className="block text-slate-200 font-semibold mb-1.5">
            Maximum Price (₦)
          </label>
          <select
            id={`${idPrefix}-max-price`}
            value={filterState.maxPrice}
            onChange={(e) => setFilterState(prev => ({ ...prev, maxPrice: Number(e.target.value), minPrice: 0, categoryPreset: undefined }))}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs font-mono"
          >
            {priceOptions.map(opt => (
              <option key={opt.max} value={opt.max}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Brand Select */}
        <div role="group" aria-labelledby={`${idPrefix}-brand-label`}>
          <span id={`${idPrefix}-brand-label`} className="block text-slate-200 font-semibold mb-1.5">
            Manufacturer / Brand
          </span>
          <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
            {brands.map((brand) => {
              const isChecked = filterState.selectedBrands.includes(brand.name);
              return (
                <button
                  key={brand.id}
                  type="button"
                  aria-pressed={isChecked}
                  onClick={() => handleBrandToggle(brand.name)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isChecked
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  <span className="truncate pr-1">{brand.name}</span>
                  {isChecked && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Group 3: Performance & Connectivity */}
      <div role="group" aria-labelledby={`${idPrefix}-group-specs`} className="space-y-3.5">
        <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-800/80">
          <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <h3
            id={`${idPrefix}-group-specs`}
            className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-['Space_Grotesk']"
          >
            Hardware &amp; Network
          </h3>
        </div>

        {/* 5G phones only toggle */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <span id={`${idPrefix}-5g-label`} className="font-semibold text-white block">
              5G Connectivity Only
            </span>
            <span className="text-[11px] text-slate-400">Ready for global 5G networks</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={filterState.only5G}
            aria-labelledby={`${idPrefix}-5g-label`}
            onClick={() => setFilterState(prev => ({ ...prev, only5G: !prev.only5G }))}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
              filterState.only5G ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {/* Minimum RAM */}
        <div>
          <label htmlFor={`${idPrefix}-min-ram`} className="block text-slate-200 font-semibold mb-1.5">
            Minimum RAM
          </label>
          <select
            id={`${idPrefix}-min-ram`}
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
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs"
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
          <label htmlFor={`${idPrefix}-min-camera`} className="block text-slate-200 font-semibold mb-1.5">
            Main Camera Resolution
          </label>
          <select
            id={`${idPrefix}-min-camera`}
            value={filterState.minCameraMP}
            onChange={(e) => setFilterState(prev => ({ ...prev, minCameraMP: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs"
          >
            <option value={0}>Any camera</option>
            <option value={13}>13 MP or more</option>
            <option value={50}>50 MP or more</option>
            <option value={64}>64 MP or more</option>
            <option value={108}>108 MP or more</option>
            <option value={200}>200 MP or more</option>
          </select>
        </div>
      </div>

      {/* Group 4: Battery, Display & Release */}
      <div role="group" aria-labelledby={`${idPrefix}-group-battery-display`} className="space-y-3.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Battery className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <h3
              id={`${idPrefix}-group-battery-display`}
              className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-['Space_Grotesk']"
            >
              Battery, Display &amp; Year
            </h3>
          </div>
          {filterState.minBattery > 0 && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
              {filterState.minBattery}+ mAh
            </span>
          )}
        </div>

        {/* Battery Life Quick-Filter Category */}
        <div className="space-y-2" role="group" aria-labelledby={`${idPrefix}-battery-presets-label`}>
          <span id={`${idPrefix}-battery-presets-label`} className="block text-slate-200 font-semibold text-xs">
            Battery Capacity Presets
          </span>

          {/* Quick-filter mAh range buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'All mAh', value: 0 },
              { label: '4000+ mAh', value: 4000 },
              { label: '5000+ mAh', value: 5000 },
              { label: '6000+ mAh', value: 6000 },
            ].map((item) => {
              const isSelected = item.value === 0 
                ? (!filterState.minBattery || filterState.minBattery === 0)
                : filterState.minBattery === item.value;
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setFilterState(prev => ({
                    ...prev,
                    minBattery: item.value === 0 ? 0 : (prev.minBattery === item.value ? 0 : item.value),
                    categoryPreset: item.value > 0 ? `${item.label} Battery` : (prev.categoryPreset?.includes('mAh') ? undefined : prev.categoryPreset)
                  }))}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border border-emerald-500 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && item.value !== 0 && (
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Fine-tune mAh Dropdown */}
          <label htmlFor={`${idPrefix}-custom-battery`} className="sr-only">
            Custom minimum battery capacity
          </label>
          <select
            id={`${idPrefix}-custom-battery`}
            aria-label="Custom minimum battery capacity"
            value={filterState.minBattery}
            onChange={(e) => {
              const val = Number(e.target.value);
              setFilterState(prev => ({
                ...prev,
                minBattery: val,
                categoryPreset: val > 0 ? `${val}+ mAh Battery` : (prev.categoryPreset?.includes('mAh') ? undefined : prev.categoryPreset)
              }));
            }}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs"
          >
            <option value={0}>Custom: Any battery</option>
            <option value={4000}>4000 mAh or more</option>
            <option value={4500}>4500 mAh or more</option>
            <option value={5000}>5000 mAh or more</option>
            <option value={5500}>5500 mAh or more</option>
            <option value={6000}>6000 mAh or more</option>
          </select>
        </div>

        {/* Minimum Screen Size */}
        <div>
          <label htmlFor={`${idPrefix}-min-screen`} className="block text-slate-200 font-semibold mb-1.5">
            Minimum Screen Size
          </label>
          <select
            id={`${idPrefix}-min-screen`}
            value={filterState.minScreenSize || 0}
            onChange={(e) => setFilterState(prev => ({ ...prev, minScreenSize: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs"
          >
            <option value={0}>Any screen size</option>
            <option value={6.1}>6.1 inches or more</option>
            <option value={6.5}>6.5 inches or more</option>
            <option value={6.7}>6.7 inches or more</option>
          </select>
        </div>

        {/* Released From */}
        <div>
          <label htmlFor={`${idPrefix}-release-year`} className="block text-slate-200 font-semibold mb-1.5">
            Release Year
          </label>
          <select
            id={`${idPrefix}-release-year`}
            value={filterState.releaseYearFilter || 0}
            onChange={(e) => setFilterState(prev => ({ ...prev, releaseYearFilter: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none text-xs"
          >
            <option value={0}>Any year</option>
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024 or newer</option>
            <option value={2023}>2023 or newer</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filter */}
      <aside aria-label="Phone specification filters" className="hidden lg:block w-72 shrink-0 bg-[#061a11]/90 p-5 rounded-2xl border border-emerald-950/80 sticky top-20 self-start">
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white text-sm font-['Space_Grotesk']">Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
        {renderFilterGroups('desktop')}
      </aside>

      {/* Mobile Filter Drawer */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filter-drawer-title"
          className="fixed inset-0 z-50 lg:hidden bg-slate-950/80 backdrop-blur-sm flex justify-end"
          onClick={onCloseMobile}
        >
          <div
            className="w-full max-w-sm bg-[#061a11] h-full flex flex-col border-l border-emerald-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="shrink-0 px-5 py-4 border-b border-slate-800/90 flex items-center justify-between bg-[#061a11]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-400" />
                <h2 id="mobile-filter-drawer-title" className="font-bold text-white text-base font-['Space_Grotesk']">
                  Filter Phones
                </h2>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close filter drawer"
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Filter Groups */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {renderFilterGroups('mobile')}
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="sticky bottom-0 shrink-0 px-5 py-3.5 bg-[#061a11]/95 backdrop-blur-md border-t border-slate-800/90 flex items-center gap-3 shadow-[0_-8px_20px_rgba(0,0,0,0.45)]">
              <button
                type="button"
                onClick={handleReset}
                disabled={activeFilterCount === 0}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={onCloseMobile}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>
                  Apply Filters{typeof resultCount === 'number' ? ` (${resultCount})` : ''}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

