import { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';

function MainApp() {
  const { 
    activeTab, 
    setActiveTab, 
    phones, 
    brands,
    filterState, 
    resetFilters,
    compareList,
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
      case 'newest':
        return b.releaseYear - a.releaseYear;
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        {selectedPhone ? (
          <PhoneDetailPage
            phone={selectedPhone}
            onBack={() => setSelectedPhone(null)}
          />
        ) : selectedArticle ? (
          <ArticleDetailPage
            article={selectedArticle}
            onBack={() => setSelectedArticle(null)}
          />
        ) : (
          <>
            {/* VIEW: HOME */}
            {activeTab === 'home' && (
          <div className="space-y-12">
            {/* 1. Hero Carousel + Most Read Articles - Remains permanently dark as requested */}
            <HeroSection />

            {/* 2. Trending Phones Section (Clean light design, prices hidden on homepage posts) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Trending phones
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Popular phones in Nigeria with verified hardware specifications.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('phones')}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View all with prices</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {phones.slice(0, 8).map((phone) => (
                  <PhoneCard key={phone.id} phone={phone} hidePrice={true} />
                ))}
              </div>
            </section>

            {/* 3. Latest Reviews Spotlight matching GsmScope */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                    Phone Reviews
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Latest reviews
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    In-depth reviews of the phones Nigerians are buying, with camera, battery and performance verdicts.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>All reviews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.slice(0, 2).map((rev) => (
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
                      <button
                        onClick={() => setActiveTab('reviews')}
                        className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                      >
                        Read community reviews →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Jump straight into a brand to see every model, specification and Nigerian price we track.
                  </p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedPhones.map((phone) => (
                      <PhoneCard key={phone.id} phone={phone} />
                    ))}
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

            <div className="space-y-6 pt-4">
              <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                Highest Rated in our Database
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {phones.filter(p => p.rating >= 4.7).map((phone) => (
                  <PhoneCard key={phone.id} phone={phone} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: COMPARE */}
        {activeTab === 'compare' && <CompareView />}

        {/* VIEW: NEWS */}
        {activeTab === 'news' && <NewsView />}

        {/* VIEW: REVIEWS */}
        {activeTab === 'reviews' && <ReviewsView />}

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
