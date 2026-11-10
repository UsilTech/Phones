import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useSeoMeta } from '../seo/SeoMeta';
import AdPlacementSlot from '../common/AdPlacementSlot';
import {
  Clock,
  ArrowRight,
  Eye,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function ReviewArticlesView() {
  const {
    articles,
    setSelectedArticle,
    setSelectedPhone,
    phones,
    setActiveTab,
    triggerNavigation,
    startGlobalLoading,
    stopGlobalLoading,
    showGlobalToast,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const seedReviewIds = new Set([
    'art-1',
    'art-2',
    'art-3',
    'art-4',
    'art-5',
    'art-6',
    'art-7',
    'art-8',
    'art-iphone-16-pro-review',
    'art-s24-ultra-review',
    'art-galaxy-s24-ultra-review',
    'art-google-pixel-9-pro-review',
    'art-pixel-9-pro-review',
    'art-xiaomi-14-ultra-review',
    'art-oneplus-12-review',
    'art-oneplus-12r-review',
    'art-xiaomi-redmi-13c-review',
    'art-infinix-note-40-fastcharge',
    'art-apple-iphone-battery-tips',
    'art-redmi-vs-infinix',
  ]);

  const allReviewArticles = articles.filter(
    (a) =>
      (a.category || '').toLowerCase().includes('review') ||
      (a.title || '').toLowerCase().includes('review') ||
      (a.tags || []).some((t) => t.toLowerCase().includes('review'))
  );

  // Show newly published custom review articles first; among seed reviews, keep iPhone 16 Pro Max first
  const sortedReviewArticles = [...allReviewArticles].sort((a, b) => {
    const isCustomA = !seedReviewIds.has(a.id);
    const isCustomB = !seedReviewIds.has(b.id);
    if (isCustomA && !isCustomB) return -1;
    if (!isCustomA && isCustomB) return 1;
    if (a.id === 'art-iphone-16-pro-review') return -1;
    if (b.id === 'art-iphone-16-pro-review') return 1;
    return 0;
  });

  const filters = ['All', 'Flagship', 'Mid-Range & Budget', 'Camera & Battery'];

  const filteredReviews =
    selectedFilter === 'All'
      ? sortedReviewArticles
      : sortedReviewArticles.filter((a) => {
          const text = `${a.title} ${a.summary} ${(a.tags || []).join(' ')}`.toLowerCase();
          if (selectedFilter === 'Flagship') {
            return (
              text.includes('flagship') ||
              text.includes('pro max') ||
              text.includes('ultra') ||
              text.includes('pixel 9 pro') ||
              text.includes('oneplus 12')
            );
          }
          if (selectedFilter === 'Mid-Range & Budget') {
            return (
              text.includes('budget') ||
              text.includes('mid-range') ||
              text.includes('redmi') ||
              text.includes('infinix') ||
              text.includes('tecno') ||
              text.includes('smart')
            );
          }
          if (selectedFilter === 'Camera & Battery') {
            return (
              text.includes('camera') ||
              text.includes('battery') ||
              text.includes('fastcharge') ||
              text.includes('charging')
            );
          }
          return true;
        });

  const featuredReview = filteredReviews[0] || null;
  const remainingReviews = filteredReviews.slice(1);

  useSeoMeta({
    title:
      selectedFilter === 'All'
        ? 'Smartphone Reviews, Lab Benchmarks & Camera Tests | GsmScope'
        : `${selectedFilter} Smartphone Reviews | GsmScope`,
    description:
      featuredReview?.summary ||
      'Read in-depth smartphone hardware reviews, real-world battery endurance reports, camera lab evaluations, and performance benchmarks on GsmScope.',
    image: featuredReview?.coverImage || phones[0]?.image,
    imageAlt: featuredReview?.title || 'GsmScope Smartphone Reviews Archive',
    type: 'website',
    canonicalPath: '/?tab=reviews',
  });

  // SIDEBAR DATA: Popular phones by views count
  const popularPhones = [...phones]
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
    .slice(0, 6);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 1. Page Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
              Smartphone Reviews
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              In-depth smartphone hardware reviews, camera sensor evaluations, battery endurance benchmarks, and real-world daily performance verdicts.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">Reviews</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {sortedReviewArticles.length} Published
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="text-slate-400 text-[10px] block">Testing</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Lab &amp; Real-World
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filterLabel) => (
          <button
            key={filterLabel}
            onClick={() => triggerNavigation(() => setSelectedFilter(filterLabel))}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedFilter === filterLabel
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            {filterLabel}
          </button>
        ))}
      </div>

      {/* 3. Featured Review Spotlight */}
      {featuredReview && (
        <section
          onClick={() => triggerNavigation(() => setSelectedArticle(featuredReview))}
          className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-emerald-500/50 transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
        >
          <div className="lg:col-span-7 aspect-[16/9] lg:aspect-auto relative overflow-hidden bg-slate-950">
            <img
              src={
                featuredReview.coverImage ||
                phones.find((p) => featuredReview.relatedPhoneIds?.includes(p.id))?.image
              }
              alt={featuredReview.title}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('IMG_20261026_152954_83c935f6.jpg')) {
                  target.src = '/assets/aistudio/IMG_20261026_152954_83c935f6.jpg';
                }
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="site-badge absolute top-3 left-3 px-1.5 py-px text-[9px] font-mono uppercase font-bold tracking-wider text-white bg-emerald-600 rounded">
              Featured Review
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {featuredReview.category || 'Reviews'}
                </span>
                <span>·</span>
                <span>{featuredReview.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredReview.readTime}
                </span>
              </div>

              <h2 className="post-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                {featuredReview.title}
              </h2>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                By {featuredReview.author?.name || 'GsmScope'}
              </span>

              <span className="text-emerald-600 dark:text-emerald-400 font-normal flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Read Review</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Ad Placement */}
      <AdPlacementSlot placementId="news_below_featured" />

      {/* 4. Main 12-Column Layout: Review Articles Grid (8 cols) + Sidebars (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Review Articles Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {remainingReviews.map((article) => {
              const relatedPhone = phones.find((p) => article.relatedPhoneIds?.includes(p.id));
              return (
                <article
                  key={article.id}
                  onClick={() => triggerNavigation(() => setSelectedArticle(article))}
                  className="group flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer shadow-sm"
                >
                  <div>
                    {/* Cover Image */}
                    <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                      <img
                        src={article.coverImage || relatedPhone?.image}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('IMG_20261026_152954_83c935f6.jpg')) {
                            target.src = '/assets/aistudio/IMG_20261026_152954_83c935f6.jpg';
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="site-badge absolute top-2.5 left-2.5 px-1.5 py-px rounded text-[9px] font-mono font-semibold uppercase tracking-wider bg-slate-950/85 text-emerald-400 border border-emerald-500/30">
                        {article.category || 'Reviews'}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{article.date}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                      </div>

                      <h3 className="post-title font-bold text-slate-900 dark:text-white text-base sm:text-lg font-['Space_Grotesk'] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                        {article.title}
                      </h3>
                    </div>
                  </div>

                  {/* Footer with Author and CTA */}
                  <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate max-w-[150px]">{article.author?.name || 'GsmScope'}</span>

                    <span className="text-emerald-600 dark:text-emerald-400 font-normal flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredReviews.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No review articles currently found under &ldquo;{selectedFilter}&rdquo;.
              </p>
              <button
                onClick={() => setSelectedFilter('All')}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                View all reviews
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Rich Sidebars (4 cols) */}
        <aside aria-label="Review sidebars" className="lg:col-span-4 space-y-6">
          {/* SIDEBAR WIDGET 1: Most Popular Phones by Views */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Popular phones</span>
              </h3>
              <button
                onClick={() => triggerNavigation(() => setActiveTab('phones'))}
                className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                All phones →
              </button>
            </div>

            <div className="space-y-3">
              {popularPhones.map((phone, idx) => (
                <div
                  key={phone.id}
                  onClick={() => triggerNavigation(() => setSelectedPhone(phone))}
                  className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 w-4 text-center">
                    0{idx + 1}
                  </span>
                  <div className="w-15 h-12 bg-slate-950 rounded-lg overflow-hidden p-0 shrink-0 border border-slate-200 dark:border-slate-800">
                    <img
                      src={phone.image}
                      alt={phone.name}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="post-title font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {phone.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {(phone.viewsCount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR WIDGET 2: Buying Tips Callout */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">
                Smart Buyer Tip
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Always verify that the manufacturer packaging is sealed, inspect official warranty registration, and check global 5G/4G frequency band support before checkout.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              Verified by GsmScope Technology Desk
            </div>
          </div>


          {/* SIDEBAR WIDGET 4: Editorial Standards */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">Editorial Standards:</span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              GsmScope maintains strict editorial independence. Our hardware lab benchmarks, battery stress tests, and camera evaluations are conducted impartially.
            </p>
            <div className="pt-1">
              <button
                onClick={() => setActiveTab('about')}
                className="text-emerald-600 dark:text-emerald-400 font-normal text-xs hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Read our methodology</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
