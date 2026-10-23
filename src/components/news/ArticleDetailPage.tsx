import { useState, useEffect } from 'react';
import { Article, Phone } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Share2, 
  Clock, 
  Tag, 
  Smartphone, 
  Eye, 
  MessageSquare, 
  Send, 
  Check, 
  ExternalLink,
  Mail,
  PhoneCall,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Scale
} from 'lucide-react';

interface ArticleDetailPageProps {
  article: Article;
  onBack: () => void;
}

export default function ArticleDetailPage({ article, onBack }: ArticleDetailPageProps) {
  const { 
    articles, 
    phones, 
    setSelectedArticle, 
    setSelectedPhone, 
    setActiveTab,
    formatNaira,
    formatUSD,
    addToCompare
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; name: string; text: string; date: string }>>([
    {
      id: 'c1',
      name: 'Chidi Okafor',
      text: 'Very accurate analysis on the 5G band support for MTN and Airtel in Lagos. Most vendors in Computer Village don\'t clarify this before selling.',
      date: '2 days ago'
    },
    {
      id: 'c2',
      name: 'Bisi Adeleke',
      text: 'Thanks for including the Carlcare warranty details. Makes choosing between Tecno and Infinix much easier with the current street prices.',
      date: 'Yesterday'
    }
  ]);
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [article.id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentName.trim() && commentText.trim()) {
      setComments([
        ...comments,
        {
          id: 'c-' + Date.now(),
          name: commentName.trim(),
          text: commentText.trim(),
          date: 'Just now'
        }
      ]);
      setCommentSubmitted(true);
      setCommentName('');
      setCommentText('');
      setTimeout(() => setCommentSubmitted(false), 3000);
    }
  };

  // SIDEBAR 1: Mentioned smartphones in this article
  const mentionedPhones: Phone[] = (article.relatedPhoneIds || [])
    .map(id => phones.find(p => p.id === id))
    .filter((p): p is Phone => Boolean(p));

  // Fallback if none explicitly tagged
  const displayMentionedPhones = mentionedPhones.length > 0 
    ? mentionedPhones 
    : phones.slice(0, 3);

  // SIDEBAR 2: Trending & Most Read Articles
  const trendingArticles = articles
    .filter(a => a.id !== article.id)
    .slice(0, 5);

  // SIDEBAR 3: Popular smartphones in Nigeria by views
  const popularPhonesByViews = [...phones]
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 1. Breadcrumb & Top Bar Navigation */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to News</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <button 
            onClick={() => {
              onBack();
              setActiveTab('home');
            }}
            className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Home
          </button>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <button 
            onClick={onBack}
            className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            News &amp; Articles
          </button>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            {article.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Share article URL"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
          </button>
        </div>
      </nav>

      {/* 2. Main 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* MAIN ARTICLE BODY (8 Columns) */}
        <article className="lg:col-span-8 space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                {article.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>Published {article.date}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {article.readTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight leading-tight">
              {article.title}
            </h1>

            {/* Author Byline */}
            <div className="flex items-center gap-3 pt-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                {article.author.name.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block">
                  {article.author.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {article.author.role} · GsmScope Editorial Team
                </span>
              </div>
            </div>
          </div>

          {/* Featured Cover Banner */}
          <div className="relative aspect-[16/9] w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md">
            <img
              src={article.coverImage}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Lead / Summary Callout */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
            {article.summary}
          </div>

          {/* Article Prose Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-5 whitespace-pre-line">
            {article.content}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                <Tag className="w-3.5 h-3.5" />
                Tags:
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Bio Box */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-base shadow-sm">
              {article.author.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk']">
                About {article.author.name}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Specialized in West African telecommunications, smartphone battery endurance benchmarks, and retail price movements across Ikeja Computer Village and Nigerian digital commerce hubs.
              </p>
            </div>
          </div>

          {/* Discussion & User Comments Section */}
          <section className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk'] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Reader Discussion ({comments.length})</span>
              </h3>
            </div>

            {/* Existing Comments */}
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    <span className="text-slate-400 text-[11px]">{c.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Leave a Comment Form */}
            <form onSubmit={handleAddComment} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Join the conversation</h4>
              {commentSubmitted ? (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Your comment has been added!</span>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="Your name or nickname..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  <textarea
                    rows={3}
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts, experiences or questions..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </section>
        </article>

        {/* SIDEBARS (4 Columns) */}
        <aside aria-label="Article related sidebars" className="lg:col-span-4 space-y-6">

          {/* SIDEBAR WIDGET 1: Smartphones Mentioned in this Article */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Phones Mentioned</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {displayMentionedPhones.length} Devices
              </span>
            </div>

            <div className="space-y-3">
              {displayMentionedPhones.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPhone(p)}
                  className="group p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-[#061a11] transition-all cursor-pointer flex items-center gap-3"
                >
                  <div className="w-12 h-14 bg-white dark:bg-slate-900 rounded-lg p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800">
                    <img
                      src={p.image}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block truncate">
                      {p.brand}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {p.name}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] mt-1">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatNaira(p.priceNGN)}
                      </span>
                      <span className="text-slate-400 text-[10px] group-hover:text-emerald-500 flex items-center">
                        Specs →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR WIDGET 2: Popular Phones by Views Count */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Popular by Views</span>
              </h3>
              <button
                onClick={() => {
                  onBack();
                  setActiveTab('phones');
                }}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                All phones →
              </button>
            </div>

            <div className="space-y-3">
              {popularPhonesByViews.map((popPhone, idx) => (
                <div
                  key={popPhone.id}
                  onClick={() => setSelectedPhone(popPhone)}
                  className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 w-4 text-center">
                    0{idx + 1}
                  </span>
                  <div className="w-10 h-12 bg-slate-50 dark:bg-slate-950 rounded-lg p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800">
                    <img
                      src={popPhone.image}
                      alt={popPhone.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {popPhone.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatNaira(popPhone.priceNGN)}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3" />
                        {(popPhone.viewsCount || 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR WIDGET 3: Trending News & Editorials */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Trending Tech News</span>
              </h3>
            </div>

            <div className="space-y-3">
              {trendingArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    setSelectedArticle(art);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <div className="w-16 h-12 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold block truncate">
                      {art.category}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {art.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {art.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR WIDGET 4: Contact & Editorial Office */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#061a11] to-[#0a2a1a] border border-emerald-950 text-white space-y-3 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400">
              GsmScope Editorial
            </span>
            <h4 className="font-bold text-sm font-['Space_Grotesk']">
              Have a Tech Tip or Phone Correction?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our tech team is on ground at Ikeja Computer Village and monitors daily device listings.
            </p>
            <div className="space-y-2 pt-2 border-t border-emerald-900/60 text-xs">
              <a
                href="mailto:info@gsmscope.com"
                className="flex items-center gap-2 text-slate-200 hover:text-emerald-300 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono">info@gsmscope.com</span>
              </a>
              <a
                href="https://wa.me/2349127408003"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-slate-200 hover:text-emerald-300 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono">+2349127408003</span>
              </a>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
