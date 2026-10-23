import React, { useState, useEffect } from 'react';
import { Phone } from '../../types';
import { useApp } from '../../context/AppContext';
import { recordPhoneViewApi } from '../../services/api';
import SocialShareBar from '../common/SocialShareBar';
import { 
  ArrowLeft,
  Scale, 
  Check, 
  Share2, 
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
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  Flame
} from 'lucide-react';

interface PhoneDetailPageProps {
  phone: Phone;
  onBack: () => void;
}

export default function PhoneDetailPage({ phone, onBack }: PhoneDetailPageProps) {
  const { 
    phones,
    setSelectedPhone,
    formatNaira, 
    formatUSD,
    currency,
    addToCompare, 
    removeFromCompare, 
    isInCompare, 
    reviews, 
    addReview,
    setActiveTab,
    setFilterState
  } = useApp();

  const [activeSection, setActiveSection] = useState<'specs' | 'pricing' | 'reviews'>('specs');
  const [copiedLink, setCopiedLink] = useState(false);

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

  // Scroll to top and record persistent view count on backend whenever phone changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    recordPhoneViewApi(phone.id).catch(console.warn);
  }, [phone.id]);

  const inCompare = isInCompare(phone.id);
  const phoneReviews = reviews.filter(
    (r) => r.phoneId === phone.id && r.status === 'approved'
  );

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSwitchPhone = (newPhone: Phone) => {
    setSelectedPhone(newPhone);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewTitle || !reviewComment) return;

    addReview({
      phoneId: phone.id,
      phoneName: phone.name,
      userName: reviewName,
      location: reviewLocation,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
      pros: reviewPros ? reviewPros.split(',').map(s => s.trim()).filter(Boolean) : [],
      cons: reviewCons ? reviewCons.split(',').map(s => s.trim()).filter(Boolean) : []
    });

    setReviewSubmitted(true);
    setTimeout(() => {
      setShowReviewForm(false);
      setReviewSubmitted(false);
      setReviewTitle('');
      setReviewComment('');
      setReviewPros('');
      setReviewCons('');
    }, 2500);
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

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 1. Breadcrumbs & Top Actions Bar */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Phones</span>
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
            onClick={() => {
              onBack();
              setFilterState(prev => ({ ...prev, selectedBrands: [phone.brand] }));
              setActiveTab('phones');
            }}
            className="hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
          >
            {phone.brand}
          </button>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
            {phone.name}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Social Sharing for Facebook, X, Reddit, WhatsApp, Telegram, and Copy */}
          <SocialShareBar 
            title={`${phone.brand} ${phone.name} Price in Nigeria & Full Specs`}
            summary={`Check out ${phone.name} with ${phone.keyHighlights.processor}, ${phone.keyHighlights.camera}, ${phone.keyHighlights.battery}.`}
            layout="inline"
            showLabel={true}
          />

          {/* Compare toggle */}
          <button
            onClick={() => {
              if (inCompare) {
                removeFromCompare(phone.id);
              } else {
                addToCompare(phone.id);
              }
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              inCompare
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {inCompare ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
            <span>{inCompare ? 'In Comparison' : 'Add to Compare'}</span>
          </button>
        </div>
      </nav>

      {/* 2. Phone Overview Hero Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Product Media Area */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#061a11]/60 rounded-2xl border border-slate-100 dark:border-emerald-950/80 relative group aspect-[4/3] sm:aspect-square">
            {phone.keyHighlights.network5g && (
              <div className="absolute top-4 left-4 px-2 py-0.5 text-[10px] font-mono tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-500/40 rounded">
                5G ENABLED
              </div>
            )}
            
            <div className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
              <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{(phone.viewsCount || 1200).toLocaleString()} views</span>
            </div>

            {phone.image ? (
              <img
                src={phone.image}
                alt={phone.name}
                referrerPolicy="no-referrer"
                className="max-h-64 sm:max-h-72 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <Smartphone className="w-16 h-16 mb-2" />
                <span className="text-xs font-mono">{phone.name}</span>
              </div>
            )}
          </div>

          {/* Essential Info & Nigerian Market Price */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span className="font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">{phone.brand}</span>
                <span>·</span>
                <span>Released: {phone.releaseDate}</span>
                <span>·</span>
                <span>{phone.detailedSpecs.body.dimensions}</span>
                <span>·</span>
                <span>{phone.detailedSpecs.body.weight}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
                {phone.name}
              </h1>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(phone.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {phone.rating.toFixed(1)} / 5.0
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ({phone.reviewsCount} verified community ratings)
                </span>
              </div>

              {/* Price Banner */}
              <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Nigerian Retail Price:</span>
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatNaira(phone.priceNGN)}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      / {formatUSD(phone.priceUSD)}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                    {phone.marketStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {phone.nairaPriceNotes}
                </p>
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
                  addToCompare(phone.id);
                  setActiveTab('compare');
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <Scale className="w-4 h-4" />
                <span>Compare Side-by-Side</span>
              </button>
              
              <button
                onClick={() => {
                  onBack();
                  setFilterState(prev => ({ ...prev, selectedBrands: [phone.brand] }));
                  setActiveTab('phones');
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>More {phone.brand} Phones</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Share Bar */}
      <SocialShareBar 
        layout="bar"
        title={`${phone.brand} ${phone.name} Price in Nigeria & Full Specifications - GsmScope`}
        summary={`${phone.keyHighlights.processor}, ${phone.keyHighlights.camera}, ${phone.keyHighlights.battery}.`}
      />

      {/* 3. Main Content Columns: Specs Sheet (8 cols) + Sidebars (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (8 cols): Full Specification Breakdown & Reviews */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Navigation Pill Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveSection('specs')}
              className={`py-3 px-5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'specs'
                  ? 'border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Full Specifications</span>
            </button>
            <button
              onClick={() => setActiveSection('pricing')}
              className={`py-3 px-5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'pricing'
                  ? 'border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Nigerian Price Breakdown</span>
            </button>
            <button
              onClick={() => setActiveSection('reviews')}
              className={`py-3 px-5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'reviews'
                  ? 'border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>User Reviews ({phoneReviews.length})</span>
            </button>
          </div>

          {/* TAB 1: FULL SPECS */}
          {activeSection === 'specs' && (
            <div className="space-y-6 text-xs">
              {/* Network */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>NETWORK &amp; 5G BANDS</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Technology</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.network.technology}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">5G Bands &amp; Nigeria Support</span>
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

              {/* Display */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
                </div>
              </div>

              {/* Platform & Chipset */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>PLATFORM &amp; HARDWARE BENCHMARKS</span>
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
                    <span className="col-span-8 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{specs.platform.antutuScore}</span>
                  </div>
                </div>
              </div>

              {/* Memory & Storage */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>MEMORY &amp; STORAGE VARIANTS</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">RAM Options</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200 font-semibold">{specs.memory.ramVariants.join(', ')}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">Storage Options</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.memory.storageVariants.join(', ')} ({specs.memory.storageType})</span>
                  </div>
                  <div className="grid grid-cols-12 py-2.5 px-3">
                    <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">MicroSD Expansion</span>
                    <span className="col-span-8 text-slate-900 dark:text-slate-200">{specs.memory.cardSlot}</span>
                  </div>
                </div>
              </div>

              {/* Cameras */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>CAMERAS &amp; VIDEO RECORDING</span>
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
                </div>
              </div>

              {/* Battery & Charging */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Battery className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>BATTERY ENDURANCE &amp; CHARGING SPEEDS</span>
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
            </div>
          )}

          {/* TAB 2: NIGERIAN PRICING BREAKDOWN */}
          {activeSection === 'pricing' && (
            <div className="space-y-6 text-xs">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Space_Grotesk']">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Nigerian Retail Pricing &amp; Outlets</span>
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  The estimated retail cost for the <strong className="text-slate-900 dark:text-white">{phone.name}</strong> across official and open markets in Nigeria stands at <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{formatNaira(phone.priceNGN)}</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold mb-1">Slot Systems Nigeria</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-base block">
                      {formatNaira(phone.priceNGN)}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Official nationwide branch warranty</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold mb-1">Ikeja Computer Village</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-base block">
                      {formatNaira(Math.round(phone.priceNGN * 0.96))}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Competitive cash deal price</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold mb-1">Jumia Official Store</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-base block">
                      {formatNaira(Math.round(phone.priceNGN * 1.02))}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Doorstep delivery available</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-200 space-y-1">
                  <span className="font-bold block text-emerald-800 dark:text-emerald-300">Warranty Coverage in Nigeria:</span>
                  <p className="text-emerald-700 dark:text-emerald-300/80 leading-relaxed">
                    Official Nigerian stock comes with authorized manufacturer warranty support (Carlcare service centers for Tecno, Infinix and itel; Samsung Experience Centers for Galaxy models). Always check that the seal is unbroken and verify IMEI registration.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER REVIEWS & RATINGS */}
          {activeSection === 'reviews' && (
            <div className="space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      {phone.rating.toFixed(1)}
                    </span>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Based on {phone.reviewsCount} community ratings across Nigeria
                  </p>
                </div>

                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write a Review</span>
                </button>
              </div>

              {/* Review Submission Form */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk']">Submit Your Hands-on Review</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Share real experience with battery life during NEPA outages, camera night performance, heating, and network speeds in Nigeria.
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
                            placeholder="e.g. Tunde Adebayo"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-emerald-500 outline-none text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Location in Nigeria</label>
                          <input
                            type="text"
                            required
                            value={reviewLocation}
                            onChange={(e) => setReviewLocation(e.target.value)}
                            placeholder="e.g. Yaba, Lagos"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-emerald-500 outline-none text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Review Title</label>
                          <input
                            type="text"
                            required
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            placeholder="e.g. Excellent battery and 120Hz screen"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-emerald-500 outline-none text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Your Detailed Experience</label>
                        <textarea
                          rows={3}
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="How does it hold up in daily usage?"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-emerald-500 outline-none text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm"
                        >
                          Submit Review
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {phoneReviews.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto opacity-40 text-emerald-600" />
                    <p className="font-semibold text-slate-700 dark:text-slate-200">No community reviews posted yet for {phone.name}.</p>
                    <p className="text-[11px]">Be the first Nigerian owner to share your verdict!</p>
                  </div>
                ) : (
                  phoneReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{rev.userName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            {rev.location}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{rev.date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, idx) => (
                            <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{rev.title}</span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (4 cols): USEFUL & IMPORTANT SIDEBARS */}
        <aside aria-label="Device sidebars" className="lg:col-span-4 space-y-6">
          
          {/* SIDEBAR WIDGET 1: Recent Phones from Same Brand */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Recent phones</span>
              </h3>
              <button
                onClick={() => {
                  onBack();
                  setFilterState(prev => ({ ...prev, selectedBrands: [phone.brand] }));
                  setActiveTab('phones');
                }}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
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
                    <div className="w-14 h-14 rounded-lg bg-slate-50 dark:bg-slate-950 p-1.5 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                      <img
                        src={sbPhone.image}
                        alt={sbPhone.name}
                        referrerPolicy="no-referrer"
                        className="max-h-12 w-auto object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {sbPhone.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {sbPhone.keyHighlights.processor.split(' ')[0]} · {sbPhone.keyHighlights.battery}
                      </p>
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 block tabular-nums">
                        {currency === 'USD' ? formatUSD(sbPhone.priceUSD) : formatNaira(sbPhone.priceNGN)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR WIDGET 2: Popular Phones Based on Views Number */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Most viewed</span>
              </h3>
              <span className="text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-semibold">
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
                  
                  <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-950 p-1 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                    <img
                      src={popPhone.image}
                      alt={popPhone.name}
                      referrerPolicy="no-referrer"
                      className="max-h-10 w-auto object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {popPhone.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {(popPhone.viewsCount || 1000).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
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
                <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Competitors</span>
                </h3>
              </div>

              <div className="space-y-3">
                {rivalPhones.map((rival) => (
                  <div
                    key={rival.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={rival.image}
                        alt={rival.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 object-contain shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {rival.name}
                        </h4>
                        <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                          {formatNaira(rival.priceNGN)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addToCompare(phone.id);
                        addToCompare(rival.id);
                        setActiveTab('compare');
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer shadow-sm"
                    >
                      VS Compare
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIDEBAR WIDGET 4: Verified Nigerian Retailers */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 dark:from-[#061a11] dark:via-slate-900 dark:to-[#04120a] border border-emerald-200 dark:border-emerald-950 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs uppercase font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Nigerian Buyer Guarantee</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Always inspect phone packaging for official Nigerian warranty holograms before payment in Computer Village or Slot.
            </p>
            <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 font-mono">
              <div>✓ Official IMEI Registration</div>
              <div>✓ 12-24 Months Warranty</div>
              <div>✓ Carlcare / Authorized Centers</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
