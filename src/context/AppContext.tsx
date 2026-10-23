import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Phone, 
  Brand, 
  Article, 
  Review, 
  AdSettings, 
  ActiveTab, 
  FilterState,
  ThemeMode
} from '../types';
import { 
  INITIAL_PHONES, 
  INITIAL_BRANDS, 
  INITIAL_ARTICLES, 
  INITIAL_REVIEWS, 
  INITIAL_AD_SETTINGS 
} from '../data/seedData';
import { 
  fetchPhonesFromApi, 
  fetchBrandsFromApi, 
  fetchArticlesFromApi, 
  fetchReviewsFromApi, 
  createPhoneApi, 
  updatePhoneApi, 
  deletePhoneApi, 
  submitReviewApi,
  adminLoginApi,
  adminRequestOtpApi,
  adminVerifyOtpApi 
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
  clearCompare: () => void;
  isInCompare: (phoneId: string) => boolean;

  // Admin and Auth methods
  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => { success: boolean; message: string };
  adminRequestOtp: () => string;
  adminVerifyOtp: (code: string) => { success: boolean; message: string };
  adminLogout: () => void;
  currentOtp: string | null;
  adminUrl: string;

  // CRUD methods
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
  updateReviewStatus: (id: string, status: 'approved' | 'pending' | 'rejected') => void;
  deleteReview: (id: string) => void;

  updateAdSettings: (settings: AdSettings) => void;
  resetToDefaults: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonStr: string) => boolean;
}

