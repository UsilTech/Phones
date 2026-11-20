import { useState, useEffect } from 'react';
import { AppProvider, useApp, SEED_PHONE_IDS, SEED_ARTICLE_IDS, getRecordTimestamp } from './context/AppContext';
import Header from './components/common/Header';
import Breadcrumbs from './components/common/Breadcrumbs';
import Footer from './components/common/Footer';
import AdPlacementSlot from './components/common/AdPlacementSlot';
import PredictiveSearchDropdown from './components/common/PredictiveSearchDropdown';
import HeroSection from './components/home/HeroSection';
import BrandSliderSection from './components/home/BrandSliderSection';
import BestCategoriesSection from './components/home/BestCategoriesSection';
import PhoneFinderSection from './components/home/PhoneFinderSection';
import QuickCompareBanner from './components/home/QuickCompareBanner';
import PhoneCard from './components/phones/PhoneCard';
import PhoneFilterDrawer from './components/phones/PhoneFilterDrawer';

// Direct imports for all views so pages open immediately without a circular preloader
import PhoneDetailPage from './components/phones/PhoneDetailPage';
import ArticleDetailPage from './components/news/ArticleDetailPage';
import CompareView from './components/compare/CompareView';
import AdminDashboardModal from './components/admin/AdminDashboardModal';
import AdminLoginView from './components/admin/AdminLoginView';
import BrandsView from './components/brands/BrandsView';
import NewsView from './components/news/NewsView';
import ReviewArticlesView from './components/pages/ReviewArticlesView';
import ReviewsView from './components/pages/ReviewsView';
import GuidesView from './components/pages/GuidesView';
import AboutView from './components/pages/AboutView';
import ContactView from './components/pages/ContactView';
import AdvertiseView from './components/pages/AdvertiseView';
import PrivacyPolicyView from './components/pages/PrivacyPolicyView';
import TermsOfServiceView from './components/pages/TermsOfServiceView';
import ErrorBoundary from './components/common/ErrorBoundary';
import JsonLdScript from './components/seo/JsonLdScript';
import SeoMeta from './components/seo/SeoMeta';
import BrandLogo from './components/common/BrandLogo';
import GlobalProgressBar from './components/common/GlobalProgressBar';
import GlobalToast from './components/common/GlobalToast';
import PrivacyNotice from './components/common/PrivacyNotice';
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
  ChevronDown,
  Loader2
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
    setSelectedArticle,
    setSelectedBrand,
    clearCompare,
    triggerNavigation,
    startGlobalLoading,
    stopGlobalLoading,
    websiteContent,
    adSettings,
    goBack
  } = useApp();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isDbSearching, setIsDbSearching] = useState(false);
  const [dbSearchPredictiveOpen, setDbSearchPredictiveOpen] = useState(false);
  const [dbSearchPredictiveIndex, setDbSearchPredictiveIndex] = useState(-1);

  // Inject Google AdSense Auto Ads script into <head> when enabled in Admin Dashboard
  useEffect(() => {
    if (!adSettings?.adsenseAutoAdsEnabled) return;
    const rawPubId = (adSettings?.adsensePublisherId || '').trim();
    if (!rawPubId) return;
    const normalizedClient = rawPubId.startsWith('ca-pub-')
      ? rawPubId
      : rawPubId.startsWith('pub-')
        ? `ca-${rawPubId}`
        : `ca-pub-${rawPubId.replace(/\D/g, '')}`;
    if (!normalizedClient || normalizedClient === 'ca-pub-' || normalizedClient.includes('0000000000')) {
      return;
    }

    const existingScript = document.getElementById('gsmscope-adsense-sdk') as HTMLScriptElement | null;
    const expectedSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(normalizedClient)}`;
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'gsmscope-adsense-sdk';
      script.async = true;
      script.src = expectedSrc;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, [adSettings?.adsenseAutoAdsEnabled, adSettings?.adsensePublisherId]);

  // Dynamically sync favicon when updated in Admin Dashboard -> Website Content & Branding
  useEffect(() => {
    const favUrl = websiteContent?.faviconUrl?.trim();
    if (!favUrl) return;
    const rels = ['icon', 'shortcut icon', 'apple-touch-icon'];
    rels.forEach((rel) => {
      let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      if (link.getAttribute('href') !== favUrl) {
        link.setAttribute('href', favUrl);
      }
    });
  }, [websiteContent?.faviconUrl]);

  const handleDbSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDbSearching) return;
    setIsDbSearching(true);
    startGlobalLoading();
    setTimeout(() => {
      stopGlobalLoading();
      setIsDbSearching(false);
    }, 350);
  };

  // Automatically scroll to the top whenever viewing a phone, article, or switching tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [selectedPhone, selectedArticle, activeTab]);

  // Apply filters
  const filteredPhones = phones.filter((phone) => {
    // Search query
    if (filterState.searchQuery) {
      const q = filterState.searchQuery.toLowerCase();
      const matchName = (phone.name || '').toLowerCase().includes(q);
      const matchBrand = (phone.brand || '').toLowerCase().includes(q);
      const matchChipset = (phone.detailedSpecs?.platform?.chipset || phone.keyHighlights?.processor || '').toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchChipset) return false;
    }

    // Brands
    if (filterState.selectedBrands.length > 0) {
      if (!filterState.selectedBrands.includes(phone.brand)) return false;
    }

    // Price
    const cats = (phone.categories || []).map((c) => c.toLowerCase());
    if (phone.priceNGN < filterState.minPrice || phone.priceNGN > filterState.maxPrice) {
      return false;
    }

    // 5G
    if (filterState.only5G && !phone.keyHighlights?.network5g && !cats.includes('5g') && !cats.includes('best-5g')) {
      return false;
    }

    // Battery
    if (filterState.minBattery > 0) {
      const hasBatteryCat = filterState.categoryPreset === 'Best Battery Life' && cats.includes('best-battery');
      if (!hasBatteryCat) {
        const specCapacity = parseInt(phone.detailedSpecs?.battery?.capacity?.replace(/\D/g, '') || '', 10) || 0;
        const highlightCapacity = parseInt(phone.keyHighlights?.battery?.replace(/\D/g, '') || '', 10) || 0;
        const capacityNum = specCapacity || highlightCapacity;
        if (capacityNum < filterState.minBattery) return false;
      }
    }

    // Camera MP
    if (filterState.minCameraMP > 0) {
      const hasCameraCat = filterState.categoryPreset === 'Best Camera Phones' && cats.includes('best-camera');
      if (!hasCameraCat) {
        const camStr = phone.detailedSpecs?.mainCamera?.setup || phone.keyHighlights?.camera || '';
        const mpMatch = camStr.match(/(\d+)\s*MP/i);
        const mainMP = mpMatch ? parseInt(mpMatch[1], 10) : 0;
        if (mainMP < filterState.minCameraMP) return false;
      }
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
      const hasGamingCat = filterState.categoryPreset === 'Best Gaming Phones' && cats.includes('best-gaming');
      if (!hasGamingCat) {
        const ramStr = phone.keyHighlights?.ram || (phone.detailedSpecs?.memory?.ramVariants || []).join(' ');
        const hasRam = filterState.ram.some(r => ramStr.includes(r));
        if (!hasRam) return false;
      }
    }

    // Storage / Memory
    if (filterState.storage && filterState.storage.length > 0) {
      const storageStr = [
        phone.keyHighlights?.storage || '',
        (phone.detailedSpecs?.memory as any)?.internal || '',
        ...(phone.detailedSpecs?.memory?.storageVariants || [])
      ].join(' ');
      const hasStorage = filterState.storage.some(s => storageStr.includes(s));
      if (!hasStorage) return false;
    }

    return true;
  });

  // Apply sorting (prioritizing admin-assigned category badges when a category preset is active)
  const sortedPhones = [...filteredPhones].sort((a, b) => {
    if (filterState.categoryPreset) {
      const catsA = (a.categories || []).map((c) => c.toLowerCase());
      const catsB = (b.categories || []).map((c) => c.toLowerCase());
      const matchesPresetBadge = (cats: string[], isFeat?: boolean) => {
        if (filterState.categoryPreset === 'Top Rated Overall') {
          return cats.includes('top-rated') || cats.includes('flagship') || Boolean(isFeat);
        }
        if (filterState.categoryPreset === 'Best Camera Phones') {
          return cats.includes('best-camera');
        }
        if (filterState.categoryPreset === 'Best Gaming Phones') {
          return cats.includes('best-gaming');
        }
        if (filterState.categoryPreset === 'Best Battery Life') {
          return cats.includes('best-battery');
        }
        if (filterState.categoryPreset === 'Best 5G Phones') {
          return cats.includes('best-5g') || cats.includes('5g');
        }
        return false;
      };
      const badgeA = matchesPresetBadge(catsA, a.isFeatured) ? 1 : 0;
      const badgeB = matchesPresetBadge(catsB, b.isFeatured) ? 1 : 0;
      if (badgeB !== badgeA) return badgeB - badgeA;
    }

    switch (filterState.sortBy) {
      case 'price-asc':
        return a.priceNGN - b.priceNGN;
      case 'price-desc':
        return b.priceNGN - a.priceNGN;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest': {
        const isCustomA = !SEED_PHONE_IDS.has(a.id);
        const isCustomB = !SEED_PHONE_IDS.has(b.id);
        if (isCustomA && !isCustomB) return -1;
        if (!isCustomA && isCustomB) return 1;
        if (isCustomA && isCustomB) {
          const tsB = getRecordTimestamp(b);
          const tsA = getRecordTimestamp(a);
          if (tsB && tsA && tsB !== tsA) return tsB - tsA;
        }
        const dateB = Date.parse(b.releaseDate || '') || (b.releaseYear ? new Date(b.releaseYear, 0, 1).getTime() : 0);
        const dateA = Date.parse(a.releaseDate || '') || (a.releaseYear ? new Date(a.releaseYear, 0, 1).getTime() : 0);
        if (dateB !== dateA) return dateB - dateA;
        return (b.releaseYear || 0) - (a.releaseYear || 0);
      }
      case 'battery': {
        const batA = parseInt((a.detailedSpecs?.battery?.capacity || a.keyHighlights?.battery || '').replace(/\D/g, ''), 10) || 0;
        const batB = parseInt((b.detailedSpecs?.battery?.capacity || b.keyHighlights?.battery || '').replace(/\D/g, ''), 10) || 0;
        return batB - batA;
      }
      case 'popular':
      default:
        return (b.viewsCount || 0) - (a.viewsCount || 0);
    }
  });

  const isBrandSliderExcluded = 
    activeTab === 'about' || 
    activeTab === 'contact' || 
    activeTab === 'privacy' || 
    activeTab === 'terms' || 
    activeTab === 'advertise' ||
    activeTab === 'admin';

  if (activeTab === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen min-h-[100dvh] w-full bg-[#04110b] text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
          <SeoMeta
            title="Admin Login — GsmScope"
            description="GsmScope Administrator Authentication"
            canonicalPath="/admin"
          />
          <GlobalProgressBar />
          <GlobalToast />
          <AdminLoginView />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f0f0f1] dark:bg-slate-950 text-[var(--text-main)] flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200 w-full max-w-full overflow-x-hidden">
        <SeoMeta
          title="Admin Dashboard — GsmScope CMS"
          description="Manage smartphones, full hardware specifications, brands, pricing, articles, user reviews, and site settings in the GsmScope Admin Dashboard."
          canonicalPath="/admin"
        />
        <GlobalProgressBar />
        <GlobalToast />
        <JsonLdScript />
        <AdminDashboardModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-main)] flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200 w-full max-w-full">
      {/* Global Animated Top Progress Bar */}
      <GlobalProgressBar />
      <GlobalToast />

      <JsonLdScript />

      {/* Sticky Top Header Container (Admin Bar when logged in + Main Site Header) */}
      <div className="sticky-top-header sticky top-0 z-50 w-full">
        {isAdminAuthenticated && <AdminDashboardModal />}
        <Header />
      </div>

      {/* World Notable Brands Slider - Shown across all pages except About Us, Contact Us, Privacy Policy, Terms of Service, Advertise with Us */}
      {!isBrandSliderExcluded && (
        <BrandSliderSection />
      )}

      {/* Dynamic SEO Breadcrumb Navigation */}
      <Breadcrumbs />

      {/* Main Content Viewport */}
      <main className={`flex-1 w-full max-w-full px-[calc(1rem-5px)] sm:px-[calc(2rem-5px)] lg:px-[calc(3rem-5px)] pt-5 pb-7 space-y-7 overflow-x-hidden ${selectedPhone && !selectedArticle ? 'phone-detail-text-scale' : 'page-text-scale'}`}>
        {selectedArticle ? (
          <ArticleDetailPage
            article={selectedArticle}
            onBack={() => {
              goBack();
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        ) : selectedPhone ? (
          <PhoneDetailPage
            phone={phones.find((p) => p.id === selectedPhone.id) || selectedPhone}
            onBack={() => {
              goBack();
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        ) : (
          <>
            {/* VIEW: HOME */}
            {activeTab === 'home' && (
          <div className="space-y-7">
            <SeoMeta
              title={websiteContent?.seoTitle || websiteContent?.defaultSeoTitle || `${websiteContent?.siteName || 'GsmScope'} — ${websiteContent?.siteTagline || 'Global Phone Specs, Reviews and Prices'}`}
              description={websiteContent?.seoDescription || websiteContent?.defaultSeoDescription || 'Browse smartphone specifications with global USD and local prices, compare devices, read technology news and find the best phones for every budget.'}
              keywords={websiteContent?.seoKeywords || websiteContent?.defaultSeoKeywords || 'gsmscope, smartphone specs, phone prices, mobile phone reviews, buy phones'}
              siteName={websiteContent?.siteName || 'GsmScope'}
              image={phones[0]?.image}
              imageAlt={`${websiteContent?.siteName || 'GsmScope'} — Smartphone Specifications, Comparisons, Reviews & Global Prices`}
              canonicalPath="/"
            />
            {/* 1. Hero Carousel + Most Read Articles - Remains permanently dark as requested */}
            <HeroSection />

            {/* Ad Placement: Homepage — Above Latest phones section */}
            <AdPlacementSlot placementId="home_above_trending" />

            {/* 2. Latest Phones Section (Columns layout, images fit column size without padding) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Latest phones
                  </h2>
                </div>
                <button
                  onClick={() => {
                    triggerNavigation(() => {
                      resetFilters();
                      setSelectedPhone(null);
                      setSelectedArticle(null);
                      setActiveTab('phones');
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    });
                  }}
                  className="text-xs font-normal text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {(() => {
                  // Phones checked as Featured (isFeatured: true) appear in the Hero carousel and are excluded
                  // from Latest phones unless not checked while publishing or unchecked later.
                  // Newly added non-featured phones are always sorted newest-first at the top of Latest phones.
                  const newlyAddedNonFeatured = [
                    ...phones.filter((p) => !SEED_PHONE_IDS.has(p.id) && !p.isFeatured),
                  ].sort((a, b) => {
                    const tsB = getRecordTimestamp(b);
                    const tsA = getRecordTimestamp(a);
                    if (tsB && tsA && tsB !== tsA) return tsB - tsA;
                    return 0;
                  });
                  const seedNonFeatured = phones.filter(
                    (p) => SEED_PHONE_IDS.has(p.id) && !p.isFeatured
                  );
                  const latestPhonesToShow = [
                    ...newlyAddedNonFeatured,
                    ...seedNonFeatured,
                  ].slice(0, 8);
                  return latestPhonesToShow.map((phone) => {
                  const inComp = isInCompare(phone.id);
                  return (
                    <div
                      key={phone.id}
                      onClick={() => {
                        triggerNavigation(() => {
                          setSelectedPhone(phone);
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        });
                      }}
                      className="group p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition-all flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      {/* Thumbnail - Adjusted height, without rank badge */}
                      <div className="relative w-24 sm:w-[122px] h-[82px] sm:h-[95px] rounded-xl overflow-hidden shrink-0 bg-slate-950 p-0 border border-slate-200 dark:border-slate-800 shadow-inner">
                        {phone.image ? (
                          <img
                            src={phone.image}
                            alt={phone.name}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Smartphone className="w-8 h-8 text-slate-400 m-auto" />
                        )}
                      </div>

                      {/* Details in column */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-stretch gap-1.5">
                            <span className="site-badge inline-flex items-center text-[9px] font-mono font-semibold uppercase px-1.5 py-px rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                              {phone.brand}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (inComp) {
                                  removeFromCompare(phone.id);
                                } else {
                                  addToCompare(phone.id);
                                }
                              }}
                              title={inComp ? 'Remove from comparison' : 'Add to compare'}
                              aria-label={inComp ? 'Remove from comparison' : 'Add to compare'}
                              className={`px-1 py-px rounded flex items-center justify-center transition-colors cursor-pointer border ${
                                inComp
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                              }`}
                            >
                              <Scale className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs text-amber-500 font-mono font-semibold flex items-center gap-0.5">
                            ★ {phone.rating.toFixed(1)}
                          </span>
                        </div>

                        <h3 className="post-title font-bold text-slate-900 dark:text-white text-base sm:text-lg font-['Space_Grotesk'] leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {phone.name}
                        </h3>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-normal group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            <span>Full Specifications</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                });
                })()}
              </div>
            </section>

            {/* Ad Placement: Homepage — Above Latest Reviews section */}
            <AdPlacementSlot placementId="home_above_reviews" />

            {/* 3. Latest Reviews Section - Phone Review Posts (Editorial Hardware Reviews) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Latest Reviews
                  </h2>
                </div>
                <button
                  onClick={() => {
                    triggerNavigation(() => {
                      setSelectedPhone(null);
                      setSelectedArticle(null);
                      setActiveTab('reviews');
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    });
                  }}
                  className="text-xs font-normal text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>All reviews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Phone Review Posts */}
              {(() => {
                const phoneReviewArticles = articles.filter(
                  (a) =>
                    (a.category || '').toLowerCase().includes('review') ||
                    (a.title || '').toLowerCase().includes('review') ||
                    (a.tags || []).some((t) => t.toLowerCase().includes('review'))
                );
                // Show newly published custom review articles first (newest-first); among seed reviews, keep iPhone 16 Pro Max first
                const sortedReviewArticles = [...phoneReviewArticles].sort((a, b) => {
                  const isCustomA = !SEED_ARTICLE_IDS.has(a.id);
                  const isCustomB = !SEED_ARTICLE_IDS.has(b.id);
                  if (isCustomA && !isCustomB) return -1;
                  if (!isCustomA && isCustomB) return 1;
                  if (isCustomA && isCustomB) {
                    const tsB = getRecordTimestamp(b);
                    const tsA = getRecordTimestamp(a);
                    if (tsB && tsA && tsB !== tsA) return tsB - tsA;
                  }
                  if (a.id === 'art-iphone-16-pro-review') return -1;
                  if (b.id === 'art-iphone-16-pro-review') return 1;
                  return 0;
                });
                const displayReviewPosts = sortedReviewArticles.length >= 5 
                  ? sortedReviewArticles.slice(0, 5) 
                  : [...sortedReviewArticles, ...articles.filter(a => !sortedReviewArticles.some(pra => pra.id === a.id))].slice(0, 5);
                const leadReview = displayReviewPosts[0];
                const verticalListArticles = displayReviewPosts.slice(1, 5);

                if (!leadReview) return null;
                const relatedPhone = phones.find(p => leadReview.relatedPhoneIds?.includes(p.id));

                return (
                  <div className="space-y-4 sm:space-y-5">
                    {/* 1. Large Featured Review Article at the Top */}
                    <div 
                      onClick={() => {
                        triggerNavigation(() => {
                          setSelectedArticle(leadReview);
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        });
                      }}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col space-y-3.5"
                    >
                      {/* Top Landscape Cover Image */}
                      <div className="w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[2/1] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
                        <img
                          src={leadReview.coverImage || relatedPhone?.image}
                          alt={leadReview.title}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('hero_flagship_phones_1792578844852.jpg')) {
                              target.src = '/src/assets/images/hero_flagship_phones_1792578844852.jpg';
                            }
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Category Badge & Meta */}
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="site-badge text-[9px] font-mono font-semibold uppercase px-1.5 py-px rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                          {leadReview.category || 'REVIEWS'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {leadReview.date} · {leadReview.readTime}
                        </span>
                        {leadReview.author && (
                          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                            · by {leadReview.author.name}
                          </span>
                        )}
                      </div>

                      {/* Headline */}
                      <h3 className="post-title font-bold text-slate-900 dark:text-white text-lg sm:text-xl md:text-2xl font-['Space_Grotesk'] leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {leadReview.title}
                      </h3>
                    </div>

                    {/* 2. Vertical List of 4 Smaller Articles Underneath */}
                    {verticalListArticles.length > 0 && (
                      <div className="space-y-3 sm:space-y-3.5">
                        {verticalListArticles.map((post) => {
                          const postPhone = phones.find(p => post.relatedPhoneIds?.includes(p.id));
                          return (
                            <div
                              key={post.id}
                              onClick={() => {
                                triggerNavigation(() => {
                                  setSelectedArticle(post);
                                  window.scrollTo({ top: 0, behavior: 'instant' });
                                });
                              }}
                              className="group p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition-all flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md"
                            >
                              {/* Square / Squircle Thumbnail Image (Height reduced 15%) */}
                              <div className="relative w-24 sm:w-28 h-[82px] sm:h-[95px] rounded-xl overflow-hidden shrink-0 bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner">
                                <img
                                  src={post.coverImage || postPhone?.image}
                                  alt={post.title}
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    if (!target.src.includes('hero_flagship_phones_1792578844852.jpg')) {
                                      target.src = '/src/assets/images/hero_flagship_phones_1792578844852.jpg';
                                    }
                                  }}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              {/* Details in Column */}
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="site-badge text-[9px] font-mono font-semibold uppercase px-1.5 py-px rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                                    {post.category || 'REVIEWS'}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                    {post.date}
                                  </span>
                                </div>

                                <h4 className="post-title font-bold text-slate-900 dark:text-white text-base sm:text-lg font-['Space_Grotesk'] line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                                  {post.title}
                                </h4>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>

            {/* Latest News Section (Exact same design structure as Latest reviews) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Latest News
                  </h2>
                </div>
                <button
                  onClick={() => {
                    triggerNavigation(() => {
                      setSelectedPhone(null);
                      setSelectedArticle(null);
                      setActiveTab('news');
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    });
                  }}
                  className="text-xs font-normal text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>All news</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* News Posts (1 large featured card at top + 4 horizontal-card list underneath) */}
              {(() => {
                const newsArticles = [...articles.filter(
                  (a) => !a.category.toLowerCase().includes('review') && !a.title.toLowerCase().includes('review')
                )].sort((a, b) => {
                  const isCustomA = !SEED_ARTICLE_IDS.has(a.id);
                  const isCustomB = !SEED_ARTICLE_IDS.has(b.id);
                  if (isCustomA && !isCustomB) return -1;
                  if (!isCustomA && isCustomB) return 1;
                  if (isCustomA && isCustomB) {
                    const tsB = getRecordTimestamp(b);
                    const tsA = getRecordTimestamp(a);
                    if (tsB && tsA && tsB !== tsA) return tsB - tsA;
                  }
                  return 0;
                });
                const displayNewsPosts = newsArticles.length >= 5
                  ? newsArticles.slice(0, 5)
                  : articles.slice(0, 5);
                const leadNews = displayNewsPosts[0];
                const verticalListNews = displayNewsPosts.slice(1, 5);

                if (!leadNews) return null;
                const relatedPhone = phones.find(p => leadNews.relatedPhoneIds?.includes(p.id));

                return (
                  <div className="space-y-4 sm:space-y-5">
                    {/* 1. Large Featured News Article at the Top */}
                    <div 
                      onClick={() => {
                        triggerNavigation(() => {
                          setSelectedArticle(leadNews);
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        });
                      }}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col space-y-3.5"
                    >
                      {/* Top Landscape Cover Image */}
                      <div className="w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[2/1] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
                        <img
                          src={leadNews.coverImage || relatedPhone?.image}
                          alt={leadNews.title}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Category Badge & Meta */}
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="site-badge text-[9px] font-mono font-semibold uppercase px-1.5 py-px rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                          {leadNews.category || 'NEWS'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {leadNews.date} · {leadNews.readTime}
                        </span>
                        {leadNews.author && (
                          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                            · by {leadNews.author.name}
                          </span>
                        )}
                      </div>

                      {/* Headline */}
                      <h3 className="post-title font-bold text-slate-900 dark:text-white text-lg sm:text-xl md:text-2xl font-['Space_Grotesk'] leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {leadNews.title}
                      </h3>
                    </div>

                    {/* 2. Vertical List of 4 Smaller News Articles Underneath */}
                    {verticalListNews.length > 0 && (
                      <div className="space-y-3 sm:space-y-3.5">
                        {verticalListNews.map((post) => {
                          const postPhone = phones.find(p => post.relatedPhoneIds?.includes(p.id));
                          return (
                            <div
                              key={post.id}
                              onClick={() => {
                                triggerNavigation(() => {
                                  setSelectedArticle(post);
                                  window.scrollTo({ top: 0, behavior: 'instant' });
                                });
                              }}
                              className="group p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition-all flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md"
                            >
                              {/* Square / Squircle Thumbnail Image */}
                              <div className="relative w-24 sm:w-28 h-[82px] sm:h-[95px] rounded-xl overflow-hidden shrink-0 bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner">
                                <img
                                  src={post.coverImage || postPhone?.image}
                                  alt={post.title}
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              {/* Details in Column */}
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="site-badge text-[9px] font-mono font-semibold uppercase px-1.5 py-px rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                                    {post.category || 'NEWS'}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                    {post.date}
                                  </span>
                                </div>

                                <h4 className="post-title font-bold text-slate-900 dark:text-white text-base sm:text-lg font-['Space_Grotesk'] line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                                  {post.title}
                                </h4>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>

            {/* 4. Quick 2-Phone Comparison Banner ("Which phone is right for you?") */}
            <QuickCompareBanner />

            {/* Ad Placement: Homepage — Above Buying Guides section */}
            <AdPlacementSlot placementId="home_above_guides" />

            {/* 5. Buying Guides ("Find the best phone for you") */}
            <BestCategoriesSection />

            {/* 6. Phone Finder Tool ("Not sure what to buy?") */}
            <PhoneFinderSection />

            {/* 7. Popular Brands Strip */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Explore brands
                  </h2>
                </div>
                <button
                  onClick={() => {
                    triggerNavigation(() => {
                      setSelectedPhone(null);
                      setSelectedArticle(null);
                      setSelectedBrand(null);
                      setActiveTab('brands');
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    });
                  }}
                  className="text-xs font-normal text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>All brands</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {(() => {
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

                return (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-2.5">
                    {sortedBrands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          triggerNavigation(() => {
                            setSelectedPhone(null);
                            setSelectedArticle(null);
                            setSelectedBrand(b);
                            setActiveTab('brands');
                            window.scrollTo({ top: 0, behavior: 'instant' });
                          });
                        }}
                        className="p-2 sm:p-2.5 pb-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-[#061a11] transition-all flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer shadow-sm min-w-0"
                      >
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                          <BrandLogo name={b.name} logoUrl={b.logoUrl} className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate w-full text-center">
                          {b.name}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </section>
          </div>
        )}

        {/* VIEW: PHONES DATABASE */}
        {activeTab === 'phones' && (
          <div className="space-y-6">
            <SeoMeta
              title={
                filterState.categoryPreset
                  ? `${filterState.categoryPreset} — Smartphone Specs & Prices | GsmScope`
                  : filterState.searchQuery
                    ? `"${filterState.searchQuery}" Smartphone Specs & Prices | GsmScope`
                    : 'World Mobile Phone Database | GsmScope'
              }
              description="Explore the complete GsmScope smartphone database with full technical specifications, 5G bands, battery ratings, and live global prices."
              image={sortedPhones[0]?.image || phones[0]?.image}
              imageAlt={sortedPhones[0]?.name || 'GsmScope Smartphone Database'}
              canonicalPath="/?tab=phones"
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
                  World mobile phone database
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Every phone we track, with complete specifications and global prices in USD and local currencies. Filter by brand, budget, RAM, storage, camera, battery, or 5G connectivity.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                aria-expanded={mobileFilterOpen}
                aria-haspopup="dialog"
                className="lg:hidden px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-white flex items-center gap-2 cursor-pointer"
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
                resultCount={sortedPhones.length}
              />

              <div className="flex-1">
                {/* Search Bar & Quick Sort Toolbar */}
                <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search Bar Form with Predictive Search */}
                    <div className="relative flex-1">
                      <form onSubmit={handleDbSearchSubmit} className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                          <input
                            type="text"
                            value={filterState.searchQuery}
                            onFocus={() => setDbSearchPredictiveOpen(true)}
                            onChange={(e) => {
                              setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }));
                              setDbSearchPredictiveOpen(true);
                              setDbSearchPredictiveIndex(-1);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setDbSearchPredictiveOpen(true);
                                setDbSearchPredictiveIndex((prev) => (prev < 5 ? prev + 1 : 0));
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setDbSearchPredictiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
                              } else if (e.key === 'Escape') {
                                setDbSearchPredictiveOpen(false);
                              }
                            }}
                            placeholder="Search phones by model, brand, processor..."
                            aria-label="Search phones in database"
                            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs sm:text-sm transition-colors"
                          />
                          {filterState.searchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setFilterState((prev) => ({ ...prev, searchQuery: '' }));
                                setDbSearchPredictiveOpen(false);
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                              title="Clear search"
                              aria-label="Clear search"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={isDbSearching}
                          className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
                        >
                          {isDbSearching ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Search className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">{isDbSearching ? 'Searching...' : 'Search'}</span>
                        </button>
                      </form>

                      {/* Predictive Search Suggestions Dropdown */}
                      <PredictiveSearchDropdown
                        searchTerm={filterState.searchQuery}
                        isOpen={dbSearchPredictiveOpen}
                        onClose={() => setDbSearchPredictiveOpen(false)}
                        selectedIndex={dbSearchPredictiveIndex}
                        setSelectedIndex={setDbSearchPredictiveIndex}
                        onSelectPhone={(phone) => {
                          setSelectedArticle(null);
                          setSelectedBrand(null);
                          setSelectedPhone(phone);
                          setDbSearchPredictiveOpen(false);
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        onSubmitSearch={(query) => {
                          setFilterState((prev) => ({ ...prev, searchQuery: query }));
                          setDbSearchPredictiveOpen(false);
                        }}
                      />
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
                        <span className="site-badge inline-flex items-center gap-1 px-1.5 py-px rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[9px] font-mono">
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
                            triggerNavigation(() => {
                              setSelectedPhone(leadPhone);
                              window.scrollTo({ top: 0, behavior: 'instant' });
                            });
                          }}
                          className="group rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 hover:border-emerald-500 p-6 sm:p-8 flex flex-col gap-4 shadow-xl relative overflow-hidden cursor-pointer transition-all"
                        >
                          <div className="w-full space-y-4">
                            <div className="flex items-center gap-2">
                              <span className="site-badge text-[9px] font-mono uppercase tracking-wider font-bold text-white bg-emerald-600 px-1.5 py-px rounded">
                                Top Result
                              </span>
                              <span className="site-badge text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-px rounded">
                                {leadPhone.brand}
                              </span>
                            </div>

                            <h2 className="post-title text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {leadPhone.name}
                            </h2>

                            {/* Featured Phone Image Showcase below phone name (decorated like HeroSection) */}
                            <div className="w-full my-1.5 sm:my-2 flex items-center justify-center">
                              <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl h-54 sm:h-52 md:h-56 rounded-2xl overflow-hidden border border-emerald-500/25 bg-slate-950/80 shadow-2xl flex items-center justify-center group-hover:border-emerald-500/50 transition-all">
                                <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-xl group-hover:bg-emerald-500/25 transition-all pointer-events-none" />
                                <img
                                  src={leadPhone.image}
                                  alt={leadPhone.name}
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-fill rounded-2xl group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
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
                            <div className="flex items-center justify-center gap-3 pt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPhone(leadPhone);
                                  window.scrollTo({ top: 0, behavior: 'instant' });
                                }}
                                className="px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-normal flex items-center gap-1 shadow-md cursor-pointer whitespace-nowrap shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5 shrink-0" />
                                <span className="whitespace-nowrap">Full specs</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (inComp) removeFromCompare(leadPhone.id);
                                  else addToCompare(leadPhone.id);
                                }}
                                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-normal flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                  inComp 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                                }`}
                              >
                                <Scale className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span className="whitespace-nowrap">{inComp ? 'Comparing' : 'Compare'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Ad Placement: Phones Page — Below Top Result */}
                    <AdPlacementSlot placementId="phones_below_top_result" />

                    {/* 2. Rest Posts Beneath It */}
                    {sortedPhones.length > 1 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk']">
                            All Matching Phones ({sortedPhones.length - 1} more)
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

            {/* Phone Finder Tool ("Not sure what to buy?") */}
            <PhoneFinderSection />
          </div>
        )}

        {/* VIEW: BEST PHONES */}
        {activeTab === 'best-phones' && (
          <div className="space-y-8">
            <SeoMeta
              title="Best Phones & Buying Shortlists by Budget and Camera | GsmScope"
              description="Discover the highest-rated smartphones in the GsmScope database ranked by camera quality, battery endurance, gaming performance, and budget."
              image={phones.find((p) => p.rating >= 4.7)?.image || phones[0]?.image}
              imageAlt="Best Smartphones & Buying Guides on GsmScope"
              canonicalPath="/?tab=best-phones"
            />
            <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
                Best Phones &amp; Buying Guides
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Shortlists built from the GsmScope database and updated as new models and prices come in. Jump to the category that matches what you care about most.
              </p>
            </div>

            <BestCategoriesSection />

            {/* Ad Placement: Best Phones Page — Above Top Rated Phones */}
            <AdPlacementSlot placementId="best_above_top_rated" />

            {/* Highest Rated - One Big Grid Display + Rest Beneath It */}
            {(() => {
              const topRated = phones.filter(
                (p) =>
                  p.rating >= 4.5 ||
                  p.isFeatured ||
                  (p.categories || []).includes('flagship') ||
                  (p.categories || []).includes('top-rated')
              );
              if (topRated.length === 0) return null;
              const leadTop = topRated[0];
              const restTop = topRated.slice(1);
              return (
                <div className="space-y-6 pt-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Top Rated Phones
                  </h2>

                  {/* One Big Grid Display */}
                  <div
                    onClick={() => {
                      setSelectedPhone(leadTop);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 hover:border-emerald-500 flex flex-col gap-4 cursor-pointer group shadow-xl transition-all"
                  >
                    <div className="space-y-4 w-full">
                      <div className="flex items-center gap-2">
                        <span className="site-badge text-[9px] font-mono uppercase tracking-wider font-bold text-white bg-emerald-600 px-1.5 py-px rounded">
                          Top Rated
                        </span>
                        <span className="text-xs text-amber-500 dark:text-amber-400 font-mono font-bold ml-auto flex items-center gap-1">
                          {leadTop.rating > 0 ? `★ ${leadTop.rating.toFixed(1)}` : '★ Featured'}
                        </span>
                      </div>
                      <h3 className="post-title text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {leadTop.name}
                      </h3>

                      {/* Featured Phone Image Showcase below phone name (decorated like HeroSection) */}
                      <div className="w-full my-1.5 sm:my-2 flex items-center justify-center">
                        <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl h-54 sm:h-52 md:h-56 rounded-2xl overflow-hidden border border-emerald-500/25 bg-slate-950/80 shadow-2xl flex items-center justify-center group-hover:border-emerald-500/50 transition-all">
                          <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-xl group-hover:bg-emerald-500/25 transition-all pointer-events-none" />
                          <img
                            src={leadTop.image}
                            alt={leadTop.name}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-fill rounded-2xl group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {leadTop.keyHighlights.display} · {leadTop.keyHighlights.processor} · {leadTop.keyHighlights.battery}
                      </p>
                      <div className="pt-2">
                        <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>View device specifications</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
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

        {/* VIEW: REVIEWS (Review Articles Archive) */}
        {activeTab === 'reviews' && <ReviewArticlesView />}

        {/* VIEW: USER REVIEWS */}
        {activeTab === 'user-reviews' && <ReviewsView />}

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

        {/* VIEW: PRIVACY POLICY */}
        {activeTab === 'privacy' && <PrivacyPolicyView />}

        {/* VIEW: TERMS OF SERVICE */}
        {activeTab === 'terms' && <TermsOfServiceView />}
          </>
        )}
      </main>

      {/* Floating Bottom Quick-Compare Bar */}
      {compareList.length > 0 && activeTab !== 'compare' && (
        <aside aria-label="Comparison quick dock" className="fixed bottom-4 right-4 z-30">
          <div className="flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-2xl border border-emerald-400/40 transition-transform hover:scale-105">
            <button
              onClick={() => {
                setSelectedPhone(null);
                setSelectedArticle(null);
                setActiveTab('compare');
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Compare Selected ({compareList.length})</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearCompare(true);
              }}
              className="p-1.5 rounded-full hover:bg-black/25 text-white transition-colors cursor-pointer ml-1"
              title="Clear selection"
              aria-label="Clear compare selection"
            >
              <X className="w-4.5 h-4.5 stroke-[2.2]" />
            </button>
          </div>
        </aside>
      )}

      {/* Footer with GsmScope columns and newsletter */}
      <Footer />

      {/* Bottom Privacy Notice */}
      <PrivacyNotice />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ErrorBoundary>
  );
}
