import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useSeoMeta } from '../seo/SeoMeta';
import SocialShareBar from '../common/SocialShareBar';
import LazyImage from '../common/LazyImage';
import { 
  Plus, 
  X, 
  Check, 
  Eye, 
  Sparkles, 
  Smartphone,
  Trophy,
  TrendingUp
} from 'lucide-react';

function renderTightPriceText(text: string): React.ReactNode {
  if (!text || !text.includes(',')) return text;
  const parts = text.split(',');
  return parts.map((part, idx) => {
    if (idx === parts.length - 1) return part;
    const isNumericComma = /\d$/.test(part) && /^\d/.test(parts[idx + 1] || '');
    return (
      <React.Fragment key={idx}>
        {part}
        {isNumericComma ? <span className="price-comma-tight">,</span> : ','}
      </React.Fragment>
    );
  });
}

export default function CompareView() {
  const { 
    compareList, 
    removeFromCompare, 
    clearCompare, 
    addToCompare, 
    phones, 
    formatNaira,
    formatUSD,
    setSelectedPhone,
    setActiveTab,
    triggerNavigation,
    websiteContent
  } = useApp();

  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [searchPickerOpen, setSearchPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Track viewport device limit: 2 on mobile (<768px), 3 on tablet (768px-1023px), 4 on desktop/laptop (>=1024px)
  const getMaxDevicesForViewport = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  };

  const [maxDevices, setMaxDevices] = useState<number>(getMaxDevicesForViewport);

  useEffect(() => {
    const handleResize = () => {
      setMaxDevices(getMaxDevicesForViewport());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Selected phones for comparison, capped at current viewport's maxDevices (2 mobile, 3 tablet, 4 desktop)
  const allComparedPhones = compareList
    .map((id) => phones.find((p) => p.id === id))
    .filter(Boolean) as typeof phones;

  const comparedPhones = allComparedPhones.slice(0, maxDevices);

  // Popular phones across the site ranked by highest page views
  const popularPhones = useMemo(
    () =>
      [...phones]
        .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
        .slice(0, 6),
    [phones]
  );

  useSeoMeta({
    title:
      comparedPhones.length >= 2
        ? `${comparedPhones.map((p) => p.name).join(' vs ')} — Specs & Price Comparison`
        : 'Compare Smartphones Side-by-Side — Specs, Camera & Battery',
    description:
      comparedPhones.length >= 2
        ? `Compare ${comparedPhones.map((p) => p.name).join(' vs ')} side-by-side: display, processor, RAM, cameras, battery life, and current Naira & USD prices.`
        : 'Compare up to 4 smartphones side-by-side on GsmScope. Highlight winning specs across display, chipset, camera, battery capacity, and global pricing.',
    image: comparedPhones[0]?.image || phones[0]?.image,
    imageAlt:
      comparedPhones.length >= 2
        ? `${comparedPhones.map((p) => p.name).join(' vs ')} comparison`
        : 'GsmScope Smartphone Comparison Tool',
    type: 'website',
    canonicalPath: '/?tab=compare',
  });

  // Unselected phones available to add
  const availableToAdd = phones.filter((p) => !comparedPhones.some((cp) => cp.id === p.id));
  const filteredAvailable = availableToAdd.filter((p) => 
    p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const isDifferent = (values: string[]) => {
    if (values.length <= 1) return false;
    const first = values[0].trim().toLowerCase();
    return values.some(v => v.trim().toLowerCase() !== first);
  };

  // Compute winning device analysis for bottom note
  const winningAnalysis = useMemo(() => {
    if (comparedPhones.length < 2) return null;

    const parseNumber = (str?: string) => {
      if (!str) return 0;
      const cleaned = str.replace(/,/g, '');
      const match = cleaned.match(/\d+(\.\d+)?/);
      return match ? parseFloat(match[0]) : 0;
    };

    const scored = comparedPhones.map((phone) => {
      const antutu = parseInt(phone.detailedSpecs.platform.antutuScore.replace(/\D/g, ''), 10) || 0;
      const batteryMah = parseInt(phone.detailedSpecs.battery.capacity.replace(/\D/g, ''), 10) || 0;
      const cameraMp = parseNumber(phone.detailedSpecs.mainCamera.setup);
      const maxRam = Math.max(...phone.detailedSpecs.memory.ramVariants.map((r) => parseNumber(r)), 0);
      const chargingWatts = parseNumber(phone.detailedSpecs.battery.charging);
      const brightnessNits = parseNumber(phone.detailedSpecs.display.brightness);

      // Normalized composite score across performance, battery, camera, RAM, display & rating
      const score =
        (antutu / 100000) * 18 +
        (batteryMah / 1000) * 12 +
        (cameraMp / 50) * 10 +
        maxRam * 3 +
        (chargingWatts / 20) * 5 +
        (brightnessNits / 500) * 5 +
        (phone.rating || 4.5) * 15;

      return {
        phone,
        score,
        antutu,
        batteryMah,
        cameraMp,
        maxRam,
        chargingWatts,
        brightnessNits
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const winner = scored[0];
    const runnerUp = scored[1];

    const advantages: string[] = [];
    if (winner.antutu > runnerUp.antutu) {
      advantages.push(`stronger processor performance (${winner.phone.detailedSpecs.platform.chipset})`);
    }
    if (winner.batteryMah > runnerUp.batteryMah) {
      advantages.push(`larger ${winner.phone.detailedSpecs.battery.capacity} battery`);
    }
    if (winner.cameraMp > runnerUp.cameraMp) {
      advantages.push(`higher-resolution ${winner.phone.detailedSpecs.mainCamera.setup.split('+')[0].trim()} main camera`);
    }
    if (winner.maxRam > runnerUp.maxRam) {
      advantages.push(`up to ${winner.maxRam}GB RAM capacity`);
    }
    if (winner.chargingWatts > runnerUp.chargingWatts) {
      advantages.push(`faster ${winner.phone.detailedSpecs.battery.charging} charging`);
    }
    if ((winner.phone.rating || 0) > (runnerUp.phone.rating || 0)) {
      advantages.push(`higher ${winner.phone.rating}/5 user rating`);
    }
    if (advantages.length === 0) {
      advantages.push('a more balanced all-round hardware specification package');
    }

    // Also identify lowest price option if different from winner
    const cheapest = [...comparedPhones].sort((a, b) => a.priceUSD - b.priceUSD)[0];

    return {
      winner: winner.phone,
      advantages,
      cheapest: cheapest.id !== winner.phone.id ? cheapest : null
    };
  }, [comparedPhones]);

  // Helper parsers to compare specs and highlight ONLY the winning spec cell in each row
  const parseMaxNumber = (str?: string): number => {
    if (!str) return 0;
    const matches = str.replace(/,/g, '').match(/\d+(\.\d+)?/g);
    if (!matches) return 0;
    return Math.max(...matches.map(Number));
  };

  const parseFirstNumber = (str?: string): number => {
    if (!str) return 0;
    const match = str.replace(/,/g, '').match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  };

  const parseStorageScore = (p: typeof phones[0]): number => {
    const variants = p.detailedSpecs.memory.storageVariants.map((v) => {
      const upper = v.toUpperCase();
      const num = parseFirstNumber(upper);
      return upper.includes('TB') ? num * 1024 : num;
    });
    const maxStorage = Math.max(...variants, 0);
    const type = p.detailedSpecs.memory.storageType.toUpperCase();
    const ufsBonus = type.includes('UFS 4') ? 40 : type.includes('UFS 3') ? 20 : type.includes('NVME') ? 45 : 0;
    return maxStorage + ufsBonus;
  };

  const parseVideoScore = (videoStr?: string): number => {
    if (!videoStr) return 0;
    const s = videoStr.toUpperCase();
    let base = 1080;
    if (s.includes('8K')) base = 8000;
    else if (s.includes('4K')) base = 4000;
    else if (s.includes('1440P') || s.includes('2K')) base = 2000;
    const fpsMatch = s.match(/@(\d+)FPS/);
    const fps = fpsMatch ? parseInt(fpsMatch[1], 10) : 30;
    return base + fps;
  };

  const parseIpScore = (waterStr?: string): number => {
    if (!waterStr) return 0;
    const s = waterStr.toUpperCase();
    if (s.includes('IP69')) return 69;
    if (s.includes('IP68')) return 68;
    if (s.includes('IP67')) return 67;
    if (s.includes('IP65')) return 65;
    if (s.includes('IP64')) return 64;
    if (s.includes('IP54')) return 54;
    if (s.includes('IP53')) return 53;
    if (s.includes('SPLASH') || s.includes('REPELLENT')) return 20;
    return 0;
  };

  const parseGlassScore = (glassStr?: string): number => {
    if (!glassStr) return 0;
    const s = glassStr.toLowerCase();
    if (s.includes('armor') || s.includes('ceramic shield') || s.includes('victus 2')) return 90;
    if (s.includes('victus')) return 80;
    if (s.includes('gorilla glass 7') || s.includes('gorilla glass 6')) return 70;
    if (s.includes('gorilla glass 5')) return 60;
    if (s.includes('gorilla glass')) return 50;
    if (s.includes('glass')) return 30;
    return 10;
  };

  const parseWeightGrams = (weightStr?: string): number => {
    const val = parseFirstNumber(weightStr);
    return val > 0 ? val : 999;
  };

  const isDesktop = maxDevices === 4;
  const totalColumns = isDesktop ? comparedPhones.length + 1 : Math.max(comparedPhones.length, 1);
  const phoneColumnWidth = isDesktop
    ? `calc((100% - 11rem) / ${Math.max(comparedPhones.length, 1)})`
    : `${100 / Math.max(comparedPhones.length, 1)}%`;

  const renderComparisonRow = (
    label: string,
    getVal: (p: typeof phones[0]) => string,
    getScore?: (p: typeof phones[0]) => number
  ) => {
    const values = comparedPhones.map(getVal);
    const hasDifference = highlightDifferences && isDifferent(values);

    const scores = getScore ? comparedPhones.map(getScore) : [];
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
    const hasDistinctWinner = hasDifference && getScore !== undefined && maxScore > minScore;

    return (
      <tr className="border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        {/* Left side Device Overview column: ONLY rendered on desktop/laptop */}
        {isDesktop && (
          <td className="py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 w-44 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">
            <span>{label}</span>
          </td>
        )}
        {comparedPhones.map((phone, idx) => {
          const isWinningSpec = hasDistinctWinner && scores[idx] === maxScore;
          return (
            <td
              key={phone.id}
              style={{ width: phoneColumnWidth }}
              className="py-2.5 px-3 sm:px-4 lg:py-3 lg:px-4 text-[11px] sm:text-xs align-top break-words border-r last:border-r-0 border-slate-100 dark:border-slate-800/50"
            >
              {/* Inline row label for mobile & tablet since left column is not shown */}
              {!isDesktop && (
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">
                  {label}
                </div>
              )}
              <div
                className={
                  isWinningSpec
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-800 dark:text-slate-200'
                }
              >
                <span className={`break-words ${label === 'Price' ? 'price-value-tight' : ''}`}>
                  {label === 'Price' ? renderTightPriceText(values[idx]) : values[idx]}
                </span>
                {isWinningSpec && (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline-block ml-1 -mt-0.5 shrink-0" />
                )}
              </div>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Title & Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-['Space_Grotesk']">
            {websiteContent?.compareHeadline && websiteContent.compareHeadline !== 'Which phone is right for you?'
              ? websiteContent.compareHeadline
              : 'Smartphone Comparison Matrix'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            {websiteContent?.compareSubtitle && websiteContent.compareSubtitle !== 'Put phones side by side and see which one wins on price, camera, battery and speed.'
              ? websiteContent.compareSubtitle
              : `Compare up to ${maxDevices} devices side-by-side with global retail prices and comprehensive technical parameters.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Highlight diff toggle */}
          <button
            onClick={() => setHighlightDifferences(!highlightDifferences)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-2 cursor-pointer ${
              highlightDifferences
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white shadow-xs'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Highlight Differences: {highlightDifferences ? 'ON' : 'OFF'}</span>
          </button>

          {/* Add device button (respects 2 on mobile, 3 on tablet, 4 on desktop/laptop) */}
          {comparedPhones.length < maxDevices && (
            <button
              onClick={() => setSearchPickerOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Device ({comparedPhones.length}/{maxDevices})</span>
            </button>
          )}

          {/* Clear compare list */}
          {comparedPhones.length > 0 && (
            <button
              onClick={() => clearCompare()}
              className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-rose-500/40 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Comparison Area */}
      {comparedPhones.length === 0 ? (
        <div className="space-y-5">
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500 dark:text-slate-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Phones Selected for Comparison</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Select up to {maxDevices} phones from the database to inspect differences in camera sensors, battery endurance, global &amp; regional market prices, and chipset performance.
            </p>
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setSearchPickerOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Select Phones to Compare</span>
              </button>
            </div>
          </div>
          <SocialShareBar className="" />
        </div>
      ) : (
        <div className="w-full space-y-5">
          <div className="w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/80 shadow-md">
            {/* Full-width side-by-side table layout fitting all screens */}
            <div className="w-full overflow-x-hidden">
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                    {/* Left side Device Overview header: ONLY rendered on desktop/laptop */}
                    {isDesktop && (
                      <th className="p-4 text-xs font-semibold text-slate-700 dark:text-slate-400 w-44 sticky left-0 z-20 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
                        Device Overview
                      </th>
                    )}
                    {comparedPhones.map((phone) => (
                      <th
                        key={phone.id}
                        style={{ width: phoneColumnWidth }}
                        className="p-3 sm:p-4 align-top bg-slate-100 dark:bg-slate-950 border-r last:border-r-0 border-slate-200/70 dark:border-slate-800/70"
                      >
                        <div className="relative group flex flex-col items-start w-full">
                          <button
                            onClick={() => removeFromCompare(phone.id)}
                            className="absolute -top-1 right-0 p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Remove device"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="w-[69px] h-16 sm:w-[85px] sm:h-20 lg:w-[101px] lg:h-24 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden mb-2 flex items-center justify-center p-0">
                            {phone.image ? (
                              <LazyImage
                                src={phone.image}
                                alt={phone.name}
                                priority
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Smartphone className="w-7 h-7 text-slate-400" />
                            )}
                          </div>

                          <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {phone.brand}
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-2 mb-1 font-['Space_Grotesk'] pr-4">
                            {phone.name}
                          </h4>

                          <div className="text-xs sm:text-sm lg:text-base font-bold text-emerald-600 dark:text-emerald-400 price-value-tight mb-1.5 break-words">
                            {renderTightPriceText(formatUSD(phone.priceUSD))}{' '}
                            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal block sm:inline">
                              / {renderTightPriceText(formatNaira(phone.priceNGN))}
                            </span>
                          </div>

                          <button
                            onClick={() => setSelectedPhone(phone)}
                            className="text-[10px] sm:text-[11px] font-normal text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 py-0.5 cursor-pointer"
                          >
                            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                            <span className="truncate">View Full Spec Sheet</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* SECTION: GENERAL */}
                  <tr className="bg-slate-100 dark:bg-slate-950/80 font-bold text-slate-700 dark:text-slate-300 text-xs border-y border-slate-200 dark:border-slate-800">
                    <td colSpan={totalColumns} className="py-2 px-3 sm:px-4 uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                      GENERAL
                    </td>
                  </tr>
                  {renderComparisonRow(
                    'Price',
                    (p) => `${formatUSD(p.priceUSD)} / ${formatNaira(p.priceNGN)}`,
                    (p) => -p.priceUSD
                  )}
                  {renderComparisonRow(
                    'Status',
                    (p) => (p.marketStatus || 'Available').split('.')[0].trim() || 'Available'
                  )}
                  {renderComparisonRow(
                    'Release',
                    (p) => {
                      if (p.releaseDate && p.releaseDate.trim()) return p.releaseDate.trim();
                      if (p.marketStatus && /released/i.test(p.marketStatus)) {
                        const after = p.marketStatus.split(/released\s*/i)[1]?.trim();
                        if (after) return after;
                      }
                      return String(p.releaseYear || '');
                    }
                  )}
                  {renderComparisonRow(
                    'Overview',
                    (p) => p.nairaPriceNotes
                  )}

                  {/* SECTION: PLATFORM */}
                  <tr className="bg-slate-100 dark:bg-slate-950/80 font-bold text-slate-700 dark:text-slate-300 text-xs border-y border-slate-200 dark:border-slate-800">
                    <td colSpan={totalColumns} className="py-2 px-3 sm:px-4 uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                      PLATFORM
                    </td>
                  </tr>
                  {renderComparisonRow(
                    'System',
                    (p) => p.detailedSpecs.platform.os,
                    (p) => parseFirstNumber(p.detailedSpecs.platform.os)
                  )}
                  {renderComparisonRow(
                    'Processor / Chipset',
                    (p) => p.detailedSpecs.platform.chipset,
                    (p) => parseInt(p.detailedSpecs.platform.antutuScore.replace(/\D/g, ''), 10) || 0
                  )}
                  {renderComparisonRow(
                    'CPU Architecture',
                    (p) => p.detailedSpecs.platform.cpu,
                    (p) => parseMaxNumber(p.detailedSpecs.platform.cpu)
                  )}
                  {renderComparisonRow(
                    'GPU Graphics',
                    (p) => p.detailedSpecs.platform.gpu,
                    (p) => parseInt(p.detailedSpecs.platform.antutuScore.replace(/\D/g, ''), 10) || 0
                  )}
                  {renderComparisonRow(
                    'AnTuTu v10 Benchmark',
                    (p) => p.detailedSpecs.platform.antutuScore,
                    (p) => parseInt(p.detailedSpecs.platform.antutuScore.replace(/\D/g, ''), 10) || 0
                  )}

                  {/* SECTION: MEMORY */}
                  <tr className="bg-slate-100 dark:bg-slate-950/80 font-bold text-slate-700 dark:text-slate-300 text-xs border-y border-slate-200 dark:border-slate-800">
                    <td colSpan={totalColumns} className="py-2 px-3 sm:px-4 uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                      MEMORY
                    </td>
                  </tr>
                  {renderComparisonRow(
                    'RAM Capacity',
                    (p) => p.detailedSpecs.memory.ramVariants.join(', '),
                    (p) => Math.max(...p.detailedSpecs.memory.ramVariants.map((r) => parseFirstNumber(r)), 0)
                  )}
                  {renderComparisonRow(
                    'Storage Options',
                    (p) => `${p.detailedSpecs.memory.storageVariants.join(', ')} (${p.detailedSpecs.memory.storageType})`,
                    (p) => parseStorageScore(p)
                  )}
                  {renderComparisonRow(
                    'MicroSD Expansion',
                    (p) => p.detailedSpecs.memory.cardSlot,
                    (p) => (p.detailedSpecs.memory.cardSlot.toLowerCase().includes('no') ? 0 : 1)
                  )}

                  {/* SECTION: DISPLAY */}
                  <tr className="bg-slate-100 dark:bg-slate-950/80 font-bold text-slate-700 dark:text-slate-300 text-xs border-y border-slate-200 dark:border-slate-800">
                    <td colSpan={totalColumns} className="py-2 px-3 sm:px-4 uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                      DISPLAY
                    </td>
                  </tr>
                  {renderComparisonRow(
                    'Screen Type',
                    (p) => p.detailedSpecs.display.type,
                    (p) => {
                      const t = p.detailedSpecs.display.type.toLowerCase();
                      const hz = parseMaxNumber(p.detailedSpecs.display.refreshRate || p.detailedSpecs.display.type);
                      const panel = t.includes('ltpo') ? 50 : t.includes('amoled') || t.includes('oled') ? 30 : 10;
                      return hz + panel;
                    }
                  )}
                  {renderComparisonRow(
                    'Size & Ratio',
                    (p) => p.detailedSpecs.display.size,
                    (p) => parseFirstNumber(p.detailedSpecs.display.size)
                  )}
                  {renderComparisonRow(
                    'Resolution & Density',
                    (p) => p.detailedSpecs.display.resolution,
                    (p) => {
                      const ppiMatch = p.detailedSpecs.display.resolution.match(/(\d+)\s*ppi/i);
                      return ppiMatch ? parseInt(ppiMatch[1], 10) : parseMaxNumber(p.detailedSpecs.display.resolution);
                    }
                  )}
                  {renderComparisonRow(
                    'Peak Brightness',
                    (p) => p.detailedSpecs.display.brightness,
                    (p) => parseMaxNumber(p.detailedSpecs.display.brightness)
                  )}
                  {renderComparisonRow(
                    'Glass Protection',
                    (p) => p.detailedSpecs.display.protection,
                    (p) => parseGlassScore(p.detailedSpecs.display.protection)
                  )}

                  {/* SECTION: DESIGN (BODY ITEMS) */}
                  <tr className="bg-slate-100 dark:bg-slate-950/80 font-bold text-slate-700 dark:text-slate-300 text-xs border-y border-slate-200 dark:border-slate-800">
                    <td colSpan={totalColumns} className="py-2 px-3 sm:px-4 uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                      DESIGN
                    </td>
                  </tr>
                  {renderComparisonRow(
                    'Dimensions & Weight',
                    (p) => `${p.detailedSpecs.body.dimensions} · ${p.detailedSpecs.body.weight}`,
                    (p) => -parseWeightGrams(p.detailedSpecs.body.weight)
                  )}
                  {renderComparisonRow(
                    'Build',
                    (p) => p.detailedSpecs.body.build,
                    (p) => {
                      const b = p.detailedSpecs.body.build.toLowerCase();
                      if (b.includes('titanium')) return 50;
                      if (b.includes('aluminum') || b.includes('aluminium')) return 40;
                      if (b.includes('glass back')) return 30;
                      return 15;
                    }
                  )}
                  {renderComparisonRow(
                    'Water / Dust Resistance',
                    (p) => p.detailedSpecs.body.waterResistance,
                    (p) => parseIpScore(p.detailedSpecs.body.waterResistance)
                  )}

                  {/* SECTION: CAMERA */}
                  <tr className="bg-slate-100 dark:bg-slate-950/80 font-bold text-slate-700 dark:text-slate-300 text-xs border-y border-slate-200 dark:border-slate-800">
                    <td colSpan={totalColumns} className="py-2 px-3 sm:px-4 uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                      CAMERA
                    </td>
                  </tr>
                  {renderComparisonRow(
                    'Rear Camera Setup',
                    (p) => p.detailedSpecs.mainCamera.setup,
                    (p) => parseFirstNumber(p.detailedSpecs.mainCamera.setup) + (p.detailedSpecs.mainCamera.setup.toLowerCase().includes('ois') ? 25 : 0)
                  )}
                  {renderComparisonRow(
                    'Rear Video Capability',
                    (p) => p.detailedSpecs.mainCamera.video,
                    (p) => parseVideoScore(p.detailedSpecs.mainCamera.video)
                  )}
                  {renderComparisonRow(
                    'Selfie Camera',
                    (p) => p.detailedSpecs.selfieCamera.setup,
                    (p) => parseFirstNumber(p.detailedSpecs.selfieCamera.setup)
                  )}
                  {renderComparisonRow(
                    'Front Video Recording',
                    (p) => p.detailedSpecs.selfieCamera.video,
                    (p) => parseVideoScore(p.detailedSpecs.selfieCamera.video)
                  )}

                  {/* SECTION: BATTERY */}
                  <tr className="bg-slate-100 dark:bg-slate-950/80 font-bold text-slate-700 dark:text-slate-300 text-xs border-y border-slate-200 dark:border-slate-800">
                    <td colSpan={totalColumns} className="py-2 px-3 sm:px-4 uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                      BATTERY
                    </td>
                  </tr>
                  {renderComparisonRow(
                    'Battery Capacity',
                    (p) => p.detailedSpecs.battery.capacity,
                    (p) => parseInt(p.detailedSpecs.battery.capacity.replace(/\D/g, ''), 10) || 0
                  )}
                  {renderComparisonRow(
                    'Wired Fast Charging',
                    (p) => p.detailedSpecs.battery.charging,
                    (p) => parseFirstNumber(p.detailedSpecs.battery.charging)
                  )}
                  {renderComparisonRow(
                    'Wireless Charging',
                    (p) => p.detailedSpecs.battery.wirelessCharging,
                    (p) => (p.detailedSpecs.battery.wirelessCharging.toLowerCase().includes('no') ? 0 : parseFirstNumber(p.detailedSpecs.battery.wirelessCharging) || 10)
                  )}

                  {/* SECTION: CONNECTIVITY */}
                  <tr className="bg-slate-100 dark:bg-slate-950/80 font-bold text-slate-700 dark:text-slate-300 text-xs border-y border-slate-200 dark:border-slate-800">
                    <td colSpan={totalColumns} className="py-2 px-3 sm:px-4 uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                      CONNECTIVITY
                    </td>
                  </tr>
                  {renderComparisonRow(
                    '5G Compatibility',
                    (p) => p.detailedSpecs.network.bands5g,
                    (p) => (p.keyHighlights.network5g ? 1 : 0)
                  )}
                  {renderComparisonRow(
                    'NFC & Audio Jack',
                    (p) => `NFC: ${p.detailedSpecs.connectivity.nfc} · Jack: ${p.detailedSpecs.sound.jack35mm}`,
                    (p) =>
                      (p.detailedSpecs.connectivity.nfc.toLowerCase().includes('yes') ? 1 : 0) +
                      (p.detailedSpecs.sound.jack35mm.toLowerCase().includes('yes') ? 1 : 0)
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Note about Winning Device */}
          {winningAnalysis ? (
            <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 flex flex-col sm:flex-row items-start gap-3.5 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <div className="font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex flex-wrap items-center gap-2">
                  <span>Winning Device Verdict:</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {winningAnalysis.winner.brand} {winningAnalysis.winner.name}
                  </span>
                </div>
                <p>
                  Based on our side-by-side specification matrix, the{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    {winningAnalysis.winner.brand} {winningAnalysis.winner.name}
                  </strong>{' '}
                  takes the overall lead with {winningAnalysis.advantages.slice(0, 3).join(', ')}.
                  {winningAnalysis.cheapest && (
                    <>
                      {' '}However, if budget is your primary priority, the{' '}
                      <strong className="text-slate-900 dark:text-white font-semibold">
                        {winningAnalysis.cheapest.brand} {winningAnalysis.cheapest.name}
                      </strong>{' '}
                      ({formatUSD(winningAnalysis.cheapest.priceUSD)} / {formatNaira(winningAnalysis.cheapest.priceNGN)}) offers the lower entry price.
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Winning Device Note:</strong> Add at least one more device to this comparison matrix to see the automatic side-by-side winner verdict.
              </span>
            </div>
          )}

          {/* Popular Phones Section (Ranked by highest page views across the site) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Popular phones</span>
              </h3>
              <button
                onClick={() =>
                  triggerNavigation(() => {
                    setActiveTab('phones');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  })
                }
                className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                All phones →
              </button>
            </div>

            <div className="space-y-3">
              {popularPhones.map((phone, idx) => (
                <div
                  key={phone.id}
                  onClick={() =>
                    triggerNavigation(() => {
                      setSelectedPhone(phone);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    })
                  }
                  className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 w-4 text-center">
                    0{idx + 1}
                  </span>
                  <div className="w-15 h-12 bg-slate-950 rounded-lg overflow-hidden p-0 shrink-0 border border-slate-200 dark:border-slate-800">
                    <LazyImage
                      src={phone.image}
                      alt={phone.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {phone.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {(phone.viewsCount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Device Modal Dialog */}
      {searchPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Select Phone to Add</h3>
              <button 
                onClick={() => setSearchPickerOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              autoFocus
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search phone or brand..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-emerald-500 outline-none"
            />

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {filteredAvailable.map((phone) => (
                <div
                  key={phone.id}
                  onClick={() => {
                    addToCompare(phone.id);
                    setSearchPickerOpen(false);
                    setPickerSearch('');
                  }}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-emerald-500/50 flex items-center justify-between cursor-pointer group transition-colors"
                >
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400">{phone.brand}</span>
                    <h5 className="font-semibold text-white text-xs group-hover:text-emerald-400">
                      {phone.name}
                    </h5>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded">
                    + Add
                  </span>
                </div>
              ))}
              {filteredAvailable.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No matching phones found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
