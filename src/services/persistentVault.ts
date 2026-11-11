import {
  Phone,
  Brand,
  Article,
  Review,
  AdSettings,
  WebsiteContent,
  MediaItem,
  ContactInquiry,
} from '../types';

const DB_NAME = 'gsmscope_persistent_vault_v1';
const DB_VERSION = 1;
const STORE_NAME = 'vault_store';

export interface VaultSnapshot {
  updatedAt: string;
  phones?: Phone[];
  brands?: Brand[];
  articles?: Article[];
  reviews?: Review[];
  adSettings?: AdSettings;
  websiteContent?: WebsiteContent;
  mediaLibrary?: MediaItem[];
  contactInquiries?: ContactInquiry[];
  uploadDataUrls?: Record<string, string>;
  deletedPhoneIds?: string[];
  deletedArticleIds?: string[];
  deletedReviewIds?: string[];
  deletedBrandKeys?: string[];
  deletedInquiryIds?: string[];
}

// In-memory cache of /uploads/... -> data:image/...;base64,... for instant zero-404 resolution
const memoryUploadDataUrlMap = new Map<string, string>();

// Load any cached upload dataUrls from localStorage on module init
try {
  if (typeof window !== 'undefined') {
    const rawMap = localStorage.getItem('gsmscope_upload_dataurls_v1');
    if (rawMap) {
      const parsed = JSON.parse(rawMap) as Record<string, string>;
      for (const [k, v] of Object.entries(parsed)) {
        if (k && typeof v === 'string' && v.startsWith('data:')) {
          memoryUploadDataUrlMap.set(k, v);
        }
      }
    }
    const rawMedia = localStorage.getItem('gsmscope_media_library_v1');
    if (rawMedia) {
      const list = JSON.parse(rawMedia) as MediaItem[];
      if (Array.isArray(list)) {
        for (const m of list) {
          if (m?.url && m?.dataUrl && m.dataUrl.startsWith('data:')) {
            memoryUploadDataUrlMap.set(m.url, m.dataUrl);
          }
        }
      }
    }
  }
} catch {}

export function registerUploadDataUrl(url?: string, dataUrl?: string): void {
  if (!url || !dataUrl || !dataUrl.startsWith('data:')) return;
  memoryUploadDataUrlMap.set(url, dataUrl);
  try {
    if (typeof window !== 'undefined') {
      const obj: Record<string, string> = {};
      for (const [k, v] of memoryUploadDataUrlMap.entries()) {
        obj[k] = v;
      }
      safeSetLocalStorage('gsmscope_upload_dataurls_v1', JSON.stringify(obj));
    }
  } catch {}
  saveVaultKeyToIndexedDB('uploadDataUrls', Object.fromEntries(memoryUploadDataUrlMap.entries())).catch(() => {});
}

export function getCachedDataUrlForUpload(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  if (url.startsWith('data:')) return url;
  return memoryUploadDataUrlMap.get(url);
}

export function getAllCachedUploadDataUrls(): Record<string, string> {
  return Object.fromEntries(memoryUploadDataUrlMap.entries());
}

const KEY_TO_IDB_MAP: Record<string, keyof VaultSnapshot> = {
  gsmscope_phones_v3: 'phones',
  gsmscope_brands_v3: 'brands',
  gsmscope_articles_v2: 'articles',
  gsmscope_reviews_v2: 'reviews',
  gsmscope_ads_v3: 'adSettings',
  gsmscope_website_content_v1: 'websiteContent',
  gsmscope_media_library_v1: 'mediaLibrary',
  gsmscope_contact_inquiries_v1: 'contactInquiries',
  gsmscope_upload_dataurls_v1: 'uploadDataUrls',
};

