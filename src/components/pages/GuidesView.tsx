import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Tag, 
  Wrench, 
  BatteryCharging, 
  ShieldCheck, 
  Smartphone,
  Share2,
  Check,
  Search,
  Filter
} from 'lucide-react';

interface GuideItem {
  id: string;
  title: string;
  category: 'Buying Guide' | 'FRP & Servicing Tools' | 'Charging & Battery' | 'Tips & Security';
  brandTag?: string;
  summary: string;
  content: string[];
  author: string;
  date: string;
  readTime: string;
  image: string;
}

export default function GuidesView() {
  const { setActiveTab, setSelectedPhone, phones } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeGuide, setActiveGuide] = useState<GuideItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const guidesList: GuideItem[] = [
    {
      id: 'guide-1',
      title: 'Best phones under $151 / £113 (₦200,000) in Nigeria right now',
      category: 'Buying Guide',
      brandTag: 'Infinix & Tecno',
      summary: 'Budget phones have caught up fast. These are the models we would buy with ₦200,000 or less with high refresh displays, 5000mAh batteries and Type-C fast charge.',
      content: [
        'Finding value under ₦200,000 in Nigerian retail markets like Computer Village (Ikeja) and online hubs like Jumia has gotten significantly better over the past year. Entry-level chipsets have evolved from laggy quad-core silicon to smooth MediaTek Helio G85/G99 and Unisoc T606/T612 processors.',
        'Our top recommendation remains the Infinix Hot 40 / Tecno Spark 20 series for their balanced 8GB extended RAM configurations, dependable 5000 mAh batteries with 18W–33W fast charge, and verified Carlcare warranty support nationwide.',
        'When purchasing in local markets, ensure you verify the sealed package to avoid open-box swap units and confirm the IMEI matches on both the phone box and SIM tray.'
      ],
      author: 'Chidi Nwosu',
      date: '17 Sept 2026',
      readTime: '6 min read',
      image: '/src/assets/images/news_nigeria_tech_1792578846595.jpg'
    },
    {
      id: 'guide-2',
      title: 'How to Enable ADB on Samsung Using Quick Share (FRP Bypass & Servicing)',
      category: 'FRP & Servicing Tools',
      brandTag: 'Samsung',
      summary: 'A step-by-step technical guide to enabling Android Debug Bridge (ADB) on modern Samsung One UI devices using TalkBack, Quick Share, and official diagnostic tools.',
      content: [
        'Android Debug Bridge (ADB) is the primary diagnostic protocol used by phone technicians across Nigeria to troubleshoot system issues, remove forgotten lock credentials with proof of ownership, and flash carrier binaries.',
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
      category: 'FRP & Servicing Tools',
      brandTag: 'Universal Android',
      summary: 'A comprehensive guide to BFT Tool, a Windows-based Android servicing utility supporting FRP removal, factory reset, and account servicing for Samsung, Xiaomi, and other Android devices.',
      content: [
        'BFT Tool has become one of the most widely used diagnostic toolkits in repair centers across Lagos and Port Harcourt. It supports direct MTP mode operations, ADB shell commands, and emergency EDL flashing on Qualcomm chipsets.',
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
      category: 'FRP & Servicing Tools',
      brandTag: 'Samsung & Xiaomi',
      summary: 'A comprehensive walkthrough of SamFw FRP Tool, a trusted servicing utility supporting Samsung test mode (*#0*#), Knox diagnostics, and Xiaomi sideload operations.',
      content: [
        'SamFw Tool remains the benchmark free servicing software for Nigerian smartphone technicians. Its ability to send test mode exploits (*#0*# or *#*#88#*#*) allows ADB authorization in seconds on supported security patch levels.',
        'The guide details how to execute CSC change commands without wiping data, enabling native call recording and regional Nigerian network optimizations on imported US and European Galaxy variants.'
      ],
      author: 'GsmScope Tech Desk',
      date: '1 Sept 2026',
      readTime: '9 min read',
      image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg'
    },
    {
      id: 'guide-5',
      title: 'Fast charging explained: what 45W, 90W and 120W really mean in Nigeria',
      category: 'Charging & Battery',
      brandTag: 'Battery & Power',
      summary: 'Bigger numbers charge faster, but only with the right charger, cable and temperature control. Here is how Nigerian power realities affect fast charging longevity.',
      content: [
        'Proprietary fast charging protocols like Infinix All-Round FastCharge (70W–100W), Tecno Ultra Charge (70W), and Xiaomi HyperCharge (120W) require specialized charge pumps and dual-cell battery designs.',
        'With ambient Nigerian temperatures frequently exceeding 32°C, charging silicon automatically throttles wattage to protect battery health. Charging in a ventilated room or utilizing Bypass Charging during gaming preserves your battery cell capacity over 3+ years.'
      ],
      author: 'Amaka Obi',
      date: '29 Aug 2026',
      readTime: '5 min read',
      image: '/src/assets/images/news_nigeria_tech_1792578846595.jpg'
    },
    {
      id: 'guide-6',
      title: 'Free Samsung, Redmi, Tecno & Infinix FRP Bypass Servicing Tools',
      category: 'FRP & Servicing Tools',
      brandTag: 'Multi-Brand',
      summary: 'A curated list of verified free Android servicing tools including SAMFW Tool, BFT Tool, and MTK Client for diagnosing and restoring locked Android hardware.',
      content: [
        'Technicians in Ikeja Computer Village rely on a stable suite of open-source and freeware tools. This guide compares MTK Client for MediaTek chipsets, Qualcomm QFIL for raw XML flashing, and dedicated Samsung MTP unlockers.',
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
      category: 'FRP & Servicing Tools',
      brandTag: 'Samsung Knox Guard',
      summary: 'A practical tutorial on how technicians analyze Knox Guard (KG) locked devices, verify carrier leasing status, and enable ADB for troubleshooting.',
      content: [
        'Knox Guard (KG) status (Active, Completed, Checking) controls whether device bootloaders and debugging interfaces can be enabled. We explain how to identify genuine Nigerian network contract status versus gray-market locked units before purchasing second-hand.'
      ],
      author: 'GsmScope Tech Desk',
      date: '22 Aug 2026',
      readTime: '8 min read',
      image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg'
    }
  ];

  const categories = ['All', 'Buying Guide', 'FRP & Servicing Tools', 'Charging & Battery', 'Tips & Security'];

  const filteredGuides = guidesList.filter(g => {
    if (selectedCategory !== 'All' && g.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return g.title.toLowerCase().includes(q) || g.summary.toLowerCase().includes(q) || (g.brandTag && g.brandTag.toLowerCase().includes(q));
    }
    return true;
  });

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If viewing single guide
  if (activeGuide) {
    return (
      <div className="space-y-8 animate-fadeIn pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button onClick={() => setActiveTab('home')} className="hover:text-emerald-500">Home</button>
          <span>/</span>
          <button onClick={() => setActiveGuide(null)} className="hover:text-emerald-500">Buying guides</button>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-xs">{activeGuide.title}</span>
        </div>

        {/* Guide Article Body */}
        <article className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                {activeGuide.category}
              </span>
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link copied!' : 'Share guide'}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight leading-tight">
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

          {/* Lead Summary Callout */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
            {activeGuide.summary}
          </div>

          {/* Paragraphs */}
          <div className="space-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            {activeGuide.content.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Back button */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                setActiveGuide(null);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              ← Back to all guides
            </button>
            <button
              onClick={() => {
                setActiveTab('phones');
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Explore phone database</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>
      </div>
    );
  }

  // Guide Listing View (Matches Second-gsmscope.vercel.app/guides)
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 1. Header & Breadcrumbs matching reference */}
      <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button onClick={() => setActiveTab('home')} className="hover:text-emerald-500">Home</button>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">Buying guides</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
              Buying guides
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Practical advice to help you spend your money well.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, tools, tips..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
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
                onClick={() => {
                  setActiveGuide(leadGuide);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="group rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 hover:border-emerald-500 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl cursor-pointer transition-all"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-md">
                      Featured Guide
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                      {leadGuide.category}
                    </span>
                    {leadGuide.brandTag && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        · {leadGuide.brandTag}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {leadGuide.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {leadGuide.summary}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
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

                <div className="w-full sm:w-64 h-48 rounded-2xl overflow-hidden shrink-0 bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <img
                    src={leadGuide.image}
                    alt={leadGuide.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            );
          })()}

          {/* Rest of the Guides beneath it in multi-column layout */}
          {filteredGuides.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filteredGuides.slice(1).map((g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    setActiveGuide(g);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition-all p-5 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                        {g.category}
                      </span>
                      <span>{g.date}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk'] leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {g.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {g.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{g.author}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
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
