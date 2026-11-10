import React, { useState, useEffect, useRef } from 'react';
import { Phone } from '../../types';
import { useApp } from '../../context/AppContext';
import { useSeoMeta } from '../seo/SeoMeta';
import SocialShareBar from '../common/SocialShareBar';
import ScrollProgressBar from '../common/ScrollProgressBar';
import FormattedContent from '../common/FormattedContent';
import { 
  Scale, 
  Check, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Plus, 
  MessageSquare, 
  Smartphone, 
  Cpu, 
  Camera, 
  Battery, 
  Wifi, 
  Radio, 
  Layers, 
  Zap, 
  Eye, 
  TrendingUp, 
  Tag, 
  ArrowRight, 
  ChevronLeft,
  ChevronRight, 
  ExternalLink, 
  Flame,
  Volume2,
  Lock,
  Sliders,
  Newspaper,
  Loader2,
  AlertTriangle
} from 'lucide-react';

function getFeaturesSensors(phone: Phone, defaultSensors?: string): string {
  const name = phone.name.toLowerCase();
  const brand = phone.brand.toLowerCase();
  if (brand === 'apple' || name.includes('iphone')) {
    return 'Face ID, accelerometer, gyro, proximity, compass, barometer, Ultra Wideband (UWB) support, Emergency SOS via satellite';
  }
  if (brand === 'samsung') {
    if (name.includes('s24') || name.includes('s23') || name.includes('s22') || name.includes('ultra')) {
      return 'Fingerprint (under display, ultrasonic), accelerometer, gyro, proximity, compass, barometer';
    }
    if (name.includes('a54') || name.includes('a55') || name.includes('a34') || name.includes('a35') || name.includes('a53')) {
      return 'Fingerprint (under display, optical), accelerometer, gyro, proximity, compass';
    }
    return 'Fingerprint (side-mounted), accelerometer, proximity, compass';
  }
  if (brand === 'google' || name.includes('pixel')) {
    return 'Fingerprint (under display, optical/ultrasonic), accelerometer, gyro, proximity, compass, barometer';
  }
  if (defaultSensors && defaultSensors.length > 5) {
    return defaultSensors;
  }
  return 'Fingerprint (under display, optical), accelerometer, gyro, proximity, compass, barometer';
}

function getDeviceModelNumber(phone: Phone): string {
  if (phone.modelNumber) return phone.modelNumber;
  const name = phone.name.toLowerCase();
  if (name.includes('iphone 16 pro max')) return 'A3296, A3084';
  if (name.includes('iphone 16 pro')) return 'A3293, A3082';
  if (name.includes('iphone 16')) return 'A3287, A3081';
  if (name.includes('iphone 15 pro max')) return 'A3106, A2849';
  if (name.includes('iphone 15')) return 'A3090, A2846';
  if (name.includes('galaxy s24 ultra')) return 'SM-S928B, SM-S928B/DS';
  if (name.includes('galaxy s24')) return 'SM-S921B, SM-S921B/DS';
  if (name.includes('galaxy a12')) return 'SM-A125F, SM-A125M';
  if (name.includes('galaxy a')) {
    const num = name.match(/a(\d+)/i)?.[1] || '54';
    return `SM-A${num}6B`;
  }
  if (name.includes('redmi note 13 pro')) return '2312DRA50G, 2312CRAD3C';
  if (name.includes('redmi 13c')) return '23100RN82L, 23108RN04Y';
  if (name.includes('pixel 8 pro')) return 'GC3VE, G1MNW';
  if (name.includes('pixel 8')) return 'GKWS6, G9BQD';
  if (name.includes('pixel 9 pro')) return 'GEC77, GUR25';
  if (name.includes('oneplus 12r')) return 'CPH2609, CPH2611';
  if (name.includes('oneplus 12')) return 'CPH2573, CPH2581';
  if (name.includes('camon 30 pro')) return 'CL8, CL8n';
  if (name.includes('camon 30')) return 'CL6, CL6n';
  if (name.includes('smart 20') || name.includes('smart 8')) return 'X6525, X6525B';
  if (name.includes('g5 mecha')) return 'G5M-2309';
  
  if (phone.brand.toLowerCase() === 'samsung') {
    const letters = phone.name.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
    return `SM-${letters}`;
  }
  if (phone.brand.toLowerCase() === 'apple') {
    return `A${(phone.releaseYear % 100) + 10}84`;
  }
  return `${phone.brand.slice(0, 2).toUpperCase()}-${phone.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase()}`;
}

