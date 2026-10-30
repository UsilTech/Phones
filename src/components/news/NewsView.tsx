import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { subscribeNewsletterApi } from '../../services/api';
import { useSeoMeta } from '../seo/SeoMeta';
import AdPlacementSlot from '../common/AdPlacementSlot';
import { 
  Clock, 
  ArrowRight, 
  Tag, 
  Smartphone, 
  Eye, 
  TrendingUp, 
  Flame, 
  Sparkles, 
  Check,
  Loader2
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

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('Confirmation email sent!');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const categories = ['All', 'Phone News', 'Reviews', 'Buying Guides', 'Launch', 'Tech Updates'];

  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter(a => {
        if (selectedCategory === 'Phone News') {
          return a.category === 'Phone News' || a.category === 'Smartphone News' || a.category === 'News';
        }
        if (selectedCategory === 'Reviews') {
          return a.category === 'Reviews' || a.category === 'Review';
        }
        if (selectedCategory === 'Buying Guides') {
          return (
            a.category === 'Buying Guides' ||
            a.category === 'Buying Guide' ||
            a.category === 'FRP & Servicing Tools' ||
            a.category === 'Charging & Battery' ||
            a.category === 'Tips & Security'
          );
        }
        return a.category === selectedCategory;
      });

  const featuredArticle = filteredArticles[0] || null;
  const remainingArticles = filteredArticles.slice(1);

  useSeoMeta({
    title:
      selectedCategory === 'All'
        ? 'Mobile Technology News, Launches & Reviews | GsmScope'
        : `${selectedCategory} — Mobile Technology News | GsmScope`,
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubscribing) return;
    const email = newsletterEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showGlobalToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsSubscribing(true);
    startGlobalLoading('Subscribing to alerts');

    try {
      const [result] = await Promise.all([
        subscribeNewsletterApi(email),
        new Promise((res) => setTimeout(res, 400))
      ]);
      if (!result.success) {
        showGlobalToast(result.message || 'Please enter a valid email address.', 'error');
        return;
      }
      setNewsletterMessage(result.message || `Confirmation email sent to ${email}!`);
      setNewsletterDone(true);
      setNewsletterEmail('');
      showGlobalToast(
        result.message || `Confirmation email sent to ${email}!`,
        result.alreadySubscribed ? 'info' : 'success'
      );
      setTimeout(() => {
        setNewsletterDone(false);
      }, 5000);
    } catch {
      showGlobalToast('Failed to subscribe. Please try again.', 'error');
    } finally {
      stopGlobalLoading();
      setIsSubscribing(false);
    }
  };

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
            onClick={() => triggerNavigation(() => setSelectedCategory(cat))}
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
            <img
              src={featuredArticle.coverImage}
              alt={featuredArticle.title}
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
                    <img
                      src={article.coverImage}
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

          {filteredArticles.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
              <p className="font-semibold text-slate-700 dark:text-slate-300">No articles currently found under &ldquo;{selectedCategory}&rdquo;.</p>
              <button
                onClick={() => setSelectedCategory('All')}
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

          {/* SIDEBAR WIDGET 3: Newsletter & Alert Signup */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#061a11] to-[#0a2a1a] border border-emerald-950 text-white space-y-3 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400">
              Weekly Digest
            </span>
            <h4 className="font-bold text-sm font-['Space_Grotesk']">
              Get Global Tech &amp; Price Alerts
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Never miss a price drop on flagship or budget smartphones, tech breakthroughs, and benchmark comparisons.
            </p>

            <form onSubmit={handleSubscribe} noValidate className="space-y-2 pt-2">
              {newsletterDone ? (
                <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Check className="w-4 h-4 shrink-0" />
                    <span className="leading-snug">{newsletterMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewsletterDone(false)}
                    className="text-[10px] font-normal underline hover:text-white shrink-0 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    required
                    disabled={isSubscribing}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter email address..."
                    aria-label="Email address for price and tech alerts"
                    className="w-full px-3 py-2 bg-slate-950/80 border border-emerald-900/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSubscribing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <span>Subscribe to Alerts</span>
                    )}
                  </button>
                </>
              )}
            </form>
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
