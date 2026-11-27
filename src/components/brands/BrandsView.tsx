import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import PhoneCard from '../phones/PhoneCard';
import BrandLogo from '../common/BrandLogo';
import FormattedContent from '../common/FormattedContent';
import { useSeoMeta } from '../seo/SeoMeta';
import { ShieldCheck, MapPin, Smartphone, Search, ArrowUpDown, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BrandsView() {
  const { brands, phones, selectedBrand, setSelectedBrand, triggerNavigation } = useApp();
  const [brandSearch, setBrandSearch] = useState('');
  const [brandSort, setBrandSort] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating' | 'battery'>('newest');
  const [brandPage, setBrandPage] = useState<number>(1);
  const BRAND_PHONES_PER_PAGE = 9;

  // Reset search and page when switching brands
  useEffect(() => {
    setBrandSearch('');
    setBrandPage(1);
  }, [selectedBrand?.id, selectedBrand?.name]);

  useEffect(() => {
    setBrandPage(1);
  }, [brandSearch, brandSort]);

  const brandPreviewImage = selectedBrand
    ? phones.find((p) => (p.brand || '').toLowerCase() === selectedBrand.name.toLowerCase())?.image
    : phones[0]?.image;

  useSeoMeta({
    title: selectedBrand
      ? `${selectedBrand.name} Phones — Full Specs, Latest Models & Prices`
      : 'Smartphone Brands Directory — Apple, Samsung, Xiaomi & More',
    description: selectedBrand
      ? `Explore all ${selectedBrand.name} smartphones with full hardware specifications, 5G compatibility, battery ratings, and live prices in Naira and USD.`
      : 'Browse official smartphone brands on GsmScope including Apple, Samsung, Google, Xiaomi, OnePlus, Honor, Oppo, and more with complete device archives.',
    image: brandPreviewImage,
    imageAlt: selectedBrand ? `${selectedBrand.name} Archive` : 'GsmScope Smartphone Brands Directory',
    type: 'website',
    canonicalPath: selectedBrand ? `/?tab=brands&brand=${encodeURIComponent(selectedBrand.name)}` : '/?tab=brands',
  });

  // Priority sort matching brand slider: Apple, Google, Xiaomi, OnePlus, Honor, Oppo, TCL, Huawei, Samsung, Motorola first, then default brands alphabetically, then newly added brands
  const defaultSeedBrandNames = new Set([
    'apple', 'google', 'xiaomi', 'oneplus', 'honor', 'oppo', 'tcl', 'huawei', 'samsung', 'motorola',
    'alcatel', 'asus', 'infinix', 'iqoo', 'itel', 'oscal', 'oukitel', 'realme', 'sony', 'tecno', 'umidigi', 'vivo', 'zte'
  ]);
  const priorityOrder = ['Apple', 'Google', 'Xiaomi', 'OnePlus', 'Honor', 'Oppo', 'TCL', 'Huawei', 'Samsung', 'Motorola'];
  const sortedBrands = [...brands].sort((a, b) => {
    const idxA = priorityOrder.findIndex((p) => p.toLowerCase() === a.name.toLowerCase());
    const idxB = priorityOrder.findIndex((p) => p.toLowerCase() === b.name.toLowerCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    const isCustomA = !defaultSeedBrandNames.has(a.name.toLowerCase()) && !defaultSeedBrandNames.has((a.slug || '').toLowerCase());
    const isCustomB = !defaultSeedBrandNames.has(b.name.toLowerCase()) && !defaultSeedBrandNames.has((b.slug || '').toLowerCase());
    if (isCustomA && !isCustomB) return 1;
    if (!isCustomA && isCustomB) return -1;
    return a.name.localeCompare(b.name);
  });

  // Dedicated Brand Phones Archive View when a brand is clicked
  if (selectedBrand) {
    const rawBrandPhones = phones.filter(
      (p) => (p.brand || '').toLowerCase() === selectedBrand.name.toLowerCase()
    );

    const filteredBrandPhones = rawBrandPhones.filter((p) => {
      if (!brandSearch.trim()) return true;
      const q = brandSearch.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.modelNumber || '').toLowerCase().includes(q) ||
        (p.keyHighlights?.processor || '').toLowerCase().includes(q) ||
        (p.detailedSpecs?.platform?.chipset || '').toLowerCase().includes(q)
      );
    });

    const sortedBrandPhones = [...filteredBrandPhones].sort((a, b) => {
      switch (brandSort) {
        case 'price-asc':
          return a.priceNGN - b.priceNGN;
        case 'price-desc':
          return b.priceNGN - a.priceNGN;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'battery': {
          const batA = parseInt((a.detailedSpecs?.battery?.capacity || a.keyHighlights?.battery || '').replace(/\D/g, ''), 10) || 0;
          const batB = parseInt((b.detailedSpecs?.battery?.capacity || b.keyHighlights?.battery || '').replace(/\D/g, ''), 10) || 0;
          return batB - batA;
        }
        case 'newest':
        default: {
          const dateB = Date.parse(b.releaseDate || '') || (b.releaseYear ? new Date(b.releaseYear, 0, 1).getTime() : 0);
          const dateA = Date.parse(a.releaseDate || '') || (a.releaseYear ? new Date(a.releaseYear, 0, 1).getTime() : 0);
          if (dateB !== dateA) return dateB - dateA;
          return (b.releaseYear || 0) - (a.releaseYear || 0);
        }
      }
    });

    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Brand Archive Header Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm shrink-0">
                <BrandLogo name={selectedBrand.name} logoUrl={selectedBrand.logoUrl} className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    {selectedBrand.name} Phones
                  </h1>
                  <span className="site-badge px-1.5 py-px rounded-full text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                    {rawBrandPhones.length} {rawBrandPhones.length === 1 ? 'model' : 'models'}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  <FormattedContent content={selectedBrand.description} compact />
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 shrink-0">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{selectedBrand.globalPresence || selectedBrand.officialPresenceInNigeria || 'Global Distribution'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold">{selectedBrand.warrantyPartner}</span>
              </div>
            </div>
          </div>

          {/* Series Highlights & Quick Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1">Series:</span>
              {(selectedBrand.popularSeries || []).map((series, idx) => (
                <span
                  key={idx}
                  className="site-badge px-1.5 py-px rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium text-[9px]"
                >
                  {series}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder={`Search ${selectedBrand.name} models...`}
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
                {brandSearch && (
                  <button
                    type="button"
                    onClick={() => setBrandSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 hidden sm:inline" />
                <select
                  value={brandSort}
                  onChange={(e) => setBrandSort(e.target.value as any)}
                  aria-label="Sort brand phones"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="battery">Biggest Battery</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Phones Archive Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Space_Grotesk']">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {selectedBrand.name} Archive ({sortedBrandPhones.length})
              </span>
            </h2>
          </div>

          {sortedBrandPhones.length === 0 ? (
            <div className="p-10 text-center text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Smartphone className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                No {selectedBrand.name} phones match your filter.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {brandSearch
                  ? 'Try clearing your search query above.'
                  : `No devices currently indexed for ${selectedBrand.name}. You can publish new ${selectedBrand.name} models in the Admin Dashboard.`}
              </p>
            </div>
          ) : (
            (() => {
              const totalBrandPages = Math.max(1, Math.ceil(sortedBrandPhones.length / BRAND_PHONES_PER_PAGE));
              const safeBrandPage = Math.min(brandPage, totalBrandPages);
              const startIdx = (safeBrandPage - 1) * BRAND_PHONES_PER_PAGE;
              const paginatedBrandPhones = sortedBrandPhones.slice(startIdx, startIdx + BRAND_PHONES_PER_PAGE);

              const handleBrandPageChange = (nextPage: number) => {
                if (nextPage < 1 || nextPage > totalBrandPages || nextPage === safeBrandPage) return;
                triggerNavigation(() => {
                  setBrandPage(nextPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                });
              };

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedBrandPhones.map((phone) => (
                      <PhoneCard key={phone.id} phone={phone} />
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={safeBrandPage <= 1}
                        onClick={() => handleBrandPageChange(safeBrandPage - 1)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer shadow-sm transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      <div className="flex items-center gap-1 px-0.5">
                        {Array.from({ length: totalBrandPages }, (_, idx) => idx + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handleBrandPageChange(pageNum)}
                            className={`w-7 h-7 rounded-md text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                              safeBrandPage === pageNum
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={safeBrandPage >= totalBrandPages}
                        onClick={() => handleBrandPageChange(safeBrandPage + 1)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer shadow-sm transition-colors"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    );
  }

  // All Brands Directory View (only shown when no specific brand is clicked, e.g. via "All brands" or top "Brands" nav)
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-['Space_Grotesk']">
          Smartphone Global Brands
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
          Select any smartphone brand below to open its dedicated phone archive, complete specifications, and market prices.
        </p>
      </div>

      {/* Brands Directory Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-2.5">
        {sortedBrands.map((b) => {
          const phoneCount = phones.filter((p) => p.brand.toLowerCase() === b.name.toLowerCase()).length;
          return (
            <button
              key={b.id}
              onClick={() => {
                triggerNavigation(() => {
                  setSelectedBrand(b);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                });
              }}
              className="p-2.5 sm:p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-[#061a11] transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 shadow-sm group min-w-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                <BrandLogo name={b.name} logoUrl={b.logoUrl} className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate w-full text-center">
                {b.name}
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {phoneCount} {phoneCount === 1 ? 'model' : 'models'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
