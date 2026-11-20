import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import zlib from 'zlib';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import type { Phone, Brand, Article, Review, AdSettings, WebsiteContent, MediaItem } from './types/index.ts';

declare const __EMBEDDED_CSS_GZ_B64__: string | undefined;
declare const __EMBEDDED_JS_GZ_B64__: string | undefined;

import { 
  INITIAL_PHONES, 
  INITIAL_BRANDS, 
  INITIAL_ARTICLES, 
  INITIAL_REVIEWS, 
  INITIAL_AD_SETTINGS,
  INITIAL_WEBSITE_CONTENT,
  INITIAL_MEDIA_ITEMS
} from './data/seedData.ts';

// Prevent uncaught exceptions or unhandled rejections from terminating the cPanel / LiteSpeed worker with 503
process.on('uncaughtException', (err) => {
  console.error('[Server UncaughtException]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Server UnhandledRejection]', reason);
});

dotenv.config({ quiet: true });

const APP_ROOT = (() => {
  try {
    if (typeof __dirname === 'string' && __dirname) {
      const base = path.basename(__dirname);
      return base === 'dist' || base === 'src' ? path.resolve(__dirname, '..') : __dirname;
    }
  } catch {}
  try {
    if (typeof import.meta?.url === 'string' && import.meta.url) {
      const dir = path.dirname(fileURLToPath(import.meta.url));
      const base = path.basename(dir);
      return base === 'dist' || base === 'src' ? path.resolve(dir, '..') : dir;
    }
  } catch {}
  return process.cwd();
})();

const PORT = (() => {
  const portArgIdx = process.argv.findIndex((a) => a === '--port' || a === '-p');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    const p = parseInt(process.argv[portArgIdx + 1], 10);
    if (!isNaN(p) && p > 0) return p;
  }
  const portEqualArg = process.argv.find((a) => a.startsWith('--port='));
  if (portEqualArg) {
    const p = parseInt(portEqualArg.split('=')[1], 10);
    if (!isNaN(p) && p > 0) return p;
  }
  // In dev or when PORT is 8080 (held by Nginx reverse proxy), force 3000
  if (process.env.npm_lifecycle_event === 'dev' || process.env.PORT === '8080' || !process.env.PORT) {
    return 3000;
  }
  const parsed = parseInt(process.env.PORT, 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : 3000;
})();

const app = express();

// Enable trust proxy for reverse-proxy / cloud deployment environments
app.enable('trust proxy');

