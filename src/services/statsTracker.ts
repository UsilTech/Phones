import { Phone, Article } from '../types';

export interface TrackedPageEntry {
  path: string;
  title: string;
  type: 'article' | 'phone' | 'page';
  entityId?: string;
  views: number;
  lastViewedAt: string;
}

export interface WebsiteStatsData {
  allTimeViews: number;
  dailyViews: Record<string, number>; // "YYYY-MM-DD" -> count
  hourlyViews: Record<string, Record<string, number>>; // "YYYY-MM-DD" -> { "00".."23": count }
  pageViews: Record<string, TrackedPageEntry>;
  referrers: Record<string, number>; // referring URL / host -> count
  searchEngines: Record<string, number>; // "Google", "Bing", etc. -> count
  socialSources: Record<string, number>; // "X (Twitter)", "Facebook", "WhatsApp", etc. -> count
  countries: Record<string, number>; // Country name -> count
  browsers: Record<string, number>; // Browser name -> count
  operatingSystems: Record<string, number>; // OS name -> count
  updatedAt: string;
}

const LOCAL_STATS_STORAGE_KEY = 'gsmscope_website_stats_v1';

export function createEmptyWebsiteStats(): WebsiteStatsData {
  return {
    allTimeViews: 0,
    dailyViews: {},
    hourlyViews: {},
    pageViews: {},
    referrers: {},
    searchEngines: {},
    socialSources: {},
    countries: {},
    browsers: {},
    operatingSystems: {},
    updatedAt: new Date().toISOString(),
  };
}

export function getDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getHourKey(date: Date = new Date()): string {
  return String(date.getHours()).padStart(2, '0');
}

export function detectVisitorBrowser(uaString?: string): string {
  const ua = (uaString || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '').toLowerCase();
  if (!ua) return 'Unknown';
  if (ua.includes('edg/') || ua.includes('edga/') || ua.includes('edgios/')) return 'Microsoft Edge';
  if (ua.includes('opr/') || ua.includes('opera')) return 'Opera';
  if (ua.includes('samsungbrowser')) return 'Samsung Internet';
  if (ua.includes('ucbrowser')) return 'UC Browser';
  if (ua.includes('brave')) return 'Brave';
  if (ua.includes('vivaldi')) return 'Vivaldi';
  if (ua.includes('firefox') || ua.includes('fxios')) return 'Firefox';
  if (ua.includes('chrome') || ua.includes('crios')) return 'Chrome';
  if (ua.includes('safari')) return 'Safari';
  return 'Other';
}

export function detectVisitorOS(uaString?: string): string {
  const ua = (uaString || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '').toLowerCase();
  if (!ua) return 'Unknown';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iOS';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('cros')) return 'ChromeOS';
  if (ua.includes('mac os x') || ua.includes('macintosh')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  return 'Other';
}

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Africa/Lagos': 'Nigeria',
  'Africa/Accra': 'Ghana',
  'Africa/Nairobi': 'Kenya',
  'Africa/Johannesburg': 'South Africa',
  'Africa/Cairo': 'Egypt',
  'Africa/Casablanca': 'Morocco',
  'Africa/Algiers': 'Algeria',
  'Africa/Addis_Ababa': 'Ethiopia',
  'Africa/Dar_es_Salaam': 'Tanzania',
  'Africa/Kampala': 'Uganda',
  'Africa/Kigali': 'Rwanda',
  'Africa/Douala': 'Cameroon',
  'Africa/Abidjan': 'Ivory Coast',
  'Africa/Dakar': 'Senegal',
  'Europe/London': 'United Kingdom',
  'Europe/Dublin': 'Ireland',
  'Europe/Paris': 'France',
  'Europe/Berlin': 'Germany',
  'Europe/Madrid': 'Spain',
  'Europe/Rome': 'Italy',
  'Europe/Amsterdam': 'Netherlands',
  'Europe/Brussels': 'Belgium',
  'Europe/Zurich': 'Switzerland',
  'Europe/Vienna': 'Austria',
  'Europe/Stockholm': 'Sweden',
  'Europe/Oslo': 'Norway',
  'Europe/Copenhagen': 'Denmark',
  'Europe/Helsinki': 'Finland',
  'Europe/Warsaw': 'Poland',
  'Europe/Lisbon': 'Portugal',
  'Europe/Athens': 'Greece',
  'Europe/Istanbul': 'Turkey',
  'America/New_York': 'United States',
  'America/Chicago': 'United States',
  'America/Denver': 'United States',
  'America/Los_Angeles': 'United States',
  'America/Phoenix': 'United States',
  'America/Toronto': 'Canada',
  'America/Vancouver': 'Canada',
  'America/Mexico_City': 'Mexico',
  'America/Sao_Paulo': 'Brazil',
  'America/Argentina/Buenos_Aires': 'Argentina',
  'America/Bogota': 'Colombia',
  'Asia/Kolkata': 'India',
  'Asia/Calcutta': 'India',
  'Asia/Dubai': 'United Arab Emirates',
  'Asia/Riyadh': 'Saudi Arabia',
  'Asia/Qatar': 'Qatar',
  'Asia/Singapore': 'Singapore',
  'Asia/Kuala_Lumpur': 'Malaysia',
  'Asia/Jakarta': 'Indonesia',
  'Asia/Manila': 'Philippines',
  'Asia/Tokyo': 'Japan',
  'Asia/Seoul': 'South Korea',
  'Asia/Shanghai': 'China',
  'Asia/Hong_Kong': 'Hong Kong',
  'Asia/Karachi': 'Pakistan',
  'Asia/Dhaka': 'Bangladesh',
  'Australia/Sydney': 'Australia',
  'Australia/Melbourne': 'Australia',
  'Pacific/Auckland': 'New Zealand',
};