interface PhoneDetailPageProps {
  phone: Phone;
  onBack: () => void;
}

export default function PhoneDetailPage({ phone, onBack }: PhoneDetailPageProps) {
  const { 
    phones,
    brands,
    articles,
    setSelectedPhone,
    setSelectedArticle,
    setSelectedBrand,
    formatNaira, 
    formatUSD,
    currency,
    addToCompare, 
    removeFromCompare, 
    isInCompare, 
    reviews, 
    addReview,
    setActiveTab,
    setFilterState,
    resetFilters,
    recordPhoneView,
    triggerNavigation,
    startGlobalLoading,
    stopGlobalLoading,
    showGlobalToast
  } = useApp();

  const [activeSection, setActiveSection] = useState<'specs' | 'reviews'>('specs');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewLocation, setReviewLocation] = useState('Lagos, Nigeria');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPros, setReviewPros] = useState('');
  const [reviewCons, setReviewCons] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [phone.id, phone.image]);

  // Scroll to top and record real user view
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    recordPhoneView(phone.id);
  }, [phone.id]);

  // Dynamic SEO, OpenGraph image, and X/Twitter card metadata for this phone
  useSeoMeta({
    title: phone.seoTitle || `${phone.name} — Full Specs, Global Price & Review | GsmScope`,
    description: phone.seoDescription || `${phone.name} (${phone.releaseYear}) full specifications: ${phone.keyHighlights.display}, ${phone.keyHighlights.processor}, ${phone.keyHighlights.camera}, ${phone.keyHighlights.battery}. Global price: $${phone.priceUSD} / ₦${phone.priceNGN.toLocaleString()}.`,
    keywords: phone.seoKeywords || `${phone.name}, ${phone.brand}, ${phone.name} specs, ${phone.name} price, ${phone.keyHighlights.processor}, smartphone review`,
    image: phone.image,
    imageAlt: `${phone.name} official device photo and full specifications`,
    type: 'product',
    canonicalPath: `/?phone=${encodeURIComponent((phone as any).slug || phone.id)}`,
  });

  const inCompare = isInCompare(phone.id);
  const phoneReviews = reviews.filter(
    (r) => r.phoneId === phone.id && r.status === 'approved'
  );
  const realRating = phoneReviews.length > 0
    ? (phoneReviews.reduce((sum, r) => sum + r.rating, 0) / phoneReviews.length).toFixed(1)
    : (phone.rating > 0 ? phone.rating.toFixed(1) : '0.0');

  const handleSwitchPhone = (newPhone: Phone) => {
    triggerNavigation(() => {
      setSelectedPhone(newPhone);
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      showGlobalToast('Please fill in all required review fields', 'error');
      return;
    }
    if (isSubmittingReview) return; // Prevent duplicate submissions

    setIsSubmittingReview(true);
    startGlobalLoading('Submitting review');

    try {
      await Promise.resolve(addReview({
        phoneId: phone.id,
        phoneName: phone.name,
        userName: reviewName.trim(),
        location: '',
        rating: reviewRating,
        title: '',
        comment: reviewComment.trim(),
        pros: [],
        cons: []
      }));

      setReviewSubmitted(true);
      showGlobalToast('Review submitted successfully!', 'success');
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSubmitted(false);
        setReviewComment('');
      }, 2000);
    } catch (err) {
      console.warn('Failed to submit review:', err);
      showGlobalToast('Could not submit review. Please try again.', 'error');
    } finally {
      setIsSubmittingReview(false);
      stopGlobalLoading();
    }
  };

  // Review article specifically for the current phone model
  const phoneReviewArticle = articles.find((a) => {
    const isReview =
      a.category.toLowerCase().includes('review') ||
      /\breview\b/i.test(a.title);
    if (!isReview) return false;

    const titleLower = a.title.toLowerCase().trim();
    const phoneNameLower = phone.name.toLowerCase().trim();
    const brandLower = phone.brand.toLowerCase().trim();
    const fullBrandAndModel = phoneNameLower.startsWith(brandLower + ' ')
      ? phoneNameLower
      : `${brandLower} ${phoneNameLower}`.trim();
    const modelWithoutBrand = phoneNameLower.startsWith(brandLower + ' ')
      ? phoneNameLower.slice(brandLower.length + 1).trim()
      : phoneNameLower;

    // Extract the device subject before "review" or subtitle punctuation
    const subjectBeforeReview = titleLower
      .split(/[:\-–—]|\bin-depth review\b|\bhands-on review\b|\breview\b/i)[0]
      .trim();

    const exactTitleSubjectMatch =
      Boolean(subjectBeforeReview) &&
      (subjectBeforeReview === phoneNameLower ||
        subjectBeforeReview === fullBrandAndModel ||
        (modelWithoutBrand.length >= 5 && subjectBeforeReview === modelWithoutBrand));

    const explicitlyLinkedToModel =
      Array.isArray(a.relatedPhoneIds) &&
      a.relatedPhoneIds.includes(phone.id) &&
      (exactTitleSubjectMatch || a.relatedPhoneIds.length === 1);

    return explicitlyLinkedToModel || exactTitleSubjectMatch;
  });

  const handleOpenPhoneReview = () => {
    if (!phoneReviewArticle) return;
    triggerNavigation(() => {
      setSelectedPhone(null);
      setActiveTab('reviews');
      setSelectedArticle({
        ...phoneReviewArticle,
        category: 'Reviews',
        relatedPhoneIds: [
          phone.id,
          ...(phoneReviewArticle.relatedPhoneIds || []).filter((id) => id !== phone.id),
        ],
      });
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  };

  const specs = phone.detailedSpecs;

  // SIDEBAR DATA 1: Recent phones from same brand
  const sameBrandPhones = phones
    .filter((p) => p.brand.toLowerCase() === phone.brand.toLowerCase() && p.id !== phone.id)
    .sort((a, b) => b.releaseYear - a.releaseYear)
    .slice(0, 5);

  // SIDEBAR DATA 2: Popular phones based on views number
  const popularPhonesByViews = [...phones]
    .filter((p) => p.id !== phone.id)
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
    .slice(0, 5);

  // SIDEBAR DATA 3: Direct competitors (same price category or similar specs)
  const rivalPhones = phones
    .filter((p) => p.id !== phone.id && p.brand !== phone.brand)
    .filter((p) => Math.abs(p.priceNGN - phone.priceNGN) < 250000 || p.categories.some(c => phone.categories.includes(c)))
    .slice(0, 3);

  // SIDEBAR DATA 4: In the news slider (strictly only articles about the current phone or its brand)
  const newsSliderRef = useRef<HTMLDivElement>(null);
  const displayNews = articles.filter((a) => {
    const brandLower = phone.brand.toLowerCase();
    const phoneNameLower = phone.name.toLowerCase();
    const titleLower = a.title.toLowerCase();
    const summaryLower = a.summary.toLowerCase();
    const tagsLower = a.tags ? a.tags.map(t => t.toLowerCase()) : [];
    
    // Check if article directly references the current phone or its brand
    const matchesBrand = (
      titleLower.includes(brandLower) ||
      summaryLower.includes(brandLower) ||
      tagsLower.some(t => t.includes(brandLower)) ||
      (a.relatedPhoneIds && a.relatedPhoneIds.some(pid => {
        const related = phones.find(p => p.id === pid);
        return pid.toLowerCase().includes(brandLower) || pid === phone.id || related?.brand.toLowerCase() === brandLower;
      }))
    );

    const matchesPhone = (
      titleLower.includes(phoneNameLower) ||
      (a.relatedPhoneIds && a.relatedPhoneIds.includes(phone.id))
    );

    return matchesBrand || matchesPhone;
  });

  const scrollNewsSlider = (direction: 'left' | 'right') => {
    if (newsSliderRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      newsSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div ref={contentRef} className="space-y-8 animate-fadeIn pb-12">
      <ScrollProgressBar targetRef={contentRef} />
      {/* 2. Phone Overview Hero Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Product Media Area - fills radius frame */}
          <div className="md:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative group aspect-[4/3] sm:aspect-square bg-slate-950 flex items-center justify-center p-0">
            {phone.image && !imgError ? (
              <img
                src={phone.image}
                alt={phone.name}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 bg-slate-900/90">
                <Smartphone className="w-16 h-16 mb-2 text-emerald-500/60" />
                <span className="text-xs font-bold text-slate-200">{phone.name}</span>
                <span className="text-[10px] font-mono text-emerald-400/80 uppercase mt-0.5">{phone.brand}</span>
              </div>
            )}
          </div>

          {/* Essential Info */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerNavigation(() => {
                      const matched = brands.find(
                        (b) => b.name.toLowerCase() === phone.brand.toLowerCase() || b.slug.toLowerCase() === phone.brand.toLowerCase()
                      );
                      setSelectedPhone(null);
                      setSelectedArticle(null);
                      if (matched) {
                        setSelectedBrand(matched);
                        setActiveTab('brands');
                      } else {
                        resetFilters();
                        setFilterState((prev) => ({ ...prev, selectedBrands: [phone.brand] }));
                        setActiveTab('phones');
                      }
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    });
                  }}
                  className="font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {phone.brand}
                </button>
                <span>·</span>
                <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{(phone.viewsCount || 0).toLocaleString()} {phone.viewsCount === 1 ? 'view' : 'views'}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
                {phone.name}
              </h1>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.round(Number(realRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {realRating} / 5.0
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('reviews');
                    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline cursor-pointer"
                >
                  ({phoneReviews.length} {phoneReviews.length === 1 ? 'verified rating' : 'verified ratings'})
                </button>
              </div>

              {/* At-a-glance Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-mono uppercase mb-0.5">DISPLAY</span>
                  <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{phone.keyHighlights.display}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-mono uppercase mb-0.5">CHIPSET</span>
                  <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{phone.keyHighlights.processor}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-mono uppercase mb-0.5">CAMERA</span>
                  <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{phone.keyHighlights.camera}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-mono uppercase mb-0.5">BATTERY</span>
                  <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{phone.keyHighlights.battery} ({phone.keyHighlights.charging})</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  triggerNavigation(() => {
                    addToCompare(phone.id);
                    setSelectedPhone(null);
                    setSelectedArticle(null);
                    setActiveTab('compare');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  });
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-normal flex items-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <Scale className="w-4 h-4" />
                <span>Compare</span>
              </button>
              
              <button
                onClick={() => {
                  triggerNavigation(() => {
                    setSelectedPhone(null);
                    setSelectedArticle(null);
                    resetFilters();
                    setFilterState(prev => ({ ...prev, selectedBrands: [phone.brand] }));
                    setActiveTab('phones');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  });
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-normal flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>More phones</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Content Columns: Specs Sheet (8 cols) + Sidebars (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (8 cols): Full Specification Breakdown & Reviews */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Review Card right above Specifications & Reviews */}
          {phoneReviewArticle ? (
            <div
              onClick={handleOpenPhoneReview}
              className="group -mt-2 flex items-center justify-between px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                {/* Thumbnail filling its radius frame */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-800 bg-slate-950 p-0 relative">
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
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Title only without date, badge or subtitle */}
                <div className="min-w-0">
                  <h3 className="post-title font-bold text-slate-900 dark:text-white text-[14px] sm:text-[15px] leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {phone.name.toLowerCase().endsWith('review') ? phone.name : `${phone.name} Review`}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-normal text-emerald-600 dark:text-emerald-400 shrink-0 ml-2.5 group-hover:translate-x-1 transition-transform">
                <span className="hidden sm:inline">Read review</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            <div className="-mt-2 flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                No review for this phone
              </span>
            </div>
          )}

          {/* Navigation Pill Tabs */}
          <div id="specs-tabs" className="-mt-[10px] flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveSection('specs');
                document.getElementById('specs-tabs')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`py-3 px-5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'specs'
                  ? 'border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Specifications</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('reviews');
                document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`py-3 px-5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'reviews'
                  ? 'border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Reviews ({phoneReviews.length})</span>
            </button>
          </div>

          <div className="space-y-6 text-xs">
              {/* 1. GENERAL */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>GENERAL</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Release</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-semibold">{phone.releaseDate}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Model</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-mono font-semibold">
                      {phone.modelNumber || getDeviceModelNumber(phone)}
                    </span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Status</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-semibold">
                      {phone.marketStatus?.toLowerCase().includes('discontinued') ? 'Discontinued' : 'Available'}
                    </span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Price</span>
                    <span className="col-span-8 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      {formatUSD(phone.priceUSD)} / {formatNaira(phone.priceNGN)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. DESIGN */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>DESIGN</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Dimensions</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-medium">{specs.body.dimensions}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Weight</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-medium">{specs.body.weight}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Build</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.body.build}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Water Resistance</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.body.waterResistance}</span>
                  </div>
                </div>
              </div>

              {/* 3. DISPLAY */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>DISPLAY</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Type</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.display.type}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Size</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.display.size}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Resolution</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.display.resolution}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Protection</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.display.protection}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Peak Brightness</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.display.brightness}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Refresh Rate</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.display.refreshRate}</span>
                  </div>
                </div>
              </div>

              {/* 4. CAMERA */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>CAMERA</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Main Camera Setup</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-semibold leading-relaxed">{specs.mainCamera.setup}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Features</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.mainCamera.features}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Video Capabilities</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-mono">{specs.mainCamera.video}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Front Selfie Camera</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 leading-relaxed">{specs.selfieCamera.setup}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Selfie Video</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-mono">{specs.selfieCamera.video}</span>
                  </div>
                </div>
              </div>

              {/* 5. BATTERY */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Battery className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>BATTERY</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Battery Capacity</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-bold">{specs.battery.capacity}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Wired Charging</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.battery.charging}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Wireless Charging</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.battery.wirelessCharging}</span>
                  </div>
                </div>
              </div>

              {/* 6. MEMORY */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>MEMORY</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">RAM Options</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-semibold">
                      {Array.isArray(specs.memory?.ramVariants) && specs.memory.ramVariants.length > 0
                        ? specs.memory.ramVariants.join(', ')
                        : phone.keyHighlights.ram}
                    </span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Storage Options</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">
                      {Array.isArray(specs.memory?.storageVariants) && specs.memory.storageVariants.length > 0
                        ? `${specs.memory.storageVariants.join(', ')}${specs.memory.storageType ? ` (${specs.memory.storageType})` : ''}`
                        : phone.keyHighlights.storage}
                    </span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">MicroSD Expansion</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.memory?.cardSlot || 'No'}</span>
                  </div>
                </div>
              </div>

              {/* 7. PLATFORM */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>PLATFORM</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Operating System</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.platform.os}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Chipset</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-bold">{specs.platform.chipset}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">CPU</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.platform.cpu}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">GPU</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.platform.gpu}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <span className="col-span-4 text-emerald-700 dark:text-emerald-400 font-semibold">AnTuTu Score (v10)</span>
                    <span className="col-span-8 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{specs.platform.antutuScore || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* 8. SECURITY */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>SECURITY</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Biometrics</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-semibold">
                      {specs.biometrics || (
                        specs.sensors?.toLowerCase().includes('face id')
                          ? 'Face ID (3D facial structured recognition)'
                          : specs.sensors?.toLowerCase().includes('fingerprint')
                          ? (specs.sensors?.toLowerCase().includes('under display')
                            ? 'Fingerprint (under display, optical/ultrasonic)'
                            : 'Fingerprint (side-mounted / capacitive)')
                          : 'Biometric Screen Authentication'
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Sensors</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 leading-relaxed">{specs.sensors}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Security Hardware</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">
                      {specs.securityHardware || (
                        phone.brand.toLowerCase() === 'apple'
                          ? 'Apple Secure Enclave, Face ID TrueDepth'
                          : phone.brand.toLowerCase() === 'google'
                          ? 'Titan M2 security coprocessor'
                          : phone.brand.toLowerCase() === 'samsung'
                          ? 'Samsung Knox Vault, EAL5+ certified'
                          : 'Hardware-backed Keystore & ARM TrustZone TEE'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* 9. NETWORK */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>NETWORK</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Technology</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.network.technology}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">5G Bands</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-semibold">{specs.network.bands5g}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Speed</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.network.speed}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">SIM Configuration</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.network.sim}</span>
                  </div>
                </div>
              </div>

              {/* 10. CONNECTIVITY */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>CONNECTIVITY</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">WLAN</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.connectivity?.wlan || 'Wi-Fi 802.11 a/b/g/n/ac/6, dual-band, Wi-Fi Direct'}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Bluetooth</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.connectivity?.bluetooth || '5.3, A2DP, LE'}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">NFC</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.connectivity?.nfc || 'Yes (market/region dependent)'}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">USB</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.connectivity?.usb || 'USB Type-C 2.0, OTG'}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Infrared port</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">
                      {specs.connectivity?.infrared || (phone.brand.toLowerCase() === 'xiaomi' || phone.brand.toLowerCase() === 'tecno' ? 'Yes' : 'No')}
                    </span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Positioning</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">
                      {specs.connectivity?.positioning || 'GPS (L1+L5), GLONASS, BDS, GALILEO, QZSS, NavIC'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 11. MULTIMEDIA */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>MULTIMEDIA</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Loudspeaker</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.sound?.loudspeaker || 'Yes, with stereo speakers'}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">3.5mm Headphone Jack</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.sound?.jack35mm || 'No'}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">FM Radio</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.connectivity?.radio || 'No'}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Audio Specs</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">
                      {specs.sound?.audioSpecs || '24-bit/192kHz Hi-Res audio, Dolby Atmos support'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 12. FEATURES */}
              <div className="!mb-0 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>FEATURES</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Sensors</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 leading-relaxed">
                      {specs.sensors || getFeaturesSensors(phone, specs.sensors)}
                    </span>
                  </div>
                </div>
              </div>

              {/* SOCIAL MEDIA SHARING ROW ABOVE REVIEW CARD */}
              <div className="!mt-[25px]">
                <SocialShareBar
                  title={`${phone.name} Full Specifications, Review & Price — GsmScope`}
                  path={`/?phone=${encodeURIComponent(((phone as any).slug || phone.id))}`}
                />
              </div>

              {/* REVIEWS SECTION AT THE BOTTOM OF TABLES */}
              <div id="reviews-section" className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                        {realRating}
                      </span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(realRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      Based on {phoneReviews.length} {phoneReviews.length === 1 ? 'verified rating' : 'verified ratings'}
                    </p>
                  </div>

                  {/* Button showing total number of reviews & Post review button right beside */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        {showAllReviews
                          ? 'Show fewer (3)'
                          : `All reviews (${phoneReviews.length})`}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setShowReviewForm(!showReviewForm);
                        if (!showReviewForm) {
                          setTimeout(() => {
                            document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
                          }, 50);
                        }
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Post review</span>
                    </button>
                  </div>
                </div>

                {/* Review Submission Form */}
                {showReviewForm && (
                  <form id="review-form" onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk']">Submit Your Hands-on Review</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Share real experience with daily battery endurance, camera quality, system speed, and build quality.
                    </p>

                    {reviewSubmitted ? (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 rounded-xl text-emerald-700 dark:text-emerald-300 font-semibold text-center">
                        Thank you! Your review has been submitted for moderation.
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Your Full Name</label>
                            <input
                              type="text"
                              required
                              value={reviewName}
                              onChange={(e) => setReviewName(e.target.value)}
                              placeholder="e.g. Alex Morgan"
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-emerald-500 outline-none text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Rating</label>
                            <select
                              value={reviewRating}
                              onChange={(e) => setReviewRating(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-emerald-500 outline-none text-xs"
                            >
                              <option value={5}>5 Stars - Outstanding</option>
                              <option value={4}>4 Stars - Very Good</option>
                              <option value={3}>3 Stars - Decent</option>
                              <option value={2}>2 Stars - Subpar</option>
                              <option value={1}>1 Star - Not Recommended</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">Your Detailed Experience</label>
                          <textarea
                            rows={4}
                            required
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="How does it hold up in daily usage? Share your hands-on experience..."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-emerald-500 outline-none text-xs leading-relaxed"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            disabled={isSubmittingReview}
                            onClick={() => setShowReviewForm(false)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {isSubmittingReview ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <span>Submit Review</span>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                )}

                {/* Reviews List: Showing only 3 reviews or all reviews when clicked */}
                <div className="space-y-3">
                  {phoneReviews.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto opacity-40 text-emerald-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-200">No reviews for {phone.name}</p>
                      <p className="text-[11px]">Best the first to share your verdict!</p>
                    </div>
                  ) : (
                    (showAllReviews ? phoneReviews : phoneReviews.slice(0, 3)).map((rev) => (
                      <div key={rev.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">{rev.userName}</span>
                          <span className="text-[11px] text-slate-400">{rev.date}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, idx) => (
                              <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                        <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          <FormattedContent content={rev.comment} compact />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Additional bottom buttons if there are more than 3 reviews */}
                {phoneReviews.length > 3 && (
                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        {showAllReviews
                          ? 'Show fewer reviews (3)'
                          : `All reviews (${phoneReviews.length})`}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setShowReviewForm(true);
                        setTimeout(() => {
                          document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Post review</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
        </div>

        {/* RIGHT COLUMN (4 cols): USEFUL & IMPORTANT SIDEBARS */}
        <aside aria-label="Device sidebars" className="lg:col-span-4 space-y-6">
          
          {/* SIDEBAR WIDGET 1: Recent Phones from Same Brand */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-[19px] font-['Space_Grotesk'] flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Recent phones</span>
              </h3>
              <button
                onClick={() => {
                  triggerNavigation(() => {
                    setSelectedPhone(null);
                    setSelectedArticle(null);
                    resetFilters();
                    setFilterState(prev => ({ ...prev, selectedBrands: [phone.brand] }));
                    setActiveTab('phones');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  });
                }}
                className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                View all →
              </button>
            </div>

            {sameBrandPhones.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">No other models tracked yet for {phone.brand}.</p>
            ) : (
              <div className="space-y-3">
                {sameBrandPhones.map((sbPhone) => (
                  <div
                    key={sbPhone.id}
                    onClick={() => handleSwitchPhone(sbPhone)}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/80"
                  >
                    <div className="w-[68px] h-[63px] rounded-xl overflow-hidden shrink-0 bg-slate-950 p-0 border border-slate-200 dark:border-slate-800">
                      <img
                        src={sbPhone.image}
                        alt={sbPhone.name}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="post-title font-bold text-slate-900 dark:text-white text-[14px] sm:text-[15px] leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {sbPhone.name}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR WIDGET: In the news (Brand-specific slider directly under Recent phones) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-[19px] font-['Space_Grotesk']">
                  In the news
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollNewsSlider('left')}
                  aria-label="Scroll news left"
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollNewsSlider('right')}
                  aria-label="Scroll news right"
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal News Slider - matching user reference image */}
            {displayNews.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
                No recent news updates currently logged for {phone.brand}.
              </p>
            ) : (
              <div
                ref={newsSliderRef}
                className="flex gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-1 -mx-1 px-1"
              >
                {displayNews.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => {
                      triggerNavigation(() => {
                        setSelectedPhone(null);
                        setSelectedArticle(art);
                        setActiveTab('news');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      });
                    }}
                    className="w-[120px] shrink-0 snap-start cursor-pointer group flex flex-col"
                  >
                    {/* Thumbnail Image set to h-100px / w-120px */}
                    <div className="w-[120px] h-[100px] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 relative">
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* News badge with date next to it like under Latest reviews */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 mb-1">
                      <span className="site-badge text-[9px] font-mono font-semibold uppercase px-1.5 py-px rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shrink-0">
                        {art.category || 'NEWS'}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {art.date}
                      </span>
                    </div>

                    {/* Bold title below badge and date */}
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-3 transition-colors">
                      {art.title}
                    </h4>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR WIDGET 2: Popular Phones Based on Views Number */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-[19px] font-['Space_Grotesk'] flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Most viewed</span>
              </h3>
              <span className="site-badge text-[9px] font-mono uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-1.5 py-px rounded font-semibold">
                Trending
              </span>
            </div>

            <div className="space-y-3">
              {popularPhonesByViews.map((popPhone, idx) => (
                <div
                  key={popPhone.id}
                  onClick={() => handleSwitchPhone(popPhone)}
                  className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/80"
                >
                  <span className={`w-5 font-mono text-xs font-extrabold text-center ${
                    idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : 'text-slate-300 dark:text-slate-600'
                  }`}>
                    0{idx + 1}
                  </span>
                  
                  <div className="w-[68px] h-[63px] rounded-xl overflow-hidden shrink-0 bg-slate-950 p-0 border border-slate-200 dark:border-slate-800">
                    <img
                      src={popPhone.image}
                      alt={popPhone.name}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="post-title font-bold text-slate-900 dark:text-white text-[14px] sm:text-[15px] leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {popPhone.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 pt-0.5">
                        {(popPhone.viewsCount || 0).toLocaleString()} {popPhone.viewsCount === 1 ? 'view' : 'views'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {popPhone.brand} · ★ {popPhone.rating.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR WIDGET 3: Direct Rival Comparisons */}
          {rivalPhones.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-[19px] font-['Space_Grotesk'] flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Competitors</span>
                </h3>
              </div>

              <div className="space-y-3">
                {rivalPhones.map((rival) => (
                  <div
                    key={rival.id}
                    onClick={() => handleSwitchPhone(rival)}
                    className="group p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-[68px] h-[63px] rounded-xl overflow-hidden shrink-0 bg-slate-950 p-0 border border-slate-200 dark:border-slate-800">
                        <img
                          src={rival.image}
                          alt={rival.name}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="post-title font-bold text-slate-900 dark:text-white text-[14px] sm:text-[15px] leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {rival.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {rival.brand} · ★ {rival.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerNavigation(() => {
                          addToCompare(phone.id);
                          addToCompare(rival.id);
                          setSelectedPhone(null);
                          setSelectedArticle(null);
                          setActiveTab('compare');
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        });
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-normal shrink-0 cursor-pointer shadow-sm"
                    >
                      VS Compare
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIDEBAR WIDGET 4: Global Retailer Guarantee */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 dark:from-[#061a11] dark:via-slate-900 dark:to-[#04120a] border border-emerald-200 dark:border-emerald-950 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs uppercase font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Global Retailer Guarantee</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Always inspect phone packaging for official manufacturer warranty seals and verified IMEI status before checkout.
            </p>
            <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 font-mono">
              <div>✓ Official IMEI Registration</div>
              <div>✓ 12-24 Months Warranty</div>
              <div>✓ Authorized Service Center Support</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
