import { useApp } from '../../context/AppContext';
import { ExternalLink, Tag } from 'lucide-react';

interface AdBannerProps {
  type: 'top' | 'sidebar' | 'inline';
}

export default function AdBanner({ type }: AdBannerProps) {
  const { adSettings, phones, articles, setActiveTab, setSelectedPhone, setSelectedArticle } = useApp();

  const handleBannerLink = (rawUrl: string | undefined, fallbackTab: 'phones' | 'compare') => {
    const url = (rawUrl || '').trim();
    if (!url || url === '#') {
      setActiveTab(fallbackTab);
      return;
    }
    if (url.startsWith('/?') || url.startsWith('?')) {
      const searchStr = url.startsWith('/') ? url.slice(1) : url;
      const params = new URLSearchParams(searchStr);
      const phoneParam = params.get('phone');
      const articleParam = params.get('article');
      const tabParam = params.get('tab');
      if (phoneParam) {
        const matched = phones.find((p) => p.id.toLowerCase() === phoneParam.toLowerCase());
        if (matched) {
          setSelectedPhone(matched);
          return;
        }
      }
      if (articleParam) {
        const matchedArt = articles.find((a) => a.id === articleParam || a.slug === articleParam);
        if (matchedArt) {
          setSelectedArticle(matchedArt);
          return;
        }
      }
      if (tabParam) {
        setSelectedPhone(null);
        setSelectedArticle(null);
        setActiveTab(tabParam as any);
        return;
      }
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.location.href = url;
      return;
    }
    setActiveTab(fallbackTab);
  };

  if (type === 'top') {
    if (!adSettings.topBanner.enabled) return null;
    return (
      <aside aria-label="Sponsored promotion" className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border-b border-emerald-500/20 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              {adSettings.topBanner.tag}
            </span>
            <span className="font-semibold text-white">
              {adSettings.topBanner.title}:
            </span>
            <span className="text-slate-300 hidden sm:inline">
              {adSettings.topBanner.subtitle}
            </span>
          </div>
          <button
            onClick={() => handleBannerLink(adSettings.topBanner.linkUrl, 'phones')}
            className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Explore verified deals</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </aside>
    );
  }

  if (type === 'sidebar' || type === 'inline') {
    if (!adSettings.sidebarBanner.enabled) return null;
    return (
      <aside aria-label="Sponsored partner" className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1">
            <Tag className="w-3 h-3" /> Sponsored Partner
          </span>
          <span>{adSettings.sidebarBanner.sponsor}</span>
        </div>
        <h4 className="font-semibold text-white text-sm mb-1">
          {adSettings.sidebarBanner.title}
        </h4>
        <p className="text-xs text-slate-300 mb-3">
          {adSettings.sidebarBanner.subtitle}
        </p>
        <button
          onClick={() => handleBannerLink(adSettings.sidebarBanner.linkUrl, 'compare')}
          className="w-full py-2 px-3 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-lg hover:bg-emerald-900/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Compare Swap Values</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </aside>
    );
  }

  return null;
}
