import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { Search, Menu, X, Sun, Moon, Loader2 } from 'lucide-react';
import AdPlacementSlot from './AdPlacementSlot';
import PredictiveSearchDropdown from './PredictiveSearchDropdown';

export default function Header() {
  const { 
    activeTab, 
    setActiveTab, 
    setSelectedPhone,
    setSelectedArticle,
    setSelectedBrand,
    compareList, 
    setFilterState,
    resetFilters,
    theme,
    toggleTheme,
    triggerNavigation,
    websiteContent,
    isAdminAuthenticated
  } = useApp();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showPredictive, setShowPredictive] = useState(false);
  const [predictiveIndex, setPredictiveIndex] = useState(-1);

  const navItems: { tab: ActiveTab; label: string }[] = [
    { tab: 'home', label: 'Home' },
    { tab: 'phones', label: 'Phones' },
    { tab: 'best-phones', label: 'Best Phones' },
    { tab: 'compare', label: 'Compare' },
    { tab: 'reviews', label: 'Reviews' },
    { tab: 'news', label: 'News' },
    { tab: 'guides', label: 'Guides' },
    { tab: 'brands', label: 'Brands' },
  ];

  const handleHeaderSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headerSearchTerm.trim() || isSearching) return;
    const query = headerSearchTerm.trim();
    setIsSearching(true);
    await triggerNavigation(async () => {
      resetFilters();
      setFilterState((prev) => ({ ...prev, searchQuery: query }));
      setSelectedPhone(null);
      setSelectedArticle(null);
      setSelectedBrand(null);
      setActiveTab('phones');
      setHeaderSearchOpen(false);
      setHeaderSearchTerm('');
    });
    setIsSearching(false);
  };

  const handleNavClick = (tab: ActiveTab) => {
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
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const headerLogoSrc = websiteContent?.headerLogoDarkUrl || websiteContent?.headerLogoUrl || '/assets/aistudio/GsmScope_header_logo_dark.webp';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#061a11]/95 backdrop-blur-md border-b border-emerald-950/80 shadow-md">
      {/* Top Header Ad Placement (Dynamic & synced from Admin Dashboard) */}
      <AdPlacementSlot placementId="header_top" />

      <div className="w-full px-[calc(1rem-5px)] sm:px-[calc(2rem-5px)] lg:px-[calc(3rem-5px)]">
        <div className="flex items-center justify-between gap-6 h-[57px]">
          {/* Zone 1: GsmScope Brand Logo (Enlarged and crisp on dark background) */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center cursor-pointer focus:outline-none shrink-0 py-1 transition-opacity hover:opacity-95"
            aria-label={`${websiteContent?.siteName || 'GsmScope'} Home`}
          >
            <img
              src={headerLogoSrc}
              alt={`${websiteContent?.siteName || 'GsmScope'} - ${websiteContent?.siteTagline || 'Mobile Reviews & Specifications'}`}
              className="h-10 sm:h-11 md:h-12 w-auto object-contain select-none"
            />
          </button>

          {/* Zone 2: Navigation Links (Single-Line Clean Typography on Dark Header) */}
          <nav className="hidden lg:flex items-center gap-5 text-[16px] font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => handleNavClick(item.tab)}
                  className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-emerald-400 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {item.tab === 'compare' && compareList.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {compareList.length}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Socials, Dark/Light Mode Switch, Search Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Social media links */}
            <div className="hidden md:flex items-center gap-1 text-slate-300 border-r border-emerald-950/80 pr-2">
              <a
                href={websiteContent?.facebookUrl || 'https://www.facebook.com/share/1HKzhSt52c/'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={`${websiteContent?.siteName || 'GsmScope'} on Facebook`}
                aria-label="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8z"/></svg>
              </a>
              <a
                href={websiteContent?.youtubeUrl || 'https://www.youtube.com/@gsm_scope'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={`${websiteContent?.siteName || 'GsmScope'} on YouTube`}
                aria-label="YouTube"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9 5 3-5 3z"/></svg>
              </a>
            </div>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Search Open Toggle */}
            <button
              onClick={() => {
                const nextOpen = !headerSearchOpen;
                setHeaderSearchOpen(nextOpen);
                if (nextOpen) {
                  setShowPredictive(true);
                  setPredictiveIndex(-1);
                } else {
                  setShowPredictive(false);
                }
              }}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Search phones by specs"
              aria-label="Toggle search form"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Input Row with Predictive Search */}
        {headerSearchOpen && (
          <div className="relative py-3 border-t border-emerald-950/60 animate-fadeIn">
            <form onSubmit={handleHeaderSearch}>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={headerSearchTerm}
                  onFocus={() => setShowPredictive(true)}
                  onChange={(e) => {
                    setHeaderSearchTerm(e.target.value);
                    setShowPredictive(true);
                    setPredictiveIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setShowPredictive(true);
                      setPredictiveIndex((prev) => (prev < 5 ? prev + 1 : 0));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setPredictiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
                    } else if (e.key === 'Escape') {
                      setShowPredictive(false);
                    }
                  }}
                  placeholder="Search smartphone by name, brand, or specs..."
                  className="w-full pl-9 pr-24 py-2 bg-[#061a11] border border-emerald-500/40 rounded-lg text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-1 top-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Searching</span>
                    </>
                  ) : (
                    <span>Search</span>
                  )}
                </button>
              </div>
            </form>

            {/* Predictive Search Suggestions Dropdown */}
            <PredictiveSearchDropdown
              searchTerm={headerSearchTerm}
              isOpen={showPredictive}
              onClose={() => setShowPredictive(false)}
              selectedIndex={predictiveIndex}
              setSelectedIndex={setPredictiveIndex}
              onSelectPhone={(phone) => {
                triggerNavigation(() => {
                  setSelectedArticle(null);
                  setSelectedBrand(null);
                  setSelectedPhone(phone);
                  setHeaderSearchOpen(false);
                  setShowPredictive(false);
                  setHeaderSearchTerm('');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                });
              }}
              onSubmitSearch={(query) => {
                triggerNavigation(() => {
                  resetFilters();
                  setFilterState((prev) => ({ ...prev, searchQuery: query }));
                  setSelectedPhone(null);
                  setSelectedArticle(null);
                  setSelectedBrand(null);
                  setActiveTab('phones');
                  setHeaderSearchOpen(false);
                  setShowPredictive(false);
                  setHeaderSearchTerm('');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                });
              }}
            />
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-950 bg-[#061a11] px-4 pt-2 pb-5 space-y-1.5 shadow-lg">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {item.tab === 'compare' && compareList.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {compareList.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