export function detectVisitorCountry(): string {
  if (typeof window === 'undefined') return 'Unknown';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_COUNTRY[tz]) {
      return TIMEZONE_TO_COUNTRY[tz];
    }
  } catch {}

  try {
    const lang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
    const parts = lang.split(/[-_]/);
    if (parts.length >= 2) {
      const regionCode = parts[1].toUpperCase();
      if (regionCode.length === 2 && typeof Intl !== 'undefined' && 'DisplayNames' in Intl) {
        const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
        const countryName = displayNames.of(regionCode);
        if (countryName && countryName !== regionCode) {
          return countryName;
        }
      }
    }
  } catch {}

  return 'Unknown';
}

export function parseReferrerInfo(rawReferrer?: string, currentLocationHref?: string): {
  referrerLabel: string;
  searchEngine: string | null;
  socialSource: string | null;
} {
  let ref = (rawReferrer ?? (typeof document !== 'undefined' ? document.referrer : '') ?? '').trim();

  // Check URL parameters for explicit utm_source or ref
  try {
    const locHref = currentLocationHref ?? (typeof window !== 'undefined' ? window.location.href : '');
    if (locHref) {
      const currentUrl = new URL(locHref);
      const utmSource = (
        currentUrl.searchParams.get('utm_source') ||
        currentUrl.searchParams.get('ref') ||
        currentUrl.searchParams.get('source') ||
        ''
      ).trim();

      // Ignore same-origin referrer
      if (ref) {
        try {
          const refUrl = new URL(ref);
          if (refUrl.host.toLowerCase() === currentUrl.host.toLowerCase()) {
            ref = '';
          }
        } catch {}
      }

      if (!ref && utmSource) {
        ref = utmSource;
      }
    }
  } catch {}

  if (!ref) {
    return {
      referrerLabel: 'Direct / Bookmark',
      searchEngine: null,
      socialSource: null,
    };
  }

  let host = ref.toLowerCase();
  let cleanUrl = ref;
  try {
    const parsed = new URL(ref.startsWith('http') ? ref : `https://${ref}`);
    host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    cleanUrl = `${host}${parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : ''}`;
  } catch {
    host = ref.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    cleanUrl = host;
  }

  // Classify Search Engines
  if (host.includes('google.')) {
    return { referrerLabel: cleanUrl, searchEngine: 'Google', socialSource: null };
  }
  if (host.includes('bing.')) {
    return { referrerLabel: cleanUrl, searchEngine: 'Bing', socialSource: null };
  }
  if (host.includes('duckduckgo.')) {
    return { referrerLabel: cleanUrl, searchEngine: 'DuckDuckGo', socialSource: null };
  }
  if (host.includes('yahoo.')) {
    return { referrerLabel: cleanUrl, searchEngine: 'Yahoo! Search', socialSource: null };
  }
  if (host.includes('yandex.')) {
    return { referrerLabel: cleanUrl, searchEngine: 'Yandex', socialSource: null };
  }
  if (host.includes('baidu.')) {
    return { referrerLabel: cleanUrl, searchEngine: 'Baidu', socialSource: null };
  }
  if (host.includes('ecosia.')) {
    return { referrerLabel: cleanUrl, searchEngine: 'Ecosia', socialSource: null };
  }

  // Classify Social Media Sources
  if (host.includes('facebook.') || host.includes('fb.com') || host.includes('m.facebook.')) {
    return { referrerLabel: cleanUrl, searchEngine: null, socialSource: 'Facebook' };
  }
  if (host === 't.co' || host.includes('twitter.') || host.includes('x.com')) {
    return { referrerLabel: cleanUrl, searchEngine: null, socialSource: 'X (Twitter)' };
  }
  if (host.includes('whatsapp.') || host === 'wa.me') {
    return { referrerLabel: cleanUrl, searchEngine: null, socialSource: 'WhatsApp' };
  }
  if (host.includes('instagram.')) {
    return { referrerLabel: cleanUrl, searchEngine: null, socialSource: 'Instagram' };
  }
  if (host.includes('t.me') || host.includes('telegram.')) {
    return { referrerLabel: cleanUrl, searchEngine: null, socialSource: 'Telegram' };
  }
  if (host.includes('linkedin.') || host === 'lnkd.in') {
    return { referrerLabel: cleanUrl, searchEngine: null, socialSource: 'LinkedIn' };
  }
  if (host.includes('reddit.')) {
    return { referrerLabel: cleanUrl, searchEngine: null, socialSource: 'Reddit' };
  }
  if (host.includes('youtube.') || host === 'youtu.be') {
    return { referrerLabel: cleanUrl, searchEngine: null, socialSource: 'YouTube' };
  }
  if (host.includes('tiktok.')) {
    return { referrerLabel: cleanUrl, searchEngine: null, socialSource: 'TikTok' };
  }
  if (host.includes('pinterest.')) {
    return { referrerLabel: cleanUrl, searchEngine: null, socialSource: 'Pinterest' };
  }
  if (host.includes('threads.net')) {
    return { referrerLabel: cleanUrl, searchEngine: null, socialSource: 'Threads' };
  }

  return {
    referrerLabel: cleanUrl,
    searchEngine: null,
    socialSource: null,
  };
}

