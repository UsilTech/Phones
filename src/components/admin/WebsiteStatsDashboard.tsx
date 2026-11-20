import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Phone, Article } from '../../types';
import {
  WebsiteStatsData,
  TrackedPageEntry,
  getLocalWebsiteStats,
  fetchWebsiteStatsFromApi,
  enrichStatsWithDatabaseViews,
  getDateKey,
} from '../../services/statsTracker';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Globe,
  Share2,
  Users,
  Search,
  RefreshCw,
  Monitor,
  ExternalLink,
  Smartphone,
  Layout,
  Compass,
  Clock,
} from 'lucide-react';

export type StatsTabId = 'overview' | 'posts' | 'sources' | 'audience';
export type ChartRangeFilter = 'today' | '7days' | '30days' | 'all';

interface WebsiteStatsDashboardProps {
  phones: Phone[];
  articles: Article[];
  initialTab?: StatsTabId;
  onTabChange?: (tab: StatsTabId) => void;
  onOpenArticleInPublic?: (articleId: string) => void;
  onOpenPhoneInPublic?: (phoneId: string) => void;
}

interface ChartPoint {
  label: string;
  shortLabel: string;
  views: number;
  dateKey: string;
}

const ACCENT_GREEN = '#00a950';

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function WebsiteStatsDashboard({
  phones,
  articles,
  initialTab = 'overview',
  onTabChange,
  onOpenArticleInPublic,
  onOpenPhoneInPublic,
}: WebsiteStatsDashboardProps) {
  const [activeTab, setActiveTab] = useState<StatsTabId>(initialTab);
  const [chartRange, setChartRange] = useState<ChartRangeFilter>('7days');
  const [rawStats, setRawStats] = useState<WebsiteStatsData>(() => getLocalWebsiteStats());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [postsFilter, setPostsFilter] = useState<'all' | 'article' | 'phone' | 'page'>('all');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabSelect = (tab: StatsTabId) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const refreshStats = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const latest = await fetchWebsiteStatsFromApi();
      setRawStats(latest);
    } finally {
      if (showSpinner) {
        setTimeout(() => setIsRefreshing(false), 250);
      }
    }
  }, []);

  // Initial fetch, live event listener, and automatic polling
  useEffect(() => {
    refreshStats(false);

    const handleStatsEvent = () => {
      setRawStats(getLocalWebsiteStats());
    };
    window.addEventListener('gsmscope:stats-updated', handleStatsEvent);

    const pollInterval = window.setInterval(() => {
      refreshStats(false);
    }, 10000);

    return () => {
      window.removeEventListener('gsmscope:stats-updated', handleStatsEvent);
      window.clearInterval(pollInterval);
    };
  }, [refreshStats]);

  // Combine tracked stats with actual database viewsCount on articles and phones
  const stats = useMemo(
    () => enrichStatsWithDatabaseViews(rawStats, phones, articles),
    [rawStats, phones, articles]
  );

  // 1. Overview Metrics Calculation (Today, Yesterday, This Month, All-Time)
  const overviewMetrics = useMemo(() => {
    const now = new Date();
    const todayKey = getDateKey(now);

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayKey = getDateKey(yesterdayDate);

    const currentMonthPrefix = todayKey.slice(0, 7); // "YYYY-MM"

    const todayViews = Number(stats.dailyViews[todayKey]) || 0;
    const yesterdayViews = Number(stats.dailyViews[yesterdayKey]) || 0;

    let thisMonthViews = 0;
    for (const [dayKey, count] of Object.entries(stats.dailyViews)) {
      if (dayKey.startsWith(currentMonthPrefix)) {
        thisMonthViews += Number(count) || 0;
      }
    }
    thisMonthViews = Math.max(thisMonthViews, todayViews);

    const allTimeViews = Math.max(
      Number(stats.allTimeViews) || 0,
      thisMonthViews,
      todayViews + yesterdayViews
    );

    return {
      todayViews,
      yesterdayViews,
      thisMonthViews,
      allTimeViews,
    };
  }, [stats]);

  // 2. Traffic Chart Points (Today, Last 7 Days, Last 30 Days, All Time)
  const chartPoints: ChartPoint[] = useMemo(() => {
    const now = new Date();
    const todayKey = getDateKey(now);

    if (chartRange === 'today') {
      const todayHours = stats.hourlyViews[todayKey] || {};
      const pts: ChartPoint[] = [];
      for (let h = 0; h < 24; h++) {
        const hk = String(h).padStart(2, '0');
        const hourLabel =
          h === 0
            ? '12:00 AM'
            : h < 12
              ? `${h}:00 AM`
              : h === 12
                ? '12:00 PM'
                : `${h - 12}:00 PM`;
        const shortHour =
          h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`;
        pts.push({
          label: `Today, ${hourLabel}`,
          shortLabel: shortHour,
          views: Number(todayHours[hk]) || 0,
          dateKey: `${todayKey}-${hk}`,
        });
      }
      return pts;
    }

    if (chartRange === '7days' || chartRange === '30days') {
      const daysCount = chartRange === '7days' ? 7 : 30;
      const pts: ChartPoint[] = [];
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dk = getDateKey(d);
        pts.push({
          label: formatFullDate(d),
          shortLabel: formatShortDate(d),
          views: Number(stats.dailyViews[dk]) || 0,
          dateKey: dk,
        });
      }
      return pts;
    }

    // All Time: show all recorded days from earliest recorded date (or at least last 14 days up to today)
    const recordedKeys = Object.keys(stats.dailyViews).sort();
    let startDate = new Date(now);
    startDate.setDate(now.getDate() - 13);

    if (recordedKeys.length > 0) {
      const earliestParts = recordedKeys[0].split('-').map(Number);
      if (earliestParts.length === 3 && !earliestParts.some(isNaN)) {
        const earliestDate = new Date(earliestParts[0], earliestParts[1] - 1, earliestParts[2]);
        if (earliestDate < startDate) {
          startDate = earliestDate;
        }
      }
    }

    const pts: ChartPoint[] = [];
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Cap at 90 points to keep chart readable
    const diffDays = Math.round((endDay.getTime() - cursor.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      cursor.setDate(endDay.getDate() - 89);
    }

    while (cursor <= endDay) {
      const dk = getDateKey(cursor);
      pts.push({
        label: formatFullDate(cursor),
        shortLabel: formatShortDate(cursor),
        views: Number(stats.dailyViews[dk]) || 0,
        dateKey: dk,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // If allTimeViews includes historical article/phone views prior to daily tracking, reflect on earliest point if daily sum is lower
    const dailyTotal = pts.reduce((acc, p) => acc + p.views, 0);
    if (pts.length > 0 && overviewMetrics.allTimeViews > dailyTotal) {
      const historicalRemainder = overviewMetrics.allTimeViews - dailyTotal;
      pts[0] = {
        ...pts[0],
        views: pts[0].views + historicalRemainder,
        label: `${pts[0].label} (incl. cumulative views)`,
      };
    }

    return pts;
  }, [chartRange, stats, overviewMetrics.allTimeViews]);

  const chartPeriodTotal = useMemo(() => {
    if (chartRange === 'all') return overviewMetrics.allTimeViews;
    return chartPoints.reduce((sum, pt) => sum + pt.views, 0);
  }, [chartRange, chartPoints, overviewMetrics.allTimeViews]);

  // 3. Popular Posts and Pages list (includes 0-view posts so every page view starts at 0 and counts up)
  const popularPages: TrackedPageEntry[] = useMemo(() => {
    const list = Object.values(stats.pageViews || {}).filter(
      (entry) => entry && entry.title && (Number(entry.views) || 0) >= 0
    );
    const filtered =
      postsFilter === 'all' ? list : list.filter((entry) => entry.type === postsFilter);
    return filtered.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
  }, [stats.pageViews, postsFilter]);

  const maxPageViews = useMemo(
    () => Math.max(1, ...popularPages.map((p) => Number(p.views) || 0)),
    [popularPages]
  );

  // 4. Traffic Sources (Referring URLs, Search Engines, Social Media)
  const referringSites = useMemo(() => {
    return Object.entries(stats.referrers || {})
      .map(([name, count]) => ({ name, count: Number(count) || 0 }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [stats.referrers]);

  const searchEnginesList = useMemo(() => {
    return Object.entries(stats.searchEngines || {})
      .map(([name, count]) => ({ name, count: Number(count) || 0 }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [stats.searchEngines]);

  const socialSourcesList = useMemo(() => {
    return Object.entries(stats.socialSources || {})
      .map(([name, count]) => ({ name, count: Number(count) || 0 }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [stats.socialSources]);

  // 5. Audience (Countries, Browsers, Operating Systems)
  const countriesList = useMemo(() => {
    return Object.entries(stats.countries || {})
      .map(([name, count]) => ({ name, count: Number(count) || 0 }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [stats.countries]);

  const browsersList = useMemo(() => {
    return Object.entries(stats.browsers || {})
      .map(([name, count]) => ({ name, count: Number(count) || 0 }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [stats.browsers]);

  const osList = useMemo(() => {
    return Object.entries(stats.operatingSystems || {})
      .map(([name, count]) => ({ name, count: Number(count) || 0 }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [stats.operatingSystems]);

  // Reusable Breakdown Table Card (Blogger Stats horizontal progress rows)
  const renderBreakdownCard = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    items: { name: string; count: number }[],
    emptyMessage: string,
    maxRows?: number
  ) => {
    const total = items.reduce((sum, item) => sum + item.count, 0);
    const visibleItems = maxRows ? items.slice(0, maxRows) : items;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(0, 169, 80, 0.12)', color: ACCENT_GREEN }}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
            {total.toLocaleString()} {total === 1 ? 'view' : 'views'}
          </span>
        </div>

        {visibleItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {visibleItems.map((item) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              const barWidth = total > 0 ? Math.max(4, Math.min(100, (item.count / total) * 100)) : 0;
              return (
                <div
                  key={item.name}
                  className="px-5 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2.5 shrink-0 font-mono">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {pct}%
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white min-w-[3rem] text-right">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: ACCENT_GREEN,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Interactive Blogger-style SVG Line Chart
  const renderTrafficChart = () => {
    const width = 820;
    const height = 240;
    const padLeft = 44;
    const padRight = 20;
    const padTop = 24;
    const padBottom = 34;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const maxVal = Math.max(4, ...chartPoints.map((p) => p.views));
    const yTicks = [0, Math.round(maxVal * 0.5), maxVal];

    const coords = chartPoints.map((pt, idx) => {
      const x =
        chartPoints.length <= 1
          ? padLeft + plotW / 2
          : padLeft + (idx / (chartPoints.length - 1)) * plotW;
      const y = padTop + plotH - (pt.views / maxVal) * plotH;
      return { x, y, pt, idx };
    });

    const polylinePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const areaPoints =
      coords.length > 0
        ? `${coords[0].x.toFixed(1)},${(padTop + plotH).toFixed(1)} ${polylinePoints} ${coords[
            coords.length - 1
          ].x.toFixed(1)},${(padTop + plotH).toFixed(1)}`
        : '';

    const labelStep =
      chartPoints.length <= 8
        ? 1
        : chartPoints.length <= 16
          ? 2
          : chartPoints.length <= 31
            ? 4
            : Math.ceil(chartPoints.length / 8);

    const activeCoord =
      hoveredPointIdx !== null && coords[hoveredPointIdx] ? coords[hoveredPointIdx] : null;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Traffic Overview
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {chartRange === 'today' && 'Hourly page views recorded today'}
              {chartRange === '7days' && 'Daily page views over the last 7 days'}
              {chartRange === '30days' && 'Daily page views over the last 30 days'}
              {chartRange === 'all' && 'All-time cumulative page views'}
              {' · '}
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {chartPeriodTotal.toLocaleString()} total views
              </span>
            </p>
          </div>

          {/* Filter Pills: Today, Last 7 Days, Last 30 Days, All Time */}
          <div className="inline-flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-lg self-start sm:self-auto">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'all', label: 'All Time' },
              ] as { id: ChartRangeFilter; label: string }[]
            ).map((btn) => {
              const active = chartRange === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => {
                    setChartRange(btn.id);
                    setHoveredPointIdx(null);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  style={active ? { backgroundColor: ACCENT_GREEN } : undefined}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hovered Point Readout Bar */}
        <div className="h-7 flex items-center justify-between text-xs mt-2 px-1">
          {activeCoord ? (
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: ACCENT_GREEN }}
              />
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {activeCoord.pt.label}:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {activeCoord.pt.views.toLocaleString()}{' '}
                {activeCoord.pt.views === 1 ? 'page view' : 'page views'}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Hover or tap any point on the chart to inspect page views
            </span>
          )}
        </div>

        {/* Responsive SVG Line Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-56 sm:h-64 select-none overflow-visible"
            onMouseLeave={() => setHoveredPointIdx(null)}
          >
            <defs>
              <linearGradient id="bloggerStatsGreenFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT_GREEN} stopOpacity="0.28" />
                <stop offset="100%" stopColor={ACCENT_GREEN} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines & Y-Axis Labels */}
            {yTicks.map((tickVal, idx) => {
              const y = padTop + plotH - (tickVal / maxVal) * plotH;
              return (
                <g key={idx}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="1"
                    strokeDasharray={idx === 0 ? undefined : '4 4'}
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono"
                  >
                    {tickVal.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaPoints && <polygon points={areaPoints} fill="url(#bloggerStatsGreenFill)" />}

            {/* Main Line */}
            {polylinePoints && (
              <polyline
                fill="none"
                stroke={ACCENT_GREEN}
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />
            )}

            {/* Active vertical guide line */}
            {activeCoord && (
              <line
                x1={activeCoord.x}
                y1={padTop}
                x2={activeCoord.x}
                y2={padTop + plotH}
                stroke={ACCENT_GREEN}
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.65"
              />
            )}

            {/* Data Points & Hit Targets */}
            {coords.map((c) => {
              const isHovered = hoveredPointIdx === c.idx;
              const showXLabel =
                c.idx % labelStep === 0 || c.idx === coords.length - 1;

              return (
                <g key={c.pt.dateKey}>
                  {/* X-Axis label */}
                  {showXLabel && (
                    <text
                      x={c.x}
                      y={height - 10}
                      textAnchor="middle"
                      className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono"
                    >
                      {c.pt.shortLabel}
                    </text>
                  )}

                  {/* Visible Data Dot */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isHovered ? 5.5 : chartPoints.length > 24 ? 2.5 : 3.5}
                    fill={isHovered ? '#ffffff' : ACCENT_GREEN}
                    stroke={ACCENT_GREEN}
                    strokeWidth={isHovered ? 3 : 1.5}
                    className="transition-all duration-150"
                  />

                  {/* Invisible wider hover/touch target */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={14}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIdx(c.idx)}
                    onClick={() => setHoveredPointIdx(c.idx)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Popular Posts and Pages Section
  const renderPopularPostsCard = (limit?: number) => {
    const itemsToShow = limit ? popularPages.slice(0, limit) : popularPages;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(0, 169, 80, 0.12)', color: ACCENT_GREEN }}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Popular Posts and Pages
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Most viewed articles, phone specifications, and pages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'article', label: 'Articles' },
                { id: 'phone', label: 'Phone Pages' },
                { id: 'page', label: 'Site Pages' },
              ] as const
            ).map((f) => {
              const active = postsFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPostsFilter(f.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  style={active ? { backgroundColor: ACCENT_GREEN } : undefined}
                >
                  {f.label}
                </button>
              );
            })}
            {limit && popularPages.length > limit && (
              <button
                type="button"
                onClick={() => handleTabSelect('posts')}
                className="ml-1 text-xs font-semibold hover:underline cursor-pointer"
                style={{ color: ACCENT_GREEN }}
              >
                View all ({popularPages.length}) →
              </button>
            )}
          </div>
        </div>

        {itemsToShow.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No page views recorded for this filter yet. Visit pages on the website to record live views.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {itemsToShow.map((entry, index) => {
              const views = Number(entry.views) || 0;
              const barPct = views > 0 ? Math.max(3, Math.min(100, (views / maxPageViews) * 100)) : 0;

              const canOpenPublic =
                (entry.type === 'article' && entry.entityId && onOpenArticleInPublic) ||
                (entry.type === 'phone' && entry.entityId && onOpenPhoneInPublic);

              return (
                <div
                  key={entry.path}
                  className="px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-xs font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0">
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {entry.title}
                          </span>
                          {canOpenPublic && (
                            <button
                              type="button"
                              onClick={() => {
                                if (entry.type === 'article' && entry.entityId) {
                                  onOpenArticleInPublic?.(entry.entityId);
                                } else if (entry.type === 'phone' && entry.entityId) {
                                  onOpenPhoneInPublic?.(entry.entityId);
                                }
                              }}
                              className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 shrink-0 cursor-pointer"
                              title="Open on website"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {entry.type === 'article' && <FileText className="w-2.5 h-2.5" />}
                            {entry.type === 'phone' && <Smartphone className="w-2.5 h-2.5" />}
                            {entry.type === 'page' && <Layout className="w-2.5 h-2.5" />}
                            {entry.type}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate">
                            {entry.path}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                        {views.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {views === 1 ? 'view' : 'views'}
                      </div>
                    </div>
                  </div>

                  {/* Blogger-style Green Bar */}
                  <div className="pl-9">
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barPct}%`,
                          backgroundColor: ACCENT_GREEN,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header + Blogger Stats Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: ACCENT_GREEN }}
            >
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Stats
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time website traffic, popular content, traffic sources, and visitor audience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: ACCENT_GREEN }}
              />
              <span className="font-mono font-bold" style={{ color: ACCENT_GREEN }}>
                {(Number(stats.activeUsers) || 1).toLocaleString()}
              </span>
              <span>
                {(Number(stats.activeUsers) || 1) === 1 ? 'Live User' : 'Live Users'}
              </span>
            </span>
            <button
              type="button"
              onClick={() => refreshStats(true)}
              className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT_GREEN }}
              title="Real-Time Statistics"
            >
              <span>Real-Time</span>
            </button>
          </div>
        </div>

        {/* Simple Navigation Tabs: Overview, Posts, Traffic Sources, Audience */}
        <div className="flex items-center gap-1 sm:gap-2 pt-3 overflow-x-auto">
          {(
            [
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'posts', label: 'Posts', icon: FileText },
              { id: 'sources', label: 'Traffic Sources', icon: Share2 },
              { id: 'audience', label: 'Audience', icon: Users },
            ] as { id: StatsTabId; label: string; icon: React.ComponentType<{ className?: string }> }[]
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSelect(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={isActive ? { backgroundColor: ACCENT_GREEN } : undefined}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. OVERVIEW STATISTIC CARDS (Always visible on Overview tab) */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Page views today',
                value: overviewMetrics.todayViews,
                sub: 'Live count since midnight',
              },
              {
                label: 'Page views yesterday',
                value: overviewMetrics.yesterdayViews,
                sub: 'Previous 24-hour total',
              },
              {
                label: 'Page views this month',
                value: overviewMetrics.thisMonthViews,
                sub: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              },
              {
                label: 'All-time page views',
                value: overviewMetrics.allTimeViews,
                sub: 'Total lifetime website views',
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: ACCENT_GREEN }}
                />
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {card.label}
                </div>
                <div
                  className="text-2xl sm:text-3xl font-bold font-mono mt-2 tracking-tight"
                  style={{ color: ACCENT_GREEN }}
                >
                  {card.value.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{card.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 2. TRAFFIC CHART */}
          {renderTrafficChart()}

          {/* 3. POPULAR POSTS AND PAGES (Top 10 preview on Overview) */}
          {renderPopularPostsCard(10)}

          {/* 4. TRAFFIC SOURCES SUMMARY ON OVERVIEW */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
                <span>Traffic Sources</span>
              </h2>
              <button
                type="button"
                onClick={() => handleTabSelect('sources')}
                className="text-xs font-semibold hover:underline cursor-pointer"
                style={{ color: ACCENT_GREEN }}
              >
                Open Traffic Sources tab →
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {renderBreakdownCard(
                'Referring Websites & URLs',
                'Top external links & direct visits',
                <Globe className="w-4 h-4" />,
                referringSites,
                'No referring URLs recorded yet.',
                6
              )}
              {renderBreakdownCard(
                'Search Engines',
                'Organic search traffic',
                <Search className="w-4 h-4" />,
                searchEnginesList,
                'No search engine referrals recorded yet.',
                6
              )}
              {renderBreakdownCard(
                'Social Media Sources',
                'Visits from social networks',
                <Share2 className="w-4 h-4" />,
                socialSourcesList,
                'No social media referrals recorded yet.',
                6
              )}
            </div>
          </div>

          {/* 5. AUDIENCE SUMMARY ON OVERVIEW */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
                <span>Audience</span>
              </h2>
              <button
                type="button"
                onClick={() => handleTabSelect('audience')}
                className="text-xs font-semibold hover:underline cursor-pointer"
                style={{ color: ACCENT_GREEN }}
              >
                Open Audience tab →
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {renderBreakdownCard(
                'Visitors by Country',
                'Geographic breakdown',
                <Globe className="w-4 h-4" />,
                countriesList,
                'No visitor country data recorded yet.',
                6
              )}
              {renderBreakdownCard(
                'Browsers',
                'Browsers used by visitors',
                <Compass className="w-4 h-4" />,
                browsersList,
                'No browser data recorded yet.',
                6
              )}
              {renderBreakdownCard(
                'Operating Systems',
                'Platforms used by visitors',
                <Monitor className="w-4 h-4" />,
                osList,
                'No operating system data recorded yet.',
                6
              )}
            </div>
          </div>
        </>
      )}

      {/* POSTS TAB */}
      {activeTab === 'posts' && renderPopularPostsCard()}

      {/* TRAFFIC SOURCES TAB */}
      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {renderBreakdownCard(
            'Referring Websites & URLs',
            'All referring websites, domains, and direct entries',
            <Globe className="w-4 h-4" />,
            referringSites,
            'No referring URLs recorded yet.'
          )}
          {renderBreakdownCard(
            'Search Engines',
            'Google, Bing, DuckDuckGo, Yahoo, and other search engines',
            <Search className="w-4 h-4" />,
            searchEnginesList,
            'No search engine referrals recorded yet.'
          )}
          {renderBreakdownCard(
            'Social Media Sources',
            'Facebook, X (Twitter), WhatsApp, Instagram, Telegram, YouTube, etc.',
            <Share2 className="w-4 h-4" />,
            socialSourcesList,
            'No social media referrals recorded yet.'
          )}
        </div>
      )}

      {/* AUDIENCE TAB */}
      {activeTab === 'audience' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {renderBreakdownCard(
            'Visitors by Country',
            'Top countries visiting your website',
            <Globe className="w-4 h-4" />,
            countriesList,
            'No visitor country data recorded yet.'
          )}
          {renderBreakdownCard(
            'Browsers Used by Visitors',
            'Chrome, Safari, Firefox, Edge, Opera, Samsung Internet, etc.',
            <Compass className="w-4 h-4" />,
            browsersList,
            'No browser data recorded yet.'
          )}
          {renderBreakdownCard(
            'Operating Systems Used by Visitors',
            'Android, iOS, Windows, macOS, Linux, ChromeOS',
            <Monitor className="w-4 h-4" />,
            osList,
            'No operating system data recorded yet.'
          )}
        </div>
      )}
    </div>
  );
}
