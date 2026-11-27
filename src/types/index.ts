export type PriceRangeCategory = 
  | 'under100k'
  | '100k-200k'
  | '200k-350k'
  | '350k-600k'
  | '600k-1.2m'
  | 'flagship';

export interface PhoneDetailedSpecs {
  network: {
    technology: string;
    bands5g: string;
    speed: string;
    sim: string;
  };
  body: {
    dimensions: string;
    weight: string;
    build: string;
    waterResistance: string;
  };
  display: {
    type: string;
    size: string;
    resolution: string;
    protection: string;
    brightness: string;
    refreshRate: string;
  };
  platform: {
    os: string;
    chipset: string;
    cpu: string;
    gpu: string;
    antutuScore: string;
  };
  memory: {
    ramVariants: string[];
    storageVariants: string[];
    cardSlot: string;
    storageType: string;
  };
  mainCamera: {
    setup: string;
    features: string;
    video: string;
  };
  selfieCamera: {
    setup: string;
    features: string;
    video: string;
  };
  battery: {
    capacity: string;
    charging: string;
    wirelessCharging: string;
  };
  sound: {
    loudspeaker: string;
    jack35mm: string;
    audioSpecs?: string;
  };
  connectivity: {
    wlan: string;
    bluetooth: string;
    nfc: string;
    radio: string;
    usb: string;
    infrared: string;
    positioning?: string;
  };
  sensors: string;
  biometrics?: string;
  securityHardware?: string;
}

export interface Phone {
  id: string;
  slug?: string;
  name: string;
  brand: string;
  priceNGN: number;
  priceUSD: number;
  oldPriceNGN?: number;
  priceRange: PriceRangeCategory;
  marketStatus: 'Available' | 'Pre-order' | 'Coming Soon' | 'Rumored' | string;
  nairaPriceNotes: string;
  releaseYear: number;
  releaseDate: string;
  modelNumber?: string;
  image: string;
  images?: string[];
  accentColor: string;
  rating: number;
  reviewsCount: number;
  viewsCount: number;
  categories: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  screenSizeInches?: number;
  keyHighlights: {
    display: string;
    processor: string;
    ram: string;
    storage: string;
    camera: string;
    battery: string;
    charging: string;
    os: string;
    network5g: boolean;
  };
  // SEO fields
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  detailedSpecs: PhoneDetailedSpecs;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string;
  description: string;
  officialPresenceInNigeria?: string;
  globalPresence?: string;
  popularSeries: string[];
  warrantyPartner: string;
  logoLetter: string;
  accentBg: string;
  logoUrl?: string;
  bannerUrl?: string;
  seoTitle?: string;
  seoKeywords?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: 'News' | 'Reviews' | 'Buying Guide' | 'Launch' | string;
  coverImage: string;
  summary: string;
  content: string;
  author: {
    name: string;
    role: string;
  };
  date: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
  viewsCount?: number;
  relatedPhoneIds?: string[];
  // SEO fields
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
}

export interface Review {
  id: string;
  phoneId: string;
  phoneName: string;
  userName: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  verifiedBuyer?: boolean;
  imageUrl?: string;
  seoTitle?: string;
  seoKeywords?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  dataUrl?: string;
  size?: number;
  mimeType?: string;
  uploadedAt: string;
  category?: 'phone' | 'article' | 'news' | 'guide' | 'review' | 'brand' | 'logo' | 'banner' | 'other';
  assignedPhoneId?: string;
  assignedArticleId?: string;
  alt?: string;
}

export interface WebsiteContent {
  siteName: string;
  siteTagline: string;
  announcementBar: string;
  heroHeadline: string;
  heroSubtitle: string;
  aboutSummary: string;
  aboutPageContent?: string;
  contactPageContent?: string;
  privacyPolicyContent?: string;
  termsOfServiceContent?: string;
  advertisePageContent?: string;
  comparePhone1Id?: string;
  comparePhone2Id?: string;
  compareHeadline?: string;
  compareSubtitle?: string;
  contactEmail: string;
  contactPhone: string;
  officeLocation: string;
  footerCopyright: string;
  footerDisclaimer: string;
  headerLogoUrl?: string;
  headerLogoDarkUrl?: string;
  headerLogoLightUrl?: string;
  mobileLogoUrl?: string;
  faviconUrl?: string;
  defaultSeoTitle?: string;
  defaultSeoKeywords?: string;
  defaultSeoDescription?: string;
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
  specTablesSchema?: any[];
  adminUsers?: any[];
  customScripts?: {
    customHeadMeta?: string;
    headerScripts?: string;
    bodyTopScripts?: string;
    footerScripts?: string;
    metaVerificationGoogle?: string;
    metaVerificationBing?: string;
    robotsTxtMeta?: string;
  };
}

export type AdPlacementId =
  | 'header_top'
  | 'home_above_trending'
  | 'home_above_reviews'
  | 'home_above_guides'
  | 'phones_below_top_result'
  | 'best_above_top_rated'
  | 'news_below_featured'
  | 'guides_below_featured';

export interface AdPlacementConfig {
  id: AdPlacementId;
  name: string;
  pageLabel: string;
  positionLabel: string;
  enabled: boolean;
  adType: 'banner' | 'script' | 'both';
  badgeText: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  imageDataUrl?: string;
  showLearnMore: boolean;
  learnMoreText: string;
  learnMoreUrl: string;
  openInNewTab?: boolean;
  scriptCode: string;
  updatedAt?: string;
}

export interface AdSettings {
  topBanner: {
    enabled: boolean;
    title: string;
    subtitle: string;
    linkUrl: string;
    tag: string;
  };
  sidebarBanner: {
    enabled: boolean;
    title: string;
    subtitle: string;
    sponsor: string;
    linkUrl: string;
  };
  sponsoredPhoneId: string | null;
  placements?: Record<AdPlacementId, AdPlacementConfig>;
  adsensePublisherId?: string;
  adsenseAutoAdsEnabled?: boolean;
  adsTxtContent?: string;
  updatedAt?: string;
}

export type ThemeMode = 'dark' | 'light';

export type ActiveTab = 
  | 'home'
  | 'phones'
  | 'compare'
  | 'brands'
  | 'news'
  | 'guides'
  | 'best-phones'
  | 'reviews'
  | 'user-reviews'
  | 'about'
  | 'contact'
  | 'advertise'
  | 'privacy'
  | 'terms'
  | 'admin';

export interface FilterState {
  searchQuery: string;
  selectedBrands: string[];
  minPrice: number;
  maxPrice: number;
  ram: string[];
  storage: string[];
  only5G: boolean;
  minBattery: number;
  minCameraMP: number;
  minScreenSize?: number;
  releaseYearFilter?: number;
  sortBy: 'price-asc' | 'price-desc' | 'popular' | 'rating' | 'newest' | 'battery';
  categoryPreset?: string;
}

export interface GlobalToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  category?: string;
  status?: 'unread' | 'read' | 'replied';
  replied?: boolean;
  repliedAt?: string;
  replySubject?: string;
  replyMessage?: string;
}

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
  confirmationId?: string;
  status?: 'active' | 'pending' | 'unsubscribed';
}

export interface NewsletterBroadcast {
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
}

