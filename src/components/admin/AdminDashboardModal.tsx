import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Phone,
  Brand,
  Article,
  Review,
  PriceRangeCategory,
  ContactInquiry,
  NewsletterSubscriber,
  NewsletterBroadcast,
  MediaItem,
  WebsiteContent,
  AdPlacementId,
  AdPlacementConfig,
} from '../../types';
import {
  fetchContactInquiriesApi,
  replyToContactInquiryApi,
  updateContactInquiryStatusApi,
  deleteContactInquiryApi,
  fetchNewsletterSubscribersApi,
  deleteNewsletterSubscriberApi,
  subscribeNewsletterApi,
  fetchNewsletterBroadcastsApi,
  sendNewsletterBroadcastApi,
  deleteNewsletterBroadcastApi,
  sourcePhoneSpecsWithAiApi,
  generateAiReviewApi,
  AiVerifiedSource,
  checkServerHealthApi,
  ServerHealthStatus,
} from '../../services/api';
import { INITIAL_WEBSITE_CONTENT, DEFAULT_AD_PLACEMENTS } from '../../data/seedData';
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
  Inbox,
  Reply,
  CheckCheck,
  AlertCircle,
  Filter,
  PhoneCall,
  Clock,
  Sparkles,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

type AdminSection =
  | 'dashboard'
  | 'phones'
  | 'specs'
  | 'pricing'
  | 'brands'
  | 'media'
  | 'news'
  | 'reviews'
  | 'messages'
  | 'broadcasts'
  | 'featured'
  | 'ads'
  | 'content'
  | 'spec-tables'
  | 'users'
  | 'scripts'
  | 'backup';

export interface SpecSubtableItem {
  id: string;
  label: string;
  keyPath: string;
  enabled: boolean;
}

export interface SpecTableGroup {
  id: string;
  title: string;
  code: string;
  enabled: boolean;
  subtables: SpecSubtableItem[];
}

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

const DEFAULT_SPEC_TABLES: SpecTableGroup[] = [
  {
    id: 'tbl-general',
    title: 'GENERAL',
    code: 'general',
    enabled: true,
    subtables: [
      { id: 'sub-gen-rel', label: 'Release', keyPath: 'releaseDate', enabled: true },
      { id: 'sub-gen-mod', label: 'Model', keyPath: 'modelNumber', enabled: true },
      { id: 'sub-gen-sta', label: 'Status', keyPath: 'marketStatus', enabled: true },
      { id: 'sub-gen-pri', label: 'Price', keyPath: 'priceUSD / priceNGN', enabled: true },
    ],
  },
  {
    id: 'tbl-design',
    title: 'DESIGN',
    code: 'body',
    enabled: true,
    subtables: [
      { id: 'sub-body-dim', label: 'Dimensions', keyPath: 'body.dimensions', enabled: true },
      { id: 'sub-body-weight', label: 'Weight', keyPath: 'body.weight', enabled: true },
      { id: 'sub-body-build', label: 'Build', keyPath: 'body.build', enabled: true },
      { id: 'sub-body-water', label: 'Water Resistance', keyPath: 'body.waterResistance', enabled: true },
    ],
  },
  {
    id: 'tbl-display',
    title: 'DISPLAY',
    code: 'display',
    enabled: true,
    subtables: [
      { id: 'sub-disp-type', label: 'Type', keyPath: 'display.type', enabled: true },
      { id: 'sub-disp-size', label: 'Size', keyPath: 'display.size', enabled: true },
      { id: 'sub-disp-res', label: 'Resolution', keyPath: 'display.resolution', enabled: true },
      { id: 'sub-disp-prot', label: 'Protection', keyPath: 'display.protection', enabled: true },
      { id: 'sub-disp-bri', label: 'Peak Brightness', keyPath: 'display.brightness', enabled: true },
      { id: 'sub-disp-ref', label: 'Refresh Rate', keyPath: 'display.refreshRate', enabled: true },
    ],
  },
  {
    id: 'tbl-camera',
    title: 'CAMERA',
    code: 'camera',
    enabled: true,
    subtables: [
      { id: 'sub-cam-main', label: 'Main Camera Setup', keyPath: 'mainCamera.setup', enabled: true },
      { id: 'sub-cam-feat', label: 'Features', keyPath: 'mainCamera.features', enabled: true },
      { id: 'sub-cam-vid', label: 'Video Capabilities', keyPath: 'mainCamera.video', enabled: true },
      { id: 'sub-cam-selfie', label: 'Front Selfie Camera', keyPath: 'selfieCamera.setup', enabled: true },
      { id: 'sub-cam-selffeat', label: 'Selfie Features', keyPath: 'selfieCamera.features', enabled: true },
      { id: 'sub-cam-selfvid', label: 'Selfie Video', keyPath: 'selfieCamera.video', enabled: true },
    ],
  },
  {
    id: 'tbl-battery',
    title: 'BATTERY',
    code: 'battery',
    enabled: true,
    subtables: [
      { id: 'sub-bat-cap', label: 'Battery Capacity', keyPath: 'battery.capacity', enabled: true },
      { id: 'sub-bat-chg', label: 'Wired Charging', keyPath: 'battery.charging', enabled: true },
      { id: 'sub-bat-wir', label: 'Wireless Charging', keyPath: 'battery.wirelessCharging', enabled: true },
    ],
  },
  {
    id: 'tbl-memory',
    title: 'MEMORY',
    code: 'memory',
    enabled: true,
    subtables: [
      { id: 'sub-mem-ram', label: 'RAM Options', keyPath: 'memory.ramVariants', enabled: true },
      { id: 'sub-mem-rom', label: 'Storage Options', keyPath: 'memory.storageVariants', enabled: true },
      { id: 'sub-mem-type', label: 'Storage Type', keyPath: 'memory.storageType', enabled: true },
      { id: 'sub-mem-slot', label: 'MicroSD Expansion', keyPath: 'memory.cardSlot', enabled: true },
    ],
  },
  {
    id: 'tbl-platform',
    title: 'PLATFORM',
    code: 'platform',
    enabled: true,
    subtables: [
      { id: 'sub-plat-os', label: 'Operating System', keyPath: 'platform.os', enabled: true },
      { id: 'sub-plat-chip', label: 'Chipset', keyPath: 'platform.chipset', enabled: true },
      { id: 'sub-plat-cpu', label: 'CPU', keyPath: 'platform.cpu', enabled: true },
      { id: 'sub-plat-gpu', label: 'GPU', keyPath: 'platform.gpu', enabled: true },
      { id: 'sub-plat-antutu', label: 'AnTuTu Score (v10)', keyPath: 'platform.antutuScore', enabled: true },
    ],
  },
  {
    id: 'tbl-security',
    title: 'SECURITY',
    code: 'security',
    enabled: true,
    subtables: [
      { id: 'sub-sec-bio', label: 'Biometrics', keyPath: 'biometrics', enabled: true },
      { id: 'sub-sec-sen', label: 'Sensors', keyPath: 'sensors', enabled: true },
      { id: 'sub-sec-hw', label: 'Security Hardware', keyPath: 'securityHardware', enabled: true },
    ],
  },
  {
    id: 'tbl-network',
    title: 'NETWORK',
    code: 'network',
    enabled: true,
    subtables: [
      { id: 'sub-net-tech', label: 'Technology', keyPath: 'network.technology', enabled: true },
      { id: 'sub-net-5g', label: '5G Bands', keyPath: 'network.bands5g', enabled: true },
      { id: 'sub-net-spd', label: 'Speed', keyPath: 'network.speed', enabled: true },
      { id: 'sub-net-sim', label: 'SIM Configuration', keyPath: 'network.sim', enabled: true },
    ],
  },
  {
    id: 'tbl-conn',
    title: 'CONNECTIVITY',
    code: 'connectivity',
    enabled: true,
    subtables: [
      { id: 'sub-con-wlan', label: 'WLAN', keyPath: 'connectivity.wlan', enabled: true },
      { id: 'sub-con-bt', label: 'Bluetooth', keyPath: 'connectivity.bluetooth', enabled: true },
      { id: 'sub-con-nfc', label: 'NFC', keyPath: 'connectivity.nfc', enabled: true },
      { id: 'sub-con-usb', label: 'USB', keyPath: 'connectivity.usb', enabled: true },
      { id: 'sub-con-ir', label: 'Infrared port', keyPath: 'connectivity.infrared', enabled: true },
      { id: 'sub-con-pos', label: 'Positioning', keyPath: 'connectivity.positioning', enabled: true },
    ],
  },
  {
    id: 'tbl-multimedia',
    title: 'MULTIMEDIA',
    code: 'sound',
    enabled: true,
    subtables: [
      { id: 'sub-snd-spk', label: 'Loudspeaker', keyPath: 'sound.loudspeaker', enabled: true },
      { id: 'sub-snd-jack', label: '3.5mm Headphone Jack', keyPath: 'sound.jack35mm', enabled: true },
      { id: 'sub-snd-rad', label: 'FM Radio', keyPath: 'connectivity.radio', enabled: true },
      { id: 'sub-snd-aud', label: 'Audio Specs', keyPath: 'sound.audioSpecs', enabled: true },
    ],
  },
];

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
  metaVerificationGoogle: '<meta name="google-site-verification" content="gsmscope-verified-token" />',
  metaVerificationBing: '<meta name="msvalidate.01" content="gsmscope-bing-token" />',
  customHeadMeta: '<meta name="theme-color" content="#10b981" />\n<meta name="author" content="GsmScope Editorial" />',
  headerScripts: '<!-- Google Analytics / GTM Head Script -->',
  bodyTopScripts: '<!-- Custom Body Open Script (e.g. GTM noscript) -->',
  footerScripts: '<!-- Custom Footer Analytics / Chat Widget Script -->',
  robotsTxtMeta: 'index, follow, max-image-preview:large',
};

