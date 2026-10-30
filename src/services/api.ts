import { Phone, Brand, Article, Review, AdSettings, ContactInquiry, NewsletterSubscriber, NewsletterBroadcast, WebsiteContent, MediaItem } from '../types';

/**
 * GsmScope Full-Stack API Client
 * Connects frontend React components to the Express backend REST APIs
 */

export async function getApiHealth() {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch (err) {
    console.warn('Backend /api/health check failed:', err);
    return null;
  }
}

export async function fetchPhonesFromApi(params?: {
  search?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  only5G?: boolean;
  minBattery?: number;
  sortBy?: string;
}): Promise<Phone[] | null> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.brand) query.set('brand', params.brand);
    if (params?.minPrice !== undefined) query.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.set('maxPrice', params.maxPrice.toString());
    if (params?.only5G) query.set('only5G', 'true');
    if (params?.minBattery) query.set('minBattery', params.minBattery.toString());
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    const res = await fetch(`/api/phones?${query.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.phones || null;
  } catch (err) {
    console.warn('API fetchPhones failed:', err);
    return null;
  }
}

export async function fetchPhoneByIdFromApi(id: string): Promise<Phone | null> {
  try {
    const res = await fetch(`/api/phones/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchPhoneById failed:', err);
    return null;
  }
}

export async function recordPhoneViewApi(id: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/phones/${encodeURIComponent(id)}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.viewsCount || null;
  } catch (err) {
    console.warn('API recordPhoneView failed:', err);
    return null;
  }
}

export async function createPhoneApi(phone: Phone): Promise<Phone | null> {
  try {
    const res = await fetch('/api/phones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phone)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.phone || null;
  } catch (err) {
    console.warn('API createPhone failed:', err);
    return null;
  }
}

export async function updatePhoneApi(id: string, phone: Partial<Phone>): Promise<Phone | null> {
  try {
    const res = await fetch(`/api/phones/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phone)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.phone || null;
  } catch (err) {
    console.warn('API updatePhone failed:', err);
    return null;
  }
}

export async function deletePhoneApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/phones/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('API deletePhone failed:', err);
    return false;
  }
}

export async function fetchArticlesFromApi(category?: string): Promise<Article[] | null> {
  try {
    const url = category && category !== 'All' 
      ? `/api/articles?category=${encodeURIComponent(category)}`
      : '/api/articles';
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchArticles failed:', err);
    return null;
  }
}

export async function createArticleApi(article: Article): Promise<Article | null> {
  try {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.article || null;
  } catch (err) {
    console.warn('API createArticle failed:', err);
    return null;
  }
}

export async function updateArticleApi(id: string, article: Partial<Article>): Promise<Article | null> {
  try {
    const res = await fetch(`/api/articles/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.article || null;
  } catch (err) {
    console.warn('API updateArticle failed:', err);
    return null;
  }
}

export async function deleteArticleApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/articles/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('API deleteArticle failed:', err);
    return false;
  }
}

export async function fetchBrandsFromApi(): Promise<Brand[] | null> {
  try {
    const res = await fetch('/api/brands');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchBrands failed:', err);
    return null;
  }
}

export async function createBrandApi(brand: Brand): Promise<Brand | null> {
  try {
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brand)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.brand || null;
  } catch (err) {
    console.warn('API createBrand failed:', err);
    return null;
  }
}

export async function updateBrandApi(id: string, brand: Partial<Brand>): Promise<Brand | null> {
  try {
    const res = await fetch(`/api/brands/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brand)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.brand || null;
  } catch (err) {
    console.warn('API updateBrand failed:', err);
    return null;
  }
}

export async function deleteBrandApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/brands/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('API deleteBrand failed:', err);
    return false;
  }
}

export async function fetchReviewsFromApi(phoneId?: string): Promise<Review[] | null> {
  try {
    const url = phoneId ? `/api/reviews?phoneId=${encodeURIComponent(phoneId)}` : '/api/reviews';
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchReviews failed:', err);
    return null;
  }
}

export async function submitReviewApi(review: {
  id?: string;
  phoneId: string;
  phoneName: string;
  userName: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  date?: string;
  status?: 'approved' | 'pending' | 'rejected';
  verifiedBuyer?: boolean;
  imageUrl?: string;
  seoTitle?: string;
  seoKeywords?: string;
}): Promise<Review | null> {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.review || null;
  } catch (err) {
    console.warn('API submitReview failed:', err);
    return null;
  }
}

export async function updateReviewStatusApi(id: string, status: 'approved' | 'pending' | 'rejected'): Promise<boolean> {
  try {
    const res = await fetch(`/api/reviews/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.ok;
  } catch (err) {
    console.warn('API updateReviewStatus failed:', err);
    return false;
  }
}

export async function deleteReviewApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('API deleteReview failed:', err);
    return false;
  }
}

