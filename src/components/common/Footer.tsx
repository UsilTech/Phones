import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { Mail, Check, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Footer() {
  const { setActiveTab, setCategoryPreset } = useApp();
  const [subEmail, setSubEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setSubEmail('');
      }, 3500);
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#061a11] text-slate-600 dark:text-slate-300 text-xs">
      {/* Newsletter Strip from GsmScope: Price drop and launch alerts */}
      <div className="border-b border-slate-200 dark:border-emerald-950/80 bg-white dark:bg-[#0a2a1a]/50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-1">
            <span className="text-[11px] font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400">
              Stay Ahead
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
              Price drop and launch alerts
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Join the GsmScope list for Nigerian price changes, new phone releases and buying guides. Brands and advertisers can also reach us about sponsored placements.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            {subscribed ? (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>You are subscribed for GsmScope market alerts!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors shrink-0 cursor-pointer shadow-md"
                >
                  Subscribe
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-['Space_Grotesk']">
                Gsm<span className="text-emerald-600 dark:text-emerald-400">Scope</span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              GsmScope is a comprehensive mobile technology platform designed for Nigerian smartphone buyers. Our database tracks phone specifications, current prices in naira and USD, deep comparisons, and industry news.
            </p>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400/90 font-mono flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Independent hardware reviews &amp; specs</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 font-['Space_Grotesk']">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-emerald-400 transition-colors text-left">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('phones')} className="hover:text-emerald-400 transition-colors text-left">
                  All Phones
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('best-phones')} className="hover:text-emerald-400 transition-colors text-left">
                  Best Phones
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('compare')} className="hover:text-emerald-400 transition-colors text-left">
                  Compare Phones
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('news')} className="hover:text-emerald-400 transition-colors text-left">
                  News &amp; Articles
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('reviews')} className="hover:text-emerald-400 transition-colors text-left">
                  User Reviews
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('brands')} className="hover:text-emerald-400 transition-colors text-left">
                  Brand Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Buying Guides */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 font-['Space_Grotesk']">
              Buying Guides
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCategoryPreset('top-rated')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Best phones overall
                </button>
              </li>
              <li>
                <button onClick={() => setCategoryPreset('under-200k')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Best budget phones
                </button>
              </li>
              <li>
                <button onClick={() => setCategoryPreset('best-camera')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Best camera phones
                </button>
              </li>
              <li>
                <button onClick={() => setCategoryPreset('best-gaming')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Best gaming phones
                </button>
              </li>
              <li>
                <button onClick={() => setCategoryPreset('best-battery')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Best battery phones
                </button>
              </li>
              <li>
                <button onClick={() => setCategoryPreset('best-5g')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Best 5G phones
                </button>
              </li>
              <li>
                <button onClick={() => setCategoryPreset('under-100k')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Phones under 100K
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 font-['Space_Grotesk']">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('contact')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('advertise')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Advertise with Us
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                <a href="mailto:info@gsmscope.com" className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                  info@gsmscope.com
                </a>
                <a href="tel:+2349127408003" className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                  +2349127408003
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-slate-200 dark:border-emerald-950/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} GsmScope. All rights reserved. Phone Specs and Prices in Naira and USD.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Prices updated weekly from Slot, Computer Village &amp; Jumia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