const ALL_CATEGORY_BADGES = [
  'top-rated',
  'flagship',
  'best-camera',
  'best-gaming',
  'best-battery',
  '5g',
  'best-5g',
  'best-budget',
  'under-200k',
  'under-300k',
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
    releaseDate: `${year}, Q1`,
    modelNumber: 'SM-NEW2025',
    image: '/assets/aistudio/IMG_20261024_202541_f0e9668e.jpg',
    images: ['/assets/aistudio/IMG_20261024_202541_f0e9668e.jpg'],
    accentColor: '#10b981',
    rating: 0,
    reviewsCount: 0,
    viewsCount: 0,
    categories: ['5g', 'best-battery'],
    isFeatured: true,
    isPopular: false,
    screenSizeInches: 6.7,
    seoTitle: '',
    seoKeywords: '',
    seoDescription: '',
    keyHighlights: {
      display: '6.7" AMOLED 120Hz',
      processor: 'Snapdragon 8 Gen 3 (4 nm)',
      ram: '8GB / 12GB',
      storage: '256GB / 512GB',
      camera: '50MP OIS Triple Camera',
      battery: '5000 mAh',
      charging: '45W Fast Charging',
      os: 'Android 15',
      network5g: true,
    },
    detailedSpecs: {
      network: {
        technology: 'GSM / HSPA / LTE / 5G',
        bands5g: 'SA/NSA/Sub6, Bands n1, n3, n5, n7, n8, n20, n28, n38, n40, n41, n77, n78',
        speed: 'HSPA 42.2/5.76 Mbps, LTE-A, 5G',
        sim: 'Dual SIM (Nano-SIM, dual stand-by) + eSIM support',
      },
      body: {
        dimensions: '162.3 x 75.6 x 8.2 mm',
        weight: '195 g',
        build: 'Glass front (Gorilla Glass Victus 2), aluminum frame, glass back',
        waterResistance: 'IP68 dust/water resistant (up to 1.5m for 30 min)',
      },
      display: {
        type: 'Dynamic LTPO AMOLED 2X, 120Hz, HDR10+',
        size: '6.7 inches, 108.4 cm² (~89.2% screen-to-body ratio)',
        resolution: '1080 x 2400 pixels, 20:9 ratio (~395 ppi density)',
        protection: 'Corning Gorilla Glass Victus 2',
        brightness: '2600 nits (peak)',
        refreshRate: '1Hz - 120Hz adaptive',
      },
      platform: {
        os: 'Android 15',
        chipset: 'Qualcomm Snapdragon 8 Gen 3 (4 nm)',
        cpu: 'Octa-core (1x3.3 GHz Cortex-X4 & 3x3.1 GHz Cortex-A720 & 2x2.9 GHz Cortex-A720 & 2x2.2 GHz Cortex-A520)',
        gpu: 'Adreno 750',
        antutuScore: '1,680,000 (AnTuTu v10)',
      },
      memory: {
        ramVariants: ['8GB', '12GB'],
        storageVariants: ['256GB', '512GB'],
        cardSlot: 'No',
        storageType: 'UFS 4.0',
      },
      mainCamera: {
        setup: '50 MP, f/1.8, 24mm (wide), PDAF, OIS + 12 MP, f/2.2, 120˚ (ultrawide) + 10 MP, f/2.4 (telephoto), 3x optical zoom',
        features: 'LED flash, auto-HDR, panorama, Laser AF',
        video: '8K@30fps, 4K@30/60fps, 1080p@30/60/240fps, gyro-EIS, HDR10+',
      },
      selfieCamera: {
        setup: '32 MP, f/2.2, 26mm (wide), Dual Pixel PDAF',
        features: 'Dual video call, Auto-HDR, HDR10+',
        video: '4K@30/60fps, 1080p@30fps',
      },
      battery: {
        capacity: 'Li-Ion 5000 mAh, non-removable',
        charging: '45W wired, PD3.0, 65% in 30 min',
        wirelessCharging: '15W wireless (Qi/PMA), 4.5W reverse wireless',
      },
      sound: {
        loudspeaker: 'Yes, with stereo speakers',
        jack35mm: 'No',
        audioSpecs: '24-bit/192kHz Hi-Res audio, Dolby Atmos support',
      },
      connectivity: {
        wlan: 'Wi-Fi 802.11 a/b/g/n/ac/6e/7, tri-band, Wi-Fi Direct',
        bluetooth: '5.3, A2DP, LE',
        nfc: 'Yes',
        radio: 'No',
        usb: 'USB Type-C 3.2, DisplayPort 1.2, OTG',
        infrared: 'No',
        positioning: 'GPS (L1+L5), GLONASS, BDS, GALILEO, QZSS, NavIC',
      },
      sensors: 'Fingerprint (under display, ultrasonic), accelerometer, gyro, proximity, compass, barometer',
      biometrics: 'Fingerprint (under display, ultrasonic) & 2D Face Unlock',
      securityHardware: 'Hardware-backed Keystore & Knox / TrustZone TEE',
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
    resetFilters,
    startGlobalLoading,
    stopGlobalLoading,
    showGlobalToast,
    adminSection,
    setAdminSection,
    adminSubView,
    setAdminSubView,
    goBack,
  } = useApp();

  const VALID_ADMIN_SECTIONS: AdminSection[] = [
    'dashboard',
    'phones',
    'specs',
    'pricing',
    'brands',
    'media',
    'news',
    'reviews',
    'messages',
    'broadcasts',
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);

  // Search & Filter states inside Admin
  const [phoneSearch, setPhoneSearch] = useState('');
  const [phoneBrandFilter, setPhoneBrandFilter] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<'all' | 'news' | 'reviews' | 'guides'>('all');
  const [featuredCategoryFilter, setFeaturedCategoryFilter] = useState<
    'all' | 'top-rated' | 'best-budget' | 'best-camera' | 'best-gaming' | 'best-battery' | 'best-5g'
  >('all');

  // 1. Complete Phone Add/Edit Form state (includes ALL Phone fields & ALL DetailedSpecs fields)
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState<Phone>(() => createEmptyPhoneForm(brands[0]?.name || 'Samsung'));
  const [ramVariantsText, setRamVariantsText] = useState('8GB, 12GB');
  const [storageVariantsText, setStorageVariantsText] = useState('256GB, 512GB');
  const [galleryUrlsText, setGalleryUrlsText] = useState('');
  const [customCategoriesText, setCustomCategoriesText] = useState('5g, best-battery');

  // 2. Dedicated Specifications Editor state (for quick switching between any phone in "Add/Update Specs")
  const [selectedSpecPhoneId, setSelectedSpecPhoneId] = useState<string>(phones[0]?.id || '');
  const selectedSpecPhone = phones.find((p) => p.id === selectedSpecPhoneId) || phones[0];
  const [specPhoneDraft, setSpecPhoneDraft] = useState<Phone | null>(null);
  const [specRamText, setSpecRamText] = useState('');
  const [specStorageText, setSpecStorageText] = useState('');

  useEffect(() => {
    if (selectedSpecPhone) {
      const cloned: Phone = JSON.parse(JSON.stringify(selectedSpecPhone));
      setSpecPhoneDraft(cloned);
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
    onUploadedUrl: (url: string, item?: MediaItem) => void,
    assignedPhoneId?: string
  ) => {
    startGlobalLoading();
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const uploaded = await uploadMediaImage({
          filename: file.name,
          data: reader.result,
          name: customTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
          category,
          assignedPhoneId,
        });
        stopGlobalLoading();
        const finalUrl = uploaded.url || uploaded.media?.url;
        if (uploaded.success && finalUrl) {
          onUploadedUrl(finalUrl, uploaded.media);
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

  // 6. News / Articles state (including SEO Title, Keywords & Description)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    category: 'News' as Article['category'],
    summary: '',
    content: '',
    coverImage: '/assets/aistudio/IMG_20261026_152954_83c935f6.jpg',
    readTime: '4 min read',
    tags: 'Smartphone, Launch, Specs',
    featured: false,
    authorName: 'GsmScope Editorial',
    authorRole: 'Senior Hardware Editor',
    seoTitle: '',
    seoKeywords: '',
    seoDescription: '',
  });

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
    pushToSubscribers: false,
  });

  // 7b. AI Assistant States (Phone Spec Sourcing & Review Writing)
  const [aiPhoneQuery, setAiPhoneQuery] = useState('');
  const [isAiSourcingPhone, setIsAiSourcingPhone] = useState(false);
  const [aiPhoneSources, setAiPhoneSources] = useState<AiVerifiedSource[]>([]);

  const [aiAdminReviewQuery, setAiAdminReviewQuery] = useState('');
  const [aiAdminReviewNotes, setAiAdminReviewNotes] = useState('');
  const [isAiGeneratingAdminReview, setIsAiGeneratingAdminReview] = useState(false);
  const [aiAdminReviewSources, setAiAdminReviewSources] = useState<AiVerifiedSource[]>([]);
  const [aiAdminReviewSpecsSummary, setAiAdminReviewSpecsSummary] = useState('');

  const [aiArticleQuery, setAiArticleQuery] = useState('');
  const [aiArticleNotes, setAiArticleNotes] = useState('');
  const [isAiGeneratingArticle, setIsAiGeneratingArticle] = useState(false);
  const [aiArticleSources, setAiArticleSources] = useState<AiVerifiedSource[]>([]);

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
    const prev = localAdSettingsRef.current;
    const currentPlacements = prev.placements || DEFAULT_AD_PLACEMENTS;
    const basePlacement = currentPlacements[placementId] || DEFAULT_AD_PLACEMENTS[placementId];
    const updatedPlacement: AdPlacementConfig = {
      ...DEFAULT_AD_PLACEMENTS[placementId],
      ...basePlacement,
      ...patch,
      enabled: patch.enabled !== undefined ? Boolean(patch.enabled) : Boolean(basePlacement.enabled),
    };
    const nextSettings = {
      ...prev,
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
    if (immediatePersist) {
      updateAdSettings(nextSettings);
    }
  };

  // 10. Website Content state (synced with server-persisted contextWebsiteContent)
  const [websiteContent, setWebsiteContent] = useState<WebsiteContentSettings>(() => ({
    ...DEFAULT_WEBSITE_CONTENT,
    ...contextWebsiteContent,
  }));
  useEffect(() => {
    if (contextWebsiteContent) {
      setWebsiteContent((prev) => ({
        ...prev,
        ...contextWebsiteContent,
        seoTitle: contextWebsiteContent.seoTitle || contextWebsiteContent.defaultSeoTitle || prev.seoTitle,
        seoKeywords: contextWebsiteContent.seoKeywords || contextWebsiteContent.defaultSeoKeywords || prev.seoKeywords,
        seoDescription: contextWebsiteContent.seoDescription || contextWebsiteContent.defaultSeoDescription || prev.seoDescription,
      }));
      if (Array.isArray(contextWebsiteContent.specTablesSchema) && contextWebsiteContent.specTablesSchema.length > 0) {
        setSpecTablesSchema(contextWebsiteContent.specTablesSchema);
      }
      if (Array.isArray(contextWebsiteContent.adminUsers) && contextWebsiteContent.adminUsers.length > 0) {
        setUsersList(contextWebsiteContent.adminUsers);
      }
      if (contextWebsiteContent.customScripts && typeof contextWebsiteContent.customScripts === 'object') {
        setScriptsConfig((prev) => ({ ...prev, ...contextWebsiteContent.customScripts }));
      }
    }
  }, [contextWebsiteContent]);

  // 11. Specification Tables & Subtables Schema state
  const [specTablesSchema, setSpecTablesSchema] = useState<SpecTableGroup[]>(() => {
    if (Array.isArray(contextWebsiteContent?.specTablesSchema) && contextWebsiteContent.specTablesSchema.length > 0) {
      return contextWebsiteContent.specTablesSchema;
    }
    try {
      const saved = localStorage.getItem('gsmscope_spec_tables_schema_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SPEC_TABLES;
  });
  const [newTableTitle, setNewTableTitle] = useState('');
  const [newSubtableLabels, setNewSubtableLabels] = useState<Record<string, { label: string; keyPath: string }>>({});

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
      return { ...DEFAULT_SCRIPTS, ...contextWebsiteContent.customScripts };
    }
    try {
      const saved = localStorage.getItem('gsmscope_custom_scripts_v1');
      if (saved) return { ...DEFAULT_SCRIPTS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SCRIPTS;
  });

  // Backup JSON state
  const [jsonText, setJsonText] = useState('');

  // 14. Contact Form Inquiries & Reply state
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('gsmscope_contact_inquiries_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [activeReplyInquiry, setActiveReplyInquiry] = useState<ContactInquiry | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Synchronize open sub-forms (Add/Edit Phone, Edit Article, Add Review, Edit Brand, Reply Inquiry) with browser history
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
    : activeReplyInquiry
    ? `inquiry:${activeReplyInquiry.id}`
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
        setActiveReplyInquiry(null);
      }
    }
  }, [adminSubView]);

  // 15. Newsletter Subscribers & Push Broadcasts state
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [broadcasts, setBroadcasts] = useState<NewsletterBroadcast[]>(() => {
    try {
      const saved = localStorage.getItem('gsmscope_broadcasts_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [broadcastType, setBroadcastType] = useState<NewsletterBroadcast['type']>('news');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastActionUrl, setBroadcastActionUrl] = useState('/?tab=news');
  const [broadcastActionLabel, setBroadcastActionLabel] = useState('Read Details');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [newSubscriberEmail, setNewSubscriberEmail] = useState('');

  // Push to subscribers checkboxes on Add/Edit forms
  const [pushPhoneToSubscribers, setPushPhoneToSubscribers] = useState(false);
  const [pushArticleToSubscribers, setPushArticleToSubscribers] = useState(false);

  // Sync Contact Inquiries, Subscribers, and Broadcasts with backend API
  useEffect(() => {
    let isMounted = true;
    fetchContactInquiriesApi().then((data) => {
      if (isMounted && data && Array.isArray(data)) {
        setContactInquiries(data);
        try {
          localStorage.setItem('gsmscope_contact_inquiries_v1', JSON.stringify(data));
        } catch {}
      }
    });
    fetchNewsletterSubscribersApi().then((subs) => {
      if (isMounted && subs && Array.isArray(subs)) {
        setSubscribers(subs);
      }
    });
    fetchNewsletterBroadcastsApi().then((bcs) => {
      if (isMounted && bcs && Array.isArray(bcs)) {
        setBroadcasts(bcs);
        try {
          localStorage.setItem('gsmscope_broadcasts_v1', JSON.stringify(bcs));
        } catch {}
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const unreadMessagesCount = contactInquiries.filter(
    (i) => i.status !== 'read' && i.status !== 'replied' && !i.replied
  ).length;

  // Inject custom scripts/meta tags into document head/body/footer whenever saved
  useEffect(() => {
    try {
      let container = document.getElementById('gsmscope-Dynamic-head-meta');
      if (!container) {
        container = document.createElement('div');
        container.id = 'gsmscope-Dynamic-head-meta';
        container.style.display = 'none';
        document.body.appendChild(container);
      }
      container.setAttribute('data-robots', scriptsConfig.robotsTxtMeta);
      container.setAttribute('data-head-scripts-len', String(scriptsConfig.headerScripts.length));
    } catch {}
  }, [scriptsConfig]);

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

  // Handlers for 1. Phones (Complete Form with ALL fields)
  const openCreatePhoneForm = () => {
    const empty = createEmptyPhoneForm(brands[0]?.name || 'Samsung');
    setEditingPhoneId(null);
    setPhoneDraft(empty);
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
    setRamVariantsText((cloned.detailedSpecs?.memory?.ramVariants || [cloned.keyHighlights.ram]).join(', '));
    setStorageVariantsText((cloned.detailedSpecs?.memory?.storageVariants || [cloned.keyHighlights.storage]).join(', '));
    setGalleryUrlsText((cloned.images && cloned.images.length > 0 ? cloned.images : [cloned.image]).join('\n'));
    setCustomCategoriesText((cloned.categories || []).join(', '));
    setShowPhoneForm(true);
    setSection('phones');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // AI Spec Sourcer Handler: Sources complete phone specifications from manufacturer website & trusted tech databases
  const handleAiSourcePhoneSpecs = async (
    targetMode: 'phoneDraft' | 'specPhoneDraft' = 'phoneDraft',
    explicitQuery?: string
  ) => {
    if (isAiSourcingPhone) return;
    const currentTarget = targetMode === 'specPhoneDraft' && specPhoneDraft ? specPhoneDraft : phoneDraft;
    const queryToUse = (
      explicitQuery ??
      (aiPhoneQuery.trim() ||
        currentTarget.name.trim() ||
        (currentTarget.modelNumber && currentTarget.modelNumber !== 'SM-NEW2025' ? currentTarget.modelNumber.trim() : ''))
    ).trim();

    if (!queryToUse) {
      showGlobalToast('Please type a phone title or model number first (e.g., "Galaxy S25 Ultra" or "SM-S938B").', 'error');
      return;
    }

    setIsAiSourcingPhone(true);
    startGlobalLoading();

    try {
      const res = await sourcePhoneSpecsWithAiApi({
        query: queryToUse,
        brandHint: currentTarget.brand,
      });

      if (!res.success || !res.phoneSpecs) {
        showGlobalToast(res.error || 'Could not source phone specifications. Please try again.', 'error');
        return;
      }

      const s = res.phoneSpecs;
      const ramList = Array.isArray(s.detailedSpecs?.memory?.ramVariants) && s.detailedSpecs!.memory.ramVariants.length > 0
        ? s.detailedSpecs!.memory.ramVariants
        : (s.keyHighlights?.ram ? s.keyHighlights.ram.split('/').map((x) => x.trim()).filter(Boolean) : ['8GB', '12GB']);
      const storageList = Array.isArray(s.detailedSpecs?.memory?.storageVariants) && s.detailedSpecs!.memory.storageVariants.length > 0
        ? s.detailedSpecs!.memory.storageVariants
        : (s.keyHighlights?.storage ? s.keyHighlights.storage.split('/').map((x) => x.trim()).filter(Boolean) : ['256GB', '512GB']);
      const catsList = Array.isArray(s.categories) && s.categories.length > 0
        ? s.categories
        : ['5g', 'best-battery'];

      const mergeIntoPhone = (prev: Phone): Phone => ({
        ...prev,
        name: s.name || prev.name || queryToUse,
        brand: s.brand || prev.brand || 'Samsung',
        modelNumber: s.modelNumber || prev.modelNumber || '',
        marketStatus: s.marketStatus || prev.marketStatus || 'Available',
        releaseDate: s.releaseDate || prev.releaseDate,
        releaseYear: Number(s.releaseYear) || prev.releaseYear || new Date().getFullYear(),
        priceUSD: Number(s.priceUSD) || prev.priceUSD,
        priceNGN: Number(s.priceNGN) || prev.priceNGN,
        priceRange: (s.priceRange as PriceRangeCategory) || prev.priceRange,
        screenSizeInches: Number(s.screenSizeInches) || prev.screenSizeInches || 6.7,
        nairaPriceNotes: s.nairaPriceNotes || prev.nairaPriceNotes,
        categories: catsList,
        seoTitle: s.seoTitle || prev.seoTitle,
        seoKeywords: s.seoKeywords || prev.seoKeywords,
        seoDescription: s.seoDescription || prev.seoDescription,
        keyHighlights: {
          display: s.keyHighlights?.display || prev.keyHighlights.display,
          processor: s.keyHighlights?.processor || prev.keyHighlights.processor,
          ram: s.keyHighlights?.ram || ramList.join(' / '),
          storage: s.keyHighlights?.storage || storageList.join(' / '),
          camera: s.keyHighlights?.camera || prev.keyHighlights.camera,
          battery: s.keyHighlights?.battery || prev.keyHighlights.battery,
          charging: s.keyHighlights?.charging || prev.keyHighlights.charging,
          os: s.keyHighlights?.os || prev.keyHighlights.os,
          network5g: s.keyHighlights?.network5g !== undefined ? Boolean(s.keyHighlights.network5g) : prev.keyHighlights.network5g,
        },
        detailedSpecs: {
          network: {
            technology: s.detailedSpecs?.network?.technology || prev.detailedSpecs.network.technology,
            bands5g: s.detailedSpecs?.network?.bands5g || prev.detailedSpecs.network.bands5g,
            speed: s.detailedSpecs?.network?.speed || prev.detailedSpecs.network.speed,
            sim: s.detailedSpecs?.network?.sim || prev.detailedSpecs.network.sim,
          },
          body: {
            dimensions: s.detailedSpecs?.body?.dimensions || prev.detailedSpecs.body.dimensions,
            weight: s.detailedSpecs?.body?.weight || prev.detailedSpecs.body.weight,
            build: s.detailedSpecs?.body?.build || prev.detailedSpecs.body.build,
            waterResistance: s.detailedSpecs?.body?.waterResistance || prev.detailedSpecs.body.waterResistance,
          },
          display: {
            type: s.detailedSpecs?.display?.type || prev.detailedSpecs.display.type,
            size: s.detailedSpecs?.display?.size || prev.detailedSpecs.display.size,
            resolution: s.detailedSpecs?.display?.resolution || prev.detailedSpecs.display.resolution,
            protection: s.detailedSpecs?.display?.protection || prev.detailedSpecs.display.protection,
            brightness: s.detailedSpecs?.display?.brightness || prev.detailedSpecs.display.brightness,
            refreshRate: s.detailedSpecs?.display?.refreshRate || prev.detailedSpecs.display.refreshRate,
          },
          platform: {
            os: s.detailedSpecs?.platform?.os || prev.detailedSpecs.platform.os,
            chipset: s.detailedSpecs?.platform?.chipset || prev.detailedSpecs.platform.chipset,
            cpu: s.detailedSpecs?.platform?.cpu || prev.detailedSpecs.platform.cpu,
            gpu: s.detailedSpecs?.platform?.gpu || prev.detailedSpecs.platform.gpu,
            antutuScore: s.detailedSpecs?.platform?.antutuScore || prev.detailedSpecs.platform.antutuScore,
          },
          memory: {
            ramVariants: ramList,
            storageVariants: storageList,
            cardSlot: s.detailedSpecs?.memory?.cardSlot || prev.detailedSpecs.memory.cardSlot,
            storageType: s.detailedSpecs?.memory?.storageType || prev.detailedSpecs.memory.storageType,
          },
          mainCamera: {
            setup: s.detailedSpecs?.mainCamera?.setup || prev.detailedSpecs.mainCamera.setup,
            features: s.detailedSpecs?.mainCamera?.features || prev.detailedSpecs.mainCamera.features,
            video: s.detailedSpecs?.mainCamera?.video || prev.detailedSpecs.mainCamera.video,
          },
          selfieCamera: {
            setup: s.detailedSpecs?.selfieCamera?.setup || prev.detailedSpecs.selfieCamera.setup,
            features: s.detailedSpecs?.selfieCamera?.features || prev.detailedSpecs.selfieCamera.features,
            video: s.detailedSpecs?.selfieCamera?.video || prev.detailedSpecs.selfieCamera.video,
          },
          battery: {
            capacity: s.detailedSpecs?.battery?.capacity || prev.detailedSpecs.battery.capacity,
            charging: s.detailedSpecs?.battery?.charging || prev.detailedSpecs.battery.charging,
            wirelessCharging: s.detailedSpecs?.battery?.wirelessCharging || prev.detailedSpecs.battery.wirelessCharging,
          },
          sound: {
            loudspeaker: s.detailedSpecs?.sound?.loudspeaker || prev.detailedSpecs.sound.loudspeaker,
            jack35mm: s.detailedSpecs?.sound?.jack35mm || prev.detailedSpecs.sound.jack35mm,
            audioSpecs: s.detailedSpecs?.sound?.audioSpecs || prev.detailedSpecs.sound.audioSpecs,
          },
          connectivity: {
            wlan: s.detailedSpecs?.connectivity?.wlan || prev.detailedSpecs.connectivity.wlan,
            bluetooth: s.detailedSpecs?.connectivity?.bluetooth || prev.detailedSpecs.connectivity.bluetooth,
            nfc: s.detailedSpecs?.connectivity?.nfc || prev.detailedSpecs.connectivity.nfc,
            radio: s.detailedSpecs?.connectivity?.radio || prev.detailedSpecs.connectivity.radio,
            usb: s.detailedSpecs?.connectivity?.usb || prev.detailedSpecs.connectivity.usb,
            infrared: s.detailedSpecs?.connectivity?.infrared || prev.detailedSpecs.connectivity.infrared,
            positioning: s.detailedSpecs?.connectivity?.positioning || prev.detailedSpecs.connectivity.positioning,
          },
          sensors: s.detailedSpecs?.sensors || prev.detailedSpecs.sensors,
          biometrics: s.detailedSpecs?.biometrics || prev.detailedSpecs.biometrics,
          securityHardware: s.detailedSpecs?.securityHardware || prev.detailedSpecs.securityHardware,
        },
      });

      if (targetMode === 'specPhoneDraft' && specPhoneDraft) {
        setSpecPhoneDraft((prev) => (prev ? mergeIntoPhone(prev) : prev));
        setSpecRamText(ramList.join(', '));
        setSpecStorageText(storageList.join(', '));
      } else {
        setPhoneDraft((prev) => mergeIntoPhone(prev));
        setRamVariantsText(ramList.join(', '));
        setStorageVariantsText(storageList.join(', '));
        setCustomCategoriesText(catsList.join(', '));
      }

      setAiPhoneSources(res.sources || []);
      showGlobalToast(
        `Sourced & auto-filled all specifications for "${s.name || queryToUse}" from official manufacturer & trusted sources!`,
        'success'
      );
    } catch {
      showGlobalToast('Failed to reach AI spec sourcer. Please try again.', 'error');
    } finally {
      stopGlobalLoading();
      setIsAiSourcingPhone(false);
    }
  };

  // AI Admin Review Generator Handler (Section 7: Manage & Publish Reviews)
  const handleAiGenerateAdminReview = async () => {
    if (isAiGeneratingAdminReview) return;
    const selectedPhoneObj = phones.find((p) => p.id === reviewForm.phoneId);
    const targetQuery = aiAdminReviewQuery.trim() || selectedPhoneObj?.name || '';

    if (!targetQuery) {
      showGlobalToast('Please select a target phone or enter a phone title / model number.', 'error');
      return;
    }

    setIsAiGeneratingAdminReview(true);
    startGlobalLoading();

    try {
      const res = await generateAiReviewApi({
        phoneName: targetQuery,
        modelNumber: selectedPhoneObj?.modelNumber || '',
        brand: aiAdminReviewQuery.trim() ? '' : selectedPhoneObj?.brand || '',
        rating: reviewForm.rating,
        reviewType: 'admin',
        focusNotes: aiAdminReviewNotes.trim(),
        existingSpecs: !aiAdminReviewQuery.trim() && selectedPhoneObj
          ? {
              name: selectedPhoneObj.name,
              brand: selectedPhoneObj.brand,
              modelNumber: selectedPhoneObj.modelNumber,
              keyHighlights: selectedPhoneObj.keyHighlights,
              detailedSpecs: selectedPhoneObj.detailedSpecs,
            }
          : undefined,
      });

      if (!res.success || !res.review) {
        showGlobalToast(res.error || 'Could not generate AI review.', 'error');
        return;
      }

      setReviewForm((prev) => ({
        ...prev,
        title: res.review!.title || prev.title,
        comment: res.review!.comment || prev.comment,
        pros: (res.review!.pros || []).join(', ') || prev.pros,
        cons: (res.review!.cons || []).join(', ') || prev.cons,
        seoTitle: res.review!.seoTitle || prev.seoTitle,
        seoKeywords: res.review!.seoKeywords || prev.seoKeywords,
      }));
      setAiAdminReviewSpecsSummary(res.review.sourcedSpecsSummary || '');
      setAiAdminReviewSources(res.sources || []);
      showGlobalToast(`AI sourced official specs and wrote review for ${res.review.resolvedPhoneName || targetQuery}!`, 'success');
    } catch {
      showGlobalToast('Failed to reach AI review assistant.', 'error');
    } finally {
      stopGlobalLoading();
      setIsAiGeneratingAdminReview(false);
    }
  };

  // AI Editorial Review / Article Generator Handler (Section 6: News, Guides, Reviews & Articles)
  const handleAiGenerateEditorialArticle = async () => {
    if (isAiGeneratingArticle) return;
    const targetQuery = aiArticleQuery.trim() || articleForm.title.trim();

    if (!targetQuery) {
      showGlobalToast('Please enter a phone title / model number or headline to source & write.', 'error');
      return;
    }

    setIsAiGeneratingArticle(true);
    startGlobalLoading();

    try {
      const matchedPhone = phones.find(
        (p) =>
          targetQuery.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(targetQuery.toLowerCase()) ||
          (p.modelNumber && p.modelNumber.toLowerCase() === targetQuery.toLowerCase())
      );

      const res = await generateAiReviewApi({
        phoneName: targetQuery,
        modelNumber: matchedPhone?.modelNumber || '',
        brand: matchedPhone?.brand || '',
        rating: 5,
        reviewType: 'editorial',
        focusNotes: aiArticleNotes.trim(),
        existingSpecs: matchedPhone
          ? {
              name: matchedPhone.name,
              brand: matchedPhone.brand,
              modelNumber: matchedPhone.modelNumber,
              keyHighlights: matchedPhone.keyHighlights,
              detailedSpecs: matchedPhone.detailedSpecs,
            }
          : undefined,
      });

      if (!res.success || !res.review) {
        showGlobalToast(res.error || 'Could not generate editorial review with AI.', 'error');
        return;
      }

      setArticleForm((prev) => ({
        ...prev,
        title: res.review!.title || prev.title,
        category:
          prev.category === 'Reviews' || prev.category === 'Review'
            ? prev.category
            : 'Reviews',
        summary: res.review!.summary || prev.summary,
        content: res.review!.comment || prev.content,
        readTime: res.review!.readTime || '5 min read',
        tags: (res.review!.tags || []).join(', ') || prev.tags,
        seoTitle: res.review!.seoTitle || prev.seoTitle,
        seoKeywords: res.review!.seoKeywords || prev.seoKeywords,
        seoDescription: res.review!.seoDescription || prev.seoDescription,
      }));
      setAiArticleSources(res.sources || []);
      showGlobalToast(`AI drafted full editorial review for "${res.review.resolvedPhoneName || targetQuery}"!`, 'success');
    } catch {
      showGlobalToast('Failed to reach AI editorial assistant.', 'error');
    } finally {
      stopGlobalLoading();
      setIsAiGeneratingArticle(false);
    }
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneDraft.name.trim()) {
      showGlobalToast('Please enter a Phone Model Name.', 'error');
      return;
    }

    const slug = phoneDraft.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
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

    const priceNGN = Number(phoneDraft.priceNGN) || 350000;
    const priceUSD = Number(phoneDraft.priceUSD) || Math.round(priceNGN / 1500);
    const computedPriceRange: PriceRangeCategory =
      phoneDraft.priceRange ||
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

    const defaultSeoTitle = `${phoneDraft.name.trim()} Full Specifications & Price in USD / NGN | ${websiteContent.siteName || 'GsmScope'}`;
    const defaultSeoKeywords = `${phoneDraft.name.trim()}, ${phoneDraft.brand.trim()}, ${phoneDraft.name.trim()} specs, ${phoneDraft.name.trim()} price in Nigeria, ${phoneDraft.name.trim()} USD price, ${phoneDraft.keyHighlights.processor}, ${phoneDraft.keyHighlights.camera}`;
    const defaultSeoDescription = `Explore full hardware specifications for ${phoneDraft.name.trim()} (${phoneDraft.releaseYear}): ${phoneDraft.keyHighlights.display}, ${phoneDraft.keyHighlights.processor}, ${phoneDraft.keyHighlights.camera}, ${phoneDraft.keyHighlights.battery} battery, and verified price.`;

    const finalPhone: Phone = {
      ...phoneDraft,
      id: editingPhoneId || `${slug}-${Date.now()}`,
      name: phoneDraft.name.trim(),
      brand: phoneDraft.brand.trim() || 'Samsung',
      priceNGN,
      priceUSD,
      oldPriceNGN: phoneDraft.oldPriceNGN ? Number(phoneDraft.oldPriceNGN) : undefined,
      priceRange: computedPriceRange,
      marketStatus: phoneDraft.marketStatus || 'Available',
      nairaPriceNotes: phoneDraft.nairaPriceNotes || 'Available at authorized stores.',
      releaseYear: Number(phoneDraft.releaseYear) || new Date().getFullYear(),
      releaseDate: phoneDraft.releaseDate || `${phoneDraft.releaseYear}`,
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
      screenSizeInches: Number(phoneDraft.screenSizeInches) || 6.7,
      categories: categoriesArr.length > 0 ? categoriesArr : ['5g'],
      isFeatured: Boolean(phoneDraft.isFeatured),
      isPopular: Boolean(phoneDraft.isPopular),
      seoTitle: (phoneDraft.seoTitle || '').trim() || defaultSeoTitle,
      seoKeywords: (phoneDraft.seoKeywords || '').trim() || defaultSeoKeywords,
      seoDescription: (phoneDraft.seoDescription || '').trim() || defaultSeoDescription,
      keyHighlights: {
        ...phoneDraft.keyHighlights,
        ram: phoneDraft.keyHighlights.ram || ramArr.join(' / ') || '8GB',
        storage: phoneDraft.keyHighlights.storage || storageArr.join(' / ') || '256GB',
      },
      detailedSpecs: {
        ...phoneDraft.detailedSpecs,
        memory: {
          ...phoneDraft.detailedSpecs.memory,
          ramVariants: ramArr.length > 0 ? ramArr : ['8GB'],
          storageVariants: storageArr.length > 0 ? storageArr : ['256GB'],
        },
      },
    };

    if (pushPhoneToSubscribers) {
      sendNewsletterBroadcastApi({
        type: 'phone',
        title: `New Phone Launch: ${finalPhone.brand} ${finalPhone.name}`,
        message: `${finalPhone.name} is now published on GsmScope. Chipset: ${finalPhone.keyHighlights.processor}, Camera: ${finalPhone.keyHighlights.camera}, Battery: ${finalPhone.keyHighlights.battery}. Verified prices: ₦${finalPhone.priceNGN.toLocaleString()} / $${finalPhone.priceUSD}.`,
        actionUrl: `/?phone=${encodeURIComponent(finalPhone.id)}`,
        actionLabel: 'View Device Specs',
      }).then((res) => {
        if (res.broadcast) {
          setBroadcasts((prev) => [res.broadcast!, ...prev]);
        }
      });
      setPushPhoneToSubscribers(false);
    }

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

    const primaryImg = (specPhoneDraft.image || '').trim();
    const updated: Phone = {
      ...specPhoneDraft,
      image: primaryImg,
      images: primaryImg
        ? [primaryImg, ...(specPhoneDraft.images || []).filter((u) => u !== primaryImg)]
        : specPhoneDraft.images,
      detailedSpecs: {
        ...specPhoneDraft.detailedSpecs,
        memory: {
          ...specPhoneDraft.detailedSpecs.memory,
          ramVariants: ramArr.length > 0 ? ramArr : ['8GB'],
          storageVariants: storageArr.length > 0 ? storageArr : ['256GB'],
        },
      },
    };
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
      seoTitle: brandForm.seoTitle.trim() || `${brandForm.name.trim()} Phones, Specs & Prices | GsmScope`,
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
      articleForm.seoTitle.trim() || `${articleForm.title.trim()} | ${websiteContent.siteName || 'GsmScope'}`;
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
        seoTitle: computedSeoTitle,
        seoKeywords: computedSeoKeywords,
        seoDescription: computedSeoDesc,
        author: {
          name: articleForm.authorName || existing.author.name,
          role: articleForm.authorRole || existing.author.role,
        },
      };
      runWithProgress(() => {
        updateArticle(updated);
        setEditingArticleId(null);
        setArticleForm({
          title: '',
          category: 'News',
          summary: '',
          content: '',
          coverImage: '/assets/aistudio/IMG_20261026_152954_83c935f6.jpg',
          readTime: '4 min read',
          tags: 'Smartphone, Launch, Specs',
          featured: false,
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
        coverImage: articleForm.coverImage || '/assets/aistudio/IMG_20261026_152954_83c935f6.jpg',
        tags: tagsArr.length > 0 ? tagsArr : ['News', 'Smartphones'],
        featured: articleForm.featured,
        relatedPhoneIds: [],
        seoTitle: computedSeoTitle,
        seoKeywords: computedSeoKeywords,
        seoDescription: computedSeoDesc,
      };

      if (pushArticleToSubscribers) {
        sendNewsletterBroadcastApi({
          type: created.category === 'Buying Guides' || created.category === 'Buying Guide' ? 'guide' : 'news',
          title: `New Post: ${created.title}`,
          message: `${created.summary} Read the full article and insights on GsmScope.`,
          actionUrl: `/?tab=news`,
          actionLabel: 'Read Article',
        }).then((res) => {
          if (res.broadcast) {
            setBroadcasts((prev) => [res.broadcast!, ...prev]);
          }
        });
        setPushArticleToSubscribers(false);
      }

      runWithProgress(() => {
        addArticle(created);
        setArticleForm({
          title: '',
          category: 'News',
          summary: '',
          content: '',
          coverImage: '/assets/aistudio/IMG_20261026_152954_83c935f6.jpg',
          readTime: '4 min read',
          tags: 'Smartphone, Launch, Specs',
          featured: false,
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
        `${phoneObj?.name || 'Smartphone'} Review: ${reviewForm.title.trim() || 'Hands-On Verdict'} | GsmScope`,
      seoKeywords:
        reviewForm.seoKeywords.trim() ||
        `${phoneObj?.name || 'Smartphone'} review, ${phoneObj?.brand || ''} user review, camera test, battery life`,
    };

    if (reviewForm.pushToSubscribers) {
      sendNewsletterBroadcastApi({
        type: 'review',
        title: `New Device Review: ${phoneObj?.name || 'Smartphone'} (★ ${newRev.rating}/5)`,
        message: `"${newRev.comment.slice(0, 150)}..." — Reviewed by ${newRev.userName}.`,
        actionUrl: `/?phone=${encodeURIComponent(newRev.phoneId)}`,
        actionLabel: 'Read Review',
      }).then((res) => {
        if (res.broadcast) setBroadcasts((prev) => [res.broadcast!, ...prev]);
      });
    }

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
          pushToSubscribers: false,
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
          label: 'Best Budget Phones',
          onClick: () => {
            setSection('featured');
            setFeaturedCategoryFilter('best-budget');
          },
          active: section === 'featured' && featuredCategoryFilter === 'best-budget',
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
          label: 'Buying Guides',
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
      label: 'Contact Messages',
      icon: Mail,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} new` : (contactInquiries.length > 0 ? contactInquiries.length : undefined),
      group: 'COMMUNICATIONS & AUDIENCE',
      subItems: [
        {
          label: `All Inquiries (${contactInquiries.length})`,
          onClick: () => {
            setSection('messages');
            setInquiryFilter('all');
          },
          active: section === 'messages' && inquiryFilter === 'all',
        },
        {
          label: `Unread (${unreadMessagesCount})`,
          onClick: () => {
            setSection('messages');
            setInquiryFilter('unread');
          },
          active: section === 'messages' && inquiryFilter === 'unread',
        },
        {
          label: 'Replied',
          onClick: () => {
            setSection('messages');
            setInquiryFilter('replied');
          },
          active: section === 'messages' && inquiryFilter === 'replied',
        },
      ],
    },
    {
      id: 'broadcasts',
      label: 'Push to Subscribers',
      icon: Radio,
      badge: subscribers.length > 0 ? `${subscribers.length} subs` : undefined,
      group: 'COMMUNICATIONS & AUDIENCE',
      subItems: [
        {
          label: 'Compose Broadcast',
          onClick: () => setSection('broadcasts'),
          active: section === 'broadcasts',
        },
        {
          label: `Subscribers List (${subscribers.length})`,
          onClick: () => setSection('broadcasts'),
          active: section === 'broadcasts',
        },
      ],
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
      label: 'Company & Site Pages',
      icon: Globe,
      group: 'SETTINGS & SYSTEM',
      subItems: [
        {
          label: 'About Us & Contact Us',
          onClick: () => setSection('content'),
          active: section === 'content',
        },
        {
          label: 'Advertise with Us',
          onClick: () => setSection('content'),
          active: section === 'content',
        },
        {
          label: 'Privacy Policy & Terms',
          onClick: () => setSection('content'),
          active: section === 'content',
        },
      ],
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

    const updateSpecGroup = <K extends keyof Phone['detailedSpecs']>(
      groupKey: K,
      fieldKey: string,
      value: any
    ) => {
      setDraft((prev: Phone) => ({
        ...prev,
        detailedSpecs: {
          ...prev.detailedSpecs,
          [groupKey]:
            typeof prev.detailedSpecs[groupKey] === 'object' && prev.detailedSpecs[groupKey] !== null
              ? { ...(prev.detailedSpecs[groupKey] as any), [fieldKey]: value }
              : value,
        },
      }));
    };

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
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Charging Summary</label>
              <input
                type="text"
                value={draft.keyHighlights.charging}
                onChange={(e) => updateHighlight('charging', e.target.value)}
                placeholder="e.g. 45W wired, 15W wireless"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* META BOX B: DESIGN & BODY */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            2. DESIGN & BODY SPECIFICATIONS (Dimensions, Weight, Build, Water Resistance)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Dimensions</label>
              <input
                type="text"
                value={draft.detailedSpecs.body.dimensions}
                onChange={(e) => updateSpecGroup('body', 'dimensions', e.target.value)}
                placeholder="162.3 x 79.0 x 8.6 mm"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Weight</label>
              <input
                type="text"
                value={draft.detailedSpecs.body.weight}
                onChange={(e) => updateSpecGroup('body', 'weight', e.target.value)}
                placeholder="232 g"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Build Materials</label>
              <input
                type="text"
                value={draft.detailedSpecs.body.build}
                onChange={(e) => updateSpecGroup('body', 'build', e.target.value)}
                placeholder="Glass front, titanium frame, glass back"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Water & Dust Resistance</label>
              <input
                type="text"
                value={draft.detailedSpecs.body.waterResistance}
                onChange={(e) => updateSpecGroup('body', 'waterResistance', e.target.value)}
                placeholder="IP68 dust/water resistant (up to 1.5m for 30 min)"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* META BOX C: DISPLAY */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            3. DISPLAY SPECIFICATIONS (Type, Size, Resolution, Protection, Brightness, Refresh Rate)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Panel Type</label>
              <input
                type="text"
                value={draft.detailedSpecs.display.type}
                onChange={(e) => updateSpecGroup('display', 'type', e.target.value)}
                placeholder="Dynamic LTPO AMOLED 2X, 120Hz, HDR10+"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Size & Screen-to-Body Ratio</label>
              <input
                type="text"
                value={draft.detailedSpecs.display.size}
                onChange={(e) => updateSpecGroup('display', 'size', e.target.value)}
                placeholder="6.8 inches, 114.7 cm² (~88.5% screen-to-body ratio)"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Resolution & Density</label>
              <input
                type="text"
                value={draft.detailedSpecs.display.resolution}
                onChange={(e) => updateSpecGroup('display', 'resolution', e.target.value)}
                placeholder="1440 x 3120 pixels, 19.5:9 ratio (~505 ppi density)"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Glass Protection</label>
              <input
                type="text"
                value={draft.detailedSpecs.display.protection}
                onChange={(e) => updateSpecGroup('display', 'protection', e.target.value)}
                placeholder="Corning Gorilla Glass Armor"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Peak Brightness</label>
              <input
                type="text"
                value={draft.detailedSpecs.display.brightness}
                onChange={(e) => updateSpecGroup('display', 'brightness', e.target.value)}
                placeholder="2600 nits (peak)"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Refresh Rate</label>
              <input
                type="text"
                value={draft.detailedSpecs.display.refreshRate}
                onChange={(e) => updateSpecGroup('display', 'refreshRate', e.target.value)}
                placeholder="1Hz - 120Hz adaptive"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* META BOX D: PLATFORM & BENCHMARKS */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            4. PLATFORM & BENCHMARKS (OS, Chipset, CPU, GPU, AnTuTu Score)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Operating System (OS)</label>
              <input
                type="text"
                value={draft.detailedSpecs.platform.os}
                onChange={(e) => updateSpecGroup('platform', 'os', e.target.value)}
                placeholder="Android 15, up to 7 major upgrades"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Chipset / SoC</label>
              <input
                type="text"
                value={draft.detailedSpecs.platform.chipset}
                onChange={(e) => updateSpecGroup('platform', 'chipset', e.target.value)}
                placeholder="Qualcomm SM8650-AC Snapdragon 8 Gen 3 (4 nm)"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">AnTuTu Benchmark Score (v10)</label>
              <input
                type="text"
                value={draft.detailedSpecs.platform.antutuScore}
                onChange={(e) => updateSpecGroup('platform', 'antutuScore', e.target.value)}
                placeholder="1,823,822 (AnTuTu v10)"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">CPU Cores & Clock Speeds</label>
              <input
                type="text"
                value={draft.detailedSpecs.platform.cpu}
                onChange={(e) => updateSpecGroup('platform', 'cpu', e.target.value)}
                placeholder="8-core (1x3.39GHz Cortex-X4 & 3x3.1GHz Cortex-A720...)"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">GPU Graphics</label>
              <input
                type="text"
                value={draft.detailedSpecs.platform.gpu}
                onChange={(e) => updateSpecGroup('platform', 'gpu', e.target.value)}
                placeholder="Adreno 750 (1 GHz)"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* META BOX E: MEMORY & STORAGE */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            5. MEMORY & STORAGE (RAM Variants, Storage Variants, Storage Type, MicroSD Slot)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                RAM Options (comma-separated)
              </label>
              <input
                type="text"
                value={ramStr}
                onChange={(e) => setRamStr(e.target.value)}
                placeholder="8GB, 12GB, 16GB"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Storage Options (comma-separated)
              </label>
              <input
                type="text"
                value={storageStr}
                onChange={(e) => setStorageStr(e.target.value)}
                placeholder="128GB, 256GB, 512GB, 1TB"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Storage Technology Type</label>
              <input
                type="text"
                value={draft.detailedSpecs.memory.storageType}
                onChange={(e) => updateSpecGroup('memory', 'storageType', e.target.value)}
                placeholder="UFS 4.0 / NVMe"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">MicroSD Card Slot</label>
              <input
                type="text"
                value={draft.detailedSpecs.memory.cardSlot}
                onChange={(e) => updateSpecGroup('memory', 'cardSlot', e.target.value)}
                placeholder="No or microSDXC (dedicated slot)"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* META BOX F: CAMERA — MAIN REAR & FRONT SELFIE */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            6. CAMERA SYSTEM (Main Rear Camera Setup, Features, Video + Front Selfie Camera Setup, Features, Video)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Main Rear Camera Setup / Modules</label>
              <input
                type="text"
                value={draft.detailedSpecs.mainCamera.setup}
                onChange={(e) => updateSpecGroup('mainCamera', 'setup', e.target.value)}
                placeholder="200 MP, f/1.7 (wide) OIS + 50 MP (periscope telephoto) 5x zoom + 12 MP (ultrawide)"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Main Camera Features</label>
              <input
                type="text"
                value={draft.detailedSpecs.mainCamera.features}
                onChange={(e) => updateSpecGroup('mainCamera', 'features', e.target.value)}
                placeholder="Laser AF, LED flash, auto-HDR, panorama"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Main Camera Video Capabilities</label>
              <input
                type="text"
                value={draft.detailedSpecs.mainCamera.video}
                onChange={(e) => updateSpecGroup('mainCamera', 'video', e.target.value)}
                placeholder="8K@24/30fps, 4K@30/60/120fps, 1080p@30/60/240fps, HDR10+"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Front Selfie Camera Setup</label>
              <input
                type="text"
                value={draft.detailedSpecs.selfieCamera.setup}
                onChange={(e) => updateSpecGroup('selfieCamera', 'setup', e.target.value)}
                placeholder="12 MP, f/2.2, 26mm (wide), Dual Pixel PDAF"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Selfie Features</label>
                <input
                  type="text"
                  value={draft.detailedSpecs.selfieCamera.features}
                  onChange={(e) => updateSpecGroup('selfieCamera', 'features', e.target.value)}
                  placeholder="Auto-HDR, HDR10+"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Selfie Video</label>
                <input
                  type="text"
                  value={draft.detailedSpecs.selfieCamera.video}
                  onChange={(e) => updateSpecGroup('selfieCamera', 'video', e.target.value)}
                  placeholder="4K@30/60fps, 1080p@30fps"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* META BOX G: BATTERY & CHARGING */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            7. BATTERY & CHARGING (Capacity, Wired Charging, Wireless / Reverse Charging)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Battery Capacity & Type</label>
              <input
                type="text"
                value={draft.detailedSpecs.battery.capacity}
                onChange={(e) => updateSpecGroup('battery', 'capacity', e.target.value)}
                placeholder="Li-Ion 5000 mAh, non-removable"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Wired Charging</label>
              <input
                type="text"
                value={draft.detailedSpecs.battery.charging}
                onChange={(e) => updateSpecGroup('battery', 'charging', e.target.value)}
                placeholder="45W wired, PD3.0, 65% in 30 min"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Wireless & Reverse Charging</label>
              <input
                type="text"
                value={draft.detailedSpecs.battery.wirelessCharging}
                onChange={(e) => updateSpecGroup('battery', 'wirelessCharging', e.target.value)}
                placeholder="15W wireless (Qi/PMA), 4.5W reverse wireless"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* META BOX H: NETWORK & CELLULAR */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            8. NETWORK & CELLULAR (Technology, 5G Bands, Speed, SIM Configuration)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Network Technology</label>
              <input
                type="text"
                value={draft.detailedSpecs.network.technology}
                onChange={(e) => updateSpecGroup('network', 'technology', e.target.value)}
                placeholder="GSM / CDMA / HSPA / EVDO / LTE / 5G"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">5G Bands</label>
              <input
                type="text"
                value={draft.detailedSpecs.network.bands5g}
                onChange={(e) => updateSpecGroup('network', 'bands5g', e.target.value)}
                placeholder="SA/NSA/Sub6, Bands n1, n3, n5, n7, n8, n20, n28, n38, n40, n41, n77, n78"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Network Speed</label>
              <input
                type="text"
                value={draft.detailedSpecs.network.speed}
                onChange={(e) => updateSpecGroup('network', 'speed', e.target.value)}
                placeholder="HSPA 42.2/5.76 Mbps, LTE-A, 5G"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">SIM Configuration</label>
              <input
                type="text"
                value={draft.detailedSpecs.network.sim}
                onChange={(e) => updateSpecGroup('network', 'sim', e.target.value)}
                placeholder="Dual SIM (2 Nano-SIMs + eSIM, dual stand-by)"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* META BOX I: CONNECTIVITY & MULTIMEDIA */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            9. CONNECTIVITY & MULTIMEDIA (WLAN, Bluetooth, NFC, USB, Infrared, Positioning, Radio, Audio)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">WLAN (Wi-Fi)</label>
              <input
                type="text"
                value={draft.detailedSpecs.connectivity.wlan}
                onChange={(e) => updateSpecGroup('connectivity', 'wlan', e.target.value)}
                placeholder="Wi-Fi 802.11 a/b/g/n/ac/6e/7, tri-band"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Bluetooth</label>
              <input
                type="text"
                value={draft.detailedSpecs.connectivity.bluetooth}
                onChange={(e) => updateSpecGroup('connectivity', 'bluetooth', e.target.value)}
                placeholder="5.3, A2DP, LE"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">NFC</label>
              <input
                type="text"
                value={draft.detailedSpecs.connectivity.nfc}
                onChange={(e) => updateSpecGroup('connectivity', 'nfc', e.target.value)}
                placeholder="Yes"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">USB Port</label>
              <input
                type="text"
                value={draft.detailedSpecs.connectivity.usb}
                onChange={(e) => updateSpecGroup('connectivity', 'usb', e.target.value)}
                placeholder="USB Type-C 3.2, DisplayPort 1.2, OTG"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Infrared Port</label>
              <input
                type="text"
                value={draft.detailedSpecs.connectivity.infrared}
                onChange={(e) => updateSpecGroup('connectivity', 'infrared', e.target.value)}
                placeholder="Yes or No"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">FM Radio</label>
              <input
                type="text"
                value={draft.detailedSpecs.connectivity.radio}
                onChange={(e) => updateSpecGroup('connectivity', 'radio', e.target.value)}
                placeholder="No or FM radio"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">GPS / Satellite Positioning</label>
              <input
                type="text"
                value={draft.detailedSpecs.connectivity.positioning || 'GPS (L1+L5), GLONASS, BDS, GALILEO, QZSS'}
                onChange={(e) => updateSpecGroup('connectivity', 'positioning', e.target.value)}
                placeholder="GPS (L1+L5), GLONASS, BDS, GALILEO, QZSS"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Loudspeaker</label>
              <input
                type="text"
                value={draft.detailedSpecs.sound.loudspeaker}
                onChange={(e) => updateSpecGroup('sound', 'loudspeaker', e.target.value)}
                placeholder="Yes, with stereo speakers"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">3.5mm Headphone Jack</label>
              <input
                type="text"
                value={draft.detailedSpecs.sound.jack35mm}
                onChange={(e) => updateSpecGroup('sound', 'jack35mm', e.target.value)}
                placeholder="No or Yes"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Audio Specs (Hi-Res / Dolby)</label>
              <input
                type="text"
                value={draft.detailedSpecs.sound.audioSpecs || '24-bit/192kHz Hi-Res audio, Dolby Atmos support'}
                onChange={(e) => updateSpecGroup('sound', 'audioSpecs', e.target.value)}
                placeholder="32-bit/384kHz audio, Tuned by AKG, Dolby Atmos"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* META BOX J: SECURITY, BIOMETRICS & SENSORS */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            10. SECURITY, BIOMETRICS & SENSORS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Biometrics</label>
              <input
                type="text"
                value={draft.detailedSpecs.biometrics || 'Fingerprint (under display, ultrasonic)'}
                onChange={(e) =>
                  setDraft((prev: Phone) => ({
                    ...prev,
                    detailedSpecs: { ...prev.detailedSpecs, biometrics: e.target.value },
                  }))
                }
                placeholder="Fingerprint (under display, ultrasonic) / Face ID"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Security Hardware</label>
              <input
                type="text"
                value={draft.detailedSpecs.securityHardware || 'Hardware-backed Keystore & Knox Vault'}
                onChange={(e) =>
                  setDraft((prev: Phone) => ({
                    ...prev,
                    detailedSpecs: { ...prev.detailedSpecs, securityHardware: e.target.value },
                  }))
                }
                placeholder="Samsung Knox Vault / Apple Secure Enclave"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">All Sensors</label>
              <input
                type="text"
                value={draft.detailedSpecs.sensors}
                onChange={(e) =>
                  setDraft((prev: Phone) => ({
                    ...prev,
                    detailedSpecs: { ...prev.detailedSpecs, sensors: e.target.value },
                  }))
                }
                placeholder="Fingerprint, accelerometer, gyro, proximity, compass, barometer"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* META BOX K: SEO TITLE, FOCUS KEYWORDS & META DESCRIPTION */}
        <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>11. SEO TITLE, FOCUS KEYWORDS &amp; SEARCH META DESCRIPTION</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                const name = draft.name.trim() || 'Smartphone';
                const brand = draft.brand.trim() || 'Brand';
                setDraft((prev: Phone) => ({
                  ...prev,
                  seoTitle: `${name} Full Specifications, Review & Price in USD / NGN | ${websiteContent.siteName || 'GsmScope'}`,
                  seoKeywords: `${name}, ${brand} ${name}, ${name} specs, ${name} price in Nigeria, ${name} USD price, ${prev.keyHighlights.processor}, ${prev.keyHighlights.camera}, ${prev.keyHighlights.battery}`,
                  seoDescription: `Compare full technical specifications and live street prices for ${name} (${prev.releaseYear}): ${prev.keyHighlights.display} display, ${prev.keyHighlights.processor}, ${prev.keyHighlights.camera}, and ${prev.keyHighlights.battery} battery.`,
                }));
                showGlobalToast('Auto-generated optimized SEO Title, Keywords & Description!', 'info');
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-Generate SEO</span>
            </button>
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
                placeholder={`${draft.name || 'Phone Model'} Full Specifications & Price | GsmScope`}
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

          {(section !== 'dashboard' || adminSubView !== null) && (
            <button
              onClick={() => goBack()}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
              title="Step Back to Previous Admin View"
            >
              <span>← Back</span>
            </button>
          )}

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
            title="Contact Form Messages"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>Messages</span>
            {unreadMessagesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSection('broadcasts')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-800 text-xs text-slate-300 cursor-pointer"
            title="Push Updates to Subscribers"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Broadcast</span>
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
                    <span>Inquiries</span>
                    <Mail className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                    {contactInquiries.length}
                  </div>
                  <div className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-1 truncate">
                    {unreadMessagesCount} unread · reply inbox
                  </div>
                </div>

                <div
                  onClick={() => setSection('broadcasts')}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Audience Push</span>
                    <Radio className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                    {subscribers.length}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                    {broadcasts.length} broadcasts sent
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
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
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

              {/* Explore, Guides & Company Pages Management Directory */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                      Site Navigation &amp; Footer Pages Management (Explore · Guides · Company)
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Every public page, phone category, buying guide, and company policy has live management here.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Column 1: Explore */}
                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span>Explore</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">5 Sections</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        {
                          label: 'All Phones',
                          meta: `${phones.length} devices`,
                          action: () => {
                            setSection('phones');
                            setShowPhoneForm(false);
                          },
                        },
                        {
                          label: 'Best Phones',
                          meta: `${phones.filter((p) => p.rating >= 4.7 || p.isFeatured || (p.categories || []).includes('top-rated')).length} picks`,
                          action: () => {
                            setSection('featured');
                            setFeaturedCategoryFilter('all');
                          },
                        },
                        {
                          label: 'Compare Phones',
                          meta: 'VS Pair & Headline',
                          action: () => {
                            setSection('featured');
                            setFeaturedCategoryFilter('all');
                          },
                        },
                        {
                          label: 'News & Articles',
                          meta: `${articles.filter((a) => !String(a.category || '').toLowerCase().includes('guide')).length} posts`,
                          action: () => {
                            setSection('news');
                            setArticleCategoryFilter('news');
                          },
                        },
                        {
                          label: 'User Reviews',
                          meta: `${reviews.length} reviews`,
                          action: () => {
                            setSection('reviews');
                            setReviewFilter('all');
                          },
                        },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={item.action}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 text-left transition-all cursor-pointer group"
                        >
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {item.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-500">
                            {item.meta} →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Guides */}
                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span>Guides &amp; Best Lists</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">8 Sections</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        {
                          label: 'Brand Directory',
                          meta: `${brands.length} brands`,
                          action: () => setSection('brands'),
                        },
                        {
                          label: 'Buying Guides',
                          meta: `${articles.filter((a) => String(a.category || '').toLowerCase().includes('guide') || ['FRP & Servicing Tools', 'Charging & Battery', 'Tips & Security'].includes(a.category)).length} guides`,
                          action: () => {
                            setSection('news');
                            setArticleCategoryFilter('guides');
                          },
                        },
                        {
                          label: 'Best phones overall',
                          meta: `${phones.filter((p) => (p.categories || []).includes('top-rated') || (p.categories || []).includes('flagship') || p.isFeatured).length} tagged`,
                          action: () => {
                            setSection('featured');
                            setFeaturedCategoryFilter('top-rated');
                          },
                        },
                        {
                          label: 'Best budget phones',
                          meta: `${phones.filter((p) => (p.categories || []).includes('best-budget') || (p.categories || []).includes('under-200k') || p.priceNGN <= 200000).length} tagged`,
                          action: () => {
                            setSection('featured');
                            setFeaturedCategoryFilter('best-budget');
                          },
                        },
                        {
                          label: 'Best camera phones',
                          meta: `${phones.filter((p) => (p.categories || []).includes('best-camera')).length} tagged`,
                          action: () => {
                            setSection('featured');
                            setFeaturedCategoryFilter('best-camera');
                          },
                        },
                        {
                          label: 'Best gaming phones',
                          meta: `${phones.filter((p) => (p.categories || []).includes('best-gaming')).length} tagged`,
                          action: () => {
                            setSection('featured');
                            setFeaturedCategoryFilter('best-gaming');
                          },
                        },
                        {
                          label: 'Best battery phones',
                          meta: `${phones.filter((p) => (p.categories || []).includes('best-battery')).length} tagged`,
                          action: () => {
                            setSection('featured');
                            setFeaturedCategoryFilter('best-battery');
                          },
                        },
                        {
                          label: 'Best 5G phones',
                          meta: `${phones.filter((p) => (p.categories || []).includes('best-5g') || (p.categories || []).includes('5g') || p.keyHighlights.network5g).length} tagged`,
                          action: () => {
                            setSection('featured');
                            setFeaturedCategoryFilter('best-5g');
                          },
                        },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={item.action}
                          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 text-left transition-all cursor-pointer group"
                        >
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {item.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-500">
                            {item.meta} →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Company */}
                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span>Company Pages</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">5 Pages</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        {
                          label: 'About Us',
                          meta: 'Summary & Custom Copy',
                          action: () => setSection('content'),
                        },
                        {
                          label: 'Contact Us',
                          meta: `${websiteContent.officeLocation || 'Sokoto, Nigeria'}`,
                          action: () => setSection('content'),
                        },
                        {
                          label: 'Advertise with Us',
                          meta: 'Tiers, Rates & Ad Slots',
                          action: () => setSection('content'),
                        },
                        {
                          label: 'Privacy Policy',
                          meta: 'Legal Clauses & Rich Text',
                          action: () => setSection('content'),
                        },
                        {
                          label: 'Terms of Service',
                          meta: 'Terms & Conditions',
                          action: () => setSection('content'),
                        },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={item.action}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 text-left transition-all cursor-pointer group"
                        >
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {item.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-500">
                            {item.meta} →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Management Modules Quick Access Grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 font-mono">
                  Management Modules
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: 'phones', title: 'Add / Edit / Delete Phones', desc: 'Full device publisher with all 12 spec tables & gallery', icon: Smartphone },
                    { id: 'specs', title: 'Add & Update Specifications', desc: 'Edit every hardware spec field across all 12 tables', icon: Sliders },
                    { id: 'pricing', title: 'Update Phone Prices', desc: 'Instant USD ($), NGN (₦), old price & price notes', icon: DollarSign },
                    { id: 'brands', title: 'Add / Manage Brands', desc: 'Create & edit smartphone brands and warranty info', icon: Layers },
                    { id: 'media', title: 'Upload Phone Images', desc: 'Upload local device images or URLs and assign to phones', icon: ImageIcon },
                    { id: 'news', title: 'Publish & Manage News/Articles', desc: 'Write reviews, news stories, and buyer guides', icon: FileText },
                    { id: 'reviews', title: 'Manage Reviews / Comments', desc: 'Approve, reject, or delete community device reviews', icon: MessageSquare },
                    { id: 'featured', title: 'Manage Featured Phones', desc: 'Control homepage hero carousel & category badges', icon: Star },
                    { id: 'ads', title: 'Manage Advertisements & Placements', desc: 'Control 7 page ad placements, Learn More buttons & script ad codes', icon: Megaphone },
                    { id: 'content', title: 'Manage Website Content', desc: 'Edit site title, hero copy, contact details & footer text', icon: Globe },
                    { id: 'spec-tables', title: 'Manage Spec Tables & Subtables', desc: 'Customize specification table headings, order & subfields', icon: Table2 },
                    { id: 'users', title: 'Manage Users & Roles', desc: 'Add/remove administrators, editors, authors & moderators', icon: Users },
                    { id: 'scripts', title: 'Header / Body / Footer Scripts', desc: 'Manage meta verification tags, analytics & custom code', icon: Code2 },
                    { id: 'messages', title: 'Contact Form Inquiries & Reply', desc: 'View messages from contact form and send direct email replies', icon: Mail },
                    { id: 'broadcasts', title: 'Push to Newsletter Subscribers', desc: 'Dispatch news alerts, launches & price drop notices to audience', icon: Radio },
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
                    type="button"
                    onClick={() => {
                      if (!showPhoneForm) {
                        openCreatePhoneForm();
                      }
                    }}
                    className="px-3.5 py-2 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Source &amp; Add Phone</span>
                  </button>
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

                  {/* AI SMARTPHONE SPEC SOURCER BANNER (OFFICIAL MANUFACTURER & RELIABLE SOURCES) */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-slate-50 dark:from-[#062116] dark:via-[#071a12] dark:to-slate-950 border-2 border-emerald-500/40 space-y-3 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                          <Sparkles className="w-4 h-4" />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
                            <span>AI Smartphone Spec Sourcer — Auto-Fill All 12 Specification Tables</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                              <ShieldCheck className="w-3 h-3" />
                              Official Manufacturer &amp; Trusted Sources
                            </span>
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Enter a phone title (e.g. <strong>Samsung Galaxy S25 Ultra</strong>, <strong>iPhone 16 Pro Max</strong>) or model number (e.g. <strong>SM-S938B</strong>, <strong>A3296</strong>) and click <strong>Source to Fill</strong>.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={aiPhoneQuery}
                          onChange={(e) => setAiPhoneQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAiSourcePhoneSpecs('phoneDraft');
                            }
                          }}
                          placeholder="Type phone title or model number (e.g. Samsung Galaxy S25 Ultra, SM-S938B, Redmi Note 14 Pro+, iPhone 16 Pro)..."
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/40 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={isAiSourcingPhone}
                        onClick={() => handleAiSourcePhoneSpecs('phoneDraft')}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 transition-colors"
                      >
                        {isAiSourcingPhone ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sourcing from Manufacturer &amp; Filling Specs...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Source to Fill All Specs</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Display Verified Genuine Sources */}
                    {aiPhoneSources.length > 0 && (
                      <div className="pt-2 border-t border-emerald-500/20 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Verified Sources Used (Official Manufacturer Website &amp; Hardware Authorities):</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {aiPhoneSources.map((src, idx) => (
                            <a
                              key={idx}
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border transition-colors ${
                                src.isManufacturer
                                  ? 'bg-emerald-600/15 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-bold'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                              }`}
                            >
                              <span className="truncate max-w-[260px]">{src.title}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GENERAL & PRICING & MEDIA META BOX */}
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
                        0. GENERAL TABLE, IDENTITY, PRICING & MEDIA
                      </h3>
                      <button
                        type="button"
                        disabled={isAiSourcingPhone}
                        onClick={() =>
                          handleAiSourcePhoneSpecs(
                            'phoneDraft',
                            phoneDraft.name.trim() ||
                              (phoneDraft.modelNumber && phoneDraft.modelNumber !== 'SM-NEW2025'
                                ? phoneDraft.modelNumber.trim()
                                : aiPhoneQuery.trim())
                          )
                        }
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        title="Source all specifications using the Phone Model Name or Model Number entered below"
                      >
                        {isAiSourcingPhone ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Sourcing Specs...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            <span>Source to Fill from Title / Model #</span>
                          </>
                        )}
                      </button>
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
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Model Number (GENERAL Table)</label>
                        <input
                          type="text"
                          value={phoneDraft.modelNumber || ''}
                          onChange={(e) => setPhoneDraft({ ...phoneDraft, modelNumber: e.target.value })}
                          placeholder="e.g. SM-S928B, SM-S928B/DS"
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Market Status (GENERAL Table)</label>
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

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Release Date Text (GENERAL Table)</label>
                        <input
                          type="text"
                          value={phoneDraft.releaseDate}
                          onChange={(e) => setPhoneDraft({ ...phoneDraft, releaseDate: e.target.value })}
                          placeholder="e.g. January 2025"
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Release Year</label>
                        <input
                          type="number"
                          value={phoneDraft.releaseYear}
                          onChange={(e) => setPhoneDraft({ ...phoneDraft, releaseYear: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Price (USD $) *</label>
                        <input
                          type="number"
                          required
                          value={phoneDraft.priceUSD}
                          onChange={(e) => setPhoneDraft({ ...phoneDraft, priceUSD: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Price (NGN ₦) *</label>
                        <input
                          type="number"
                          required
                          value={phoneDraft.priceNGN}
                          onChange={(e) => setPhoneDraft({ ...phoneDraft, priceNGN: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Old Price NGN (Optional)</label>
                        <input
                          type="number"
                          value={phoneDraft.oldPriceNGN || ''}
                          onChange={(e) =>
                            setPhoneDraft({
                              ...phoneDraft,
                              oldPriceNGN: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          placeholder="e.g. 500000"
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Price Segment Tier</label>
                        <select
                          value={phoneDraft.priceRange}
                          onChange={(e) => setPhoneDraft({ ...phoneDraft, priceRange: e.target.value as PriceRangeCategory })}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                        >
                          <option value="under100k">Under ₦100k (Entry)</option>
                          <option value="100k-200k">₦100k – ₦200k (Budget)</option>
                          <option value="200k-350k">₦200k – ₦350k (Mid-Range)</option>
                          <option value="350k-600k">₦350k – ₦600k (Upper Mid-Range)</option>
                          <option value="600k-1.2m">₦600k – ₦1.2M (Premium)</option>
                          <option value="flagship">Flagship (₦1.2M+)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Screen Size (Inches, numeric)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={phoneDraft.screenSizeInches || 6.7}
                          onChange={(e) => setPhoneDraft({ ...phoneDraft, screenSizeInches: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Card Accent Glow Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={phoneDraft.accentColor || '#10b981'}
                            onChange={(e) => setPhoneDraft({ ...phoneDraft, accentColor: e.target.value })}
                            className="h-9 w-12 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
                          />
                          <input
                            type="text"
                            value={phoneDraft.accentColor || '#10b981'}
                            onChange={(e) => setPhoneDraft({ ...phoneDraft, accentColor: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Primary Image + Gallery + Price Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                          Price &amp; Market Availability Notes
                        </label>
                        <input
                          type="text"
                          value={phoneDraft.nairaPriceNotes}
                          onChange={(e) => setPhoneDraft({ ...phoneDraft, nairaPriceNotes: e.target.value })}
                          placeholder="e.g. Available at Slot, Pointek, Finet, and official stores."
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                        />
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
                            <span>Featured on Homepage Hero Carousel</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-sky-600 dark:text-sky-400">
                            <input
                              type="checkbox"
                              checked={Boolean(phoneDraft.isPopular)}
                              onChange={(e) => setPhoneDraft({ ...phoneDraft, isPopular: e.target.checked })}
                            />
                            <span>Trending / Popular Phone</span>
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

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-2.5 cursor-pointer bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 select-none">
                      <input
                        type="checkbox"
                        checked={pushPhoneToSubscribers}
                        onChange={(e) => setPushPhoneToSubscribers(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                      />
                      <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                      <span>Push launch alert to newsletter subscribers ({subscribers.length} recipients)</span>
                    </label>

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
                                {phone.isFeatured && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-mono">
                                    Featured
                                  </span>
                                )}
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
                        <td className="py-3 px-3 font-mono">
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
                    disabled={isAiSourcingPhone}
                    onClick={() =>
                      handleAiSourcePhoneSpecs(
                        'specPhoneDraft',
                        `${specPhoneDraft.brand} ${specPhoneDraft.name} ${specPhoneDraft.modelNumber || ''}`.trim()
                      )
                    }
                    className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    title="Auto-fill all 12 specification tables from official manufacturer & trusted hardware sources"
                  >
                    {isAiSourcingPhone ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sourcing Official Specs...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Source to Fill All Specs</span>
                      </>
                    )}
                  </button>
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

              {aiPhoneSources.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-500/30 space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Manufacturer &amp; Hardware Authority Sources Used:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {aiPhoneSources.map((src, idx) => (
                      <a
                        key={`${src.url}-${idx}`}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                          src.isManufacturer
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/25'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/40'
                        }`}
                      >
                        <Globe className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate max-w-[220px]">{src.title || src.domain}</span>
                        {src.isManufacturer && (
                          <span className="px-1 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-mono uppercase">
                            OEM
                          </span>
                        )}
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* GENERAL TABLE FIELDS FOR SELECTED PHONE */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                  0. GENERAL TABLE (Release Date, Model Number, Market Status, USD & NGN Price)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Release Date</label>
                    <input
                      type="text"
                      value={specPhoneDraft.releaseDate}
                      onChange={(e) => setSpecPhoneDraft({ ...specPhoneDraft, releaseDate: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Model Number</label>
                    <input
                      type="text"
                      value={specPhoneDraft.modelNumber || ''}
                      onChange={(e) => setSpecPhoneDraft({ ...specPhoneDraft, modelNumber: e.target.value })}
                      placeholder="e.g. SM-S928B"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Market Status</label>
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
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Price (USD $)</label>
                    <input
                      type="number"
                      value={specPhoneDraft.priceUSD}
                      onChange={(e) => setSpecPhoneDraft({ ...specPhoneDraft, priceUSD: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Price (NGN ₦)</label>
                    <input
                      type="number"
                      value={specPhoneDraft.priceNGN}
                      onChange={(e) => setSpecPhoneDraft({ ...specPhoneDraft, priceNGN: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
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
                          <td className="py-3 px-3 font-mono">
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
                  <RichTextEditor
                    label="Brand Description"
                    helperText="Supports H1–H3 & Bold"
                    compactToolbar
                    rows={3}
                    value={brandForm.description}
                    onChange={(val) => setBrandForm({ ...brandForm, description: val })}
                    placeholder="Write brand overview with headings or bold highlights..."
                  />

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
                        placeholder={`${brandForm.name || 'Brand'} Phones, Specs & Prices | GsmScope`}
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
                  <table className="w-full text-left border-collapse text-xs">
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
                        category: 'Buying Guides',
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

                  {/* AI Editorial Review & Article Writer Assistant */}
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-sky-500/10 border border-emerald-500/30 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        <span>AI Review &amp; Article Assistant</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono uppercase font-bold">
                        Manufacturer Grounded
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Enter a smartphone model or headline topic below and click <strong>Source &amp; Write</strong> to generate a complete review or article grounded on official manufacturer specs.
                    </p>
                    <input
                      type="text"
                      value={aiArticleQuery}
                      onChange={(e) => setAiArticleQuery(e.target.value)}
                      placeholder="Device or topic (e.g. Samsung Galaxy S25 Ultra Review)"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                    <input
                      type="text"
                      value={aiArticleNotes}
                      onChange={(e) => setAiArticleNotes(e.target.value)}
                      placeholder="Optional focus (e.g. camera test, gaming & battery)"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                    <button
                      type="button"
                      disabled={isAiGeneratingArticle}
                      onClick={handleAiGenerateEditorialArticle}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {isAiGeneratingArticle ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sourcing &amp; Writing with AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Source &amp; Write Review / Article</span>
                        </>
                      )}
                    </button>
                    {aiArticleSources.length > 0 && (
                      <div className="pt-1.5 border-t border-emerald-500/20 space-y-1">
                        <div className="text-[9px] font-mono uppercase text-emerald-700 dark:text-emerald-300 font-bold">
                          Verified Sources ({aiArticleSources.length}):
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {aiArticleSources.slice(0, 4).map((src, idx) => (
                            <a
                              key={`${src.url}-${idx}`}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-emerald-700 dark:text-emerald-300 hover:underline"
                            >
                              <Globe className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate max-w-[130px]">{src.domain}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
                        <option value="Review">Review</option>
                        <option value="Buying Guides">Buying Guides</option>
                        <option value="Buying Guide">Buying Guide</option>
                        <option value="FRP & Servicing Tools">FRP &amp; Servicing Tools</option>
                        <option value="Charging & Battery">Charging &amp; Battery</option>
                        <option value="Tips & Security">Tips &amp; Security</option>
                        <option value="Launch">Launch</option>
                        <option value="Phone News">Phone News</option>
                        <option value="Tech Updates">Tech Updates</option>
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
                            articleForm.category === 'Buying Guides'
                              ? 'guide'
                              : articleForm.category === 'Reviews' || articleForm.category === 'Review'
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
                  <RichTextEditor
                    label="Summary / Excerpt"
                    helperText="Supports Bold & Highlights"
                    compactToolbar
                    rows={2}
                    value={articleForm.summary}
                    onChange={(val) => setArticleForm({ ...articleForm, summary: val })}
                    placeholder="Write a concise lead summary or bold key highlights..."
                  />
                  <RichTextEditor
                    label="Full Article / Guide / Review Body"
                    helperText="H1, H2, H3, H4, Bold Text & Bold Paragraph"
                    rows={8}
                    value={articleForm.content}
                    onChange={(val) => setArticleForm({ ...articleForm, content: val })}
                    placeholder="Write your full article, buying guide, or review. Use H1, H2, H3, H4 buttons for section headings and Bold / Bold ¶ to make words or entire paragraphs bold..."
                  />

                  {/* Article / Guide / Review SEO Title & Keywords Box */}
                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">
                        SEO Title &amp; Focus Keywords
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const title = articleForm.title.trim() || 'Smartphone Guide & News';
                          setArticleForm((prev) => ({
                            ...prev,
                            seoTitle: `${title} | ${websiteContent.siteName || 'GsmScope'}`,
                            seoKeywords: prev.tags || `${prev.category}, Smartphone Review, Buying Guide, GsmScope`,
                            seoDescription: prev.summary || title,
                          }));
                          showGlobalToast('Auto-filled post SEO fields!', 'info');
                        }}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Auto-Fill SEO
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                        SEO Title (&lt;title&gt;)
                      </label>
                      <input
                        type="text"
                        value={articleForm.seoTitle}
                        onChange={(e) => setArticleForm({ ...articleForm, seoTitle: e.target.value })}
                        placeholder={`${articleForm.title || 'Post Title'} | GsmScope`}
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
                    <label className="flex items-center gap-2 cursor-pointer bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-2.5 rounded-lg text-xs font-semibold text-emerald-800 dark:text-emerald-300 select-none">
                      <input
                        type="checkbox"
                        checked={pushArticleToSubscribers}
                        onChange={(e) => setPushArticleToSubscribers(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                      />
                      <Radio className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Push post to subscribers ({subscribers.length} audience)</span>
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
                          label: `Buying Guides (${
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
                          onClick={() => setArticleCategoryFilter(tab.id as any)}
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
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-mono uppercase text-slate-500">
                        <th className="py-3 px-4">Article / Guide &amp; SEO</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {articles
                        .filter((art) => {
                          if (articleCategoryFilter === 'all') return true;
                          const c = String(art.category || '').toLowerCase();
                          const isGuide =
                            c.includes('guide') ||
                            ['frp & servicing tools', 'charging & battery', 'tips & security'].includes(c);
                          const isReview = c.includes('review');
                          if (articleCategoryFilter === 'guides') return isGuide;
                          if (articleCategoryFilter === 'reviews') return isReview;
                          return !isGuide && !isReview;
                        })
                        .map((art) => (
                        <tr key={art.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4">
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
                          <td className="py-3 px-3">{art.category}</td>
                          <td className="py-3 px-3 font-mono text-slate-400">{art.date}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex gap-1.5">
                              <button
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
                                    authorName: art.author?.name || 'GsmScope Editorial',
                                    authorRole: art.author?.role || 'Senior Editor',
                                    seoTitle: art.seoTitle || '',
                                    seoKeywords: art.seoKeywords || '',
                                    seoDescription: art.seoDescription || '',
                                  });
                                }}
                                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-xs font-semibold cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  runWithProgress(() => deleteArticle(art.id), `Deleted article.`)
                                }
                                className="p-1 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white cursor-pointer"
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

                  {/* AI Review Assistant inside Admin Reviews Section */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-sky-500/10 border border-emerald-500/30 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                          <Sparkles className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                              AI Review Assistant — Source &amp; Write Review
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono uppercase font-bold">
                              Official OEM &amp; GSMArena Grounded
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            Select a target phone below or type any smartphone model/number and click <strong>Source &amp; Write Review</strong> to auto-fill a comprehensive, factual review with SEO metadata.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                      <div className="md:col-span-5">
                        <input
                          type="text"
                          value={aiAdminReviewQuery}
                          onChange={(e) => setAiAdminReviewQuery(e.target.value)}
                          placeholder="Optional custom model/number (or leave blank to use selected Target Phone)"
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <input
                          type="text"
                          value={aiAdminReviewNotes}
                          onChange={(e) => setAiAdminReviewNotes(e.target.value)}
                          placeholder="Optional focus notes (e.g. 5G battery test, camera zoom, thermal performance)"
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <button
                          type="button"
                          disabled={isAiGeneratingAdminReview}
                          onClick={handleAiGenerateAdminReview}
                          className="w-full h-full py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {isAiGeneratingAdminReview ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Sourcing &amp; Writing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Source &amp; Write Review</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {(aiAdminReviewSpecsSummary || aiAdminReviewSources.length > 0) && (
                      <div className="pt-2 border-t border-emerald-500/20 space-y-2">
                        {aiAdminReviewSpecsSummary && (
                          <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/70 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                            <span className="font-mono uppercase text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mr-1.5">
                              Verified Hardware:
                            </span>
                            {aiAdminReviewSpecsSummary}
                          </div>
                        )}
                        {aiAdminReviewSources.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Sources:</span>
                            </span>
                            {aiAdminReviewSources.map((src, idx) => (
                              <a
                                key={`${src.url}-${idx}`}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 hover:border-emerald-500/40"
                              >
                                <Globe className="w-2.5 h-2.5 text-emerald-500" />
                                <span className="truncate max-w-[160px]">{src.title || src.domain}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
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

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reviewForm.pushToSubscribers}
                        onChange={(e) => setReviewForm({ ...reviewForm, pushToSubscribers: e.target.checked })}
                        className="accent-emerald-600"
                      />
                      <Radio className="w-3.5 h-3.5" />
                      <span>Push this review to newsletter subscribers ({subscribers.length})</span>
                    </label>
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
                                pushToSubscribers: false,
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
                            onClick={() => {
                              sendNewsletterBroadcastApi({
                                type: 'review',
                                title: `Community Review: ${phone?.name || rev.phoneName || 'Phone'} (★ ${rev.rating}/5)`,
                                message: `"${rev.comment.slice(0, 150)}..." — Verified owner review by ${rev.userName} from ${rev.location}.`,
                                actionUrl: `/?phone=${encodeURIComponent(rev.phoneId)}`,
                                actionLabel: 'Read Full Review',
                              }).then((res) => {
                                if (res.broadcast) setBroadcasts((prev) => [res.broadcast!, ...prev]);
                                showGlobalToast('Pushed review highlight to newsletter subscribers!', 'success');
                              });
                            }}
                            className="px-2.5 py-1.5 rounded bg-sky-600/10 hover:bg-sky-600 text-sky-700 dark:text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Broadcast review highlight to newsletter subscribers"
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Push Review</span>
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
                  Best Phones, 6 Buying Guide Categories &amp; Compare Phones
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage Compare Phones settings, Homepage Featured Spotlights, and the 6 Best Phone categories under Explore &amp; Guides (Best phones overall, Best budget, Best camera, Best gaming, Best battery, and Best 5G).
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
                      Filter &amp; Curate the 6 Guides Best Phone Categories
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
                      id: 'best-budget',
                      label: 'Best budget phones',
                      badgeHint: 'best-budget / under-200k',
                      count: phones.filter(
                        (p) =>
                          (p.categories || []).includes('best-budget') ||
                          (p.categories || []).includes('under-200k') ||
                          p.priceNGN <= 200000
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
                        if (featuredCategoryFilter === 'best-budget') {
                          return tags.includes('best-budget') || tags.includes('under-200k') || phone.priceNGN <= 200000;
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
              SECTION 9: MANAGE ADVERTISEMENTS & 7 PAGE AD PLACEMENTS
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
                    Manage all 7 dedicated page ad placements, custom Learn More buttons, banner images, and HTML / JavaScript (&lt;script&gt;) ad codes. When a placement is turned off, its position on the page remains completely normal with zero empty space.
                  </p>
                </div>

                <button
                  onClick={() =>
                    runWithProgress(
                      () => updateAdSettings(localAdSettings),
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
                    (url) => {
                      updatePlacementField(targetPlacementId, { imageUrl: url });
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
                                        updatePlacementField(placementId, {
                                          adType: modeOpt.value as AdPlacementConfig['adType'],
                                        })
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
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                      Banner Image URL (Optional — Upload to /uploads or Pick from Media Library)
                                    </label>
                                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                                      {item.imageUrl && (
                                        <img
                                          src={item.imageUrl}
                                          alt={item.title}
                                          className="w-12 h-9 rounded-lg object-cover bg-slate-950 border border-slate-300 dark:border-slate-700 shrink-0"
                                        />
                                      )}
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
                                            (url) => updatePlacementField(placementId, { imageUrl: url })
                                          )
                                        }
                                        className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                                      >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        <span>Library</span>
                                      </button>
                                      {item.imageUrl && (
                                        <button
                                          type="button"
                                          onClick={() => updatePlacementField(placementId, { imageUrl: '' })}
                                          className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white text-xs cursor-pointer shrink-0"
                                          title="Remove image"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Learn More Button Configuration Box */}
                                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={item.showLearnMore}
                                          onChange={(e) =>
                                            updatePlacementField(placementId, { showLearnMore: e.target.checked })
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
                                            updatePlacementField(placementId, { openInNewTab: e.target.checked })
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
                                          updatePlacementField(placementId, {
                                            scriptCode: snippet,
                                            adType: item.adType === 'banner' ? 'script' : item.adType,
                                          });
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

              {/* Global Top Bar, Sidebar Ad & Sponsored Phone Settings */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 max-w-4xl">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h2 className="text-sm font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400">
                    Additional Sitewide Banners &amp; Sponsored Phone Spotlight
                  </h2>
                </div>

                {/* Top Banner */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase font-bold text-emerald-600">Top Leaderboard Banner</h3>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localAdSettings.topBanner.enabled}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          const currentHeaderTop = localAdSettings.placements?.header_top || DEFAULT_AD_PLACEMENTS.header_top;
                          setLocalAdSettings({
                            ...localAdSettings,
                            topBanner: { ...localAdSettings.topBanner, enabled },
                            placements: {
                              ...localAdSettings.placements,
                              header_top: { ...currentHeaderTop, enabled },
                            },
                          });
                        }}
                        className="accent-emerald-600"
                      />
                      <span>Enable Top Banner</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Banner Title</label>
                      <input
                        type="text"
                        value={localAdSettings.topBanner.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          const currentHeaderTop = localAdSettings.placements?.header_top || DEFAULT_AD_PLACEMENTS.header_top;
                          setLocalAdSettings({
                            ...localAdSettings,
                            topBanner: { ...localAdSettings.topBanner, title },
                            placements: {
                              ...localAdSettings.placements,
                              header_top: { ...currentHeaderTop, title },
                            },
                          });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Tag Label</label>
                      <input
                        type="text"
                        value={localAdSettings.topBanner.tag}
                        onChange={(e) => {
                          const tag = e.target.value;
                          const currentHeaderTop = localAdSettings.placements?.header_top || DEFAULT_AD_PLACEMENTS.header_top;
                          setLocalAdSettings({
                            ...localAdSettings,
                            topBanner: { ...localAdSettings.topBanner, tag },
                            placements: {
                              ...localAdSettings.placements,
                              header_top: { ...currentHeaderTop, badgeText: tag },
                            },
                          });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Subtitle / Description</label>
                    <input
                      type="text"
                      value={localAdSettings.topBanner.subtitle}
                      onChange={(e) => {
                        const subtitle = e.target.value;
                        const currentHeaderTop = localAdSettings.placements?.header_top || DEFAULT_AD_PLACEMENTS.header_top;
                        setLocalAdSettings({
                          ...localAdSettings,
                          topBanner: { ...localAdSettings.topBanner, subtitle },
                          placements: {
                            ...localAdSettings.placements,
                            header_top: { ...currentHeaderTop, subtitle },
                          },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Destination Link URL</label>
                    <input
                      type="text"
                      value={localAdSettings.topBanner.linkUrl}
                      onChange={(e) => {
                        const linkUrl = e.target.value;
                        const currentHeaderTop = localAdSettings.placements?.header_top || DEFAULT_AD_PLACEMENTS.header_top;
                        setLocalAdSettings({
                          ...localAdSettings,
                          topBanner: { ...localAdSettings.topBanner, linkUrl },
                          placements: {
                            ...localAdSettings.placements,
                            header_top: { ...currentHeaderTop, learnMoreUrl: linkUrl },
                          },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                {/* Sidebar Banner */}
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase font-bold text-emerald-600">Sidebar / In-Feed Banner</h3>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localAdSettings.sidebarBanner.enabled}
                        onChange={(e) =>
                          setLocalAdSettings({
                            ...localAdSettings,
                            sidebarBanner: { ...localAdSettings.sidebarBanner, enabled: e.target.checked },
                          })
                        }
                        className="accent-emerald-600"
                      />
                      <span>Enable Sidebar Ad</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Sponsor Title</label>
                      <input
                        type="text"
                        value={localAdSettings.sidebarBanner.title}
                        onChange={(e) =>
                          setLocalAdSettings({
                            ...localAdSettings,
                            sidebarBanner: { ...localAdSettings.sidebarBanner, title: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Sponsor Brand</label>
                      <input
                        type="text"
                        value={localAdSettings.sidebarBanner.sponsor}
                        onChange={(e) =>
                          setLocalAdSettings({
                            ...localAdSettings,
                            sidebarBanner: { ...localAdSettings.sidebarBanner, sponsor: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={localAdSettings.sidebarBanner.subtitle}
                      onChange={(e) =>
                        setLocalAdSettings({
                          ...localAdSettings,
                          sidebarBanner: { ...localAdSettings.sidebarBanner, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Destination Link URL</label>
                    <input
                      type="text"
                      value={localAdSettings.sidebarBanner.linkUrl}
                      onChange={(e) =>
                        setLocalAdSettings({
                          ...localAdSettings,
                          sidebarBanner: { ...localAdSettings.sidebarBanner, linkUrl: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                {/* Sponsored Phone */}
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-[11px] font-bold uppercase text-slate-500">Sponsored Phone Spotlight</label>
                  <select
                    value={localAdSettings.sponsoredPhoneId || ''}
                    onChange={(e) =>
                      setLocalAdSettings({
                        ...localAdSettings,
                        sponsoredPhoneId: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                  >
                    <option value="">None</option>
                    {phones.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.brand} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() =>
                    runWithProgress(() => updateAdSettings(localAdSettings), 'Advertisement settings saved.')
                  }
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Advertisement Settings</span>
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
                      setWebsiteContent({
                        ...websiteContent,
                        headerLogoDarkUrl: '/assets/aistudio/GsmScope_header_logo_dark.webp',
                        headerLogoLightUrl: '/assets/aistudio/GsmScope_header_logo_light.webp',
                        faviconUrl: '/favicon.svg',
                      });
                      showGlobalToast('Restored default GsmScope logos. Click Save All Site Settings to apply.', 'info');
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
                      (url) => setWebsiteContent((prev) => ({ ...prev, headerLogoDarkUrl: url }))
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
                      (url) => setWebsiteContent((prev) => ({ ...prev, headerLogoLightUrl: url }))
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
                      (url) => setWebsiteContent((prev) => ({ ...prev, faviconUrl: url }))
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
                            setWebsiteContent((prev) => ({ ...prev, headerLogoDarkUrl: url }))
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
                        src={websiteContent.headerLogoLightUrl || '/assets/aistudio/GsmScope_header_logo_light.webp'}
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
                      placeholder="/assets/aistudio/GsmScope_header_logo_light.webp"
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
                            setWebsiteContent((prev) => ({ ...prev, headerLogoLightUrl: url }))
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
                        src={websiteContent.faviconUrl || '/favicon.svg'}
                        alt="Favicon Preview"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <input
                      type="text"
                      value={websiteContent.faviconUrl || '/favicon.svg'}
                      onChange={(e) =>
                        setWebsiteContent({ ...websiteContent, faviconUrl: e.target.value })
                      }
                      placeholder="/favicon.svg"
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
                            setWebsiteContent((prev) => ({ ...prev, faviconUrl: url }))
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

              {/* 3. CORE WEBSITE COPY, HERO HEADLINES & CONTACT DETAILS */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-5xl shadow-sm">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h2 className="text-sm font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400">
                    3. Core Website Copy, Hero Headlines & Contact Information
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

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Top Announcement Bar Message
                  </label>
                  <input
                    type="text"
                    value={websiteContent.announcementBar}
                    onChange={(e) => setWebsiteContent({ ...websiteContent, announcementBar: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Homepage Hero Headline</label>
                    <input
                      type="text"
                      value={websiteContent.heroHeadline}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, heroHeadline: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Homepage Hero Subtitle</label>
                    <input
                      type="text"
                      value={websiteContent.heroSubtitle}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, heroSubtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                <RichTextEditor
                  label="About Us Summary Copy"
                  helperText="Supports H1–H4 Headings, Bold Text & Bold Paragraph"
                  rows={3}
                  value={websiteContent.aboutSummary}
                  onChange={(val) => setWebsiteContent({ ...websiteContent, aboutSummary: val })}
                  placeholder="Write About Us summary with headings or bold highlights..."
                />

                {/* Company Pages Rich Text Content Editors (About Us, Contact Us, Advertise with Us, Privacy Policy, Terms of Service) */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="text-[11px] font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400">
                    Company Pages Rich Content Editors (About Us · Contact Us · Advertise with Us · Privacy Policy · Terms of Service)
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <RichTextEditor
                      label="About Us Page — Additional Custom Section (Optional)"
                      helperText="H1–H4 & Bold"
                      rows={4}
                      value={websiteContent.aboutPageContent || ''}
                      onChange={(val) => setWebsiteContent({ ...websiteContent, aboutPageContent: val })}
                      placeholder="Add custom H1/H2/H3 headings, bold paragraphs, or editorial notes to the About Us page..."
                    />
                    <RichTextEditor
                      label="Contact Us Page — Additional Custom Section (Optional)"
                      helperText="H1–H4 & Bold"
                      rows={4}
                      value={websiteContent.contactPageContent || ''}
                      onChange={(val) => setWebsiteContent({ ...websiteContent, contactPageContent: val })}
                      placeholder="Add custom office hours, support notes, or H2/H3 headings to the Contact Us page..."
                    />
                    <RichTextEditor
                      label="Advertise with Us Page — Additional Custom Section (Optional)"
                      helperText="H1–H4 & Bold"
                      rows={4}
                      value={websiteContent.advertisePageContent || ''}
                      onChange={(val) => setWebsiteContent({ ...websiteContent, advertisePageContent: val })}
                      placeholder="Add custom sponsorship tiers, H2/H3 headings, or bold announcements to the Advertise with Us page..."
                    />
                    <RichTextEditor
                      label="Privacy Policy — Additional Custom Section (Optional)"
                      helperText="H1–H4 & Bold"
                      rows={4}
                      value={websiteContent.privacyPolicyContent || ''}
                      onChange={(val) => setWebsiteContent({ ...websiteContent, privacyPolicyContent: val })}
                      placeholder="Add custom privacy clauses with H2/H3 headings and bold paragraphs..."
                    />
                    <RichTextEditor
                      label="Terms of Service — Additional Custom Section (Optional)"
                      helperText="H1–H4 & Bold"
                      rows={4}
                      value={websiteContent.termsOfServiceContent || ''}
                      onChange={(val) => setWebsiteContent({ ...websiteContent, termsOfServiceContent: val })}
                      placeholder="Add custom terms or legal notices with H2/H3 headings and bold paragraphs..."
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">X (Twitter) Profile URL</label>
                      <input
                        type="text"
                        value={websiteContent.twitterUrl || ''}
                        onChange={(e) => setWebsiteContent({ ...websiteContent, twitterUrl: e.target.value })}
                        placeholder="https://x.com/gsmscope"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Instagram URL</label>
                      <input
                        type="text"
                        value={websiteContent.instagramUrl || ''}
                        onChange={(e) => setWebsiteContent({ ...websiteContent, instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/gsmscope"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">WhatsApp Support Number</label>
                      <input
                        type="text"
                        value={websiteContent.whatsappNumber || ''}
                        onChange={(e) => setWebsiteContent({ ...websiteContent, whatsappNumber: e.target.value })}
                        placeholder="+2348004767267"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Footer Copyright Text</label>
                    <input
                      type="text"
                      value={websiteContent.footerCopyright}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, footerCopyright: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Footer Price Disclaimer</label>
                    <input
                      type="text"
                      value={websiteContent.footerDisclaimer}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, footerDisclaimer: e.target.value })}
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
                <button
                  onClick={() =>
                    runWithProgress(() => {
                      localStorage.setItem('gsmscope_spec_tables_schema_v1', JSON.stringify(specTablesSchema));
                      updateWebsiteContent({ specTablesSchema });
                    }, 'Saved Specification Tables & Subtables schema to server.')
                  }
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Schema Changes</span>
                </button>
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
                    setSpecTablesSchema((prev) => [...prev, created]);
                    setNewTableTitle('');
                    showGlobalToast(`Added table "${created.title}".`, 'success');
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
                              setSpecTablesSchema(next);
                            }}
                            className="accent-emerald-600"
                          />
                          <input
                            type="text"
                            value={group.title}
                            onChange={(e) => {
                              const next = [...specTablesSchema];
                              next[idx] = { ...group, title: e.target.value.toUpperCase() };
                              setSpecTablesSchema(next);
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
                              setSpecTablesSchema(next);
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
                              setSpecTablesSchema(next);
                            }}
                            className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setSpecTablesSchema((prev) => prev.filter((g) => g.id !== group.id))
                            }
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
                                  setSpecTablesSchema(next);
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
                                  setSpecTablesSchema(next);
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
                                setSpecTablesSchema(next);
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
                            placeholder="Field key (e.g. display.touchRate)"
                            className="w-48 px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!subDraft.label.trim()) return;
                              const next = [...specTablesSchema];
                              next[idx] = {
                                ...group,
                                subtables: [
                                  ...group.subtables,
                                  {
                                    id: `sub-${Date.now()}`,
                                    label: subDraft.label.trim(),
                                    keyPath: subDraft.keyPath.trim() || 'custom.field',
                                    enabled: true,
                                  },
                                ],
                              };
                              setSpecTablesSchema(next);
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
                  <table className="w-full text-left border-collapse text-xs">
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                    Custom &lt;head&gt; Meta Tags & Header Scripts (Analytics, AdSense, Pixels)
                  </label>
                  <textarea
                    rows={4}
                    value={scriptsConfig.headerScripts}
                    onChange={(e) => setScriptsConfig({ ...scriptsConfig, headerScripts: e.target.value })}
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 text-purple-300 border border-slate-800 text-xs font-mono"
                  />
                </div>

                <button
                  onClick={() =>
                    runWithProgress(() => {
                      localStorage.setItem('gsmscope_custom_scripts_v1', JSON.stringify(scriptsConfig));
                      updateWebsiteContent({ customScripts: scriptsConfig });
                    }, 'Saved Header, Body, and Footer scripts & meta codes to server.')
                  }
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Scripts & Meta Codes</span>
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
                      Verifies backend API, persistent disk permissions (<code className="font-mono">data/database.json</code> &amp; <code className="font-mono">/uploads</code>), <code className="font-mono">app.cjs</code> startup, and SEO routes.
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
                        <span className="text-slate-600 dark:text-slate-400">cPanel & SEO Endpoints</span>
                        <span className={connectionReport.health?.cpanelStartupReady && connectionReport.seoEndpoints?.sitemapXmlOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}>
                          {connectionReport.health?.cpanelStartupReady ? 'app.cjs Ready' : 'Check app.cjs'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        ads.txt: {connectionReport.seoEndpoints?.adsTxtOk ? 'OK' : 'Err'} • sitemap: {connectionReport.seoEndpoints?.sitemapXmlOk ? 'OK' : 'Err'} • AI: {connectionReport.health?.services?.aiConfigured ? 'Active' : 'Key Optional'}
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
              SECTION 14: CONTACT FORM INQUIRIES & DIRECT REPLY CENTER
          ================================================================= */}
          {section === 'messages' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2.5">
                    <Mail className="w-6 h-6 text-cyan-500" />
                    <span>Contact Messages & Inquiries ({contactInquiries.length})</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage incoming submissions from the public Contact page. View messages, filter by status, and draft and dispatch official replies to senders.
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
                          showGlobalToast(`Refreshed inbox (${data.length} messages)`, 'info');
                        }
                      });
                    }}
                    className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-cyan-500 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refresh Inbox</span>
                  </button>
                </div>
              </div>

              {/* Status Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div
                  onClick={() => setInquiryFilter('all')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    inquiryFilter === 'all'
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Total Inquiries Received</span>
                    <Inbox className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                    {contactInquiries.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">All customer & partner messages</div>
                </div>

                <div
                  onClick={() => setInquiryFilter('unread')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    inquiryFilter === 'unread'
                      ? 'bg-rose-500/10 border-rose-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Unread & Awaiting Reply</span>
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1.5 font-mono">
                    {unreadMessagesCount}
                  </div>
                  <div className="text-[11px] text-rose-500/90 mt-0.5">Action required</div>
                </div>

                <div
                  onClick={() => setInquiryFilter('replied')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    inquiryFilter === 'replied'
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Replied / Resolved</span>
                    <CheckCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono">
                    {contactInquiries.filter((i) => i.replied || i.status === 'replied').length}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Official response dispatched</div>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
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

                <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 pr-1">
                    <Filter className="w-3 h-3" /> Filter:
                  </span>
                  {(['all', 'unread', 'replied'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setInquiryFilter(mode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                        inquiryFilter === mode
                          ? 'bg-cyan-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages List / Cards */}
              <div className="space-y-3">
                {contactInquiries
                  .filter((item) => {
                    if (inquiryFilter === 'unread') {
                      return item.status !== 'read' && item.status !== 'replied' && !item.replied;
                    }
                    if (inquiryFilter === 'replied') {
                      return item.replied || item.status === 'replied';
                    }
                    return true;
                  })
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
                  .map((item) => {
                    const isUnread = item.status !== 'read' && item.status !== 'replied' && !item.replied;
                    const isReplied = item.replied || item.status === 'replied';

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-3 ${
                          isUnread
                            ? 'bg-cyan-50/30 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-800/80 shadow-sm'
                            : isReplied
                            ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-950/60'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {item.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                                  isUnread
                                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                    : isReplied
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {isUnread ? 'Unread Inquiry' : isReplied ? 'Replied' : 'Read'}
                              </span>
                              {item.category && (
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                  {item.category}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                              <a
                                href={`mailto:${item.email}`}
                                className="flex items-center gap-1 hover:text-cyan-500 font-mono text-cyan-600 dark:text-cyan-400"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>{item.email}</span>
                              </a>
                              {item.phone && (
                                <a
                                  href={`tel:${item.phone}`}
                                  className="flex items-center gap-1 hover:text-emerald-500 font-mono"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  <span>{item.phone}</span>
                                </a>
                              )}
                              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(item.createdAt).toLocaleString()}</span>
                              </span>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setActiveReplyInquiry(item);
                                setReplySubject(
                                  item.subject.toLowerCase().startsWith('re:')
                                    ? item.subject
                                    : `Re: ${item.subject || 'Your Inquiry on GsmScope'}`
                                );
                                setReplyMessage(
                                  `Hello ${item.name.split(' ')[0] || item.name},\n\nThank you for reaching out to GsmScope regarding "${item.subject}".\n\n`
                                );
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                            >
                              <Reply className="w-3.5 h-3.5" />
                              <span>{isReplied ? 'Reply Again' : 'Reply'}</span>
                            </button>

                            <button
                              onClick={() => {
                                const nextStatus = item.status === 'read' ? 'unread' : 'read';
                                updateContactInquiryStatusApi(item.id, nextStatus).then(() => {
                                  setContactInquiries((prev) =>
                                    prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
                                  );
                                  showGlobalToast(
                                    nextStatus === 'read' ? 'Marked message as read' : 'Marked as unread',
                                    'info'
                                  );
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                              title={item.status === 'read' ? 'Mark as Unread' : 'Mark as Read'}
                            >
                              {item.status === 'read' ? 'Mark Unread' : 'Mark Read'}
                            </button>

                            <button
                              onClick={() => {
                                deleteContactInquiryApi(item.id).then(() => {
                                  setContactInquiries((prev) => prev.filter((i) => i.id !== item.id));
                                  showGlobalToast('Deleted inquiry.', 'success');
                                });
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white cursor-pointer transition-colors"
                              title="Delete Message"
                            >
                              <Trash2 className="w-4 h-4" />
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

                        {/* Dispatched Reply History Box */}
                        {isReplied && item.replyMessage && (
                          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 p-3.5 rounded-xl space-y-1 text-xs">
                            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                              <span className="flex items-center gap-1.5">
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Official Reply Dispatched</span>
                              </span>
                              {item.repliedAt && (
                                <span className="font-mono text-[11px] text-slate-400">
                                  {new Date(item.repliedAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap pt-0.5 leading-relaxed font-sans">
                              {item.replyMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {contactInquiries.length === 0 && (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <Mail className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Inbox is clear</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      No customer inquiries have been received through the contact form yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 15: PUSH BROADCASTS & SUBSCRIBERS AUDIENCE
          ================================================================= */}
          {section === 'broadcasts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2.5">
                    <Radio className="w-6 h-6 text-emerald-500 animate-pulse" />
                    <span>Push Updates, Alerts & News to Subscribers</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Compose and blast instant breaking news alerts, price drops, buying guides, and phone launch notices directly to all registered newsletter subscribers.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const csvHeader = 'Email,SubscribedAt,Status\n';
                      const csvRows = subscribers.map((s) => `"${s.email}","${s.subscribedAt}","${s.status}"`).join('\n');
                      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `gsmscope-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                      showGlobalToast(`Exported ${subscribers.length} subscriber emails.`, 'success');
                    }}
                    className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV ({subscribers.length})</span>
                  </button>
                </div>
              </div>

              {/* Audience Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Newsletter Audience</span>
                    <Users className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                    {subscribers.length}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Active subscribers receiving broadcasts
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Broadcasts Dispatched</span>
                    <Send className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                    {broadcasts.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Launches, alerts & news posts</div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Total Recipient Impressions</span>
                    <Bell className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1.5 font-mono">
                    {broadcasts.reduce((sum, b) => sum + (b.recipientCount || subscribers.length || 0), 0)}
                  </div>
                  <div className="text-[11px] text-purple-500 mt-0.5">Total notifications delivered</div>
                </div>
              </div>

              {/* Push Broadcast Composer Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Form Column */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
                      showGlobalToast('Please enter both broadcast title and message.', 'error');
                      return;
                    }
                    setIsBroadcasting(true);
                    sendNewsletterBroadcastApi({
                      type: broadcastType,
                      title: broadcastTitle.trim(),
                      message: broadcastMessage.trim(),
                      actionUrl: broadcastActionUrl.trim() || '/?tab=news',
                      actionLabel: broadcastActionLabel.trim() || 'Learn More',
                    })
                      .then((res) => {
                        setIsBroadcasting(false);
                        if (res.broadcast) {
                          setBroadcasts((prev) => [res.broadcast!, ...prev]);
                        }
                        showGlobalToast(
                          `Successfully broadcasted "${broadcastTitle}" to ${res.broadcast?.recipientCount || subscribers.length} subscribers!`,
                          'success'
                        );
                        setBroadcastTitle('');
                        setBroadcastMessage('');
                      })
                      .catch(() => {
                        setIsBroadcasting(false);
                        showGlobalToast('Failed to dispatch broadcast.', 'error');
                      });
                  }}
                  className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Compose New Push Alert</span>
                    </h2>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      Audience: {subscribers.length} Subscribers
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Broadcast Category / Alert Type *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'news', label: 'News Update', icon: FileText },
                          { id: 'price', label: 'Price Alert', icon: DollarSign },
                          { id: 'phone', label: 'New Phone Launch', icon: Smartphone },
                          { id: 'guide', label: 'Buying Guide', icon: Sparkles },
                          { id: 'review', label: 'Review Spotlight', icon: MessageSquare },
                          { id: 'notice', label: 'Important Notice', icon: Bell },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setBroadcastType(item.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors ${
                            broadcastType === item.id
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50'
                          }`}
                        >
                          <item.icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Alert Headline / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. Flash Price Drop: Galaxy S25 Ultra now ₦1,750,000 in Nigerian Hubs"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-medium"
                    />
                  </div>

                  <RichTextEditor
                    label="Alert Body / Push Message *"
                    helperText="Supports Headings & Bold"
                    compactToolbar
                    required
                    rows={4}
                    value={broadcastMessage}
                    onChange={(val) => setBroadcastMessage(val)}
                    placeholder="Write your push notification message. Include key specs, price reductions, availability dates, or exclusive insights..."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Call-to-Action Link URL
                      </label>
                      <input
                        type="text"
                        value={broadcastActionUrl}
                        onChange={(e) => setBroadcastActionUrl(e.target.value)}
                        placeholder="/?tab=news or /?phone=..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={broadcastActionLabel}
                        onChange={(e) => setBroadcastActionLabel(e.target.value)}
                        placeholder="e.g. View Device Specs"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastTitle('');
                        setBroadcastMessage('');
                      }}
                      className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
                    >
                      Clear
                    </button>

                    <button
                      type="submit"
                      disabled={isBroadcasting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isBroadcasting ? 'Dispatching...' : `Broadcast to ${subscribers.length} Subscribers`}</span>
                    </button>
                  </div>
                </form>

                {/* Live Preview Column */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Live Subscriber Preview
                      </div>
                      <span className="text-[10px] text-emerald-500 font-bold">Real-time Push Card</span>
                    </div>

                    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src="/assets/aistudio/GsmScope_header_logo_dark.webp"
                            alt="GsmScope"
                            className="h-4 w-auto object-contain"
                          />
                          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                            Push Notification
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-800">
                          {broadcastType}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white line-clamp-2">
                          {broadcastTitle || 'Alert Title Appears Here...'}
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-4">
                          {broadcastMessage ||
                            'Broadcast message copy detailing phone specs, price shifts, or breaking tech news will be rendered here for your audience.'}
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">Sent to {subscribers.length} subscribers</span>
                        <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold">
                          {broadcastActionLabel || 'Read Details'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      💡 Dispatches automatically trigger browser alerts and email digests to subscribers who opt-in to updates.
                    </p>
                  </div>

                  {/* Quick Add Subscriber Box */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
                      Add Subscriber Manually
                    </h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newSubscriberEmail.trim() || !newSubscriberEmail.includes('@')) {
                          showGlobalToast('Please enter a valid email address.', 'error');
                          return;
                        }
                        const email = newSubscriberEmail.trim().toLowerCase();
                        if (subscribers.some((s) => s.email.toLowerCase() === email)) {
                          showGlobalToast('Subscriber is already registered.', 'error');
                          return;
                        }
                        subscribeNewsletterApi(email).then((res) => {
                          if (res.success) {
                            const newSub: NewsletterSubscriber = {
                              email,
                              subscribedAt: new Date().toISOString(),
                              status: 'active',
                            };
                            setSubscribers((prev) => [newSub, ...prev.filter((s) => s.email.toLowerCase() !== email)]);
                            setNewSubscriberEmail('');
                            showGlobalToast(`Added ${email} to newsletter audience.`, 'success');
                          } else {
                            showGlobalToast(res.message || 'Failed to add subscriber.', 'error');
                          }
                        });
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="email"
                        required
                        value={newSubscriberEmail}
                        onChange={(e) => setNewSubscriberEmail(e.target.value)}
                        placeholder="subscriber@email.com"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Broadcasts History Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-3 p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Broadcast Dispatch History ({broadcasts.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Record of all push notifications and alerts sent to the subscriber community.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-mono uppercase text-slate-500">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Headline & Summary</th>
                        <th className="py-2.5 px-3">Recipients</th>
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {broadcasts.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              {b.type}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{b.title}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{b.message}</div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {b.recipientCount} subs
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                            {new Date(b.sentAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                deleteNewsletterBroadcastApi(b.id).then(() => {
                                  setBroadcasts((prev) => prev.filter((item) => item.id !== b.id));
                                  showGlobalToast('Deleted broadcast log.', 'info');
                                });
                              }}
                              className="p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {broadcasts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No broadcasts dispatched yet. Use the composer above to publish your first push update!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Subscribers Directory Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-5 space-y-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Registered Subscribers Directory ({subscribers.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Users subscribed to phone launches, price changes, and buyer updates.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={subscriberSearch}
                      onChange={(e) => setSubscriberSearch(e.target.value)}
                      placeholder="Search subscribers..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto">
                  {subscribers
                    .filter((s) => !subscriberSearch || s.email.toLowerCase().includes(subscriberSearch.toLowerCase()))
                    .map((sub, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-slate-900 dark:text-slate-100 truncate">{sub.email}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Joined: {new Date(sub.subscribedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                            {sub.status || 'active'}
                          </span>
                          <button
                            onClick={() => {
                              deleteNewsletterSubscriberApi(sub.email).then(() => {
                                setSubscribers((prev) =>
                                  prev.filter((s) => s.email.toLowerCase() !== sub.email.toLowerCase())
                                );
                                showGlobalToast(`Removed subscriber ${sub.email}.`, 'info');
                              });
                            }}
                            className="p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white cursor-pointer"
                            title="Remove Subscriber"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              MODAL: DIRECT CONTACT MESSAGE REPLY COMPOSER
          ================================================================= */}
          {activeReplyInquiry && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 p-5 sm:p-6"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Reply className="w-5 h-5 text-cyan-500" />
                      <span>Send Official Reply</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Replying to <strong>{activeReplyInquiry.name}</strong> ({activeReplyInquiry.email})
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveReplyInquiry(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Original Inquiry Quote Card */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <div className="text-[11px] font-mono font-bold uppercase text-slate-400">
                    Original Message ({new Date(activeReplyInquiry.createdAt).toLocaleDateString()})
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Subject: {activeReplyInquiry.subject}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 italic line-clamp-3">
                    "{activeReplyInquiry.message}"
                  </p>
                </div>

                {/* Quick Response Templates */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase font-mono text-slate-400">
                    Insert Quick Response Template
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      {
                        label: 'General Inquiry',
                        text: `Hello ${activeReplyInquiry.name},\n\nThank you for reaching out to GsmScope! We have received your inquiry regarding "${activeReplyInquiry.subject}".\n\nOur editorial and technical teams are reviewing the details and will provide a complete answer shortly. Please let us know if you have any additional questions.\n\nWarm regards,\nGsmScope Team`,
                      },
                      {
                        label: 'Price & Stock Verification',
                        text: `Hello ${activeReplyInquiry.name},\n\nThank you for contacting GsmScope regarding device pricing and retail availability.\n\nOur Nigerian Naira (₦) and USD ($) pricing indices are sourced directly from authorized regional distributors, Computer Village vendors, and verified partner retail outlets. Listings reflect daily market exchange adjustments.\n\nPlease check the live phone detail page for updated variant prices and warranty partner info.\n\nBest regards,\nGsmScope Price Index Team`,
                      },
                      {
                        label: 'Advertising / Media Kit',
                        text: `Hello ${activeReplyInquiry.name},\n\nThank you for your interest in advertising with GsmScope.\n\nWe provide high-visibility brand placements including top header billboards, sponsored phone spotlight cards, and dedicated launch event features. Our media kit and rate card are available upon request.\n\nPlease let us know your planned campaign dates and target audience objectives.\n\nSincerely,\nGsmScope Commercial & Partnerships`,
                      },
                      {
                        label: 'Specs Correction Received',
                        text: `Hello ${activeReplyInquiry.name},\n\nThank you for taking the time to report a hardware specification correction to GsmScope.\n\nOur hardware editors have cross-referenced the technical whitepapers and verified the details. The specification database has been updated accordingly on the live website.\n\nThank you for helping keep GsmScope accurate!\n\nBest regards,\nGsmScope Hardware Editorial`,
                      },
                    ].map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReplyMessage(tpl.text)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-600 hover:text-white text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!replyMessage.trim()) return;
                    setIsSendingReply(true);
                    replyToContactInquiryApi(activeReplyInquiry.id, replySubject, replyMessage)
                      .then((res) => {
                        setIsSendingReply(false);
                        if (res.inquiry) {
                          setContactInquiries((prev) =>
                            prev.map((i) => (i.id === activeReplyInquiry.id ? res.inquiry! : i))
                          );
                        } else {
                          setContactInquiries((prev) =>
                            prev.map((i) =>
                              i.id === activeReplyInquiry.id
                                ? {
                                    ...i,
                                    status: 'replied',
                                    replied: true,
                                    replyMessage,
                                    repliedAt: new Date().toISOString(),
                                  }
                                : i
                            )
                          );
                        }
                        showGlobalToast(`Reply successfully sent to ${activeReplyInquiry.email}!`, 'success');
                        setActiveReplyInquiry(null);
                      })
                      .catch(() => {
                        setIsSendingReply(false);
                        showGlobalToast('Failed to send reply. Please try again.', 'error');
                      });
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Email Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Reply Message *
                    </label>
                    <textarea
                      rows={7}
                      required
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-sans leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveReplyInquiry(null)}
                      className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingReply}
                      className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingReply ? 'Sending Reply...' : 'Send Official Reply'}</span>
                    </button>
                  </div>
                </form>
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
