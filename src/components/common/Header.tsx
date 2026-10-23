import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { Search, Scale, Menu, X, Sun, Moon } from 'lucide-react';

export default function Header() {
  const { 
    activeTab, 
    setActiveTab, 
    setSelectedPhone,
    setSelectedArticle,
    compareList, 
    currency, 
    toggleCurrency,
    setFilterState,
    theme,
    toggleTheme
  } = useApp();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');

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

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchTerm.trim()) {
      setFilterState((prev) => ({ ...prev, searchQuery: headerSearchTerm.trim() }));
      setSelectedPhone(null);
      setSelectedArticle(null);
      setActiveTab('phones');
      setHeaderSearchOpen(false);
      setHeaderSearchTerm('');
    }
  };

  const handleNavClick = (tab: ActiveTab) => {
    setSelectedPhone(null);
    setSelectedArticle(null);
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#061a11]/95 dark:bg-[#061a11]/95 backdrop-blur-md border-b border-emerald-950/80 shadow-md">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: GsmScope Brand Logo / Wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 cursor-pointer focus:outline-none shrink-0 text-left"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold font-mono text-base">
                  G
                </div>
                <span className="font-extrabold text-xl tracking-tight text-white font-['Space_Grotesk'] whitespace-nowrap">
                  Gsm<span className="text-emerald-400">Scope</span>
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-tight">
                Mobile reviews, specs and prices
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Single-Line Clean Typography) */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => handleNavClick(item.tab)}
                  className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-emerald-400 font-semibold'
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

          {/* Zone 3: Currency Switcher, Socials, Dark/Light Mode Switch, Search Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Social media links matching Second-gsmscope.vercel.app */}
            <div className="hidden md:flex items-center gap-1 text-slate-300 border-r border-emerald-950/80 pr-2">
              <a
                href="https://www.facebook.com/share/1HKzhSt52c/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="GsmScope on Facebook"
                aria-label="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8z"/></svg>
              </a>
              <a
                href="https://www.youtube.com/@gsm_scope"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="GsmScope on YouTube"
                aria-label="YouTube"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9 5 3-5 3z"/></svg>
              </a>
            </div>

            {/* Currency Switcher: NGN ₦ / USD $ */}
            <button
              onClick={toggleCurrency}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-[#0a2a1a] border border-emerald-500/30 text-emerald-300 hover:bg-emerald-950 transition-colors shadow-sm cursor-pointer"
              title={`Switch currency (Current: ${currency})`}
            >
              <span>{currency === 'NGN' ? '₦ NGN' : '$ USD'}</span>
            </button>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-400" />
              )}
              <span className="hidden sm:inline text-[11px] text-slate-300 capitalize">{theme}</span>
            </button>

            {/* Search Open Toggle */}
            <button
              onClick={() => setHeaderSearchOpen(!headerSearchOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Search phones by specs"
              aria-label="Toggle search form"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Input Row */}
        {headerSearchOpen && (
          <form onSubmit={handleHeaderSearch} className="py-3 border-t border-emerald-950/60 animate-fadeIn">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={headerSearchTerm}
                onChange={(e) => setHeaderSearchTerm(e.target.value)}
                placeholder="Search smartphone by name, brand, or specs..."
                className="w-full pl-9 pr-24 py-2 bg-[#061a11] border border-emerald-500/40 rounded-lg text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
              >
                Search
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-950 bg-[#061a11] px-4 pt-2 pb-5 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
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
          <div className="pt-3 border-t border-emerald-950/60 flex items-center justify-between text-xs text-slate-300">
            <button
              onClick={() => {
                toggleCurrency();
              }}
              className="flex items-center gap-1 font-mono"
            >
              <span>Currency: </span>
              <strong className="text-emerald-400">{currency}</strong>
            </button>
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 text-slate-200"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="capitalize">{theme} Mode</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
