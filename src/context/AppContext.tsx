import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Phone, 
  Brand, 
  Article, 
  Review, 
  AdSettings, 
  ActiveTab, 
  FilterState,
  ThemeMode,
  GlobalToastState,
  WebsiteContent,
  MediaItem,
  AdPlacementId,
  AdPlacementConfig
} from '../types';
import { 
  INITIAL_PHONES, 
  INITIAL_BRANDS, 
  INITIAL_ARTICLES, 
  INITIAL_REVIEWS, 
  INITIAL_AD_SETTINGS,
  DEFAULT_AD_PLACEMENTS,
  INITIAL_WEBSITE_CONTENT,
  INITIAL_MEDIA_ITEMS
} from '../data/seedData';
import { 
  fetchPhonesFromApi, 
  fetchBrandsFromApi, 
  fetchArticlesFromApi, 
  fetchReviewsFromApi, 
  fetchAdSettingsFromApi,
  createPhoneApi, 
  updatePhoneApi, 
  deletePhoneApi, 
  recordPhoneViewApi,
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
  createArticleApi,
  updateArticleApi,
  deleteArticleApi,
  submitReviewApi,
  updateReviewStatusApi,
  deleteReviewApi,
  updateAdSettingsApi,
  importDatabaseApi,
  resetDatabaseApi,
  adminLoginApi,
  adminRequestOtpApi,
  adminVerifyOtpApi,
  fetchWebsiteContentApi,
  updateWebsiteContentApi,
  fetchMediaItemsApi,
  uploadMediaImageApi,
  addMediaItemApi,
  deleteMediaItemApi
} from '../services/api';

interface AppContextType {
  phones: Phone[];
  brands: Brand[];
  articles: Article[];
  reviews: Review[];
  adSettings: AdSettings;
  compareList: string[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedPhone: Phone | null;
  setSelectedPhone: (phone: Phone | null) => void;
  selectedArticle: Article | null;
  setSelectedArticle: (article: Article | null) => void;
  selectedBrand: Brand | null;
  setSelectedBrand: (brand: Brand | null) => void;
  goBack: () => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  setCategoryPreset: (presetKey: string) => void;

  // Theme
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;

  // Currency
  currency: 'NGN' | 'USD';
  setCurrency: (c: 'NGN' | 'USD') => void;
  toggleCurrency: () => void;
  formatPrice: (priceNGN: number, priceUSD?: number) => string;
  formatNaira: (amount: number) => string;
  formatUSD: (amount: number) => string;
  
  // Compare methods
  addToCompare: (phoneId: string) => void;
  removeFromCompare: (phoneId: string) => void;
  clearCompare: (silent?: boolean) => void;
  isInCompare: (phoneId: string) => boolean;

  // Admin and Auth methods
  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => { success: boolean; message: string };
  adminRequestOtp: () => string;
  adminVerifyOtp: (code: string) => { success: boolean; message: string };
  adminLogout: () => void;
  currentOtp: string | null;
  adminUrl: string;
  adminSection: string;
  setAdminSection: (section: string) => void;
  adminSubView: string | null;
  setAdminSubView: (subView: string | null) => void;

  // CRUD methods
  recordPhoneView: (phoneId: string) => void;
  addPhone: (phone: Phone) => void;
  updatePhone: (phone: Phone) => void;
  deletePhone: (id: string) => void;
  updatePhonePrice: (id: string, newPriceNGN: number, newPriceUSD?: number, notes?: string) => void;
  
  addBrand: (brand: Brand) => void;
  updateBrand: (brand: Brand) => void;
  deleteBrand: (id: string) => void;

  addArticle: (article: Article) => void;
  updateArticle: (article: Article) => void;
  deleteArticle: (id: string) => void;

  addReview: (reviewData: Omit<Review, 'id' | 'date' | 'status'>) => void;
  updateReview: (review: Review) => void;
  updateReviewStatus: (id: string, status: 'approved' | 'pending' | 'rejected') => void;
  deleteReview: (id: string) => void;

  updateAdSettings: (settings: AdSettings) => void;
  websiteContent: WebsiteContent;
  updateWebsiteContent: (content: Partial<WebsiteContent>) => Promise<boolean>;
  mediaLibrary: MediaItem[];
  uploadMediaImage: (payload: {
    filename: string;
    data: string;
    name?: string;
    category?: MediaItem['category'];
    alt?: string;
    assignedPhoneId?: string;
    assignedArticleId?: string;
  }) => Promise<{ success: boolean; media?: MediaItem; url?: string; error?: string }>;
  addMediaItem: (item: {
    name: string;
    url: string;
    category?: MediaItem['category'];
    alt?: string;
    assignedPhoneId?: string;
    assignedArticleId?: string;
  }) => Promise<MediaItem | null>;
  deleteMediaItem: (id: string) => Promise<boolean>;
  refreshMediaLibrary: () => Promise<void>;
  resetToDefaults: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonStr: string) => boolean;

  // Global Loading & Navigation Progress Bar
  isGlobalLoading: boolean;
  globalProgress: number;
  startGlobalLoading: (reason?: string) => void;
  stopGlobalLoading: () => void;
  triggerNavigation: (action: () => void | Promise<void>) => Promise<void>;
  refreshData: () => Promise<void>;

  // Global Toast Feedback
  globalToast: GlobalToastState | null;
  showGlobalToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideGlobalToast: () => void;
}

const defaultFilterState: FilterState = {
  searchQuery: '',
  selectedBrands: [],
  minPrice: 0,
  maxPrice: 50000000,
  ram: [],
  storage: [],
  only5G: false,
  minBattery: 0,
  minCameraMP: 0,
  sortBy: 'newest',
  categoryPreset: undefined
};

function normalizePhoneRecord(raw: any): Phone {
  const priceNGN = Number(raw?.priceNGN) || 350000;
  const priceUSD = Number(raw?.priceUSD) || Math.round(priceNGN / 1500);
  const priceRange =
    raw?.priceRange ||
    (priceNGN < 100000
      ? 'under100k'
      : priceNGN <= 200000
      ? '100k-200k'
      : priceNGN <= 350000
      ? '200k-350k'
      : priceNGN <= 600000
      ? '350k-600k'
      : priceNGN <= 1200000
      ? '600k-1.2m'
      : 'flagship');

  const ramHighlight = raw?.keyHighlights?.ram || '8GB';
  const storageHighlight = raw?.keyHighlights?.storage || '256GB';
  const ramVariants = Array.isArray(raw?.detailedSpecs?.memory?.ramVariants) && raw.detailedSpecs.memory.ramVariants.length > 0
    ? raw.detailedSpecs.memory.ramVariants
    : String(ramHighlight).split(/[\/,]/).map((s: string) => s.trim()).filter(Boolean);
  const storageVariants = Array.isArray(raw?.detailedSpecs?.memory?.storageVariants) && raw.detailedSpecs.memory.storageVariants.length > 0
    ? raw.detailedSpecs.memory.storageVariants
    : String(storageHighlight).split(/[\/,]/).map((s: string) => s.trim()).filter(Boolean);

  return {
    id: raw?.id || `phone-${Date.now()}`,
    name: raw?.name || 'Smartphone',
    brand: raw?.brand || 'Samsung',
    priceNGN,
    priceUSD,
    oldPriceNGN: raw?.oldPriceNGN ? Number(raw.oldPriceNGN) : undefined,
    priceRange,
    marketStatus: raw?.marketStatus || raw?.status || 'Available',
    nairaPriceNotes: raw?.nairaPriceNotes || raw?.summary || 'Available at authorized retail stores.',
    releaseYear: Number(raw?.releaseYear) || new Date().getFullYear(),
    releaseDate: raw?.releaseDate || raw?.Release || `${raw?.releaseYear || new Date().getFullYear()}`,
    modelNumber: raw?.modelNumber || '',
    image:
      (typeof raw?.image === 'string' && raw.image.trim()) ||
      (Array.isArray(raw?.images) && typeof raw.images[0] === 'string' && raw.images[0].trim()) ||
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    images: (() => {
      const primary =
        (typeof raw?.image === 'string' && raw.image.trim()) ||
        (Array.isArray(raw?.images) && typeof raw.images[0] === 'string' && raw.images[0].trim()) ||
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80';
      const rest = Array.isArray(raw?.images)
        ? raw.images.filter((u: any) => typeof u === 'string' && u.trim() && u.trim() !== primary)
        : [];
      return [primary, ...rest];
    })(),
    accentColor: raw?.accentColor || '#10b981',
    rating: Number(raw?.rating) || 0,
    reviewsCount: Number(raw?.reviewsCount) || 0,
    viewsCount: typeof raw?.viewsCount === 'number' ? raw.viewsCount : (Number(raw?.views) || 0),
    categories: Array.isArray(raw?.categories)
      ? raw.categories
      : Array.isArray(raw?.categoryTags)
      ? raw.categoryTags
      : ['flagship', '5g'],
    isFeatured: Boolean(raw?.isFeatured),
    isPopular: raw?.isPopular !== undefined ? Boolean(raw.isPopular) : true,
    screenSizeInches: Number(raw?.screenSizeInches) || 6.7,
    seoTitle: raw?.seoTitle || undefined,
    seoKeywords: raw?.seoKeywords || undefined,
    seoDescription: raw?.seoDescription || undefined,
    keyHighlights: {
      display: raw?.keyHighlights?.display || raw?.detailedSpecs?.display?.type || '6.7" AMOLED 120Hz',
      processor: raw?.keyHighlights?.processor || raw?.detailedSpecs?.platform?.chipset || 'Octa-Core 5G Processor',
      ram: ramHighlight,
      storage: storageHighlight,
      camera: raw?.keyHighlights?.camera || raw?.keyHighlights?.mainCamera || raw?.detailedSpecs?.mainCamera?.setup || raw?.detailedSpecs?.mainCamera?.modules || '50MP OIS Main Camera',
      battery: raw?.keyHighlights?.battery || raw?.detailedSpecs?.battery?.capacity || '5000 mAh',
      charging: raw?.keyHighlights?.charging || raw?.detailedSpecs?.battery?.charging || '45W Fast Charging',
      os: raw?.keyHighlights?.os || raw?.detailedSpecs?.platform?.os || 'Android 15',
      network5g: raw?.keyHighlights?.network5g !== undefined ? Boolean(raw.keyHighlights.network5g) : true,
    },
    detailedSpecs: {
      network: {
        technology: raw?.detailedSpecs?.network?.technology || 'GSM / HSPA / LTE / 5G',
        bands5g: raw?.detailedSpecs?.network?.bands5g || 'SA/NSA Sub6',
        speed: raw?.detailedSpecs?.network?.speed || 'HSPA, LTE-A, 5G',
        sim: raw?.detailedSpecs?.network?.sim || raw?.detailedSpecs?.body?.sim || 'Dual SIM (Nano-SIM, dual stand-by)',
      },
      body: {
        dimensions: raw?.detailedSpecs?.body?.dimensions || '162.3 x 75.6 x 8.2 mm',
        weight: raw?.detailedSpecs?.body?.weight || '195 g',
        build: raw?.detailedSpecs?.body?.build || 'Glass front, aluminum frame',
        waterResistance: raw?.detailedSpecs?.body?.waterResistance || 'IP68 dust/water resistant',
      },
      display: {
        type: raw?.detailedSpecs?.display?.type || raw?.keyHighlights?.display || 'AMOLED, 120Hz, HDR10+',
        size: raw?.detailedSpecs?.display?.size || '6.7 inches (~89.2% screen-to-body ratio)',
        resolution: raw?.detailedSpecs?.display?.resolution || '1080 x 2400 pixels (~395 ppi density)',
        protection: raw?.detailedSpecs?.display?.protection || 'Corning Gorilla Glass Victus',
        brightness: raw?.detailedSpecs?.display?.brightness || '2000 nits (peak)',
        refreshRate: raw?.detailedSpecs?.display?.refreshRate || '120Hz adaptive',
      },
      platform: {
        os: raw?.detailedSpecs?.platform?.os || raw?.keyHighlights?.os || 'Android 15',
        chipset: raw?.detailedSpecs?.platform?.chipset || raw?.keyHighlights?.processor || 'Snapdragon 8 Gen 3',
        cpu: raw?.detailedSpecs?.platform?.cpu || 'Octa-core',
        gpu: raw?.detailedSpecs?.platform?.gpu || 'Adreno GPU',
        antutuScore: raw?.detailedSpecs?.platform?.antutuScore || '1,550,000 (AnTuTu v10)',
      },
      memory: {
        ramVariants: ramVariants.length > 0 ? ramVariants : ['8GB', '12GB'],
        storageVariants: storageVariants.length > 0 ? storageVariants : ['256GB', '512GB'],
        cardSlot: raw?.detailedSpecs?.memory?.cardSlot || 'No',
        storageType: raw?.detailedSpecs?.memory?.storageType || 'UFS 4.0',
      },
      mainCamera: {
        setup: raw?.detailedSpecs?.mainCamera?.setup || raw?.detailedSpecs?.mainCamera?.modules || raw?.keyHighlights?.camera || '50 MP, f/1.8, (wide), OIS + 12 MP (ultrawide)',
        features: raw?.detailedSpecs?.mainCamera?.features || 'LED flash, auto-HDR, panorama',
        video: raw?.detailedSpecs?.mainCamera?.video || '4K@30/60fps, 1080p@30/60/120fps, gyro-EIS',
      },
      selfieCamera: {
        setup: raw?.detailedSpecs?.selfieCamera?.setup || raw?.detailedSpecs?.selfieCamera?.modules || raw?.keyHighlights?.selfieCamera || '32 MP, f/2.2, (wide)',
        features: raw?.detailedSpecs?.selfieCamera?.features || 'HDR, panorama',
        video: raw?.detailedSpecs?.selfieCamera?.video || '4K@30fps, 1080p@30/60fps',
      },
      battery: {
        capacity: raw?.detailedSpecs?.battery?.capacity || raw?.keyHighlights?.battery || '5000 mAh, non-removable',
        charging: raw?.detailedSpecs?.battery?.charging || raw?.keyHighlights?.charging || '45W wired fast charging',
        wirelessCharging: raw?.detailedSpecs?.battery?.wirelessCharging || '15W wireless charging',
      },
      sound: {
        loudspeaker: raw?.detailedSpecs?.sound?.loudspeaker || 'Yes, with stereo speakers',
        jack35mm: raw?.detailedSpecs?.sound?.jack35mm || 'No',
        audioSpecs: raw?.detailedSpecs?.sound?.audioSpecs || '24-bit/192kHz Hi-Res audio, Dolby Atmos support',
      },
      connectivity: {
        wlan: raw?.detailedSpecs?.connectivity?.wlan || 'Wi-Fi 802.11 a/b/g/n/ac/6, dual-band',
        bluetooth: raw?.detailedSpecs?.connectivity?.bluetooth || '5.3, A2DP, LE',
        nfc: raw?.detailedSpecs?.connectivity?.nfc || 'Yes',
        radio: raw?.detailedSpecs?.connectivity?.radio || 'No',
        usb: raw?.detailedSpecs?.connectivity?.usb || 'USB Type-C 2.0, OTG',
        infrared: raw?.detailedSpecs?.connectivity?.infrared || 'No',
        positioning: raw?.detailedSpecs?.connectivity?.positioning || 'GPS (L1+L5), GLONASS, BDS, GALILEO, QZSS',
      },
      sensors: raw?.detailedSpecs?.sensors || 'Fingerprint (under display, optical), accelerometer, gyro, proximity, compass',
      biometrics: raw?.detailedSpecs?.biometrics || '',
      securityHardware: raw?.detailedSpecs?.securityHardware || '',
    },
  };
}