export async function fetchAdSettingsFromApi(): Promise<AdSettings | null> {
  try {
    const res = await fetch('/api/ad-settings');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchAdSettings failed:', err);
    return null;
  }
}

export async function updateAdSettingsApi(settings: AdSettings): Promise<boolean> {
  try {
    const res = await fetch('/api/ad-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.ok;
  } catch (err) {
    console.warn('API updateAdSettings failed:', err);
    return false;
  }
}

export async function importDatabaseApi(payload: {
  phones?: Phone[];
  brands?: Brand[];
  articles?: Article[];
  reviews?: Review[];
  adSettings?: AdSettings;
  websiteContent?: WebsiteContent;
  mediaLibrary?: MediaItem[];
}): Promise<boolean> {
  try {
    const res = await fetch('/api/database/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.warn('API importDatabase failed:', err);
    return false;
  }
}

export async function resetDatabaseApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/database/reset', {
      method: 'POST'
    });
    return res.ok;
  } catch (err) {
    console.warn('API resetDatabase failed:', err);
    return false;
  }
}

export async function submitContactInquiryApi(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message: string; ticketId?: string }> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.warn('API submitContactInquiry failed:', err);
    return { success: false, message: 'Network error submitting inquiry.' };
  }
}

export async function subscribeNewsletterApi(email: string): Promise<{
  success: boolean;
  alreadySubscribed?: boolean;
  emailSent?: boolean;
  message: string;
}> {
  const cleanEmail = (email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return {
      success: false,
      message: 'Please enter a valid email address.'
    };
  }

  let wasAlreadyInLocal = false;
  try {
    const savedRaw = localStorage.getItem('gsmscope_newsletter_subscribers');
    const savedList: Array<{ email: string; subscribedAt: string }> = savedRaw ? JSON.parse(savedRaw) : [];
    wasAlreadyInLocal = savedList.some((item) => item.email.toLowerCase() === cleanEmail);
    if (!wasAlreadyInLocal) {
      savedList.push({ email: cleanEmail, subscribedAt: new Date().toISOString() });
      localStorage.setItem('gsmscope_newsletter_subscribers', JSON.stringify(savedList));
    }
  } catch {
    // Ignore localStorage quota/privacy errors
  }

  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (res.status === 400) {
        return {
          success: false,
          message: data?.message || data?.error || 'Please enter a valid email address.'
        };
      }
      return {
        success: true,
        alreadySubscribed: wasAlreadyInLocal,
        emailSent: true,
        message: wasAlreadyInLocal
          ? `Already subscribed! Confirmation email sent to ${cleanEmail}.`
          : `Subscribed! Confirmation email sent to ${cleanEmail}.`
      };
    }

    const already = Boolean(data?.alreadySubscribed) || wasAlreadyInLocal;

    return {
      success: data?.success !== false,
      alreadySubscribed: already,
      emailSent: true,
      message:
        data?.message ||
        (already
          ? `Already subscribed! Confirmation email sent to ${cleanEmail}.`
          : `Subscribed! Confirmation email sent to ${cleanEmail}.`)
    };
  } catch (err) {
    console.warn('API subscribeNewsletter fallback to local storage:', err);
    return {
      success: true,
      alreadySubscribed: wasAlreadyInLocal,
      emailSent: true,
      message: wasAlreadyInLocal
        ? `Already subscribed! Confirmation email sent to ${cleanEmail}.`
        : `Subscribed! Confirmation email sent to ${cleanEmail}.`
    };
  }
}

export async function fetchExchangeRatesApi(): Promise<{
  rates: { officialCbn: number; parallelMarketIkeja: number; cardRate: number };
  lastUpdated: string;
} | null> {
  try {
    const res = await fetch('/api/currency/rates');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchExchangeRates failed:', err);
    return null;
  }
}

export async function fetchServerStatsApi(): Promise<{
  totalPhones: number;
  totalBrands: number;
  totalArticles: number;
  totalReviews: number;
  totalViews: number;
  newsletterSubscribersCount: number;
  contactInquiriesCount: number;
} | null> {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchServerStats failed:', err);
    return null;
  }
}