/**
 * Quota-safe localStorage.setItem wrapper + automatic IndexedDB vault mirroring.
 * Never throws QuotaExceededError: if localStorage is full due to large base64 strings,
 * it trims oversized base64 cache entries in localStorage (while IndexedDB keeps full copies)
 * and retries saving the key.
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;

  // Mirror full, un-trimmed payload to IndexedDB vault asynchronously
  const idbKey = KEY_TO_IDB_MAP[key];
  if (idbKey) {
    try {
      const parsedForIdb = JSON.parse(value);
      saveVaultKeyToIndexedDB(idbKey, parsedForIdb).catch(() => {});
    } catch {}
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    try {
      // Free space by removing redundant or oversized base64 caches in localStorage
      localStorage.removeItem('gsmscope_upload_dataurls_v1');
      localStorage.removeItem('gsmscope_phones_v2');
      localStorage.removeItem('gsmscope_brands_v2');
      localStorage.removeItem('gsmscope_ads_v2');

      // If saving mediaLibrary itself failed due to huge dataUrls, store lightweight metadata in localStorage
      // (full dataUrls remain safely stored in IndexedDB)
      if (key === 'gsmscope_media_library_v1') {
        const parsed = JSON.parse(value) as MediaItem[];
        const slim = parsed.map((m) => ({
          ...m,
          dataUrl: m.dataUrl && m.dataUrl.length > 180000 ? undefined : m.dataUrl,
        }));
        localStorage.setItem(key, JSON.stringify(slim));
        return true;
      } else {
        // Slim down gsmscope_media_library_v1 in localStorage to make room for critical data
        const rawMedia = localStorage.getItem('gsmscope_media_library_v1');
        if (rawMedia && rawMedia.length > 200000) {
          const parsedMedia = JSON.parse(rawMedia) as MediaItem[];
          const slimMedia = parsedMedia.map((m) => ({
            ...m,
            dataUrl: m.dataUrl && m.dataUrl.length > 120000 ? undefined : m.dataUrl,
          }));
          localStorage.setItem('gsmscope_media_library_v1', JSON.stringify(slimMedia));
        }
        localStorage.setItem(key, value);
        return true;
      }
    } catch {
      return false;
    }
  }
}

function openVaultDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveVaultKeyToIndexedDB<T>(key: string, value: T): Promise<void> {
  const db = await openVaultDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      db.close();
      resolve();
    }
  });
}

export async function loadVaultFromIndexedDB(): Promise<Partial<VaultSnapshot>> {
  const db = await openVaultDB();
  if (!db) return {};
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const keys = [
        'phones',
        'brands',
        'articles',
        'reviews',
        'adSettings',
        'websiteContent',
        'mediaLibrary',
        'contactInquiries',
        'uploadDataUrls',
      ] as const;
      const result: Partial<VaultSnapshot> = {};
      let remaining = keys.length;

      keys.forEach((k) => {
        const req = store.get(k);
        req.onsuccess = () => {
          if (req.result !== undefined) {
            (result as any)[k] = req.result;
          }
          remaining -= 1;
          if (remaining === 0) {
            if (result.uploadDataUrls && typeof result.uploadDataUrls === 'object') {
              for (const [u, d] of Object.entries(result.uploadDataUrls)) {
                if (u && typeof d === 'string' && d.startsWith('data:')) {
                  memoryUploadDataUrlMap.set(u, d);
                }
              }
            }
            if (Array.isArray(result.mediaLibrary)) {
              for (const m of result.mediaLibrary) {
                if (m?.url && m?.dataUrl && m.dataUrl.startsWith('data:')) {
                  memoryUploadDataUrlMap.set(m.url, m.dataUrl);
                }
              }
            }
            db.close();
            resolve(result);
          }
        };
        req.onerror = () => {
          remaining -= 1;
          if (remaining === 0) {
            db.close();
            resolve(result);
          }
        };
      });
    } catch {
      db.close();
      resolve({});
    }
  });
}

export async function clearIndexedDBVault(): Promise<void> {
  memoryUploadDataUrlMap.clear();
  const db = await openVaultDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      db.close();
      resolve();
    }
  });
}

/**
 * Optimizes an uploaded image DataURL in the browser so that huge multi-megabyte photos
 * are compressed to crisp, fast-loading web assets (~80KB-250KB) that never overflow storage
 * and restore instantaneously across server restarts.
 */
export function optimizeImageDataUrl(rawDataUrl: string, maxDimension = 1400): Promise<string> {
  if (
    typeof window === 'undefined' ||
    !rawDataUrl ||
    !rawDataUrl.startsWith('data:image/') ||
    rawDataUrl.startsWith('data:image/svg') ||
    rawDataUrl.startsWith('data:image/gif') ||
    rawDataUrl.length < 220000
  ) {
    return Promise.resolve(rawDataUrl);
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width <= 0 || height <= 0) {
            resolve(rawDataUrl);
            return;
          }
          if (width > maxDimension || height > maxDimension) {
            if (width >= height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const isPngOrWebp =
            rawDataUrl.startsWith('data:image/png') || rawDataUrl.startsWith('data:image/webp');
          const mime = isPngOrWebp ? 'image/webp' : 'image/jpeg';
          const compressed = canvas.toDataURL(mime, 0.84);
          resolve(compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    } catch {
      resolve(rawDataUrl);
    }
  });
}