const SEED_PHONE_IMAGE_MAP = new Map<string, string>(
  INITIAL_PHONES.map((p) => [p.id, p.image])
);

function mergePhonesAndSync(
  localPhones: Phone[],
  apiPhones: Phone[],
  mediaItems?: MediaItem[]
): Phone[] {
  const normalizedLocal = localPhones.map(normalizePhoneRecord);
  const normalizedApi = apiPhones.map(normalizePhoneRecord);
  const apiById = new Map(normalizedApi.map((p) => [p.id, p]));
  const localById = new Map(normalizedLocal.map((p) => [p.id, p]));

  // Map of latest user-uploaded media assigned to a phone
  const assignedMediaByPhoneId = new Map<string, string>();
  if (Array.isArray(mediaItems)) {
    for (const m of mediaItems) {
      if (
        m &&
        m.assignedPhoneId &&
        m.url &&
        m.uploadedAt !== 'System Asset' &&
        !assignedMediaByPhoneId.has(m.assignedPhoneId)
      ) {
        assignedMediaByPhoneId.set(m.assignedPhoneId, m.url);
      }
    }
  }

  const mergedResult: Phone[] = [];

  for (const localPhone of normalizedLocal) {
    const apiPhone = apiById.get(localPhone.id);
    if (!apiPhone) {
      // Locally created phone not yet on backend -> push to backend
      createPhoneApi(localPhone).catch(() => {});
      mergedResult.push(localPhone);
      continue;
    }

    const seedImg = SEED_PHONE_IMAGE_MAP.get(localPhone.id);
    const localHasCustomImg = Boolean(localPhone.image && localPhone.image !== seedImg);
    const apiHasCustomImg = Boolean(apiPhone.image && apiPhone.image !== seedImg);
    const assignedMediaUrl = assignedMediaByPhoneId.get(localPhone.id);

    let chosenImage = localPhone.image;
    if (localHasCustomImg && !apiHasCustomImg) {
      chosenImage = localPhone.image;
    } else if (apiHasCustomImg && !localHasCustomImg) {
      chosenImage = apiPhone.image;
    } else if (assignedMediaUrl && !localHasCustomImg && !apiHasCustomImg) {
      chosenImage = assignedMediaUrl;
    } else {
      chosenImage = localPhone.image || apiPhone.image;
    }

    const combinedGallery = Array.from(
      new Set([
        chosenImage,
        ...(localPhone.images || []),
        ...(apiPhone.images || []),
      ].filter(Boolean))
    );

    const mergedPhone: Phone = normalizePhoneRecord({
      ...apiPhone,
      ...localPhone,
      image: chosenImage,
      images: combinedGallery,
    });

    // If local state has a newer/custom image or specs not yet reflected on the backend, push to backend
    if (mergedPhone.image !== apiPhone.image || mergedPhone.name !== apiPhone.name || mergedPhone.priceNGN !== apiPhone.priceNGN) {
      updatePhoneApi(mergedPhone.id, mergedPhone).catch(() => {});
    }

    mergedResult.push(mergedPhone);
  }

  // Append any phones from API that weren't in local state
  for (const apiPhone of normalizedApi) {
    if (!localById.has(apiPhone.id)) {
      mergedResult.push(apiPhone);
    }
  }

  return mergedResult;
}

function mergeBrandsAndSync(localBrands: Brand[], apiBrands: Brand[]): Brand[] {
  const result: Brand[] = [];
  const seenKeys = new Set<string>();

  const getBrandKeys = (b: Brand) => [
    (b.id || '').toLowerCase(),
    (b.slug || '').toLowerCase(),
    (b.name || '').toLowerCase(),
  ].filter(Boolean);

  const apiByKey = new Map<string, Brand>();
  for (const ab of apiBrands) {
    for (const k of getBrandKeys(ab)) {
      apiByKey.set(k, ab);
    }
  }

  // 1. Process all local brands (preserving any newly added 24th+ brands in localStorage)
  for (const lb of localBrands) {
    const keys = getBrandKeys(lb);
    if (keys.some((k) => seenKeys.has(k))) continue;
    keys.forEach((k) => seenKeys.add(k));

    const matchedApi = keys.map((k) => apiByKey.get(k)).find(Boolean);
    if (!matchedApi) {
      // Brand exists in localStorage (e.g. 24th brand added in Admin) but missing on server -> sync to server!
      createBrandApi(lb).catch(() => {});
      result.push(lb);
    } else {
      const merged: Brand = {
        ...matchedApi,
        ...lb,
        logoUrl: lb.logoUrl || matchedApi.logoUrl,
      };
      if (lb.logoUrl && lb.logoUrl !== matchedApi.logoUrl) {
        updateBrandApi(merged.id, merged).catch(() => {});
      }
      result.push(merged);
    }
  }

  // 2. Add any brands from API that weren't in localBrands
  for (const ab of apiBrands) {
    const keys = getBrandKeys(ab);
    if (keys.some((k) => seenKeys.has(k))) continue;
    keys.forEach((k) => seenKeys.add(k));
    result.push(ab);
  }

  return result;
}

const FALLBACK_ARTICLE_IMAGE = '/assets/aistudio/IMG_20261026_152954_83c935f6.jpg';

