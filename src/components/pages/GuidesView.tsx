import React, { useState, useRef, useEffect } from 'react';
import { useApp, SEED_ARTICLE_IDS, getRecordTimestamp } from '../../context/AppContext';
import { useSeoMeta } from '../seo/SeoMeta';
import SocialShareBar from '../common/SocialShareBar';
import ScrollProgressBar from '../common/ScrollProgressBar';
import AdPlacementSlot from '../common/AdPlacementSlot';
import FormattedContent from '../common/FormattedContent';
import { 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Tag, 
  Wrench, 
  BatteryCharging, 
  ShieldCheck, 
  Smartphone,
  Check,
  Search,
  Filter,
  Loader2,
  X,
  MessageSquare,
  Send,
  TrendingUp,
  Eye
} from 'lucide-react';

interface GuideItem {
  id: string;
  title: string;
  category: 'Buying Guide';
  brandTag?: string;
  summary: string;
  content: string[];
  author: string;
  date: string;
  readTime: string;
  image: string;
}

export default function GuidesView() {
  const { setActiveTab, setSelectedPhone, phones, articles, startGlobalLoading, stopGlobalLoading } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeGuide, setActiveGuide] = useState<GuideItem | null>(null);
  const [isSearchingGuides, setIsSearchingGuides] = useState(false);
  const guideArticleRef = useRef<HTMLElement>(null);

  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const defaultGuideComments = [
    {
      id: 'gc-1',
      name: 'Emeka Okafor',
      text: 'Very clear and practical breakdown. Tested this workflow in our servicing shop and it worked smoothly.',
      date: '3 hours ago'
    },
    {
      id: 'gc-2',
      name: 'Sadiq Bello',
      text: 'Thanks for keeping these guides updated with current security patches and battery care advice.',
      date: '1 day ago'
    }
  ];
  const [comments, setComments] = useState<Array<{ id: string; name: string; text: string; date: string }>>(defaultGuideComments);
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  useEffect(() => {
    if (!activeGuide?.id) {
      setComments(defaultGuideComments);
      return;
    }
    const isSeedGuide = /^guide-\d+$/.test(activeGuide.id);
    const fallback = isSeedGuide ? defaultGuideComments : [];
    try {
      const raw = localStorage.getItem('gsmscope_guide_comments_v1');
      const map = raw ? JSON.parse(raw) : {};
      setComments(Array.isArray(map[activeGuide.id]) ? map[activeGuide.id] : fallback);
    } catch {
      setComments(fallback);
    }
  }, [activeGuide?.id]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentName.trim() && commentText.trim() && activeGuide) {
      const nextComments = [
        ...comments,
        {
          id: 'gc-' + Date.now(),
          name: commentName.trim(),
          text: commentText.trim(),
          date: 'Just now'
        }
      ];
      setComments(nextComments);
      try {
        const raw = localStorage.getItem('gsmscope_guide_comments_v1');
        const map = raw ? JSON.parse(raw) : {};
        map[activeGuide.id] = nextComments;
        localStorage.setItem('gsmscope_guide_comments_v1', JSON.stringify(map));
      } catch {}
      setCommentSubmitted(true);
      setCommentName('');
      setCommentText('');
      setTimeout(() => setCommentSubmitted(false), 3000);
    }
  };

  const popularPhonesByViews = [...phones]
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
    .slice(0, 5);

  useEffect(() => {
    const handleResetGuide = () => setActiveGuide(null);
    window.addEventListener('gsmscope:reset-guide', handleResetGuide);
    return () => window.removeEventListener('gsmscope:reset-guide', handleResetGuide);
  }, []);

  useSeoMeta({
    title: activeGuide
      ? `${activeGuide.title} — GsmScope Guides`
      : 'Smartphone Buying Guides, Battery Care & Mobile Tips | GsmScope',
    description: activeGuide
      ? activeGuide.summary
      : 'Expert smartphone buying guides, battery health optimization tips, servicing tools, and mobile security tutorials from GsmScope.',
    image: activeGuide?.image || phones[0]?.image,
    imageAlt: activeGuide?.title || 'GsmScope Smartphone Buying Guides & Tutorials',
    type: activeGuide ? 'article' : 'website',
    canonicalPath: '/?tab=guides',
  });

  const handleGuideSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearchingGuides) return;
    setIsSearchingGuides(true);
    startGlobalLoading();
    setTimeout(() => {
      stopGlobalLoading();
      setIsSearchingGuides(false);
    }, 350);
  };

  const handleSelectGuide = (guide: GuideItem | null) => {
    startGlobalLoading();
    setActiveGuide(guide);
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(stopGlobalLoading, 220);
  };

  const handleSelectCategory = (cat: string) => {
    startGlobalLoading();
    setSelectedCategory(cat);
    setTimeout(stopGlobalLoading, 220);
  };

  const guidesList: GuideItem[] = [
    {
      id: 'guide-1',
      title: 'Best phones under $151 / £113 (₦200,000) right now',
      category: 'Buying Guide',
      brandTag: 'Infinix & Tecno',
      summary: 'Budget phones have caught up fast. These are the models we would buy under $151 / £113 (₦200,000) with high refresh displays, 5000mAh batteries and Type-C fast charge.',
      content: [
        'Finding value under $151 / £113 (₦200,000) across global retail markets and major online stores has gotten significantly better over the past year. Entry-level chipsets have evolved from laggy quad-core silicon to smooth MediaTek Helio G85/G99 and Unisoc T606/T612 processors.',
        'Our top recommendation remains the Infinix Hot 40 / Tecno Spark 20 series for their balanced 8GB extended RAM configurations, dependable 5000 mAh batteries with 18W–33W fast charge, and verified official warranty support.',
        'When purchasing in local or international markets, ensure you verify the sealed package to avoid open-box swap units and confirm the IMEI matches on both the phone box and SIM tray.'
      ],
      author: 'Chidi Nwosu',
      date: '17 Sept 2026',
      readTime: '6 min read',
      image: '/src/assets/images/news_nigeria_tech_1792578846595.jpg'
    },
    {
      id: 'guide-2',
      title: 'How to Enable ADB on Samsung Using Quick Share (FRP Bypass & Servicing)',
      category: 'Buying Guide',
      brandTag: 'Samsung',
      summary: 'A step-by-step technical guide to enabling Android Debug Bridge (ADB) on modern Samsung One UI devices using TalkBack, Quick Share, and official diagnostic tools.',
      content: [
        'Android Debug Bridge (ADB) is the primary diagnostic protocol used by phone technicians worldwide to troubleshoot system issues, remove forgotten lock credentials with proof of ownership, and flash carrier binaries.',
        'This tutorial outlines the modern Quick Share protocol pathway on One UI 6 and One UI 7, explaining how accessibility shortcuts can be utilized legitimately by repair shops to establish a trusted handshake with a technician PC.',
        'Always ensure device ownership is validated before performing any bypass or servicing operations.'
      ],
      author: 'GsmScope Tech Desk',
      date: '4 Sept 2026',
      readTime: '8 min read',
      image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg'
    },
    {
      id: 'guide-3',
      title: 'BFT Tool: Free Android Tool for FRP Bypass & Factory Reset',
      category: 'Buying Guide',
      brandTag: 'Universal Android',
      summary: 'A comprehensive guide to BFT Tool, a Windows-based Android servicing utility supporting FRP removal, factory reset, and account servicing for Samsung, Xiaomi, and other Android devices.',
      content: [
        'BFT Tool has become one of the most widely used diagnostic toolkits in repair centers worldwide. It supports direct MTP mode operations, ADB shell commands, and emergency EDL flashing on Qualcomm chipsets.',
        'Key features include one-click FRP reset on Samsung Exynos and Snapdragon hardware, Xiaomi Mi Account temporary bypass, and Fastboot to EDL reboot commands.',
        'We cover driver installation (SAMSUNG USB Mobile Drivers, MTK VCOM, and Qualcomm 9008 drivers) to ensure clean communication without boot loops.'
      ],
      author: 'GsmScope Tech Desk',
      date: '2 Sept 2026',
      readTime: '7 min read',
      image: '/src/assets/images/news_mobile_processor_1792578846003.jpg'
    },
    {
      id: 'guide-4',
      title: 'SamFw Tool: Free Android Tool for FRP Bypass & Mi Account',
      category: 'Buying Guide',
      brandTag: 'Samsung & Xiaomi',
      summary: 'A comprehensive walkthrough of SamFw FRP Tool, a trusted servicing utility supporting Samsung test mode (*#0*#), Knox diagnostics, and Xiaomi sideload operations.',
      content: [
        'SamFw Tool remains the benchmark free servicing software for smartphone technicians worldwide. Its ability to send test mode exploits (*#0*# or *#*#88#*#*) allows ADB authorization in seconds on supported security patch levels.',
        'The guide details how to execute CSC change commands without wiping data, enabling native call recording and regional carrier network optimizations on imported US, European, and Asian Galaxy variants.'
      ],
      author: 'GsmScope Tech Desk',
      date: '1 Sept 2026',
      readTime: '9 min read',
      image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg'
    },
    {
      id: 'guide-5',
      title: 'Fast charging explained: what 45W, 90W and 120W really mean',
      category: 'Buying Guide',
      brandTag: 'Battery & Power',
      summary: 'Bigger numbers charge faster, but only with the right charger, cable and temperature control. Here is how thermal conditions affect fast charging longevity.',
      content: [
        'Proprietary fast charging protocols like Infinix All-Round FastCharge (70W–100W), Tecno Ultra Charge (70W), and Xiaomi HyperCharge (120W) require specialized charge pumps and dual-cell battery designs.',
        'When ambient temperatures exceed 32°C, charging silicon automatically throttles wattage to protect battery health. Charging in a ventilated room or utilizing Bypass Charging during gaming preserves your battery cell capacity over 3+ years.'
      ],
      author: 'Amaka Obi',
      date: '29 Aug 2026',
      readTime: '5 min read',
      image: '/src/assets/images/news_nigeria_tech_1792578846595.jpg'
    },
    {
      id: 'guide-6',
      title: 'Free Samsung, Redmi, Tecno & Infinix FRP Bypass Servicing Tools',
      category: 'Buying Guide',
      brandTag: 'Multi-Brand',
      summary: 'A curated list of verified free Android servicing tools including SAMFW Tool, BFT Tool, and MTK Client for diagnosing and restoring locked Android hardware.',
      content: [
        'Mobile repair technicians worldwide rely on a stable suite of open-source and freeware tools. This guide compares MTK Client for MediaTek chipsets, Qualcomm QFIL for raw XML flashing, and dedicated Samsung MTP unlockers.',
        'We also provide safety precautions against rogue trojans commonly bundled in unverified flash tool downloads.'
      ],
      author: 'GsmScope Tech Desk',
      date: '23 Aug 2026',
      readTime: '10 min read',
      image: '/src/assets/images/news_camera_sensor_1792578845370.jpg'
    },
    {
      id: 'guide-7',
      title: 'How to Enable ADB on Samsung KG Locked Phones',
      category: 'Buying Guide',
      brandTag: 'Samsung Knox Guard',
      summary: 'A practical tutorial on how technicians analyze Knox Guard (KG) locked devices, verify carrier leasing status, and enable ADB for troubleshooting.',
      content: [
        'Knox Guard (KG) status (Active, Completed, Checking) controls whether device bootloaders and debugging interfaces can be enabled. We explain how to identify genuine carrier contract status versus gray-market locked units before purchasing second-hand.'
      ],
      author: 'GsmScope Tech Desk',
      date: '22 Aug 2026',
      readTime: '8 min read',
      image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg'
    }
  ];

  // Include any articles published from Admin Dashboard under guide categories (sorted newest-first)
  const adminPublishedGuides: GuideItem[] = [...articles
    .filter((a) => {
      const cat = (a.category || '').trim();
      return (
        cat === 'Buying Guides' ||
        cat === 'Buying Guide' ||
        cat === 'FRP & Servicing Tools' ||
        cat === 'Charging & Battery' ||
        cat === 'Tips & Security'
      );
    })]
    .sort((a, b) => {
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
    })
    .map((a) => {
      const mappedCat: GuideItem['category'] = 'Buying Guide';
      const paragraphs = (a.content || a.summary || '')
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean);
      return {
        id: a.id,
        title: a.title,
        category: mappedCat,
        brandTag: (a.tags && a.tags[0]) || mappedCat,
        summary: a.summary || a.title,
        content: paragraphs.length > 0 ? paragraphs : [a.summary || a.title],
        author: a.author?.name || 'GsmScope Editorial',
        date: a.date || 'Recent',
        readTime: a.readTime || '5 min read',
        image: a.coverImage || '/assets/aistudio/IMG_20261026_152954_83c935f6.jpg',
      };
    });

  const deletedGuideIds: Set<string> = (() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('gsmscope_deleted_article_ids') : null;
      return new Set<string>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set<string>();
    }
  })();

  const combinedGuides: GuideItem[] = [
    ...adminPublishedGuides,
    ...guidesList.filter(
      (sg) =>
        !deletedGuideIds.has(sg.id) &&
        !adminPublishedGuides.some((ag) => ag.id === sg.id || ag.title.toLowerCase() === sg.title.toLowerCase())
    ),
  ];

  const categories = ['All', 'Buying Guide'];

  const filteredGuides = combinedGuides.filter(g => {
    if (selectedCategory !== 'All' && g.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return g.title.toLowerCase().includes(q) || g.summary.toLowerCase().includes(q) || (g.brandTag && g.brandTag.toLowerCase().includes(q));
    }
    return true;
  });

  // If viewing single guide
  if (activeGuide) {
    return (
      <div className="space-y-8 animate-fadeIn pb-12">
        <ScrollProgressBar targetRef={guideArticleRef} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Guide Article Body (8 Columns) */}
          <article ref={guideArticleRef} className="lg:col-span-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="site-badge px-1.5 py-px rounded-full text-[9px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  {activeGuide.category}
                </span>
              </div>

              <h1 className="post-title text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight leading-tight">
                {activeGuide.title}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{activeGuide.author}</span>
                <span>·</span>
                <span>{activeGuide.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  {activeGuide.readTime}
                </span>
              </div>
            </div>

            {activeGuide.image && (
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
                <img
                  src={activeGuide.image}
                  alt={activeGuide.title}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('IMG_20261026_152954_83c935f6.jpg')) {
                      target.src = '/assets/aistudio/IMG_20261026_152954_83c935f6.jpg';
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Lead Summary Callout */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
              <FormattedContent content={activeGuide.summary} compact />
            </div>

            {/* Paragraphs & Headings (Supports H1-H4, Bold Text, Bold Paragraphs, Lists & Quotes) */}
            <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              <FormattedContent content={activeGuide.content} />
            </div>

            {/* Social Media Sharing Row after Guide Content */}
            <SocialShareBar
              title={`${activeGuide.title} — GsmScope Guides`}
              path={`/?tab=guides&guide=${encodeURIComponent(activeGuide.id)}`}
            />

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
                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <FormattedContent content={c.text} compact />
                    </div>
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
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
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

            {/* Footer CTA */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => {
                  setActiveTab('phones');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="text-xs font-normal text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Explore phone database</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>

          {/* Right Sidebar (4 Columns): Popular Phones */}
          <aside aria-label="Guide related sidebars" className="lg:col-span-4 space-y-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Popular phones</span>
                </h3>
                <button
                  onClick={() => {
                    setActiveGuide(null);
                    setSelectedPhone(null);
                    setActiveTab('phones');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  All phones →
                </button>
              </div>

              <div className="space-y-3">
                {popularPhonesByViews.map((popPhone, idx) => (
                  <div
                    key={popPhone.id}
                    onClick={() => {
                      setActiveGuide(null);
                      setSelectedPhone(popPhone);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 w-4 text-center">
                      0{idx + 1}
                    </span>
                    <div className="w-15 h-12 bg-slate-950 rounded-lg overflow-hidden p-0 shrink-0 border border-slate-200 dark:border-slate-800">
                      <img
                        src={popPhone.image}
                        alt={popPhone.name}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="post-title font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {popPhone.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {(popPhone.viewsCount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // Guide Listing View (Matches Second-gsmscope.vercel.app/guides)
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 1. Header */}
      <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
              Buying guides
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Practical advice to help you spend your money well.
            </p>
          </div>

          {/* Search bar Form */}
          <form onSubmit={handleGuideSearchSubmit} className="relative w-full sm:w-80 flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  startGlobalLoading();
                  setTimeout(stopGlobalLoading, 220);
                }}
                placeholder="Search guides, tools, tips..."
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    startGlobalLoading();
                    setTimeout(stopGlobalLoading, 200);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearchingGuides}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              {isSearchingGuides ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>{isSearchingGuides ? '...' : 'Go'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleSelectCategory(cat)}
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

      {/* 3. Guides List - Starting with One Big Guide Display + Rest Beneath It */}
      {filteredGuides.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">No guides found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query or selecting a different category.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ONE BIG Grid Display (Lead Featured Guide) */}
          {(() => {
            const leadGuide = filteredGuides[0];
            return (
              <div
                onClick={() => handleSelectGuide(leadGuide)}
                className="group rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 hover:border-emerald-500 p-6 sm:p-8 flex flex-col gap-4 shadow-xl cursor-pointer transition-all"
              >
                <div className="space-y-3.5 w-full">
                  <div className="flex items-center gap-2">
                    <span className="site-badge text-[9px] font-mono uppercase tracking-wider font-bold text-white bg-emerald-600 px-1.5 py-px rounded">
                      Featured Guide
                    </span>
                  </div>

                  <h2 className="post-title text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {leadGuide.title}
                  </h2>

                  <div className="w-full h-48 sm:h-60 md:h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <img
                      src={leadGuide.image}
                      alt={leadGuide.title}
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
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{leadGuide.author}</span>
                    <span>·</span>
                    <span>{leadGuide.date}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-500" />
                      {leadGuide.readTime}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Ad Placement: Buying Guides Page — Below Featured Guide */}
          <AdPlacementSlot placementId="guides_below_featured" />

          {/* Rest of the Guides beneath it in multi-column layout */}
          {filteredGuides.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filteredGuides.slice(1).map((g) => (
                <div
                  key={g.id}
                  onClick={() => handleSelectGuide(g)}
                  className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition-all overflow-hidden shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {g.image && (
                      <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden border-b border-slate-100 dark:border-slate-800">
                        <img
                          src={g.image}
                          alt={g.title}
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
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="site-badge text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-px rounded border border-emerald-200 dark:border-emerald-500/30">
                          {g.category}
                        </span>
                        <span>{g.date}</span>
                      </div>

                      <h3 className="post-title font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk'] leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {g.title}
                      </h3>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{g.author}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-normal group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>Read guide</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
