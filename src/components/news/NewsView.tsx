import { useState, useEffect } from 'react';
import { useApp, SEED_ARTICLE_IDS, getRecordTimestamp } from '../../context/AppContext';
import { useSeoMeta } from '../seo/SeoMeta';
import AdPlacementSlot from '../common/AdPlacementSlot';
import LazyImage from '../common/LazyImage';
import { 
  Clock, 
  ArrowRight, 
  ChevronLeft,
  ChevronRight,
  Tag, 
  Smartphone, 
  Eye, 
  TrendingUp, 
  Flame, 
  Sparkles
} from 'lucide-react';

export default function NewsView() {
  const { 
    articles, 
    setSelectedArticle, 
    setSelectedPhone, 
    phones, 
    formatNaira,
    setActiveTab,
    triggerNavigation,
    startGlobalLoading,
    stopGlobalLoading,
    showGlobalToast
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    try {
      return sessionStorage.getItem('gsmscope_news_cat_v1') || 'All';
    } catch {
      return 'All';
    }
  });
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const saved = Number(sessionStorage.getItem('gsmscope_news_page_v1'));
      return saved > 0 ? saved : 1;
    } catch {
      return 1;
    }
  });
  const POSTS_PER_PAGE = 9;

  useEffect(() => {
    try {
      sessionStorage.setItem('gsmscope_news_cat_v1', selectedCategory);
      sessionStorage.setItem('gsmscope_news_page_v1', String(currentPage));
    } catch {}
  }, [selectedCategory, currentPage]);

  const categories = ['All', 'News', 'Buying Guide', 'Launch'];

  // Exclude Review articles (which have their own dedicated Reviews section) and sort newly added/posted articles first
  const nonReviewArticles = [...articles.filter(
    (a) => a.category !== 'Reviews' && a.category !== 'Review'
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

  const filteredArticles = selectedCategory === 'All'
    ? nonReviewArticles
    : nonReviewArticles.filter(a => {
        if (selectedCategory === 'News') {
          return a.category === 'News' || a.category === 'Phone News' || a.category === 'Smartphone News' || a.category === 'Tech Updates';
        }
        if (selectedCategory === 'Buying Guide') {
          return (
            a.category === 'Buying Guide' ||
            a.category === 'Buying Guides' ||
            a.category === 'FRP & Servicing Tools' ||
            a.category === 'Charging & Battery' ||
            a.category === 'Tips & Security'
          );
        }
        return a.category === selectedCategory;
      });

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const featuredArticle = paginatedArticles[0] || null;
  const remainingArticles = paginatedArticles.slice(1);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === safePage) return;
    triggerNavigation(() => {
      setCurrentPage(nextPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  useSeoMeta({
    title:
      selectedCategory === 'All'
        ? 'Mobile Technology News, Launches & Reviews'
        : `${selectedCategory} — Mobile Technology News`,
    description:
      featuredArticle?.summary ||
      'Stay updated with the latest smartphone launches, 5G network coverage, hardware reviews, and mobile tech news on GsmScope.',
    image: featuredArticle?.coverImage || phones[0]?.image,
    imageAlt: featuredArticle?.title || 'GsmScope Mobile Technology News',
    type: 'website',
    canonicalPath: '/?tab=news',
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
              News &amp; Smartphone Guides
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              In-depth phone hardware reviews, global 5G carrier testing, processor benchmarks, and retail price movement analyses worldwide.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">Articles</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{articles.length} Published</span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="text-slate-400 text-[10px] block">Coverage</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Global &amp; Local</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              triggerNavigation(() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              })
            }
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Featured Breaking Story Spotlight */}
      {featuredArticle && (
        <section 
          onClick={() => triggerNavigation(() => setSelectedArticle(featuredArticle))}
          className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-emerald-500/50 transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
        >
          <div className="lg:col-span-7 aspect-[16/9] lg:aspect-auto relative overflow-hidden bg-slate-950">
            <LazyImage
              src={featuredArticle.coverImage}
              alt={featuredArticle.title}
              priority
              fallbackSrc="/assets/aistudio/IMG_20261026_152954_83c935f6.jpg"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="site-badge absolute top-3 left-3 px-1.5 py-px text-[9px] font-mono uppercase font-bold tracking-wider text-white bg-emerald-600 rounded">
              Featured Story
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{featuredArticle.category}</span>
                <span>·</span>
                <span>{featuredArticle.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredArticle.readTime}
                </span>
              </div>

              <h2 className="post-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                {featuredArticle.title}
              </h2>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                By {featuredArticle.author.name}
              </span>

              <span className="text-emerald-600 dark:text-emerald-400 font-normal flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Read Story</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Ad Placement: News Page — Below Featured Story */}
      <AdPlacementSlot placementId="news_below_featured" />

      {/* 4. Main 12-Column Layout: Articles Grid (8 cols) + Sidebars (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Articles Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {remainingArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => triggerNavigation(() => setSelectedArticle(article))}
                className="group flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer shadow-sm"
              >
                <div>
                  {/* Cover Image */}
                  <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                    <LazyImage
                      src={article.coverImage}
                      alt={article.title}
                      fallbackSrc="/assets/aistudio/IMG_20261026_152954_83c935f6.jpg"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="site-badge absolute top-2.5 left-2.5 px-1.5 py-px rounded text-[9px] font-mono font-semibold uppercase tracking-wider bg-slate-950/85 text-emerald-400 border border-emerald-500/30">
                      {article.category}
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
                  <span className="truncate max-w-[150px]">{article.author.name}</span>

                  <span className="text-emerald-600 dark:text-emerald-400 font-normal flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>

          {filteredArticles.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => handlePageChange(safePage - 1)}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer shadow-sm transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1 px-0.5">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-7 h-7 rounded-md text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                        safePage === pageNum
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
                  disabled={safePage >= totalPages}
                  onClick={() => handlePageChange(safePage + 1)}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer shadow-sm transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {filteredArticles.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
              <p className="font-semibold text-slate-700 dark:text-slate-300">No articles currently found under &ldquo;{selectedCategory}&rdquo;.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setCurrentPage(1);
                }}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                View all articles
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Rich Sidebars (4 cols) */}
        <aside aria-label="News sidebars" className="lg:col-span-4 space-y-6">

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
                    <LazyImage
                      src={phone.image}
                      alt={phone.name}
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
