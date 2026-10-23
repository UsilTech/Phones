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
  };
  connectivity: {
    wlan: string;
    bluetooth: string;
    nfc: string;
    radio: string;
    usb: string;
    infrared: string;
  };
  sensors: string;
}

export interface Phone {
  id: string;
  name: string;
  brand: string;
  priceNGN: number;
  priceUSD: number;
  oldPriceNGN?: number;
  priceRange: PriceRangeCategory;
  marketStatus: 'Available in Nigeria' | 'Pre-order' | 'Coming Soon' | 'Rumored';
  nairaPriceNotes: string;
  releaseYear: number;
  releaseDate: string;
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
  detailedSpecs: PhoneDetailedSpecs;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string;
  description: string;
  officialPresenceInNigeria: string;
  popularSeries: string[];
  warrantyPartner: string;
  logoLetter: string;
  accentBg: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: 'News' | 'Review' | 'Reviews' | 'Buying Guide' | 'Buying Guides' | 'Comparison' | 'Comparisons' | 'Launch' | 'Smartphone News' | 'Tech Updates';
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
  relatedPhoneIds?: string[];
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
  | 'about'
  | 'contact'
  | 'advertise'
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
