import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import AdBanner from './components/common/AdBanner';
import HeroSection from './components/home/HeroSection';
import BestCategoriesSection from './components/home/BestCategoriesSection';
import PhoneFinderSection from './components/home/PhoneFinderSection';
import QuickCompareBanner from './components/home/QuickCompareBanner';
import PhoneCard from './components/phones/PhoneCard';
import PhoneDetailPage from './components/phones/PhoneDetailPage';
import ArticleDetailPage from './components/news/ArticleDetailPage';
import PhoneFilterDrawer from './components/phones/PhoneFilterDrawer';
import CompareView from './components/compare/CompareView';
import BrandsView from './components/brands/BrandsView';
import NewsView from './components/news/NewsView';
import ReviewsView from './components/pages/ReviewsView';
import GuidesView from './components/pages/GuidesView';
import AboutView from './components/pages/AboutView';
import ContactView from './components/pages/ContactView';
import AdvertiseView from './components/pages/AdvertiseView';
import AdminDashboardModal from './components/admin/AdminDashboardModal';
import AdminLoginView from './components/admin/AdminLoginView';
import JsonLdScript from './components/seo/JsonLdScript';
import { 
  SlidersHorizontal,
  Scale,
  ArrowRight,
  Smartphone,
  Star,
  Tag,
  Check,
  X,
  MapPin,
  ShieldCheck,
  Eye,
  Sparkles,
  Search,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';

function MainApp() {
  const { 
    activeTab, 
    setActiveTab, 
    phones, 
    brands,
    filterState, 
    setFilterState,
    resetFilters,
    compareList,
    addToCompare,
    removeFromCompare,
    isInCompare,
    articles,
    reviews,
    currency,
    formatNaira,
    formatUSD,
    isAdminAuthenticated,
    adminLogout,
    selectedPhone,
    setSelectedPhone,
    selectedArticle,
    setSelectedArticle
  } = useApp();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Automatically scroll to the top whenever viewing a phone, article, or switching tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [selectedPhone, selectedArticle, activeTab]);

  // Apply filters
  const filteredPhones = phones.filter((phone) => {
    // Search query
    if (filterState.searchQuery) {
      const q = filterState.searchQuery.toLowerCase();
      const matchName = phone.name.toLowerCase().includes(q);
      const matchBrand = phone.brand.toLowerCase().includes(q);
      const matchChipset = phone.detailedSpecs.platform.chipset.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchChipset) return false;
    }

    // Brands
    if (filterState.selectedBrands.length > 0) {
      if (!filterState.selectedBrands.includes(phone.brand)) return false;
    }

    // Price
    if (phone.priceNGN < filterState.minPrice || phone.priceNGN > filterState.maxPrice) {
      return false;
    }

    // 5G
    if (filterState.only5G && !phone.keyHighlights.network5g) {
      return false;
    }

    // Battery
    if (filterState.minBattery > 0) {
      const capacityNum = parseInt(phone.detailedSpecs.battery.capacity.replace(/\D/g, ''), 10) || 0;
      if (capacityNum < filterState.minBattery) return false;
    }

    // Camera MP
    if (filterState.minCameraMP > 0) {
      const mpMatch = phone.detailedSpecs.mainCamera.setup.match(/(\d+)\s*MP/i);
      const mainMP = mpMatch ? parseInt(mpMatch[1], 10) : 0;
      if (mainMP < filterState.minCameraMP) return false;
    }

    // Screen size
    if (filterState.minScreenSize && filterState.minScreenSize > 0) {
      if ((phone.screenSizeInches || 6.6) < filterState.minScreenSize) return false;
    }

    // Release year
    if (filterState.releaseYearFilter && filterState.releaseYearFilter > 0) {
      if (phone.releaseYear < filterState.releaseYearFilter) return false;
    }

    // RAM
    if (filterState.ram.length > 0) {
      const hasRam = filterState.ram.some(r => phone.keyHighlights.ram.includes(r));
      if (!hasRam) return false;
    }

    return true;
  });

  // Apply sorting
  const sortedPhones = [...filteredPhones].sort((a, b) => {
    switch (filterState.sortBy) {
      case 'price-asc':
        return a.priceNGN - b.priceNGN;
      case 'price-desc':
        return b.priceNGN - a.priceNGN;
      case 'rating':
        return b.rating - a.rating;
      case 'newest': {
        const dateB = Date.parse(b.releaseDate) || (b.releaseYear ? new Date(b.releaseYear, 0, 1).getTime() : 0);
        const dateA = Date.parse(a.releaseDate) || (a.releaseYear ? new Date(a.releaseYear, 0, 1).getTime() : 0);
        if (dateB !== dateA) return dateB - dateA;
        return b.releaseYear - a.releaseYear;
      }
      case 'battery': {
        const batA = parseInt(a.detailedSpecs.battery.capacity.replace(/\D/g, ''), 10) || 0;
        const batB = parseInt(b.detailedSpecs.battery.capacity.replace(/\D/g, ''), 10) || 0;
        return batB - batA;
      }
      case 'popular':
      default:
        return (b.viewsCount || 0) - (a.viewsCount || 0);
    }
  });

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-main)] flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      <JsonLdScript />
      
      {/* Main Header (3-zone Top Bar with Currency Switcher) - Remains permanently dark */}
      <Header />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-8 space-y-14">
        {selectedPhone ? (
          <PhoneDetailPage
            phone={selectedPhone}
            onBack={() => {
              setSelectedPhone(null);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        ) : selectedArticle ? (
          <ArticleDetailPage
            article={selectedArticle}
            onBack={() => {
              setSelectedArticle(null);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        ) : (
          <>
            {/* VIEW: HOME */}
            {activeTab === 'home' && (
          <div className="space-y-14">
            {/* 1. Hero Carousel + Most Read Articles - Remains permanently dark as requested */}
            <HeroSection />

            {/* 2. Trending Phones Section (Columns layout, images fit column size without padding) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Trending phones
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('phones');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {phones.slice(0, 8).map((phone, idx) => {
                  const inComp = isInCompare(phone.id);
                  return (
                    <div
                      key={phone.id}
                      onClick={() => {
                        setSelectedPhone(phone);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="group p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition-all flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      {/* Thumbnail with Rank Badge - Fits column size without padding */}
                      <div className="relative w-28 sm:w-36 h-28 sm:h-36 rounded-xl overflow-hidden shrink-0 bg-slate-950 p-0 border border-slate-200 dark:border-slate-800 shadow-inner">
                        <span className="absolute top-1.5 left-1.5 z-10 text-[11px] font-mono font-bold text-white bg-emerald-600/95 backdrop-blur-sm px-1.5 py-0.5 rounded shadow">
                          #{idx + 1}
                        </span>
                        {phone.image ? (
                          <img
                            src={phone.image}
                            alt={phone.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Smartphone className="w-8 h-8 text-slate-400 m-auto" />
                        )}
                      </div>

                      {/* Details in column */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                            {phone.brand}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {phone.releaseYear}
                          </span>
                          <span className="text-xs text-amber-500 font-mono font-semibold ml-auto flex items-center gap-0.5">
                            ★ {phone.rating.toFixed(1)}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg font-['Space_Grotesk'] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {phone.name}
                        </h3>

                        {/* Key specs summary */}
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 space-x-1.5">
                          <span>{phone.keyHighlights.display}</span>
                          <span>·</span>
                          <span>{phone.keyHighlights.processor}</span>
                          <span>·</span>
                          <span>{phone.keyHighlights.battery}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            <span>View specs</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (inComp) {
                                removeFromCompare(phone.id);
                              } else {
                                addToCompare(phone.id);
                              }
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                              inComp
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-700'
                            }`}
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>{inComp ? 'Comparing' : 'Compare'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. Latest Reviews Section - One Big Grid Display + Rest Beneath It */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                    Phone Reviews
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Latest reviews
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('reviews');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>All reviews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* One Big Grid Display (Featured Lead Review) */}
              {reviews.length > 0 && (
                <div className="space-y-4">
                  {(() => {
                    const leadReview = reviews[0];
                    return (
                      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 space-y-4 shadow-lg hover:border-emerald-500 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono uppercase tracking-wider font-bold text-white bg-emerald-600 px-2 py-0.5 rounded">
                                Featured Verdict
                              </span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm">
                                {leadReview.phoneName}
                              </span>
                            </div>
                            <span className="font-mono text-xs">{leadReview.date}</span>
                          </div>

                          <div className="flex items-center gap-3 my-2">
                            <div className="flex text-amber-400">
                              {Array.from({ length: leadReview.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-xl font-['Space_Grotesk']">
                              &ldquo;{leadReview.title}&rdquo;
                            </h3>
                          </div>

                          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed pt-1">
                            {leadReview.comment}
                          </p>

                          {/* Pros & Cons summary chips */}
                          {(leadReview.pros.length > 0 || leadReview.cons.length > 0) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                              {leadReview.pros.length > 0 && (
                                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20">
                                  <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">PROS</span>
                                  <span className="text-slate-600 dark:text-slate-300">{leadReview.pros.join(', ')}</span>
                                </div>
                              )}
                              {leadReview.cons.length > 0 && (
                                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/20">
                                  <span className="font-bold text-rose-700 dark:text-rose-300 block mb-1">CONS</span>
                                  <span className="text-slate-600 dark:text-slate-300">{leadReview.cons.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            {leadReview.userName} · {leadReview.location}
                          </span>
                          <button
                            onClick={() => {
                              setActiveTab('reviews');
                              window.scrollTo({ top: 0, behavior: 'instant' });
                            }}
                            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                          >
                            <span>Read all community reviews</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Rest Reviews Beneath It */}
                  {reviews.length > 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {reviews.slice(1, 3).map((rev) => (
                        <div key={rev.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{rev.phoneName}</span>
                              <span>{rev.date}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-amber-400">
                                {Array.from({ length: rev.rating }).map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                &ldquo;{rev.title}&rdquo;
                              </h4>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {rev.comment}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              {rev.userName} · {rev.location}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 4. Quick 2-Phone Comparison Banner ("Which phone is right for you?") */}
            <QuickCompareBanner />

            {/* 5. Buying Guides ("Find the best phone for you") */}
            <BestCategoriesSection />

            {/* 6. Phone Finder Tool ("Not sure what to buy?") */}
            <PhoneFinderSection />

            {/* 7. Popular Brands Strip */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                    Manufacturers
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Popular phone brands
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('brands')}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>All brands</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveTab('brands')}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-[#061a11] transition-all text-center flex flex-col items-center justify-center gap-1 group cursor-pointer shadow-sm"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm ${b.accentBg} group-hover:scale-105 transition-transform`}>
                      {b.logoLetter}
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {b.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* VIEW: PHONES DATABASE */}
        {activeTab === 'phones' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
                  Phone database and Nigerian prices
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  Every phone we track, with full specifications and prices in naira and USD. Narrow the list by brand, budget, RAM, storage, camera, battery, display or 5G.
                </p>
              </div>

              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-white flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <span>Show filters</span>
              </button>
            </div>

            {/* Preset Banner if Active */}
            {filterState.categoryPreset && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-300 font-semibold">Active Category Shortlist:</span>
                  <span className="font-bold text-white">{filterState.categoryPreset}</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filter</span>
                </button>
              </div>
            )}

            {/* Layout: Sidebar Filter + Cards Grid */}
            <div className="flex gap-8 items-start">
              <PhoneFilterDrawer 
                isMobileOpen={mobileFilterOpen} 
                onCloseMobile={() => setMobileFilterOpen(false)} 
              />

              <div className="flex-1">
                {/* Search Bar & Quick Sort Toolbar */}
                <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                      <input
                        type="text"
                        value={filterState.searchQuery}
                        onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
                        placeholder="Search phones by model, brand, processor..."
                        aria-label="Search phones in database"
                        className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs sm:text-sm transition-colors"
                      />
                      {filterState.searchQuery && (
                        <button
                          onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                          title="Clear search"
                          aria-label="Clear search"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Quick Sort Dropdown Menu */}
                    <div className="flex items-center gap-2 shrink-0">
                      <label htmlFor="phones-quick-sort" className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap flex items-center gap-1.5">
                        <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Quick Sort:</span>
                      </label>
                      <div className="relative flex-1 sm:flex-none">
                        <select
                          id="phones-quick-sort"
                          aria-label="Quick Sort"
                          value={filterState.sortBy}
                          onChange={(e) => setFilterState((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                          className="w-full sm:w-auto pl-3.5 pr-8 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none shadow-sm transition-colors"
                        >
                          <option value="newest">Newest</option>
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

                  {/* Summary Bar */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60 gap-2">
                    <div className="flex items-center gap-2">
                      <span>Showing <strong className="text-slate-800 dark:text-white font-mono">{sortedPhones.length}</strong> matching phones</span>
                      {filterState.searchQuery && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-mono">
                          Query: &ldquo;{filterState.searchQuery}&rdquo;
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      Sort: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{
                        filterState.sortBy === 'newest' ? 'Newest' :
                        filterState.sortBy === 'price-asc' ? 'Price (Low to High)' :
                        filterState.sortBy === 'price-desc' ? 'Price (High to Low)' :
                        filterState.sortBy === 'rating' ? 'Top Rated' :
                        filterState.sortBy === 'battery' ? 'Biggest Battery' : 'Most Popular'
                      }</span>
                    </span>
                  </div>
                </div>

                {sortedPhones.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <Smartphone className="w-10 h-10 text-slate-600 mx-auto" />
                    <h3 className="font-bold text-white text-base font-['Space_Grotesk']">
                      No phones match these filters yet.
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Try widening your budget, lowering the RAM requirement or clearing the brand filter.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* 1. ONE BIG Grid Display (Featured Lead Phone) */}
                    {(() => {
                      const leadPhone = sortedPhones[0];
                      const inComp = isInCompare(leadPhone.id);
                      return (
                        <div
                          onClick={() => {
                            setSelectedPhone(leadPhone);
                            window.scrollTo({ top: 0, behavior: 'instant' });
                          }}
                          className="group rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 hover:border-emerald-500 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden cursor-pointer transition-all"
                        >
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono uppercase tracking-wider font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-md">
                                Top Result
                              </span>
                              <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded">
                                {leadPhone.brand} · {leadPhone.releaseYear}
                              </span>
                              <span className="text-xs text-amber-500 font-mono font-bold ml-auto flex items-center gap-1">
                                ★ {leadPhone.rating.toFixed(1)} ({leadPhone.reviewsCount} reviews)
                              </span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {leadPhone.name}
                            </h2>

                            <div className="flex items-baseline gap-3">
                              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {currency === 'USD' ? formatUSD(leadPhone.priceUSD) : formatNaira(leadPhone.priceNGN)}
                              </span>
                              <span className="text-sm font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                                ({currency === 'USD' ? formatNaira(leadPhone.priceNGN) : formatUSD(leadPhone.priceUSD)})
                              </span>
                            </div>

                            {/* Key specs summary grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                <span className="text-slate-400 text-[10px] block">Display</span>
                                <span className="font-semibold text-slate-900 dark:text-white truncate block">{leadPhone.keyHighlights.display}</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                <span className="text-slate-400 text-[10px] block">Processor</span>
                                <span className="font-semibold text-slate-900 dark:text-white truncate block">{leadPhone.keyHighlights.processor}</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                <span className="text-slate-400 text-[10px] block">Battery</span>
                                <span className="font-semibold text-slate-900 dark:text-white truncate block">{leadPhone.keyHighlights.battery}</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                <span className="text-slate-400 text-[10px] block">RAM / Storage</span>
                                <span className="font-semibold text-slate-900 dark:text-white truncate block">{leadPhone.keyHighlights.ram} / {leadPhone.keyHighlights.storage}</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-2">
                                <span className="text-slate-400 text-[10px] block">Camera</span>
                                <span className="font-semibold text-slate-900 dark:text-white truncate block">{leadPhone.keyHighlights.camera}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPhone(leadPhone);
                                  window.scrollTo({ top: 0, behavior: 'instant' });
                                }}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View full specs</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (inComp) removeFromCompare(leadPhone.id);
                                  else addToCompare(leadPhone.id);
                                }}
                                className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  inComp 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                                }`}
                              >
                                <Scale className="w-4 h-4 text-emerald-500" />
                                <span>{inComp ? 'Comparing' : 'Compare'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Image */}
                          <div className="w-48 sm:w-64 h-56 sm:h-72 flex items-center justify-center shrink-0">
                            <img
                              src={leadPhone.image}
                              alt={leadPhone.name}
                              referrerPolicy="no-referrer"
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* 2. Rest Posts Beneath It */}
                    {sortedPhones.length > 1 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk']">
                            All Matching Smartphones ({sortedPhones.length - 1} more)
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                          {sortedPhones.slice(1).map((phone) => (
                            <PhoneCard key={phone.id} phone={phone} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: BEST PHONES */}
        {activeTab === 'best-phones' && (
          <div className="space-y-8">
            <div className="pb-4 border-b border-slate-800">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
                Best phones in Nigeria
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Shortlists built from the GsmScope database and updated as new models and prices come in. Jump to the category that matches what you care about most.
              </p>
            </div>

            <BestCategoriesSection />

            {/* Highest Rated - One Big Grid Display + Rest Beneath It */}
            {(() => {
              const topRated = phones.filter(p => p.rating >= 4.7);
              if (topRated.length === 0) return null;
              const leadTop = topRated[0];
              const restTop = topRated.slice(1);
              return (
                <div className="space-y-6 pt-4">
                  <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                    Highest Rated in our Database
                  </h2>

                  {/* One Big Grid Display */}
                  <div
                    onClick={() => {
                      setSelectedPhone(leadTop);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 hover:border-emerald-500 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer group shadow-xl transition-all"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider font-bold text-white bg-emerald-600 px-2 py-0.5 rounded">
                          #1 Highest Rated
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {leadTop.brand} · {leadTop.releaseYear}
                        </span>
                        <span className="text-xs text-amber-400 font-mono font-bold ml-auto flex items-center gap-1">
                          ★ {leadTop.rating.toFixed(1)}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] group-hover:text-emerald-400 transition-colors">
                        {leadTop.name}
                      </h3>
                      <div className="text-xl font-bold font-mono text-emerald-400">
                        {currency === 'USD' ? formatUSD(leadTop.priceUSD) : formatNaira(leadTop.priceNGN)}
                      </div>
                      <p className="text-xs text-slate-300">
                        {leadTop.keyHighlights.display} · {leadTop.keyHighlights.processor} · {leadTop.keyHighlights.battery}
                      </p>
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>View device specifications</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                    <div className="w-48 h-56 flex items-center justify-center shrink-0">
                      <img
                        src={leadTop.image}
                        alt={leadTop.name}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Rest beneath it */}
                  {restTop.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                      {restTop.map((phone) => (
                        <PhoneCard key={phone.id} phone={phone} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* VIEW: COMPARE */}
        {activeTab === 'compare' && <CompareView />}

        {/* VIEW: NEWS */}
        {activeTab === 'news' && <NewsView />}

        {/* VIEW: REVIEWS */}
        {activeTab === 'reviews' && <ReviewsView />}

        {/* VIEW: GUIDES */}
        {activeTab === 'guides' && <GuidesView />}

        {/* VIEW: BRANDS */}
        {activeTab === 'brands' && <BrandsView />}

        {/* VIEW: ABOUT */}
        {activeTab === 'about' && <AboutView />}

        {/* VIEW: CONTACT */}
        {activeTab === 'contact' && <ContactView />}

        {/* VIEW: ADVERTISE */}
        {activeTab === 'advertise' && <AdvertiseView />}

        {/* VIEW: ADMIN STUDIO (Access via /#admin) */}
        {activeTab === 'admin' && (
          !isAdminAuthenticated ? (
            <AdminLoginView />
          ) : (
            <div className="py-12 flex justify-center">
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 max-w-lg w-full text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  Administrator Session Active
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are signed in to the GsmScope Administration Studio. The full management modal is active. You can manage smartphones, adjust Nigerian prices, publish tech reviews and articles, or moderate comments.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('home')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    View Public Site
                  </button>
                  <button
                    onClick={() => adminLogout()}
                    className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )
        )}
          </>
        )}
      </main>

      {/* Floating Bottom Quick-Compare Bar */}
      {compareList.length > 0 && activeTab !== 'compare' && (
        <aside aria-label="Comparison quick dock" className="fixed bottom-4 right-4 z-30">
          <button
            onClick={() => setActiveTab('compare')}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-2xl border border-emerald-400/40 cursor-pointer transition-transform hover:scale-105"
          >
            <Scale className="w-4 h-4" />
            <span>Compare Selected ({compareList.length})</span>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </button>
        </aside>
      )}

      {/* Admin Dashboard Workspace */}
      <AdminDashboardModal />

      {/* Footer with GsmScope columns and newsletter */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
