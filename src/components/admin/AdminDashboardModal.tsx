import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Phone,
  Brand,
  Article,
  Review,
  PriceRangeCategory,
  ContactInquiry,
  MediaItem,
  WebsiteContent,
  AdPlacementId,
  AdPlacementConfig,
} from '../../types';
import {
  fetchContactInquiriesApi,
  deleteContactInquiryApi,
  syncContactInquiriesWithServer,
  checkServerHealthApi,
  ServerHealthStatus,
} from '../../services/api';
import { INITIAL_WEBSITE_CONTENT, DEFAULT_AD_PLACEMENTS } from '../../data/seedData';
import {
  DEFAULT_SPEC_TABLES,
  SpecTableGroup,
  SpecSubtableItem,
  getEffectiveSpecTablesSchema,
  getSpecPlaceholder,
  getPhoneSpecEditorValue,
  setPhoneSpecEditorValue,
} from '../../data/specTablesSchema';
import RichTextEditor from '../common/RichTextEditor';
import FormattedContent from '../common/FormattedContent';
import {
  LayoutDashboard,
  Smartphone,
  Plus,
  Trash2,
  DollarSign,
  FileText,
  MessageSquare,
  Check,
  X,
  Megaphone,
  RotateCcw,
  Save,
  Download,
  Upload,
  Layers,
  ExternalLink,
  Search,
  Star,
  Image as ImageIcon,
  Globe,
  Table2,
  Users,
  Code2,
  Database,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shield,
  Sliders,
  Menu,
  Sun,
  Moon,
  ArrowUp,
  ArrowDown,
  Copy,
  Mail,
  Send,
  Radio,
  Bell,
  PhoneCall,
  Clock,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import WebsiteStatsDashboard, { StatsTabId } from './WebsiteStatsDashboard';
import { getLocalWebsiteStats, fetchWebsiteStatsFromApi } from '../../services/statsTracker';

type AdminSection =
  | 'dashboard'
  | 'stats'
  | 'phones'
  | 'specs'
  | 'pricing'
  | 'brands'
  | 'media'
  | 'news'
  | 'reviews'
  | 'messages'
  | 'featured'
  | 'ads'
  | 'content'
  | 'spec-tables'
  | 'users'
  | 'scripts'
  | 'backup';

export type { SpecSubtableItem, SpecTableGroup };

export interface AdminUserRecord {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Editor' | 'Author' | 'Moderator' | 'Subscriber';
  status: 'Active' | 'Suspended';
  lastLogin: string;
}

export type WebsiteContentSettings = WebsiteContent;

export interface CustomScriptsSettings {
  metaVerificationGoogle: string;
  metaVerificationBing: string;
  customHeadMeta: string;
  headerScripts: string;
  bodyTopScripts: string;
  footerScripts: string;
  robotsTxtMeta: string;
}

export type MediaAssetItem = MediaItem;

const DEFAULT_USERS: AdminUserRecord[] = [
  {
    id: 'usr-1',
    username: 'gsM-scopE',
    name: 'GsmScope Super Admin',
    email: 'admin@gsmscope.com',
    role: 'Administrator',
    status: 'Active',
    lastLogin: 'Active Now',
  },
  {
    id: 'usr-2',
    username: 'editor_tunde',
    name: 'Tunde Bakare',
    email: 'tunde@gsmscope.com',
    role: 'Editor',
    status: 'Active',
    lastLogin: '2 hours ago',
  },
  {
    id: 'usr-3',
    username: 'ada_reviews',
    name: 'Adaobi Nwosu',
    email: 'adaobi@gsmscope.com',
    role: 'Author',
    status: 'Active',
    lastLogin: 'Yesterday',
  },
  {
    id: 'usr-4',
    username: 'mod_chidi',
    name: 'Chidi Okonkwo',
    email: 'chidi@gsmscope.com',
    role: 'Moderator',
    status: 'Active',
    lastLogin: '3 days ago',
  },
];

const DEFAULT_WEBSITE_CONTENT: WebsiteContentSettings = INITIAL_WEBSITE_CONTENT;

const DEFAULT_SCRIPTS: CustomScriptsSettings = {
  metaVerificationGoogle: '',
  metaVerificationBing: '',
  customHeadMeta: '',
  headerScripts: '',
  bodyTopScripts: '',
  footerScripts: '',
  robotsTxtMeta: 'index, follow, max-image-preview:large',
};

function sanitizeCustomScripts(raw?: Partial<CustomScriptsSettings> | null): CustomScriptsSettings {
  const cleanStr = (val: unknown, legacyDummyPatterns: string[] = []): string => {
    const s = typeof val === 'string' ? val : '';
    const trimmed = s.trim();
    if (!trimmed) return '';
    for (const pat of legacyDummyPatterns) {
      if (trimmed === pat || trimmed.includes(pat)) return '';
    }
    return s;
  };
  const base = raw || {};
  return {
    metaVerificationGoogle: cleanStr(base.metaVerificationGoogle, ['gsmscope-verified-token']),
    metaVerificationBing: cleanStr(base.metaVerificationBing, ['gsmscope-bing-token']),
    customHeadMeta: cleanStr(base.customHeadMeta),
    headerScripts: cleanStr(base.headerScripts, ['<!-- Google Analytics / GTM Head Script -->']),
    bodyTopScripts: cleanStr(base.bodyTopScripts, ['<!-- Custom Body Open Script (e.g. GTM noscript) -->']),
    footerScripts: cleanStr(base.footerScripts, ['<!-- Custom Footer Analytics / Chat Widget Script -->']),
    robotsTxtMeta:
      typeof base.robotsTxtMeta === 'string' && base.robotsTxtMeta.trim()
        ? base.robotsTxtMeta.trim()
        : DEFAULT_SCRIPTS.robotsTxtMeta,
  };
}

const ALL_CATEGORY_BADGES = [
  'top-rated',
  'flagship',
  'best-camera',
  'best-gaming',
  'best-battery',
  '5g',
  'best-5g',
  'flagship-killers',
];

function createEmptyPhoneForm(defaultBrand = 'Samsung'): Phone {
  const year = new Date().getFullYear();
  return {
    id: '',
    name: '',
    brand: defaultBrand,
    priceNGN: 450000,
    priceUSD: 299,
    oldPriceNGN: undefined,
    priceRange: '350k-600k',
    marketStatus: 'Available',
    nairaPriceNotes: 'Available at authorized dealers nationwide and global online stores.',
    releaseYear: year,
    releaseDate: `${year}`,
    modelNumber: '',
    image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    images: ['/src/assets/images/hero_flagship_phones_1792578844852.jpg'],
    accentColor: '#10b981',
    rating: 0,
    reviewsCount: 0,
    viewsCount: 0,
    categories: ['5g', 'best-battery'],
    isFeatured: false,
    isPopular: false,
    screenSizeInches: 6.7,
    seoTitle: '',
    seoKeywords: '',
    seoDescription: '',
    keyHighlights: {
      display: '',
      processor: '',
      ram: '',
      storage: '',
      camera: '',
      battery: '',
      charging: '',
      os: '',
      network5g: true,
    },
    detailedSpecs: {
      network: {
        technology: '',
        bands5g: '',
        speed: '',
        sim: '',
      },
      body: {
        dimensions: '',
        weight: '',
        build: '',
        waterResistance: '',
      },
      display: {
        type: '',
        size: '',
        resolution: '',
        protection: '',
        brightness: '',
        refreshRate: '',
      },
      platform: {
        os: '',
        chipset: '',
        cpu: '',
        gpu: '',
        antutuScore: '',
      },
      memory: {
        ramVariants: [],
        storageVariants: [],
        cardSlot: '',
        storageType: '',
      },
      mainCamera: {
        setup: '',
        features: '',
        video: '',
      },
      selfieCamera: {
        setup: '',
        features: '',
        video: '',
      },
      battery: {
        capacity: '',
        charging: '',
        wirelessCharging: '',
      },
      sound: {
        loudspeaker: '',
        jack35mm: '',
        audioSpecs: '',
      },
      connectivity: {
        wlan: '',
        bluetooth: '',
        nfc: '',
        radio: '',
        usb: '',
        infrared: '',
        positioning: '',
      },
      sensors: '',
      biometrics: '',
      securityHardware: '',
    },
  };
}

export default function AdminDashboardModal() {
  const {
    isAdminAuthenticated,
    adminLogout,
    activeTab,
    setActiveTab,
    phones,
    addPhone,
    updatePhone,
    deletePhone,
    updatePhonePrice,
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    reviews,
    addReview,
    updateReview,
    updateReviewStatus,
    deleteReview,
    adSettings,
    updateAdSettings,
    websiteContent: contextWebsiteContent,
    updateWebsiteContent,
    mediaLibrary,
    uploadMediaImage,
    addMediaItem,
    deleteMediaItem,
    resetToDefaults,
    exportDatabaseJson,
    importDatabaseJson,
    formatNaira,
    formatUSD,
    theme,
    toggleTheme,
    setSelectedPhone,
    setSelectedArticle,
    resetFilters,
    startGlobalLoading,
    stopGlobalLoading,
    showGlobalToast,
    adminSection,
    setAdminSection,
    adminSubView,
    setAdminSubView,
  } = useApp();

  const VALID_ADMIN_SECTIONS: AdminSection[] = [
    'dashboard',
    'stats',
    'phones',
    'specs',
    'pricing',
    'brands',
    'media',
    'news',
    'reviews',
    'messages',
    'featured',
    'ads',
    'content',
    'spec-tables',
    'users',
    'scripts',
    'backup',
  ];
  const section: AdminSection = VALID_ADMIN_SECTIONS.includes(adminSection as AdminSection)
    ? (adminSection as AdminSection)
    : 'dashboard';
  const setSection = (nextSec: AdminSection) => {
    setAdminSection(nextSec);
  };
  const [statsTab, setStatsTab] = useState<StatsTabId>('overview');
  const [overviewStatsTotal, setOverviewStatsTotal] = useState<number>(() => getLocalWebsiteStats().allTimeViews || 0);
  useEffect(() => {
    fetchWebsiteStatsFromApi().then((s) => setOverviewStatsTotal(s.allTimeViews || 0));
    const onStatsUpdate = () => {
      setOverviewStatsTotal(getLocalWebsiteStats().allTimeViews || 0);
    };
    window.addEventListener('gsmscope:stats-updated', onStatsUpdate);
    return () => window.removeEventListener('gsmscope:stats-updated', onStatsUpdate);
  }, [section]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);

  // Search & Filter states inside Admin
  const [phoneSearch, setPhoneSearch] = useState('');
  const [phoneBrandFilter, setPhoneBrandFilter] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<'all' | 'news' | 'reviews' | 'guides'>('all');
  const [featuredCategoryFilter, setFeaturedCategoryFilter] = useState<
    'all' | 'top-rated' | 'best-camera' | 'best-gaming' | 'best-battery' | 'best-5g'
  >('all');

  // 1. Complete Phone Add/Edit Form state (includes ALL Phone fields & ALL DetailedSpecs fields)
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState<Phone>(() => createEmptyPhoneForm(brands[0]?.name || 'Samsung'));
  const [phoneUsdText, setPhoneUsdText] = useState<string>('299');
  const [phoneNgnText, setPhoneNgnText] = useState<string>('450000');
  const [phoneScreenSizeText, setPhoneScreenSizeText] = useState<string>('6.7');
  const [ramVariantsText, setRamVariantsText] = useState('');
  const [storageVariantsText, setStorageVariantsText] = useState('');
  const [galleryUrlsText, setGalleryUrlsText] = useState('');
  const [customCategoriesText, setCustomCategoriesText] = useState('5g, best-battery');

  // 2. Dedicated Specifications Editor state (for quick switching between any phone in "Add/Update Specs")
  const [selectedSpecPhoneId, setSelectedSpecPhoneId] = useState<string>(phones[0]?.id || '');
  const selectedSpecPhone = phones.find((p) => p.id === selectedSpecPhoneId) || phones[0];
  const [specPhoneDraft, setSpecPhoneDraft] = useState<Phone | null>(null);
  const [specUsdText, setSpecUsdText] = useState<string>('');
  const [specNgnText, setSpecNgnText] = useState<string>('');
  const [specRamText, setSpecRamText] = useState('');
  const [specStorageText, setSpecStorageText] = useState('');

  useEffect(() => {
    if (selectedSpecPhone) {
      const cloned: Phone = JSON.parse(JSON.stringify(selectedSpecPhone));
      setSpecPhoneDraft(cloned);
      setSpecUsdText(
        cloned.priceUSD !== undefined && cloned.priceUSD !== null ? String(cloned.priceUSD) : ''
      );
      setSpecNgnText(
        cloned.priceNGN !== undefined && cloned.priceNGN !== null ? String(cloned.priceNGN) : ''
      );
      setSpecRamText((cloned.detailedSpecs.memory.ramVariants || []).join(', '));
      setSpecStorageText((cloned.detailedSpecs.memory.storageVariants || []).join(', '));
    }
  }, [selectedSpecPhoneId, phones]);

  // 3. Pricing Editor state
  const [priceEdits, setPriceEdits] = useState<
    Record<string, { ngn: string; usd: string; oldNgn: string; marketStatus: string; notes: string }>
  >({});

  // 4. Brands state (including logoUrl & SEO fields)
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: '',
    country: '',
    description: '',
    popularSeries: '',
    warrantyPartner: '',
    officialPresenceInNigeria: 'Yes — Official Retail & Service Centers',
    globalPresence: 'Global Distribution',
    accentBg: 'from-emerald-900/40 to-slate-900',
    logoUrl: '',
    seoTitle: '',
    seoKeywords: '',
  });

  // 5. Media / Server Disk Uploader & Universal Media Picker state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const phoneImageInputRef = useRef<HTMLInputElement | null>(null);
  const specPhoneImageInputRef = useRef<HTMLInputElement | null>(null);
  const articleImageInputRef = useRef<HTMLInputElement | null>(null);
  const brandLogoInputRef = useRef<HTMLInputElement | null>(null);
  const reviewImageInputRef = useRef<HTMLInputElement | null>(null);
  const headerDarkLogoInputRef = useRef<HTMLInputElement | null>(null);
  const headerLightLogoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageCategory, setNewImageCategory] = useState<NonNullable<MediaItem['category']>>('phone');
  const [mediaUploadAssignPhoneId, setMediaUploadAssignPhoneId] = useState<string>('');
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<string>('ALL');
  const [targetPhoneForImage, setTargetPhoneForImage] = useState<string>(phones[0]?.id || '');

  // Universal Media Library Picker Modal State
  const [mediaPickerModal, setMediaPickerModal] = useState<{
    isOpen: boolean;
    title: string;
    category: NonNullable<MediaItem['category']>;
    onSelect: (url: string) => void;
  } | null>(null);

  const openMediaPicker = (
    title: string,
    category: NonNullable<MediaItem['category']>,
    onSelect: (url: string) => void
  ) => {
    setMediaPickerModal({ isOpen: true, title, category, onSelect });
  };

  // Universal helper to upload a file to the Node.js /uploads directory (cPanel compatible)
  const handleDirectFileUploadToServer = async (
    file: File,
    category: NonNullable<MediaItem['category']>,
    customTitle: string,
    onUploadedUrl: (url: string, item?: MediaItem, dataUrl?: string) => void,
    assignedPhoneId?: string
  ) => {
    startGlobalLoading();
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const rawDataUrl = reader.result;
        const uploaded = await uploadMediaImage({
          filename: file.name,
          data: rawDataUrl,
          name: customTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
          category,
          assignedPhoneId,
        });
        stopGlobalLoading();
        const finalUrl = uploaded.url || uploaded.media?.url;
        if (uploaded.success && finalUrl) {
          onUploadedUrl(finalUrl, uploaded.media, uploaded.media?.dataUrl || rawDataUrl);
          showGlobalToast(`Uploaded "${uploaded.media?.name || file.name}" to server (/uploads)`, 'success');
        } else {
          showGlobalToast(uploaded.error || 'Failed to upload image.', 'error');
        }
      } else {
        stopGlobalLoading();
      }
    };
    reader.onerror = () => {
      stopGlobalLoading();
      showGlobalToast('Could not read selected image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // 6. News / Articles state (including SEO Title, Keywords & Description & Linked Phone)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    category: 'News' as Article['category'],
    summary: '',
    content: '',
    coverImage: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    readTime: '4 min read',
    tags: 'Smartphone, Launch, Specs',
    featured: false,
    relatedPhoneId: '',
    authorName: 'GsmScope Editorial',
    authorRole: 'Senior Hardware Editor',
    seoTitle: '',
    seoKeywords: '',
    seoDescription: '',
  });
  const [articleArchivePage, setArticleArchivePage] = useState<number>(1);
  const ADMIN_ARTICLES_PER_PAGE = 10;

  // 7. Admin Review Creation / Management state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    phoneId: phones[0]?.id || '',
    userName: 'GsmScope Lab Reviewer',
    location: 'Lagos / Global Lab',
    rating: 5,
    title: '',
    comment: '',
    pros: 'Display brightness, Battery endurance, Fast charging',
    cons: 'Premium retail price',
    imageUrl: '',
    seoTitle: '',
    seoKeywords: '',
  });


  // Server & cPanel Connection Diagnostics state (inside Database Tools section)
  const [isTestingConnections, setIsTestingConnections] = useState(false);
  const [connectionReport, setConnectionReport] = useState<{
    online: boolean;
    latencyMs: number;
    health?: ServerHealthStatus;
    seoEndpoints?: {
      adsTxtOk: boolean;
      robotsTxtOk: boolean;
      sitemapXmlOk: boolean;
    };
    checkedAt?: string;
    error?: string;
  } | null>(null);

  const handleRunConnectionCheck = async (showToast = false) => {
    setIsTestingConnections(true);
    try {
      const res = await checkServerHealthApi();
      setConnectionReport({
        ...res,
        checkedAt: new Date().toLocaleTimeString(),
      });
      if (showToast) {
        if (res.online) {
          showGlobalToast(`All server & database connections verified (${res.latencyMs}ms).`, 'success');
        } else {
          showGlobalToast(res.error || 'Backend connection check failed.', 'error');
        }
      }
    } finally {
      setIsTestingConnections(false);
    }
  };

  useEffect(() => {
    if (section === 'backup' && !connectionReport && !isTestingConnections) {
      handleRunConnectionCheck(false);
    }
  }, [section]);

  // 9. Ad Settings & 8 Page Ad Placements state (matching AdSettings in src/types/index.ts)
  const adPlacementImageInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadPlacementIdRef = useRef<AdPlacementId | null>(null);
  const [adPlacementFilter, setAdPlacementFilter] = useState<'all' | 'header' | 'home' | 'phones' | 'editorial'>('all');

  const AD_PLACEMENT_ORDER: AdPlacementId[] = [
    'header_top',
    'home_above_trending',
    'home_above_reviews',
    'home_above_guides',
    'phones_below_top_result',
    'best_above_top_rated',
    'news_below_featured',
    'guides_below_featured',
  ];

  const [localAdSettings, setLocalAdSettings] = useState(() => ({
    ...adSettings,
    placements: {
      ...DEFAULT_AD_PLACEMENTS,
      ...(adSettings.placements || {}),
    },
  }));
  const localAdSettingsRef = useRef(localAdSettings);
  localAdSettingsRef.current = localAdSettings;

  const adPersistDebounceRef = useRef<any>(null);

  useEffect(() => {
    const synced = {
      ...adSettings,
      placements: {
        ...DEFAULT_AD_PLACEMENTS,
        ...(adSettings.placements || {}),
      },
    };
    localAdSettingsRef.current = synced;
    setLocalAdSettings(synced);
  }, [adSettings]);

  const updatePlacementField = (
    placementId: AdPlacementId,
    patch: Partial<AdPlacementConfig>,
    immediatePersist = false
  ) => {
    const nowIso = new Date().toISOString();
    const prev = localAdSettingsRef.current;
    const currentPlacements = prev.placements || DEFAULT_AD_PLACEMENTS;
    const basePlacement = currentPlacements[placementId] || DEFAULT_AD_PLACEMENTS[placementId];
    const updatedPlacement: AdPlacementConfig = {
      ...DEFAULT_AD_PLACEMENTS[placementId],
      ...basePlacement,
      ...patch,
      id: DEFAULT_AD_PLACEMENTS[placementId].id,
      name: DEFAULT_AD_PLACEMENTS[placementId].name,
      pageLabel: DEFAULT_AD_PLACEMENTS[placementId].pageLabel,
      positionLabel: DEFAULT_AD_PLACEMENTS[placementId].positionLabel,
      enabled: patch.enabled !== undefined ? Boolean(patch.enabled) : Boolean(basePlacement.enabled),
      updatedAt: nowIso,
    };
    const nextSettings = {
      ...prev,
      updatedAt: nowIso,
      placements: {
        ...DEFAULT_AD_PLACEMENTS,
        ...currentPlacements,
        [placementId]: updatedPlacement,
      },
      ...(placementId === 'header_top'
        ? {
            topBanner: {
              ...prev.topBanner,
              enabled: Boolean(updatedPlacement.enabled),
              title: updatedPlacement.title,
              subtitle: updatedPlacement.subtitle,
              tag: updatedPlacement.badgeText,
              linkUrl: updatedPlacement.learnMoreUrl,
            },
          }
        : {}),
    };
    localAdSettingsRef.current = nextSettings;
    setLocalAdSettings(nextSettings);
    try {
      localStorage.setItem('gsmscope_ads_v3', JSON.stringify(nextSettings));
      localStorage.setItem('gsmscope_ads_admin_saved_v1', 'true');
    } catch {}
    if (immediatePersist) {
      if (adPersistDebounceRef.current) clearTimeout(adPersistDebounceRef.current);
      updateAdSettings(nextSettings);
    } else {
      if (adPersistDebounceRef.current) clearTimeout(adPersistDebounceRef.current);
      adPersistDebounceRef.current = setTimeout(() => {
        updateAdSettings(localAdSettingsRef.current);
      }, 250);
    }
  };

  // 10. Website Content state (synced with server-persisted contextWebsiteContent)
  const [websiteContent, setWebsiteContent] = useState<WebsiteContentSettings>(() => ({
    ...DEFAULT_WEBSITE_CONTENT,
    ...contextWebsiteContent,
  }));
  const websiteContentRef = useRef<WebsiteContentSettings>(websiteContent);
  websiteContentRef.current = websiteContent;

  const applyAndPersistWebsiteContentPatch = (
    patch: Partial<WebsiteContentSettings>,
    toastMessage?: string
  ) => {
    const next: WebsiteContentSettings = {
      ...websiteContentRef.current,
      ...patch,
    };
    websiteContentRef.current = next;
    setWebsiteContent(next);
    updateWebsiteContent(next);
    if (toastMessage) {
      showGlobalToast(toastMessage, 'success');
    }
  };

  useEffect(() => {
    if (contextWebsiteContent) {
      setWebsiteContent((prev) => {
        const merged = {
          ...prev,
          ...contextWebsiteContent,
          seoTitle: contextWebsiteContent.seoTitle || contextWebsiteContent.defaultSeoTitle || prev.seoTitle,
          seoKeywords: contextWebsiteContent.seoKeywords || contextWebsiteContent.defaultSeoKeywords || prev.seoKeywords,
          seoDescription: contextWebsiteContent.seoDescription || contextWebsiteContent.defaultSeoDescription || prev.seoDescription,
        };
        websiteContentRef.current = merged;
        return merged;
      });
      if (Array.isArray(contextWebsiteContent.specTablesSchema) && contextWebsiteContent.specTablesSchema.length > 0) {
        setSpecTablesSchema(contextWebsiteContent.specTablesSchema);
      }
      if (Array.isArray(contextWebsiteContent.adminUsers) && contextWebsiteContent.adminUsers.length > 0) {
        setUsersList(contextWebsiteContent.adminUsers);
      }
      if (contextWebsiteContent.customScripts && typeof contextWebsiteContent.customScripts === 'object') {
        setScriptsConfig(sanitizeCustomScripts(contextWebsiteContent.customScripts));
      }
    }
  }, [contextWebsiteContent]);

  // 11. Specification Tables & Subtables Schema state
  const [specTablesSchema, setSpecTablesSchema] = useState<SpecTableGroup[]>(() =>
    getEffectiveSpecTablesSchema(contextWebsiteContent?.specTablesSchema)
  );
  const specSchemaDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [newTableTitle, setNewTableTitle] = useState('');
  const [newSubtableLabels, setNewSubtableLabels] = useState<Record<string, { label: string; keyPath: string }>>({});

  const persistSpecTablesSchema = (
    nextSchema: SpecTableGroup[],
    toastMessage?: string,
    debounce = false
  ) => {
    setSpecTablesSchema(nextSchema);
    try {
      localStorage.setItem('gsmscope_spec_tables_schema_v1', JSON.stringify(nextSchema));
    } catch {}
    const nextWebsiteContent: WebsiteContentSettings = {
      ...websiteContentRef.current,
      specTablesSchema: nextSchema,
    };
    websiteContentRef.current = nextWebsiteContent;
    setWebsiteContent(nextWebsiteContent);

    if (specSchemaDebounceRef.current) {
      clearTimeout(specSchemaDebounceRef.current);
      specSchemaDebounceRef.current = null;
    }

    if (debounce) {
      specSchemaDebounceRef.current = setTimeout(() => {
        updateWebsiteContent(websiteContentRef.current);
      }, 350);
    } else {
      updateWebsiteContent(nextWebsiteContent);
    }

    if (toastMessage) {
      showGlobalToast(toastMessage, 'success');
    }
  };

  const generalTableConfig = specTablesSchema.find(
    (g) => g.code === 'general' || g.id === 'tbl-general'
  );
  const isGeneralTableEnabled = !generalTableConfig || generalTableConfig.enabled !== false;
  const isGeneralSubtableEnabled = (keyPath: string) => {
    if (!generalTableConfig) return true;
    if (generalTableConfig.enabled === false) return false;
    return (generalTableConfig.subtables || []).some(
      (s) => s.keyPath === keyPath && s.enabled !== false
    );
  };
  const getGeneralSubtableLabel = (keyPath: string, fallback: string) => {
    const found = generalTableConfig?.subtables?.find((s) => s.keyPath === keyPath);
    return found?.label || fallback;
  };

  // 12. Users Management state
  const [usersList, setUsersList] = useState<AdminUserRecord[]>(() => {
    if (Array.isArray(contextWebsiteContent?.adminUsers) && contextWebsiteContent.adminUsers.length > 0) {
      return contextWebsiteContent.adminUsers;
    }
    try {
      const saved = localStorage.getItem('gsmscope_admin_users_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_USERS;
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    name: '',
    email: '',
    role: 'Editor' as AdminUserRecord['role'],
    status: 'Active' as AdminUserRecord['status'],
  });

  // 13. Header / Body / Footer Scripts state
  const [scriptsConfig, setScriptsConfig] = useState<CustomScriptsSettings>(() => {
    if (contextWebsiteContent?.customScripts && typeof contextWebsiteContent.customScripts === 'object') {
      return sanitizeCustomScripts(contextWebsiteContent.customScripts);
    }
    try {
      const saved = localStorage.getItem('gsmscope_custom_scripts_v1');
      if (saved) return sanitizeCustomScripts(JSON.parse(saved));
    } catch {}
    return DEFAULT_SCRIPTS;
  });

  // Backup JSON state
  const [jsonText, setJsonText] = useState('');

  // 14. Messages state
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('gsmscope_contact_inquiries_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [inquirySearch, setInquirySearch] = useState('');

  // Synchronize open sub-forms (Add/Edit Phone, Edit Article, Add Review, Edit Brand) with browser history
  const desiredSubView = showPhoneForm
    ? editingPhoneId
      ? `phone:${editingPhoneId}`
      : 'phone:new'
    : editingArticleId
    ? `article:${editingArticleId}`
    : showReviewForm
    ? 'review:new'
    : editingBrandId
    ? `brand:${editingBrandId}`
    : null;

  const prevDesiredSubViewRef = useRef<string | null>(desiredSubView);
  const prevAdminSubViewRef = useRef<string | null>(adminSubView);

  useEffect(() => {
    if (desiredSubView !== prevDesiredSubViewRef.current) {
      prevDesiredSubViewRef.current = desiredSubView;
      prevAdminSubViewRef.current = desiredSubView;
      if (desiredSubView !== adminSubView) {
        setAdminSubView(desiredSubView);
      }
    }
  }, [desiredSubView, adminSubView, setAdminSubView]);

  useEffect(() => {
    if (adminSubView !== prevAdminSubViewRef.current) {
      prevAdminSubViewRef.current = adminSubView;
      if (adminSubView === null && prevDesiredSubViewRef.current !== null) {
        prevDesiredSubViewRef.current = null;
        setShowPhoneForm(false);
        setEditingPhoneId(null);
        setEditingArticleId(null);
        setShowReviewForm(false);
        setEditingBrandId(null);
      }
    }
  }, [adminSubView]);

  // Sync Contact Inquiries with backend API and real-time custom events without losing messages after publish/restart
  const syncLiveAdminCollections = useCallback(() => {
    syncContactInquiriesWithServer()
      .then((merged) => {
        if (Array.isArray(merged)) {
          setContactInquiries(merged);
        }
      })
      .catch(() => {
        fetchContactInquiriesApi().then((serverData) => {
          if (serverData && Array.isArray(serverData)) {
            setContactInquiries(serverData);
          }
        });
      });
  }, []);

  useEffect(() => {
    syncLiveAdminCollections();
    const intervalId = setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        syncLiveAdminCollections();
      }
    }, 15000);
    const handleWindowFocus = () => syncLiveAdminCollections();
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [syncLiveAdminCollections, isAdminAuthenticated, activeTab, section]);

  useEffect(() => {
    const handleContactUpdated = (e: Event) => {
      const customEvt = e as CustomEvent<ContactInquiry | undefined>;
      if (customEvt.detail && customEvt.detail.id) {
        const newInq = customEvt.detail;
        setContactInquiries((prev) => {
          const next = [newInq, ...prev.filter((i) => i.id !== newInq.id)];
          try {
            localStorage.setItem('gsmscope_contact_inquiries_v1', JSON.stringify(next));
          } catch {}
          return next;
        });
      } else {
        syncLiveAdminCollections();
      }
    };
    window.addEventListener('gsmscope:contact-updated', handleContactUpdated);
    return () => {
      window.removeEventListener('gsmscope:contact-updated', handleContactUpdated);
    };
  }, [syncLiveAdminCollections]);

  if (!isAdminAuthenticated) return null;

  const adminBarLogoUrl =
    websiteContent.headerLogoDarkUrl ||
    websiteContent.headerLogoUrl ||
    '/assets/aistudio/GsmScope_header_logo_dark.webp';

  // If the admin is browsing the public site (activeTab !== 'admin'), show a WordPress-style top admin bar
  if (activeTab !== 'admin') {
    return (
      <div className="w-full bg-[#1d2327] text-slate-200 border-b border-slate-800 px-3 sm:px-6 h-9 flex items-center justify-between text-xs z-50 select-none">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              startGlobalLoading();
              setActiveTab('admin');
              setTimeout(() => stopGlobalLoading(), 250);
            }}
            className="flex items-center gap-2 hover:opacity-90 cursor-pointer shrink-0"
            title="Open Admin Dashboard (/admin)"
          >
            <img
              src={adminBarLogoUrl}
              alt={websiteContent.siteName || 'GsmScope'}
              className="h-5 w-auto object-contain select-none"
            />
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">Admin</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => {
              setSection('dashboard');
              setActiveTab('admin');
            }}
            className="hover:text-emerald-400 cursor-pointer shrink-0"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setSection('phones');
              setShowPhoneForm(true);
              setActiveTab('admin');
            }}
            className="hover:text-emerald-400 flex items-center gap-1 cursor-pointer shrink-0 text-emerald-400 font-semibold"
          >
            <Plus className="w-3 h-3" />
            <span>Add Phone</span>
          </button>
          <button
            onClick={() => {
              setSection('specs');
              setActiveTab('admin');
            }}
            className="hidden sm:inline hover:text-emerald-400 cursor-pointer shrink-0"
          >
            Manage Specs
          </button>
          <button
            onClick={() => {
              setSection('news');
              setActiveTab('admin');
            }}
            className="hidden md:inline hover:text-emerald-400 cursor-pointer shrink-0"
          >
            Posts &amp; News
          </button>
          <button
            onClick={() => {
              setSection('users');
              setActiveTab('admin');
            }}
            className="hidden md:inline hover:text-emerald-400 cursor-pointer shrink-0"
          >
            Users
          </button>
          <button
            onClick={() => {
              setSection('content');
              setActiveTab('admin');
            }}
            className="hidden lg:inline hover:text-emerald-400 cursor-pointer shrink-0"
          >
            Settings
          </button>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              startGlobalLoading();
              setActiveTab('admin');
              setTimeout(() => stopGlobalLoading(), 250);
            }}
            className="px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors"
          >
            Open Admin (/admin)
          </button>
        </div>
      </div>
    );
  }

  const runWithProgress = (action: () => void, toastMsg: string) => {
    startGlobalLoading();
    setTimeout(() => {
      action();
      stopGlobalLoading();
      showGlobalToast(toastMsg, 'success');
    }, 250);
  };

  // View a phone directly on the public website
  const handleViewPhoneOnPublicSite = (phone: Phone) => {
    startGlobalLoading();
    resetFilters();
    setSelectedPhone(phone);
    setActiveTab('phones');
    setTimeout(() => {
      stopGlobalLoading();
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 250);
  };

  // View an article directly on the public website
  const handleViewArticleOnPublicSite = (art: Article) => {
    startGlobalLoading();
    const catLower = String(art.category || '').toLowerCase();
    const targetTab = catLower.includes('review')
      ? 'reviews'
      : catLower.includes('guide')
      ? 'guides'
      : 'news';
    setSelectedPhone(null);
    setSelectedArticle(art);
    setActiveTab(targetTab);
    setTimeout(() => {
      stopGlobalLoading();
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 250);
  };

  // Handlers for 1. Phones (Complete Form with ALL fields)
  const openCreatePhoneForm = () => {
    const empty = createEmptyPhoneForm(brands[0]?.name || 'Samsung');
    setEditingPhoneId(null);
    setPhoneDraft(empty);
    setPhoneUsdText(empty.priceUSD !== undefined && empty.priceUSD !== null ? String(empty.priceUSD) : '');
    setPhoneNgnText(empty.priceNGN !== undefined && empty.priceNGN !== null ? String(empty.priceNGN) : '');
    setPhoneScreenSizeText(
      empty.screenSizeInches !== undefined && empty.screenSizeInches !== null ? String(empty.screenSizeInches) : ''
    );
    setRamVariantsText(empty.detailedSpecs.memory.ramVariants.join(', '));
    setStorageVariantsText(empty.detailedSpecs.memory.storageVariants.join(', '));
    setGalleryUrlsText((empty.images || [empty.image]).join('\n'));
    setCustomCategoriesText(empty.categories.join(', '));
    setShowPhoneForm(true);
    setSection('phones');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditPhoneForm = (phone: Phone) => {
    const cloned: Phone = JSON.parse(JSON.stringify(phone));
    setEditingPhoneId(phone.id);
    setPhoneDraft(cloned);
    setPhoneUsdText(cloned.priceUSD !== undefined && cloned.priceUSD !== null ? String(cloned.priceUSD) : '');
    setPhoneNgnText(cloned.priceNGN !== undefined && cloned.priceNGN !== null ? String(cloned.priceNGN) : '');
    setPhoneScreenSizeText(
      cloned.screenSizeInches !== undefined && cloned.screenSizeInches !== null ? String(cloned.screenSizeInches) : ''
    );
    setRamVariantsText((cloned.detailedSpecs?.memory?.ramVariants || [cloned.keyHighlights.ram]).join(', '));
    setStorageVariantsText((cloned.detailedSpecs?.memory?.storageVariants || [cloned.keyHighlights.storage]).join(', '));
    setGalleryUrlsText((cloned.images && cloned.images.length > 0 ? cloned.images : [cloned.image]).join('\n'));
    setCustomCategoriesText((cloned.categories || []).join(', '));
    setShowPhoneForm(true);
    setSection('phones');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneDraft.name.trim()) {
      showGlobalToast('Please enter a Phone Model Name.', 'error');
      return;
    }

    const baseSlug =
      phoneDraft.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'phone';

    const takenPhoneKeys = new Set<string>();
    phones.forEach((p) => {
      if (editingPhoneId && p.id === editingPhoneId) return;
      if (p.id) takenPhoneKeys.add(p.id.toLowerCase());
      if (p.slug) takenPhoneKeys.add(p.slug.toLowerCase());
    });

    let uniqueSlug = baseSlug;
    let suffix = 2;
    while (takenPhoneKeys.has(uniqueSlug.toLowerCase())) {
      uniqueSlug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const existingSlugClean = (phoneDraft.slug || '').trim().toLowerCase().replace(/-\d{10,14}$/, '').replace(/^-+|-+$/g, '');
    const resolvedSlug = editingPhoneId
      ? (existingSlugClean && !takenPhoneKeys.has(existingSlugClean) ? existingSlugClean : uniqueSlug)
      : uniqueSlug;

    const ramArr = ramVariantsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const storageArr = storageVariantsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const galleryArr = galleryUrlsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const categoriesArr = customCategoriesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedNgn = phoneNgnText.trim() !== '' ? parseFloat(phoneNgnText) : NaN;
    const parsedUsd = phoneUsdText.trim() !== '' ? parseFloat(phoneUsdText) : NaN;
    const priceNGN = !Number.isNaN(parsedNgn) ? parsedNgn : 0;
    const priceUSD = !Number.isNaN(parsedUsd) ? parsedUsd : (priceNGN > 0 ? Math.round(priceNGN / 1500) : 0);
    const parsedScreen = phoneScreenSizeText.trim() !== '' ? parseFloat(phoneScreenSizeText) : NaN;
    const computedPriceRange: PriceRangeCategory =
      priceNGN < 100000
        ? 'under100k'
        : priceNGN <= 200000
        ? '100k-200k'
        : priceNGN <= 350000
        ? '200k-350k'
        : priceNGN <= 600000
        ? '350k-600k'
        : priceNGN <= 1200000
        ? '600k-1.2m'
        : 'flagship';

    const yearMatch = (phoneDraft.releaseDate || '').match(/\b(19\d{2}|20\d{2})\b/);
    const derivedReleaseYear = yearMatch
      ? Number(yearMatch[1])
      : Number(phoneDraft.releaseYear) || new Date().getFullYear();

    const defaultSeoTitle = `${phoneDraft.name.trim()} Full Specifications & Price in USD / NGN`;
    const defaultSeoKeywords = `${phoneDraft.name.trim()}, ${phoneDraft.brand.trim()}, ${phoneDraft.name.trim()} specs, ${phoneDraft.name.trim()} price in Nigeria, ${phoneDraft.name.trim()} USD price, ${phoneDraft.keyHighlights.processor}, ${phoneDraft.keyHighlights.camera}`;
    const defaultSeoDescription = `Explore full hardware specifications for ${phoneDraft.name.trim()} (${derivedReleaseYear}): ${phoneDraft.keyHighlights.display}, ${phoneDraft.keyHighlights.processor}, ${phoneDraft.keyHighlights.camera}, ${phoneDraft.keyHighlights.battery} battery, and verified price.`;

    const finalPhone: Phone = {
      ...phoneDraft,
      id: editingPhoneId || resolvedSlug,
      slug: resolvedSlug,
      name: phoneDraft.name.trim(),
      brand: phoneDraft.brand.trim() || 'Samsung',
      priceNGN,
      priceUSD,
      oldPriceNGN: phoneDraft.oldPriceNGN ? Number(phoneDraft.oldPriceNGN) : undefined,
      priceRange: computedPriceRange,
      marketStatus: phoneDraft.marketStatus || 'Available',
      nairaPriceNotes: phoneDraft.nairaPriceNotes || 'Available at authorized stores.',
      releaseYear: derivedReleaseYear,
      releaseDate: phoneDraft.releaseDate || `${derivedReleaseYear}`,
      modelNumber: phoneDraft.modelNumber || '',
      image: phoneDraft.image.trim(),
      images: [
        phoneDraft.image.trim(),
        ...galleryArr.filter((u) => u !== phoneDraft.image.trim()),
      ].filter(Boolean),
      accentColor: phoneDraft.accentColor || '#10b981',
      rating: editingPhoneId ? (phoneDraft.rating || 0) : 0,
      reviewsCount: editingPhoneId ? (phoneDraft.reviewsCount || 0) : 0,
      viewsCount: editingPhoneId ? (phoneDraft.viewsCount || 0) : 0,
      screenSizeInches: !Number.isNaN(parsedScreen) ? parsedScreen : undefined,
      categories: categoriesArr.length > 0 ? categoriesArr : ['5g'],
      isFeatured: Boolean(
        phoneDraft.isFeatured ||
        categoriesArr.some((c) => c.toLowerCase() === 'featured')
      ),
      isPopular: Boolean(phoneDraft.isPopular),
      seoTitle: (phoneDraft.seoTitle || '').trim() || defaultSeoTitle,
      seoKeywords: (phoneDraft.seoKeywords || '').trim() || defaultSeoKeywords,
      seoDescription: (phoneDraft.seoDescription || '').trim() || defaultSeoDescription,
      keyHighlights: {
        ...phoneDraft.keyHighlights,
        ram: phoneDraft.keyHighlights.ram || ramArr.join(' / ') || '',
        storage: phoneDraft.keyHighlights.storage || storageArr.join(' / ') || '',
      },
      detailedSpecs: {
        ...phoneDraft.detailedSpecs,
        memory: {
          ...phoneDraft.detailedSpecs.memory,
          ramVariants: ramArr,
          storageVariants: storageArr,
        },
      },
      updatedAt: Date.now(),
    } as Phone;

    if (editingPhoneId) {
      runWithProgress(() => {
        updatePhone(finalPhone);
        setShowPhoneForm(false);
        setEditingPhoneId(null);
      }, `Updated "${finalPhone.name}" with all specifications & SEO.`);
    } else {
      runWithProgress(() => {
        resetFilters();
        addPhone(finalPhone);
        setTargetPhoneForImage(finalPhone.id);
        setSelectedSpecPhoneId(finalPhone.id);
        setShowPhoneForm(false);
      }, `Published "${finalPhone.name}"! It is now live on the site.`);
    }
  };

  // Handler for uploading image inside Phone Form (saves to server /uploads for cPanel hosting & immediately updates phone if editing)
  const handlePhoneFormFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleDirectFileUploadToServer(
      file,
      'phone',
      phoneDraft.name ? `${phoneDraft.name} Render` : file.name,
      (serverUrl) => {
        setPhoneDraft((prev) => {
          const nextDraft = {
            ...prev,
            image: serverUrl,
            images: [serverUrl, ...(prev.images || []).filter((u) => u !== serverUrl)],
          };
          if (editingPhoneId) {
            updatePhone({ ...nextDraft, id: editingPhoneId });
          }
          return nextDraft;
        });
        setGalleryUrlsText((prev) => {
          const lines = prev.split('\n').map((s) => s.trim()).filter((u) => u && u !== serverUrl);
          return [serverUrl, ...lines].join('\n');
        });
      },
      editingPhoneId || undefined
    );
    e.target.value = '';
  };

  // Handler for uploading image inside Full Specs Editor
  const handleSpecPhoneFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !specPhoneDraft) return;
    handleDirectFileUploadToServer(
      file,
      'phone',
      `${specPhoneDraft.name} Render`,
      (serverUrl) => {
        setSpecPhoneDraft((prev) => {
          if (!prev) return prev;
          const nextSpec = {
            ...prev,
            image: serverUrl,
            images: [serverUrl, ...(prev.images || []).filter((u) => u !== serverUrl)],
          };
          updatePhone(nextSpec);
          return nextSpec;
        });
      },
      specPhoneDraft.id
    );
    e.target.value = '';
  };

  // Handler for 2. Saving Full Specifications in Dedicated Specs Tab
  const handleSaveFullSpecs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specPhoneDraft) return;
    const ramArr = specRamText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const storageArr = specStorageText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedSpecNgn = specNgnText.trim() !== '' ? parseFloat(specNgnText) : NaN;
    const parsedSpecUsd = specUsdText.trim() !== '' ? parseFloat(specUsdText) : NaN;
    const priceNGN = !Number.isNaN(parsedSpecNgn) ? parsedSpecNgn : 0;
    const priceUSD = !Number.isNaN(parsedSpecUsd) ? parsedSpecUsd : (priceNGN > 0 ? Math.round(priceNGN / 1500) : 0);
    const computedPriceRange: Phone['priceRange'] =
      priceNGN < 100000
        ? 'under100k'
        : priceNGN <= 200000
        ? '100k-200k'
        : priceNGN <= 350000
        ? '200k-350k'
        : priceNGN <= 600000
        ? '350k-600k'
        : priceNGN <= 1200000
        ? '600k-1.2m'
        : 'flagship';

    const yearMatch = (specPhoneDraft.releaseDate || '').match(/\b(19\d{2}|20\d{2})\b/);
    const derivedReleaseYear = yearMatch
      ? Number(yearMatch[1])
      : Number(specPhoneDraft.releaseYear) || new Date().getFullYear();

    const primaryImg = (specPhoneDraft.image || '').trim();
    const updated: Phone = {
      ...specPhoneDraft,
      priceNGN,
      priceUSD,
      priceRange: computedPriceRange,
      releaseYear: derivedReleaseYear,
      image: primaryImg,
      images: primaryImg
        ? [primaryImg, ...(specPhoneDraft.images || []).filter((u) => u !== primaryImg)]
        : specPhoneDraft.images,
      keyHighlights: {
        ...specPhoneDraft.keyHighlights,
        ram: specPhoneDraft.keyHighlights.ram || ramArr.join(' / ') || '',
        storage: specPhoneDraft.keyHighlights.storage || storageArr.join(' / ') || '',
      },
      detailedSpecs: {
        ...specPhoneDraft.detailedSpecs,
        memory: {
          ...specPhoneDraft.detailedSpecs.memory,
          ramVariants: ramArr.length > 0 ? ramArr : ['8GB'],
          storageVariants: storageArr.length > 0 ? storageArr : ['256GB'],
        },
      },
      updatedAt: Date.now(),
    } as Phone;
    runWithProgress(() => {
      updatePhone(updated);
    }, `Saved all specifications, image & SEO for ${updated.name}.`);
  };

  // Handler for 5. Media Library Upload (writes file to server /uploads directory & optionally assigns to selected phone)
  const handleMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetPhoneId = mediaUploadAssignPhoneId || undefined;
    handleDirectFileUploadToServer(
      file,
      newImageCategory,
      newImageTitle.trim() || file.name,
      (serverUrl) => {
        setNewImageTitle('');
        if (targetPhoneId) {
          handleAssignImageToPhone(serverUrl, targetPhoneId);
        }
      },
      targetPhoneId
    );
    e.target.value = '';
  };

  const handleAddImageUrlToLibrary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    const cleanUrl = newImageUrl.trim();
    const targetPhoneId = mediaUploadAssignPhoneId || undefined;
    const asset: MediaAssetItem = {
      id: `media-${Date.now()}`,
      name: newImageTitle.trim() || 'Media Library Asset',
      url: cleanUrl,
      category: newImageCategory,
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      assignedPhoneId: targetPhoneId,
    };
    runWithProgress(() => {
      addMediaItem(asset);
      if (targetPhoneId) {
        const target = phones.find((p) => p.id === targetPhoneId);
        if (target) {
          updatePhone({
            ...target,
            image: cleanUrl,
            images: [cleanUrl, ...(target.images || []).filter((u) => u !== cleanUrl)],
          });
        }
      }
      setNewImageUrl('');
      setNewImageTitle('');
    }, targetPhoneId ? 'Added image to Media Library and assigned to phone!' : 'Added image to persistent Media Library.');
  };

  const handleAssignImageToPhone = (imageUrl: string, phoneId: string) => {
    const target = phones.find((p) => p.id === phoneId);
    if (!target) return;
    const updatedPhone: Phone = {
      ...target,
      image: imageUrl,
      images: [imageUrl, ...(target.images || []).filter((u) => u !== imageUrl)],
    };
    runWithProgress(() => {
      updatePhone(updatedPhone);
      if (editingPhoneId === phoneId) {
        setPhoneDraft((prev) => ({
          ...prev,
          image: imageUrl,
          images: [imageUrl, ...(prev.images || []).filter((u) => u !== imageUrl)],
        }));
      }
      if (specPhoneDraft && specPhoneDraft.id === phoneId) {
        setSpecPhoneDraft((prev) =>
          prev
            ? {
                ...prev,
                image: imageUrl,
                images: [imageUrl, ...(prev.images || []).filter((u) => u !== imageUrl)],
              }
            : prev
        );
      }
    }, `Assigned image to ${target.name} (live on site).`);
  };

  // Handler for 4. Brands
  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name.trim()) return;
    const slug = brandForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload: Brand = {
      id: editingBrandId || slug,
      name: brandForm.name.trim(),
      slug,
      logoLetter: brandForm.name.trim().charAt(0).toUpperCase(),
      logoUrl: brandForm.logoUrl.trim() || undefined,
      accentBg: brandForm.accentBg || 'from-emerald-900/40 to-slate-900',
      country: brandForm.country || 'Global',
      description: brandForm.description || `${brandForm.name} official smartphones and devices.`,
      officialPresenceInNigeria: brandForm.officialPresenceInNigeria || 'Official Retail & Warranty Partner',
      globalPresence: brandForm.globalPresence || 'Worldwide Distribution',
      popularSeries: brandForm.popularSeries
        ? brandForm.popularSeries.split(',').map((s) => s.trim()).filter(Boolean)
        : [`${brandForm.name} Series`],
      warrantyPartner: brandForm.warrantyPartner || 'Authorized Service Center',
      seoTitle: brandForm.seoTitle.trim() || `${brandForm.name.trim()} Phones, Specs & Prices`,
      seoKeywords:
        brandForm.seoKeywords.trim() ||
        `${brandForm.name.trim()} phones, ${brandForm.name.trim()} price in Nigeria, ${brandForm.name.trim()} specs`,
    };

    runWithProgress(() => {
      if (editingBrandId) {
        updateBrand(payload);
      } else {
        addBrand(payload);
      }
      setEditingBrandId(null);
      setBrandForm({
        name: '',
        country: '',
        description: '',
        popularSeries: '',
        warrantyPartner: '',
        officialPresenceInNigeria: 'Yes — Official Retail & Service Centers',
        globalPresence: 'Global Distribution',
        accentBg: 'from-emerald-900/40 to-slate-900',
        logoUrl: '',
        seoTitle: '',
        seoKeywords: '',
      });
    }, editingBrandId ? `Updated brand "${payload.name}".` : `Created brand "${payload.name}".`);
  };

  // Handler for 6. Articles / News / Guides / Reviews
  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title.trim()) return;
    const slug = articleForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tagsArr = articleForm.tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const computedSeoTitle =
      articleForm.seoTitle.trim() || articleForm.title.trim();
    const computedSeoKeywords =
      articleForm.seoKeywords.trim() ||
      (tagsArr.length > 0 ? tagsArr.join(', ') : `${articleForm.category}, Smartphones, GsmScope`);
    const computedSeoDesc =
      articleForm.seoDescription.trim() || articleForm.summary.trim() || articleForm.title.trim();

    if (editingArticleId) {
      const existing = articles.find((a) => a.id === editingArticleId);
      if (!existing) return;
      const updated: Article = {
        ...existing,
        title: articleForm.title.trim(),
        category: articleForm.category,
        summary: articleForm.summary || articleForm.title.trim(),
        content: articleForm.content || articleForm.summary,
        coverImage: articleForm.coverImage,
        readTime: articleForm.readTime,
        tags: tagsArr,
        featured: articleForm.featured,
        relatedPhoneIds: articleForm.relatedPhoneId ? [articleForm.relatedPhoneId] : [],
        seoTitle: computedSeoTitle,
        seoKeywords: computedSeoKeywords,
        seoDescription: computedSeoDesc,
        author: {
          name: articleForm.authorName || existing.author.name,
          role: articleForm.authorRole || existing.author.role,
        },
        updatedAt: Date.now(),
      } as Article;
      runWithProgress(() => {
        updateArticle(updated);
        setEditingArticleId(null);
        setArticleForm({
          title: '',
          category: 'News',
          summary: '',
          content: '',
          coverImage: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
          readTime: '4 min read',
          tags: 'Smartphone, Launch, Specs',
          featured: false,
          relatedPhoneId: '',
          authorName: 'GsmScope Editorial',
          authorRole: 'Senior Hardware Editor',
          seoTitle: '',
          seoKeywords: '',
          seoDescription: '',
        });
      }, `Updated article "${updated.title}".`);
    } else {
      const created: Article = {
        id: `art-${Date.now()}`,
        title: articleForm.title.trim(),
        slug,
        category: articleForm.category,
        summary: articleForm.summary || articleForm.title.trim(),
        content: articleForm.content || articleForm.summary || articleForm.title.trim(),
        author: {
          name: articleForm.authorName || 'GsmScope Editorial',
          role: articleForm.authorRole || 'Senior Hardware Editor',
        },
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: articleForm.readTime || '4 min read',
        coverImage: articleForm.coverImage || '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
        tags: tagsArr.length > 0 ? tagsArr : ['News', 'Smartphones'],
        featured: articleForm.featured,
        viewsCount: 0,
        relatedPhoneIds: articleForm.relatedPhoneId ? [articleForm.relatedPhoneId] : [],
        seoTitle: computedSeoTitle,
        seoKeywords: computedSeoKeywords,
        seoDescription: computedSeoDesc,
      };

      runWithProgress(() => {
        addArticle(created);
        setArticleForm({
          title: '',
          category: 'News',
          summary: '',
          content: '',
          coverImage: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
          readTime: '4 min read',
          tags: 'Smartphone, Launch, Specs',
          featured: false,
          relatedPhoneId: '',
          authorName: 'GsmScope Editorial',
          authorRole: 'Senior Hardware Editor',
          seoTitle: '',
          seoKeywords: '',
          seoDescription: '',
        });
      }, `Published "${created.title}".`);
    }
  };

  // Handler for 7. Creating or Updating a Review from Admin
  const handleCreateAdminReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;
    const phoneObj = phones.find((p) => p.id === reviewForm.phoneId) || phones[0];
    const existingRev = editingReviewId ? reviews.find((r) => r.id === editingReviewId) : null;
    const newRev: Review = {
      id: existingRev ? existingRev.id : `rev-${Date.now()}`,
      phoneId: phoneObj?.id || reviewForm.phoneId,
      phoneName: phoneObj?.name || '',
      userName: reviewForm.userName.trim() || 'Verified Reviewer',
      location: reviewForm.location.trim() || 'Lagos',
      rating: Number(reviewForm.rating) || 5,
      title: reviewForm.title.trim() || `${phoneObj?.name || 'Device'} Review`,
      comment: reviewForm.comment.trim(),
      pros: reviewForm.pros
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      cons: reviewForm.cons
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      date: existingRev?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      verifiedBuyer: existingRev ? existingRev.verifiedBuyer : true,
      status: existingRev ? existingRev.status : 'approved',
      imageUrl: reviewForm.imageUrl.trim() || undefined,
      seoTitle:
        reviewForm.seoTitle.trim() ||
        `${phoneObj?.name || 'Smartphone'} Review: ${reviewForm.title.trim() || 'Hands-On Verdict'}`,
      seoKeywords:
        reviewForm.seoKeywords.trim() ||
        `${phoneObj?.name || 'Smartphone'} review, ${phoneObj?.brand || ''} user review, camera test, battery life`,
    };

    runWithProgress(
      () => {
        if (existingRev) {
          updateReview(newRev);
        } else {
          addReview(newRev);
        }
        setEditingReviewId(null);
        setShowReviewForm(false);
        setReviewForm({
          phoneId: phones[0]?.id || '',
          userName: 'GsmScope Lab Reviewer',
          location: 'Lagos / Global Lab',
          rating: 5,
          title: '',
          comment: '',
          pros: 'Display brightness, Battery endurance, Fast charging',
          cons: 'Premium retail price',
          imageUrl: '',
          seoTitle: '',
          seoKeywords: '',
        });
      },
      existingRev
        ? `Updated review for ${phoneObj?.name || 'device'}.`
        : `Published review for ${phoneObj?.name || 'device'}.`
    );
  };

  // Filtered phones for table
  const filteredAdminPhones = phones.filter((p) => {
    const q = phoneSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.modelNumber || '').toLowerCase().includes(q) ||
      p.keyHighlights.processor.toLowerCase().includes(q);
    const matchesBrand = phoneBrandFilter === 'ALL' || p.brand === phoneBrandFilter;
    return matchesSearch && matchesBrand;
  });

  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;

  const MENU_ITEMS: {
    id: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    group: string;
    subItems?: { label: string; onClick: () => void; active?: boolean }[];
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'CORE' },
    {
      id: 'stats',
      label: 'Stats',
      icon: BarChart3,
      group: 'CORE',
      subItems: [
        {
          label: 'Overview',
          onClick: () => {
            setSection('stats');
            setStatsTab('overview');
          },
          active: section === 'stats' && statsTab === 'overview',
        },
        {
          label: 'Posts',
          onClick: () => {
            setSection('stats');
            setStatsTab('posts');
          },
          active: section === 'stats' && statsTab === 'posts',
        },
        {
          label: 'Traffic Sources',
          onClick: () => {
            setSection('stats');
            setStatsTab('sources');
          },
          active: section === 'stats' && statsTab === 'sources',
        },
        {
          label: 'Audience',
          onClick: () => {
            setSection('stats');
            setStatsTab('audience');
          },
          active: section === 'stats' && statsTab === 'audience',
        },
      ],
    },
    {
      id: 'phones',
      label: 'Phones Catalog',
      icon: Smartphone,
      badge: phones.length,
      group: 'CONTENT & CATALOG',
      subItems: [
        {
          label: `All Phones (${phones.length})`,
          onClick: () => {
            setSection('phones');
            setShowPhoneForm(false);
          },
          active: section === 'phones' && !showPhoneForm,
        },
        {
          label: '+ Add New Phone',
          onClick: () => openCreatePhoneForm(),
          active: section === 'phones' && showPhoneForm && !editingPhoneId,
        },
        {
          label: 'Update Phone Prices',
          onClick: () => setSection('pricing'),
          active: section === 'pricing',
        },
        {
          label: 'Featured Spotlights',
          onClick: () => setSection('featured'),
          active: section === 'featured',
        },
      ],
    },
    { id: 'pricing', label: 'Phone Prices', icon: DollarSign, group: 'CONTENT & CATALOG' },
    {
      id: 'featured',
      label: 'Best & Compare Phones',
      icon: Star,
      group: 'CONTENT & CATALOG',
      subItems: [
        {
          label: 'All Best Phones & Spotlights',
          onClick: () => {
            setSection('featured');
            setFeaturedCategoryFilter('all');
          },
          active: section === 'featured' && featuredCategoryFilter === 'all',
        },
        {
          label: 'Best Phones Overall',
          onClick: () => {
            setSection('featured');
            setFeaturedCategoryFilter('top-rated');
          },
          active: section === 'featured' && featuredCategoryFilter === 'top-rated',
        },
        {
          label: 'Best Camera Phones',
          onClick: () => {
            setSection('featured');
            setFeaturedCategoryFilter('best-camera');
          },
          active: section === 'featured' && featuredCategoryFilter === 'best-camera',
        },
        {
          label: 'Best Gaming Phones',
          onClick: () => {
            setSection('featured');
            setFeaturedCategoryFilter('best-gaming');
          },
          active: section === 'featured' && featuredCategoryFilter === 'best-gaming',
        },
        {
          label: 'Best Battery Phones',
          onClick: () => {
            setSection('featured');
            setFeaturedCategoryFilter('best-battery');
          },
          active: section === 'featured' && featuredCategoryFilter === 'best-battery',
        },
        {
          label: 'Best 5G Phones',
          onClick: () => {
            setSection('featured');
            setFeaturedCategoryFilter('best-5g');
          },
          active: section === 'featured' && featuredCategoryFilter === 'best-5g',
        },
      ],
    },
    { id: 'brands', label: 'Brand Directory', icon: Layers, badge: brands.length, group: 'CONTENT & CATALOG' },
    { id: 'media', label: 'Media Library', icon: ImageIcon, badge: mediaLibrary.length, group: 'CONTENT & CATALOG' },
    {
      id: 'news',
      label: 'News, Guides & Reviews',
      icon: FileText,
      badge: articles.length,
      group: 'CONTENT & CATALOG',
      subItems: [
        {
          label: `All Posts (${articles.length})`,
          onClick: () => {
            setSection('news');
            setArticleCategoryFilter('all');
          },
          active: section === 'news' && articleCategoryFilter === 'all',
        },
        {
          label: 'News & Articles',
          onClick: () => {
            setSection('news');
            setArticleCategoryFilter('news');
          },
          active: section === 'news' && articleCategoryFilter === 'news',
        },
        {
          label: 'Buying Guide',
          onClick: () => {
            setSection('news');
            setArticleCategoryFilter('guides');
          },
          active: section === 'news' && articleCategoryFilter === 'guides',
        },
        {
          label: 'Review Articles',
          onClick: () => {
            setSection('news');
            setArticleCategoryFilter('reviews');
          },
          active: section === 'news' && articleCategoryFilter === 'reviews',
        },
      ],
    },
    {
      id: 'reviews',
      label: 'User Reviews',
      icon: MessageSquare,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : reviews.length,
      group: 'CONTENT & CATALOG',
      subItems: [
        {
          label: `All User Reviews (${reviews.length})`,
          onClick: () => {
            setSection('reviews');
            setReviewFilter('all');
          },
          active: section === 'reviews' && reviewFilter === 'all' && !showReviewForm,
        },
        {
          label: `Pending (${pendingReviewsCount})`,
          onClick: () => {
            setSection('reviews');
            setReviewFilter('pending');
          },
          active: section === 'reviews' && reviewFilter === 'pending',
        },
        {
          label: '+ Add User Review',
          onClick: () => {
            setSection('reviews');
            setEditingReviewId(null);
            setShowReviewForm(true);
          },
          active: section === 'reviews' && showReviewForm,
        },
      ],
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: Mail,
      badge: contactInquiries.length > 0 ? contactInquiries.length : undefined,
      group: 'COMMUNICATIONS & AUDIENCE',
    },

    {
      id: 'specs',
      label: 'Full Phone Specs',
      icon: Sliders,
      group: 'SPECS & SCHEMA',
      subItems: [
        {
          label: 'Edit Phone Specs (12 Tables)',
          onClick: () => setSection('specs'),
          active: section === 'specs',
        },
        {
          label: 'Spec Tables & Subtables',
          onClick: () => setSection('spec-tables'),
          active: section === 'spec-tables',
        },
      ],
    },
    { id: 'spec-tables', label: 'Spec Tables & Subtables', icon: Table2, group: 'SPECS & SCHEMA' },
    { id: 'users', label: 'Users & Roles', icon: Users, badge: usersList.length, group: 'USERS & ACCESS' },
    {
      id: 'content',
      label: 'Site Branding & SEO',
      icon: Globe,
      group: 'SETTINGS & SYSTEM',
    },
    { id: 'ads', label: 'Advertisements', icon: Megaphone, group: 'SETTINGS & SYSTEM' },
    { id: 'scripts', label: 'Header / Footer Scripts', icon: Code2, group: 'SETTINGS & SYSTEM' },
    { id: 'backup', label: 'Database & Backup', icon: Database, group: 'SETTINGS & SYSTEM' },
  ];

  // Reusable Full Specification Fields Renderer (used in BOTH Add/Edit Phone AND Full Specs Editor)
  const renderAllSpecificationMetaBoxes = (
    draft: Phone,
    setDraft: React.Dispatch<React.SetStateAction<any>>,
    ramStr: string,
    setRamStr: (v: string) => void,
    storageStr: string,
    setStorageStr: (v: string) => void
  ) => {
    const updateHighlight = (key: keyof Phone['keyHighlights'], value: any) => {
      setDraft((prev: Phone) => ({
        ...prev,
        keyHighlights: {
          ...prev.keyHighlights,
          [key]: value,
        },
      }));
    };

    const BUILTIN_GENERAL_KEYS = new Set([
      'releaseDate',
      'modelNumber',
      'marketStatus',
      'priceUSD / priceNGN',
    ]);

    const dynamicTablesToRender = specTablesSchema
      .filter((group) => group.enabled !== false)
      .map((group) => {
        const isGeneralGroup = group.code === 'general' || group.id === 'tbl-general';
        const enabledSubs = (group.subtables || []).filter((sub) => {
          if (sub.enabled === false) return false;
          // In Section 1 & Section 2, the 4 built-in GENERAL fields are rendered in the top identity/general card
          // (respecting isGeneralSubtableEnabled), while any custom subtables added to GENERAL render right here.
          if (isGeneralGroup && BUILTIN_GENERAL_KEYS.has(sub.keyPath)) {
            return false;
          }
          return true;
        });
        return {
          ...group,
          enabledSubs,
        };
      })
      .filter((group) => group.enabledSubs.length > 0);

    return (
      <div className="space-y-5">
        {/* META BOX A: KEY HIGHLIGHTS (AT-A-GLANCE CARD & HERO SUMMARY) */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
              1. KEY HIGHLIGHTS (AT-A-GLANCE SUMMARY CARDS & OVERVIEW)
            </h3>
            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(draft.keyHighlights.network5g)}
                onChange={(e) => updateHighlight('network5g', e.target.checked)}
                className="accent-emerald-600"
              />
              <span>5G Enabled Badge</span>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Display Highlight</label>
              <input
                type="text"
                value={draft.keyHighlights.display}
                onChange={(e) => updateHighlight('display', e.target.value)}
                placeholder='e.g. 6.8" Dynamic AMOLED 2X, 120Hz'
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Processor / Chipset Highlight</label>
              <input
                type="text"
                value={draft.keyHighlights.processor}
                onChange={(e) => updateHighlight('processor', e.target.value)}
                placeholder="e.g. Snapdragon 8 Gen 3 (4 nm)"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Camera Highlight</label>
              <input
                type="text"
                value={draft.keyHighlights.camera}
                onChange={(e) => updateHighlight('camera', e.target.value)}
                placeholder="e.g. 200MP Quad Telephoto OIS"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Operating System Highlight</label>
              <input
                type="text"
                value={draft.keyHighlights.os}
                onChange={(e) => updateHighlight('os', e.target.value)}
                placeholder="e.g. Android 15, One UI 7"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">RAM Summary</label>
              <input
                type="text"
                value={draft.keyHighlights.ram}
                onChange={(e) => updateHighlight('ram', e.target.value)}
                placeholder="e.g. 12GB / 16GB"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Storage Summary</label>
              <input
                type="text"
                value={draft.keyHighlights.storage}
                onChange={(e) => updateHighlight('storage', e.target.value)}
                placeholder="e.g. 256GB / 512GB / 1TB"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Battery Summary</label>
              <input
                type="text"
                value={draft.keyHighlights.battery}
                onChange={(e) => updateHighlight('battery', e.target.value)}
                placeholder="e.g. 5000 mAh"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* DYNAMIC SPECIFICATION TABLES DRIVEN BY specTablesSchema */}
        {dynamicTablesToRender.map((group, groupIdx) => {
          const subNames = group.enabledSubs.map((s) => s.label).join(', ');
          return (
            <div
              key={group.id}
              className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
                  {groupIdx + 2}. {group.title} ({subNames})
                </h3>
                <button
                  type="button"
                  onClick={() => setSection('spec-tables')}
                  className="text-[10px] font-mono text-slate-400 hover:text-emerald-500 cursor-pointer"
                  title="Manage or reorder tables & subtables"
                >
                  Manage Subtables →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.enabledSubs.map((sub) => {
                  if (sub.keyPath === 'memory.ramVariants') {
                    return (
                      <div key={sub.id}>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          {sub.label} (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={ramStr}
                          onChange={(e) => setRamStr(e.target.value)}
                          placeholder={getSpecPlaceholder(sub.keyPath, sub.label)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                        />
                      </div>
                    );
                  }

                  if (sub.keyPath === 'memory.storageVariants') {
                    return (
                      <div key={sub.id}>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          {sub.label} (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={storageStr}
                          onChange={(e) => setStorageStr(e.target.value)}
                          placeholder={getSpecPlaceholder(sub.keyPath, sub.label)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                        />
                      </div>
                    );
                  }

                  const isWideField =
                    sub.keyPath === 'mainCamera.setup' ||
                    sub.keyPath === 'platform.cpu' ||
                    sub.keyPath === 'sensors';

                  return (
                    <div key={sub.id} className={isWideField ? 'sm:col-span-2' : ''}>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        {sub.label}
                      </label>
                      <input
                        type="text"
                        value={getPhoneSpecEditorValue(draft, sub.keyPath)}
                        onChange={(e) =>
                          setDraft((prev: Phone) =>
                            setPhoneSpecEditorValue(prev, sub.keyPath, e.target.value)
                          )
                        }
                        placeholder={getSpecPlaceholder(sub.keyPath, sub.label)}
                        className={`w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs ${
                          sub.keyPath === 'platform.antutuScore' ? 'font-mono' : ''
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* META BOX K: SEO TITLE, FOCUS KEYWORDS & META DESCRIPTION */}
        <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>11. SEO TITLE, FOCUS KEYWORDS &amp; SEARCH META DESCRIPTION</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                SEO Title (&lt;title&gt; &amp; OpenGraph Title)
              </label>
              <input
                type="text"
                value={draft.seoTitle || ''}
                onChange={(e) =>
                  setDraft((prev: Phone) => ({
                    ...prev,
                    seoTitle: e.target.value,
                  }))
                }
                placeholder={`${draft.name || 'Phone Model'} Full Specifications & Price`}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                SEO Focus Keywords (comma-separated &lt;meta name="keywords"&gt;)
              </label>
              <input
                type="text"
                value={draft.seoKeywords || ''}
                onChange={(e) =>
                  setDraft((prev: Phone) => ({
                    ...prev,
                    seoKeywords: e.target.value,
                  }))
                }
                placeholder={`${draft.name || 'Phone'}, ${draft.brand || 'Brand'} specs, price in Nigeria, USD price, 5G phone`}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                SEO Meta Description (&lt;meta name="description"&gt;)
              </label>
              <textarea
                rows={2}
                value={draft.seoDescription || ''}
                onChange={(e) =>
                  setDraft((prev: Phone) => ({
                    ...prev,
                    seoDescription: e.target.value,
                  }))
                }
                placeholder="Custom search engine snippet describing key specs, camera, battery, and verified market price..."
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#f0f0f1] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* =====================================================================
          WORDPRESS-STYLE TOP ADMIN BAR (wp-admin bar)
      ===================================================================== */}
      <header className="h-12 bg-[#1d2327] text-slate-200 flex items-center justify-between px-3 sm:px-5 sticky top-0 z-40 border-b border-slate-800 select-none">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center py-1">
            <img
              src={adminBarLogoUrl}
              alt={websiteContent.siteName || 'GsmScope'}
              className="h-7 sm:h-8 w-auto object-contain select-none"
            />
          </div>


          <button
            onClick={() => {
              startGlobalLoading();
              setSelectedPhone(null);
              setActiveTab('home');
              setTimeout(() => stopGlobalLoading(), 250);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title="Visit Public Website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Visit Site</span>
          </button>

          {/* + New Quick Action Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNewMenuOpen(!newMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-800 text-xs font-semibold text-emerald-400 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            {newMenuOpen && (
              <div
                onMouseLeave={() => setNewMenuOpen(false)}
                className="absolute left-0 mt-1 w-44 bg-[#2c3338] border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs text-slate-200"
              >
                <button
                  onClick={() => {
                    setNewMenuOpen(false);
                    openCreatePhoneForm();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-600 hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Phone Device</span>
                </button>
                <button
                  onClick={() => {
                    setNewMenuOpen(false);
                    setSection('news');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-600 hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>News / Article</span>
                </button>
                <button
                  onClick={() => {
                    setNewMenuOpen(false);
                    setSection('media');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-600 hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Media Image</span>
                </button>
                <button
                  onClick={() => {
                    setNewMenuOpen(false);
                    setSection('brands');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-600 hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Brand</span>
                </button>
                <button
                  onClick={() => {
                    setNewMenuOpen(false);
                    setSection('users');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-600 hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>User Account</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setSection('messages')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-800 text-xs text-slate-300 cursor-pointer"
            title="Messages"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>Messages</span>
            {contactInquiries.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-white text-[10px] font-bold">
                {contactInquiries.length}
              </span>
            )}
          </button>



          <button
            onClick={() => setSection('stats')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-800 text-xs text-slate-300 cursor-pointer"
            title="Website Stats"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#00a950]" />
            <span>Stats</span>
          </button>

          <button
            onClick={() => setSection('reviews')}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-800 text-xs text-slate-300 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>{pendingReviewsCount} Pending</span>
          </button>
        </div>

        {/* Right Admin Bar Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
            title="Toggle Light / Dark Admin Workspace"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 px-2 py-1 rounded bg-slate-800/70">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Howdy, <strong>Administrator</strong></span>
          </div>

          <button
            onClick={() => {
              adminLogout();
              setActiveTab('admin');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-800 text-rose-200 border border-rose-700/50 text-xs font-semibold cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          MAIN BODY: PERSISTENT LEFT WP-ADMIN SIDEBAR + FULL CONTENT WORKSPACE
      ===================================================================== */}
      <div className="flex-1 flex relative items-start">
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-12 bg-black/60 z-30 lg:hidden"
          />
        )}
        <aside
          aria-label="WordPress Admin Navigation Sidebar"
          className={`${
            mobileMenuOpen ? 'fixed inset-y-12 left-0 z-40 w-64 flex' : 'hidden lg:flex'
          } ${
            sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
          } lg:sticky lg:top-12 lg:h-[calc(100vh-3rem)] bg-[#1d2327] text-slate-300 flex-col justify-between border-r border-slate-800 shrink-0 transition-all duration-200 select-none`}
        >
          <div className="py-3 overflow-y-auto space-y-4 flex-1">
            {['CORE', 'CONTENT & CATALOG', 'COMMUNICATIONS & AUDIENCE', 'SPECS & SCHEMA', 'USERS & ACCESS', 'SETTINGS & SYSTEM'].map((grp) => {
              const items = MENU_ITEMS.filter((i) => i.group === grp);
              return (
                <div key={grp}>
                  {!sidebarCollapsed && (
                    <div className="px-4 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                      {grp}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive = section === item.id;
                      const showSubItems =
                        !sidebarCollapsed &&
                        item.subItems &&
                        (isActive ||
                          (item.id === 'phones' && ['phones', 'pricing', 'featured'].includes(section)) ||
                          (item.id === 'specs' && ['specs', 'spec-tables'].includes(section)));
                      return (
                        <div key={item.id}>
                          <button
                            onClick={() => {
                              setSection(item.id);
                              setMobileMenuOpen(false);
                              window.scrollTo({ top: 0, behavior: 'instant' });
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer border-l-4 ${
                              isActive
                                ? 'bg-emerald-600/20 border-emerald-500 text-white font-semibold'
                                : 'border-transparent text-slate-300 hover:bg-[#2c3338] hover:text-emerald-400'
                            }`}
                            title={item.label}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                            </div>
                            {!sidebarCollapsed && item.badge !== undefined && (
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  isActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </button>

                          {showSubItems && (
                            <div className="bg-[#161b1e] py-1 pl-10 pr-3 space-y-0.5 border-l-4 border-emerald-500/40">
                              {item.subItems!.map((sub, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    sub.onClick();
                                    setMobileMenuOpen(false);
                                  }}
                                  className={`w-full text-left py-1.5 px-2 rounded text-[11px] transition-colors cursor-pointer block ${
                                    sub.active
                                      ? 'text-emerald-400 font-bold bg-slate-800/60'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {sub.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-slate-800 hidden lg:block bg-[#161b1e]">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
              {!sidebarCollapsed && <span>Collapse menu</span>}
            </button>
          </div>
        </aside>

        {/* MAIN ADMIN WORKSPACE */}
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* =================================================================
              SECTION 0: DASHBOARD OVERVIEW
          ================================================================= */}
          {section === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Dashboard
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Administration Panel.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSection('stats')}
                    className="px-3.5 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#00a950' }}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Website Stats</span>
                  </button>
                  <button
                    onClick={openCreatePhoneForm}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Phone</span>
                  </button>
                  <button
                    onClick={() => setSection('specs')}
                    className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-semibold cursor-pointer"
                  >
                    Full Specs Editor
                  </button>
                  <button
                    onClick={() => setSection('pricing')}
                    className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-semibold cursor-pointer"
                  >
                    Update Prices
                  </button>
                </div>
              </div>

              {/* At a Glance Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div
                  onClick={() => setSection('phones')}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Smartphones</span>
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                    {phones.length}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                    {phones.filter((p) => p.isFeatured).length} Featured · {phones.filter((p) => p.keyHighlights.network5g).length} 5G
                  </div>
                </div>

                <div
                  onClick={() => setSection('brands')}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Brands</span>
                    <Layers className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                    {brands.length}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">Active profiles</div>
                </div>

                <div
                  onClick={() => setSection('news')}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>News & Posts</span>
                    <FileText className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                    {articles.length}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">
                    {articles.filter((a) => a.featured).length} Featured
                  </div>
                </div>

                <div
                  onClick={() => setSection('reviews')}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Reviews</span>
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                    {reviews.length}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 truncate">
                    {pendingReviewsCount} pending review
                  </div>
                </div>

                <div
                  onClick={() => setSection('messages')}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Messages</span>
                    <Mail className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                    {contactInquiries.length}
                  </div>
                  <div className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-1 truncate">
                    Received messages
                  </div>
                </div>

                <div
                  onClick={() => setSection('stats')}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00a950] shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Website Stats</span>
                    <BarChart3 className="w-4 h-4 text-[#00a950]" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                    {overviewStatsTotal.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#00a950] mt-1 truncate">
                    Traffic, Posts & Audience
                  </div>
                </div>
              </div>

              {/* Recent Published Phones Quick Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                    Published
                  </h2>
                  <button
                    onClick={() => setSection('phones')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Manage All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {phones.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-900" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 price-value-tight">
                            {formatUSD(p.priceUSD)} / {formatNaira(p.priceNGN)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewPhoneOnPublicSite(p)}
                        className="p-1.5 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white cursor-pointer shrink-0"
                        title="View on Public Site"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>


              {/* Management Modules Quick Access Grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 font-mono">
                  Management Modules
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: 'stats', title: 'Website Stats Dashboard', desc: 'Blogger-style traffic overview, popular posts, traffic sources & audience', icon: BarChart3 },
                    { id: 'phones', title: 'Add / Edit / Delete Phones', desc: 'Full device publisher with all 12 spec tables & gallery', icon: Smartphone },
                    { id: 'specs', title: 'Add & Update Specifications', desc: 'Edit every hardware spec field across all 12 tables', icon: Sliders },
                    { id: 'pricing', title: 'Update Phone Prices', desc: 'Instant USD ($), NGN (₦), old price & price notes', icon: DollarSign },
                    { id: 'brands', title: 'Add / Manage Brands', desc: 'Create & edit smartphone brands and warranty info', icon: Layers },
                    { id: 'media', title: 'Upload Phone Images', desc: 'Upload local device images or URLs and assign to phones', icon: ImageIcon },
                    { id: 'news', title: 'Publish & Manage News/Articles', desc: 'Write reviews, news stories, and buyer guides', icon: FileText },
                    { id: 'reviews', title: 'Manage Reviews / Comments', desc: 'Approve, reject, or delete community device reviews', icon: MessageSquare },
                    { id: 'featured', title: 'Manage Featured Phones', desc: 'Control homepage hero carousel & category badges', icon: Star },
                    { id: 'ads', title: 'Manage Advertisements & Placements', desc: 'Control 8 page ad placements, Learn More buttons & script ad codes', icon: Megaphone },
                    { id: 'content', title: 'Site Branding & Global SEO', desc: 'Edit logos, favicon, global SEO title/keywords, contact details & footer text', icon: Globe },
                    { id: 'spec-tables', title: 'Manage Spec Tables & Subtables', desc: 'Customize specification table headings, order & subfields', icon: Table2 },
                    { id: 'users', title: 'Manage Users & Roles', desc: 'Add/remove administrators, editors, authors & moderators', icon: Users },
                    { id: 'scripts', title: 'Header / Body / Footer Scripts', desc: 'Manage meta verification tags, analytics & custom code', icon: Code2 },
                    { id: 'messages', title: 'Messages', desc: 'Receive, read, and delete incoming messages', icon: Mail },
                  ].map((cap) => {
                    const Icon = cap.icon;
                    return (
                      <button
                        key={cap.id}
                        onClick={() => setSection(cap.id as AdminSection)}
                        className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-950/60 text-left transition-all cursor-pointer group"
                      >
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {cap.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {cap.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 0B: WEBSITE STATS DASHBOARD (BLOGGER-STYLE STATS)
          ================================================================= */}
          {section === 'stats' && (
            <WebsiteStatsDashboard
              phones={phones}
              articles={articles}
              initialTab={statsTab}
              onTabChange={setStatsTab}
              onOpenArticleInPublic={(articleId) => {
                const found = articles.find((a) => a.id === articleId);
                if (found) {
                  handleViewArticleOnPublicSite(found);
                }
              }}
              onOpenPhoneInPublic={(phoneId) => {
                const found = phones.find((p) => p.id === phoneId);
                if (found) {
                  handleViewPhoneOnPublicSite(found);
                }
              }}
            />
          )}

          {/* =================================================================
              SECTION 1: ADD / EDIT / DELETE PHONES (WITH ALL SPECS FIELDS)
          ================================================================= */}
          {section === 'phones' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Phones Catalog ({phones.length})
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add new smartphones with complete specifications, edit existing devices, view them live on site, or delete models.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start">
                  <button
                    onClick={() => {
                      if (showPhoneForm) {
                        setShowPhoneForm(false);
                      } else {
                        openCreatePhoneForm();
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{showPhoneForm ? 'Close Phone Publisher' : 'Add New Phone'}</span>
                  </button>
                </div>
              </div>

              {/* COMPLETE ADD / EDIT PHONE FORM WITH ALL 12 SPECIFICATION SECTIONS */}
              {showPhoneForm && (
                <form
                  onSubmit={handleSavePhone}
                  className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                        {editingPhoneId ? `Editing Smartphone: ${phoneDraft.name}` : 'Publish New Smartphone (All Fields & Full Specifications)'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        All fields below map directly to the public Phone Detail Page, Comparison Matrix, and Search Filters.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPhoneForm(false)}
                        className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingPhoneId ? 'Update Phone & Specs' : 'Publish Phone to Site'}</span>
                      </button>
                    </div>
                  </div>


                  {/* GENERAL & PRICING & MEDIA META BOX */}
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
                        0. GENERAL TABLE, IDENTITY, PRICING & MEDIA
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Phone Model Name *</label>
                        <input
                          type="text"
                          required
                          value={phoneDraft.name}
                          onChange={(e) => setPhoneDraft({ ...phoneDraft, name: e.target.value })}
                          placeholder="e.g. Samsung Galaxy S25 Ultra"
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Brand *</label>
                        <input
                          type="text"
                          list="admin-brands-list"
                          required
                          value={phoneDraft.brand}
                          onChange={(e) => setPhoneDraft({ ...phoneDraft, brand: e.target.value })}
                          placeholder="Select or type brand"
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                        />
                        <datalist id="admin-brands-list">
                          {brands.map((b) => (
                            <option key={b.id} value={b.name} />
                          ))}
                        </datalist>
                      </div>
                      {isGeneralSubtableEnabled('modelNumber') && (
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                            {getGeneralSubtableLabel('modelNumber', 'Model Number')} (GENERAL Table)
                          </label>
                          <input
                            type="text"
                            value={phoneDraft.modelNumber || ''}
                            onChange={(e) => setPhoneDraft({ ...phoneDraft, modelNumber: e.target.value })}
                            placeholder="e.g. SM-S928B, SM-S928B/DS"
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                          />
                        </div>
                      )}
                      {isGeneralSubtableEnabled('marketStatus') && (
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                            {getGeneralSubtableLabel('marketStatus', 'Market Status')} (GENERAL Table)
                          </label>
                          <select
                            value={phoneDraft.marketStatus}
                            onChange={(e) => setPhoneDraft({ ...phoneDraft, marketStatus: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                          >
                            <option value="Available">Available</option>
                            <option value="Pre-order">Pre-order</option>
                            <option value="Coming Soon">Coming Soon</option>
                            <option value="Rumored">Rumored</option>
                            <option value="Discontinued">Discontinued</option>
                          </select>
                        </div>
                      )}

                      {isGeneralSubtableEnabled('releaseDate') && (
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                            {getGeneralSubtableLabel('releaseDate', 'Release Date Text')} (GENERAL Table)
                          </label>
                          <input
                            type="text"
                            value={phoneDraft.releaseDate}
                            onChange={(e) => setPhoneDraft({ ...phoneDraft, releaseDate: e.target.value })}
                            placeholder="e.g. January 2025"
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Price (USD $) *</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          required
                          value={phoneUsdText}
                          placeholder="e.g. 299"
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw !== '' && !/^\d*(\.\d*)?$/.test(raw)) return;
                            setPhoneUsdText(raw);
                            const num = parseFloat(raw);
                            setPhoneDraft((prev) => ({
                              ...prev,
                              priceUSD: raw.trim() === '' || Number.isNaN(num) ? 0 : num,
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Price (NGN ₦) *</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          required
                          value={phoneNgnText}
                          placeholder="e.g. 450000"
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw !== '' && !/^\d*(\.\d*)?$/.test(raw)) return;
                            setPhoneNgnText(raw);
                            const num = parseFloat(raw);
                            setPhoneDraft((prev) => ({
                              ...prev,
                              priceNGN: raw.trim() === '' || Number.isNaN(num) ? 0 : num,
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Screen Size (Inches, numeric)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={phoneScreenSizeText}
                          placeholder="e.g. 6.7"
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw !== '' && !/^\d*(\.\d*)?$/.test(raw)) return;
                            setPhoneScreenSizeText(raw);
                            const num = parseFloat(raw);
                            setPhoneDraft((prev) => ({
                              ...prev,
                              screenSizeInches: raw.trim() === '' || Number.isNaN(num) ? undefined : num,
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Primary Image */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                          Primary Phone Feature Image (Upload to /uploads or Pick from Media Library)
                        </label>
                        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                          {phoneDraft.image && (
                            <img
                              src={phoneDraft.image}
                              alt="Preview"
                              className="w-10 h-10 rounded-lg object-contain bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-0.5 shrink-0"
                            />
                          )}
                          <input
                            type="text"
                            value={phoneDraft.image}
                            onChange={(e) => {
                              const nextUrl = e.target.value;
                              setPhoneDraft((prev) => ({
                                ...prev,
                                image: nextUrl,
                                images: nextUrl.trim()
                                  ? [nextUrl.trim(), ...(prev.images || []).filter((u) => u !== nextUrl.trim())]
                                  : prev.images,
                              }));
                            }}
                            placeholder="/uploads/... or https://..."
                            className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                          />
                          <input
                            ref={phoneImageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhoneFormFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => phoneImageInputRef.current?.click()}
                            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                            title="Upload Image File to Server (/uploads)"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openMediaPicker('Select Primary Phone Image', 'phone', (url) => {
                                setPhoneDraft((prev) => {
                                  const nextDraft = {
                                    ...prev,
                                    image: url,
                                    images: [url, ...(prev.images || []).filter((u) => u !== url)],
                                  };
                                  if (editingPhoneId) {
                                    updatePhone({ ...nextDraft, id: editingPhoneId });
                                    showGlobalToast(`Updated primary image for ${nextDraft.name}.`, 'success');
                                  }
                                  return nextDraft;
                                });
                                setGalleryUrlsText((prev) => {
                                  const lines = prev.split('\n').map((s) => s.trim()).filter((u) => u && u !== url);
                                  return [url, ...lines].join('\n');
                                });
                              })
                            }
                            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                            title="Choose from Media Library"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Library</span>
                          </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold uppercase text-slate-500">
                            Additional Gallery Image URLs (1 per line)
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              openMediaPicker('Add Image to Phone Gallery', 'phone', (url) => {
                                setGalleryUrlsText((prev) => (prev.trim() ? `${prev.trim()}\n${url}` : url));
                              })
                            }
                            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>+ Add from Media Library</span>
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={galleryUrlsText}
                          onChange={(e) => setGalleryUrlsText(e.target.value)}
                          placeholder="/uploads/..."
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                          Categories &amp; Guide Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={customCategoriesText}
                          onChange={(e) => setCustomCategoriesText(e.target.value)}
                          placeholder="flagship, best-camera, best-gaming, best-battery, 5g"
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                        />
                        <div className="flex flex-wrap gap-3 mt-2 text-xs">
                          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-emerald-600 dark:text-emerald-400">
                            <input
                              type="checkbox"
                              checked={Boolean(phoneDraft.isFeatured)}
                              onChange={(e) => setPhoneDraft({ ...phoneDraft, isFeatured: e.target.checked })}
                            />
                            <span>Featured Phone (Homepage Spotlight — if unchecked, appears in Latest Phones)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ALL 10 HARDWARE SPECIFICATION META BOXES */}
                  {renderAllSpecificationMetaBoxes(
                    phoneDraft,
                    setPhoneDraft,
                    ramVariantsText,
                    setRamVariantsText,
                    storageVariantsText,
                    setStorageVariantsText
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowPhoneForm(false)}
                        className="px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingPhoneId ? 'Save All Changes' : 'Publish Phone to Website'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    placeholder="Search phones by name, model number, brand, or chipset..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
                <select
                  value={phoneBrandFilter}
                  onChange={(e) => setPhoneBrandFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <option value="ALL">All Brands ({phones.length})</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* WordPress-Style Phones Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-mono uppercase text-slate-500">
                      <th className="py-3 px-4">Device</th>
                      <th className="py-3 px-3">Brand & Model</th>
                      <th className="py-3 px-3">Status & Release</th>
                      <th className="py-3 px-3">Price (USD / NGN)</th>
                      <th className="py-3 px-3">Key Specs</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredAdminPhones.map((phone) => (
                      <tr key={phone.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={phone.image}
                              alt={phone.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{phone.name}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    runWithProgress(
                                      () => updatePhone({ ...phone, isFeatured: !phone.isFeatured }),
                                      phone.isFeatured
                                        ? `${phone.name} moved from Featured to Latest phones.`
                                        : `${phone.name} assigned to Featured phone!`
                                    )
                                  }
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                                    phone.isFeatured
                                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                                  }`}
                                  title="Click to toggle Featured Phone status"
                                >
                                  {phone.isFeatured ? '★ Featured' : '+ Assign Featured'}
                                </button>
                                {phone.keyHighlights.network5g && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono">
                                    5G
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium">{phone.brand}</div>
                          {phone.modelNumber && (
                            <div className="text-[10px] font-mono text-slate-400">{phone.modelNumber}</div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {phone.marketStatus}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-0.5">{phone.releaseDate || phone.releaseYear}</div>
                        </td>
                        <td className="py-3 px-3 price-value-tight">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {formatUSD(phone.priceUSD || Math.round(phone.priceNGN / 1500))}
                          </div>
                          <div className="text-[11px] text-slate-500">{formatNaira(phone.priceNGN)}</div>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <div>{phone.keyHighlights.processor}</div>
                          <div>{phone.keyHighlights.ram} · {phone.keyHighlights.battery}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleViewPhoneOnPublicSite(phone)}
                              className="px-2.5 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="View Phone on Public Site"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => openEditPhoneForm(phone)}
                              className="px-2.5 py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Edit All
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSpecPhoneId(phone.id);
                                setSection('specs');
                              }}
                              className="px-2.5 py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-sky-600 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Specs
                            </button>
                            <button
                              onClick={() => {
                                runWithProgress(() => deletePhone(phone.id), `Deleted ${phone.name}.`);
                              }}
                              className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white cursor-pointer transition-colors"
                              title="Delete Phone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 2: FULL PHONE SPECIFICATIONS EDITOR (ALL 12 TABLES)
          ================================================================= */}
          {section === 'specs' && specPhoneDraft && (
            <form onSubmit={handleSaveFullSpecs} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Full Smartphone Specifications Editor
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select any smartphone to edit all 12 specification tables (General, Design, Display, Platform, Memory, Camera, Battery, Network, Connectivity, Multimedia, Security & Features).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={selectedSpecPhoneId}
                    onChange={(e) => setSelectedSpecPhoneId(e.target.value)}
                    className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  >
                    {phones.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.brand} — {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleViewPhoneOnPublicSite(specPhoneDraft)}
                    className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View on Site</span>
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save All Specifications</span>
                  </button>
                </div>
              </div>

              {/* GENERAL TABLE FIELDS FOR SELECTED PHONE */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                  0. {generalTableConfig?.title || 'GENERAL'} TABLE (
                  {isGeneralTableEnabled
                    ? 'Release Date, Model Number, Market Status, USD & NGN Price'
                    : 'Table Hidden on Public Page — Core Identity & Visibility Controls'}
                  )
                </h3>
                {isGeneralTableEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {isGeneralSubtableEnabled('releaseDate') && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          {getGeneralSubtableLabel('releaseDate', 'Release Date')}
                        </label>
                        <input
                          type="text"
                          value={specPhoneDraft.releaseDate}
                          onChange={(e) => setSpecPhoneDraft({ ...specPhoneDraft, releaseDate: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs"
                        />
                      </div>
                    )}
                    {isGeneralSubtableEnabled('modelNumber') && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          {getGeneralSubtableLabel('modelNumber', 'Model Number')}
                        </label>
                        <input
                          type="text"
                          value={specPhoneDraft.modelNumber || ''}
                          onChange={(e) => setSpecPhoneDraft({ ...specPhoneDraft, modelNumber: e.target.value })}
                          placeholder="e.g. SM-S928B"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                    )}
                    {isGeneralSubtableEnabled('marketStatus') && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          {getGeneralSubtableLabel('marketStatus', 'Market Status')}
                        </label>
                        <select
                          value={specPhoneDraft.marketStatus}
                          onChange={(e) => setSpecPhoneDraft({ ...specPhoneDraft, marketStatus: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs"
                        >
                          <option value="Available">Available</option>
                          <option value="Pre-order">Pre-order</option>
                          <option value="Coming Soon">Coming Soon</option>
                          <option value="Rumored">Rumored</option>
                          <option value="Discontinued">Discontinued</option>
                        </select>
                      </div>
                    )}
                    {isGeneralSubtableEnabled('priceUSD / priceNGN') && (
                      <>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Price (USD $)</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={specUsdText}
                            placeholder="e.g. 299"
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw !== '' && !/^\d*(\.\d*)?$/.test(raw)) return;
                              setSpecUsdText(raw);
                              const num = parseFloat(raw);
                              setSpecPhoneDraft((prev) =>
                                prev ? { ...prev, priceUSD: raw.trim() === '' || Number.isNaN(num) ? 0 : num } : prev
                              );
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Price (NGN ₦)</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={specNgnText}
                            placeholder="e.g. 450000"
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw !== '' && !/^\d*(\.\d*)?$/.test(raw)) return;
                              setSpecNgnText(raw);
                              const num = parseFloat(raw);
                              setSpecPhoneDraft((prev) =>
                                prev ? { ...prev, priceNGN: raw.trim() === '' || Number.isNaN(num) ? 0 : num } : prev
                              );
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-emerald-600 dark:text-emerald-400">
                    <input
                      type="checkbox"
                      checked={Boolean(specPhoneDraft.isFeatured)}
                      onChange={(e) =>
                        setSpecPhoneDraft({ ...specPhoneDraft, isFeatured: e.target.checked })
                      }
                    />
                    <span>Featured Phone (Homepage Hero Spotlight — if unchecked, appears in Latest Phones)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-sky-600 dark:text-sky-400">
                    <input
                      type="checkbox"
                      checked={Boolean(specPhoneDraft.isPopular)}
                      onChange={(e) =>
                        setSpecPhoneDraft({ ...specPhoneDraft, isPopular: e.target.checked })
                      }
                    />
                    <span>Trending / Popular Phone</span>
                  </label>
                </div>

                {/* Primary Phone Feature Image inside Full Specs Editor */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                    Primary Phone Feature Image (Upload to /uploads, Pick from Media Library, or Paste URL)
                  </label>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                    {specPhoneDraft.image && (
                      <img
                        src={specPhoneDraft.image}
                        alt={specPhoneDraft.name}
                        className="w-11 h-11 rounded-lg object-cover bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 shrink-0"
                      />
                    )}
                    <input
                      type="text"
                      value={specPhoneDraft.image}
                      onChange={(e) => {
                        const nextUrl = e.target.value;
                        setSpecPhoneDraft({
                          ...specPhoneDraft,
                          image: nextUrl,
                          images: nextUrl.trim()
                            ? [nextUrl.trim(), ...(specPhoneDraft.images || []).filter((u) => u !== nextUrl.trim())]
                            : specPhoneDraft.images,
                        });
                      }}
                      placeholder="/uploads/... or https://..."
                      className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                    />
                    <input
                      ref={specPhoneImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSpecPhoneFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => specPhoneImageInputRef.current?.click()}
                      className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="Upload Phone Image to Server (/uploads)"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openMediaPicker('Select Primary Phone Image', 'phone', (url) => {
                          setSpecPhoneDraft((prev) => {
                            if (!prev) return prev;
                            const nextSpec = {
                              ...prev,
                              image: url,
                              images: [url, ...(prev.images || []).filter((u) => u !== url)],
                            };
                            updatePhone(nextSpec);
                            showGlobalToast(`Updated primary image for ${nextSpec.name}.`, 'success');
                            return nextSpec;
                          });
                        })
                      }
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="Choose from Media Library"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Library</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ALL 10 HARDWARE SPECIFICATION META BOXES */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                {renderAllSpecificationMetaBoxes(
                  specPhoneDraft,
                  setSpecPhoneDraft,
                  specRamText,
                  setSpecRamText,
                  specStorageText,
                  setSpecStorageText
                )}
              </div>
            </form>
          )}

          {/* =================================================================
              SECTION 3: UPDATE PHONE PRICES
          ================================================================= */}
          {section === 'pricing' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                  Update Phone Prices (USD $ & NGN ₦)
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update global USD ($), regional NGN (₦), market availability status, and retail price notes across all smartphones.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-mono uppercase text-slate-500">
                      <th className="py-3 px-4">Phone Model</th>
                      <th className="py-3 px-3">Current USD / NGN</th>
                      <th className="py-3 px-3">New Price USD ($)</th>
                      <th className="py-3 px-3">New Price NGN (₦)</th>
                      <th className="py-3 px-3">Market Status</th>
                      <th className="py-3 px-3">Price Notes</th>
                      <th className="py-3 px-4 text-right">Save</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {phones.map((phone) => {
                      const edit = priceEdits[phone.id] || {
                        ngn: String(phone.priceNGN),
                        usd: String(phone.priceUSD || Math.round(phone.priceNGN / 1500)),
                        oldNgn: String(phone.oldPriceNGN || ''),
                        marketStatus: phone.marketStatus || 'Available',
                        notes: phone.nairaPriceNotes || '',
                      };
                      return (
                        <tr key={phone.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {phone.name}
                            <div className="text-[10px] text-slate-400 font-normal">{phone.brand}</div>
                          </td>
                          <td className="py-3 px-3 price-value-tight">
                            <div className="font-bold text-emerald-600 dark:text-emerald-400">
                              {formatUSD(phone.priceUSD || Math.round(phone.priceNGN / 1500))}
                            </div>
                            <div className="text-[11px] text-slate-500">{formatNaira(phone.priceNGN)}</div>
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              value={edit.usd}
                              onChange={(e) =>
                                setPriceEdits({
                                  ...priceEdits,
                                  [phone.id]: { ...edit, usd: e.target.value },
                                })
                              }
                              className="w-24 px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              value={edit.ngn}
                              onChange={(e) =>
                                setPriceEdits({
                                  ...priceEdits,
                                  [phone.id]: { ...edit, ngn: e.target.value },
                                })
                              }
                              className="w-32 px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={edit.marketStatus}
                              onChange={(e) =>
                                setPriceEdits({
                                  ...priceEdits,
                                  [phone.id]: { ...edit, marketStatus: e.target.value },
                                })
                              }
                              className="px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs"
                            >
                              <option value="Available">Available</option>
                              <option value="Pre-order">Pre-order</option>
                              <option value="Coming Soon">Coming Soon</option>
                              <option value="Rumored">Rumored</option>
                              <option value="Discontinued">Discontinued</option>
                            </select>
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              value={edit.notes}
                              onChange={(e) =>
                                setPriceEdits({
                                  ...priceEdits,
                                  [phone.id]: { ...edit, notes: e.target.value },
                                })
                              }
                              placeholder="Retailer / market notes"
                              className="w-44 px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                const ngnVal = Number(edit.ngn);
                                const usdVal = Number(edit.usd);
                                if (ngnVal > 0 && usdVal > 0) {
                                  runWithProgress(() => {
                                    updatePhonePrice(phone.id, ngnVal, usdVal, edit.notes);
                                    updatePhone({
                                      ...phone,
                                      priceNGN: ngnVal,
                                      priceUSD: usdVal,
                                      marketStatus: edit.marketStatus,
                                      nairaPriceNotes: edit.notes,
                                    });
                                  }, `Updated price for ${phone.name}.`);
                                }
                              }}
                              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 4: ADD / MANAGE BRANDS
          ================================================================= */}
          {section === 'brands' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                  Manage Smartphone Brands ({brands.length})
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add new smartphone manufacturers, upload brand logos, configure SEO title &amp; keywords, and manage warranty partners.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                  onSubmit={handleSaveBrand}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 h-fit"
                >
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingBrandId ? 'Edit Brand' : 'Add New Brand'}
                  </h2>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={brandForm.name}
                      onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                      placeholder="e.g. Nothing, Realme, Honor"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Brand Logo Image (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      {brandForm.logoUrl && (
                        <img
                          src={brandForm.logoUrl}
                          alt="Brand Logo"
                          className="w-8 h-8 rounded object-contain bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 p-0.5 shrink-0"
                        />
                      )}
                      <input
                        type="text"
                        value={brandForm.logoUrl}
                        onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
                        placeholder="/uploads/... or https://..."
                        className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                      />
                      <input
                        ref={brandLogoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          handleDirectFileUploadToServer(
                            file,
                            'brand',
                            brandForm.name ? `${brandForm.name} Logo` : file.name,
                            (url) => setBrandForm((prev) => ({ ...prev, logoUrl: url }))
                          );
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => brandLogoInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer shrink-0"
                        title="Upload Brand Logo"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openMediaPicker('Select Brand Logo', 'brand', (url) =>
                            setBrandForm((prev) => ({ ...prev, logoUrl: url }))
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold cursor-pointer shrink-0"
                        title="Pick from Media Library"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Origin Country</label>
                    <input
                      type="text"
                      value={brandForm.country}
                      onChange={(e) => setBrandForm({ ...brandForm, country: e.target.value })}
                      placeholder="e.g. South Korea, China, USA"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Popular Series (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={brandForm.popularSeries}
                      onChange={(e) => setBrandForm({ ...brandForm, popularSeries: e.target.value })}
                      placeholder="Galaxy S, Galaxy A, Galaxy Z"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Official Warranty / Service Partner
                    </label>
                    <input
                      type="text"
                      value={brandForm.warrantyPartner}
                      onChange={(e) => setBrandForm({ ...brandForm, warrantyPartner: e.target.value })}
                      placeholder="e.g. Carlcare / Samsung Authorized Service"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Regional / Global Presence
                    </label>
                    <input
                      type="text"
                      value={brandForm.officialPresenceInNigeria}
                      onChange={(e) => setBrandForm({ ...brandForm, officialPresenceInNigeria: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Brand Description
                    </label>
                    <textarea
                      rows={3}
                      value={brandForm.description}
                      onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                      placeholder="Write brand overview..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs leading-relaxed"
                    />
                  </div>

                  {/* Brand SEO Title & Keywords */}
                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                    <div className="text-[11px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      Brand SEO Title &amp; Keywords
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">SEO Title</label>
                      <input
                        type="text"
                        value={brandForm.seoTitle}
                        onChange={(e) => setBrandForm({ ...brandForm, seoTitle: e.target.value })}
                        placeholder={`${brandForm.name || 'Brand'} Phones, Specs & Prices`}
                        className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                        SEO Focus Keywords
                      </label>
                      <input
                        type="text"
                        value={brandForm.seoKeywords}
                        onChange={(e) => setBrandForm({ ...brandForm, seoKeywords: e.target.value })}
                        placeholder={`${brandForm.name || 'Brand'} phones, price in Nigeria, latest models`}
                        className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      {editingBrandId ? 'Update Brand' : 'Add Brand'}
                    </button>
                    {editingBrandId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBrandId(null);
                          setBrandForm({
                            name: '',
                            country: '',
                            description: '',
                            popularSeries: '',
                            warrantyPartner: '',
                            officialPresenceInNigeria: 'Yes — Official Retail & Service Centers',
                            globalPresence: 'Global Distribution',
                            accentBg: 'from-emerald-900/40 to-slate-900',
                            logoUrl: '',
                            seoTitle: '',
                            seoKeywords: '',
                          });
                        }}
                        className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Brands Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="w-full overflow-x-auto touch-pan-x">
                    <table className="w-full min-w-[600px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-mono uppercase text-slate-500">
                        <th className="py-3 px-4">Brand</th>
                        <th className="py-3 px-3">Popular Series</th>
                        <th className="py-3 px-3">Warranty Partner</th>
                        <th className="py-3 px-3">Phones</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {brands.map((b) => {
                        const count = phones.filter((p) => p.brand.toLowerCase() === b.name.toLowerCase()).length;
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                {b.logoUrl ? (
                                  <img
                                    src={b.logoUrl}
                                    alt={b.name}
                                    className="w-7 h-7 rounded object-contain bg-slate-100 dark:bg-slate-800 p-0.5 shrink-0"
                                  />
                                ) : (
                                  <span className="w-7 h-7 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                                    {b.logoLetter}
                                  </span>
                                )}
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white">{b.name}</div>
                                  <div className="text-[11px] text-slate-400">{b.country}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-500">{b.popularSeries.join(', ')}</td>
                            <td className="py-3 px-3 text-slate-500">{b.warrantyPartner}</td>
                            <td className="py-3 px-3 font-mono font-bold">{count}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingBrandId(b.id);
                                    setBrandForm({
                                      name: b.name,
                                      country: b.country,
                                      description: b.description,
                                      popularSeries: b.popularSeries.join(', '),
                                      warrantyPartner: b.warrantyPartner,
                                      officialPresenceInNigeria: b.officialPresenceInNigeria || '',
                                      globalPresence: b.globalPresence || '',
                                      accentBg: b.accentBg,
                                      logoUrl: b.logoUrl || '',
                                      seoTitle: b.seoTitle || '',
                                      seoKeywords: b.seoKeywords || '',
                                    });
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-xs font-semibold cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    runWithProgress(() => deleteBrand(b.id), `Deleted brand ${b.name}.`)
                                  }
                                  className="p-1 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 5: UPLOAD IMAGES & MEDIA LIBRARY (cPanel /uploads Persistent)
          ================================================================= */}
          {section === 'media' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Media Library &amp; Feature Image Uploader ({mediaLibrary.length})
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Uploaded files are written directly to the server&apos;s <code className="font-mono text-emerald-600 dark:text-emerald-400">/uploads</code> directory for reliable cPanel hosting across Phones, News, Guides, Reviews, Brands &amp; Site Logos.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border-2 border-dashed border-emerald-500/40 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Upload Image File to Server (/uploads)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Supports PNG, JPG, WEBP, SVG, AVIF, GIF (stored on server disk for cPanel hosting)
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-md">
                    <input
                      type="text"
                      value={newImageTitle}
                      onChange={(e) => setNewImageTitle(e.target.value)}
                      placeholder="Image title (e.g. Galaxy S25 Render)"
                      className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                    <select
                      value={newImageCategory}
                      onChange={(e) => setNewImageCategory(e.target.value as any)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-semibold"
                    >
                      <option value="phone">Phone Image</option>
                      <option value="news">News Cover</option>
                      <option value="guide">Buying Guide</option>
                      <option value="review">Review Photo</option>
                      <option value="logo">Site / Header Logo</option>
                      <option value="brand">Brand Logo</option>
                      <option value="banner">Ad / Banner</option>
                      <option value="other">Other Media</option>
                    </select>
                  </div>
                  <div className="w-full max-w-md">
                    <select
                      value={mediaUploadAssignPhoneId}
                      onChange={(e) => setMediaUploadAssignPhoneId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-semibold"
                    >
                      <option value="">Optional: Auto-assign uploaded image to a phone...</option>
                      {phones.map((p) => (
                        <option key={p.id} value={p.id}>
                          Assign immediately to: {p.brand} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMediaFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose File &amp; Upload to Server</span>
                  </button>
                </div>

                <form
                  onSubmit={handleAddImageUrlToLibrary}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add External or Local Image URL</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Image Label</label>
                      <input
                        type="text"
                        value={newImageTitle}
                        onChange={(e) => setNewImageTitle(e.target.value)}
                        placeholder="e.g. Galaxy S25 Ultra Front Render"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Media Category</label>
                      <select
                        value={newImageCategory}
                        onChange={(e) => setNewImageCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      >
                        <option value="phone">Phone Image</option>
                        <option value="news">News Cover</option>
                        <option value="guide">Buying Guide</option>
                        <option value="review">Review Photo</option>
                        <option value="logo">Site / Header Logo</option>
                        <option value="brand">Brand Logo</option>
                        <option value="banner">Ad / Banner</option>
                        <option value="other">Other Media</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Direct Image URL *</label>
                    <input
                      type="text"
                      required
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="/uploads/... or https://..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Assign Directly to Phone (Optional)
                    </label>
                    <select
                      value={mediaUploadAssignPhoneId}
                      onChange={(e) => setMediaUploadAssignPhoneId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-semibold"
                    >
                      <option value="">Save to Media Library only</option>
                      {phones.map((p) => (
                        <option key={p.id} value={p.id}>
                          Assign immediately to: {p.brand} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    {mediaUploadAssignPhoneId ? 'Save & Assign to Selected Phone' : 'Save Image to Media Library'}
                  </button>
                </form>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['ALL', 'phone', 'news', 'guide', 'review', 'logo', 'brand', 'other'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMediaCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                        mediaCategoryFilter === cat
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat === 'ALL' ? `All (${mediaLibrary.length})` : cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Quick Assign Target Phone:</span>
                  <select
                    value={targetPhoneForImage}
                    onChange={(e) => setTargetPhoneForImage(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  >
                    {phones.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.brand} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mediaLibrary
                  .filter((item) => mediaCategoryFilter === 'ALL' || (item.category || 'phone') === mediaCategoryFilter)
                  .map((item) => {
                    const targetPhoneObj = phones.find((p) => p.id === targetPhoneForImage);
                    return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between p-3 space-y-2.5 shadow-sm"
                      >
                        <div className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center relative p-2">
                          <img src={item.url} alt={item.name} className="w-full h-full object-contain" />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-mono uppercase">
                            {item.category || 'phone'}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</div>
                          <div className="text-[10px] font-mono text-slate-400 truncate">{item.url}</div>
                          <div className="text-[10px] text-slate-400">{item.uploadedAt}</div>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => handleAssignImageToPhone(item.url, targetPhoneForImage)}
                            className="flex-1 py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer truncate"
                            title={`Assign this image to ${targetPhoneObj?.name || 'selected phone'}`}
                          >
                            Assign to {targetPhoneObj?.name || 'Phone'}
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(item.url);
                              showGlobalToast('Copied image URL to clipboard', 'info');
                            }}
                            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer shrink-0"
                            title="Copy URL"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              deleteMediaItem(item.id);
                              showGlobalToast(`Removed "${item.name}" from Media Library.`, 'info');
                            }}
                            className="p-1.5 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white cursor-pointer shrink-0"
                            title="Delete Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 6: PUBLISH AND MANAGE NEWS / GUIDES / REVIEWS / ARTICLES
          ================================================================= */}
          {section === 'news' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Publish &amp; Manage News, Buying Guides &amp; Review Articles ({articles.length})
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage all News &amp; Articles, Buying Guides, and Editorial Review Articles with H1–H4 headings, bold text, cover images, and SEO metadata.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingArticleId(null);
                      setArticleCategoryFilter('news');
                      setArticleForm({
                        ...articleForm,
                        title: '',
                        category: 'News',
                        summary: '',
                        content: '',
                        tags: 'Smartphone, Launch, News',
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    + New News Article
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingArticleId(null);
                      setArticleCategoryFilter('guides');
                      setArticleForm({
                        ...articleForm,
                        title: '',
                        category: 'Buying Guide',
                        summary: '',
                        content: '',
                        tags: 'Buying Guide, Best Phones, Recommendations',
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
                  >
                    + New Buying Guide
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingArticleId(null);
                      setArticleCategoryFilter('reviews');
                      setArticleForm({
                        ...articleForm,
                        title: '',
                        category: 'Reviews',
                        summary: '',
                        content: '',
                        tags: 'Review, Camera Test, Battery Test',
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                  >
                    + New Review Article
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                  onSubmit={handleSaveArticle}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 h-fit"
                >
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingArticleId ? 'Edit Post / Guide / Review' : 'Publish New Post / Guide / Review'}
                  </h2>


                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Headline *</label>
                    <input
                      type="text"
                      required
                      value={articleForm.title}
                      onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                      placeholder="Article, guide, or review headline..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Category</label>
                      <select
                        value={articleForm.category}
                        onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      >
                        <option value="News">News</option>
                        <option value="Reviews">Reviews</option>
                        <option value="Buying Guide">Buying Guide</option>
                        <option value="Launch">Launch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Read Time</label>
                      <input
                        type="text"
                        value={articleForm.readTime}
                        onChange={(e) => setArticleForm({ ...articleForm, readTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  {/* Linked Phone for Core Specs & Review Score Card */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Linked Phone for Core Specs &amp; Review Score Card (Optional)
                    </label>
                    <select
                      value={articleForm.relatedPhoneId}
                      onChange={(e) => setArticleForm({ ...articleForm, relatedPhoneId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    >
                      <option value="">— No Linked Phone (Only score if core specs are in article) —</option>
                      {phones.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.brand} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Feature Cover Image Upload + Media Library Picker */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Feature Cover Image (Upload File or Choose from Library)
                    </label>
                    {articleForm.coverImage && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 h-28 bg-slate-950">
                        <img
                          src={articleForm.coverImage}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={articleForm.coverImage}
                        onChange={(e) => setArticleForm({ ...articleForm, coverImage: e.target.value })}
                        placeholder="/uploads/... or https://..."
                        className="flex-1 min-w-0 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                      />
                      <input
                        ref={articleImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const cat =
                            articleForm.category === 'Buying Guide'
                              ? 'guide'
                              : articleForm.category === 'Reviews'
                              ? 'review'
                              : 'news';
                          handleDirectFileUploadToServer(
                            file,
                            cat,
                            articleForm.title ? `${articleForm.title} Cover` : file.name,
                            (url) => setArticleForm((prev) => ({ ...prev, coverImage: url }))
                          );
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => articleImageInputRef.current?.click()}
                        className="px-2.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        title="Upload Feature Image to Server (/uploads)"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openMediaPicker('Select Post Cover Image', 'news', (url) =>
                            setArticleForm((prev) => ({ ...prev, coverImage: url }))
                          )
                        }
                        className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                        title="Pick from Media Library"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={articleForm.tags}
                      onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Summary / Lead Excerpt
                    </label>
                    <textarea
                      rows={2}
                      value={articleForm.summary}
                      onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                      placeholder="Write a concise lead summary or excerpt..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <RichTextEditor
                    label="Article Body (Headings & Bold Text)"
                    helperText="H1, H2, H3 & Bold text only"
                    headingsAndBodyOnly
                    rows={10}
                    value={articleForm.content}
                    onChange={(val) => setArticleForm({ ...articleForm, content: val })}
                    placeholder="Write your article content. Use H1, H2, H3 buttons for section headings and Bold for bold text..."
                  />

                  {/* Article / Guide / Review SEO Title & Keywords Box */}
                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">
                        SEO Title &amp; Focus Keywords
                      </span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                        SEO Title (&lt;title&gt;)
                      </label>
                      <input
                        type="text"
                        value={articleForm.seoTitle}
                        onChange={(e) => setArticleForm({ ...articleForm, seoTitle: e.target.value })}
                        placeholder={`${articleForm.title || 'Post Title'}`}
                        className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                        SEO Focus Keywords (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={articleForm.seoKeywords}
                        onChange={(e) => setArticleForm({ ...articleForm, seoKeywords: e.target.value })}
                        placeholder="e.g. best gaming phones 2025, 5G phones in Nigeria, Samsung review"
                        className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                        SEO Meta Description
                      </label>
                      <textarea
                        rows={2}
                        value={articleForm.seoDescription}
                        onChange={(e) => setArticleForm({ ...articleForm, seoDescription: e.target.value })}
                        placeholder="Custom search engine meta description..."
                        className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={articleForm.featured}
                        onChange={(e) => setArticleForm({ ...articleForm, featured: e.target.checked })}
                        className="accent-emerald-600"
                      />
                      <span>Featured Story</span>
                    </label>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      {editingArticleId ? 'Update Article' : 'Publish Article'}
                    </button>
                    {editingArticleId && (
                      <button
                        type="button"
                        onClick={() => setEditingArticleId(null)}
                        className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {/* Category Filter Tabs for Posts (All, News & Articles, Buying Guides, Review Articles) */}
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'all', label: `All Posts (${articles.length})` },
                        {
                          id: 'news',
                          label: `News & Articles (${
                            articles.filter((a) => {
                              const c = String(a.category || '').toLowerCase();
                              return (
                                !c.includes('guide') &&
                                !c.includes('review') &&
                                !['frp & servicing tools', 'charging & battery', 'tips & security'].includes(c)
                              );
                            }).length
                          })`,
                        },
                        {
                          id: 'guides',
                          label: `Buying Guide (${
                            articles.filter((a) => {
                              const c = String(a.category || '').toLowerCase();
                              return (
                                c.includes('guide') ||
                                ['frp & servicing tools', 'charging & battery', 'tips & security'].includes(c)
                              );
                            }).length
                          })`,
                        },
                        {
                          id: 'reviews',
                          label: `Review Articles (${
                            articles.filter((a) => String(a.category || '').toLowerCase().includes('review')).length
                          })`,
                        },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setArticleCategoryFilter(tab.id as any);
                            setArticleArchivePage(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            articleCategoryFilter === tab.id
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(() => {
                    const filteredAdminArticles = articles.filter((art) => {
                      if (articleCategoryFilter === 'all') return true;
                      const c = String(art.category || '').toLowerCase();
                      const isGuide =
                        c.includes('guide') ||
                        ['frp & servicing tools', 'charging & battery', 'tips & security'].includes(c);
                      const isReview = c.includes('review');
                      if (articleCategoryFilter === 'guides') return isGuide;
                      if (articleCategoryFilter === 'reviews') return isReview;
                      return !isGuide && !isReview;
                    });
                    const totalAdminArticlePages = Math.max(
                      1,
                      Math.ceil(filteredAdminArticles.length / ADMIN_ARTICLES_PER_PAGE)
                    );
                    const safeAdminArticlePage = Math.min(articleArchivePage, totalAdminArticlePages);
                    const adminStartIndex = (safeAdminArticlePage - 1) * ADMIN_ARTICLES_PER_PAGE;
                    const paginatedAdminArticles = filteredAdminArticles.slice(
                      adminStartIndex,
                      adminStartIndex + ADMIN_ARTICLES_PER_PAGE
                    );

                    return (
                      <>
                        <div className="w-full overflow-x-auto touch-pan-x">
                          <table className="w-full min-w-[620px] text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-mono uppercase text-slate-500">
                                <th className="py-3 px-4">Article / Guide &amp; SEO</th>
                                <th className="py-3 px-3 whitespace-nowrap">Category</th>
                                <th className="py-3 px-3 whitespace-nowrap">Date</th>
                                <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                              {paginatedAdminArticles.map((art) => (
                          <tr key={art.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-4 min-w-[230px]">
                              <div className="flex items-center gap-3">
                                <img
                                  src={art.coverImage}
                                  alt={art.title}
                                  className="w-11 h-11 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{art.title}</div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                    {art.featured && (
                                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                        ★ Featured
                                      </span>
                                    )}
                                    {(art.seoTitle || art.seoKeywords) && (
                                      <span className="px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[10px] font-mono">
                                        SEO Configured
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">{art.category}</td>
                            <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">{art.date}</td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleViewArticleOnPublicSite(art)}
                                  className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                  title="View Article on Public Site"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingArticleId(art.id);
                                    setArticleForm({
                                      title: art.title,
                                      category: art.category,
                                      summary: art.summary,
                                      content: art.content,
                                      coverImage: art.coverImage,
                                      readTime: art.readTime,
                                      tags: (art.tags || []).join(', '),
                                      featured: Boolean(art.featured),
                                      relatedPhoneId: art.relatedPhoneIds?.[0] || '',
                                      authorName: art.author?.name || 'GsmScope Editorial',
                                      authorRole: art.author?.role || 'Senior Editor',
                                      seoTitle: art.seoTitle || '',
                                      seoKeywords: art.seoKeywords || '',
                                      seoDescription: art.seoDescription || '',
                                    });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-xs font-semibold cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    runWithProgress(() => deleteArticle(art.id), `Deleted article.`)
                                  }
                                  className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white cursor-pointer"
                                  title="Delete Article"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                              </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {filteredAdminArticles.length > 0 && (
                          <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-center text-[11px]">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={safeAdminArticlePage <= 1}
                                onClick={() => setArticleArchivePage(Math.max(1, safeAdminArticlePage - 1))}
                                className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
                              >
                                <ChevronLeft className="w-3 h-3" />
                                <span>Previous</span>
                              </button>
                              <span className="px-2 font-mono font-bold text-slate-700 dark:text-slate-200">
                                {safeAdminArticlePage} / {totalAdminArticlePages}
                              </span>
                              <button
                                type="button"
                                disabled={safeAdminArticlePage >= totalAdminArticlePages}
                                onClick={() => setArticleArchivePage(Math.min(totalAdminArticlePages, safeAdminArticlePage + 1))}
                                className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
                              >
                                <span>Next</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 7: MANAGE REVIEWS / COMMENTS (WITH ADD REVIEW + IMAGE + SEO)
          ================================================================= */}
          {section === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Manage &amp; Moderate Device Reviews ({reviews.length})
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Publish editorial or verified owner reviews with feature photos and SEO metadata, or moderate user comments.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (showReviewForm) {
                        setShowReviewForm(false);
                        setEditingReviewId(null);
                      } else {
                        setEditingReviewId(null);
                        setShowReviewForm(true);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showReviewForm ? 'Close Review Form' : 'Add New Review'}</span>
                  </button>
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setReviewFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                        reviewFilter === st
                          ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {showReviewForm && (
                <form
                  onSubmit={handleCreateAdminReview}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border-2 border-emerald-500/40 space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {editingReviewId
                        ? 'Edit Existing User Review'
                        : 'Publish New Smartphone Review (with Feature Image & SEO Title/Keywords)'}
                    </h2>
                    {editingReviewId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReviewId(null);
                          setShowReviewForm(false);
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>


                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Target Phone *</label>
                      <select
                        value={reviewForm.phoneId}
                        onChange={(e) => setReviewForm({ ...reviewForm, phoneId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold"
                      >
                        {phones.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.brand} — {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Reviewer Name *</label>
                      <input
                        type="text"
                        required
                        value={reviewForm.userName}
                        onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Location</label>
                      <input
                        type="text"
                        value={reviewForm.location}
                        onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Star Rating (1–5)</label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold"
                      >
                        <option value={5}>★★★★★ (5/5 Excellent)</option>
                        <option value={4}>★★★★☆ (4/5 Very Good)</option>
                        <option value={3}>★★★☆☆ (3/5 Average)</option>
                        <option value={2}>★★☆☆☆ (2/5 Below Average)</option>
                        <option value={1}>★☆☆☆☆ (1/5 Poor)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Review Title</label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                        placeholder="e.g. Incredible camera zoom and 2-day battery life"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Review Feature Image (Optional Upload or Library)
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={reviewForm.imageUrl}
                          onChange={(e) => setReviewForm({ ...reviewForm, imageUrl: e.target.value })}
                          placeholder="/uploads/... or https://..."
                          className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                        />
                        <input
                          ref={reviewImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            handleDirectFileUploadToServer(
                              file,
                              'review',
                              reviewForm.title || 'Review Image',
                              (url) => setReviewForm((prev) => ({ ...prev, imageUrl: url }))
                            );
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => reviewImageInputRef.current?.click()}
                          className="px-2.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openMediaPicker('Select Review Image', 'review', (url) =>
                              setReviewForm((prev) => ({ ...prev, imageUrl: url }))
                            )
                          }
                          className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer shrink-0"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <RichTextEditor
                    label="Review Verdict / Comment *"
                    helperText="Supports H1–H4 Headings, Bold Text & Bold Paragraph"
                    required
                    rows={5}
                    value={reviewForm.comment}
                    onChange={(val) => setReviewForm({ ...reviewForm, comment: val })}
                    placeholder="Write detailed hands-on review... Add H1, H2, H3 subheadings or make key paragraphs and words bold."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 mb-1">
                        Review SEO Title
                      </label>
                      <input
                        type="text"
                        value={reviewForm.seoTitle}
                        onChange={(e) => setReviewForm({ ...reviewForm, seoTitle: e.target.value })}
                        placeholder="Custom SEO title for this review..."
                        className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 mb-1">
                        Review SEO Focus Keywords
                      </label>
                      <input
                        type="text"
                        value={reviewForm.seoKeywords}
                        onChange={(e) => setReviewForm({ ...reviewForm, seoKeywords: e.target.value })}
                        placeholder="e.g. camera test, battery life review, gaming test"
                        className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      {editingReviewId ? 'Save Updated Review' : 'Publish Approved Review'}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {reviews
                  .filter((r) => reviewFilter === 'all' || r.status === reviewFilter)
                  .map((rev) => {
                    const phone = phones.find((p) => p.id === rev.phoneId);
                    return (
                      <div
                        key={rev.id}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          {rev.imageUrl && (
                            <img
                              src={rev.imageUrl}
                              alt={rev.title || rev.userName}
                              className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                            />
                          )}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">{rev.userName}</span>
                              <span className="text-amber-500 font-mono text-xs font-bold">★ {rev.rating}/5</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                                  rev.status === 'approved'
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                    : rev.status === 'pending'
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                    : 'bg-rose-500/15 text-rose-500'
                                }`}
                              >
                                {rev.status}
                              </span>
                              {(rev.seoTitle || rev.seoKeywords) && (
                                <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 text-[10px] font-mono">
                                  SEO
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Device: <strong>{phone?.name || rev.phoneName || rev.phoneId}</strong> · {rev.location} · {rev.date}
                            </div>
                            {rev.title && <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.title}</div>}
                            <div className="text-xs text-slate-700 dark:text-slate-300 pt-0.5">
                              <FormattedContent content={rev.comment} compact />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReviewId(rev.id);
                              setReviewForm({
                                phoneId: rev.phoneId,
                                userName: rev.userName,
                                location: rev.location || 'Lagos',
                                rating: rev.rating,
                                title: rev.title || '',
                                comment: rev.comment,
                                pros: (rev.pros || []).join(', '),
                                cons: (rev.cons || []).join(', '),
                                imageUrl: rev.imageUrl || '',
                                seoTitle: rev.seoTitle || '',
                                seoKeywords: rev.seoKeywords || '',
                              });
                              setShowReviewForm(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-xs font-semibold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              runWithProgress(
                                () => updateReviewStatus(rev.id, 'approved'),
                                `Approved review by ${rev.userName}.`
                              )
                            }
                            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() =>
                              runWithProgress(
                                () => updateReviewStatus(rev.id, 'rejected'),
                                `Rejected review by ${rev.userName}.`
                              )
                            }
                            className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() =>
                              runWithProgress(() => deleteReview(rev.id), `Deleted review.`)
                            }
                            className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 8: MANAGE FEATURED PHONES
          ================================================================= */}
          {section === 'featured' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                  Best Phones, 5 Buying Guide Categories &amp; Compare Phones
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage Compare Phones settings, Homepage Featured Spotlights, and the 5 Best Phone categories under Explore &amp; Guides (Best phones overall, Best camera, Best gaming, Best battery, and Best 5G).
                </p>
              </div>

              {/* Compare Phones Management Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Compare Phones Page &amp; Homepage Quick Compare Management</span>
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Configure the default VS matchup on the Homepage Quick Compare banner and the headline/subtitle on the Compare Phones page (first-time visitors still start with an empty compare tray on Compare Phones).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      runWithProgress(
                        () => updateWebsiteContent(websiteContent),
                        'Saved Compare Phones settings!'
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    Save Compare Settings
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Default Compare Phone 1
                    </label>
                    <select
                      value={websiteContent.comparePhone1Id || phones[0]?.id || ''}
                      onChange={(e) =>
                        setWebsiteContent({ ...websiteContent, comparePhone1Id: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-semibold"
                    >
                      {phones.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.brand} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Default Compare Phone 2
                    </label>
                    <select
                      value={websiteContent.comparePhone2Id || phones[1]?.id || ''}
                      onChange={(e) =>
                        setWebsiteContent({ ...websiteContent, comparePhone2Id: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-semibold"
                    >
                      {phones.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.brand} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Compare Section Headline
                    </label>
                    <input
                      type="text"
                      value={websiteContent.compareHeadline || ''}
                      onChange={(e) =>
                        setWebsiteContent({ ...websiteContent, compareHeadline: e.target.value })
                      }
                      placeholder="Which phone is right for you?"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Compare Section Subtitle
                    </label>
                    <input
                      type="text"
                      value={websiteContent.compareSubtitle || ''}
                      onChange={(e) =>
                        setWebsiteContent({ ...websiteContent, compareSubtitle: e.target.value })
                      }
                      placeholder="Put phones side by side and see which one wins..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 6 Guides Best Phone Category Filter Tabs */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400">
                      Filter &amp; Curate the 5 Guides Best Phone Categories
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Click any category below to view and manage phones in that list, or toggle badges on any phone in the table below.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Phones', badgeHint: 'All catalog devices', count: phones.length },
                    {
                      id: 'top-rated',
                      label: 'Best phones overall',
                      badgeHint: 'top-rated / flagship / ★ Featured',
                      count: phones.filter(
                        (p) =>
                          (p.categories || []).includes('top-rated') ||
                          (p.categories || []).includes('flagship') ||
                          p.isFeatured
                      ).length,
                    },
                    {
                      id: 'best-camera',
                      label: 'Best camera phones',
                      badgeHint: 'best-camera',
                      count: phones.filter((p) => (p.categories || []).includes('best-camera')).length,
                    },
                    {
                      id: 'best-gaming',
                      label: 'Best gaming phones',
                      badgeHint: 'best-gaming',
                      count: phones.filter((p) => (p.categories || []).includes('best-gaming')).length,
                    },
                    {
                      id: 'best-battery',
                      label: 'Best battery phones',
                      badgeHint: 'best-battery',
                      count: phones.filter((p) => (p.categories || []).includes('best-battery')).length,
                    },
                    {
                      id: 'best-5g',
                      label: 'Best 5G phones',
                      badgeHint: 'best-5g / 5g',
                      count: phones.filter(
                        (p) =>
                          (p.categories || []).includes('best-5g') ||
                          (p.categories || []).includes('5g') ||
                          p.keyHighlights.network5g
                      ).length,
                    },
                  ].map((catTab) => (
                    <button
                      key={catTab.id}
                      type="button"
                      onClick={() => setFeaturedCategoryFilter(catTab.id as any)}
                      className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                        featuredCategoryFilter === catTab.id
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{catTab.label}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            featuredCategoryFilter === catTab.id
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {catTab.count}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] font-mono mt-0.5 ${
                          featuredCategoryFilter === catTab.id ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        Badge: {catTab.badgeHint}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-mono uppercase text-slate-500">
                      <th className="py-3 px-4">Smartphone</th>
                      <th className="py-3 px-3 text-center">Featured Spotlight</th>
                      <th className="py-3 px-3 text-center">Trending / Popular</th>
                      <th className="py-3 px-4">Category Badges (Click to Add/Remove from Guides Lists)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {phones
                      .filter((phone) => {
                        if (featuredCategoryFilter === 'all') return true;
                        const tags = phone.categories || [];
                        if (featuredCategoryFilter === 'top-rated') {
                          return tags.includes('top-rated') || tags.includes('flagship') || phone.isFeatured;
                        }
                        if (featuredCategoryFilter === 'best-5g') {
                          return tags.includes('best-5g') || tags.includes('5g') || phone.keyHighlights.network5g;
                        }
                        return tags.includes(featuredCategoryFilter);
                      })
                      .map((phone) => {
                        const tags = phone.categories || [];
                      const toggleTag = (tag: string) => {
                        const next = tags.includes(tag)
                          ? tags.filter((t) => t !== tag)
                          : [...tags, tag];
                        runWithProgress(
                          () => updatePhone({ ...phone, categories: next }),
                          `Updated categories for ${phone.name}.`
                        );
                      };

                      return (
                        <tr key={phone.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              <img
                                src={phone.image}
                                alt={phone.name}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                              <div>
                                <div>{phone.name}</div>
                                <div className="text-[11px] text-slate-400 font-normal flex items-center gap-2 mt-0.5">
                                  <span>{phone.brand}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openMediaPicker(`Select Image for ${phone.name}`, 'phone', (url) => {
                                        handleAssignImageToPhone(url, phone.id);
                                      })
                                    }
                                    className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                  >
                                    Change Image
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() =>
                                runWithProgress(
                                  () => updatePhone({ ...phone, isFeatured: !phone.isFeatured }),
                                  `${phone.name} featured status updated.`
                                )
                              }
                              className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                                phone.isFeatured
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              {phone.isFeatured ? '★ Featured' : 'Standard'}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() =>
                                runWithProgress(
                                  () => updatePhone({ ...phone, isPopular: !phone.isPopular }),
                                  `${phone.name} trending status updated.`
                                )
                              }
                              className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                                phone.isPopular
                                  ? 'bg-sky-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              {phone.isPopular ? 'Trending' : 'Normal'}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1.5">
                              {ALL_CATEGORY_BADGES.map((cat) => {
                                const active = tags.includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    onClick={() => toggleTag(cat)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                                      active
                                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 font-bold'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 9: MANAGE ADVERTISEMENTS & 8 PAGE AD PLACEMENTS
          ================================================================= */}
          {section === 'ads' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2.5">
                    <Megaphone className="w-6 h-6 text-emerald-500" />
                    <span>Ad Placements, Learn More Buttons &amp; Script Ad Codes</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage all 8 dedicated page ad placements, custom Learn More buttons, banner images, and HTML / JavaScript (&lt;script&gt;) ad codes. When a placement is turned off, its position on the page remains completely normal with zero empty space.
                  </p>
                </div>

                <button
                  onClick={() =>
                    runWithProgress(
                      () => updateAdSettings(localAdSettingsRef.current),
                      'Saved all Ad Placements, Learn More buttons, and Script Ad Codes.'
                    )
                  }
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer self-start shadow-md shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Ad Placements</span>
                </button>
              </div>

              {/* Hidden File Input for Uploading Ad Placement Banner Images to /uploads */}
              <input
                ref={adPlacementImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  const targetPlacementId = activeUploadPlacementIdRef.current;
                  if (!file || !targetPlacementId) return;
                  const targetPlacement =
                    localAdSettings.placements?.[targetPlacementId] ||
                    DEFAULT_AD_PLACEMENTS[targetPlacementId];
                  handleDirectFileUploadToServer(
                    file,
                    'banner',
                    `${targetPlacement.name} Banner`,
                    (url, mediaItem, dataUrl) => {
                      updatePlacementField(
                        targetPlacementId,
                        {
                          imageUrl: url,
                          imageDataUrl: dataUrl || mediaItem?.dataUrl || undefined,
                        },
                        true
                      );
                    }
                  );
                  e.target.value = '';
                }}
              />

              {/* Google AdSense, ads.txt & Search Engine Crawler Readiness Box */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-500/40 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Google AdSense Integration, /ads.txt &amp; Search Engine Indexability</span>
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Configure your Google AdSense Publisher ID, Auto Ads script, and dynamic <code className="font-mono text-emerald-600 dark:text-emerald-400">/ads.txt</code> file for instant AdSense verification.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <a
                      href="/ads.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 font-mono text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <span>/ads.txt</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 font-mono text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <span>/sitemap.xml</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="/robots.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 font-mono text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <span>/robots.txt</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-6 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Google AdSense Publisher ID (e.g. ca-pub-1234567890123456)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={localAdSettings.adsensePublisherId || ''}
                          onChange={(e) =>
                            setLocalAdSettings({
                              ...localAdSettings,
                              adsensePublisherId: e.target.value,
                            })
                          }
                          placeholder="ca-pub-0000000000000000"
                          className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const raw = (localAdSettings.adsensePublisherId || '').trim();
                            const digits = raw.replace(/\D/g, '') || '0000000000000000';
                            const generatedAdsTxt = `# GsmScope Authorized Digital Sellers (ads.txt)\ngoogle.com, pub-${digits}, DIRECT, f08c47fec0942fa0\n`;
                            const next = {
                              ...localAdSettings,
                              adsensePublisherId: `ca-pub-${digits}`,
                              adsTxtContent: generatedAdsTxt,
                            };
                            setLocalAdSettings(next);
                            updateAdSettings(next);
                            showGlobalToast('Updated AdSense Publisher ID & /ads.txt record.', 'success');
                          }}
                          className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shrink-0"
                        >
                          Sync /ads.txt
                        </button>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(localAdSettings.adsenseAutoAdsEnabled)}
                        onChange={(e) => {
                          const next = {
                            ...localAdSettings,
                            adsenseAutoAdsEnabled: e.target.checked,
                          };
                          setLocalAdSettings(next);
                          updateAdSettings(next);
                          showGlobalToast(
                            e.target.checked
                              ? 'Enabled Google AdSense Global Auto Ads script in <head>.'
                              : 'Disabled Google AdSense Auto Ads script.',
                            'info'
                          );
                        }}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                      <div>
                        <span className="block text-slate-900 dark:text-white font-bold">
                          Enable Google AdSense Global Auto Ads (&lt;head&gt; Script)
                        </span>
                        <span className="block text-[11px] text-slate-500 font-normal">
                          Automatically injects <code className="font-mono">adsbygoogle.js?client=ca-pub-...</code> across all public pages.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="lg:col-span-6 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-500">
                        Live <code className="font-mono text-emerald-600 dark:text-emerald-400">/ads.txt</code> Content (Served at root domain for AdSense crawler)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          runWithProgress(
                            () => updateAdSettings(localAdSettings),
                            'Saved /ads.txt and Google AdSense settings.'
                          )
                        }
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Save /ads.txt
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={
                        localAdSettings.adsTxtContent ??
                        '# GsmScope Authorized Digital Sellers (ads.txt)\ngoogle.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n'
                      }
                      onChange={(e) =>
                        setLocalAdSettings({
                          ...localAdSettings,
                          adsTxtContent: e.target.value,
                        })
                      }
                      placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                      className="w-full p-2.5 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 text-xs font-mono leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Placement Status Overview & Filter Bar */}
              {(() => {
                const placementsMap = {
                  ...DEFAULT_AD_PLACEMENTS,
                  ...(localAdSettings.placements || {}),
                };
                const enabledCount = AD_PLACEMENT_ORDER.filter((id) => placementsMap[id]?.enabled).length;
                const filteredIds = AD_PLACEMENT_ORDER.filter((id) => {
                  if (adPlacementFilter === 'header') return id === 'header_top';
                  if (adPlacementFilter === 'home') return id.startsWith('home_');
                  if (adPlacementFilter === 'phones')
                    return id === 'phones_below_top_result' || id === 'best_above_top_rated';
                  if (adPlacementFilter === 'editorial')
                    return id === 'news_below_featured' || id === 'guides_below_featured';
                  return true;
                });

                return (
                  <div className="space-y-5">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { id: 'all', label: `All 8 Placements (${enabledCount} Active)` },
                          { id: 'header', label: 'Top Header Ad (1)' },
                          { id: 'home', label: 'Homepage Placements (3)' },
                          { id: 'phones', label: 'Phones & Best Phones (2)' },
                          { id: 'editorial', label: 'News & Buying Guides (2)' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setAdPlacementFilter(tab.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              adPlacementFilter === tab.id
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...placementsMap };
                            AD_PLACEMENT_ORDER.forEach((id) => {
                              updated[id] = { ...updated[id], enabled: true };
                            });
                            const next = {
                              ...localAdSettings,
                              topBanner: { ...localAdSettings.topBanner, enabled: true },
                              placements: updated,
                            };
                            setLocalAdSettings(next);
                            updateAdSettings(next);
                            showGlobalToast('Enabled all 8 ad placements.', 'success');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white font-semibold cursor-pointer transition-colors"
                        >
                          Enable All 8
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...placementsMap };
                            AD_PLACEMENT_ORDER.forEach((id) => {
                              updated[id] = { ...updated[id], enabled: false };
                            });
                            const next = {
                              ...localAdSettings,
                              topBanner: { ...localAdSettings.topBanner, enabled: false },
                              placements: updated,
                            };
                            setLocalAdSettings(next);
                            updateAdSettings(next);
                            showGlobalToast('Disabled all 8 ad placements. Page layouts are in normal mode.', 'info');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 text-slate-600 dark:text-slate-300 hover:text-white font-semibold cursor-pointer transition-colors"
                        >
                          Turn Off All 8
                        </button>
                      </div>
                    </div>

                    {/* 7 Dedicated Page Ad Placement Cards */}
                    <div className="grid grid-cols-1 gap-5">
                      {filteredIds.map((placementId, idx) => {
                        const item: AdPlacementConfig = {
                          ...DEFAULT_AD_PLACEMENTS[placementId],
                          ...(placementsMap[placementId] || {}),
                          id: DEFAULT_AD_PLACEMENTS[placementId].id,
                          name: DEFAULT_AD_PLACEMENTS[placementId].name,
                          pageLabel: DEFAULT_AD_PLACEMENTS[placementId].pageLabel,
                          positionLabel: DEFAULT_AD_PLACEMENTS[placementId].positionLabel,
                        };

                        return (
                          <div
                            key={placementId}
                            className={`rounded-2xl border transition-all overflow-hidden shadow-sm ${
                              item.enabled
                                ? 'bg-white dark:bg-slate-900 border-emerald-500/60 shadow-md'
                                : 'bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {/* Card Top Bar */}
                            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                                  #{idx + 1}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] uppercase font-bold">
                                  {item.pageLabel}
                                </span>
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                                  {item.positionLabel}
                                </h2>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                                    item.enabled
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                  }`}
                                >
                                  {item.enabled ? 'ENABLED · LIVE ON PAGE' : 'OFF · NORMAL LAYOUT'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <label className="inline-flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold">
                                  <input
                                    type="checkbox"
                                    checked={item.enabled}
                                    onChange={(e) => {
                                      const nextEnabled = e.target.checked;
                                      updatePlacementField(placementId, { enabled: nextEnabled }, true);
                                      showGlobalToast(
                                        nextEnabled
                                          ? `Enabled placement: ${item.positionLabel}`
                                          : `Turned off placement: ${item.positionLabel} (normal page layout restored)`,
                                        nextEnabled ? 'success' : 'info'
                                      );
                                    }}
                                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                                  />
                                  <span className={item.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>
                                    {item.enabled ? 'Placement Enabled' : 'Enable Placement'}
                                  </span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() =>
                                    runWithProgress(
                                      () => updateAdSettings(localAdSettingsRef.current),
                                      `Saved "${item.positionLabel}" placement settings.`
                                    )
                                  }
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                              </div>
                            </div>

                            {/* Card Body: Mode Selector + Banner/Learn More Fields + Script Code */}
                            <div className="p-5 space-y-4">
                              {/* Ad Display Mode Selector */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-bold uppercase text-slate-500 mr-1">
                                    Ad Display Mode:
                                  </span>
                                  {[
                                    { value: 'banner', label: 'Banner + Learn More Button' },
                                    { value: 'script', label: 'Script / HTML Ad Code Only' },
                                    { value: 'both', label: 'Both Banner & Script Code' },
                                  ].map((modeOpt) => (
                                    <button
                                      key={modeOpt.value}
                                      type="button"
                                      onClick={() =>
                                        updatePlacementField(
                                          placementId,
                                          {
                                            adType: modeOpt.value as AdPlacementConfig['adType'],
                                          },
                                          true
                                        )
                                      }
                                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                        item.adType === modeOpt.value
                                          ? 'bg-emerald-600 text-white border-emerald-500'
                                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                                      }`}
                                    >
                                      {modeOpt.label}
                                    </button>
                                  ))}
                                </div>

                                <span className="text-[11px] font-mono text-slate-400">
                                  Slot ID: <code className="text-emerald-600 dark:text-emerald-400">{placementId}</code>
                                </span>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                {/* Left 7 Cols: Banner Content, Image & Learn More Button */}
                                <div className="lg:col-span-7 space-y-3.5">
                                  <div className="text-xs font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400">
                                    1. Banner Copy, Creative Image &amp; Learn More Button
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="sm:col-span-2">
                                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                        Ad Headline / Title
                                      </label>
                                      <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) =>
                                          updatePlacementField(placementId, { title: e.target.value })
                                        }
                                        placeholder="Enter promotional headline..."
                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-semibold"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                        Sponsor Badge Label
                                      </label>
                                      <input
                                        type="text"
                                        value={item.badgeText}
                                        onChange={(e) =>
                                          updatePlacementField(placementId, { badgeText: e.target.value })
                                        }
                                        placeholder="Sponsored"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                      Ad Subtitle / Description
                                    </label>
                                    <input
                                      type="text"
                                      value={item.subtitle}
                                      onChange={(e) =>
                                        updatePlacementField(placementId, { subtitle: e.target.value })
                                      }
                                      placeholder="Short supporting copy for this ad placement..."
                                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                                    />
                                  </div>

                                  {/* Optional Banner Image Upload / Media Library */}
                                  <div className="space-y-2">
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                      Banner Image URL (Optional — Rendered in Original Image Size)
                                    </label>
                                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                                      <input
                                        type="text"
                                        value={item.imageUrl || ''}
                                        onChange={(e) =>
                                          updatePlacementField(placementId, { imageUrl: e.target.value })
                                        }
                                        placeholder="/uploads/... or https://..."
                                        className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          activeUploadPlacementIdRef.current = placementId;
                                          adPlacementImageInputRef.current?.click();
                                        }}
                                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                                      >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Upload</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openMediaPicker(
                                            `Select Banner Image for ${item.name}`,
                                            'banner',
                                            (url) => {
                                              const matchedMedia = mediaLibrary.find((m) => m.url === url);
                                              updatePlacementField(
                                                placementId,
                                                {
                                                  imageUrl: url,
                                                  imageDataUrl: matchedMedia?.dataUrl || undefined,
                                                },
                                                true
                                              );
                                            }
                                          )
                                        }
                                        className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                                      >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        <span>Library</span>
                                      </button>
                                      {(item.imageUrl || item.imageDataUrl) && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updatePlacementField(
                                              placementId,
                                              { imageUrl: '', imageDataUrl: '' },
                                              true
                                            )
                                          }
                                          className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white text-xs cursor-pointer shrink-0"
                                          title="Remove image"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                    {(item.imageUrl || item.imageDataUrl) && (
                                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-x-auto">
                                        <img
                                          src={item.imageUrl || item.imageDataUrl}
                                          onError={(e) => {
                                            if (item.imageDataUrl && e.currentTarget.src !== item.imageDataUrl) {
                                              e.currentTarget.src = item.imageDataUrl;
                                            }
                                          }}
                                          alt={item.title || item.name}
                                          className="w-auto h-auto max-w-full block rounded-lg"
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Learn More Button Configuration Box */}
                                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={item.showLearnMore}
                                          onChange={(e) =>
                                            updatePlacementField(placementId, { showLearnMore: e.target.checked }, true)
                                          }
                                          className="accent-emerald-600 cursor-pointer"
                                        />
                                        <span>Show &ldquo;Learn More&rdquo; Action Button</span>
                                      </label>

                                      <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={Boolean(item.openInNewTab)}
                                          onChange={(e) =>
                                            updatePlacementField(placementId, { openInNewTab: e.target.checked }, true)
                                          }
                                          className="accent-emerald-600 cursor-pointer"
                                        />
                                        <span>Open external URL in new tab</span>
                                      </label>
                                    </div>

                                    {item.showLearnMore && (
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                          <label className="block text-[11px] text-slate-500 mb-1">
                                            Button Label Text
                                          </label>
                                          <input
                                            type="text"
                                            value={item.learnMoreText}
                                            onChange={(e) =>
                                              updatePlacementField(placementId, { learnMoreText: e.target.value })
                                            }
                                            placeholder="Learn More"
                                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                                          />
                                        </div>
                                        <div className="sm:col-span-2">
                                          <label className="block text-[11px] text-slate-500 mb-1">
                                            Button Destination URL (https://... or /?tab=...)
                                          </label>
                                          <input
                                            type="text"
                                            value={item.learnMoreUrl}
                                            onChange={(e) =>
                                              updatePlacementField(placementId, { learnMoreUrl: e.target.value })
                                            }
                                            placeholder="https://example.com or /?tab=phones"
                                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Right 5 Cols: Script / HTML Ad Code Editor */}
                                <div className="lg:col-span-5 flex flex-col justify-between space-y-2">
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <label className="text-xs font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                        <Code2 className="w-4 h-4" />
                                        <span>2. Script / HTML Ad Code</span>
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const rawPub = (localAdSettings.adsensePublisherId || '').trim();
                                          const clientPub = rawPub.startsWith('ca-pub-')
                                            ? rawPub
                                            : rawPub.startsWith('pub-')
                                              ? `ca-${rawPub}`
                                              : 'ca-pub-0000000000000000';
                                          const snippet = `<!-- Google AdSense Responsive Unit (${item.positionLabel}) -->\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientPub}" crossorigin="anonymous"></script>\n<ins class="adsbygoogle"\n     style="display:block"\n     data-ad-client="${clientPub}"\n     data-ad-slot="${1000000001 + idx}"\n     data-ad-format="auto"\n     data-full-width-responsive="true"></ins>\n<script>\n     (adsbygoogle = window.adsbygoogle || []).push({});\n</script>`;
                                          updatePlacementField(
                                            placementId,
                                            {
                                              scriptCode: snippet,
                                              adType: item.adType === 'banner' ? 'both' : item.adType,
                                            },
                                            true
                                          );
                                          showGlobalToast(`Inserted AdSense template for ${item.positionLabel}`, 'info');
                                        }}
                                        className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                      >
                                        + Insert AdSense Code
                                      </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                      Paste Google AdSense tags, custom network <code className="font-mono">&lt;script&gt;</code> snippets, or HTML banner code for <strong>{item.positionLabel}</strong>.
                                    </p>
                                    <textarea
                                      rows={7}
                                      value={item.scriptCode}
                                      onChange={(e) => {
                                        const code = e.target.value;
                                        const shouldSwitchMode =
                                          code.trim().length > 0 && item.adType === 'banner'
                                            ? 'both'
                                            : item.adType;
                                        updatePlacementField(placementId, {
                                          scriptCode: code,
                                          adType: shouldSwitchMode,
                                        });
                                      }}
                                      placeholder={`<!-- Paste ad script or HTML code for ${item.name} -->\n<script async src="https://..."></script>\n<ins class="adsbygoogle" ...></ins>`}
                                      className="w-full p-3 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 focus:border-emerald-500 outline-none text-xs font-mono leading-relaxed"
                                    />
                                  </div>

                                  <div className="p-2.5 rounded-lg bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                                    <span>
                                      When disabled, this placement renders <strong>nothing</strong> so the page layout stays normal.
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    runWithProgress(
                      () => updateAdSettings(localAdSettingsRef.current),
                      'Saved all Ad Placements, Learn More buttons, and Script Ad Codes.'
                    )
                  }
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Ad Placements</span>
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 10: MANAGE WEBSITE CONTENT, HEADER LOGOS & GLOBAL SEO
          ================================================================= */}
          {section === 'content' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Website Branding, Header Logo, Global SEO & Site Settings
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload or change the Header Logo, Footer Logo, Favicon, global SEO Title & Keywords, social links, and site copy. All changes persist on your cPanel server.
                  </p>
                </div>
                <button
                  onClick={() =>
                    runWithProgress(() => {
                      updateWebsiteContent(websiteContent);
                      document.title =
                        websiteContent.seoTitle?.trim() ||
                        `${websiteContent.siteName} — ${websiteContent.siteTagline}`;
                    }, 'Saved Website Branding, Header Logos & SEO Settings to server.')
                  }
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer self-start shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Site Settings</span>
                </button>
              </div>

              {/* 1. HEADER LOGO, FOOTER LOGO & FAVICON MANAGEMENT */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-5 max-w-5xl shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>1. Header Logo, Footer Logo & Favicon Management</span>
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload new logo files directly to <code className="font-mono">/uploads</code> or select from your Media Library. Updates reflect across the main header, admin login, admin bar, and footer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      applyAndPersistWebsiteContentPatch(
                        {
                          headerLogoDarkUrl: '/assets/aistudio/GsmScope_header_logo_dark.webp',
                          headerLogoLightUrl: '/assets/aistudio/GsmScope_header_logo_fc9cfbb4.webp',
                          faviconUrl: '/favicon.ico',
                        },
                        'Restored and saved default GsmScope logos and favicon.'
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Restore Default Logos
                  </button>
                </div>

                {/* Hidden File Inputs for Logos */}
                <input
                  ref={headerDarkLogoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    handleDirectFileUploadToServer(
                      file,
                      'logo',
                      'Main Header Logo (Dark)',
                      (url) =>
                        applyAndPersistWebsiteContentPatch(
                          { headerLogoDarkUrl: url, headerLogoUrl: url },
                          'Main Header Logo uploaded and saved.'
                        )
                    );
                    e.target.value = '';
                  }}
                />
                <input
                  ref={headerLightLogoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    handleDirectFileUploadToServer(
                      file,
                      'logo',
                      'Footer / Light Header Logo',
                      (url) =>
                        applyAndPersistWebsiteContentPatch(
                          { headerLogoLightUrl: url },
                          'Footer / Light Logo uploaded and saved.'
                        )
                    );
                    e.target.value = '';
                  }}
                />
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    handleDirectFileUploadToServer(
                      file,
                      'logo',
                      'Site Favicon',
                      (url) =>
                        applyAndPersistWebsiteContentPatch(
                          { faviconUrl: url },
                          'Browser Tab Favicon uploaded and saved.'
                        )
                    );
                    e.target.value = '';
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Primary Header Logo (Dark / Main Navbar & Admin Bar) */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Main Header & Admin Logo
                    </div>
                    <div className="h-20 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-3">
                      <img
                        src={websiteContent.headerLogoDarkUrl || '/assets/aistudio/GsmScope_header_logo_dark.webp'}
                        alt="Main Header Logo Preview"
                        className="max-h-12 w-auto object-contain"
                      />
                    </div>
                    <input
                      type="text"
                      value={websiteContent.headerLogoDarkUrl || ''}
                      onChange={(e) =>
                        setWebsiteContent({ ...websiteContent, headerLogoDarkUrl: e.target.value })
                      }
                      placeholder="/assets/aistudio/GsmScope_header_logo_dark.webp"
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => headerDarkLogoInputRef.current?.click()}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openMediaPicker('Select Main Header Logo', 'logo', (url) =>
                            applyAndPersistWebsiteContentPatch(
                              { headerLogoDarkUrl: url, headerLogoUrl: url },
                              'Main Header Logo selected and saved.'
                            )
                          )
                        }
                        className="py-1.5 px-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-[11px] font-semibold cursor-pointer"
                      >
                        Library
                      </button>
                    </div>
                  </div>

                  {/* Secondary / Footer Logo (Light) */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Footer & Light Mode Logo
                    </div>
                    <div className="h-20 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center p-3">
                      <img
                        src={websiteContent.headerLogoLightUrl || '/assets/aistudio/GsmScope_header_logo_fc9cfbb4.webp'}
                        alt="Light Header Logo Preview"
                        className="max-h-12 w-auto object-contain"
                      />
                    </div>
                    <input
                      type="text"
                      value={websiteContent.headerLogoLightUrl || ''}
                      onChange={(e) =>
                        setWebsiteContent({ ...websiteContent, headerLogoLightUrl: e.target.value })
                      }
                      placeholder="/assets/aistudio/GsmScope_header_logo_fc9cfbb4.webp"
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => headerLightLogoInputRef.current?.click()}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openMediaPicker('Select Footer / Light Logo', 'logo', (url) =>
                            applyAndPersistWebsiteContentPatch(
                              { headerLogoLightUrl: url },
                              'Footer / Light Logo selected and saved.'
                            )
                          )
                        }
                        className="py-1.5 px-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-[11px] font-semibold cursor-pointer"
                      >
                        Library
                      </button>
                    </div>
                  </div>

                  {/* Site Favicon */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Browser Tab Favicon
                    </div>
                    <div className="h-20 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-3">
                      <img
                        src={websiteContent.faviconUrl || '/favicon.ico'}
                        alt="Favicon Preview"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <input
                      type="text"
                      value={websiteContent.faviconUrl || '/favicon.ico'}
                      onChange={(e) =>
                        setWebsiteContent({ ...websiteContent, faviconUrl: e.target.value })
                      }
                      placeholder="/favicon.ico"
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openMediaPicker('Select Site Favicon', 'logo', (url) =>
                            applyAndPersistWebsiteContentPatch(
                              { faviconUrl: url },
                              'Browser Tab Favicon selected and saved.'
                            )
                          )
                        }
                        className="py-1.5 px-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-[11px] font-semibold cursor-pointer"
                      >
                        Library
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. GLOBAL SEO TITLE, FOCUS KEYWORDS & SEARCH META DESCRIPTION */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-5xl shadow-sm">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h2 className="text-sm font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>2. Global Homepage SEO Title, Focus Keywords & Meta Description</span>
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure default search engine title, focus keywords, and meta description for the homepage and general directory views.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Global Homepage SEO Title
                    </label>
                    <input
                      type="text"
                      value={websiteContent.seoTitle || ''}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, seoTitle: e.target.value })}
                      placeholder="GsmScope — Mobile Phone Specifications, Prices in Nigeria (₦) & Global Tech Reviews"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Global SEO Focus Keywords (Comma-Separated)
                    </label>
                    <input
                      type="text"
                      value={websiteContent.seoKeywords || ''}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, seoKeywords: e.target.value })}
                      placeholder="GsmScope, phone prices in Nigeria, smartphone specifications, Samsung prices Lagos, Infinix specs"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Global SEO Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={websiteContent.seoDescription || ''}
                    onChange={(e) => setWebsiteContent({ ...websiteContent, seoDescription: e.target.value })}
                    placeholder="Discover accurate mobile phone specifications, side-by-side comparisons, verified Nigerian Naira (₦) and USD ($) prices, buying guides, and user reviews on GsmScope."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* 3. SITE IDENTITY, CONTACT INFORMATION & FOOTER TEXT */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-5xl shadow-sm">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h2 className="text-sm font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400">
                    3. Site Identity, Contact Information &amp; Footer Text
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Site Name</label>
                    <input
                      type="text"
                      value={websiteContent.siteName}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, siteName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Site Tagline</label>
                    <input
                      type="text"
                      value={websiteContent.siteTagline}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, siteTagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>



                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={websiteContent.contactEmail}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={websiteContent.contactPhone}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Office Location</label>
                    <input
                      type="text"
                      value={websiteContent.officeLocation}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, officeLocation: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                {/* Social Media & Community Links */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400 mb-3">
                    Social Media & Community Links (Footer & Contact Page)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Facebook Page URL</label>
                      <input
                        type="text"
                        value={websiteContent.facebookUrl || ''}
                        onChange={(e) => setWebsiteContent({ ...websiteContent, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/gsmscope"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">YouTube Channel URL</label>
                      <input
                        type="text"
                        value={websiteContent.youtubeUrl || ''}
                        onChange={(e) => setWebsiteContent({ ...websiteContent, youtubeUrl: e.target.value })}
                        placeholder="https://youtube.com/@gsmscope"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Footer Copyright Text</label>
                    <input
                      type="text"
                      value={websiteContent.footerCopyright}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, footerCopyright: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={() =>
                    runWithProgress(() => {
                      const syncedContent = {
                        ...websiteContent,
                        defaultSeoTitle: websiteContent.seoTitle || websiteContent.defaultSeoTitle,
                        defaultSeoKeywords: websiteContent.seoKeywords || websiteContent.defaultSeoKeywords,
                        defaultSeoDescription: websiteContent.seoDescription || websiteContent.defaultSeoDescription,
                      };
                      setWebsiteContent(syncedContent);
                      updateWebsiteContent(syncedContent);
                      document.title =
                        websiteContent.seoTitle?.trim() ||
                        `${websiteContent.siteName} — ${websiteContent.siteTagline}`;
                    }, 'Website branding, logos, and SEO settings saved.')
                  }
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Website Content & Branding</span>
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 11: MANAGE SPECIFICATIONS TABLES & SUBTABLES
          ================================================================= */}
          {section === 'spec-tables' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Manage Specifications Tables & Subtables
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add, rename, reorder, or toggle main specification tables (GENERAL, DESIGN, DISPLAY, CAMERA, BATTERY, MEMORY, PLATFORM, SECURITY, NETWORK, CONNECTIVITY, MULTIMEDIA) and their subtable rows.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start">
                  <button
                    type="button"
                    onClick={() =>
                      runWithProgress(
                        () => {
                          persistSpecTablesSchema(DEFAULT_SPEC_TABLES);
                        },
                        'Restored default specification tables & subtables.'
                      )
                    }
                    className="px-3.5 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    onClick={() =>
                      runWithProgress(
                        () => {
                          persistSpecTablesSchema(specTablesSchema);
                        },
                        'Saved Specification Tables & Subtables schema to server.'
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Schema Changes</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={newTableTitle}
                  onChange={(e) => setNewTableTitle(e.target.value)}
                  placeholder="New Main Table Heading (e.g. BENCHMARKS & TESTS)"
                  className="flex-1 min-w-[220px] px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs uppercase font-mono"
                />
                <button
                  onClick={() => {
                    if (!newTableTitle.trim()) return;
                    const created: SpecTableGroup = {
                      id: `tbl-${Date.now()}`,
                      title: newTableTitle.trim().toUpperCase(),
                      code: newTableTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                      enabled: true,
                      subtables: [],
                    };
                    const next = [...specTablesSchema, created];
                    persistSpecTablesSchema(next, `Added table "${created.title}".`);
                    setNewTableTitle('');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Main Spec Table</span>
                </button>
              </div>

              <div className="space-y-4">
                {specTablesSchema.map((group, idx) => {
                  const subDraft = newSubtableLabels[group.id] || { label: '', keyPath: '' };
                  return (
                    <div
                      key={group.id}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                    >
                      <div className="bg-slate-100 dark:bg-slate-950 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={group.enabled}
                            onChange={(e) => {
                              const next = [...specTablesSchema];
                              next[idx] = { ...group, enabled: e.target.checked };
                              persistSpecTablesSchema(
                                next,
                                `${e.target.checked ? 'Enabled' : 'Hidden'} table "${group.title}".`
                              );
                            }}
                            className="accent-emerald-600"
                          />
                          <input
                            type="text"
                            value={group.title}
                            onChange={(e) => {
                              const next = [...specTablesSchema];
                              next[idx] = { ...group, title: e.target.value.toUpperCase() };
                              persistSpecTablesSchema(next, undefined, true);
                            }}
                            className="font-mono font-bold text-xs uppercase bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none text-slate-900 dark:text-white"
                          />
                          <span className="text-[10px] font-mono text-slate-400">
                            ({group.subtables.length} subtable rows)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              if (idx === 0) return;
                              const next = [...specTablesSchema];
                              const temp = next[idx - 1];
                              next[idx - 1] = next[idx];
                              next[idx] = temp;
                              persistSpecTablesSchema(next);
                            }}
                            className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === specTablesSchema.length - 1}
                            onClick={() => {
                              if (idx === specTablesSchema.length - 1) return;
                              const next = [...specTablesSchema];
                              const temp = next[idx + 1];
                              next[idx + 1] = next[idx];
                              next[idx] = temp;
                              persistSpecTablesSchema(next);
                            }}
                            className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = specTablesSchema.filter((g) => g.id !== group.id);
                              persistSpecTablesSchema(next, `Deleted table "${group.title}".`);
                            }}
                            className="p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        {group.subtables.map((sub, sIdx) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between gap-3 py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/70 text-xs"
                          >
                            <div className="flex items-center gap-2.5 flex-1">
                              <input
                                type="checkbox"
                                checked={sub.enabled}
                                onChange={(e) => {
                                  const next = [...specTablesSchema];
                                  const updatedSubs = [...group.subtables];
                                  updatedSubs[sIdx] = { ...sub, enabled: e.target.checked };
                                  next[idx] = { ...group, subtables: updatedSubs };
                                  persistSpecTablesSchema(
                                    next,
                                    `${e.target.checked ? 'Enabled' : 'Hidden'} subtable "${sub.label}" in ${group.title}.`
                                  );
                                }}
                                className="accent-emerald-600"
                              />
                              <input
                                type="text"
                                value={sub.label}
                                onChange={(e) => {
                                  const next = [...specTablesSchema];
                                  const updatedSubs = [...group.subtables];
                                  updatedSubs[sIdx] = { ...sub, label: e.target.value };
                                  next[idx] = { ...group, subtables: updatedSubs };
                                  persistSpecTablesSchema(next, undefined, true);
                                }}
                                className="font-semibold bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none text-slate-800 dark:text-slate-200"
                              />
                              <span className="text-[10px] font-mono text-slate-400">{sub.keyPath}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...specTablesSchema];
                                next[idx] = {
                                  ...group,
                                  subtables: group.subtables.filter((s) => s.id !== sub.id),
                                };
                                persistSpecTablesSchema(
                                  next,
                                  `Deleted subtable "${sub.label}" from ${group.title}.`
                                );
                              }}
                              className="text-rose-500 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={subDraft.label}
                            onChange={(e) =>
                              setNewSubtableLabels({
                                ...newSubtableLabels,
                                [group.id]: { ...subDraft, label: e.target.value },
                              })
                            }
                            placeholder="New subtable row label (e.g. Touch Sampling Rate)"
                            className="flex-1 min-w-[180px] px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                          />
                          <input
                            type="text"
                            value={subDraft.keyPath}
                            onChange={(e) =>
                              setNewSubtableLabels({
                                ...newSubtableLabels,
                                [group.id]: { ...subDraft, keyPath: e.target.value },
                              })
                            }
                            placeholder="Field key (optional, auto-generated if blank)"
                            className="w-56 px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!subDraft.label.trim()) return;
                              const cleanLabelSlug = subDraft.label
                                .trim()
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '_')
                                .replace(/^_+|_+$/g, '');
                              const autoKeyPath = `${group.code || 'custom'}.${cleanLabelSlug || `field_${Date.now()}`}`;
                              const createdSub: SpecSubtableItem = {
                                id: `sub-${Date.now()}`,
                                label: subDraft.label.trim(),
                                keyPath: subDraft.keyPath.trim() || autoKeyPath,
                                enabled: true,
                              };
                              const next = [...specTablesSchema];
                              next[idx] = {
                                ...group,
                                subtables: [...group.subtables, createdSub],
                              };
                              persistSpecTablesSchema(
                                next,
                                `Added subtable "${createdSub.label}" to ${group.title}.`
                              );
                              setNewSubtableLabels({
                                ...newSubtableLabels,
                                [group.id]: { label: '', keyPath: '' },
                              });
                            }}
                            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                          >
                            + Add Subtable Row
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 12: MANAGE USERS & ROLES
          ================================================================= */}
          {section === 'users' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                  Manage Users & Access Roles ({usersList.length})
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add administrators, editors, authors, and moderators, or update account permissions.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!userForm.username.trim() || !userForm.email.trim()) return;
                    runWithProgress(() => {
                      if (editingUserId) {
                        const next = usersList.map((u) =>
                          u.id === editingUserId ? { ...u, ...userForm } : u
                        );
                        setUsersList(next);
                        localStorage.setItem('gsmscope_admin_users_v1', JSON.stringify(next));
                        updateWebsiteContent({ adminUsers: next });
                        setEditingUserId(null);
                      } else {
                        const created: AdminUserRecord = {
                          id: `usr-${Date.now()}`,
                          username: userForm.username.trim(),
                          name: userForm.name.trim() || userForm.username.trim(),
                          email: userForm.email.trim(),
                          role: userForm.role,
                          status: userForm.status,
                          lastLogin: 'Never',
                        };
                        const next = [...usersList, created];
                        setUsersList(next);
                        localStorage.setItem('gsmscope_admin_users_v1', JSON.stringify(next));
                        updateWebsiteContent({ adminUsers: next });
                      }
                      setUserForm({
                        username: '',
                        name: '',
                        email: '',
                        role: 'Editor',
                        status: 'Active',
                      });
                    }, editingUserId ? 'Updated user account.' : 'Added new user account.');
                  }}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 h-fit"
                >
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingUserId ? 'Edit User' : 'Add New User'}
                  </h2>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      placeholder="e.g. editor_sam"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Full Display Name</label>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      placeholder="e.g. Samuel Adeyemi"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="sam@gsmscope.com"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Role</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="Editor">Editor</option>
                        <option value="Author">Author</option>
                        <option value="Moderator">Moderator</option>
                        <option value="Subscriber">Subscriber</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Status</label>
                      <select
                        value={userForm.status}
                        onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    {editingUserId ? 'Update User' : 'Create User Account'}
                  </button>
                </form>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="w-full overflow-x-auto touch-pan-x">
                    <table className="w-full min-w-[560px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-mono uppercase text-slate-500">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Last Login</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400">
                              @{u.username} · {u.email}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-semibold">{u.role}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'Active'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-rose-500/15 text-rose-500'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400">{u.lastLogin}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingUserId(u.id);
                                  setUserForm({
                                    username: u.username,
                                    name: u.name,
                                    email: u.email,
                                    role: u.role,
                                    status: u.status,
                                  });
                                }}
                                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-xs font-semibold cursor-pointer"
                              >
                                Edit
                              </button>
                              {u.username !== 'admin' && (
                                <button
                                  onClick={() => {
                                    const next = usersList.filter((item) => item.id !== u.id);
                                    setUsersList(next);
                                    localStorage.setItem('gsmscope_admin_users_v1', JSON.stringify(next));
                                    updateWebsiteContent({ adminUsers: next });
                                    showGlobalToast(`Removed user @${u.username}.`, 'info');
                                  }}
                                  className="p-1 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 13: MANAGE HEADER / BODY / FOOTER SCRIPTS & META CODES
          ================================================================= */}
          {section === 'scripts' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                  Header, Body & Footer Scripts / Meta Codes
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inject custom HTML &lt;meta&gt; verification tags, Google Analytics, AdSense scripts, or custom JavaScript into &lt;head&gt;, &lt;body&gt;, and &lt;footer&gt;.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-5 max-w-4xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Google Search Console Meta Tag
                    </label>
                    <input
                      type="text"
                      value={scriptsConfig.metaVerificationGoogle}
                      onChange={(e) =>
                        setScriptsConfig({ ...scriptsConfig, metaVerificationGoogle: e.target.value })
                      }
                      placeholder='<meta name="google-site-verification" content="your-code" />'
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Bing / Webmaster Verification Meta Tag
                    </label>
                    <input
                      type="text"
                      value={scriptsConfig.metaVerificationBing}
                      onChange={(e) =>
                        setScriptsConfig({ ...scriptsConfig, metaVerificationBing: e.target.value })
                      }
                      placeholder='<meta name="msvalidate.01" content="your-code" />'
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Robots Meta Directive
                  </label>
                  <input
                    type="text"
                    value={scriptsConfig.robotsTxtMeta}
                    onChange={(e) => setScriptsConfig({ ...scriptsConfig, robotsTxtMeta: e.target.value })}
                    placeholder="index, follow, max-image-preview:large"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                    Custom &lt;head&gt; Meta Tags &amp; Header Scripts (Analytics, AdSense, Pixels)
                  </label>
                  <textarea
                    rows={4}
                    value={scriptsConfig.headerScripts}
                    onChange={(e) => setScriptsConfig({ ...scriptsConfig, headerScripts: e.target.value })}
                    placeholder={'<!-- Paste <meta ...> verification tags, Google Analytics, or AdSense head scripts -->'}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-sky-600 dark:text-sky-400 mb-1">
                    Custom &lt;body&gt; Opening Scripts (GTM Noscript, Top Trackers)
                  </label>
                  <textarea
                    rows={3}
                    value={scriptsConfig.bodyTopScripts}
                    onChange={(e) => setScriptsConfig({ ...scriptsConfig, bodyTopScripts: e.target.value })}
                    placeholder={'<!-- Custom Body Open Script (e.g. GTM noscript) -->'}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 text-sky-300 border border-slate-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-purple-600 dark:text-purple-400 mb-1">
                    Custom &lt;footer&gt; Closing Scripts (Live Chat Widgets, Deferred JS)
                  </label>
                  <textarea
                    rows={4}
                    value={scriptsConfig.footerScripts}
                    onChange={(e) => setScriptsConfig({ ...scriptsConfig, footerScripts: e.target.value })}
                    placeholder={'<!-- Custom Footer Analytics / Chat Widget Script -->'}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 text-purple-300 border border-slate-800 text-xs font-mono"
                  />
                </div>

                <button
                  onClick={() => {
                    startGlobalLoading();
                    const cleanedScripts = { ...scriptsConfig };
                    try {
                      localStorage.setItem('gsmscope_custom_scripts_v1', JSON.stringify(cleanedScripts));
                    } catch {}
                    const nextContent: WebsiteContentSettings = {
                      ...websiteContentRef.current,
                      customScripts: cleanedScripts,
                    };
                    websiteContentRef.current = nextContent;
                    setWebsiteContent(nextContent);
                    updateWebsiteContent({ customScripts: cleanedScripts })
                      .finally(() => {
                        stopGlobalLoading();
                        showGlobalToast('Saved Header, Body, and Footer scripts & meta codes to server.', 'success');
                      });
                  }}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Scripts &amp; Meta Codes</span>
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 14: TOOLS & JSON DATABASE BACKUP
          ================================================================= */}
          {section === 'backup' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                  Database Tools, Export & Restore
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Export the entire GsmScope database as JSON, import a snapshot, verify cPanel server connections, or reset to factory seed data.
                </p>
              </div>

              {/* cPanel & Full-Stack Connection Diagnostics Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-4xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-500" />
                      <span>cPanel & Live Server Connection Diagnostics</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Verifies backend API, persistent disk permissions (<code className="font-mono">data/database.json</code> &amp; <code className="font-mono">/uploads</code>), and SEO routes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRunConnectionCheck(true)}
                    disabled={isTestingConnections}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isTestingConnections ? 'animate-spin' : ''}`} />
                    <span>{isTestingConnections ? 'Checking Connections...' : 'Test All Connections'}</span>
                  </button>
                </div>

                {connectionReport && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-400">Express API Server</span>
                        <span className={connectionReport.online ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                          {connectionReport.online ? `Connected (${connectionReport.latencyMs}ms)` : 'Offline'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Mode: <strong className="text-slate-700 dark:text-slate-300">{connectionReport.health?.mode || 'unknown'}</strong> • Node {connectionReport.health?.nodeVersion || 'N/A'}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-400">Database & Disk Write</span>
                        <span className={connectionReport.health?.storage?.dataDirWritable && connectionReport.health?.storage?.uploadsDirWritable ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}>
                          {connectionReport.health?.storage?.dataDirWritable && connectionReport.health?.storage?.uploadsDirWritable ? 'Read / Write OK' : 'Check Permissions'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {connectionReport.health?.database.phonesCount ?? phones.length} phones • {connectionReport.health?.database.articlesCount ?? articles.length} posts • {connectionReport.health?.database.mediaCount ?? mediaLibrary.length} media
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-400">SEO &amp; Sitemap Endpoints</span>
                        <span className={connectionReport.seoEndpoints?.sitemapXmlOk && connectionReport.seoEndpoints?.adsTxtOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}>
                          {connectionReport.seoEndpoints?.sitemapXmlOk && connectionReport.seoEndpoints?.adsTxtOk ? 'Active' : 'Check Endpoints'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        ads.txt: {connectionReport.seoEndpoints?.adsTxtOk ? 'OK' : 'Err'} • sitemap: {connectionReport.seoEndpoints?.sitemapXmlOk ? 'OK' : 'Err'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-4xl">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setJsonText(exportDatabaseJson());
                      showGlobalToast('Generated JSON snapshot.', 'info');
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Generate Export JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!jsonText.trim()) return;
                      const ok = importDatabaseJson(jsonText);
                      if (ok) {
                        showGlobalToast('Database imported successfully!', 'success');
                      } else {
                        showGlobalToast('Invalid JSON format.', 'error');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import JSON Snapshot</span>
                  </button>
                  <button
                    onClick={() =>
                      runWithProgress(() => resetToDefaults(), 'Reset database to default factory seed.')
                    }
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Factory Defaults</span>
                  </button>
                </div>

                <textarea
                  rows={12}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder="Click 'Generate Export JSON' or paste a JSON backup here..."
                  className="w-full p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs border border-slate-800"
                />
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 14: MESSAGES
          ================================================================= */}
          {section === 'messages' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2.5">
                    <Mail className="w-6 h-6 text-cyan-500" />
                    <span>Messages ({contactInquiries.length})</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Receive, read, and delete messages submitted through the website.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      startGlobalLoading();
                      fetchContactInquiriesApi().then((data) => {
                        stopGlobalLoading();
                        if (data && Array.isArray(data)) {
                          setContactInquiries(data);
                          try {
                            localStorage.setItem('gsmscope_contact_inquiries_v1', JSON.stringify(data));
                          } catch {}
                          showGlobalToast(`Refreshed messages (${data.length})`, 'info');
                        }
                      });
                    }}
                    className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-cyan-500 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Search Toolbar */}
              <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    placeholder="Search messages by sender name, email, subject, phone, or keyword..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                  {inquirySearch && (
                    <button
                      onClick={() => setInquirySearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Messages List / Cards */}
              <div className="space-y-3">
                {contactInquiries
                  .filter((item) => {
                    const q = inquirySearch.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      item.name.toLowerCase().includes(q) ||
                      item.email.toLowerCase().includes(q) ||
                      item.subject.toLowerCase().includes(q) ||
                      item.message.toLowerCase().includes(q) ||
                      (item.phone && item.phone.toLowerCase().includes(q))
                    );
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border p-4 sm:p-5 transition-all space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {item.name}
                            </span>
                            {item.category && (
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {item.category}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 font-mono text-cyan-600 dark:text-cyan-400">
                              <Mail className="w-3.5 h-3.5" />
                              <span>{item.email}</span>
                            </span>
                            {item.phone && (
                              <span className="flex items-center gap-1 font-mono">
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>{item.phone}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{new Date(item.createdAt).toLocaleString()}</span>
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              deleteContactInquiryApi(item.id).then(() => {
                                setContactInquiries((prev) => {
                                  const next = prev.filter((i) => i.id !== item.id);
                                  try {
                                    localStorage.setItem('gsmscope_contact_inquiries_v1', JSON.stringify(next));
                                  } catch {}
                                  return next;
                                });
                                showGlobalToast('Deleted message.', 'success');
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Subject & Message Body */}
                      <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="text-slate-400 font-normal">Subject:</span>
                          <span>{item.subject}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  ))}

                {contactInquiries.length === 0 && (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <Mail className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="text-sm font-bold text-slate-900 dark:text-white">No messages</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      No messages have been received yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}



          {/* =================================================================
              UNIVERSAL MEDIA LIBRARY PICKER MODAL (cPanel /uploads + Library)
          ================================================================= */}
          {mediaPickerModal && mediaPickerModal.isOpen && (
            <div
              onClick={() => setMediaPickerModal(null)}
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-emerald-500" />
                      <span>{mediaPickerModal.title}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select an existing asset from your Media Library or upload a new image directly to your server (<code className="font-mono">/uploads</code>).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMediaPickerModal(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Upload New File Bar inside Modal */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Showing <strong>{mediaLibrary.length}</strong> stored media assets
                  </div>
                  <label className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Image to Server</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        handleDirectFileUploadToServer(
                          file,
                          mediaPickerModal.category,
                          file.name.replace(/\.[^/.]+$/, ''),
                          (url) => {
                            mediaPickerModal.onSelect(url);
                            setMediaPickerModal(null);
                          }
                        );
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                {/* Grid of Media Items */}
                <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {mediaLibrary.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        mediaPickerModal.onSelect(item.url);
                        setMediaPickerModal(null);
                        showGlobalToast(`Selected "${item.name}"`, 'success');
                      }}
                      className="group rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-950 overflow-hidden cursor-pointer transition-all flex flex-col"
                    >
                      <div className="h-28 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-2 relative">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="max-h-24 w-auto object-contain group-hover:scale-105 transition-transform"
                        />
                        {item.category && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-mono uppercase">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                          {item.url}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