export function normalizeWebsiteStats(raw: any): WebsiteStatsData {
  const empty = createEmptyWebsiteStats();
  if (!raw || typeof raw !== 'object') return empty;
  return {
    allTimeViews: typeof raw.allTimeViews === 'number' && raw.allTimeViews >= 0 ? raw.allTimeViews : 0,
    dailyViews: raw.dailyViews && typeof raw.dailyViews === 'object' ? { ...raw.dailyViews } : {},
    hourlyViews: raw.hourlyViews && typeof raw.hourlyViews === 'object' ? { ...raw.hourlyViews } : {},
    pageViews: raw.pageViews && typeof raw.pageViews === 'object' ? { ...raw.pageViews } : {},
    referrers: raw.referrers && typeof raw.referrers === 'object' ? { ...raw.referrers } : {},
    searchEngines: raw.searchEngines && typeof raw.searchEngines === 'object' ? { ...raw.searchEngines } : {},
    socialSources: raw.socialSources && typeof raw.socialSources === 'object' ? { ...raw.socialSources } : {},
    countries: raw.countries && typeof raw.countries === 'object' ? { ...raw.countries } : {},
    browsers: raw.browsers && typeof raw.browsers === 'object' ? { ...raw.browsers } : {},
    operatingSystems: raw.operatingSystems && typeof raw.operatingSystems === 'object' ? { ...raw.operatingSystems } : {},
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : empty.updatedAt,
  };
}

export function getLocalWebsiteStats(): WebsiteStatsData {
  if (typeof window === 'undefined') return createEmptyWebsiteStats();
  try {
    const raw = localStorage.getItem(LOCAL_STATS_STORAGE_KEY);
    if (raw) {
      return normalizeWebsiteStats(JSON.parse(raw));
    }
  } catch {}
  return createEmptyWebsiteStats();
}