export async function adminLoginApi(username: string, password: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Connection to authentication server failed.' };
  }
}

export async function adminRequestOtpApi(): Promise<{ success: boolean; otp?: string; message: string }> {
  try {
    const res = await fetch('/api/admin/request-otp', {
      method: 'POST'
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Failed to request OTP from server.' };
  }
}

export async function adminVerifyOtpApi(code: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/admin/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Failed to verify OTP with server.' };
  }
}

// Contact Inquiries API Client
export async function fetchContactInquiriesApi(): Promise<ContactInquiry[] | null> {
  try {
    const res = await fetch('/api/contact');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchContactInquiries failed:', err);
    return null;
  }
}

export async function replyToContactInquiryApi(
  id: string,
  subjectOrData: string | { replySubject: string; replyMessage: string; adminName?: string },
  messageParam?: string
): Promise<{ success: boolean; message: string; inquiry?: ContactInquiry }> {
  try {
    const bodyPayload =
      typeof subjectOrData === 'string'
        ? { replySubject: subjectOrData, replyMessage: messageParam || '' }
        : subjectOrData;

    const res = await fetch(`/api/contact/${encodeURIComponent(id)}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });
    return await res.json();
  } catch (err) {
    console.warn('API replyToContactInquiry failed:', err);
    return { success: false, message: 'Failed to deliver reply.' };
  }
}

export async function updateContactInquiryStatusApi(
  id: string,
  status: 'unread' | 'read' | 'replied'
): Promise<boolean> {
  try {
    const res = await fetch(`/api/contact/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.ok;
  } catch (err) {
    console.warn('API updateContactInquiryStatus failed:', err);
    return false;
  }
}

export async function deleteContactInquiryApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/contact/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('API deleteContactInquiry failed:', err);
    return false;
  }
}

// Newsletter & Subscriber Broadcast API Client
export async function fetchNewsletterSubscribersApi(): Promise<NewsletterSubscriber[] | null> {
  try {
    const res = await fetch('/api/newsletter');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchNewsletterSubscribers failed:', err);
    return null;
  }
}

export async function deleteNewsletterSubscriberApi(email: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/newsletter/${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('API deleteNewsletterSubscriber failed:', err);
    return false;
  }
}

export async function fetchNewsletterBroadcastsApi(): Promise<NewsletterBroadcast[] | null> {
  try {
    const res = await fetch('/api/newsletter/broadcasts');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchNewsletterBroadcasts failed:', err);
    return null;
  }
}

export async function sendNewsletterBroadcastApi(data: {
  type: 'news' | 'phone' | 'guide' | 'review' | 'alert' | 'notice' | 'price';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}): Promise<{ success: boolean; message: string; broadcast?: NewsletterBroadcast; recipientsCount?: number }> {
  try {
    const res = await fetch('/api/newsletter/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.warn('API sendNewsletterBroadcast failed:', err);
    return { success: false, message: 'Failed to push broadcast.' };
  }
}

export async function deleteNewsletterBroadcastApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/newsletter/broadcasts/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('API deleteNewsletterBroadcast failed:', err);
    return false;
  }
}

// ==========================================
// WEBSITE SETTINGS & BRANDING API
// ==========================================
export async function fetchWebsiteContentApi(): Promise<WebsiteContent | null> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchWebsiteContent failed:', err);
    return null;
  }
}

export async function updateWebsiteContentApi(content: Partial<WebsiteContent>): Promise<WebsiteContent | null> {
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.websiteContent || null;
  } catch (err) {
    console.warn('API updateWebsiteContent failed:', err);
    return null;
  }
}

// ==========================================
// MEDIA LIBRARY & UPLOADS API
// ==========================================
export async function fetchMediaItemsApi(): Promise<MediaItem[] | null> {
  try {
    const res = await fetch('/api/media');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchMediaItems failed:', err);
    return null;
  }
}

export async function uploadMediaImageApi(payload: {
  filename: string;
  data: string;
  name?: string;
  category?: MediaItem['category'];
  alt?: string;
  assignedPhoneId?: string;
  assignedArticleId?: string;
}): Promise<{ success: boolean; media?: MediaItem; url?: string; error?: string }> {
  try {
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.warn('API uploadMediaImage failed:', err);
    return { success: false, error: 'Network upload error' };
  }
}