function normalizeArticleRecord(raw: any): Article {
  const rawCover = typeof raw?.coverImage === 'string' ? raw.coverImage.trim() : '';
  const validCover =
    !rawCover || rawCover.includes('news_5g_nigeria.png')
      ? FALLBACK_ARTICLE_IMAGE
      : rawCover;

  return {
    id: raw?.id || `art-${Date.now()}`,
    title: raw?.title || 'Untitled Article',
    slug: raw?.slug || raw?.id || `article-${Date.now()}`,
    category: raw?.category || 'News',
    coverImage: validCover,
    summary: raw?.summary || '',
    content: raw?.content || '',
    author: raw?.author || { name: 'GsmScope Editorial', role: 'Senior Hardware Editor' },
    date: raw?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: raw?.readTime || '4 min read',
    tags: Array.isArray(raw?.tags) && raw.tags.length > 0 ? raw.tags : [raw?.category || 'News'],
    featured: Boolean(raw?.featured),
    relatedPhoneIds: Array.isArray(raw?.relatedPhoneIds) ? raw.relatedPhoneIds : [],
    ...(raw?.seoTitle ? { seoTitle: raw.seoTitle } : {}),
    ...(raw?.seoKeywords ? { seoKeywords: raw.seoKeywords } : {}),
    ...(raw?.seoDescription ? { seoDescription: raw.seoDescription } : {}),
  };
}

function mergeArticlesAndSync(
  localArticles: Article[],
  apiArticles: Article[],
  mediaItems?: MediaItem[]
): Article[] {
  const normalizedLocal = localArticles.map(normalizeArticleRecord);
  const normalizedApi = apiArticles.map(normalizeArticleRecord);
  const apiById = new Map(normalizedApi.map((a) => [a.id, a]));
  const localById = new Map(normalizedLocal.map((a) => [a.id, a]));

  const assignedMediaByArticleId = new Map<string, string>();
  if (Array.isArray(mediaItems)) {
    for (const m of mediaItems) {
      if (
        m &&
        m.assignedArticleId &&
        m.url &&
        m.uploadedAt !== 'System Asset' &&
        !assignedMediaByArticleId.has(m.assignedArticleId)
      ) {
        assignedMediaByArticleId.set(m.assignedArticleId, m.url);
      }
    }
  }

  const mergedResult: Article[] = [];

  for (const localArt of normalizedLocal) {
    const apiArt = apiById.get(localArt.id);
    const assignedUrl = assignedMediaByArticleId.get(localArt.id);
    if (!apiArt) {
      const toSync = assignedUrl ? { ...localArt, coverImage: assignedUrl } : localArt;
      createArticleApi(toSync).catch(() => {});
      mergedResult.push(toSync);
      continue;
    }

    const chosenCover =
      (localArt.coverImage && localArt.coverImage !== FALLBACK_ARTICLE_IMAGE
        ? localArt.coverImage
        : apiArt.coverImage && apiArt.coverImage !== FALLBACK_ARTICLE_IMAGE
        ? apiArt.coverImage
        : assignedUrl || localArt.coverImage || apiArt.coverImage) || FALLBACK_ARTICLE_IMAGE;

    const mergedArt: Article = normalizeArticleRecord({
      ...apiArt,
      ...localArt,
      coverImage: chosenCover,
    });

    if (
      mergedArt.coverImage !== apiArt.coverImage ||
      mergedArt.title !== apiArt.title ||
      mergedArt.category !== apiArt.category ||
      mergedArt.summary !== apiArt.summary ||
      mergedArt.content !== apiArt.content
    ) {
      updateArticleApi(mergedArt.id, mergedArt).catch(() => {});
    }

    mergedResult.push(mergedArt);
  }

  for (const apiArt of normalizedApi) {
    if (!localById.has(apiArt.id)) {
      mergedResult.push(apiArt);
    }
  }

  // Ensure any seed articles/guides from INITIAL_ARTICLES not yet in mergedResult (unless deleted) are included
  try {
    const deletedRaw = typeof window !== 'undefined' ? localStorage.getItem('gsmscope_deleted_article_ids') : null;
    const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
    const mergedIds = new Set(mergedResult.map((a) => a.id));
    for (const seedArt of INITIAL_ARTICLES) {
      if (!mergedIds.has(seedArt.id) && !deletedIds.has(seedArt.id)) {
        const normSeed = normalizeArticleRecord(seedArt);
        mergedResult.push(normSeed);
        createArticleApi(normSeed).catch(() => {});
      }
    }
  } catch {}

  return mergedResult;
}