export function saveLocalWebsiteStats(stats: WebsiteStatsData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

/**
 * Merges server and local stats by taking the maximum counters per key so no real views are lost.
 */
export function mergeWebsiteStats(serverRaw: any, localRaw?: any): WebsiteStatsData {
  const srv = normalizeWebsiteStats(serverRaw);
  const loc = localRaw ? normalizeWebsiteStats(localRaw) : getLocalWebsiteStats();

  const mergeNumRecord = (a: Record<string, number>, b: Record<string, number>): Record<string, number> => {
    const out: Record<string, number> = { ...a };
    for (const [k, v] of Object.entries(b)) {
      if (typeof v === 'number' && v > 0) {
        out[k] = Math.max(out[k] || 0, v);
      }
    }
    return out;
  };

  const dailyViews = mergeNumRecord(srv.dailyViews, loc.dailyViews);

  const hourlyViews: Record<string, Record<string, number>> = { ...srv.hourlyViews };
  for (const [day, hoursMap] of Object.entries(loc.hourlyViews)) {
    if (hoursMap && typeof hoursMap === 'object') {
      hourlyViews[day] = mergeNumRecord(hourlyViews[day] || {}, hoursMap);
    }
  }

  const pageViews: Record<string, TrackedPageEntry> = { ...srv.pageViews };
  for (const [pathKey, locEntry] of Object.entries(loc.pageViews)) {
    if (!locEntry) continue;
    const srvEntry = pageViews[pathKey];
    if (!srvEntry) {
      pageViews[pathKey] = { ...locEntry };
    } else {
      pageViews[pathKey] = {
        ...srvEntry,
        title: locEntry.title || srvEntry.title,
        views: Math.max(srvEntry.views || 0, locEntry.views || 0),
        lastViewedAt:
          (locEntry.lastViewedAt || '') > (srvEntry.lastViewedAt || '')
            ? locEntry.lastViewedAt
            : srvEntry.lastViewedAt,
      };
    }
  }

  const sumDaily = Object.values(dailyViews).reduce((acc, n) => acc + (Number(n) || 0), 0);
  const allTimeViews = Math.max(srv.allTimeViews || 0, loc.allTimeViews || 0, sumDaily);

  return {
    allTimeViews,
    dailyViews,
    hourlyViews,
    pageViews,
    referrers: mergeNumRecord(srv.referrers, loc.referrers),
    searchEngines: mergeNumRecord(srv.searchEngines, loc.searchEngines),
    socialSources: mergeNumRecord(srv.socialSources, loc.socialSources),
    countries: mergeNumRecord(srv.countries, loc.countries),
    browsers: mergeNumRecord(srv.browsers, loc.browsers),
    operatingSystems: mergeNumRecord(srv.operatingSystems, loc.operatingSystems),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Enriches stats with actual recorded viewsCount from articles and phones in the database
 * so Popular Posts and Pages and All-Time Views always reflect real database counts.
 */
export function enrichStatsWithDatabaseViews(
  stats: WebsiteStatsData,
  phones: Phone[],
  articles: Article[]
): WebsiteStatsData {
  const enriched = normalizeWebsiteStats(stats);
  const pageViews: Record<string, TrackedPageEntry> = { ...enriched.pageViews };

  for (const art of articles) {
    const artViews = Number(art.viewsCount) || 0;
    const slugOrId = art.slug || art.id;
    const pathKey = `/?article=${slugOrId}`;
    const existing = pageViews[pathKey] || pageViews[`/?article=${art.id}`];
    const bestViews = Math.max(artViews, existing?.views || 0);
    if (bestViews > 0) {
      pageViews[pathKey] = {
        path: pathKey,
        title: art.title,
        type: 'article',
        entityId: art.id,
        views: bestViews,
        lastViewedAt: existing?.lastViewedAt || new Date().toISOString(),
      };
    }
  }

  for (const phone of phones) {
    const pViews = Number(phone.viewsCount) || 0;
    const slugOrId = (phone as any).slug || phone.id;
    const pathKey = `/?phone=${slugOrId}`;
    const existing = pageViews[pathKey] || pageViews[`/?phone=${phone.id}`];
    const bestViews = Math.max(pViews, existing?.views || 0);
    if (bestViews > 0) {
      pageViews[pathKey] = {
        path: pathKey,
        title: `${phone.name} — Full Specs & Price`,
        type: 'phone',
        entityId: phone.id,
        views: bestViews,
        lastViewedAt: existing?.lastViewedAt || new Date().toISOString(),
      };
    }
  }

  const totalEntityViews = Object.values(pageViews).reduce((sum, p) => sum + (Number(p.views) || 0), 0);
  const sumDaily = Object.values(enriched.dailyViews).reduce((sum, v) => sum + (Number(v) || 0), 0);

  return {
    ...enriched,
    allTimeViews: Math.max(enriched.allTimeViews, sumDaily, totalEntityViews),
    pageViews,
  };
}

let lastTrackedPathKey = '';
let lastTrackedTimestamp = 0;

/**
 * Automatically tracks a real website page view and persists it to the backend database.
 */
export async function trackWebsitePageView(params: {
  path: string;
  title: string;
  type: 'article' | 'phone' | 'page';
  entityId?: string;
}): Promise<WebsiteStatsData | null> {
  if (typeof window === 'undefined') return null;

  // Do not track admin dashboard views as public website traffic
  if (params.path.startsWith('/admin') || params.path.includes('tab=admin')) {
    return null;
  }

  // Prevent duplicate double-fire within 1.5 seconds for the exact same path
  const nowMs = Date.now();
  if (params.path === lastTrackedPathKey && nowMs - lastTrackedTimestamp < 1500) {
    return null;
  }
  lastTrackedPathKey = params.path;
  lastTrackedTimestamp = nowMs;

  const now = new Date();
  const dateKey = getDateKey(now);
  const hourKey = getHourKey(now);
  const browser = detectVisitorBrowser();
  const os = detectVisitorOS();
  const country = detectVisitorCountry();
  const { referrerLabel, searchEngine, socialSource } = parseReferrerInfo();

  // 1. Update local stats immediately for instant reactivity
  const local = getLocalWebsiteStats();
  local.allTimeViews = (local.allTimeViews || 0) + 1;
  local.dailyViews[dateKey] = (local.dailyViews[dateKey] || 0) + 1;
  if (!local.hourlyViews[dateKey]) {
    local.hourlyViews[dateKey] = {};
  }
  local.hourlyViews[dateKey][hourKey] = (local.hourlyViews[dateKey][hourKey] || 0) + 1;

  const existingPage = local.pageViews[params.path];
  local.pageViews[params.path] = {
    path: params.path,
    title: params.title,
    type: params.type,
    entityId: params.entityId,
    views: (existingPage?.views || 0) + 1,
    lastViewedAt: now.toISOString(),
  };

  if (referrerLabel) {
    local.referrers[referrerLabel] = (local.referrers[referrerLabel] || 0) + 1;
  }
  if (searchEngine) {
    local.searchEngines[searchEngine] = (local.searchEngines[searchEngine] || 0) + 1;
  }
  if (socialSource) {
    local.socialSources[socialSource] = (local.socialSources[socialSource] || 0) + 1;
  }
  if (country) {
    local.countries[country] = (local.countries[country] || 0) + 1;
  }
  if (browser) {
    local.browsers[browser] = (local.browsers[browser] || 0) + 1;
  }
  if (os) {
    local.operatingSystems[os] = (local.operatingSystems[os] || 0) + 1;
  }
  local.updatedAt = now.toISOString();
  saveLocalWebsiteStats(local);

  try {
    window.dispatchEvent(new CustomEvent('gsmscope:stats-updated', { detail: local }));
  } catch {}

  // 2. Persist to backend database
  try {
    const res = await fetch('/api/stats/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: params.path,
        title: params.title,
        type: params.type,
        entityId: params.entityId,
        dateKey,
        hourKey,
        referrer: referrerLabel,
        searchEngine,
        socialSource,
        country,
        browser,
        os,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.websiteStats) {
        const merged = mergeWebsiteStats(data.websiteStats, local);
        saveLocalWebsiteStats(merged);
        try {
          window.dispatchEvent(new CustomEvent('gsmscope:stats-updated', { detail: merged }));
        } catch {}
        return merged;
      }
    }
  } catch {}

  return local;
}

export async function fetchWebsiteStatsFromApi(): Promise<WebsiteStatsData> {
  const local = getLocalWebsiteStats();
  try {
    const res = await fetch('/api/stats', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.websiteStats) {
        const merged = mergeWebsiteStats(data.websiteStats, local);
        saveLocalWebsiteStats(merged);
        return merged;
      }
    }
  } catch {}
  return local;
}