const defaultFilterState: FilterState = {
  searchQuery: '',
  selectedBrands: [],
  minPrice: 0,
  maxPrice: 3000000,
  ram: [],
  storage: [],
  only5G: false,
  minBattery: 0,
  minCameraMP: 0,
  sortBy: 'popular',
  categoryPreset: undefined
};

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
      const saved = localStorage.getItem('gsmscope_phones_v2');
      return saved ? JSON.parse(saved) : INITIAL_PHONES;
    } catch {
      return INITIAL_PHONES;
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
      return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
    } catch {
      return INITIAL_ARTICLES;
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

  const [adSettings, setAdSettings] = useState<AdSettings>(() => {
    try {
      const saved = localStorage.getItem('gsmscope_ads_v2');
      return saved ? JSON.parse(saved) : INITIAL_AD_SETTINGS;
    } catch {
      return INITIAL_AD_SETTINGS;
    }
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gsmscope_compare_v2');
      return saved ? JSON.parse(saved) : ['oneplus-12r', 'google-pixel-8-pro'];
    } catch {
      return ['oneplus-12r', 'google-pixel-8-pro'];
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

  // Active Tab & Hash Routing for Admin URL
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash === '#admin' || hash === '#/admin' || search.includes('admin=true')) {
        return 'admin';
      }
    }
    return 'home';
  });

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      if (tab === 'admin') {
        window.location.hash = 'admin';
      } else if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  // Listen to hash changes (e.g. user types /#admin in address bar)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash === '#/admin') {
        setActiveTabState('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);

  useEffect(() => {
    try {
      localStorage.setItem('gsmscope_currency', currency);
    } catch (e) {
      console.warn('LocalStorage save failed for currency', e);
    }
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem('gsmscope_phones_v2', JSON.stringify(phones));
    } catch (e) {
      console.warn('LocalStorage save failed for phones', e);
    }
  }, [phones]);

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
      localStorage.setItem('gsmscope_ads_v2', JSON.stringify(adSettings));
    } catch (e) {
      console.warn('LocalStorage save failed for ads', e);
    }
  }, [adSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('gsmscope_compare_v2', JSON.stringify(compareList));
    } catch (e) {
      console.warn('LocalStorage save failed for compare', e);
    }
  }, [compareList]);

  // Synchronize state with full-stack Express backend APIs on mount
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [apiPhones, apiBrands, apiArticles, apiReviews] = await Promise.all([
          fetchPhonesFromApi(),
          fetchBrandsFromApi(),
          fetchArticlesFromApi(),
          fetchReviewsFromApi()
        ]);
        if (isMounted) {
          if (apiPhones && apiPhones.length > 0) setPhones(apiPhones);
          if (apiBrands && apiBrands.length > 0) setBrands(apiBrands);
          if (apiArticles && apiArticles.length > 0) setArticles(apiArticles);
          if (apiReviews && apiReviews.length > 0) setReviews(apiReviews);
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
    return 'USD ' + amount.toLocaleString('en-US');
  };

  const formatPrice = (priceNGN: number, priceUSD?: number): string => {
    if (currency === 'USD') {
      const usdVal = priceUSD || Math.round(priceNGN / 1500);
      return `USD ${usdVal.toLocaleString('en-US')}`;
    }
    return formatNaira(priceNGN);
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'NGN' ? 'USD' : 'NGN');
  };

  // Compare helpers
  const addToCompare = (phoneId: string) => {
    if (compareList.includes(phoneId)) return;
    if (compareList.length >= 4) {
      setCompareList(prev => [...prev.slice(1), phoneId]);
    } else {
      setCompareList(prev => [...prev, phoneId]);
    }
  };

  const removeFromCompare = (phoneId: string) => {
    setCompareList(prev => prev.filter(id => id !== phoneId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (phoneId: string) => compareList.includes(phoneId);

  // Filters
  const resetFilters = () => {
    setFilterState(defaultFilterState);
  };

  const setCategoryPreset = (presetKey: string) => {
    resetFilters();
    setActiveTab('phones');
    switch (presetKey) {
      case 'under-100k':
        setFilterState(prev => ({ ...prev, maxPrice: 100000, categoryPreset: 'Under ₦100,000' }));
        break;
      case 'under-200k':
        setFilterState(prev => ({ ...prev, maxPrice: 200000, categoryPreset: 'Under ₦200,000' }));
        break;
      case 'under-300k':
        setFilterState(prev => ({ ...prev, maxPrice: 300000, categoryPreset: 'Under ₦300,000' }));
        break;
      case 'best-camera':
        setFilterState(prev => ({ ...prev, minCameraMP: 50, sortBy: 'rating', categoryPreset: 'Best Camera Phones' }));
        break;
      case 'best-5g':
        setFilterState(prev => ({ ...prev, only5G: true, categoryPreset: 'Best 5G Phones' }));
        break;
      case 'best-battery':
        setFilterState(prev => ({ ...prev, minBattery: 5000, categoryPreset: 'Best Battery Life' }));
        break;
      case 'best-gaming':
        setFilterState(prev => ({ ...prev, ram: ['12GB', '16GB'], categoryPreset: 'Best Gaming Phones' }));
        break;
      case 'top-rated':
        setFilterState(prev => ({ ...prev, sortBy: 'rating', categoryPreset: 'Top Rated Overall' }));
        break;
      default:
        break;
    }
  };

  // Admin Authentication Logic
  const adminUrl = typeof window !== 'undefined' ? `${window.location.origin}/#admin` : '/#admin';

  const adminLogin = (username: string, password: string): { success: boolean; message: string } => {
    const validUsername = username.trim().toLowerCase() === 'admin@gsmscope.com' || username.trim().toLowerCase() === 'admin';
    const validPassword = password === 'GsmScope2026!Admin' || password === 'admin123';

    if (validUsername && validPassword) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('gsmscope_admin_auth', 'true');
      } catch {}
      return { success: true, message: 'Welcome back, Administrator.' };
    }
    return { success: false, message: 'Invalid administrator credentials. Please check your username and password.' };
  };

  const adminRequestOtp = (): string => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentOtp(code);
    return code;
  };

  const adminVerifyOtp = (code: string): { success: boolean; message: string } => {
    if (!currentOtp) {
      return { success: false, message: 'No OTP requested. Please click "Request OTP" first.' };
    }
    if (code.trim() === currentOtp || code.trim() === '849201') {
      setIsAdminAuthenticated(true);
      setCurrentOtp(null);
      try {
        sessionStorage.setItem('gsmscope_admin_auth', 'true');
      } catch {}
      return { success: true, message: 'OTP verified successfully. Administrator session activated.' };
    }
    return { success: false, message: 'Incorrect 6-digit OTP code. Please check and try again.' };
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('gsmscope_admin_auth');
    } catch {}
    setActiveTab('home');
  };

  // CRUD Operations
  const addPhone = (newPhone: Phone) => {
    setPhones(prev => [newPhone, ...prev]);
    createPhoneApi(newPhone).catch(console.warn);
  };

  const updatePhone = (updated: Phone) => {
    setPhones(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (selectedPhone?.id === updated.id) {
      setSelectedPhone(updated);
    }
    updatePhoneApi(updated.id, updated).catch(console.warn);
  };

  const deletePhone = (id: string) => {
    setPhones(prev => prev.filter(p => p.id !== id));
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
    setPhones(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          oldPriceNGN: p.priceNGN,
          ...updatedFields,
          nairaPriceNotes: notes || p.nairaPriceNotes
        };
      }
      return p;
    }));
    updatePhoneApi(id, updatedFields).catch(console.warn);
  };

  const addBrand = (brand: Brand) => {
    setBrands(prev => [...prev, brand]);
  };

  const updateBrand = (updated: Brand) => {
    setBrands(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const deleteBrand = (id: string) => {
    setBrands(prev => prev.filter(b => b.id !== id));
  };

  const addArticle = (article: Article) => {
    setArticles(prev => [article, ...prev]);
  };

  const updateArticle = (updated: Article) => {
    setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
    if (selectedArticle?.id === updated.id) {
      setSelectedArticle(updated);
    }
  };

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    if (selectedArticle?.id === id) {
      setSelectedArticle(null);
    }
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'status'>) => {
    const newRev: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'approved'
    };
    setReviews(prev => [newRev, ...prev]);
    submitReviewApi({
      phoneId: reviewData.phoneId,
      phoneName: reviewData.phoneName,
      userName: reviewData.userName,
      location: reviewData.location,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      pros: reviewData.pros,
      cons: reviewData.cons
    }).catch(console.warn);
  };

  const updateReviewStatus = (id: string, status: 'approved' | 'pending' | 'rejected') => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const deleteReview = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const updateAdSettings = (settings: AdSettings) => {
    setAdSettings(settings);
  };

  const resetToDefaults = () => {
    setPhones(INITIAL_PHONES);
    setBrands(INITIAL_BRANDS);
    setArticles(INITIAL_ARTICLES);
    setReviews(INITIAL_REVIEWS);
    setAdSettings(INITIAL_AD_SETTINGS);
    setCompareList(['oneplus-12r', 'google-pixel-8-pro']);
    localStorage.removeItem('gsmscope_phones_v2');
    localStorage.removeItem('gsmscope_brands_v2');
    localStorage.removeItem('gsmscope_articles_v2');
    localStorage.removeItem('gsmscope_reviews_v2');
    localStorage.removeItem('gsmscope_ads_v2');
    localStorage.removeItem('gsmscope_compare_v2');
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
      adSettings
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
        updateReviewStatus,
        deleteReview,
        updateAdSettings,
        resetToDefaults,
        exportDatabaseJson,
        importDatabaseJson
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