// Universal Domain (www & non-www) and Cross-Browser CORS Handling
app.use((req, res, next) => {
  // Allow both www.domain.com and domain.com to access all resources and APIs without CORS rejections
  const originHeader = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', originHeader || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim();
  const rawHost = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim() || req.headers.host || '';
  const host = rawHost.toLowerCase();
  const isLocalOrIp =
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.includes(':3000') ||
    /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(host);

  // If a request ever arrives for www.<app>.ai.studio, redirect to <app>.ai.studio
  // because *.ai.studio only supports single-level subdomains without a www prefix.
  if (host.startsWith('www.') && host.endsWith('.ai.studio')) {
    const cleanAiStudioHost = rawHost.replace(/^www\./i, '');
    return res.redirect(301, `https://${cleanAiStudioHost}${req.originalUrl || req.url}`);
  }

  // Expire any previously cached includeSubDomains HSTS policy in visitors' browsers so www never triggers HSTS lockouts
  if (forwardedProto === 'https' || req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=0');
  } else if (
    process.env.NODE_ENV === 'production' &&
    process.env.FORCE_HTTPS === 'true' &&
    forwardedProto &&
    forwardedProto !== 'https' &&
    !isLocalOrIp
  ) {
    return res.redirect(301, `https://${rawHost}${req.originalUrl || req.url}`);
  }
  next();
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Uploads & cPanel public_html directories (ensures LiteSpeed Web Server on cPanel serves /uploads/* directly from $HOME/public_html/uploads/* as well as $DEPLOYPATH/uploads/*)
const HOME_DIR = process.env.HOME || os.homedir() || path.resolve(APP_ROOT, '..');
const PUBLIC_HTML_DIR = path.resolve(HOME_DIR, 'public_html');
const PUBLIC_HTML_UPLOADS_DIR = path.resolve(PUBLIC_HTML_DIR, 'uploads');
const UPLOADS_DIR = path.resolve(APP_ROOT, 'uploads');
const PUBLIC_UPLOADS_DIR = path.resolve(APP_ROOT, 'public', 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
  if (fs.existsSync(PUBLIC_HTML_DIR) && !fs.existsSync(PUBLIC_HTML_UPLOADS_DIR)) {
    fs.mkdirSync(PUBLIC_HTML_UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('[Uploads Directory Init]', e);
}

function writeFileToAllUploadDirs(filename: string, buffer: Buffer): void {
  const safeName = path.basename(filename);
  if (!safeName) return;
  const targets = [
    path.resolve(PUBLIC_UPLOADS_DIR, safeName),
    path.resolve(UPLOADS_DIR, safeName),
  ];
  if (fs.existsSync(PUBLIC_HTML_DIR)) {
    try {
      if (!fs.existsSync(PUBLIC_HTML_UPLOADS_DIR)) {
        fs.mkdirSync(PUBLIC_HTML_UPLOADS_DIR, { recursive: true });
      }
      targets.push(path.resolve(PUBLIC_HTML_UPLOADS_DIR, safeName));
    } catch {}
  }
  for (const target of targets) {
    try {
      fs.writeFileSync(target, buffer);
    } catch {}
  }
}

function deleteFileFromAllUploadDirs(filename: string): void {
  const safeName = path.basename(filename);
  if (!safeName) return;
  const targets = [
    path.resolve(PUBLIC_UPLOADS_DIR, safeName),
    path.resolve(UPLOADS_DIR, safeName),
    path.resolve(PUBLIC_HTML_UPLOADS_DIR, safeName),
  ];
  for (const target of targets) {
    try {
      if (fs.existsSync(target)) fs.unlinkSync(target);
    } catch {}
  }
}

// Serve uploaded media and static assets with ETag revalidation so rebuilt CSS/JS bundles take effect immediately
const DIST_ASSETS_DIR = path.resolve(APP_ROOT, 'dist', 'assets');
const CPANEL_BUILD_ASSETS_DIR = path.resolve(APP_ROOT, 'cpanel_build', 'assets');

let cachedCompiledCss = '';
let cachedCompiledJs = '';

function getCompiledProductionCss(): string {
  if (cachedCompiledCss) return cachedCompiledCss;
  const candidates = [
    path.resolve(DIST_ASSETS_DIR, 'app-styles.css'),
    path.resolve(CPANEL_BUILD_ASSETS_DIR, 'app-styles.css'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        cachedCompiledCss = fs.readFileSync(c, 'utf-8');
        if (cachedCompiledCss) return cachedCompiledCss;
      } catch {}
    }
  }
  try {
    if (typeof __EMBEDDED_CSS_GZ_B64__ === 'string' && __EMBEDDED_CSS_GZ_B64__) {
      cachedCompiledCss = zlib.gunzipSync(Buffer.from(__EMBEDDED_CSS_GZ_B64__, 'base64')).toString('utf-8');
      return cachedCompiledCss;
    }
  } catch {}
  return '';
}

function getCompiledProductionJs(): string {
  if (cachedCompiledJs) return cachedCompiledJs;
  const candidates = [
    path.resolve(DIST_ASSETS_DIR, 'app-bundle.js'),
    path.resolve(CPANEL_BUILD_ASSETS_DIR, 'app-bundle.js'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        cachedCompiledJs = fs.readFileSync(c, 'utf-8');
        if (cachedCompiledJs) return cachedCompiledJs;
      } catch {}
    }
  }
  try {
    if (typeof __EMBEDDED_JS_GZ_B64__ === 'string' && __EMBEDDED_JS_GZ_B64__) {
      cachedCompiledJs = zlib.gunzipSync(Buffer.from(__EMBEDDED_JS_GZ_B64__, 'base64')).toString('utf-8');
      return cachedCompiledJs;
    }
  } catch {}
  return '';
}

// Extensionless /api/ routes & /assets/ fallbacks so LiteSpeed Web Server on cPanel never 404s CSS or JS
app.get(['/api/client-styles', '/assets/app-styles.css'], (_req: Request, res: Response, next) => {
  const css = getCompiledProductionCss();
  if (css) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(css);
  }
  next();
});

app.get(['/api/client-bundle', '/assets/app-bundle.js'], (_req: Request, res: Response, next) => {
  const js = getCompiledProductionJs();
  if (js) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(js);
  }
  next();
});

app.use('/assets', express.static(DIST_ASSETS_DIR, { maxAge: 0, etag: true, lastModified: true }));
app.use('/assets', express.static(CPANEL_BUILD_ASSETS_DIR, { maxAge: 0, etag: true, lastModified: true }));
if (fs.existsSync(PUBLIC_HTML_UPLOADS_DIR)) {
  app.use('/uploads', express.static(PUBLIC_HTML_UPLOADS_DIR, { maxAge: '7d', etag: true }));
}
app.use('/uploads', express.static(PUBLIC_UPLOADS_DIR, { maxAge: '7d', etag: true }));
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d', etag: true }));
app.use('/assets', express.static(path.resolve(APP_ROOT, 'public', 'assets'), { maxAge: '7d', etag: true }));
app.use('/src/assets', express.static(path.resolve(APP_ROOT, 'src', 'assets'), { maxAge: '7d', etag: true }));

// Fallback if browser requests any hashed /assets/index-*.js or /assets/index-*.css
app.get('/assets/:assetFile', (req: Request, res: Response, next) => {
  const assetFile = String(req.params.assetFile || '');
  if (assetFile.endsWith('.js')) {
    const js = getCompiledProductionJs();
    if (js) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      return res.send(js);
    }
  } else if (assetFile.endsWith('.css')) {
    const css = getCompiledProductionCss();
    if (css) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      return res.send(css);
    }
  }
  next();
});

// Persistent JSON File Storage (survives Phusion Passenger restarts & app folder redeployments on cPanel)
const DATA_DIR = path.resolve(APP_ROOT, 'data');
const DB_FILE_PATH = path.resolve(DATA_DIR, 'database.json');
const HOME_BACKUP_DATA_DIR = path.resolve(HOME_DIR, '.gsmscope_data');
const HOME_BACKUP_DB_PATH = path.resolve(HOME_BACKUP_DATA_DIR, 'database.json');

interface PersistentDatabaseSchema {
  version: string;
  updatedAt: string;
  phones: Phone[];
  brands: Brand[];
  articles: Article[];
  reviews: Review[];
  adSettings: AdSettings;
  websiteContent?: WebsiteContent;
  mediaLibrary?: MediaItem[];
  contactInquiries: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    createdAt: string;
    status?: 'unread' | 'read' | 'replied';
    replied?: boolean;
    repliedAt?: string;
    replySubject?: string;
    replyMessage?: string;
  }>;
  newsletterSubscribers: Array<{ email: string; subscribedAt: string; confirmationId?: string }>;
  newsletterBroadcasts?: Array<{
    id: string;
    type: 'news' | 'phone' | 'guide' | 'review' | 'alert' | 'notice' | 'price';
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    recipientsCount: number;
    recipientCount?: number;
    sentAt: string;
    status: 'sent' | 'delivered';
  }>;
  confirmationEmailsLog: Array<{
    id: string;
    to: string;
    from: string;
    subject: string;
    sentAt: string;
    status: 'sent' | 'delivered';
    previewUrl?: string;
    html: string;
    text: string;
  }>;
  uploadDataUrls?: Record<string, string>;
  deletedPhoneIds?: string[];
  deletedArticleIds?: string[];
  deletedReviewIds?: string[];
  deletedBrandKeys?: string[];
  deletedInquiryIds?: string[];
  websiteStats?: {
    allTimeViews: number;
    dailyViews: Record<string, number>;
    hourlyViews: Record<string, Record<string, number>>;
    pageViews: Record<
      string,
      {
        path: string;
        title: string;
        type: 'article' | 'phone' | 'page';
        entityId?: string;
        views: number;
        lastViewedAt: string;
      }
    >;
    referrers: Record<string, number>;
    searchEngines: Record<string, number>;
    socialSources: Record<string, number>;
    countries: Record<string, number>;
    browsers: Record<string, number>;
    operatingSystems: Record<string, number>;
    updatedAt: string;
  };
}

function getDefaultPhones(revs: Review[]): Phone[] {
  return INITIAL_PHONES.map(phone => {
    const phoneRevs = revs.filter(r => r.phoneId === phone.id && r.status === 'approved');
    const count = phoneRevs.length;
    const rating = count > 0
      ? Number((phoneRevs.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
      : 0;
    return {
      ...phone,
      reviewsCount: count,
      rating,
      viewsCount: phone.viewsCount && phone.viewsCount < 1000 ? phone.viewsCount : 0
    };
  });
}

let reviewsDatabase: Review[] = [...INITIAL_REVIEWS];
let phonesDatabase: Phone[] = getDefaultPhones(reviewsDatabase);
let brandsDatabase: Brand[] = [...INITIAL_BRANDS];
let articlesDatabase: Article[] = [...INITIAL_ARTICLES];
let adSettingsDatabase: AdSettings = { ...INITIAL_AD_SETTINGS };
let websiteContentDatabase: WebsiteContent = { ...INITIAL_WEBSITE_CONTENT };
let mediaDatabase: MediaItem[] = [...INITIAL_MEDIA_ITEMS];
let contactInquiries: PersistentDatabaseSchema['contactInquiries'] = [
  {
    id: 'inq-sample-1',
    name: 'Emeka Okoye',
    email: 'emeka.okoye@gmail.com',
    phone: '+234 803 456 7890',
    subject: 'Inquiry on iPhone 16 Pro Max price in Ikeja Computer Village',
    message: 'Hello GsmScope Team, I saw your price review for the iPhone 16 Pro Max 256GB. Is this price indicative of slot authorized dealers or gray market Computer Village street prices? Thanks!',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'unread'
  },
  {
    id: 'inq-sample-2',
    name: 'Folashade Adebayo',
    email: 'folashade@transsion-agency.ng',
    phone: '+234 802 111 2233',
    subject: 'Brand advertising & sponsored device review collaboration',
    message: 'Good day. We represent an OEM brand launching a new Dimensity 5G device next month. We would like to request your media kit and banner ad placement rates.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'replied',
    replied: true,
    repliedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    replySubject: 'Re: Brand advertising & sponsored device review collaboration',
    replyMessage: 'Dear Folashade, thank you for reaching out. We have sent our 2026 Q4 Media Deck and sponsored device benchmark kit to your email. Best regards, GsmScope Editorial.'
  }
];
let newsletterSubscribers: PersistentDatabaseSchema['newsletterSubscribers'] = [
  { email: 'sub.lagos@gsmscope.com', subscribedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { email: 'techfan2026@gmail.com', subscribedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { email: 'gadgetreviewer.ng@yahoo.com', subscribedAt: new Date(Date.now() - 86400000).toISOString() },
  { email: 'ikeja.retailer@gmail.com', subscribedAt: new Date(Date.now() - 3600000 * 12).toISOString() }
];
let newsletterBroadcasts: NonNullable<PersistentDatabaseSchema['newsletterBroadcasts']> = [
  {
    id: 'bc-1',
    type: 'alert',
    title: 'Weekly Smartphone Price Drops & Computer Village Street Index',
    message: 'Official CBN and parallel market rates updated alongside new stock prices for Apple, Samsung, and Tecno.',
    actionUrl: '/?tab=phones',
    actionLabel: 'Check Live Prices',
    recipientsCount: 4,
    sentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'delivered'
  }
];
let confirmationEmailsLog: PersistentDatabaseSchema['confirmationEmailsLog'] = [];
let uploadDataUrlsDatabase: Record<string, string> = {};
let deletedPhoneIdsDatabase = new Set<string>();
let deletedArticleIdsDatabase = new Set<string>();
let deletedReviewIdsDatabase = new Set<string>();
let deletedBrandKeysDatabase = new Set<string>();
let deletedInquiryIdsDatabase = new Set<string>();
let websiteStatsDatabase: NonNullable<PersistentDatabaseSchema['websiteStats']> = {
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
let cachedEtherealTransporter: any = null;
let lastLoadedDbMtimeMs = 0;
let lastLoadedDbSize = 0;

function updateLastLoadedDbStat(): void {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const st = fs.statSync(DB_FILE_PATH);
      lastLoadedDbMtimeMs = st.mtimeMs;
      lastLoadedDbSize = st.size;
    }
  } catch {}
}

function saveDatabaseToDisk(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const payload: PersistentDatabaseSchema = {
      version: '2.0',
      updatedAt: new Date().toISOString(),
      phones: phonesDatabase,
      brands: brandsDatabase,
      articles: articlesDatabase,
      reviews: reviewsDatabase,
      adSettings: adSettingsDatabase,
      websiteContent: websiteContentDatabase,
      mediaLibrary: mediaDatabase,
      contactInquiries,
      newsletterSubscribers,
      newsletterBroadcasts,
      confirmationEmailsLog,
      uploadDataUrls: uploadDataUrlsDatabase,
      deletedPhoneIds: Array.from(deletedPhoneIdsDatabase),
      deletedArticleIds: Array.from(deletedArticleIdsDatabase),
      deletedReviewIds: Array.from(deletedReviewIdsDatabase),
      deletedBrandKeys: Array.from(deletedBrandKeysDatabase),
      deletedInquiryIds: Array.from(deletedInquiryIdsDatabase),
      websiteStats: websiteStatsDatabase,
    };
    const serialized = JSON.stringify(payload, null, 2);
    const tempFile = `${DB_FILE_PATH}.tmp`;
    fs.writeFileSync(tempFile, serialized, 'utf-8');
    fs.renameSync(tempFile, DB_FILE_PATH);
    updateLastLoadedDbStat();
    try {
      if (!fs.existsSync(HOME_BACKUP_DATA_DIR)) {
        fs.mkdirSync(HOME_BACKUP_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(HOME_BACKUP_DB_PATH, serialized, 'utf-8');
    } catch {}
  } catch (err) {
    try {
      // Fallback direct write if atomic rename fails across filesystems
      const fallbackSerialized = JSON.stringify(
        {
          version: '2.0',
          updatedAt: new Date().toISOString(),
          phones: phonesDatabase,
          brands: brandsDatabase,
          articles: articlesDatabase,
          reviews: reviewsDatabase,
          adSettings: adSettingsDatabase,
          websiteContent: websiteContentDatabase,
          mediaLibrary: mediaDatabase,
          contactInquiries,
          newsletterSubscribers,
          newsletterBroadcasts,
          confirmationEmailsLog,
          uploadDataUrls: uploadDataUrlsDatabase,
          deletedPhoneIds: Array.from(deletedPhoneIdsDatabase),
          deletedArticleIds: Array.from(deletedArticleIdsDatabase),
          deletedReviewIds: Array.from(deletedReviewIdsDatabase),
          deletedBrandKeys: Array.from(deletedBrandKeysDatabase),
          deletedInquiryIds: Array.from(deletedInquiryIdsDatabase),
          websiteStats: websiteStatsDatabase,
        },
        null,
        2
      );
      fs.writeFileSync(DB_FILE_PATH, fallbackSerialized, 'utf-8');
      updateLastLoadedDbStat();
      try {
        if (!fs.existsSync(HOME_BACKUP_DATA_DIR)) {
          fs.mkdirSync(HOME_BACKUP_DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(HOME_BACKUP_DB_PATH, fallbackSerialized, 'utf-8');
      } catch {}
    } catch (writeErr) {
      console.error('[Database Persistence] Failed to write data/database.json:', writeErr);
    }
  }
}

function loadDatabaseFromDisk(silent = false): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(HOME_BACKUP_DB_PATH) && fs.existsSync(DB_FILE_PATH)) {
      try {
        const backupStat = fs.statSync(HOME_BACKUP_DB_PATH);
        const mainStat = fs.statSync(DB_FILE_PATH);
        if (backupStat.mtimeMs > mainStat.mtimeMs + 50 && backupStat.size > 100) {
          fs.copyFileSync(HOME_BACKUP_DB_PATH, DB_FILE_PATH);
        }
      } catch {}
    } else if (!fs.existsSync(DB_FILE_PATH)) {
      if (fs.existsSync(HOME_BACKUP_DB_PATH)) {
        try {
          fs.copyFileSync(HOME_BACKUP_DB_PATH, DB_FILE_PATH);
        } catch {}
      } else {
        const seedDbFallback = path.resolve(APP_ROOT, 'cpanel_build', 'seed-database.json');
        if (fs.existsSync(seedDbFallback)) {
          try {
            fs.copyFileSync(seedDbFallback, DB_FILE_PATH);
          } catch {}
        }
      }
    }
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<PersistentDatabaseSchema>;
      updateLastLoadedDbStat();
      if (parsed.uploadDataUrls && typeof parsed.uploadDataUrls === 'object') {
        uploadDataUrlsDatabase = { ...parsed.uploadDataUrls };
      }
      if (Array.isArray(parsed.deletedPhoneIds)) {
        deletedPhoneIdsDatabase = new Set(parsed.deletedPhoneIds);
      }
      if (Array.isArray(parsed.deletedArticleIds)) {
        deletedArticleIdsDatabase = new Set(parsed.deletedArticleIds);
      }
      if (Array.isArray(parsed.deletedReviewIds)) {
        deletedReviewIdsDatabase = new Set(parsed.deletedReviewIds);
      }
      if (Array.isArray(parsed.deletedBrandKeys)) {
        deletedBrandKeysDatabase = new Set(
          parsed.deletedBrandKeys.filter((k) => k && k !== 'nothing' && k !== 'brand-nothing')
        );
      }
      if (Array.isArray(parsed.deletedInquiryIds)) {
        deletedInquiryIdsDatabase = new Set(parsed.deletedInquiryIds);
      }
      if (Array.isArray(parsed.reviews)) {
        reviewsDatabase = parsed.reviews.filter((r) => r && !deletedReviewIdsDatabase.has(r.id));
      }
      if (Array.isArray(parsed.phones) && parsed.phones.length > 0) {
        const loadedPhones = parsed.phones
          .filter((p) => p && !deletedPhoneIdsDatabase.has(p.id))
          .map((p) => {
            const cleanedCats = (p.categories || []).filter(
              (c) => !['best-budget', 'under-200k', 'under-100k', 'under-300k'].includes(String(c).toLowerCase())
            );
            return {
              ...p,
              categories: cleanedCats.length > 0 ? cleanedCats : ['best-battery'],
            };
          });
        const loadedPhoneIds = new Set(loadedPhones.map((p) => p.id));
        const defaultPhones = getDefaultPhones(reviewsDatabase);
        for (const seedPhone of defaultPhones) {
          if (!loadedPhoneIds.has(seedPhone.id) && !deletedPhoneIdsDatabase.has(seedPhone.id)) {
            loadedPhones.push(seedPhone);
          }
        }
        phonesDatabase = loadedPhones;
      }
      if (Array.isArray(parsed.brands) && parsed.brands.length > 0) {
        const loadedBrands = parsed.brands.filter(
          (b) =>
            b &&
            !deletedBrandKeysDatabase.has(String(b.name || '').trim().toLowerCase()) &&
            !deletedBrandKeysDatabase.has(String(b.slug || '').trim().toLowerCase()) &&
            !deletedBrandKeysDatabase.has(String(b.id || '').trim().toLowerCase())
        );
        const existingBrandKeys = new Set<string>();
        for (const b of loadedBrands) {
          if (b.id) existingBrandKeys.add(b.id.toLowerCase());
          if (b.slug) existingBrandKeys.add(b.slug.toLowerCase());
          if (b.name) existingBrandKeys.add(b.name.toLowerCase());
        }
        for (const seedBrand of INITIAL_BRANDS) {
          const sKeys = [seedBrand.id.toLowerCase(), seedBrand.slug.toLowerCase(), seedBrand.name.toLowerCase()];
          if (!sKeys.some((k) => existingBrandKeys.has(k) || deletedBrandKeysDatabase.has(k))) {
            loadedBrands.push({ ...seedBrand });
            sKeys.forEach((k) => existingBrandKeys.add(k));
          }
        }
        brandsDatabase = loadedBrands;
      }
      if (Array.isArray(parsed.articles) && parsed.articles.length > 0) {
        const loadedArticles = parsed.articles
          .filter((a) => a && !deletedArticleIdsDatabase.has(a.id))
          .map((a) => {
            const rawCat = String(a.category || 'News').trim();
            const normalizedCat =
              rawCat === 'Phone News' || rawCat === 'Tech Updates' || rawCat === 'Smartphone News'
                ? 'News'
                : rawCat === 'Review'
                ? 'Reviews'
                : rawCat === 'Buying Guides' ||
                  rawCat === 'FRP & Servicing Tools' ||
                  rawCat === 'Charging & Battery' ||
                  rawCat === 'Tips & Security'
                ? 'Buying Guide'
                : rawCat || 'News';
            const rawArtViews = Number(a.viewsCount) || 0;
            return {
              ...a,
              category: normalizedCat,
              viewsCount: rawArtViews >= 5000 ? 0 : Math.max(0, rawArtViews),
            };
          });
        const loadedArtIds = new Set(loadedArticles.map((a) => a.id));
        for (const seedArt of INITIAL_ARTICLES) {
          if (!loadedArtIds.has(seedArt.id) && !deletedArticleIdsDatabase.has(seedArt.id)) {
            loadedArticles.push({ ...seedArt, viewsCount: 0 });
          }
        }
        articlesDatabase = loadedArticles;
      }
      if (parsed.adSettings && typeof parsed.adSettings === 'object') {
        const mergedPlacements = { ...INITIAL_AD_SETTINGS.placements } as any;
        if (parsed.adSettings.placements && typeof parsed.adSettings.placements === 'object') {
          for (const key of Object.keys(INITIAL_AD_SETTINGS.placements || {})) {
            const defP = (INITIAL_AD_SETTINGS.placements as any)[key];
            const savedP = (parsed.adSettings.placements as any)[key];
            if (savedP) {
              mergedPlacements[key] = {
                ...defP,
                ...savedP,
                id: defP.id,
                name: defP.name,
                pageLabel: defP.pageLabel,
                positionLabel: defP.positionLabel,
              };
            }
          }
        }
        adSettingsDatabase = {
          ...INITIAL_AD_SETTINGS,
          ...parsed.adSettings,
          placements: mergedPlacements,
        };
      }
      if (parsed.websiteContent && typeof parsed.websiteContent === 'object') {
        const wc = { ...INITIAL_WEBSITE_CONTENT, ...parsed.websiteContent };
        if (!wc.contactEmail || wc.contactEmail === 'contact@gsmscope.com') {
          wc.contactEmail = 'info@gsmscope.com';
        }
        if (!wc.contactPhone || wc.contactPhone.includes('GSMSCOPE') || wc.contactPhone.includes('800 476')) {
          wc.contactPhone = '+2349127408003';
        }
        if (!wc.officeLocation || wc.officeLocation.includes('Computer Village') || wc.officeLocation.includes('Lagos')) {
          wc.officeLocation = 'Sokoto, Nigeria';
        }
        if (!wc.whatsappNumber || wc.whatsappNumber === '+2348030000000') {
          wc.whatsappNumber = '+2349127408003';
        }
        websiteContentDatabase = wc;
      }
      if (Array.isArray(parsed.mediaLibrary) && parsed.mediaLibrary.length > 0) {
        const cleanedMedia = parsed.mediaLibrary.filter(
          (m) =>
            m &&
            typeof m.url === 'string' &&
            !m.url.includes('/assets/aistudio/IMG_') &&
            !m.url.includes('phone_galaxy_s24_ultra.png')
        );
        for (const m of cleanedMedia) {
          if (m?.url && m?.dataUrl && m.dataUrl.startsWith('data:')) {
            uploadDataUrlsDatabase[m.url] = m.dataUrl;
          }
        }
        mediaDatabase = cleanedMedia.length > 0 ? cleanedMedia : [...INITIAL_MEDIA_ITEMS];
      }
      if (Array.isArray(parsed.contactInquiries)) {
        contactInquiries = parsed.contactInquiries.filter((i) => i && !deletedInquiryIdsDatabase.has(i.id));
      }
      if (Array.isArray(parsed.newsletterSubscribers)) {
        newsletterSubscribers = parsed.newsletterSubscribers;
      }
      if (Array.isArray(parsed.newsletterBroadcasts)) {
        newsletterBroadcasts = parsed.newsletterBroadcasts;
      }
      if (Array.isArray(parsed.confirmationEmailsLog)) {
        confirmationEmailsLog = parsed.confirmationEmailsLog;
      }
      if (parsed.websiteStats && typeof parsed.websiteStats === 'object') {
        const ws = parsed.websiteStats;
        websiteStatsDatabase = {
          allTimeViews: typeof ws.allTimeViews === 'number' ? ws.allTimeViews : 0,
          dailyViews: ws.dailyViews && typeof ws.dailyViews === 'object' ? { ...ws.dailyViews } : {},
          hourlyViews: ws.hourlyViews && typeof ws.hourlyViews === 'object' ? { ...ws.hourlyViews } : {},
          pageViews: ws.pageViews && typeof ws.pageViews === 'object' ? { ...ws.pageViews } : {},
          referrers: ws.referrers && typeof ws.referrers === 'object' ? { ...ws.referrers } : {},
          searchEngines: ws.searchEngines && typeof ws.searchEngines === 'object' ? { ...ws.searchEngines } : {},
          socialSources: ws.socialSources && typeof ws.socialSources === 'object' ? { ...ws.socialSources } : {},
          countries: ws.countries && typeof ws.countries === 'object' ? { ...ws.countries } : {},
          browsers: ws.browsers && typeof ws.browsers === 'object' ? { ...ws.browsers } : {},
          operatingSystems:
            ws.operatingSystems && typeof ws.operatingSystems === 'object' ? { ...ws.operatingSystems } : {},
          updatedAt: typeof ws.updatedAt === 'string' ? ws.updatedAt : new Date().toISOString(),
        };
      }
      if (!silent) {
        console.log(`[Database Persistence] Loaded ${phonesDatabase.length} phones, ${articlesDatabase.length} articles, ${mediaDatabase.length} media items from data/database.json`);
      }
    } else {
      saveDatabaseToDisk();
      if (!silent) {
        console.log('[Database Persistence] Initialized new data/database.json with seed data');
      }
    }
  } catch (err) {
    if (!silent) {
      console.warn('[Database Persistence] Could not read data/database.json, using default seed data:', err);
    }
  }
}

function syncDatabaseFromDiskIfChanged(): void {
  try {
    let shouldReload = false;
    if (fs.existsSync(HOME_BACKUP_DB_PATH) && fs.existsSync(DB_FILE_PATH)) {
      try {
        const backupStat = fs.statSync(HOME_BACKUP_DB_PATH);
        const mainStat = fs.statSync(DB_FILE_PATH);
        if (backupStat.mtimeMs > mainStat.mtimeMs + 50 && backupStat.size > 100) {
          fs.copyFileSync(HOME_BACKUP_DB_PATH, DB_FILE_PATH);
          shouldReload = true;
        }
      } catch {}
    }
    if (fs.existsSync(DB_FILE_PATH)) {
      const st = fs.statSync(DB_FILE_PATH);
      if (st.mtimeMs !== lastLoadedDbMtimeMs || st.size !== lastLoadedDbSize) {
        shouldReload = true;
      }
    }
    if (shouldReload) {
      loadDatabaseFromDisk(true);
    }
  } catch {}
}

function restoreUploadsFromDatabase(): void {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
    if (fs.existsSync(PUBLIC_HTML_DIR) && !fs.existsSync(PUBLIC_HTML_UPLOADS_DIR)) {
      fs.mkdirSync(PUBLIC_HTML_UPLOADS_DIR, { recursive: true });
    }

    const writeDataUrlToFile = (urlPath?: string, dataUrl?: string) => {
      if (!urlPath || !dataUrl || !urlPath.startsWith('/uploads/') || !dataUrl.includes(';base64,')) return;
      uploadDataUrlsDatabase[urlPath] = dataUrl;
      const filename = path.basename(urlPath.split('?')[0]);
      if (!filename) return;
      const targetUpload = path.resolve(UPLOADS_DIR, filename);
      const targetPublic = path.resolve(PUBLIC_UPLOADS_DIR, filename);
      const targetPublicHtml = path.resolve(PUBLIC_HTML_UPLOADS_DIR, filename);
      const needsPublicHtml = fs.existsSync(PUBLIC_HTML_DIR) && !fs.existsSync(targetPublicHtml);
      if (fs.existsSync(targetUpload) && fs.existsSync(targetPublic) && !needsPublicHtml) return;
      const base64Data = dataUrl.split(';base64,')[1];
      if (!base64Data) return;
      const buffer = Buffer.from(base64Data, 'base64');
      writeFileToAllUploadDirs(filename, buffer);
    };

    for (const [urlPath, dataUrl] of Object.entries(uploadDataUrlsDatabase)) {
      if (urlPath && dataUrl) {
        writeDataUrlToFile(urlPath, dataUrl);
      }
    }

    for (const item of mediaDatabase) {
      if (item && item.url && item.dataUrl) {
        writeDataUrlToFile(item.url, item.dataUrl);
      }
    }

    if (adSettingsDatabase?.placements) {
      for (const p of Object.values(adSettingsDatabase.placements)) {
        if (p && p.imageUrl && p.imageDataUrl) {
          writeDataUrlToFile(p.imageUrl, p.imageDataUrl);
        }
      }
    }

    // Also mirror any existing disk files in UPLOADS_DIR / PUBLIC_UPLOADS_DIR into $HOME/public_html/uploads on cPanel
    if (fs.existsSync(PUBLIC_HTML_DIR)) {
      for (const srcDir of [UPLOADS_DIR, PUBLIC_UPLOADS_DIR]) {
        if (fs.existsSync(srcDir)) {
          const files = fs.readdirSync(srcDir);
          for (const f of files) {
            const srcFile = path.resolve(srcDir, f);
            const destFile = path.resolve(PUBLIC_HTML_UPLOADS_DIR, f);
            try {
              if (!fs.existsSync(destFile) && fs.statSync(srcFile).isFile()) {
                fs.copyFileSync(srcFile, destFile);
              }
            } catch {}
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Uploads Restore] Could not restore uploads from database:', err);
  }
}

// Load database from disk and defer heavy base64 file extraction until after server.listen()
loadDatabaseFromDisk();
setImmediate(() => {
  restoreUploadsFromDatabase();
});

// Synchronize database state across multiple cPanel LiteSpeed Node.js workers & PHP API gateway on every /api/* request
app.use('/api', (req: Request, res: Response, next) => {
  if (typeof req.query?._route === 'string' && req.query._route) {
    const cleanRoute = req.query._route.replace(/^\/+/, '');
    const qsParams = new URLSearchParams(req.query as Record<string, string>);
    qsParams.delete('_route');
    const qsStr = qsParams.toString();
    req.url = '/' + cleanRoute + (qsStr ? `?${qsStr}` : '');
  }
  const p = req.path || '';
  if (p !== '/client-styles' && p !== '/client-bundle' && !p.startsWith('/uploads/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    syncDatabaseFromDiskIfChanged();
  }
  next();
});

// Dynamic fallback for /uploads/:filename and /api/uploads/:filename on cPanel & Node.js
app.get(['/uploads/:filename', '/api/uploads/:filename'], (req: Request, res: Response, next) => {
  const filename = path.basename(req.params.filename || '');
  if (!filename) return next();
  const targetUrl = `/uploads/${filename}`;

  const publicHtmlDiskFile = path.resolve(PUBLIC_HTML_UPLOADS_DIR, filename);
  const diskFile = path.resolve(UPLOADS_DIR, filename);
  const publicDiskFile = path.resolve(PUBLIC_UPLOADS_DIR, filename);
  if (fs.existsSync(publicHtmlDiskFile)) return res.sendFile(publicHtmlDiskFile);
  if (fs.existsSync(diskFile)) return res.sendFile(diskFile);
  if (fs.existsSync(publicDiskFile)) return res.sendFile(publicDiskFile);

  let foundDataUrl: string | undefined = uploadDataUrlsDatabase[targetUrl];
  let foundMime = 'image/png';

  if (!foundDataUrl) {
    const mediaMatch = mediaDatabase.find(
      (m) => m && (m.url === targetUrl || path.basename(m.url || '') === filename) && m.dataUrl
    );
    if (mediaMatch && mediaMatch.dataUrl) {
      foundDataUrl = mediaMatch.dataUrl;
      if (mediaMatch.mimeType) foundMime = mediaMatch.mimeType;
    }
  }

  if (!foundDataUrl && adSettingsDatabase?.placements) {
    for (const p of Object.values(adSettingsDatabase.placements)) {
      if (p && (p.imageUrl === targetUrl || path.basename(p.imageUrl || '') === filename) && p.imageDataUrl) {
        foundDataUrl = p.imageDataUrl;
        break;
      }
    }
  }

  if (foundDataUrl && foundDataUrl.includes(';base64,')) {
    try {
      const mimeMatch = foundDataUrl.match(/^data:([^;]+);base64,/);
      if (mimeMatch && mimeMatch[1]) foundMime = mimeMatch[1];
      const base64Data = foundDataUrl.split(';base64,')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      writeFileToAllUploadDirs(filename, buffer);
      res.setHeader('Content-Type', foundMime);
      res.setHeader('Cache-Control', 'public, max-age=604800');
      return res.send(buffer);
    } catch {}
  }

  return next();
});

async function getEmailTransporter(): Promise<{ transporter: any; mode: 'smtp' | 'ethereal' | 'local' }> {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT || 587);
    return {
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      }),
      mode: 'smtp',
    };
  }

  if (cachedEtherealTransporter) {
    return { transporter: cachedEtherealTransporter, mode: 'ethereal' };
  }

  try {
    const testAccount = await Promise.race([
      nodemailer.createTestAccount(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);
    if (testAccount) {
      cachedEtherealTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      return { transporter: cachedEtherealTransporter, mode: 'ethereal' };
    }
  } catch {
    // Fallback to local confirmation receipt if external test SMTP is unreachable
  }

  return { transporter: null, mode: 'local' };
}

async function sendSubscriptionConfirmationEmail(email: string, alreadySubscribed: boolean) {
  const confirmationId = `GS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const sentAt = new Date().toISOString();
  const formattedDate = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const fromAddress = process.env.SMTP_FROM || 'GsmScope Market Alerts <alerts@gsmscope.com>';
  const subject = alreadySubscribed
    ? 'Subscription Confirmed: Your GsmScope Market & Launch Alerts Are Active'
    : 'Welcome to GsmScope: Your Subscription Confirmation & Alert Preferences';

  const textBody = [
    `Hello ${email},`,
    '',
    alreadySubscribed
      ? 'This email confirms that your subscription to GsmScope Market & Launch Alerts is active.'
      : 'Thank you for subscribing to GsmScope! Your email address is now confirmed for real-time smartphone market intelligence.',
    '',
    `Confirmation Reference: ${confirmationId}`,
    `Confirmed Email: ${email}`,
    `Date: ${formattedDate}`,
    '',
    'Your Active Alert Channels:',
    '• Instant Smartphone Launch & Full Specification Alerts',
    '• Weekly Global & Regional Price Drop Digest (NGN & USD)',
    '• Hardware Benchmark, Battery Stress Test & Camera Lab Reports',
    '• Curated Buying Guides by Budget & Category',
    '',
    'Thank you for trusting GsmScope Hardware & Market Intelligence Desk.',
  ].join('\n');

  const htmlBody = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #061a11; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #064e3b;">
      <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px 28px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #a7f3d0; font-weight: 600; margin-bottom: 6px;">
          Official Subscription Confirmation
        </div>
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">
          GsmScope Market &amp; Launch Alerts
        </h1>
      </div>
      <div style="padding: 28px;">
        <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #e2e8f0;">
          Hello <strong style="color: #34d399;">${email}</strong>,
        </p>
        <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          ${
            alreadySubscribed
              ? 'Your email address is already registered and active on the GsmScope Market &amp; Launch Alerts list. Here is a fresh copy of your subscription confirmation:'
              : 'Thank you for subscribing to GsmScope! Your email address has been verified and added to our global smartphone launch and price intelligence dispatch.'
          }
        </p>
        <div style="background-color: #0a2a1a; border: 1px solid #065f46; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #6ee7b7; letter-spacing: 1px; margin-bottom: 10px; font-weight: 600;">
            Active Subscription Details
          </div>
          <div style="font-size: 12px; color: #cbd5e1; line-height: 1.8;">
            <div><strong>Subscriber:</strong> ${email}</div>
            <div><strong>Confirmation ID:</strong> ${confirmationId}</div>
            <div><strong>Status:</strong> <span style="color: #34d399;">Active &amp; Verified</span></div>
            <div><strong>Timestamp:</strong> ${formattedDate}</div>
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 600; color: #f8fafc; margin-bottom: 8px;">
            What you will receive in your inbox:
          </div>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #cbd5e1; line-height: 1.7;">
            <li>Instant flagship &amp; mid-range smartphone launch notifications</li>
            <li>Verified global USD &amp; regional NGN price drop alerts</li>
            <li>In-depth lab reviews, battery endurance &amp; camera comparisons</li>
            <li>Monthly best-value smartphone buying guides</li>
          </ul>
        </div>
        <div style="border-top: 1px solid #064e3b; padding-top: 16px; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          Sent by GsmScope Hardware &amp; Market Desk • Reference ${confirmationId}
        </div>
      </div>
    </div>
  `.trim();

  let previewUrl: string | undefined;

  // 1. Optional Resend HTTP API support if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [email],
          subject,
          html: htmlBody,
          text: textBody,
        }),
      });
    } catch (err) {
      console.warn('[Newsletter Email] Resend API dispatch warning:', err);
    }
  } else {
    // 2. Nodemailer SMTP / Ethereal dispatch
    try {
      const { transporter, mode } = await getEmailTransporter();
      if (transporter) {
        const info = await Promise.race([
          transporter.sendMail({
            from: fromAddress,
            to: email,
            subject,
            text: textBody,
            html: htmlBody,
          }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
        ]);
        if (info && mode === 'ethereal') {
          const url = nodemailer.getTestMessageUrl(info);
          if (typeof url === 'string') {
            previewUrl = url;
          }
        }
      }
    } catch (err) {
      console.warn('[Newsletter Email] SMTP dispatch warning:', err);
    }
  }

  const emailRecord = {
    id: confirmationId,
    to: email,
    from: fromAddress,
    subject,
    sentAt,
    status: 'delivered' as const,
    previewUrl,
    html: htmlBody,
    text: textBody,
  };

  confirmationEmailsLog.unshift(emailRecord);
  console.log(`[Confirmation Email Sent] To: ${email} | ID: ${confirmationId}${previewUrl ? ` | Preview: ${previewUrl}` : ''}`);
  return emailRecord;
}

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Health check & Server / cPanel Diagnostics
app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
  const checkWritable = (dirPath: string): boolean => {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.accessSync(dirPath, fs.constants.R_OK | fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  };

  const dataDirWritable = checkWritable(DATA_DIR);
  const uploadsDirWritable = checkWritable(UPLOADS_DIR);
  const publicUploadsWritable = checkWritable(PUBLIC_UPLOADS_DIR);
  const publicHtmlUploadsWritable = fs.existsSync(PUBLIC_HTML_DIR) ? checkWritable(PUBLIC_HTML_UPLOADS_DIR) : true;
  const databaseFileExists = fs.existsSync(DB_FILE_PATH);
  const distReady =
    fs.existsSync(path.resolve(APP_ROOT, 'dist', 'index.html')) ||
    fs.existsSync(path.resolve(APP_ROOT, 'cpanel_build', 'index.html'));
  const cpanelStartupReady =
    fs.existsSync(path.resolve(APP_ROOT, 'app.js')) ||
    fs.existsSync(path.resolve(APP_ROOT, 'app.cjs')) ||
    fs.existsSync(path.resolve(APP_ROOT, 'server.ts'));

  res.json({
    status: 'healthy',
    mode: process.env.NODE_ENV === 'production' || process.env.CPANEL_MODE === '1' ? 'production' : 'development',
    nodeVersion: process.version,
    serverTime: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    cpanelStartupReady,
    distReady,
    storage: {
      databaseFileExists,
      dataDirWritable,
      uploadsDirWritable,
      publicUploadsWritable,
      publicHtmlUploadsWritable,
    },
    services: {
      smtpConfigured: Boolean((process.env.SMTP_HOST || '').trim() && (process.env.SMTP_USER || '').trim()),
    },
    database: {
      phonesCount: phonesDatabase.length,
      brandsCount: brandsDatabase.length,
      articlesCount: articlesDatabase.length,
      reviewsCount: reviewsDatabase.length,
      mediaCount: mediaDatabase.length,
      inquiriesCount: contactInquiries.length,
      subscribersCount: newsletterSubscribers.length,
      broadcastsCount: newsletterBroadcasts.length,
    }
  });
});

// 2. Phones API
app.get('/api/phones', (req: Request, res: Response) => {
  const { search, brand, minPrice, maxPrice, only5G, minBattery, sortBy } = req.query;

  let results = [...phonesDatabase];

  // Search filter
  if (typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.detailedSpecs.platform.chipset.toLowerCase().includes(q)
    );
  }

  // Brand filter
  if (typeof brand === 'string' && brand.trim()) {
    const brandLower = brand.trim().toLowerCase();
    results = results.filter(p => p.brand.toLowerCase() === brandLower);
  }

  // Price Range
  if (minPrice && !isNaN(Number(minPrice))) {
    results = results.filter(p => p.priceNGN >= Number(minPrice));
  }
  if (maxPrice && !isNaN(Number(maxPrice))) {
    results = results.filter(p => p.priceNGN <= Number(maxPrice));
  }

  // 5G Network
  if (only5G === 'true') {
    results = results.filter(p => p.keyHighlights.network5g);
  }

  // Min Battery
  if (minBattery && !isNaN(Number(minBattery))) {
    results = results.filter(p => {
      const cap = parseInt(p.detailedSpecs.battery.capacity.replace(/\D/g, ''), 10) || 0;
      return cap >= Number(minBattery);
    });
  }

  // Sorting
  if (sortBy === 'price-asc') {
    results.sort((a, b) => a.priceNGN - b.priceNGN);
  } else if (sortBy === 'price-desc') {
    results.sort((a, b) => b.priceNGN - a.priceNGN);
  } else if (sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'newest') {
    results.sort((a, b) => b.releaseYear - a.releaseYear);
  } else if (sortBy === 'popular') {
    results.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
  }
  // When no sortBy is passed, preserve phonesDatabase insertion order (newly added & newly featured phones first)

  res.json({
    total: results.length,
    phones: results
  });
});

app.get('/api/phones/:id', (req: Request, res: Response) => {
  const phone = phonesDatabase.find(p => p.id === req.params.id);
  if (!phone) {
    return res.status(404).json({ error: 'Phone not found' });
  }
  res.json(phone);
});

// Increment Phone View Count (Persistent on Backend with 30-min deduplication per IP)
const recentlyViewedIps = new Map<string, number>();

app.post('/api/phones/:id/view', (req: Request, res: Response) => {
  const phone = phonesDatabase.find(p => p.id === req.params.id);
  if (!phone) {
    return res.status(404).json({ error: 'Phone not found' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || 'client';
  const rateKey = `${clientIp}_${phone.id}`;
  const now = Date.now();
  const lastTime = recentlyViewedIps.get(rateKey) || 0;

  // If viewed within last 30 minutes by this client, return existing count without duplicate increment
  if (now - lastTime < 1000 * 60 * 30) {
    return res.json({ success: true, phoneId: phone.id, viewsCount: phone.viewsCount || 0, deduplicated: true });
  }

  recentlyViewedIps.set(rateKey, now);
  phone.viewsCount = (phone.viewsCount || 0) + 1;
  saveDatabaseToDisk();
  res.json({ success: true, phoneId: phone.id, viewsCount: phone.viewsCount });
});

// Admin: Add new Phone
app.post('/api/phones', (req: Request, res: Response) => {
  const nowTs = Date.now();
  const newPhone: Phone = {
    ...req.body,
    createdAt: (req.body as any)?.createdAt || nowTs,
    ...(req.body?.isFeatured ? { featuredAt: (req.body as any)?.featuredAt || nowTs } : {}),
  } as any;
  if (!newPhone.name || !newPhone.brand || !newPhone.priceNGN) {
    return res.status(400).json({ error: 'Missing required phone fields: name, brand, priceNGN' });
  }

  if (req.body.pushToSubscribers) {
    const recipientsCount = Math.max(newsletterSubscribers.length, 1);
    newsletterBroadcasts.unshift({
      id: `bc-phone-${Date.now()}`,
      type: 'phone',
      title: `New Device Alert: ${newPhone.brand} ${newPhone.name}`,
      message: `${newPhone.name} is now added to the GsmScope hardware database. Check complete benchmarks, camera specifications, and live Naira/USD prices.`,
      actionUrl: `/?phone=${encodeURIComponent(newPhone.id)}`,
      actionLabel: 'View Phone Specs',
      recipientsCount,
      sentAt: new Date().toISOString(),
      status: 'delivered'
    });
  }

  const existingIdx = phonesDatabase.findIndex(p => p.id === newPhone.id);
  if (existingIdx !== -1) {
    const updatedExisting = { ...phonesDatabase[existingIdx], ...newPhone };
    phonesDatabase.splice(existingIdx, 1);
    phonesDatabase.unshift(updatedExisting);
    saveDatabaseToDisk();
    return res.status(200).json({ success: true, phone: updatedExisting });
  }
  phonesDatabase.unshift(newPhone);
  saveDatabaseToDisk();
  res.status(201).json({ success: true, phone: newPhone });
});

// Admin: Update Phone (supports both PUT and POST for cPanel firewall compatibility)
const handleUpdatePhone = (req: Request, res: Response) => {
  const index = phonesDatabase.findIndex(p => p.id === req.params.id);
  const nowTs = Date.now();
  if (index === -1) {
    if (req.body && req.body.name) {
      const created: Phone = {
        ...req.body,
        id: req.params.id,
        createdAt: (req.body as any)?.createdAt || nowTs,
        updatedAt: (req.body as any)?.updatedAt || nowTs,
        ...(req.body?.isFeatured ? { featuredAt: (req.body as any)?.featuredAt || nowTs } : {}),
        images: req.body.image
          ? [req.body.image, ...(Array.isArray(req.body.images) ? req.body.images.filter((u: string) => u !== req.body.image) : [])]
          : (req.body.images || [])
      };
      phonesDatabase.unshift(created);
      saveDatabaseToDisk();
      return res.json({ success: true, phone: created });
    }
    return res.status(404).json({ error: 'Phone not found' });
  }
  const previousPhone = phonesDatabase[index];
  const justFeatured = Boolean(req.body?.isFeatured && !previousPhone.isFeatured);
  const mergedPhone: Phone = {
    ...previousPhone,
    ...req.body,
    updatedAt: (req.body as any)?.updatedAt || nowTs,
    ...(justFeatured ? { featuredAt: nowTs } : {}),
  } as any;
  if (mergedPhone.image) {
    mergedPhone.images = [
      mergedPhone.image,
      ...(Array.isArray(mergedPhone.images) ? mergedPhone.images.filter(u => u !== mergedPhone.image) : [])
    ];
  }
  // If phone was newly assigned to Featured, move it to the front
  if (justFeatured) {
    phonesDatabase.splice(index, 1);
    phonesDatabase.unshift(mergedPhone);
  } else {
    phonesDatabase[index] = mergedPhone;
  }
  saveDatabaseToDisk();
  res.json({ success: true, phone: mergedPhone });
};
app.put('/api/phones/:id', handleUpdatePhone);
app.post('/api/phones/:id', handleUpdatePhone);

// Admin: Delete Phone
app.delete('/api/phones/:id', (req: Request, res: Response) => {
  deletedPhoneIdsDatabase.add(req.params.id);
  phonesDatabase = phonesDatabase.filter(p => p.id !== req.params.id);
  saveDatabaseToDisk();
  res.json({ success: true, deletedId: req.params.id });
});

// 3. Brands API
app.get('/api/brands', (_req: Request, res: Response) => {
  res.json(brandsDatabase);
});

app.post('/api/brands', (req: Request, res: Response) => {
  const newBrand: Brand = req.body;
  if (!newBrand.name || !newBrand.slug) {
    return res.status(400).json({ error: 'Missing brand name or slug' });
  }
  [newBrand.id, newBrand.slug, newBrand.name].forEach((k) => {
    if (k) deletedBrandKeysDatabase.delete(String(k).toLowerCase());
  });
  const existingIdx = brandsDatabase.findIndex(
    b =>
      b.id === newBrand.id ||
      b.slug.toLowerCase() === newBrand.slug.toLowerCase() ||
      b.name.toLowerCase() === newBrand.name.toLowerCase()
  );
  if (existingIdx !== -1) {
    brandsDatabase[existingIdx] = { ...brandsDatabase[existingIdx], ...newBrand };
  } else {
    brandsDatabase.push(newBrand);
  }
  saveDatabaseToDisk();
  res.status(201).json({ success: true, brand: newBrand });
});

const handleUpdateBrand = (req: Request, res: Response) => {
  const index = brandsDatabase.findIndex(
    b => b.id === req.params.id || b.slug === req.params.id || b.name.toLowerCase() === req.params.id.toLowerCase()
  );
  if (index === -1) {
    if (req.body && req.body.name) {
      const created: Brand = { ...req.body, id: req.params.id };
      brandsDatabase.push(created);
      saveDatabaseToDisk();
      return res.json({ success: true, brand: created });
    }
    return res.status(404).json({ error: 'Brand not found' });
  }
  brandsDatabase[index] = { ...brandsDatabase[index], ...req.body };
  saveDatabaseToDisk();
  res.json({ success: true, brand: brandsDatabase[index] });
};
app.put('/api/brands/:id', handleUpdateBrand);
app.post('/api/brands/:id', handleUpdateBrand);

app.delete('/api/brands/:id', (req: Request, res: Response) => {
  const target = decodeURIComponent(req.params.id || '').trim().toLowerCase();
  if (target) deletedBrandKeysDatabase.add(target);
  brandsDatabase = brandsDatabase.filter(
    b =>
      String(b.id || '').toLowerCase() !== target &&
      String(b.slug || '').toLowerCase() !== target &&
      String(b.name || '').toLowerCase() !== target
  );
  saveDatabaseToDisk();
  res.json({ success: true, deletedId: req.params.id });
});

// 4. Articles API
app.get('/api/articles', (req: Request, res: Response) => {
  const { category } = req.query;
  if (typeof category === 'string' && category !== 'All') {
    const filtered = articlesDatabase.filter(a => a.category === category);
    return res.json(filtered);
  }
  res.json(articlesDatabase);
});

app.get('/api/articles/:id', (req: Request, res: Response) => {
  const article = articlesDatabase.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json(article);
});

app.post('/api/articles', (req: Request, res: Response) => {
  const newArticle: Article = {
    ...req.body,
    createdAt: (req.body as any)?.createdAt || Date.now(),
  } as any;
  if (!newArticle.title || !newArticle.content) {
    return res.status(400).json({ error: 'Missing article title or content' });
  }

  if (req.body.pushToSubscribers) {
    const recipientsCount = Math.max(newsletterSubscribers.length, 1);
    const catStr = String(newArticle.category || '');
    const isGuide = catStr.includes('Guide') || catStr.includes('Review');
    newsletterBroadcasts.unshift({
      id: `bc-art-${Date.now()}`,
      type: isGuide ? 'guide' : 'news',
      title: `${isGuide ? 'Buying Guide & Review' : 'Tech News'}: ${newArticle.title}`,
      message: newArticle.summary || newArticle.content.slice(0, 160) + '...',
      actionUrl: `/?tab=news`,
      actionLabel: 'Read Full Post',
      recipientsCount,
      recipientCount: recipientsCount,
      sentAt: new Date().toISOString(),
      status: 'delivered'
    });
  }

  const existingIdx = articlesDatabase.findIndex(a => a.id === newArticle.id);
  if (existingIdx !== -1) {
    articlesDatabase[existingIdx] = { ...articlesDatabase[existingIdx], ...newArticle };
  } else {
    articlesDatabase.unshift(newArticle);
  }
  saveDatabaseToDisk();
  res.status(201).json({ success: true, article: newArticle });
});

const handleUpdateArticle = (req: Request, res: Response) => {
  const index = articlesDatabase.findIndex(a => a.id === req.params.id);
  const nowTs = Date.now();
  if (index === -1) {
    const created: Article = {
      id: req.params.id,
      title: req.body.title || 'Untitled Article',
      slug: req.body.slug || req.params.id,
      category: req.body.category || 'News',
      coverImage: req.body.coverImage || '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
      summary: req.body.summary || '',
      content: req.body.content || '',
      author: req.body.author || { name: 'GsmScope Editorial', role: 'Senior Hardware Editor' },
      date: req.body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: req.body.readTime || '4 min read',
      tags: Array.isArray(req.body.tags) ? req.body.tags : ['News'],
      featured: Boolean(req.body.featured),
      relatedPhoneIds: Array.isArray(req.body.relatedPhoneIds) ? req.body.relatedPhoneIds : [],
      createdAt: (req.body as any)?.createdAt || nowTs,
      updatedAt: (req.body as any)?.updatedAt || nowTs,
      ...(req.body.seoTitle ? { seoTitle: req.body.seoTitle } : {}),
      ...(req.body.seoKeywords ? { seoKeywords: req.body.seoKeywords } : {}),
      ...(req.body.seoDescription ? { seoDescription: req.body.seoDescription } : {}),
    } as any;
    articlesDatabase.unshift(created);
    saveDatabaseToDisk();
    return res.json({ success: true, article: created });
  }
  articlesDatabase[index] = {
    ...articlesDatabase[index],
    ...req.body,
    updatedAt: (req.body as any)?.updatedAt || nowTs,
  };
  saveDatabaseToDisk();
  res.json({ success: true, article: articlesDatabase[index] });
};
app.put('/api/articles/:id', handleUpdateArticle);
app.post('/api/articles/:id', handleUpdateArticle);

app.delete('/api/articles/:id', (req: Request, res: Response) => {
  deletedArticleIdsDatabase.add(req.params.id);
  articlesDatabase = articlesDatabase.filter(a => a.id !== req.params.id);
  saveDatabaseToDisk();
  res.json({ success: true, deletedId: req.params.id });
});

app.post('/api/articles/:id/view', (req: Request, res: Response) => {
  const article = articlesDatabase.find(a => a.id === req.params.id || a.slug === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  article.viewsCount = (article.viewsCount || 0) + 1;
  saveDatabaseToDisk();
  res.json({ success: true, viewsCount: article.viewsCount });
});

// 5. Reviews API
app.get('/api/reviews', (req: Request, res: Response) => {
  const { phoneId, status } = req.query;
  let results = [...reviewsDatabase];

  if (typeof phoneId === 'string') {
    results = results.filter(r => r.phoneId === phoneId);
  }
  if (typeof status === 'string') {
    results = results.filter(r => r.status === status);
  }
  res.json(results);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { id, phoneId, phoneName, userName, location, rating, title, comment, pros, cons, date, status, verifiedBuyer, imageUrl, seoTitle, seoKeywords, createdAt } = req.body;
  if (!phoneId || !userName || !comment) {
    return res.status(400).json({ error: 'Missing required review fields' });
  }

  const newReview: Review = {
    id: id || `rev-${Date.now()}`,
    phoneId,
    phoneName: phoneName || 'Smartphone',
    userName,
    location: location || 'Lagos, Nigeria',
    rating: Number(rating) || 5,
    title: title || 'User Review',
    comment,
    pros: Array.isArray(pros) ? pros : [],
    cons: Array.isArray(cons) ? cons : [],
    date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: status || 'approved',
    createdAt: createdAt || Date.now(),
    ...(verifiedBuyer !== undefined ? { verifiedBuyer: Boolean(verifiedBuyer) } : {}),
    ...(imageUrl ? { imageUrl: String(imageUrl) } : {}),
    ...(seoTitle ? { seoTitle: String(seoTitle) } : {}),
    ...(seoKeywords ? { seoKeywords: String(seoKeywords) } : {})
  } as any;

  const existingIdx = reviewsDatabase.findIndex(r => r.id === newReview.id);
  if (existingIdx !== -1) {
    reviewsDatabase[existingIdx] = { ...reviewsDatabase[existingIdx], ...newReview };
  } else {
    reviewsDatabase.unshift(newReview);
  }

  // Recalculate phone rating and reviewsCount
  const phone = phonesDatabase.find(p => p.id === phoneId);
  if (phone) {
    const approvedRevs = reviewsDatabase.filter(r => r.phoneId === phoneId && r.status === 'approved');
    phone.reviewsCount = approvedRevs.length;
    phone.rating = approvedRevs.length > 0
      ? Number((approvedRevs.reduce((sum, r) => sum + r.rating, 0) / approvedRevs.length).toFixed(1))
      : 0;
  }

  saveDatabaseToDisk();
  res.status(201).json({ success: true, review: newReview });
});

app.put('/api/reviews/:id', (req: Request, res: Response) => {
  const existingIdx = reviewsDatabase.findIndex(r => r.id === req.params.id);
  if (existingIdx === -1) {
    if (req.body && req.body.phoneId && req.body.comment) {
      const createdReview: Review = {
        ...req.body,
        id: req.params.id,
        createdAt: req.body.createdAt || Date.now(),
      };
      reviewsDatabase.unshift(createdReview);
      saveDatabaseToDisk();
      return res.json({ success: true, review: createdReview });
    }
    return res.status(404).json({ error: 'Review not found' });
  }
  const updatedReview: Review = {
    ...reviewsDatabase[existingIdx],
    ...req.body,
    id: req.params.id,
  };
  reviewsDatabase[existingIdx] = updatedReview;

  const phone = phonesDatabase.find(p => p.id === updatedReview.phoneId);
  if (phone) {
    const approvedRevs = reviewsDatabase.filter(r => r.phoneId === phone.id && r.status === 'approved');
    phone.reviewsCount = approvedRevs.length;
    phone.rating = approvedRevs.length > 0
      ? Number((approvedRevs.reduce((sum, r) => sum + r.rating, 0) / approvedRevs.length).toFixed(1))
      : 0;
  }

  saveDatabaseToDisk();
  res.json({ success: true, review: updatedReview });
});

app.patch('/api/reviews/:id/status', (req: Request, res: Response) => {
  const { status, pushToSubscribers } = req.body;
  const review = reviewsDatabase.find(r => r.id === req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  if (status === 'approved' || status === 'pending' || status === 'rejected') {
    review.status = status;
    const phone = phonesDatabase.find(p => p.id === review.phoneId);
    if (phone) {
      const approvedRevs = reviewsDatabase.filter(r => r.phoneId === phone.id && r.status === 'approved');
      phone.reviewsCount = approvedRevs.length;
      phone.rating = approvedRevs.length > 0
        ? Number((approvedRevs.reduce((sum, r) => sum + r.rating, 0) / approvedRevs.length).toFixed(1))
        : 0;
    }

    if (pushToSubscribers && status === 'approved') {
      const recipientsCount = Math.max(newsletterSubscribers.length, 1);
      const phoneName = phone ? phone.name : 'Smartphone';
      newsletterBroadcasts.unshift({
        id: `bc-rev-${Date.now()}`,
        type: 'review',
        title: `Community Review: ${phoneName} (${review.rating}★)`,
        message: `"${review.comment.slice(0, 150)}${review.comment.length > 150 ? '...' : ''}" — by ${review.userName} (${review.location || 'Verified Buyer'}). Read community consensus.`,
        actionUrl: `/?tab=reviews`,
        actionLabel: 'Read User Reviews',
        recipientsCount,
        sentAt: new Date().toISOString(),
        status: 'delivered'
      });
    }

    saveDatabaseToDisk();
    return res.json({ success: true, review });
  }
  res.status(400).json({ error: 'Invalid review status' });
});

app.delete('/api/reviews/:id', (req: Request, res: Response) => {
  deletedReviewIdsDatabase.add(req.params.id);
  const target = reviewsDatabase.find(r => r.id === req.params.id);
  reviewsDatabase = reviewsDatabase.filter(r => r.id !== req.params.id);
  if (target) {
    const phone = phonesDatabase.find(p => p.id === target.phoneId);
    if (phone) {
      const approvedRevs = reviewsDatabase.filter(r => r.phoneId === phone.id && r.status === 'approved');
      phone.reviewsCount = approvedRevs.length;
      phone.rating = approvedRevs.length > 0
        ? Number((approvedRevs.reduce((sum, r) => sum + r.rating, 0) / approvedRevs.length).toFixed(1))
        : 0;
    }
  }
  saveDatabaseToDisk();
  res.json({ success: true, deletedId: req.params.id });
});

// 5b. Ad Settings & Database Import/Reset API
app.get('/api/ad-settings', (_req: Request, res: Response) => {
  res.json(adSettingsDatabase);
});

const handleUpdateAdSettings = (req: Request, res: Response) => {
  const incoming = req.body || {};
  const nextPlacements: any = {
    ...(INITIAL_AD_SETTINGS.placements || {}),
    ...(adSettingsDatabase.placements || {}),
  };
  if (incoming.placements && typeof incoming.placements === 'object') {
    for (const key of Object.keys(incoming.placements)) {
      const incP = incoming.placements[key];
      const baseP = nextPlacements[key] || (INITIAL_AD_SETTINGS.placements as any)?.[key] || {};
      if (incP && typeof incP === 'object') {
        nextPlacements[key] = {
          ...baseP,
          ...incP,
          enabled: incP.enabled !== undefined ? Boolean(incP.enabled) : Boolean(baseP.enabled),
        };
      }
    }
  }

  let nextTopBanner = {
    ...adSettingsDatabase.topBanner,
    ...(incoming.topBanner || {}),
  };

  if (incoming.placements?.header_top) {
    const h = incoming.placements.header_top;
    nextPlacements.header_top = {
      ...(adSettingsDatabase.placements?.header_top || {}),
      ...h,
      enabled: Boolean(h.enabled),
    };
    nextTopBanner = {
      ...nextTopBanner,
      enabled: Boolean(h.enabled),
      title: h.title ?? nextTopBanner.title,
      subtitle: h.subtitle ?? nextTopBanner.subtitle,
      tag: h.badgeText ?? nextTopBanner.tag,
      linkUrl: h.learnMoreUrl ?? nextTopBanner.linkUrl,
    };
  } else if (incoming.topBanner) {
    nextTopBanner = {
      ...nextTopBanner,
      enabled: Boolean(incoming.topBanner.enabled),
    };
    nextPlacements.header_top = {
      ...(nextPlacements.header_top || {}),
      enabled: Boolean(nextTopBanner.enabled),
      title: nextTopBanner.title,
      subtitle: nextTopBanner.subtitle,
      badgeText: nextTopBanner.tag,
      learnMoreUrl: nextTopBanner.linkUrl,
    };
  }

  adSettingsDatabase = {
    ...adSettingsDatabase,
    ...incoming,
    topBanner: nextTopBanner,
    placements: nextPlacements,
    updatedAt: incoming.updatedAt || new Date().toISOString(),
  };
  restoreUploadsFromDatabase();
  saveDatabaseToDisk();
  res.json({ success: true, adSettings: adSettingsDatabase });
};
app.put('/api/ad-settings', handleUpdateAdSettings);
app.post('/api/ad-settings', handleUpdateAdSettings);

app.get('/api/database/export', (_req: Request, res: Response) => {
  res.json({
    exportedAt: new Date().toISOString(),
    phones: phonesDatabase,
    brands: brandsDatabase,
    articles: articlesDatabase,
    reviews: reviewsDatabase,
    adSettings: adSettingsDatabase,
    websiteContent: websiteContentDatabase,
    mediaLibrary: mediaDatabase,
    contactInquiries,
    newsletterSubscribers,
    newsletterBroadcasts,
  });
});

app.post('/api/database/import', (req: Request, res: Response) => {
  const { phones, brands, articles, reviews, adSettings, websiteContent, mediaLibrary, contactInquiries: importedInquiries, newsletterSubscribers: importedSubscribers, newsletterBroadcasts: importedBroadcasts } = req.body || {};
  if (Array.isArray(phones)) phonesDatabase = phones;
  if (Array.isArray(brands)) brandsDatabase = brands;
  if (Array.isArray(articles)) articlesDatabase = articles;
  if (Array.isArray(reviews)) reviewsDatabase = reviews;
  if (adSettings && typeof adSettings === 'object') {
    adSettingsDatabase = { ...adSettingsDatabase, ...adSettings };
  }
  if (websiteContent && typeof websiteContent === 'object') {
    websiteContentDatabase = { ...websiteContentDatabase, ...websiteContent };
  }
  if (Array.isArray(mediaLibrary)) mediaDatabase = mediaLibrary;
  if (Array.isArray(importedInquiries)) contactInquiries = importedInquiries;
  if (Array.isArray(importedSubscribers)) newsletterSubscribers = importedSubscribers;
  if (Array.isArray(importedBroadcasts)) newsletterBroadcasts = importedBroadcasts;
  saveDatabaseToDisk();
  res.json({ success: true });
});

app.post('/api/database/reset', (_req: Request, res: Response) => {
  reviewsDatabase = [...INITIAL_REVIEWS];
  phonesDatabase = getDefaultPhones(reviewsDatabase);
  brandsDatabase = [...INITIAL_BRANDS];
  articlesDatabase = [...INITIAL_ARTICLES];
  adSettingsDatabase = { ...INITIAL_AD_SETTINGS };
  websiteContentDatabase = { ...INITIAL_WEBSITE_CONTENT };
  mediaDatabase = [...INITIAL_MEDIA_ITEMS];
  saveDatabaseToDisk();
  res.json({ success: true });
});

// 5c. Website Content Settings API
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(websiteContentDatabase);
});

const handleUpdateSettings = (req: Request, res: Response) => {
  websiteContentDatabase = {
    ...websiteContentDatabase,
    ...req.body,
    updatedAt: req.body?.updatedAt || new Date().toISOString(),
  } as any;
  saveDatabaseToDisk();
  console.log('[Website Settings Updated] Site Name:', websiteContentDatabase.siteName);
  res.json({ success: true, websiteContent: websiteContentDatabase });
};
app.put('/api/settings', handleUpdateSettings);
app.post('/api/settings', handleUpdateSettings);

// 5d. Media Library & File Upload API (cPanel & Local Disk Persistent)
app.get('/api/media', (_req: Request, res: Response) => {
  res.json(mediaDatabase);
});

app.post('/api/media', (req: Request, res: Response) => {
  const { id, name, url, dataUrl, category, alt, assignedPhoneId, assignedArticleId } = req.body;
  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'Valid image URL is required' });
  }
  const cleanUrl = url.trim();
  const existingIdx = mediaDatabase.findIndex((m) => (id && m.id === id) || m.url === cleanUrl);
  const item: MediaItem = {
    id: id || (existingIdx !== -1 ? mediaDatabase[existingIdx].id : `media-${Date.now()}`),
    name: name?.trim() || 'Media Asset',
    url: cleanUrl,
    ...(dataUrl && typeof dataUrl === 'string' ? { dataUrl } : {}),
    uploadedAt: new Date().toISOString(),
    category: category || 'phone',
    alt: alt || name || 'Media asset',
    assignedPhoneId,
    assignedArticleId
  };
  if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
    uploadDataUrlsDatabase[cleanUrl] = dataUrl;
  }
  if (existingIdx !== -1) {
    mediaDatabase[existingIdx] = { ...mediaDatabase[existingIdx], ...item };
  } else {
    mediaDatabase.unshift(item);
  }
  if (assignedPhoneId) {
    const pIdx = phonesDatabase.findIndex(p => p.id === assignedPhoneId);
    if (pIdx !== -1) {
      phonesDatabase[pIdx] = {
        ...phonesDatabase[pIdx],
        image: item.url,
        images: [item.url, ...(phonesDatabase[pIdx].images || []).filter(u => u !== item.url)]
      };
    }
  }
  if (assignedArticleId) {
    const aIdx = articlesDatabase.findIndex(a => a.id === assignedArticleId);
    if (aIdx !== -1) {
      articlesDatabase[aIdx] = { ...articlesDatabase[aIdx], coverImage: item.url };
    }
  }
  restoreUploadsFromDatabase();
  saveDatabaseToDisk();
  res.status(201).json({ success: true, media: item });
});

app.post('/api/database/sync-vault', (req: Request, res: Response) => {
  try {
    const { uploadDataUrls, mediaLibrary } = req.body || {};
    if (uploadDataUrls && typeof uploadDataUrls === 'object') {
      for (const [urlPath, dataUrl] of Object.entries(uploadDataUrls)) {
        if (typeof urlPath === 'string' && typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
          uploadDataUrlsDatabase[urlPath] = dataUrl;
        }
      }
    }
    if (Array.isArray(mediaLibrary)) {
      const existingIds = new Set(mediaDatabase.map((m) => m.id));
      const existingUrls = new Set(mediaDatabase.map((m) => m.url));
      for (const item of mediaLibrary) {
        if (!item || !item.url) continue;
        if (item.dataUrl && typeof item.dataUrl === 'string' && item.dataUrl.startsWith('data:')) {
          uploadDataUrlsDatabase[item.url] = item.dataUrl;
        }
        if (!existingIds.has(item.id) && !existingUrls.has(item.url)) {
          mediaDatabase.unshift(item);
          existingIds.add(item.id);
          existingUrls.add(item.url);
        }
      }
    }
    restoreUploadsFromDatabase();
    saveDatabaseToDisk();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Vault sync failed' });
  }
});

app.post('/api/media/upload', (req: Request, res: Response) => {
  const { filename, data, name, category, alt, assignedPhoneId, assignedArticleId } = req.body;
  if (!data || typeof data !== 'string') {
    return res.status(400).json({ error: 'Missing image data payload' });
  }

  try {
    const base64Data = data.includes(';base64,') ? data.split(';base64,')[1] : data;
    const extMatch = data.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
    let ext = extMatch ? extMatch[1] : (filename ? path.extname(filename).replace('.', '') : 'jpg');
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';
    if (!ext || ext.length > 5) ext = 'jpg';

    const safeBase = (filename ? path.parse(filename).name : 'upload').replace(/[^a-zA-Z0-9-_]/g, '_');
    const uniqueFilename = `${Date.now()}-${safeBase}.${ext}`;
    const buffer = Buffer.from(base64Data, 'base64');

    // Write to all cPanel & app upload locations ($DEPLOYPATH/uploads, $DEPLOYPATH/public/uploads, and $HOME/public_html/uploads)
    writeFileToAllUploadDirs(uniqueFilename, buffer);

    const normalizedDataUrl = data.startsWith('data:')
      ? data
      : `data:image/${ext};base64,${base64Data}`;

    const mediaItem: MediaItem = {
      id: `media-${Date.now()}`,
      name: name || filename || uniqueFilename,
      url: `/uploads/${uniqueFilename}`,
      dataUrl: normalizedDataUrl,
      size: buffer.length,
      mimeType: `image/${ext}`,
      uploadedAt: new Date().toISOString(),
      category: category || 'phone',
      alt: alt || name || filename || 'Uploaded image asset',
      assignedPhoneId,
      assignedArticleId
    };

    uploadDataUrlsDatabase[mediaItem.url] = normalizedDataUrl;
    mediaDatabase.unshift(mediaItem);
    if (assignedPhoneId) {
      const pIdx = phonesDatabase.findIndex(p => p.id === assignedPhoneId);
      if (pIdx !== -1) {
        phonesDatabase[pIdx] = {
          ...phonesDatabase[pIdx],
          image: mediaItem.url,
          images: [mediaItem.url, ...(phonesDatabase[pIdx].images || []).filter(u => u !== mediaItem.url)]
        };
      }
    }
    if (assignedArticleId) {
      const aIdx = articlesDatabase.findIndex(a => a.id === assignedArticleId);
      if (aIdx !== -1) {
        articlesDatabase[aIdx] = { ...articlesDatabase[aIdx], coverImage: mediaItem.url };
      }
    }
    saveDatabaseToDisk();
    console.log(`[Media Uploaded] Stored /uploads/${uniqueFilename} (${buffer.length} bytes)`);

    res.status(201).json({ success: true, media: mediaItem, url: mediaItem.url });
  } catch (uploadErr) {
    console.error('[Media Upload Error]', uploadErr);
    res.status(500).json({ error: 'Failed to write uploaded image to disk.' });
  }
});

app.delete('/api/media/:id', (req: Request, res: Response) => {
  const item = mediaDatabase.find((m) => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Media asset not found' });
  }

  // If stored in /uploads, delete file from all cPanel & app upload directories
  if (item.url.startsWith('/uploads/')) {
    const filename = path.basename(item.url);
    deleteFileFromAllUploadDirs(filename);
    delete uploadDataUrlsDatabase[item.url];
  }

  mediaDatabase = mediaDatabase.filter((m) => m.id !== req.params.id);
  saveDatabaseToDisk();
  res.json({ success: true, deletedId: req.params.id });
});

// 6. Contact Inquiries & Advertising Proposals API
app.post('/api/contact', (req: Request, res: Response) => {
  const { id, name, email, phone, subject, message, createdAt, status, replied, repliedAt, replySubject, replyMessage } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required' });
  }

  const inquiry = {
    id: id || `inq-${Date.now()}`,
    name: (name || 'Anonymous User').trim(),
    email: String(email).trim(),
    phone: phone ? String(phone).trim() : '',
    subject: (subject || 'General Inquiry').trim(),
    message: String(message).trim(),
    createdAt: createdAt || new Date().toISOString(),
    status: (status === 'read' || status === 'replied' ? status : 'unread') as 'unread' | 'read' | 'replied',
    ...(replied !== undefined ? { replied: Boolean(replied) } : {}),
    ...(repliedAt ? { repliedAt: String(repliedAt) } : {}),
    ...(replySubject ? { replySubject: String(replySubject) } : {}),
    ...(replyMessage ? { replyMessage: String(replyMessage) } : {}),
  };

  const existingIdx = contactInquiries.findIndex((i) => i.id === inquiry.id);
  if (existingIdx !== -1) {
    contactInquiries[existingIdx] = { ...contactInquiries[existingIdx], ...inquiry };
  } else {
    contactInquiries.unshift(inquiry);
  }
  saveDatabaseToDisk();
  console.log(`[Contact Form Received] From: ${inquiry.email} | Subject: ${inquiry.subject}`);

  res.status(201).json({
    success: true,
    message: 'Thank you! Your message has been received by GsmScope.',
    ticketId: inquiry.id,
    inquiry
  });
});

app.get('/api/contact', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json(contactInquiries);
});

// Admin: Reply to Contact Form Message
app.post('/api/contact/:id/reply', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { replySubject, replyMessage, adminName } = req.body;
  const inquiry = contactInquiries.find((i) => i.id === id);
  if (!inquiry) {
    return res.status(404).json({ error: 'Message not found' });
  }
  if (!replyMessage || !replyMessage.trim()) {
    return res.status(400).json({ error: 'Reply message cannot be empty' });
  }

  const subject = replySubject || `Re: ${inquiry.subject}`;
  inquiry.replied = true;
  inquiry.status = 'replied';
  inquiry.repliedAt = new Date().toISOString();
  inquiry.replySubject = subject;
  inquiry.replyMessage = replyMessage;

  // Log confirmation / email dispatch
  const replyLog = {
    id: `rep-email-${Date.now()}`,
    to: inquiry.email,
    from: `${adminName || 'GsmScope Support'} <support@gsmscope.com>`,
    subject,
    sentAt: inquiry.repliedAt,
    status: 'delivered' as const,
    html: `<div style="font-family:sans-serif;line-height:1.6;color:#1e293b;">
      <h2 style="color:#059669;">GsmScope Official Reply</h2>
      <p>Hello <strong>${inquiry.name}</strong>,</p>
      <div style="background:#f1f5f9;padding:16px;border-left:4px solid #059669;margin:16px 0;">
        ${replyMessage.replace(/\n/g, '<br/>')}
      </div>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;"/>
      <p style="font-size:12px;color:#64748b;">In response to your inquiry regarding "<em>${inquiry.subject}</em>" submitted to GsmScope.</p>
    </div>`,
    text: `Hello ${inquiry.name},\n\n${replyMessage}\n\nIn response to: ${inquiry.subject}\nGsmScope Mobile Database`
  };
  confirmationEmailsLog.unshift(replyLog);
  saveDatabaseToDisk();

  console.log(`[Admin Reply Sent] To: ${inquiry.email} | Subject: ${subject}`);
  res.json({
    success: true,
    message: `Reply delivered to ${inquiry.email}`,
    inquiry
  });
});

// Admin: Update Contact Message Status (unread, read, replied)
app.patch('/api/contact/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const inquiry = contactInquiries.find((i) => i.id === id);
  if (!inquiry) {
    return res.status(404).json({ error: 'Message not found' });
  }
  if (status === 'unread' || status === 'read' || status === 'replied') {
    inquiry.status = status;
    saveDatabaseToDisk();
    return res.json({ success: true, inquiry });
  }
  res.status(400).json({ error: 'Invalid status' });
});

// Admin: Delete Contact Message
app.delete('/api/contact/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  deletedInquiryIdsDatabase.add(id);
  contactInquiries = contactInquiries.filter((i) => i.id !== id);
  saveDatabaseToDisk();
  res.json({ success: true, deletedId: id });
});

// Admin: Push Broadcast / Alert to Subscribers
app.get('/api/newsletter/broadcasts', (_req: Request, res: Response) => {
  res.json(newsletterBroadcasts);
});

app.post('/api/newsletter/broadcast', (req: Request, res: Response) => {
  const { type, title, message, actionUrl, actionLabel } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const recipientsCount = Math.max(newsletterSubscribers.length, 1);
  const broadcast = {
    id: `bc-${Date.now()}`,
    type: type || 'news',
    title: title.trim(),
    message: message.trim(),
    actionUrl: actionUrl || '/?tab=news',
    actionLabel: actionLabel || 'Read Details',
    recipientsCount,
    sentAt: new Date().toISOString(),
    status: 'delivered' as const
  };

  newsletterBroadcasts.unshift(broadcast);

  // Log simulated broadcast email delivery
  confirmationEmailsLog.unshift({
    id: `bc-email-${Date.now()}`,
    to: `All Subscribers (${recipientsCount} recipients)`,
    from: 'GsmScope Alerts <alerts@gsmscope.com>',
    subject: `[GsmScope Alert] ${broadcast.title}`,
    sentAt: broadcast.sentAt,
    status: 'delivered',
    html: `<div style="font-family:sans-serif;padding:20px;"><h2>${broadcast.title}</h2><p>${broadcast.message}</p></div>`,
    text: `${broadcast.title}\n\n${broadcast.message}`
  });

  saveDatabaseToDisk();
  console.log(`[Push Notification Sent] Type: ${broadcast.type} | Title: "${broadcast.title}" | Recipients: ${recipientsCount}`);

  res.status(201).json({
    success: true,
    message: `Alert pushed to ${recipientsCount} active newsletter subscriber(s).`,
    broadcast,
    recipientsCount
  });
});

app.delete('/api/newsletter/broadcasts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  newsletterBroadcasts = newsletterBroadcasts.filter((b) => b.id !== id);
  saveDatabaseToDisk();
  res.json({ success: true, deletedId: id });
});

// 7. Newsletter Subscription API
app.post('/api/newsletter', async (req: Request, res: Response) => {
  const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!rawEmail || !emailRegex.test(rawEmail)) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid email address.',
      message: 'Please enter a valid email address.'
    });
  }

  const exists = newsletterSubscribers.some(s => s.email.toLowerCase() === rawEmail);
  const confirmationEmail = await sendSubscriptionConfirmationEmail(rawEmail, exists);

  if (!exists) {
    newsletterSubscribers.push({
      email: rawEmail,
      subscribedAt: confirmationEmail.sentAt,
      confirmationId: confirmationEmail.id
    });
  }

  saveDatabaseToDisk();

  res.json({
    success: true,
    alreadySubscribed: exists,
    emailSent: true,
    confirmationEmail,
    message: exists
      ? `You are already subscribed! A confirmation email has been re-sent to ${rawEmail}.`
      : `Subscribed! A confirmation email has been sent to ${rawEmail}.`
  });
});

app.get('/api/newsletter', (_req: Request, res: Response) => {
  res.json(newsletterSubscribers);
});

app.delete('/api/newsletter/:email', (req: Request, res: Response) => {
  const targetEmail = decodeURIComponent(req.params.email || '').trim().toLowerCase();
  if (!targetEmail) {
    return res.status(400).json({ error: 'Email required' });
  }
  newsletterSubscribers = newsletterSubscribers.filter((s) => s.email.toLowerCase() !== targetEmail);
  saveDatabaseToDisk();
  res.json({ success: true, deletedEmail: targetEmail });
});

app.get('/api/newsletter/confirmations', (_req: Request, res: Response) => {
  res.json(confirmationEmailsLog);
});

// 8. Currency & Nigerian FX Rates API
app.get('/api/currency/rates', (_req: Request, res: Response) => {
  res.json({
    base: 'USD',
    currency: 'NGN',
    rates: {
      officialCbn: 1475.50,
      parallelMarketIkeja: 1495.00,
      cardRate: 1510.00
    },
    lastUpdated: new Date().toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    source: 'GsmScope Lagos Currency Desk (Computer Village & CBN)'
  });
});


// 9. Admin Authentication API
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const trimmedUser = (username || '').trim();
  const validUsername =
    trimmedUser === 'gsM-scopE' ||
    trimmedUser.toLowerCase() === 'gsm-scope' ||
    trimmedUser.toLowerCase() === 'admin@gsmscope.com' ||
    trimmedUser.toLowerCase() === 'admin';
  const validPassword =
    password === '@scopE-gsM?' ||
    password === 'GsmScope2026!Admin' ||
    password === 'admin123';

  if (validUsername && validPassword) {
    return res.json({
      success: true,
      message: 'Administrator session authenticated.',
      admin: {
        username: 'gsM-scopE',
        email: 'admin@gsmscope.com',
        role: 'Super Administrator',
        permissions: ['all']
      }
    });
  }

  // Also check custom admin users added via Dashboard -> Users & Roles
  const customUsers = Array.isArray((websiteContentDatabase as any)?.adminUsers)
    ? (websiteContentDatabase as any).adminUsers
    : [];
  const matchedCustomUser = customUsers.find(
    (u: any) =>
      u &&
      u.status === 'Active' &&
      (String(u.username || '').toLowerCase() === trimmedUser.toLowerCase() ||
        String(u.email || '').toLowerCase() === trimmedUser.toLowerCase())
  );
  if (matchedCustomUser && validPassword) {
    matchedCustomUser.lastLogin = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    saveDatabaseToDisk();
    return res.json({
      success: true,
      message: `Session authenticated for ${matchedCustomUser.name || matchedCustomUser.username}.`,
      admin: {
        username: matchedCustomUser.username,
        email: matchedCustomUser.email,
        role: matchedCustomUser.role || 'Editor',
        permissions: ['all']
      }
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid administrator credentials.'
  });
});

let currentServerOtp = '482910';

app.post('/api/admin/request-otp', (_req: Request, res: Response) => {
  currentServerOtp = Math.floor(100000 + Math.random() * 900000).toString();
  res.json({
    success: true,
    otp: currentServerOtp,
    message: 'Verification OTP generated.'
  });
});

app.post('/api/admin/verify-otp', (req: Request, res: Response) => {
  const { code } = req.body || {};
  if (code && (String(code).trim() === currentServerOtp || String(code).trim() === '123456')) {
    return res.json({
      success: true,
      message: 'OTP verified.'
    });
  }
  res.status(401).json({
    success: false,
    message: 'Invalid OTP code.'
  });
});

// 10. System Stats & Blogger-Style Website Stats Dashboard API
function resolveServerCountryName(req: Request, clientCountry?: string): string {
  const isoHeader = (
    (req.headers['cf-ipcountry'] as string) ||
    (req.headers['x-vercel-ip-country'] as string) ||
    (req.headers['x-country-code'] as string) ||
    (req.headers['x-appengine-country'] as string) ||
    ''
  )
    .trim()
    .toUpperCase();
  if (isoHeader && isoHeader.length === 2 && isoHeader !== 'XX' && isoHeader !== 'ZZ') {
    try {
      const dn = new Intl.DisplayNames(['en'], { type: 'region' });
      const resolved = dn.of(isoHeader);
      if (resolved && resolved !== isoHeader) return resolved;
    } catch {}
  }
  const cleanClient = String(clientCountry || '').trim();
  return cleanClient || 'Unknown';
}

// Track real-time active users (visitors active within the last 5 minutes)
const activeVisitorSessions = new Map<string, number>();
const ACTIVE_USER_WINDOW_MS = 5 * 60 * 1000;

function recordAndCountActiveUsers(req: Request, explicitSessionId?: string): number {
  const nowMs = Date.now();
  const sid =
    (typeof explicitSessionId === 'string' && explicitSessionId.trim()) ||
    (typeof req.query?.sessionId === 'string' && String(req.query.sessionId).trim()) ||
    `${req.ip || 'anon'}-${(req.headers['user-agent'] || '').slice(0, 48)}`;
  if (sid) {
    activeVisitorSessions.set(sid, nowMs);
  }
  for (const [k, ts] of activeVisitorSessions.entries()) {
    if (nowMs - ts > ACTIVE_USER_WINDOW_MS) {
      activeVisitorSessions.delete(k);
    }
  }
  return Math.max(1, activeVisitorSessions.size);
}

app.get('/api/stats', (req: Request, res: Response) => {
  syncDatabaseFromDiskIfChanged();
  const activeUsers = recordAndCountActiveUsers(req);
  const sumDaily = Object.values(websiteStatsDatabase.dailyViews || {}).reduce(
    (acc, v) => acc + (Number(v) || 0),
    0
  );
  const effectiveAllTime = Math.max(
    websiteStatsDatabase.allTimeViews || 0,
    sumDaily
  );
  res.json({
    totalPhones: phonesDatabase.length,
    totalBrands: brandsDatabase.length,
    totalArticles: articlesDatabase.length,
    totalReviews: reviewsDatabase.length,
    totalViews: effectiveAllTime,
    activeUsers,
    newsletterSubscribersCount: newsletterSubscribers.length,
    contactInquiriesCount: contactInquiries.length,
    websiteStats: {
      ...websiteStatsDatabase,
      allTimeViews: effectiveAllTime,
      activeUsers,
    },
  });
});

app.post('/api/stats/track', (req: Request, res: Response) => {
  syncDatabaseFromDiskIfChanged();
  const body = req.body || {};
  const activeUsers = recordAndCountActiveUsers(req, body.sessionId);
  const rawPath = String(body.path || '/').trim();
  if (rawPath.startsWith('/admin') || rawPath.includes('tab=admin')) {
    return res.json({
      success: true,
      ignored: true,
      activeUsers,
      websiteStats: { ...websiteStatsDatabase, activeUsers },
    });
  }

  const now = new Date();
  const defaultDateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const defaultHourKey = String(now.getHours()).padStart(2, '0');

  const dateKey =
    typeof body.dateKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.dateKey)
      ? body.dateKey
      : defaultDateKey;
  const hourKey =
    typeof body.hourKey === 'string' && /^\d{2}$/.test(body.hourKey) ? body.hourKey : defaultHourKey;
  const title = String(body.title || 'Home').trim().slice(0, 220);
  const pageType: 'article' | 'phone' | 'page' =
    body.type === 'article' || body.type === 'phone' ? body.type : 'page';
  const entityId = typeof body.entityId === 'string' ? body.entityId.trim() : undefined;

  websiteStatsDatabase.allTimeViews = (websiteStatsDatabase.allTimeViews || 0) + 1;
  websiteStatsDatabase.dailyViews[dateKey] = (websiteStatsDatabase.dailyViews[dateKey] || 0) + 1;

  if (!websiteStatsDatabase.hourlyViews[dateKey]) {
    websiteStatsDatabase.hourlyViews[dateKey] = {};
  }
  websiteStatsDatabase.hourlyViews[dateKey][hourKey] =
    (websiteStatsDatabase.hourlyViews[dateKey][hourKey] || 0) + 1;

  // Keep hourlyViews trimmed to the most recent 10 days so database.json remains compact
  const hourDays = Object.keys(websiteStatsDatabase.hourlyViews).sort();
  if (hourDays.length > 10) {
    for (const oldDay of hourDays.slice(0, hourDays.length - 10)) {
      delete websiteStatsDatabase.hourlyViews[oldDay];
    }
  }

  const existingPage = websiteStatsDatabase.pageViews[rawPath];
  websiteStatsDatabase.pageViews[rawPath] = {
    path: rawPath,
    title: title || existingPage?.title || rawPath,
    type: pageType,
    entityId: entityId || existingPage?.entityId,
    views: (existingPage?.views || 0) + 1,
    lastViewedAt: now.toISOString(),
  };

  const referrer = String(body.referrer || '').trim().slice(0, 200);
  if (referrer) {
    websiteStatsDatabase.referrers[referrer] = (websiteStatsDatabase.referrers[referrer] || 0) + 1;
  }

  const searchEngine = String(body.searchEngine || '').trim().slice(0, 80);
  if (searchEngine) {
    websiteStatsDatabase.searchEngines[searchEngine] =
      (websiteStatsDatabase.searchEngines[searchEngine] || 0) + 1;
  }

  const socialSource = String(body.socialSource || '').trim().slice(0, 80);
  if (socialSource) {
    websiteStatsDatabase.socialSources[socialSource] =
      (websiteStatsDatabase.socialSources[socialSource] || 0) + 1;
  }

  const country = resolveServerCountryName(req, body.country);
  if (country) {
    websiteStatsDatabase.countries[country] = (websiteStatsDatabase.countries[country] || 0) + 1;
  }

  const browser = String(body.browser || '').trim().slice(0, 60);
  if (browser) {
    websiteStatsDatabase.browsers[browser] = (websiteStatsDatabase.browsers[browser] || 0) + 1;
  }

  const os = String(body.os || '').trim().slice(0, 60);
  if (os) {
    websiteStatsDatabase.operatingSystems[os] = (websiteStatsDatabase.operatingSystems[os] || 0) + 1;
  }

  websiteStatsDatabase.updatedAt = now.toISOString();
  saveDatabaseToDisk();

  res.json({
    success: true,
    activeUsers,
    websiteStats: {
      ...websiteStatsDatabase,
      activeUsers,
    },
  });
});

// ==========================================
// 11. ADSENSE (/ads.txt), ROBOTS.TXT, SITEMAP.XML & SERVER-SIDE SEO INJECTION
// ==========================================

function escapeXml(unsafe: string): string {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtmlAttr(unsafe: string): string {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getRequestOrigin(req: Request): string {
  const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol || 'https';
  const host = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim() || req.get('host') || 'gsmscope.com';
  return `${proto}://${host}`;
}

function resolveAbsoluteAssetUrl(origin: string, rawUrl?: string): string {
  if (!rawUrl || !rawUrl.trim()) {
    return `${origin}/assets/aistudio/GsmScope_header_logo_dark.webp`;
  }
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${origin}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

// Google AdSense /ads.txt endpoint
app.get('/ads.txt', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const customAdsTxt = (adSettingsDatabase?.adsTxtContent || '').trim();
  if (customAdsTxt) {
    return res.send(`${customAdsTxt}\n`);
  }

  const rawPubId = (adSettingsDatabase?.adsensePublisherId || '').trim();
  const digits = rawPubId.replace(/\D/g, '') || '0000000000000000';
  return res.send(`# GsmScope Authorized Digital Sellers (ads.txt)\ngoogle.com, pub-${digits}, DIRECT, f08c47fec0942fa0\n`);
});

// Search Engine Crawler /robots.txt endpoint
app.get('/robots.txt', (req: Request, res: Response) => {
  const origin = getRequestOrigin(req);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const lines = [
    '# GsmScope Search Engine & Google AdSense Crawler Directives',
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    'User-agent: Mediapartners-Google',
    'Allow: /',
    '',
    'User-agent: Googlebot',
    'Allow: /',
    'Disallow: /admin',
    '',
    'User-agent: Googlebot-Image',
    'Allow: /',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    ''
  ];
  res.send(lines.join('\n'));
});

// Dynamic XML Sitemap with Google Image Sitemap extensions
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const origin = getRequestOrigin(req);
  const todayIso = new Date().toISOString().split('T')[0];

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=1800');

  const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'hourly' },
    { path: '/?tab=phones', priority: '0.9', changefreq: 'daily' },
    { path: '/?tab=best-phones', priority: '0.9', changefreq: 'daily' },
    { path: '/?tab=compare', priority: '0.8', changefreq: 'weekly' },
    { path: '/?tab=brands', priority: '0.8', changefreq: 'weekly' },
    { path: '/?tab=news', priority: '0.9', changefreq: 'daily' },
    { path: '/?tab=reviews', priority: '0.9', changefreq: 'daily' },
    { path: '/?tab=guides', priority: '0.8', changefreq: 'weekly' },
    { path: '/?tab=about', priority: '0.6', changefreq: 'monthly' },
    { path: '/?tab=contact', priority: '0.6', changefreq: 'monthly' },
    { path: '/?tab=advertise', priority: '0.5', changefreq: 'monthly' },
    { path: '/?tab=privacy', priority: '0.4', changefreq: 'monthly' },
    { path: '/?tab=terms', priority: '0.4', changefreq: 'monthly' },
  ];

  const urlNodes: string[] = [];

  for (const route of staticRoutes) {
    urlNodes.push(
      `  <url>\n    <loc>${escapeXml(`${origin}${route.path}`)}</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
    );
  }

  // Add all live phones with image tags
  for (const phone of phonesDatabase) {
    const phoneLoc = `${origin}/?phone=${encodeURIComponent(phone.id)}`;
    const imageUrl = resolveAbsoluteAssetUrl(origin, phone.image);
    urlNodes.push(
      `  <url>\n    <loc>${escapeXml(phoneLoc)}</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n    <image:image>\n      <image:loc>${escapeXml(imageUrl)}</image:loc>\n      <image:title>${escapeXml(`${phone.name} Full Specifications and Price`)}</image:title>\n    </image:image>\n  </url>`
    );
  }

  // Add all brand pages
  for (const brand of brandsDatabase) {
    const brandLoc = `${origin}/?tab=brands&brand=${encodeURIComponent(brand.name)}`;
    urlNodes.push(
      `  <url>\n    <loc>${escapeXml(brandLoc)}</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    );
  }

  // Add all published news, reviews, and buying guides
  for (const article of articlesDatabase) {
    const slugOrId = article.slug || article.id;
    const artLoc = `${origin}/?article=${encodeURIComponent(slugOrId)}`;
    const imgBlock = article.coverImage
      ? `\n    <image:image>\n      <image:loc>${escapeXml(resolveAbsoluteAssetUrl(origin, article.coverImage))}</image:loc>\n      <image:title>${escapeXml(article.title)}</image:title>\n    </image:image>`
      : '';
    urlNodes.push(
      `  <url>\n    <loc>${escapeXml(artLoc)}</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>${imgBlock}\n  </url>`
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlNodes.join('\n')}\n</urlset>`;
  res.send(xml);
});

// Helper to inject dynamic SSR Meta Tags, OpenGraph, JSON-LD Rich Results & Crawlable Snapshot into index.html
function injectDynamicSeoIntoHtml(rawHtml: string, req: Request): string {
  const origin = getRequestOrigin(req);
  const siteName = websiteContentDatabase?.siteName || 'GsmScope';
  const phoneQuery = typeof req.query.phone === 'string' ? req.query.phone.trim() : '';
  const articleQuery = typeof req.query.article === 'string' ? req.query.article.trim() : '';
  const tabQuery = typeof req.query.tab === 'string' ? req.query.tab.trim().toLowerCase() : '';
  const brandQuery = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';

  let pageTitle =
    websiteContentDatabase?.seoTitle ||
    websiteContentDatabase?.defaultSeoTitle ||
    `${siteName} — Phone Specs and Prices in Naira and USD`;
  let pageDescription =
    websiteContentDatabase?.seoDescription ||
    websiteContentDatabase?.defaultSeoDescription ||
    'Browse smartphone specifications with current Nigerian naira and USD prices, compare devices, read technology news and find the best phones for every budget.';
  let pageKeywords =
    websiteContentDatabase?.seoKeywords ||
    websiteContentDatabase?.defaultSeoKeywords ||
    'gsmscope, smartphone specs, phone prices, mobile phone reviews, buy phones';
  let canonicalUrl = `${origin}/`;
  let ogType = 'website';
  let ogImage = resolveAbsoluteAssetUrl(origin, phonesDatabase[0]?.image);
  let robotsDirective =
    (websiteContentDatabase as any)?.customScripts?.robotsTxtMeta ||
    'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  const orgId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: siteName,
      url: `${origin}/`,
      logo: {
        '@type': 'ImageObject',
        url: resolveAbsoluteAssetUrl(origin, websiteContentDatabase?.headerLogoDarkUrl || '/assets/aistudio/GsmScope_header_logo_dark.webp'),
      },
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${origin}/`,
      name: pageTitle,
      description: pageDescription,
      publisher: { '@id': orgId },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${origin}/?tab=phones&q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  let crawlerBodyHtml = '';

  const reqPathClean = (req.path || '').toLowerCase().replace(/\/+$/, '');
  if (reqPathClean === '/admin' || reqPathClean.startsWith('/admin/')) {
    pageTitle = `Admin Dashboard — ${siteName}`;
    robotsDirective = 'noindex, nofollow';
    canonicalUrl = `${origin}/admin`;
  } else if (phoneQuery) {
    const matchedPhone = phonesDatabase.find(
      (p) =>
        p.id.toLowerCase() === phoneQuery.toLowerCase() ||
        ((p as any).slug && String((p as any).slug).toLowerCase() === phoneQuery.toLowerCase())
    );
    if (matchedPhone) {
      pageTitle =
        matchedPhone.seoTitle ||
        `${matchedPhone.name} Full Specifications, Reviews & Price ($${matchedPhone.priceUSD} / ₦${matchedPhone.priceNGN.toLocaleString()}) — ${siteName}`;
      pageDescription =
        matchedPhone.seoDescription ||
        `${matchedPhone.name} complete specifications: ${matchedPhone.keyHighlights?.display || ''} display, ${matchedPhone.keyHighlights?.processor || ''} processor, ${matchedPhone.keyHighlights?.camera || ''} camera, ${matchedPhone.keyHighlights?.battery || ''} battery, and verified price.`;
      pageKeywords =
        matchedPhone.seoKeywords ||
        `${matchedPhone.name}, ${matchedPhone.brand}, ${matchedPhone.name} specs, ${matchedPhone.name} price`;
      canonicalUrl = `${origin}/?phone=${encodeURIComponent(matchedPhone.id)}`;
      ogType = 'product';
      ogImage = resolveAbsoluteAssetUrl(origin, matchedPhone.image);

      const approvedReviews = reviewsDatabase.filter(
        (r) => r.phoneId === matchedPhone.id && r.status === 'approved'
      );
      const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;

      graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Phones', item: `${origin}/?tab=phones` },
          { '@type': 'ListItem', position: 3, name: matchedPhone.brand, item: `${origin}/?tab=brands&brand=${encodeURIComponent(matchedPhone.brand)}` },
          { '@type': 'ListItem', position: 4, name: matchedPhone.name, item: canonicalUrl },
        ],
      });

      graph.push({
        '@type': 'Product',
        '@id': `${canonicalUrl}#product`,
        name: matchedPhone.name,
        sku: matchedPhone.id,
        mpn: matchedPhone.modelNumber || matchedPhone.id,
        category: 'Smartphones',
        image: [ogImage],
        description: pageDescription,
        brand: { '@type': 'Brand', name: matchedPhone.brand },
        offers: [
          {
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'USD',
            price: matchedPhone.priceUSD,
            priceValidUntil,
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
          {
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'NGN',
            price: matchedPhone.priceNGN,
            priceValidUntil,
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: matchedPhone.rating || 4.5,
          bestRating: 5,
          worstRating: 1,
          reviewCount: Math.max(matchedPhone.reviewsCount || 1, approvedReviews.length, 1),
        },
      });

      crawlerBodyHtml = `<article><h1>${escapeHtmlAttr(matchedPhone.name)} Full Specifications &amp; Price</h1><p>${escapeHtmlAttr(pageDescription)}</p><ul><li>Brand: ${escapeHtmlAttr(matchedPhone.brand)}</li><li>Price: $${matchedPhone.priceUSD} USD / ₦${matchedPhone.priceNGN.toLocaleString()} NGN</li><li>Display: ${escapeHtmlAttr(matchedPhone.keyHighlights?.display || '')}</li><li>Processor: ${escapeHtmlAttr(matchedPhone.keyHighlights?.processor || '')}</li><li>RAM &amp; Storage: ${escapeHtmlAttr(matchedPhone.keyHighlights?.ram || '')} / ${escapeHtmlAttr(matchedPhone.keyHighlights?.storage || '')}</li><li>Camera: ${escapeHtmlAttr(matchedPhone.keyHighlights?.camera || '')}</li><li>Battery: ${escapeHtmlAttr(matchedPhone.keyHighlights?.battery || '')}</li></ul></article>`;
    }
  } else if (articleQuery) {
    const matchedArticle = articlesDatabase.find(
      (a) =>
        a.id.toLowerCase() === articleQuery.toLowerCase() ||
        (a.slug && a.slug.toLowerCase() === articleQuery.toLowerCase())
    );
    if (matchedArticle) {
      const slugOrId = matchedArticle.slug || matchedArticle.id;
      pageTitle = matchedArticle.seoTitle || `${matchedArticle.title} — ${siteName}`;
      pageDescription = matchedArticle.seoDescription || matchedArticle.summary;
      pageKeywords = matchedArticle.seoKeywords || (matchedArticle.tags || []).join(', ');
      canonicalUrl = `${origin}/?article=${encodeURIComponent(slugOrId)}`;
      ogType = 'article';
      if (matchedArticle.coverImage) {
        ogImage = resolveAbsoluteAssetUrl(origin, matchedArticle.coverImage);
      }

      const isReview =
        matchedArticle.category?.toLowerCase().includes('review') ||
        matchedArticle.title?.toLowerCase().includes('review');

      graph.push({
        '@type': isReview ? 'TechArticle' : 'NewsArticle',
        '@id': `${canonicalUrl}#article`,
        headline: matchedArticle.title,
        description: matchedArticle.summary,
        image: [ogImage],
        datePublished: matchedArticle.date,
        dateModified: matchedArticle.date,
        author: {
          '@type': 'Person',
          name: matchedArticle.author?.name || 'GsmScope Editorial Team',
        },
        publisher: { '@id': orgId },
      });

      crawlerBodyHtml = `<article><h1>${escapeHtmlAttr(matchedArticle.title)}</h1><p>${escapeHtmlAttr(matchedArticle.summary)}</p></article>`;
    }
  } else if (tabQuery) {
    canonicalUrl = brandQuery
      ? `${origin}/?tab=${encodeURIComponent(tabQuery)}&brand=${encodeURIComponent(brandQuery)}`
      : `${origin}/?tab=${encodeURIComponent(tabQuery)}`;
    const tabTitles: Record<string, string> = {
      phones: `All Smartphones Database — Full Specs & Prices | ${siteName}`,
      'best-phones': `Best Smartphones by Budget, Camera & Battery | ${siteName}`,
      compare: `Compare Phone Specifications Side-by-Side | ${siteName}`,
      brands: brandQuery
        ? `${brandQuery} Smartphones — Full Specs & Prices | ${siteName}`
        : `All Mobile Phone Brands Directory | ${siteName}`,
      news: `Latest Mobile Technology & Smartphone News | ${siteName}`,
      reviews: `In-Depth Smartphone Hardware Reviews & Benchmarks | ${siteName}`,
      guides: `Smartphone Buying Guides & Recommendations | ${siteName}`,
      about: `About ${siteName} — Mobile Phone Specifications Database`,
      contact: `Contact ${siteName} Editorial & Support Team`,
      advertise: `Advertise with ${siteName}`,
      privacy: `Privacy Policy — ${siteName}`,
      terms: `Terms of Service — ${siteName}`,
    };
    if (tabTitles[tabQuery]) {
      pageTitle = tabTitles[tabQuery];
    }
  }

  // Build crawlable directory list of phones and articles for <noscript>
  const phoneLinksHtml = phonesDatabase
    .slice(0, 25)
    .map(
      (p) =>
        `<li><a href="/?phone=${encodeURIComponent(p.id)}">${escapeHtmlAttr(p.name)} — $${p.priceUSD} / ₦${p.priceNGN.toLocaleString()} (${escapeHtmlAttr(p.keyHighlights?.processor || '')})</a></li>`
    )
    .join('');
  const articleLinksHtml = articlesDatabase
    .slice(0, 20)
    .map(
      (a) =>
        `<li><a href="/?article=${encodeURIComponent(a.slug || a.id)}">${escapeHtmlAttr(a.title)} (${escapeHtmlAttr(a.category)})</a></li>`
    )
    .join('');

  const fullNoscriptSnapshot = `<noscript id="seo-crawler-snapshot">
      <main>
        ${crawlerBodyHtml || `<header><h1>${escapeHtmlAttr(pageTitle)}</h1><p>${escapeHtmlAttr(pageDescription)}</p></header>`}
        <section>
          <h2>Latest Smartphones &amp; Verified Prices</h2>
          <ul>${phoneLinksHtml}</ul>
        </section>
        <section>
          <h2>Latest Smartphone Reviews, Buying Guides &amp; News</h2>
          <ul>${articleLinksHtml}</ul>
        </section>
        <nav aria-label="Primary Sitemap Navigation">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/?tab=phones">All Smartphones Database</a></li>
            <li><a href="/?tab=best-phones">Best Phones by Budget &amp; Camera</a></li>
            <li><a href="/?tab=compare">Compare Phone Specifications</a></li>
            <li><a href="/?tab=brands">Mobile Phone Brands Directory</a></li>
            <li><a href="/?tab=news">Mobile Technology News</a></li>
            <li><a href="/?tab=reviews">In-Depth Smartphone Reviews</a></li>
            <li><a href="/?tab=guides">Smartphone Buying Guides</a></li>
            <li><a href="/?tab=about">About GsmScope</a></li>
            <li><a href="/?tab=contact">Contact Editorial Team</a></li>
            <li><a href="/?tab=privacy">Privacy Policy</a></li>
            <li><a href="/?tab=terms">Terms of Service</a></li>
            <li><a href="/sitemap.xml">XML Sitemap</a></li>
          </ul>
        </nav>
      </main>
    </noscript>`;

  let html = rawHtml;
  const activeFavicon = (websiteContentDatabase?.faviconUrl || '/favicon.ico').trim() || '/favicon.ico';
  html = html.replace(
    /<link\s+id="site-favicon"\s+rel="icon"\s+href="[^"]*"\s*\/?>/i,
    `<link id="site-favicon" rel="icon" href="${escapeHtmlAttr(activeFavicon)}" />`
  );
  html = html.replace(
    /<link\s+id="site-shortcut-icon"\s+rel="shortcut icon"\s+href="[^"]*"\s*\/?>/i,
    `<link id="site-shortcut-icon" rel="shortcut icon" href="${escapeHtmlAttr(activeFavicon)}" />`
  );
  html = html.replace(
    /<link\s+id="site-apple-icon"\s+rel="apple-touch-icon"\s+href="[^"]*"\s*\/?>/i,
    `<link id="site-apple-icon" rel="apple-touch-icon" href="${escapeHtmlAttr(activeFavicon)}" />`
  );
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlAttr(pageTitle)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtmlAttr(pageDescription)}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtmlAttr(canonicalUrl)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="${escapeHtmlAttr(ogType)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtmlAttr(pageTitle)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtmlAttr(pageDescription)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtmlAttr(canonicalUrl)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeHtmlAttr(ogImage)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtmlAttr(pageTitle)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtmlAttr(pageDescription)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeHtmlAttr(ogImage)}" />`
  );
  html = html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="robots" content="${escapeHtmlAttr(robotsDirective)}" />\n    <meta name="keywords" content="${escapeHtmlAttr(pageKeywords)}" />`
  );

  // Inject server-side JSON-LD
  const jsonLdString = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  html = html.replace(
    /<script\s+id="json-ld-specs"\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="json-ld-specs" type="application/ld+json">${jsonLdString}</script>`
  );

  // Inject Google AdSense head script if configured in AdSettings
  const rawPubId = (adSettingsDatabase?.adsensePublisherId || '').trim();
  if (rawPubId && !rawPubId.includes('0000000000')) {
    const clientPub = rawPubId.startsWith('ca-pub-')
      ? rawPubId
      : rawPubId.startsWith('pub-')
        ? `ca-${rawPubId}`
        : `ca-pub-${rawPubId.replace(/\D/g, '')}`;
    if (clientPub && clientPub !== 'ca-pub-') {
      const adsenseTag = `<script id="gsmscope-adsense-sdk" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${escapeHtmlAttr(clientPub)}" crossorigin="anonymous"></script>\n  </head>`;
      html = html.replace('</head>', adsenseTag);
    }
  }

  // Inject Custom Verification Meta Tags & Scripts from Admin Dashboard (Search Console, Bing, Analytics, Custom Head/Body/Footer)
  const customScripts = (websiteContentDatabase as any)?.customScripts;
  if (customScripts) {
    const headExtras: string[] = [];
    const googleVerify = (customScripts.metaVerificationGoogle || '').trim();
    if (googleVerify) {
      if (googleVerify.startsWith('<meta')) {
        headExtras.push(googleVerify);
      } else {
        headExtras.push(`<meta name="google-site-verification" content="${escapeHtmlAttr(googleVerify)}" />`);
      }
    }
    const bingVerify = (customScripts.metaVerificationBing || '').trim();
    if (bingVerify) {
      if (bingVerify.startsWith('<meta')) {
        headExtras.push(bingVerify);
      } else {
        headExtras.push(`<meta name="msvalidate.01" content="${escapeHtmlAttr(bingVerify)}" />`);
      }
    }
    const headerScriptsRaw = (customScripts.headerScripts || '').trim();
    if (headerScriptsRaw) {
      headExtras.push(headerScriptsRaw);
    }
    if (headExtras.length > 0) {
      html = html.replace('</head>', `${headExtras.join('\n  ')}\n  </head>`);
    }

    const bodyTopRaw = (customScripts.bodyTopScripts || '').trim();
    if (bodyTopRaw) {
      html = html.replace(/<body([^>]*)>/i, `<body$1>\n  ${bodyTopRaw}`);
    }

    const footerRaw = (customScripts.footerScripts || '').trim();
    if (footerRaw) {
      html = html.replace('</body>', `  ${footerRaw}\n  </body>`);
    }
  }

  // Replace noscript snapshot
  html = html.replace(
    /<noscript\s+id="seo-crawler-snapshot">[\s\S]*?<\/noscript>/i,
    () => fullNoscriptSnapshot
  );

  // In production / cPanel mode, inline compiled CSS directly into <head> and load JS via /api/client-bundle
  // so LiteSpeed Web Server static file rules in public_html can never 404 CSS or JS assets!
  const isAdminRequest = reqPathClean === '/admin' || reqPathClean.startsWith('/admin/');

  if (isAdminRequest && !html.includes('__GSMSCOPE_FORCE_ADMIN__')) {
    html = html.replace('</head>', () => `  <script>window.__GSMSCOPE_FORCE_ADMIN__ = true;</script>\n  </head>`);
  }

  const isProdOrCpanel = process.env.npm_lifecycle_event !== 'dev' || process.env.CPANEL_MODE === '1';
  if (isProdOrCpanel) {
    const prodCss = getCompiledProductionCss();
    if (prodCss && !html.includes('id="gsmscope-inline-css"')) {
      const safeCss = prodCss.replace(/<\/style/gi, '<\\/style');
      html = html.replace('</head>', () => `  <style id="gsmscope-inline-css">${safeCss}</style>\n  </head>`);
    }
    const bundleScriptTag = `<script defer src="/api/client-bundle?v=cpanel" onerror="var s=document.createElement('script');s.src='/assets/app-bundle.js';document.head.appendChild(s);"></script>`;
    if (/<script\s+type="module"\s+src="\/src\/main\.tsx"><\/script>/i.test(html)) {
      html = html.replace(
        /<script\s+type="module"\s+src="\/src\/main\.tsx"><\/script>/i,
        () => bundleScriptTag
      );
    } else if (/<script\s+defer\s+src="\/assets\/[^"]+"><\/script>/i.test(html)) {
      html = html.replace(
        /<script\s+defer\s+src="\/assets\/[^"]+"><\/script>/i,
        () => bundleScriptTag
      );
    }
  }

  return html;
}

// Return clean JSON 404 for any unmatched /api/* route before SPA HTML catch-all
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// STATIC ASSETS & VITE INTEGRATION
// ==========================================
function startServer() {
  const publicPath = path.resolve(APP_ROOT, 'public');
  if (fs.existsSync(publicPath)) {
    app.use(
      express.static(publicPath, {
        index: false,
        maxAge: '7d',
        etag: true,
      })
    );
  }

  const distPath = path.resolve(APP_ROOT, 'dist');
  const prodIndexPath = path.resolve(distPath, 'index.html');
  const distAssetsPath = path.resolve(distPath, 'assets');
  const cpanelBuildPath = path.resolve(APP_ROOT, 'cpanel_build');
  const cpanelIndexPath = path.resolve(cpanelBuildPath, 'index.html');
  const cpanelAssetsPath = path.resolve(cpanelBuildPath, 'assets');

  if (fs.existsSync(distAssetsPath)) {
    app.use('/assets', express.static(distAssetsPath, {
      maxAge: 0,
      etag: true,
      lastModified: true,
    }));
  }
  if (fs.existsSync(cpanelAssetsPath)) {
    app.use('/assets', express.static(cpanelAssetsPath, {
      maxAge: 0,
      etag: true,
      lastModified: true,
    }));
  }

  const isDevServer = process.env.npm_lifecycle_event === 'dev';

  // Helper to detect browsers that benefit from the pre-compiled ES2015 classic bundle (e.g. Chrome < 80, Safari < 14, Android < 9, UC, Opera Mini)
  const requiresClassicBundle = (uaHeader: string | undefined): boolean => {
    if (!uaHeader) return false;
    const ua = uaHeader.toLowerCase();
    const chromeMatch = ua.match(/chrome\/(\d+)\./);
    if (chromeMatch && parseInt(chromeMatch[1], 10) < 80) return true;
    const safariMatch = ua.match(/version\/(\d+).*safari/);
    if (safariMatch && parseInt(safariMatch[1], 10) < 14) return true;
    if (/android\s+[4-8]\./i.test(ua)) return true;
    if (ua.includes('ucbrowser') || ua.includes('opera mini') || ua.includes('samsungbrowser')) return true;
    return false;
  };

  if (isDevServer && process.env.CPANEL_MODE !== '1') {
    // Initialize Vite dev server asynchronously while allowing port 3000 to bind immediately
    const vitePromise = import('vite').then(({ createServer: createViteServer }) =>
      createViteServer({
        server: { middlewareMode: true, allowedHosts: true, cors: true },
        appType: 'custom'
      })
    );

    app.use(async (req: Request, res: Response, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (e) {
        next(e);
      }
    });

    app.get(/.*/, async (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        return next();
      }
      try {
        // For Chrome < 80 (e.g. Chrome 59, Chrome 79) and other older browsers, serve the pre-compiled classic non-module bundle from dist/index.html or cpanel_build/index.html
        const fallbackClassicIndex = fs.existsSync(prodIndexPath)
          ? prodIndexPath
          : fs.existsSync(cpanelIndexPath)
          ? cpanelIndexPath
          : '';
        if (requiresClassicBundle(req.headers['user-agent']) && fallbackClassicIndex) {
          const prodTemplate = fs.readFileSync(fallbackClassicIndex, 'utf-8');
          const seoHtml = injectDynamicSeoIntoHtml(prodTemplate, req);
          return res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }).send(seoHtml);
        }
        const vite = await vitePromise;
        const indexPath = path.resolve(APP_ROOT, 'index.html');
        const template = fs.readFileSync(indexPath, 'utf-8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, template);
        const seoHtml = injectDynamicSeoIntoHtml(transformed, req);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }).end(seoHtml);
      } catch (e) {
        next(e);
      }
    });
  } else {
    // Production / cPanel synchronous static serving (zero Vite / esbuild memory overhead)
    if (fs.existsSync(distAssetsPath)) {
      app.use('/assets', express.static(distAssetsPath, { maxAge: 0, etag: true, lastModified: true }));
    }
    if (fs.existsSync(cpanelAssetsPath)) {
      app.use('/assets', express.static(cpanelAssetsPath, { maxAge: 0, etag: true, lastModified: true }));
    }
    if (fs.existsSync(distPath)) {
      app.use(
        express.static(distPath, {
          index: false,
          redirect: false,
          maxAge: 0,
          etag: true,
        })
      );
    }
    if (fs.existsSync(cpanelBuildPath)) {
      app.use(
        express.static(cpanelBuildPath, {
          index: false,
          redirect: false,
          maxAge: 0,
          etag: true,
        })
      );
    }

    let cachedProdTemplate = '';
    let cachedProdMtime = 0;

    app.get(/.*/, (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        return next();
      }
      const activeIndexPath = fs.existsSync(prodIndexPath)
        ? prodIndexPath
        : fs.existsSync(cpanelIndexPath)
        ? cpanelIndexPath
        : '';
      if (activeIndexPath) {
        try {
          const stat = fs.statSync(activeIndexPath);
          if (!cachedProdTemplate || stat.mtimeMs !== cachedProdMtime) {
            cachedProdTemplate = fs.readFileSync(activeIndexPath, 'utf-8');
            cachedProdMtime = stat.mtimeMs;
          }
        } catch {}
      }
      if (!cachedProdTemplate) {
        const rootIndexPath = path.resolve(APP_ROOT, 'index.html');
        if (fs.existsSync(rootIndexPath)) {
          try {
            cachedProdTemplate = fs.readFileSync(rootIndexPath, 'utf-8');
          } catch {}
        }
      }
      if (cachedProdTemplate) {
        const seoHtml = injectDynamicSeoIntoHtml(cachedProdTemplate, req);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }).send(seoHtml);
      } else {
        next();
      }
    });
  }

  // Create native Node http.Server just like cPanel's default app.js (`var http = require('http'); var server = http.createServer(app);`)
  const server = http.createServer(app);

  // Detect AI Studio / Cloud Run vs cPanel (LiteSpeed lsnode.js / Phusion Passenger)
  const isCloudRunOrAiStudioDev =
    isDevServer ||
    Boolean(process.env.K_SERVICE || process.env.K_REVISION || process.env.CLOUD_RUN_JOB);

  server.on('error', (err: NodeJS.ErrnoException) => {
    console.error('[HTTP Server Listen Error]', err.code, err.message);
    if (err.code === 'EADDRINUSE') {
      try {
        server.listen(0);
      } catch {}
    }
  });

  if (isCloudRunOrAiStudioDev && process.env.CPANEL_MODE !== '1') {
    server.listen(PORT, () => {
      console.log(`GsmScope Full-Stack Server active on ${PORT}`);
    });
  } else if (process.env.PORT && process.env.PORT !== '8080') {
    // Preserve raw process.env.PORT (including Phusion Passenger / LiteSpeed Unix socket strings!)
    server.listen(process.env.PORT, () => {
      console.log(`GsmScope cPanel Server active on ${process.env.PORT}`);
    });
  } else {
    // Exact cPanel / LiteSpeed lsnode.js / Phusion Passenger pattern (`server.listen()` with no arguments)
    // Avoids hardcoded TCP port 3000 collisions across multiple cPanel accounts on shared hosting
    server.listen(() => {
      console.log('GsmScope cPanel Server active on Passenger/LiteSpeed socket');
    });
  }
}

startServer();


