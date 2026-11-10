import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { Mail, Check, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Footer() {
  const { 
    setActiveTab, 
    setCategoryPreset, 
    resetFilters,
    setSelectedPhone, 
    setSelectedArticle, 
    setSelectedBrand,
    triggerNavigation,
    startGlobalLoading, 
    stopGlobalLoading, 
    showGlobalToast,
    websiteContent
  } = useApp();

  const handleFooterNav = (tab: ActiveTab) => {
    triggerNavigation(() => {
      setSelectedPhone(null);
      setSelectedArticle(null);
      setSelectedBrand(null);
      if (tab === 'phones') {
        resetFilters();
      }
      if (tab === 'guides') {
        window.dispatchEvent(new CustomEvent('gsmscope:reset-guide'));
      }
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#061a11] text-slate-600 dark:text-slate-300 text-xs">
      {/* Main Footer Links Columns */}
      <div className="w-full px-[calc(1rem-5px)] sm:px-[calc(2rem-5px)] lg:px-[calc(3rem-5px)] py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-3">
            <div>
              <button
                onClick={() => handleFooterNav('home')}
                className="inline-flex items-center cursor-pointer focus:outline-none transition-opacity hover:opacity-95 text-left py-0.5"
                aria-label={`${websiteContent?.siteName || 'GsmScope'} Home`}
              >
                {/* Light Mode Logo */}
                <img
                  src={websiteContent?.headerLogoLightUrl || websiteContent?.headerLogoUrl || '/assets/aistudio/GsmScope_header_logo_fc9cfbb4.webp'}
                  alt={`${websiteContent?.siteName || 'GsmScope'} - ${websiteContent?.siteTagline || 'Mobile Reviews & Specifications'}`}
                  className="dark:hidden h-9 sm:h-10 w-auto object-contain select-none"
                />
                {/* Dark Mode Logo */}
                <img
                  src={websiteContent?.headerLogoDarkUrl || websiteContent?.headerLogoUrl || '/assets/aistudio/GsmScope_header_logo_dark.webp'}
                  alt={`${websiteContent?.siteName || 'GsmScope'} - ${websiteContent?.siteTagline || 'Mobile Reviews & Specifications'}`}
                  className="hidden dark:block h-9 sm:h-10 w-auto object-contain select-none"
                />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
              {websiteContent?.aboutSummary || 'GsmScope is a comprehensive world mobile technology platform. Our global database tracks smartphone specifications, market prices, deep comparisons, and industry news.'}
            </p>
            <div className="text-[14px] text-emerald-600 dark:text-emerald-400/90 font-mono flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Independent hardware reviews &amp; specs</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-[19px] mb-3 font-['Space_Grotesk']">
              Explore
            </h4>
            <ul className="space-y-2 text-[15px]">
              <li>
                <button onClick={() => handleFooterNav('phones')} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  All Phones
                </button>
              </li>
              <li>
                <button onClick={() => handleFooterNav('best-phones')} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Best Phones
                </button>
              </li>
              <li>
                <button onClick={() => handleFooterNav('compare')} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Compare Phones
                </button>
              </li>
              <li>
                <button onClick={() => handleFooterNav('news')} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Articles
                </button>
              </li>
              <li>
                <button onClick={() => handleFooterNav('user-reviews')} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  User Reviews
                </button>
              </li>
              <li>
                <button onClick={() => handleFooterNav('brands')} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Brand Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Buying Guides */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-[19px] mb-3 font-['Space_Grotesk']">
              Buying Guides
            </h4>
            <ul className="space-y-2 text-[15px]">
              <li>
                <button onClick={() => { setCategoryPreset('top-rated'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Best phones overall
                </button>
              </li>
              <li>
                <button onClick={() => { setCategoryPreset('best-camera'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Best camera phones
                </button>
              </li>
              <li>
                <button onClick={() => { setCategoryPreset('best-gaming'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Best gaming phones
                </button>
              </li>
              <li>
                <button onClick={() => { setCategoryPreset('best-battery'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Best battery phones
                </button>
              </li>
              <li>
                <button onClick={() => { setCategoryPreset('best-5g'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Best 5G phones
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-[19px] mb-3 font-['Space_Grotesk']">
              Company
            </h4>
            <ul className="space-y-2 text-[15px]">
              <li>
                <button onClick={() => handleFooterNav('about')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => handleFooterNav('contact')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => handleFooterNav('advertise')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Advertise with Us
                </button>
              </li>
              <li>
                <button onClick={() => handleFooterNav('privacy')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleFooterNav('terms')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar & Social Links */}
        <div className="border-t border-slate-200 dark:border-emerald-950/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[15px] text-slate-500 dark:text-slate-400">
          <p>{websiteContent?.footerCopyright || `© ${new Date().getFullYear()} GsmScope. All rights reserved.`}</p>
          <div className="flex items-center gap-4">
            <a
              href={websiteContent?.facebookUrl || 'https://www.facebook.com/share/1HKzhSt52c/'}
              target="_blank"
              rel="noopener noreferrer"
              title={`${websiteContent?.siteName || 'GsmScope'} on Facebook`}
              aria-label={`${websiteContent?.siteName || 'GsmScope'} on Facebook`}
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href={websiteContent?.youtubeUrl || 'https://www.youtube.com/@gsm_scope'}
              target="_blank"
              rel="noopener noreferrer"
              title={`${websiteContent?.siteName || 'GsmScope'} on YouTube`}
              aria-label={`${websiteContent?.siteName || 'GsmScope'} on YouTube`}
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
