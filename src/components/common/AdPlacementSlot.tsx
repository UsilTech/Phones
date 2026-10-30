import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AdPlacementId, ActiveTab } from '../../types';
import { DEFAULT_AD_PLACEMENTS } from '../../data/seedData';
import { ExternalLink, ArrowRight, Megaphone } from 'lucide-react';

interface AdPlacementSlotProps {
  placementId: AdPlacementId;
  className?: string;
}

export default function AdPlacementSlot({ placementId, className = '' }: AdPlacementSlotProps) {
  const {
    adSettings,
    setActiveTab,
    setSelectedPhone,
    setSelectedArticle,
    phones,
    articles,
    triggerNavigation,
  } = useApp();

  const scriptContainerRef = useRef<HTMLDivElement>(null);

  const defaultConfig = DEFAULT_AD_PLACEMENTS[placementId];
  const savedConfig = adSettings?.placements?.[placementId];
  const placement = savedConfig ? { ...defaultConfig, ...savedConfig } : defaultConfig;

  const isEnabled = Boolean(placement?.enabled);
  const showScript =
    isEnabled &&
    (placement.adType === 'script' || placement.adType === 'both') &&
    Boolean(placement.scriptCode && placement.scriptCode.trim());

  // Automatically load the global Google AdSense script if Publisher ID is configured
  useEffect(() => {
    const rawPubId = (adSettings?.adsensePublisherId || '').trim();
    if (!rawPubId) return;
    const normalizedClient = rawPubId.startsWith('ca-pub-')
      ? rawPubId
      : rawPubId.startsWith('pub-')
        ? `ca-${rawPubId}`
        : `ca-pub-${rawPubId.replace(/\D/g, '')}`;

    if (!normalizedClient || normalizedClient === 'ca-pub-' || normalizedClient.includes('0000000000')) {
      return;
    }

    const shouldLoadAdsense =
      Boolean(adSettings?.adsenseAutoAdsEnabled) ||
      (showScript && Boolean(placement?.scriptCode?.includes('adsbygoogle')));

    if (!shouldLoadAdsense) return;

    const existingScript = document.getElementById('gsmscope-adsense-sdk') as HTMLScriptElement | null;
    const expectedSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(normalizedClient)}`;
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'gsmscope-adsense-sdk';
      script.async = true;
      script.src = expectedSrc;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    } else if (existingScript.src !== expectedSrc) {
      existingScript.src = expectedSrc;
    }
  }, [adSettings?.adsensePublisherId, adSettings?.adsenseAutoAdsEnabled, showScript, placement?.scriptCode]);

  useEffect(() => {
    const container = scriptContainerRef.current;
    if (!container) return;
    container.innerHTML = '';

    if (!showScript || !placement.scriptCode?.trim()) {
      return;
    }

    try {
      const range = document.createRange();
      range.selectNode(container);
      const fragment = range.createContextualFragment(placement.scriptCode);
      container.appendChild(fragment);

      // If the snippet includes an <ins class="adsbygoogle"> without an inline push script, trigger push safely
      if (
        placement.scriptCode.includes('adsbygoogle') &&
        !placement.scriptCode.includes('.push(')
      ) {
        try {
          const w = window as any;
          w.adsbygoogle = w.adsbygoogle || [];
          w.adsbygoogle.push({});
        } catch {}
      }
    } catch (err) {
      console.warn(`Ad script execution warning (${placementId}):`, err);
      container.innerHTML = placement.scriptCode;
    }
  }, [showScript, placement?.scriptCode, placementId]);

  // If disabled, render nothing at all so the page position looks completely normal
  if (!isEnabled) {
    return null;
  }

  const showBanner = placement.adType === 'banner' || placement.adType === 'both';
  const hasLearnMore = Boolean(placement.showLearnMore);
  const learnMoreLabel = (placement.learnMoreText || 'Learn More').trim() || 'Learn More';
  const targetUrl = (placement.learnMoreUrl || '').trim();

  const handleLearnMoreClick = (e: React.MouseEvent) => {
    if (!targetUrl) return;

    // External URLs
    if (/^https?:\/\//i.test(targetUrl)) {
      if (placement.openInNewTab) {
        return; // Let native <a> handle target="_blank"
      }
      window.location.href = targetUrl;
      return;
    }

    e.preventDefault();

    // Internal SPA navigation (e.g. /?tab=phones, #phones, /?phone=...)
    triggerNavigation(() => {
      if (targetUrl.startsWith('#')) {
        const tabName = targetUrl.replace(/^#+/, '').toLowerCase() as ActiveTab;
        setSelectedPhone(null);
        setSelectedArticle(null);
        setActiveTab(tabName || 'phones');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      try {
        const parsed = new URL(targetUrl, window.location.origin);
        const phoneParam = parsed.searchParams.get('phone');
        const articleParam = parsed.searchParams.get('article');
        const tabParam = parsed.searchParams.get('tab') as ActiveTab | null;

        if (phoneParam) {
          const foundPhone = phones.find(
            (p) =>
              p.id.toLowerCase() === phoneParam.toLowerCase() ||
              ((p as any).slug && String((p as any).slug).toLowerCase() === phoneParam.toLowerCase())
          );
          if (foundPhone) {
            setSelectedArticle(null);
            setSelectedPhone(foundPhone);
            window.scrollTo({ top: 0, behavior: 'instant' });
            return;
          }
        }

        if (articleParam) {
          const foundArticle = articles.find(
            (a) =>
              a.id.toLowerCase() === articleParam.toLowerCase() ||
              (a.slug && a.slug.toLowerCase() === articleParam.toLowerCase())
          );
          if (foundArticle) {
            setSelectedPhone(null);
            setSelectedArticle(foundArticle);
            window.scrollTo({ top: 0, behavior: 'instant' });
            return;
          }
        }

        if (tabParam) {
          setSelectedPhone(null);
          setSelectedArticle(null);
          setActiveTab(tabParam);
          window.scrollTo({ top: 0, behavior: 'instant' });
          return;
        }
      } catch {}

      setSelectedPhone(null);
      setSelectedArticle(null);
      setActiveTab('phones');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  };

  if (placementId === 'header_top') {
    return (
      <aside
        aria-label={placement.badgeText || 'Header Advertisement'}
        data-ad-placement="header_top"
        className={`w-full bg-gradient-to-r from-[#031d10] via-[#072417] to-[#031d10] border-b border-emerald-500/25 text-white transition-all shadow-inner ${className}`}
      >
        {/* Banner / Sponsored Content View */}
        {showBanner && (
          <div className="w-full px-[calc(1rem-5px)] sm:px-[calc(2rem-5px)] lg:px-[calc(3rem-5px)] py-2 sm:py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {placement.imageUrl && (
                  <img
                    src={placement.imageUrl}
                    alt={placement.title || 'Header Sponsor'}
                    className="h-7 sm:h-8 w-auto rounded object-cover border border-emerald-500/30 shrink-0"
                  />
                )}
                <span className="font-mono text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/40 px-2 py-0.5 rounded-full shrink-0">
                  {placement.badgeText || 'GSMSCOPE LIVE'}
                </span>
                <span className="font-semibold text-white truncate">
                  {placement.title}
                </span>
                {placement.subtitle && (
                  <span className="text-slate-300 hidden md:inline truncate text-[11px]">
                    — {placement.subtitle}
                  </span>
                )}
              </div>

              {hasLearnMore && (
                <div className="shrink-0">
                  <a
                    href={targetUrl || '#'}
                    target={placement.openInNewTab && /^https?:\/\//i.test(targetUrl) ? '_blank' : undefined}
                    rel={placement.openInNewTab && /^https?:\/\//i.test(targetUrl) ? 'noopener noreferrer' : undefined}
                    onClick={handleLearnMoreClick}
                    className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>{learnMoreLabel}</span>
                    {placement.openInNewTab && /^https?:\/\//i.test(targetUrl) ? (
                      <ExternalLink className="w-3 h-3" />
                    ) : (
                      <ArrowRight className="w-3 h-3" />
                    )}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Script / HTML ad code view */}
        {(placement.adType === 'script' || placement.adType === 'both') && (
          <div className={`w-full px-3 py-2 bg-[#02130a]/90 ${showBanner ? 'border-t border-emerald-950/80' : ''}`}>
            {!showBanner && (
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 max-w-7xl mx-auto">
                <span className="font-mono uppercase text-emerald-400 font-semibold">{placement.badgeText || 'Sponsored Leaderboard'}</span>
                {hasLearnMore && targetUrl && (
                  <a
                    href={targetUrl}
                    target={placement.openInNewTab && /^https?:\/\//i.test(targetUrl) ? '_blank' : undefined}
                    rel={placement.openInNewTab && /^https?:\/\//i.test(targetUrl) ? 'noopener noreferrer' : undefined}
                    onClick={handleLearnMoreClick}
                    className="text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-1 text-[11px]"
                  >
                    <span>{learnMoreLabel}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            )}
            <div
              ref={scriptContainerRef}
              className="w-full overflow-x-auto flex items-center justify-center min-h-[30px]"
            />
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside
      aria-label={placement.badgeText || 'Sponsored Advertisement'}
      data-ad-placement={placementId}
      className={`w-full rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/25 shadow-sm overflow-hidden transition-all ${className}`}
    >
      {/* Banner / Sponsored Content View */}
      {showBanner && (
        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/60 via-white to-emerald-50/40 dark:from-[#061a11]/90 dark:via-slate-900 dark:to-[#061a11]/70">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
            {placement.imageUrl && (
              <div className="w-full sm:w-28 h-24 sm:h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
                <img
                  src={placement.imageUrl}
                  alt={placement.title || 'Sponsored Ad'}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="site-badge inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider font-bold px-1.5 py-px rounded bg-emerald-600 text-white">
                  <Megaphone className="w-2.5 h-2.5" />
                  <span>{placement.badgeText || 'Sponsored'}</span>
                </span>
              </div>

              {placement.title && (
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base font-['Space_Grotesk'] leading-snug">
                  {placement.title}
                </h3>
              )}

              {placement.subtitle && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {placement.subtitle}
                </p>
              )}
            </div>
          </div>

          {hasLearnMore && (
            <div className="shrink-0 w-full sm:w-auto">
              <a
                href={targetUrl || '#'}
                target={placement.openInNewTab && /^https?:\/\//i.test(targetUrl) ? '_blank' : undefined}
                rel={placement.openInNewTab && /^https?:\/\//i.test(targetUrl) ? 'noopener noreferrer' : undefined}
                onClick={handleLearnMoreClick}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>{learnMoreLabel}</span>
                {placement.openInNewTab && /^https?:\/\//i.test(targetUrl) ? (
                  <ExternalLink className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Script / HTML Ad Code View */}
      {(placement.adType === 'script' || placement.adType === 'both') && (
        <div
          className={`p-3 sm:p-4 bg-slate-50/70 dark:bg-slate-950/60 ${
            showBanner ? 'border-t border-slate-200/80 dark:border-slate-800/80' : ''
          }`}
        >
          {!showBanner && (
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="site-badge inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider font-semibold px-1.5 py-px rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {placement.badgeText || 'Sponsored'}
              </span>

              {hasLearnMore && targetUrl && (
                <a
                  href={targetUrl}
                  target={placement.openInNewTab && /^https?:\/\//i.test(targetUrl) ? '_blank' : undefined}
                  rel={placement.openInNewTab && /^https?:\/\//i.test(targetUrl) ? 'noopener noreferrer' : undefined}
                  onClick={handleLearnMoreClick}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{learnMoreLabel}</span>
                  {placement.openInNewTab && /^https?:\/\//i.test(targetUrl) ? (
                    <ExternalLink className="w-3 h-3" />
                  ) : (
                    <ArrowRight className="w-3 h-3" />
                  )}
                </a>
              )}
            </div>
          )}

          {placement.scriptCode?.trim() ? (
            <div
              ref={scriptContainerRef}
              className="w-full overflow-x-auto flex items-center justify-center min-h-[40px]"
            />
          ) : null}
        </div>
      )}
    </aside>
  );
}
