import { useState, useEffect } from 'react';
import { useApp, SEED_PHONE_IDS } from '../../context/AppContext';
import { ArrowRight, Scale, Eye, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const { 
    phones, 
    articles, 
    setSelectedPhone, 
    setSelectedArticle,
    addToCompare, 
    setActiveTab, 
    formatPrice,
    formatNaira,
    formatUSD
  } = useApp();

  // Featured phones: prioritize newly added custom phones marked isFeatured first, then featured catalog phones, plus fallback IDs
  const defaultFeaturedIds = ['smart-20', 'oneplus-12r', 'google-pixel-8-pro', 'tecno-camon-30-pro-5g', 'samsung-galaxy-s24-ultra'];
  const customFeatured = phones.filter(p => !SEED_PHONE_IDS.has(p.id) && p.isFeatured);
  const seedFeatured = phones.filter(p => SEED_PHONE_IDS.has(p.id) && p.isFeatured);
  const adminFeatured = [...customFeatured, ...seedFeatured];
  const fallbackFeatured = defaultFeaturedIds
    .map(id => phones.find(p => p.id === id))
    .filter((p): p is typeof phones[number] => Boolean(p && !adminFeatured.some(af => af.id === p.id)));
  const featuredPhones = [...adminFeatured, ...fallbackFeatured].slice(0, 5);

  const [activeSlide, setActiveSlide] = useState(0);
  const firstFeaturedId = featuredPhones[0]?.id || '';

  // Jump to slide 0 whenever the top featured phone changes (e.g. when a newly added/assigned Featured phone is saved)
  useEffect(() => {
    setActiveSlide(0);
  }, [firstFeaturedId]);

  // Auto carousel slide every 4s (reduced by 4s from 8s)
  useEffect(() => {
    if (featuredPhones.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % featuredPhones.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredPhones.length]);

  const currentPhone = featuredPhones[activeSlide] || featuredPhones[0];
  // Most read articles sorted by highest number of visitor views
  const mostReadArticles = [...articles]
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
    .slice(0, 4);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* Col 1: Hero Carousel of Featured Phones (8 cols on lg) */}
      <div className="lg:col-span-8 rounded-2xl bg-gradient-to-br from-[#061a11] via-[#0a2a1a] to-[#04120a] border border-emerald-950/80 p-5 sm:p-6 md:p-7 flex flex-col justify-between relative overflow-hidden shadow-2xl">
        {/* Ambient emerald backlight */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Slide Content */}
        {currentPhone && (
          <div className="relative z-10 flex flex-col justify-between flex-1 space-y-2.5">
            {/* Top Info Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="hero-featured-badge font-mono uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 rounded">
                  Featured phone
                </span>
                <span className="text-xs text-slate-400">
                  {currentPhone.brand}
                </span>
              </div>

              <h1 className="post-title text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
                {currentPhone.name}
              </h1>
            </div>

            {/* Featured Phone Image Showcase - Increased slightly with rounded radius & fitted height */}
            <div 
              onClick={() => {
                setSelectedPhone(currentPhone);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="w-full my-1.5 sm:my-2 flex items-center justify-center cursor-pointer group"
            >
              <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl h-44 sm:h-52 md:h-56 rounded-2xl overflow-hidden border border-emerald-500/25 bg-slate-950/80 shadow-2xl flex items-center justify-center group-hover:border-emerald-500/50 transition-all">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-xl group-hover:bg-emerald-500/25 transition-all pointer-events-none" />
                <img
                  src={currentPhone.image}
                  alt={currentPhone.name}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Actions Side by Side below image */}
            <div className="flex flex-row items-center justify-center sm:justify-start gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={() => {
                  setSelectedPhone(currentPhone);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-normal flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg hover:shadow-emerald-900/40 whitespace-nowrap shrink-0"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Full specs</span>
              </button>
              <button
                onClick={() => {
                  addToCompare(currentPhone.id);
                  setActiveTab('compare');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-slate-100 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-normal flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-emerald-500/50 whitespace-nowrap shrink-0"
              >
                <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">Compare</span>
              </button>
            </div>
          </div>
        )}

        {/* Carousel Dots & Controls */}
        <div className="relative z-10 flex items-center justify-between pt-3 mt-2 border-t border-emerald-950/80">
          <div className="flex items-center gap-2">
            {featuredPhones.map((phone, idx) => (
              <button
                key={phone.id}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 transition-all rounded-full cursor-pointer ${
                  activeSlide === idx
                    ? 'w-7 bg-emerald-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <button
              onClick={() => setActiveSlide(prev => (prev - 1 + featuredPhones.length) % featuredPhones.length)}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] px-1">
              {activeSlide + 1} / {featuredPhones.length}
            </span>
            <button
              onClick={() => setActiveSlide(prev => (prev + 1) % featuredPhones.length)}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Col 2: Most Read Articles (4 cols on lg) */}
      <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
            <h2 className="font-bold text-white text-[19px] font-['Space_Grotesk'] flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
              <span>Most read articles</span>
            </h2>
          </div>

          <div className="space-y-2.5">
            {mostReadArticles.map((art, idx) => (
              <div
                key={art.id}
                onClick={() => {
                  setSelectedArticle(art);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group flex items-start gap-3 cursor-pointer pb-2.5 border-b border-slate-800/60 last:border-0 last:pb-0"
              >
                <span className="font-mono text-sm font-bold text-emerald-400/80 shrink-0 mt-0.5">
                  0{idx + 1}
                </span>
                <div className="space-y-1 min-w-0">
                  <h3 className="post-title font-semibold text-sm sm:text-base text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-slate-400">{art.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{art.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedArticle(null);
            setActiveTab('news');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="mt-3 pt-2.5 border-t border-slate-800 text-xs font-normal text-emerald-400 hover:text-emerald-300 flex items-center justify-between cursor-pointer"
        >
          <span>View all articles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