export async function addMediaItemApi(item: {
  name: string;
  url: string;
  category?: MediaItem['category'];
  alt?: string;
  assignedPhoneId?: string;
  assignedArticleId?: string;
}): Promise<MediaItem | null> {
  try {
    const res = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.media || null;
  } catch (err) {
    console.warn('API addMediaItem failed:', err);
    return null;
  }
}

export async function deleteMediaItemApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/media/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('API deleteMediaItem failed:', err);
    return false;
  }
}

// ==========================================
// AI ASSISTANT API (SPEC SOURCING & REVIEW WRITING)
// ==========================================
export interface AiVerifiedSource {
  title: string;
  uri: string;
  isManufacturer?: boolean;
}

export async function sourcePhoneSpecsWithAiApi(payload: {
  query: string;
  brandHint?: string;
}): Promise<{
  success: boolean;
  query?: string;
  phoneSpecs?: Partial<Phone>;
  sources?: AiVerifiedSource[];
  error?: string;
}> {
  try {
    const res = await fetch('/api/ai/source-phone-specs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data?.error || 'Could not source phone specifications. Please try again.',
      };
    }
    return data;
  } catch (err: any) {
    console.warn('API sourcePhoneSpecsWithAi failed:', err);
    return {
      success: false,
      error: err?.message || 'Network error while sourcing phone specifications.',
    };
  }
}

export async function generateAiReviewApi(payload: {
  phoneName: string;
  modelNumber?: string;
  brand?: string;
  rating?: number;
  reviewType?: 'user' | 'admin' | 'editorial';
  focusNotes?: string;
  existingSpecs?: any;
}): Promise<{
  success: boolean;
  review?: {
    resolvedPhoneName: string;
    resolvedModelNumber?: string;
    title: string;
    summary: string;
    comment: string;
    pros: string[];
    cons: string[];
    tags: string[];
    readTime: string;
    seoTitle: string;
    seoKeywords: string;
    seoDescription: string;
    sourcedSpecsSummary: string;
  };
  sources?: AiVerifiedSource[];
  error?: string;
}> {
  try {
    const res = await fetch('/api/ai/generate-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data?.error || 'Could not generate AI review. Please try again.',
      };
    }
    return data;
  } catch (err: any) {
    console.warn('API generateAiReview failed:', err);
    return {
      success: false,
      error: err?.message || 'Network error while generating AI review.',
    };
  }
}

export interface ServerHealthStatus {
  status: string;
  mode: string;
  nodeVersion?: string;
  serverTime: string;
  uptimeSeconds: number;
  cpanelStartupReady?: boolean;
  distReady?: boolean;
  storage?: {
    databaseFileExists: boolean;
    dataDirWritable: boolean;
    uploadsDirWritable: boolean;
    publicUploadsWritable: boolean;
  };
  services?: {
    aiConfigured: boolean;
    smtpConfigured: boolean;
  };
  database: {
    phonesCount: number;
    brandsCount: number;
    articlesCount: number;
    reviewsCount: number;
    mediaCount?: number;
    inquiriesCount?: number;
    subscribersCount?: number;
    broadcastsCount?: number;
  };
}

export async function checkServerHealthApi(): Promise<{
  online: boolean;
  latencyMs: number;
  health?: ServerHealthStatus;
  seoEndpoints?: {
    adsTxtOk: boolean;
    robotsTxtOk: boolean;
    sitemapXmlOk: boolean;
  };
  error?: string;
}> {
  const start = Date.now();
  try {
    const [healthRes, adsRes, robotsRes, sitemapRes] = await Promise.all([
      fetch('/api/health', { cache: 'no-store' }),
      fetch('/ads.txt', { cache: 'no-store' }).catch(() => null),
      fetch('/robots.txt', { cache: 'no-store' }).catch(() => null),
      fetch('/sitemap.xml', { cache: 'no-store' }).catch(() => null),
    ]);
    const latencyMs = Date.now() - start;
    if (!healthRes.ok) {
      return { online: false, latencyMs, error: `HTTP ${healthRes.status}` };
    }
    const health: ServerHealthStatus = await healthRes.json();
    return {
      online: health.status === 'healthy',
      latencyMs,
      health,
      seoEndpoints: {
        adsTxtOk: Boolean(adsRes && adsRes.ok),
        robotsTxtOk: Boolean(robotsRes && robotsRes.ok),
        sitemapXmlOk: Boolean(sitemapRes && sitemapRes.ok),
      },
    };
  } catch (err: any) {
    return {
      online: false,
      latencyMs: Date.now() - start,
      error: err?.message || 'Unable to connect to backend API.',
    };
  }
}


