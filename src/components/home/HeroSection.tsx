import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
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

  // Featured phones matching GsmScope
  const featuredPhoneIds = ['smart-20', 'oneplus-12r', 'google-pixel-8-pro', 'tecno-camon-30-pro-5g', 'samsung-galaxy-s24-ultra'];
  const featuredPhones = featuredPhoneIds
    .map(id => phones.find(p => p.id === id))
    .filter(Boolean) as typeof phones;

  const [activeSlide, setActiveSlide] = useState(0);

  // Auto carousel slide every 8s
  useEffect(() => {
    if (featuredPhones.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % featuredPhones.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredPhones.length]);

  const currentPhone = featuredPhones[activeSlide] || featuredPhones[0];
  const mostReadArticles = articles.slice(0, 4);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Col 1: Hero Carousel of Featured Phones (8 cols on lg) */}
      <div className="lg:col-span-8 rounded-2xl bg-gradient-to-br from-[#061a11] via-[#0a2a1a] to-[#04120a] border border-emerald-950/80 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
        {/* Ambient emerald backlight */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Slide Content */}
        {currentPhone && (
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 justify-between flex-1">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Featured phone
                </span>
                <span className="text-xs text-slate-400">
                  {currentPhone.brand} · {currentPhone.releaseYear}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
                {currentPhone.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                {currentPhone.nairaPriceNotes}
              </p>

              {/* Key Specs overview */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-1">
                <span>{currentPhone.keyHighlights.display}</span>
                <span aria-hidden="true">·</span>
                <span>{currentPhone.keyHighlights.processor}</span>
                <span aria-hidden="true">·</span>
                <span>{currentPhone.keyHighlights.battery}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => setSelectedPhone(currentPhone)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
                >
                  <Eye className="w-4 h-4" />
                  <span>View full specs</span>
                </button>
                <button
                  onClick={() => {
                    addToCompare(currentPhone.id);
                    setActiveTab('compare');
                  }}
                  className="px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>Compare this phone</span>
                </button>
              </div>
            </div>

            {/* Phone Image Showcase */}
            <div className="w-48 sm:w-56 md:w-64 aspect-[4/3] rounded-2xl bg-[#061a11]/80 border border-emerald-950 p-4 flex items-center justify-center shrink-0 shadow-inner group">
              <img
                src={currentPhone.image}
                alt={currentPhone.name}
                referrerPolicy="no-referrer"
                className="max-h-48 w-auto object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        )}

        {/* Carousel Dots & Controls */}
        <div className="relative z-10 flex items-center justify-between pt-6 mt-4 border-t border-emerald-950/80">
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
      <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h2 className="font-bold text-white text-base font-['Space_Grotesk'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Most read articles</span>
            </h2>
          </div>

          <div className="space-y-3.5">
            {mostReadArticles.map((art, idx) => (
              <div
                key={art.id}
                onClick={() => {
                  setSelectedArticle(art);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group flex items-start gap-3 cursor-pointer pb-3 border-b border-slate-800/60 last:border-0 last:pb-0"
              >
                <span className="font-mono text-sm font-bold text-emerald-400/80 shrink-0 mt-0.5">
                  0{idx + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
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
          className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center justify-between cursor-pointer"
        >
          <span>View all articles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