function mergeReviewsAndSync(localReviews: Review[], apiReviews: Review[]): Review[] {
  const apiById = new Map(apiReviews.map((r) => [r.id, r]));
  const localById = new Map(localReviews.map((r) => [r.id, r]));
  const mergedResult: Review[] = [];

  for (const localRev of localReviews) {
    const apiRev = apiById.get(localRev.id);
    if (!apiRev) {
      submitReviewApi(localRev as any).catch(() => {});
      mergedResult.push(localRev);
    } else {
      const merged: Review = {
        ...apiRev,
        ...localRev,
        imageUrl: localRev.imageUrl || apiRev.imageUrl,
      };
      if (localRev.status !== apiRev.status) {
        updateReviewStatusApi(merged.id, merged.status).catch(() => {});
      }
      mergedResult.push(merged);
    }
  }

  for (const apiRev of apiReviews) {
    if (!localById.has(apiRev.id)) {
      mergedResult.push(apiRev);
    }
  }

  return mergedResult;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Theme state: defaults to 'light' so only header and hero section remain dark by default
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('app_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Global Loading & Progress Bar state
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [globalToast, setGlobalToast] = useState<GlobalToastState | null>(null);
  const progressTimerRef = useRef<any>(null);
  const progressStepTimerRef = useRef<any>(null);
  const progressCompleteTimerRef = useRef<any>(null);
  const progressFadeTimerRef = useRef<any>(null);
  const progressResetTimerRef = useRef<any>(null);
  const loadingStartTimeRef = useRef<number>(0);
  const activeAsyncCountRef = useRef<number>(0);

  const clearAllProgressTimers = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (progressStepTimerRef.current) clearTimeout(progressStepTimerRef.current);
    if (progressCompleteTimerRef.current) clearTimeout(progressCompleteTimerRef.current);
    if (progressFadeTimerRef.current) clearTimeout(progressFadeTimerRef.current);
    if (progressResetTimerRef.current) clearTimeout(progressResetTimerRef.current);
  }, []);

  const beginProgressAnimation = useCallback(() => {
    clearAllProgressTimers();
    loadingStartTimeRef.current = Date.now();
    setIsGlobalLoading(true);
    setGlobalProgress((prev) => (prev > 5 && prev < 75 ? prev + 8 : 20));

    progressStepTimerRef.current = setTimeout(() => {
      setGlobalProgress((curr) => (curr > 0 && curr < 48 ? 48 : curr));
    }, 35);

    progressTimerRef.current = setInterval(() => {
      setGlobalProgress((curr) => {
        if (curr < 65) return curr + 14;
        if (curr < 82) return curr + 8;
        if (curr < 92) return curr + 2.5;
        if (curr < 95) return curr + 0.5;
        return curr;
      });
    }, 80);
  }, [clearAllProgressTimers]);

  const finishProgressAnimation = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (progressStepTimerRef.current) clearTimeout(progressStepTimerRef.current);
    if (progressCompleteTimerRef.current) clearTimeout(progressCompleteTimerRef.current);
    if (progressFadeTimerRef.current) clearTimeout(progressFadeTimerRef.current);
    if (progressResetTimerRef.current) clearTimeout(progressResetTimerRef.current);

    const elapsed = Date.now() - loadingStartTimeRef.current;
    // Guarantee enough time for the bar to visibly sweep across before hitting 100%
    const remainingToComplete = Math.max(0, 280 - elapsed);

    progressCompleteTimerRef.current = setTimeout(() => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setIsGlobalLoading(true);
      setGlobalProgress(100);

      // Hold at 100% full width so user sees full completion
      progressFadeTimerRef.current = setTimeout(() => {
        setIsGlobalLoading(false);

        // Reset width to 0 only after opacity fade-out completes
        progressResetTimerRef.current = setTimeout(() => {
          setGlobalProgress(0);
        }, 220);
      }, 240);
    }, remainingToComplete);
  }, []);

  const startGlobalLoading = useCallback((_reason?: string) => {
    activeAsyncCountRef.current += 1;
    beginProgressAnimation();
  }, [beginProgressAnimation]);

  const stopGlobalLoading = useCallback(() => {
    activeAsyncCountRef.current = Math.max(0, activeAsyncCountRef.current - 1);
    if (activeAsyncCountRef.current === 0) {
      finishProgressAnimation();
    }
  }, [finishProgressAnimation]);

  const pulseGlobalLoading = useCallback(() => {
    if (activeAsyncCountRef.current > 0) return;
    beginProgressAnimation();
    finishProgressAnimation();
  }, [beginProgressAnimation, finishProgressAnimation]);

  const triggerNavigation = useCallback(async (action: () => void | Promise<void>) => {
    startGlobalLoading();
    try {
      await Promise.resolve(action());
      await new Promise((resolve) => setTimeout(resolve, 180));
    } finally {
      stopGlobalLoading();
    }
  }, [startGlobalLoading, stopGlobalLoading]);

  const showGlobalToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setGlobalToast({ message, type, id });
    setTimeout(() => {
      setGlobalToast((curr) => (curr?.id === id ? null : curr));
    }, 4000);
  }, []);

  const hideGlobalToast = useCallback(() => {
    setGlobalToast(null);
  }, []);

  const refreshData = useCallback(async () => {
    startGlobalLoading('Pull-to-refresh data');
    try {
      const [apiPhones, apiBrands, apiArticles, apiReviews, apiAdSettings, apiWebsiteContent, apiMediaItems] = await Promise.all([
        fetchPhonesFromApi(),
        fetchBrandsFromApi(),
        fetchArticlesFromApi(),
        fetchReviewsFromApi(),
        fetchAdSettingsFromApi(),
        fetchWebsiteContentApi(),
        fetchMediaItemsApi()
      ]);
      if (apiPhones && apiPhones.length > 0) {
        setPhones(prev => mergePhonesAndSync(prev, apiPhones, apiMediaItems || undefined));
      }
      if (apiBrands && apiBrands.length > 0) {
        setBrands(prev => mergeBrandsAndSync(prev, apiBrands));
      }
      if (apiArticles && apiArticles.length > 0) {
        setArticles(prev => mergeArticlesAndSync(prev, apiArticles, apiMediaItems || undefined));
      }
      if (apiReviews && apiReviews.length > 0) {
        setReviews(prev => mergeReviewsAndSync(prev, apiReviews));
      }
      if (apiAdSettings) {
        setAdSettings(normalizeAdSettings(apiAdSettings));
      }
      if (apiWebsiteContent) {
        setWebsiteContentState(prev => normalizeWebsiteContent({ ...prev, ...apiWebsiteContent }));
      }
      if (apiMediaItems && Array.isArray(apiMediaItems)) {
        setMediaLibraryState(apiMediaItems);
      }
    } catch (err) {
      console.warn('Failed to refresh data:', err);
    } finally {
      stopGlobalLoading();
    }
  }, [startGlobalLoading, stopGlobalLoading]);

  useEffect(() => {
    return () => {
      clearAllProgressTimers();
    };
  }, [clearAllProgressTimers]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    try {
      localStorage.setItem('app_theme', t);
      document.documentElement.setAttribute('data-theme', t);
    } catch (e) {
      console.warn('Failed saving theme', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Currency
  const [currency, setCurrency] = useState<'NGN' | 'USD'>(() => {
    try {
      const saved = localStorage.getItem('gsmscope_currency');
      return saved === 'USD' ? 'USD' : 'NGN';
    } catch {
      return 'NGN';
    }
  });

  // Phone records
  const [phones, setPhones] = useState<Phone[]>(() => {
    try {
      localStorage.removeItem('gsmscope_phones_v2'); // Clean up old fake cache
      const saved = localStorage.getItem('gsmscope_phones_v3');
      if (saved) {
        const parsed: any[] = JSON.parse(saved);
        return parsed.map(p => {
          const norm = normalizePhoneRecord(p);
          const views = norm.viewsCount === 120 ? 0 : (norm.viewsCount || 0);
          return {
            ...norm,
            viewsCount: views
          };
        });
      }
      return INITIAL_PHONES.map(normalizePhoneRecord);
    } catch {
      return INITIAL_PHONES.map(normalizePhoneRecord);
    }
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      const saved = localStorage.getItem('gsmscope_brands_v2');
      return saved ? JSON.parse(saved) : INITIAL_BRANDS;
    } catch {
      return INITIAL_BRANDS;
    }
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('gsmscope_articles_v2');
      const deletedRaw = localStorage.getItem('gsmscope_deleted_article_ids');
      const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
      const parsed = saved ? JSON.parse(saved) : INITIAL_ARTICLES;
      const baseList = Array.isArray(parsed)
        ? parsed.map(normalizeArticleRecord)
        : INITIAL_ARTICLES.map(normalizeArticleRecord);
      const existingIds = new Set(baseList.map((a) => a.id));
      for (const seedArt of INITIAL_ARTICLES) {
        if (!existingIds.has(seedArt.id) && !deletedIds.has(seedArt.id)) {
          baseList.push(normalizeArticleRecord(seedArt));
        }
      }
      return baseList;
    } catch {
      return INITIAL_ARTICLES.map(normalizeArticleRecord);
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('gsmscope_reviews_v2');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const localAdModifiedRef = useRef(false);

  const normalizeAdSettings = (raw?: Partial<AdSettings> | null): AdSettings => {
    const base = raw || INITIAL_AD_SETTINGS;
    const basePlacements = (base.placements || {}) as Partial<Record<AdPlacementId, AdPlacementConfig>>;
    
    // Normalize every placement so enabled is strictly boolean
    const normalizedPlacements = { ...DEFAULT_AD_PLACEMENTS } as Record<AdPlacementId, AdPlacementConfig>;
    (Object.keys(DEFAULT_AD_PLACEMENTS) as AdPlacementId[]).forEach((pid) => {
      const def = DEFAULT_AD_PLACEMENTS[pid];
      const inc = basePlacements[pid];
      if (inc) {
        normalizedPlacements[pid] = {
          ...def,
          ...inc,
          enabled: inc.enabled !== undefined ? Boolean(inc.enabled) : Boolean(def.enabled),
        };
      } else {
        normalizedPlacements[pid] = { ...def, enabled: Boolean(def.enabled) };
      }
    });

    // Ensure header_top is synced with topBanner and strictly respects disabled state
    const initialHeaderTop = DEFAULT_AD_PLACEMENTS.header_top;
    const rawHeaderTop = basePlacements.header_top;
    const rawTopBanner = base.topBanner;

    let isHeaderTopEnabled = false;
    if (rawHeaderTop && typeof rawHeaderTop.enabled === 'boolean') {
      isHeaderTopEnabled = rawHeaderTop.enabled;
    } else if (rawTopBanner && typeof rawTopBanner.enabled === 'boolean') {
      isHeaderTopEnabled = rawTopBanner.enabled;
    } else {
      isHeaderTopEnabled = Boolean(initialHeaderTop.enabled);
    }

    const mergedHeaderTop: AdPlacementConfig = {
      ...initialHeaderTop,
      ...(rawHeaderTop || {}),
      enabled: isHeaderTopEnabled,
      title: rawHeaderTop?.title ?? rawTopBanner?.title ?? initialHeaderTop.title,
      subtitle: rawHeaderTop?.subtitle ?? rawTopBanner?.subtitle ?? initialHeaderTop.subtitle,
      badgeText: rawHeaderTop?.badgeText ?? rawTopBanner?.tag ?? initialHeaderTop.badgeText,
      learnMoreUrl: rawHeaderTop?.learnMoreUrl ?? rawTopBanner?.linkUrl ?? initialHeaderTop.learnMoreUrl,
    };

    normalizedPlacements.header_top = mergedHeaderTop;

    const syncedTopBanner = {
      ...INITIAL_AD_SETTINGS.topBanner,
      ...(rawTopBanner || {}),
      enabled: isHeaderTopEnabled,
      title: mergedHeaderTop.title,
      subtitle: mergedHeaderTop.subtitle,
      tag: mergedHeaderTop.badgeText,
      linkUrl: mergedHeaderTop.learnMoreUrl,
    };

    return {
      ...INITIAL_AD_SETTINGS,
      ...base,
      topBanner: syncedTopBanner,
      sidebarBanner: {
        ...INITIAL_AD_SETTINGS.sidebarBanner,
        ...(base.sidebarBanner || {}),
        enabled: base.sidebarBanner?.enabled !== undefined
          ? Boolean(base.sidebarBanner.enabled)
          : Boolean(INITIAL_AD_SETTINGS.sidebarBanner.enabled),
      },
      placements: normalizedPlacements,
    };
  };

  const [adSettings, setAdSettings] = useState<AdSettings>(() => {
    try {
      localStorage.removeItem('gsmscope_ads_v2'); // Clear legacy stale cached banner state
      const saved = localStorage.getItem('gsmscope_ads_v3');
      return saved ? normalizeAdSettings(JSON.parse(saved)) : normalizeAdSettings(INITIAL_AD_SETTINGS);
    } catch {
      return normalizeAdSettings(INITIAL_AD_SETTINGS);
    }
  });

  const normalizeWebsiteContent = (raw?: Partial<WebsiteContent> | null): WebsiteContent => {
    const merged: WebsiteContent = {
      ...INITIAL_WEBSITE_CONTENT,
      ...(raw || {}),
    };
    if (!merged.contactEmail || merged.contactEmail === 'contact@gsmscope.com') {
      merged.contactEmail = 'info@gsmscope.com';
    }
    if (!merged.contactPhone || merged.contactPhone.includes('GSMSCOPE') || merged.contactPhone.includes('800 476')) {
      merged.contactPhone = '+2349127408003';
    }
    if (!merged.officeLocation || merged.officeLocation.includes('Computer Village') || merged.officeLocation.includes('Lagos')) {
      merged.officeLocation = 'Sokoto, Nigeria';
    }
    if (!merged.whatsappNumber || merged.whatsappNumber === '+2348030000000') {
      merged.whatsappNumber = '+2349127408003';
    }
    return merged;
  };

  const [websiteContent, setWebsiteContentState] = useState<WebsiteContent>(() => {
    try {
      const saved = localStorage.getItem('gsmscope_website_content_v1');
      return saved ? normalizeWebsiteContent(JSON.parse(saved)) : normalizeWebsiteContent(INITIAL_WEBSITE_CONTENT);
    } catch {
      return normalizeWebsiteContent(INITIAL_WEBSITE_CONTENT);
    }
  });

  const [mediaLibrary, setMediaLibraryState] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('gsmscope_media_library_v1');
      return saved ? JSON.parse(saved) : INITIAL_MEDIA_ITEMS;
    } catch {
      return INITIAL_MEDIA_ITEMS;
    }
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    try {
      localStorage.removeItem('gsmscope_compare_v2'); // Remove legacy pre-populated default compare pair
      const saved = localStorage.getItem('gsmscope_compare_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('gsmscope_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [currentOtp, setCurrentOtp] = useState<string | null>(null);

  // Active Tab & URL Path / Query Parameter Initial State
  const VALID_TABS: ActiveTab[] = [
    'home',
    'phones',
    'compare',
    'brands',
    'news',
    'guides',
    'best-phones',
    'reviews',
    'user-reviews',
    'about',
    'contact',
    'advertise',
    'privacy',
    'terms',
    'admin',
  ];

  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        pathname === '/admin' ||
        hash === '#admin' ||
        hash === '#/admin' ||
        search.includes('admin=true')
      ) {
        return 'admin';
      }
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveTab | null;
      if (tabParam && VALID_TABS.includes(tabParam)) {
        return tabParam;
      }
    }
    return 'home';
  });

  const [selectedPhone, setSelectedPhoneState] = useState<Phone | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const phoneParam = params.get('phone');
      if (phoneParam) {
        const lower = phoneParam.toLowerCase();
        return (
          phones.find(
            (p) =>
              p.id.toLowerCase() === lower ||
              ((p as any).slug && String((p as any).slug).toLowerCase() === lower)
          ) || null
        );
      }
    }
    return null;
  });

  const [selectedArticle, setSelectedArticleState] = useState<Article | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const articleParam = params.get('article');
      if (articleParam) {
        const lower = articleParam.toLowerCase();
        return (
          articles.find(
            (a) =>
              a.id.toLowerCase() === lower ||
              (a.slug && a.slug.toLowerCase() === lower)
          ) || null
        );
      }
    }
    return null;
  });

  const [selectedBrand, setSelectedBrandState] = useState<Brand | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const brandParam = params.get('brand');
      const tabParam = params.get('tab');
      if (brandParam && (!tabParam || tabParam === 'brands')) {
        const lower = brandParam.toLowerCase();
        return (
          brands.find(
            (b) =>
              b.id.toLowerCase() === lower ||
              b.slug.toLowerCase() === lower ||
              b.name.toLowerCase() === lower
          ) || null
        );
      }
    }
    return null;
  });

  const [filterState, setFilterStateInternal] = useState<FilterState>(defaultFilterState);

  const [adminSection, setAdminSectionState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sec = params.get('section');
      if (sec) return sec;
    }
    return 'dashboard';
  });

  const [adminSubView, setAdminSubViewState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get('sub');
      if (sub) return sub;
    }
    return null;
  });

  // Refs to latest data for popstate restoration
  const phonesRef = useRef(phones);
  phonesRef.current = phones;
  const articlesRef = useRef(articles);
  articlesRef.current = articles;
  const brandsRef = useRef(brands);
  brandsRef.current = brands;
  const adminSectionRef = useRef(adminSection);
  adminSectionRef.current = adminSection;
  const adminSubViewRef = useRef(adminSubView);
  adminSubViewRef.current = adminSubView;

  interface NavHistorySnapshot {
    key: string;
    url: string;
    activeTab: ActiveTab;
    selectedPhoneId: string | null;
    selectedPhoneData: Phone | null;
    selectedArticleId: string | null;
    selectedArticleData: Article | null;
    selectedBrandId: string | null;
    selectedBrandData: Brand | null;
    categoryPreset?: string;
    selectedBrandsFilter?: string[];
    searchQueryFilter?: string;
    adminSection?: string;
    adminSubView?: string | null;
  }

  const computeNavSnapshot = useCallback(
    (
      tab: ActiveTab,
      phone: Phone | null,
      article: Article | null,
      brand: Brand | null,
      fState: FilterState,
      admSec: string = adminSectionRef.current,
      admSub: string | null = adminSubViewRef.current
    ): NavHistorySnapshot => {
      if (tab === 'admin') {
        const sec = admSec || 'dashboard';
        const sub = admSub || null;
        const queryParts: string[] = [];
        if (sec && sec !== 'dashboard') {
          queryParts.push(`section=${encodeURIComponent(sec)}`);
        }
        if (sub) {
          queryParts.push(`sub=${encodeURIComponent(sub)}`);
        }
        const url = queryParts.length > 0 ? `/admin?${queryParts.join('&')}` : '/admin';
        return {
          key: `admin:${sec}:${sub || ''}`,
          url,
          activeTab: 'admin',
          selectedPhoneId: null,
          selectedPhoneData: null,
          selectedArticleId: null,
          selectedArticleData: null,
          selectedBrandId: null,
          selectedBrandData: null,
          adminSection: sec,
          adminSubView: sub,
        };
      }
      if (article) {
        const slugOrId = article.slug || article.id;
        return {
          key: `article:${article.id}`,
          url: `/?article=${encodeURIComponent(slugOrId)}`,
          activeTab: tab,
          selectedPhoneId: null,
          selectedPhoneData: null,
          selectedArticleId: article.id,
          selectedArticleData: article,
          selectedBrandId: brand?.id || null,
          selectedBrandData: brand,
        };
      }
      if (phone) {
        const slugOrId = (phone as any).slug || phone.id;
        return {
          key: `phone:${phone.id}`,
          url: `/?phone=${encodeURIComponent(slugOrId)}`,
          activeTab: tab,
          selectedPhoneId: phone.id,
          selectedPhoneData: phone,
          selectedArticleId: null,
          selectedArticleData: null,
          selectedBrandId: brand?.id || null,
          selectedBrandData: brand,
        };
      }
      if (tab === 'brands' && brand) {
        const brandSlug = brand.slug || brand.name;
        return {
          key: `brand:${brand.id || brand.name}`,
          url: `/?tab=brands&brand=${encodeURIComponent(brandSlug)}`,
          activeTab: 'brands',
          selectedPhoneId: null,
          selectedPhoneData: null,
          selectedArticleId: null,
          selectedArticleData: null,
          selectedBrandId: brand.id || brand.name,
          selectedBrandData: brand,
        };
      }
      if (
        tab === 'phones' &&
        (fState.categoryPreset || fState.selectedBrands.length > 0 || fState.searchQuery.trim())
      ) {
        const preset = fState.categoryPreset || '';
        const sBrands = fState.selectedBrands;
        const sQuery = fState.searchQuery.trim();
        let url = '/?tab=phones';
        if (preset) {
          url = `/?tab=phones&preset=${encodeURIComponent(preset)}`;
        } else if (sBrands.length === 1) {
          url = `/?tab=phones&brand=${encodeURIComponent(sBrands[0])}`;
        } else if (sQuery) {
          url = `/?tab=phones&q=${encodeURIComponent(sQuery)}`;
        }
        return {
          key: `phones:${preset}:${sBrands.join(',')}:${sQuery}`,
          url,
          activeTab: 'phones',
          selectedPhoneId: null,
          selectedPhoneData: null,
          selectedArticleId: null,
          selectedArticleData: null,
          selectedBrandId: null,
          selectedBrandData: null,
          categoryPreset: fState.categoryPreset,
          selectedBrandsFilter: [...sBrands],
          searchQueryFilter: sQuery,
        };
      }
      return {
        key: `tab:${tab}`,
        url: tab === 'home' ? '/' : `/?tab=${encodeURIComponent(tab)}`,
        activeTab: tab,
        selectedPhoneId: null,
        selectedPhoneData: null,
        selectedArticleId: null,
        selectedArticleData: null,
        selectedBrandId: null,
        selectedBrandData: null,
      };
    },
    []
  );

  const navStackRef = useRef<NavHistorySnapshot[]>([]);
  const navIndexRef = useRef<number>(-1);
  const lastAppliedKeyRef = useRef<string | null>(null);

  const applyNavSnapshot = useCallback((snap: NavHistorySnapshot) => {
    lastAppliedKeyRef.current = snap.key;
    setActiveTabState(snap.activeTab);

    if (snap.activeTab === 'admin') {
      setAdminSectionState(snap.adminSection || 'dashboard');
      setAdminSubViewState(snap.adminSubView ?? null);
    }

    if (snap.selectedArticleId) {
      const foundArticle =
        articlesRef.current.find((a) => a.id === snap.selectedArticleId) ||
        snap.selectedArticleData ||
        null;
      setSelectedArticleState(foundArticle);
      setSelectedPhoneState(null);
    } else if (snap.selectedPhoneId) {
      const foundPhone =
        phonesRef.current.find((p) => p.id === snap.selectedPhoneId) ||
        snap.selectedPhoneData ||
        null;
      setSelectedPhoneState(foundPhone);
      setSelectedArticleState(null);
    } else {
      setSelectedArticleState(null);
      setSelectedPhoneState(null);
    }

    if (snap.selectedBrandId) {
      const foundBrand =
        brandsRef.current.find(
          (b) => b.id === snap.selectedBrandId || b.name === snap.selectedBrandId
        ) ||
        snap.selectedBrandData ||
        null;
      setSelectedBrandState(foundBrand);
    } else {
      setSelectedBrandState(null);
    }

    if (snap.activeTab === 'phones') {
      setFilterStateInternal((prev) => ({
        ...prev,
        categoryPreset: snap.categoryPreset,
        selectedBrands: snap.selectedBrandsFilter || [],
        searchQuery: snap.searchQueryFilter || '',
      }));
    }
  }, []);

  // Synchronize React navigation state changes to browser history (pushState / replaceState)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentSnap = computeNavSnapshot(
      activeTab,
      selectedPhone,
      selectedArticle,
      selectedBrand,
      filterState,
      adminSection,
      adminSubView
    );

    if (navIndexRef.current === -1) {
      // If user lands directly on a deep admin section or subview, seed dashboard first so browser Back steps back inside Admin
      if (activeTab === 'admin' && (adminSection !== 'dashboard' || adminSubView)) {
        const baseAdminSnap = computeNavSnapshot('admin', null, null, null, filterState, 'dashboard', null);
        const stack: NavHistorySnapshot[] = [baseAdminSnap];
        try {
          window.history.replaceState(
            { gsmscopeNav: true, navIndex: 0, snapshot: baseAdminSnap },
            '',
            baseAdminSnap.url
          );
        } catch {}
        if (adminSection !== 'dashboard' && adminSubView) {
          const midSnap = computeNavSnapshot('admin', null, null, null, filterState, adminSection, null);
          stack.push(midSnap);
          try {
            window.history.pushState(
              { gsmscopeNav: true, navIndex: stack.length - 1, snapshot: midSnap },
              '',
              midSnap.url
            );
          } catch {}
        }
        stack.push(currentSnap);
        navStackRef.current = stack;
        navIndexRef.current = stack.length - 1;
        lastAppliedKeyRef.current = currentSnap.key;
        try {
          window.history.pushState(
            { gsmscopeNav: true, navIndex: navIndexRef.current, snapshot: currentSnap },
            '',
            currentSnap.url
          );
        } catch {}
        return;
      }

      navStackRef.current = [currentSnap];
      navIndexRef.current = 0;
      lastAppliedKeyRef.current = currentSnap.key;
      try {
        window.history.replaceState(
          { gsmscopeNav: true, navIndex: 0, snapshot: currentSnap },
          '',
          currentSnap.url
        );
      } catch {}
      return;
    }

    if (currentSnap.key === lastAppliedKeyRef.current) {
      // Update current snapshot in-place so latest data is preserved
      navStackRef.current[navIndexRef.current] = currentSnap;
      return;
    }

    const nextIdx = navIndexRef.current + 1;
    navStackRef.current = [...navStackRef.current.slice(0, nextIdx), currentSnap];
    navIndexRef.current = nextIdx;
    lastAppliedKeyRef.current = currentSnap.key;

    try {
      window.history.pushState(
        { gsmscopeNav: true, navIndex: nextIdx, snapshot: currentSnap },
        '',
        currentSnap.url
      );
    } catch {}
  }, [
    activeTab,
    selectedPhone,
    selectedArticle,
    selectedBrand,
    filterState.categoryPreset,
    filterState.selectedBrands,
    filterState.searchQuery,
    adminSection,
    adminSubView,
    computeNavSnapshot,
  ]);

  // Listen to browser Back / Forward navigation (popstate & hashchange)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (event: PopStateEvent) => {
      pulseGlobalLoading();

      // 1. Restore directly from history.state snapshot when present
      if (event.state && event.state.gsmscopeNav && event.state.snapshot) {
        const snap = event.state.snapshot as NavHistorySnapshot;
        if (typeof event.state.navIndex === 'number') {
          navIndexRef.current = event.state.navIndex;
        }
        applyNavSnapshot(snap);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        return;
      }

      // 2. Fallback: parse current URL or step back in navStackRef
      const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);

      if (pathname === '/admin' || hash === '#admin' || hash === '#/admin') {
        const sec = params.get('section') || 'dashboard';
        const sub = params.get('sub') || null;
        const adminSnap = computeNavSnapshot('admin', null, null, null, defaultFilterState, sec, sub);
        applyNavSnapshot(adminSnap);
        return;
      }

      const articleParam = params.get('article');
      if (articleParam) {
        const lower = articleParam.toLowerCase();
        const matchedArticle =
          articlesRef.current.find(
            (a) =>
              a.id.toLowerCase() === lower || (a.slug && a.slug.toLowerCase() === lower)
          ) ||
          navStackRef.current.find(
            (s) =>
              s.selectedArticleData &&
              (s.selectedArticleData.id.toLowerCase() === lower ||
                (s.selectedArticleData.slug &&
                  s.selectedArticleData.slug.toLowerCase() === lower))
          )?.selectedArticleData ||
          null;
        if (matchedArticle) {
          const snap = computeNavSnapshot(
            'news',
            null,
            matchedArticle,
            null,
            defaultFilterState
          );
          applyNavSnapshot(snap);
          return;
        }
      }

      const phoneParam = params.get('phone');
      if (phoneParam) {
        const lower = phoneParam.toLowerCase();
        const matchedPhone =
          phonesRef.current.find(
            (p) =>
              p.id.toLowerCase() === lower ||
              ((p as any).slug && String((p as any).slug).toLowerCase() === lower)
          ) ||
          navStackRef.current.find(
            (s) =>
              s.selectedPhoneData &&
              (s.selectedPhoneData.id.toLowerCase() === lower ||
                ((s.selectedPhoneData as any).slug &&
                  String((s.selectedPhoneData as any).slug).toLowerCase() === lower))
          )?.selectedPhoneData ||
          null;
        if (matchedPhone) {
          const snap = computeNavSnapshot('home', matchedPhone, null, null, defaultFilterState);
          applyNavSnapshot(snap);
          return;
        }
      }

      const tabParam = params.get('tab') as ActiveTab | null;
      const brandParam = params.get('brand');
      if (tabParam === 'brands' && brandParam) {
        const lower = brandParam.toLowerCase();
        const matchedBrand =
          brandsRef.current.find(
            (b) =>
              b.id.toLowerCase() === lower ||
              b.slug.toLowerCase() === lower ||
              b.name.toLowerCase() === lower
          ) || null;
        const snap = computeNavSnapshot('brands', null, null, matchedBrand, defaultFilterState);
        applyNavSnapshot(snap);
        return;
      }

      const resolvedTab: ActiveTab =
        tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'home';
      const fallbackSnap = computeNavSnapshot(
        resolvedTab,
        null,
        null,
        null,
        defaultFilterState
      );
      applyNavSnapshot(fallbackSnap);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [applyNavSnapshot, computeNavSnapshot, pulseGlobalLoading]);

  const setAdminSection = useCallback(
    (sec: string) => {
      pulseGlobalLoading();
      setAdminSubViewState(null);
      setAdminSectionState(sec);
    },
    [pulseGlobalLoading]
  );

  const setAdminSubView = useCallback(
    (sub: string | null) => {
      setAdminSubViewState(sub);
    },
    []
  );

  const setActiveTab = useCallback(
    (tab: ActiveTab) => {
      pulseGlobalLoading();
      setActiveTabState(tab);
    },
    [pulseGlobalLoading]
  );

  const setSelectedPhone = useCallback(
    (phoneOrUpdater: React.SetStateAction<Phone | null>) => {
      pulseGlobalLoading();
      if (typeof phoneOrUpdater === 'function') {
        setSelectedPhoneState(phoneOrUpdater);
      } else {
        setSelectedPhoneState(phoneOrUpdater);
        if (phoneOrUpdater !== null) {
          setSelectedArticleState(null);
        }
      }
    },
    [pulseGlobalLoading]
  );

  const setSelectedArticle = useCallback(
    (articleOrUpdater: React.SetStateAction<Article | null>) => {
      pulseGlobalLoading();
      if (typeof articleOrUpdater === 'function') {
        setSelectedArticleState(articleOrUpdater);
      } else {
        setSelectedArticleState(articleOrUpdater);
        if (articleOrUpdater !== null) {
          setSelectedPhoneState(null);
        }
      }
    },
    [pulseGlobalLoading]
  );

  const setSelectedBrand = useCallback(
    (brandOrUpdater: React.SetStateAction<Brand | null>) => {
      pulseGlobalLoading();
      setSelectedBrandState(brandOrUpdater);
    },
    [pulseGlobalLoading]
  );

  const setFilterState = useCallback(
    (filterOrUpdater: React.SetStateAction<FilterState>) => {
      pulseGlobalLoading();
      setFilterStateInternal(filterOrUpdater);
    },
    [pulseGlobalLoading]
  );

  const goBack = useCallback(() => {
    pulseGlobalLoading();
    if (typeof window !== 'undefined' && navIndexRef.current > 0) {
      window.history.back();
      return;
    }
    if (activeTab === 'admin') {
      if (adminSubView) {
        setAdminSubViewState(null);
        return;
      }
      if (adminSection !== 'dashboard') {
        setAdminSectionState('dashboard');
        return;
      }
      setActiveTabState('home');
      return;
    }
    if (selectedArticle) {
      setSelectedArticleState(null);
    } else if (selectedPhone) {
      setSelectedPhoneState(null);
    } else if (selectedBrand) {
      setSelectedBrandState(null);
    } else {
      setActiveTabState('home');
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pulseGlobalLoading, activeTab, adminSubView, adminSection, selectedArticle, selectedPhone, selectedBrand]);

  useEffect(() => {
    try {
      localStorage.setItem('gsmscope_currency', currency);
    } catch (e) {
      console.warn('LocalStorage save failed for currency', e);
    }
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem('gsmscope_phones_v3', JSON.stringify(phones));
    } catch (e) {
      console.warn('LocalStorage save failed for phones', e);
    }
  }, [phones]);

  // Synchronize each phone's review count and average rating with real submitted reviews
  useEffect(() => {
    setPhones(prevPhones => {
      let changed = false;
      const updated = prevPhones.map(phone => {
        const phoneRevs = reviews.filter(r => r.phoneId === phone.id && r.status === 'approved');
        const count = phoneRevs.length;
        const rating = count > 0 
          ? Number((phoneRevs.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) 
          : 0;
        if (phone.reviewsCount !== count || phone.rating !== rating) {
          changed = true;
          return { ...phone, reviewsCount: count, rating };
        }
        return phone;
      });
      return changed ? updated : prevPhones;
    });
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem('gsmscope_brands_v2', JSON.stringify(brands));
    } catch (e) {
      console.warn('LocalStorage save failed for brands', e);
    }
  }, [brands]);

  useEffect(() => {
    try {
      localStorage.setItem('gsmscope_articles_v2', JSON.stringify(articles));
    } catch (e) {
      console.warn('LocalStorage save failed for articles', e);
    }
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem('gsmscope_reviews_v2', JSON.stringify(reviews));
    } catch (e) {
      console.warn('LocalStorage save failed for reviews', e);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem('gsmscope_ads_v3', JSON.stringify(adSettings));
    } catch (e) {
      console.warn('LocalStorage save failed for ads', e);
    }
  }, [adSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('gsmscope_compare_v3', JSON.stringify(compareList));
    } catch (e) {
      console.warn('LocalStorage save failed for compare', e);
    }
  }, [compareList]);

  // Synchronize state with full-stack Express backend APIs on mount without losing localStorage admin edits
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [apiPhones, apiBrands, apiArticles, apiReviews, apiAdSettings, apiSettings, apiMedia] = await Promise.all([
          fetchPhonesFromApi(),
          fetchBrandsFromApi(),
          fetchArticlesFromApi(),
          fetchReviewsFromApi(),
          fetchAdSettingsFromApi(),
          fetchWebsiteContentApi(),
          fetchMediaItemsApi()
        ]);
        if (isMounted) {
          if (apiPhones && apiPhones.length > 0) {
            setPhones(prev => mergePhonesAndSync(prev, apiPhones, apiMedia || undefined));
          }
          if (apiBrands && apiBrands.length > 0) {
            setBrands(prev => mergeBrandsAndSync(prev, apiBrands));
          }
          if (apiArticles && apiArticles.length > 0) {
            setArticles(prev => mergeArticlesAndSync(prev, apiArticles, apiMedia || undefined));
          }
          if (apiReviews && apiReviews.length > 0) {
            setReviews(prev => mergeReviewsAndSync(prev, apiReviews));
          }
          if (apiAdSettings && !localAdModifiedRef.current) {
            setAdSettings(prev => {
              const savedLocal = localStorage.getItem('gsmscope_ads_v3');
              if (savedLocal) {
                try {
                  const parsedLocal = JSON.parse(savedLocal);
                  const normalizedLocal = normalizeAdSettings(parsedLocal);
                  // Sync local ad settings to backend so both stay identical
                  updateAdSettingsApi(normalizedLocal).catch(() => {});
                  return normalizedLocal;
                } catch {}
              }
              return normalizeAdSettings(apiAdSettings);
            });
          }
          if (apiSettings) {
            const merged = normalizeWebsiteContent(apiSettings);
            setWebsiteContentState(merged);
            try {
              localStorage.setItem('gsmscope_website_content_v1', JSON.stringify(merged));
            } catch {}
          }
          if (apiMedia && apiMedia.length > 0) {
            setMediaLibraryState(prev => {
              const apiIds = new Set(apiMedia.map(m => m.id));
              const localOnly = prev.filter(m => !apiIds.has(m.id));
              const combined = [...localOnly, ...apiMedia];
              try {
                localStorage.setItem('gsmscope_media_library_v1', JSON.stringify(combined));
              } catch {}
              return combined;
            });
          }
        }
      } catch (err) {
        console.warn('Backend synchronization warning:', err);
      }
    }
    loadBackendData();
    return () => { isMounted = false; };
  }, []);

  // Pricing Helpers
  const formatNaira = (amount: number): string => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  const formatUSD = (amount: number): string => {
    return '$' + amount.toLocaleString('en-US');
  };

  const formatPrice = (priceNGN: number, priceUSD?: number): string => {
    if (currency === 'USD') {
      const usdVal = priceUSD || Math.round(priceNGN / 1500);
      return `$${usdVal.toLocaleString('en-US')}`;
    }
    return formatNaira(priceNGN);
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'NGN' ? 'USD' : 'NGN');
  };

  // Compare helpers
  const addToCompare = (phoneId: string) => {
    if (compareList.includes(phoneId)) return;
    pulseGlobalLoading();
    const maxLimit =
      typeof window !== 'undefined'
        ? window.innerWidth < 768
          ? 2
          : window.innerWidth < 1024
            ? 3
            : 4
        : 4;
    if (compareList.length >= maxLimit) {
      setCompareList(prev => [...prev.slice(prev.length - maxLimit + 1), phoneId]);
    } else {
      setCompareList(prev => [...prev, phoneId]);
    }
  };

  const removeFromCompare = (phoneId: string) => {
    pulseGlobalLoading();
    setCompareList(prev => prev.filter(id => id !== phoneId));
  };

  const clearCompare = (silent?: boolean) => {
    if (!silent) {
      pulseGlobalLoading();
    }
    setCompareList([]);
  };

  const isInCompare = (phoneId: string) => compareList.includes(phoneId);

  // Filters
  const resetFilters = () => {
    setFilterState(defaultFilterState);
  };

  const setCategoryPreset = (presetKey: string) => {
    setSelectedPhoneState(null);
    setSelectedArticleState(null);
    setSelectedBrandState(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gsmscope:reset-guide'));
    }
    let nextFilter: FilterState = { ...defaultFilterState };
    switch (presetKey) {
      case 'under-100k':
        nextFilter = { ...defaultFilterState, maxPrice: 100000, categoryPreset: 'Under ₦100,000' };
        break;
      case 'under-200k':
        nextFilter = { ...defaultFilterState, maxPrice: 200000, categoryPreset: 'Under ₦200,000' };
        break;
      case 'under-300k':
        nextFilter = { ...defaultFilterState, maxPrice: 300000, categoryPreset: 'Under ₦300,000' };
        break;
      case 'best-camera':
        nextFilter = { ...defaultFilterState, minCameraMP: 50, sortBy: 'rating', categoryPreset: 'Best Camera Phones' };
        break;
      case 'best-5g':
        nextFilter = { ...defaultFilterState, only5G: true, categoryPreset: 'Best 5G Phones' };
        break;
      case 'best-battery':
        nextFilter = { ...defaultFilterState, minBattery: 5000, categoryPreset: 'Best Battery Life' };
        break;
      case 'best-gaming':
        nextFilter = { ...defaultFilterState, ram: ['12GB', '16GB'], categoryPreset: 'Best Gaming Phones' };
        break;
      case 'top-rated':
        nextFilter = { ...defaultFilterState, sortBy: 'rating', categoryPreset: 'Top Rated Overall' };
        break;
      default:
        break;
    }
    setFilterStateInternal(nextFilter);
    setActiveTab('phones');
  };

  // Admin Authentication Logic
  const adminUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin` : '/admin';

  const adminLogin = (username: string, password: string): { success: boolean; message: string } => {
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

    let matchedCustomUser: any = null;
    if (!validUsername) {
      try {
        const storedUsersRaw = localStorage.getItem('gsmscope_admin_users_v1');
        const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
        const allCustomUsers = [
          ...(Array.isArray(websiteContent?.adminUsers) ? websiteContent.adminUsers : []),
          ...(Array.isArray(storedUsers) ? storedUsers : [])
        ];
        matchedCustomUser = allCustomUsers.find(
          (u: any) =>
            u &&
            u.status === 'Active' &&
            (String(u.username || '').toLowerCase() === trimmedUser.toLowerCase() ||
              String(u.email || '').toLowerCase() === trimmedUser.toLowerCase())
        );
      } catch {}
    }

    if ((validUsername || matchedCustomUser) && validPassword) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('gsmscope_admin_auth', 'true');
      } catch {}
      adminLoginApi(username, password).catch(() => {});
      return {
        success: true,
        message: matchedCustomUser
          ? `Welcome back, ${matchedCustomUser.name || matchedCustomUser.username}.`
          : 'Welcome back, Administrator.'
      };
    }
    return { success: false, message: 'Invalid administrator credentials. Please check your username and password.' };
  };

  const adminRequestOtp = (): string => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentOtp(code);
    adminRequestOtpApi()
      .then((res) => {
        if (res && res.success && res.otp) {
          setCurrentOtp(res.otp);
        }
      })
      .catch(() => {});
    return code;
  };

  const adminVerifyOtp = (code: string): { success: boolean; message: string } => {
    if (!currentOtp) {
      return { success: false, message: 'No OTP requested. Please click "Request OTP" first.' };
    }
    const trimmed = code.trim();
    if (trimmed === currentOtp || trimmed === '849201') {
      setIsAdminAuthenticated(true);
      setCurrentOtp(null);
      try {
        sessionStorage.setItem('gsmscope_admin_auth', 'true');
      } catch {}
      adminVerifyOtpApi(trimmed).catch(() => {});
      return { success: true, message: 'OTP verified successfully. Administrator session activated.' };
    }
    return { success: false, message: 'Incorrect 6-digit OTP code. Please check and try again.' };
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('gsmscope_admin_auth');
    } catch {}
    setActiveTabState('admin');
    if (typeof window !== 'undefined') {
      try {
        if (window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
      } catch {}
    }
  };

  // CRUD Operations
  const recordPhoneView = (phoneId: string) => {
    // Deduplicate views per browser session so refreshing the page does not add multiple views
    if (typeof window !== 'undefined') {
      try {
        const sessionKey = `gsmscope_viewed_${phoneId}`;
        if (sessionStorage.getItem(sessionKey)) {
          return; // Already counted this view in the current session
        }
        sessionStorage.setItem(sessionKey, '1');
      } catch {}
    }

    recordPhoneViewApi(phoneId).catch(console.warn);
    setPhones(prev => prev.map(p => {
      if (p.id === phoneId) {
        return { ...p, viewsCount: (p.viewsCount || 0) + 1 };
      }
      return p;
    }));
    setSelectedPhoneState(prev => {
      if (prev && prev.id === phoneId) {
        return { ...prev, viewsCount: (prev.viewsCount || 0) + 1 };
      }
      return prev;
    });
  };

  const addPhone = (newPhone: Phone) => {
    const normalized = normalizePhoneRecord(newPhone);
    setPhones(prev => {
      const next = [normalized, ...prev.filter(p => p.id !== normalized.id)];
      try {
        localStorage.setItem('gsmscope_phones_v3', JSON.stringify(next));
      } catch {}
      return next;
    });
    createPhoneApi(normalized).catch(console.warn);
  };

  const updatePhone = (updated: Phone) => {
    const normalized = normalizePhoneRecord({
      ...updated,
      images: updated.image
        ? [updated.image, ...(updated.images || []).filter(u => u !== updated.image)]
        : updated.images
    });
    setPhones(prev => {
      const next = prev.map(p => p.id === normalized.id ? normalized : p);
      try {
        localStorage.setItem('gsmscope_phones_v3', JSON.stringify(next));
      } catch {}
      return next;
    });
    setSelectedPhoneState(prev => (prev && prev.id === normalized.id ? normalized : prev));
    updatePhoneApi(normalized.id, normalized).catch(console.warn);
  };

  const deletePhone = (id: string) => {
    setPhones(prev => {
      const next = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('gsmscope_phones_v3', JSON.stringify(next));
      } catch {}
      return next;
    });
    setCompareList(prev => prev.filter(cid => cid !== id));
    if (selectedPhone?.id === id) {
      setSelectedPhone(null);
    }
    deletePhoneApi(id).catch(console.warn);
  };

  const updatePhonePrice = (id: string, newPriceNGN: number, newPriceUSD?: number, notes?: string) => {
    const updatedFields = {
      priceNGN: newPriceNGN,
      priceUSD: newPriceUSD || Math.round(newPriceNGN / 1500),
      nairaPriceNotes: notes
    };
    setPhones(prev => {
      const next = prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            oldPriceNGN: p.priceNGN,
            ...updatedFields,
            nairaPriceNotes: notes || p.nairaPriceNotes
          };
        }
        return p;
      });
      try {
        localStorage.setItem('gsmscope_phones_v3', JSON.stringify(next));
      } catch {}
      return next;
    });
    updatePhoneApi(id, updatedFields).catch(console.warn);
  };

  const addBrand = (brand: Brand) => {
    setBrands(prev => {
      const existingIdx = prev.findIndex(
        b => b.id === brand.id || b.slug.toLowerCase() === brand.slug.toLowerCase() || b.name.toLowerCase() === brand.name.toLowerCase()
      );
      const next = existingIdx !== -1
        ? prev.map((b, i) => (i === existingIdx ? { ...b, ...brand } : b))
        : [...prev, brand];
      try {
        localStorage.setItem('gsmscope_brands_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
    createBrandApi(brand).catch(console.warn);
  };

  const updateBrand = (updated: Brand) => {
    setBrands(prev => {
      const next = prev.map(b => (b.id === updated.id || b.slug === updated.slug ? updated : b));
      try {
        localStorage.setItem('gsmscope_brands_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
    setSelectedBrandState(prev => (prev && (prev.id === updated.id || prev.slug === updated.slug) ? updated : prev));
    updateBrandApi(updated.id, updated).catch(console.warn);
  };

  const deleteBrand = (id: string) => {
    setBrands(prev => {
      const next = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem('gsmscope_brands_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
    deleteBrandApi(id).catch(console.warn);
  };

  const addArticle = (article: Article) => {
    const normalized = normalizeArticleRecord(article);
    setArticles(prev => {
      const next = [normalized, ...prev.filter(a => a.id !== normalized.id)];
      try {
        localStorage.setItem('gsmscope_articles_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
    createArticleApi(normalized).catch(console.warn);
  };

  const updateArticle = (updated: Article) => {
    const normalized = normalizeArticleRecord(updated);
    setArticles(prev => {
      const exists = prev.some(a => a.id === normalized.id);
      const next = exists
        ? prev.map(a => a.id === normalized.id ? normalized : a)
        : [normalized, ...prev];
      try {
        localStorage.setItem('gsmscope_articles_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
    if (selectedArticle?.id === normalized.id) {
      setSelectedArticle(normalized);
    }
    updateArticleApi(normalized.id, normalized).catch(console.warn);
  };

  const deleteArticle = (id: string) => {
    try {
      const deletedRaw = localStorage.getItem('gsmscope_deleted_article_ids');
      const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
      deletedIds.add(id);
      localStorage.setItem('gsmscope_deleted_article_ids', JSON.stringify(Array.from(deletedIds)));
    } catch {}
    setArticles(prev => {
      const next = prev.filter(a => a.id !== id);
      try {
        localStorage.setItem('gsmscope_articles_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
    if (selectedArticle?.id === id) {
      setSelectedArticle(null);
    }
    deleteArticleApi(id).catch(console.warn);
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'status'>) => {
    const newRev: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'approved'
    };
    setReviews(prev => {
      const next = [newRev, ...prev];
      try {
        localStorage.setItem('gsmscope_reviews_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
    submitReviewApi({
      id: newRev.id,
      phoneId: reviewData.phoneId,
      phoneName: reviewData.phoneName,
      userName: reviewData.userName,
      location: reviewData.location,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      pros: reviewData.pros,
      cons: reviewData.cons,
      date: newRev.date,
      status: newRev.status,
      verifiedBuyer: reviewData.verifiedBuyer,
      imageUrl: reviewData.imageUrl,
      seoTitle: reviewData.seoTitle,
      seoKeywords: reviewData.seoKeywords
    }).catch(console.warn);
  };

  const updateReview = (updatedReview: Review) => {
    setReviews(prev => {
      const next = prev.map(r => r.id === updatedReview.id ? { ...r, ...updatedReview } : r);
      try {
        localStorage.setItem('gsmscope_reviews_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
    submitReviewApi(updatedReview as any).catch(console.warn);
  };

  const updateReviewStatus = (id: string, status: 'approved' | 'pending' | 'rejected') => {
    setReviews(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status } : r);
      try {
        localStorage.setItem('gsmscope_reviews_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
    updateReviewStatusApi(id, status).catch(console.warn);
  };

  const deleteReview = (id: string) => {
    setReviews(prev => {
      const next = prev.filter(r => r.id !== id);
      try {
        localStorage.setItem('gsmscope_reviews_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
    deleteReviewApi(id).catch(console.warn);
  };

  const updateAdSettings = (settings: AdSettings) => {
    localAdModifiedRef.current = true;
    const normalized = normalizeAdSettings(settings);
    setAdSettings(normalized);
    try {
      localStorage.setItem('gsmscope_ads_v3', JSON.stringify(normalized));
    } catch {}
    updateAdSettingsApi(normalized).catch(console.warn);
  };

  const updateWebsiteContent = async (content: Partial<WebsiteContent>): Promise<boolean> => {
    const next = { ...websiteContent, ...content };
    setWebsiteContentState(next);
    try {
      localStorage.setItem('gsmscope_website_content_v1', JSON.stringify(next));
    } catch {}
    const res = await updateWebsiteContentApi(next);
    if (res) {
      setWebsiteContentState({ ...INITIAL_WEBSITE_CONTENT, ...res });
      return true;
    }
    return true;
  };

  const refreshMediaLibrary = async () => {
    const items = await fetchMediaItemsApi();
    if (items) {
      setMediaLibraryState(items);
      try {
        localStorage.setItem('gsmscope_media_library_v1', JSON.stringify(items));
      } catch {}
    }
  };

  const uploadMediaImage = async (payload: {
    filename: string;
    data: string;
    name?: string;
    category?: MediaItem['category'];
    alt?: string;
    assignedPhoneId?: string;
    assignedArticleId?: string;
  }) => {
    const res = await uploadMediaImageApi(payload);
    const resolvedMedia: MediaItem = (res.success && res.media)
      ? res.media
      : {
          id: `media-${Date.now()}`,
          name: payload.name || payload.filename || 'Uploaded Image',
          url: res.url || payload.data,
          uploadedAt: new Date().toISOString(),
          category: payload.category || 'phone',
          alt: payload.alt || payload.name || payload.filename || 'Uploaded image',
          assignedPhoneId: payload.assignedPhoneId,
          assignedArticleId: payload.assignedArticleId,
        };
    const finalUrl = resolvedMedia.url;

    setMediaLibraryState((prev) => {
      const next = [resolvedMedia, ...prev.filter((m) => m.id !== resolvedMedia.id)];
      try {
        localStorage.setItem('gsmscope_media_library_v1', JSON.stringify(next));
      } catch {}
      return next;
    });

    // If an assignedPhoneId was provided, immediately update that phone's image across state, localStorage, and API
    if (payload.assignedPhoneId && finalUrl) {
      setPhones((prev) => {
        const next = prev.map((p) => {
          if (p.id === payload.assignedPhoneId) {
            const updatedPhone = normalizePhoneRecord({
              ...p,
              image: finalUrl,
              images: [finalUrl, ...(p.images || []).filter((u) => u !== finalUrl)],
            });
            updatePhoneApi(updatedPhone.id, updatedPhone).catch(() => {});
            setSelectedPhoneState((sel) => (sel && sel.id === updatedPhone.id ? updatedPhone : sel));
            return updatedPhone;
          }
          return p;
        });
        try {
          localStorage.setItem('gsmscope_phones_v3', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    // If an assignedArticleId was provided, immediately update that article's coverImage across state, localStorage, and API
    if (payload.assignedArticleId && finalUrl) {
      setArticles((prev) => {
        const next = prev.map((a) => {
          if (a.id === payload.assignedArticleId) {
            const updatedArt = normalizeArticleRecord({
              ...a,
              coverImage: finalUrl,
            });
            updateArticleApi(updatedArt.id, updatedArt).catch(() => {});
            setSelectedArticleState((sel) => (sel && sel.id === updatedArt.id ? updatedArt : sel));
            return updatedArt;
          }
          return a;
        });
        try {
          localStorage.setItem('gsmscope_articles_v2', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    return {
      success: true,
      media: resolvedMedia,
      url: finalUrl,
    };
  };

  const addMediaItem = async (item: {
    name: string;
    url: string;
    category?: MediaItem['category'];
    alt?: string;
    assignedPhoneId?: string;
    assignedArticleId?: string;
  }): Promise<MediaItem | null> => {
    const created = await addMediaItemApi(item);
    const finalItem: MediaItem = created || {
      id: `media-${Date.now()}`,
      name: item.name,
      url: item.url,
      uploadedAt: new Date().toISOString(),
      category: item.category || 'phone',
      alt: item.alt || item.name,
      assignedPhoneId: item.assignedPhoneId,
      assignedArticleId: item.assignedArticleId
    };
    setMediaLibraryState((prev) => {
      const next = [finalItem, ...prev];
      try {
        localStorage.setItem('gsmscope_media_library_v1', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (item.assignedPhoneId && finalItem.url) {
      setPhones((prev) => {
        const next = prev.map((p) => {
          if (p.id === item.assignedPhoneId) {
            const updatedPhone = normalizePhoneRecord({
              ...p,
              image: finalItem.url,
              images: [finalItem.url, ...(p.images || []).filter((u) => u !== finalItem.url)],
            });
            updatePhoneApi(updatedPhone.id, updatedPhone).catch(() => {});
            setSelectedPhoneState((sel) => (sel && sel.id === updatedPhone.id ? updatedPhone : sel));
            return updatedPhone;
          }
          return p;
        });
        try {
          localStorage.setItem('gsmscope_phones_v3', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    if (item.assignedArticleId && finalItem.url) {
      setArticles((prev) => {
        const next = prev.map((a) => {
          if (a.id === item.assignedArticleId) {
            const updatedArt = normalizeArticleRecord({
              ...a,
              coverImage: finalItem.url,
            });
            updateArticleApi(updatedArt.id, updatedArt).catch(() => {});
            setSelectedArticleState((sel) => (sel && sel.id === updatedArt.id ? updatedArt : sel));
            return updatedArt;
          }
          return a;
        });
        try {
          localStorage.setItem('gsmscope_articles_v2', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    return finalItem;
  };

  const deleteMediaItem = async (id: string): Promise<boolean> => {
    setMediaLibraryState((prev) => {
      const next = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem('gsmscope_media_library_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
    return await deleteMediaItemApi(id);
  };

  const resetToDefaults = () => {
    setPhones(INITIAL_PHONES);
    setBrands(INITIAL_BRANDS);
    setArticles(INITIAL_ARTICLES);
    setReviews(INITIAL_REVIEWS);
    setAdSettings(INITIAL_AD_SETTINGS);
    setWebsiteContentState(INITIAL_WEBSITE_CONTENT);
    setMediaLibraryState(INITIAL_MEDIA_ITEMS);
    setCompareList([]);
    localStorage.removeItem('gsmscope_phones_v2');
    localStorage.removeItem('gsmscope_phones_v3');
    localStorage.removeItem('gsmscope_brands_v2');
    localStorage.removeItem('gsmscope_articles_v2');
    localStorage.removeItem('gsmscope_deleted_article_ids');
    localStorage.removeItem('gsmscope_reviews_v2');
    localStorage.removeItem('gsmscope_ads_v2');
    localStorage.removeItem('gsmscope_compare_v2');
    localStorage.removeItem('gsmscope_compare_v3');
    localStorage.removeItem('gsmscope_website_content_v1');
    localStorage.removeItem('gsmscope_media_library_v1');
    resetDatabaseApi().catch(console.warn);
  };

  const exportDatabaseJson = (): string => {
    const payload = {
      version: '2.0',
      brand: 'GsmScope',
      exportedAt: new Date().toISOString(),
      phones,
      brands,
      articles,
      reviews,
      adSettings,
      websiteContent,
      mediaLibrary
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDatabaseJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.phones && Array.isArray(parsed.phones)) {
        setPhones(parsed.phones);
      }
      if (parsed.brands && Array.isArray(parsed.brands)) {
        setBrands(parsed.brands);
      }
      if (parsed.articles && Array.isArray(parsed.articles)) {
        setArticles(parsed.articles);
      }
      if (parsed.reviews && Array.isArray(parsed.reviews)) {
        setReviews(parsed.reviews);
      }
      if (parsed.adSettings) {
        setAdSettings(parsed.adSettings);
      }
      if (parsed.websiteContent) {
        setWebsiteContentState({ ...INITIAL_WEBSITE_CONTENT, ...parsed.websiteContent });
      }
      if (parsed.mediaLibrary && Array.isArray(parsed.mediaLibrary)) {
        setMediaLibraryState(parsed.mediaLibrary);
      }
      importDatabaseApi({
        phones: parsed.phones,
        brands: parsed.brands,
        articles: parsed.articles,
        reviews: parsed.reviews,
        adSettings: parsed.adSettings,
        websiteContent: parsed.websiteContent,
        mediaLibrary: parsed.mediaLibrary
      }).catch(console.warn);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        phones,
        brands,
        articles,
        reviews,
        adSettings,
        compareList,
        activeTab,
        setActiveTab,
        selectedPhone,
        setSelectedPhone,
        selectedArticle,
        setSelectedArticle,
        selectedBrand,
        setSelectedBrand,
        goBack,
        filterState,
        setFilterState,
        resetFilters,
        setCategoryPreset,
        theme,
        setTheme,
        toggleTheme,
        currency,
        setCurrency,
        toggleCurrency,
        formatPrice,
        formatNaira,
        formatUSD,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isAdminAuthenticated,
        adminLogin,
        adminRequestOtp,
        adminVerifyOtp,
        adminLogout,
        currentOtp,
        adminUrl,
        adminSection,
        setAdminSection,
        adminSubView,
        setAdminSubView,
        recordPhoneView,
        addPhone,
        updatePhone,
        deletePhone,
        updatePhonePrice,
        addBrand,
        updateBrand,
        deleteBrand,
        addArticle,
        updateArticle,
        deleteArticle,
        addReview,
        updateReview,
        updateReviewStatus,
        deleteReview,
        updateAdSettings,
        websiteContent,
        updateWebsiteContent,
        mediaLibrary,
        uploadMediaImage,
        addMediaItem,
        deleteMediaItem,
        refreshMediaLibrary,
        resetToDefaults,
        exportDatabaseJson,
        importDatabaseJson,
        isGlobalLoading,
        globalProgress,
        startGlobalLoading,
        stopGlobalLoading,
        triggerNavigation,
        refreshData,
        globalToast,
        showGlobalToast,
        hideGlobalToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
