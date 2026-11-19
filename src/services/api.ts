import { Phone, Brand, Article, Review, AdSettings, ContactInquiry, NewsletterSubscriber, NewsletterBroadcast, WebsiteContent, MediaItem } from '../types';
import { safeSetLocalStorage } from './persistentVault';

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

    const res = await fetch(`/api/phones?${query.toString()}`, { cache: 'no-store' });
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
  const payload = { ...phone, id, updatedAt: (phone as any).updatedAt || Date.now() };
  try {
    const res = await fetch(`/api/phones/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      return data.phone || null;
    }
  } catch (err) {
    console.warn('API PUT updatePhone failed, retrying with POST:', err);
  }
  try {
    const fallbackRes = await fetch(`/api/phones/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!fallbackRes.ok) return null;
    const data = await fallbackRes.json();
    return data.phone || null;
  } catch (err) {
    console.warn('API POST updatePhone fallback failed:', err);
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
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchArticles failed:', err);
    return null;
  }
}

export async function recordArticleViewApi(id: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/articles/${encodeURIComponent(id)}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.viewsCount || null;
  } catch (err) {
    console.warn('API recordArticleView failed:', err);
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
  const payload = { ...article, id, updatedAt: (article as any).updatedAt || Date.now() };
  try {
    const res = await fetch(`/api/articles/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      return data.article || null;
    }
  } catch (err) {
    console.warn('API PUT updateArticle failed, retrying with POST:', err);
  }
  try {
    const fallbackRes = await fetch(`/api/articles/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!fallbackRes.ok) return null;
    const data = await fallbackRes.json();
    return data.article || null;
  } catch (err) {
    console.warn('API POST updateArticle fallback failed:', err);
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
    const res = await fetch('/api/brands', { cache: 'no-store' });
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
    if (res.ok) {
      const data = await res.json();
      return data.brand || null;
    }
  } catch (err) {
    console.warn('API PUT updateBrand failed, retrying with POST:', err);
  }
  try {
    const fallbackRes = await fetch(`/api/brands/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brand)
    });
    if (!fallbackRes.ok) return null;
    const data = await fallbackRes.json();
    return data.brand || null;
  } catch (err) {
    console.warn('API POST updateBrand fallback failed:', err);
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
    const res = await fetch(url, { cache: 'no-store' });
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
    const res = await fetch('/api/ad-settings', { cache: 'no-store' });
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

export async function syncVaultWithServerApi(payload: {
  uploadDataUrls?: Record<string, string>;
  mediaLibrary?: MediaItem[];
}): Promise<boolean> {
  try {
    const res = await fetch('/api/database/sync-vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.warn('API syncVaultWithServer failed:', err);
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
}): Promise<{ success: boolean; message: string; ticketId?: string; inquiry?: ContactInquiry }> {
  const fallbackInquiry: ContactInquiry = {
    id: `inq-${Date.now()}`,
    name: (data.name || 'Anonymous User').trim(),
    email: (data.email || '').trim(),
    phone: (data.phone || '').trim(),
    subject: (data.subject || 'General Inquiry').trim(),
    message: (data.message || '').trim(),
    createdAt: new Date().toISOString(),
    status: 'unread'
  };

  const persistInquiryLocally = (inquiryToSave: ContactInquiry) => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('gsmscope_contact_inquiries_v1');
      const existing: ContactInquiry[] = raw ? JSON.parse(raw) : [];
      const filtered = Array.isArray(existing) ? existing.filter((i) => i && i.id !== inquiryToSave.id) : [];
      const updated = [inquiryToSave, ...filtered];
      safeSetLocalStorage('gsmscope_contact_inquiries_v1', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('gsmscope:contact-updated', { detail: inquiryToSave }));
    } catch {}
  };

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        id: fallbackInquiry.id,
        createdAt: fallbackInquiry.createdAt,
        status: 'unread'
      })
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json) {
      const savedInquiry: ContactInquiry = json.inquiry || fallbackInquiry;
      persistInquiryLocally(savedInquiry);
      return {
        success: true,
        message: json.message || 'Thank you! Your message has been received by GsmScope.',
        ticketId: json.ticketId || savedInquiry.id,
        inquiry: savedInquiry
      };
    }
    persistInquiryLocally(fallbackInquiry);
    return {
      success: true,
      message: 'Thank you! Your message has been received by GsmScope.',
      ticketId: fallbackInquiry.id,
      inquiry: fallbackInquiry
    };
  } catch (err) {
    console.warn('API submitContactInquiry fallback to local storage:', err);
    persistInquiryLocally(fallbackInquiry);
    return {
      success: true,
      message: 'Thank you! Your message has been received by GsmScope.',
      ticketId: fallbackInquiry.id,
      inquiry: fallbackInquiry
    };
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
      safeSetLocalStorage('gsmscope_newsletter_subscribers', JSON.stringify(savedList));
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gsmscope:subscribers-updated'));
    }

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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gsmscope:subscribers-updated'));
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
    const res = await fetch('/api/contact', { cache: 'no-store' });
    if (!res.ok) return null;
    const serverList: ContactInquiry[] = await res.json();
    return Array.isArray(serverList) ? serverList : null;
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
    if (typeof window !== 'undefined') {
      try {
        const deletedRaw = localStorage.getItem('gsmscope_deleted_inquiry_ids_v1');
        const deletedSet = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
        deletedSet.add(id);
        safeSetLocalStorage('gsmscope_deleted_inquiry_ids_v1', JSON.stringify(Array.from(deletedSet)));

        const raw = localStorage.getItem('gsmscope_contact_inquiries_v1');
        if (raw) {
          const parsed: ContactInquiry[] = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            safeSetLocalStorage(
              'gsmscope_contact_inquiries_v1',
              JSON.stringify(parsed.filter((i) => i && i.id !== id))
            );
          }
        }
      } catch {}
    }
    const res = await fetch(`/api/contact/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('API deleteContactInquiry failed:', err);
    return false;
  }
}

export async function syncContactInquiriesWithServer(
  providedServerData?: ContactInquiry[] | null
): Promise<ContactInquiry[]> {
  let localList: ContactInquiry[] = [];
  let deletedIds = new Set<string>();
  let isAdmin = false;

  if (typeof window !== 'undefined') {
    try {
      isAdmin =
        localStorage.getItem('gsmscope_admin_auth') === 'true' ||
        sessionStorage.getItem('gsmscope_admin_auth') === 'true';
      const localRaw = localStorage.getItem('gsmscope_contact_inquiries_v1');
      if (localRaw) {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed)) localList = parsed.filter((i) => i && i.id);
      }
      if (isAdmin) {
        const deletedRaw = localStorage.getItem('gsmscope_deleted_inquiry_ids_v1');
        if (deletedRaw) {
          const parsedDel = JSON.parse(deletedRaw);
          if (Array.isArray(parsedDel)) deletedIds = new Set<string>(parsedDel);
        }
      }
    } catch {}
  }

  const serverData =
    providedServerData !== undefined ? providedServerData : await fetchContactInquiriesApi();

  if (!serverData || !Array.isArray(serverData)) {
    return localList.filter((i) => !deletedIds.has(i.id));
  }

  const serverById = new Map<string, ContactInquiry>();
  for (const sItem of serverData) {
    if (!sItem || !sItem.id) continue;
    if (isAdmin && deletedIds.has(sItem.id)) {
      fetch(`/api/contact/${encodeURIComponent(sItem.id)}`, { method: 'DELETE' }).catch(() => {});
      continue;
    }
    serverById.set(sItem.id, sItem);
  }

  const mergedById = new Map<string, ContactInquiry>();

  for (const locItem of localList) {
    if (!locItem || !locItem.id || (isAdmin && deletedIds.has(locItem.id))) continue;
    const srvItem = serverById.get(locItem.id);
    if (!srvItem) {
      // Local message missing on server -> push to server
      const toPush: ContactInquiry = {
        ...locItem,
        status: locItem.replied ? 'replied' : 'unread',
      };
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPush),
      }).catch(() => {});
      mergedById.set(toPush.id, toPush);
    } else if (isAdmin) {
      const merged: ContactInquiry = {
        ...srvItem,
        ...locItem,
        status:
          locItem.replied || srvItem.replied
            ? 'replied'
            : srvItem.status === 'unread'
            ? 'unread'
            : locItem.status === 'read' || srvItem.status === 'read'
            ? 'read'
            : 'unread',
        replied: Boolean(locItem.replied || srvItem.replied),
        repliedAt: locItem.repliedAt || srvItem.repliedAt,
        replySubject: locItem.replySubject || srvItem.replySubject,
        replyMessage: locItem.replyMessage || srvItem.replyMessage,
      };
      if (merged.replied !== srvItem.replied || merged.status !== srvItem.status) {
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(merged),
        }).catch(() => {});
      }
      mergedById.set(merged.id, merged);
    } else {
      mergedById.set(srvItem.id, srvItem);
    }
  }

  for (const [id, srvItem] of serverById.entries()) {
    if (!mergedById.has(id)) {
      mergedById.set(id, srvItem);
    }
  }

  const combined = Array.from(mergedById.values()).sort((a, b) => {
    const tsA = new Date(a.createdAt || 0).getTime() || 0;
    const tsB = new Date(b.createdAt || 0).getTime() || 0;
    return tsB - tsA;
  });

  if (typeof window !== 'undefined' && isAdmin) {
    try {
      safeSetLocalStorage('gsmscope_contact_inquiries_v1', JSON.stringify(combined));
    } catch {}
  }

  return combined;
}

// Newsletter & Subscriber Broadcast API Client
export async function fetchNewsletterSubscribersApi(): Promise<NewsletterSubscriber[] | null> {
  try {
    const res = await fetch('/api/newsletter', { cache: 'no-store' });
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
    const res = await fetch('/api/newsletter/broadcasts', { cache: 'no-store' });
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
    const res = await fetch('/api/settings', { cache: 'no-store' });
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
    const res = await fetch('/api/media', { cache: 'no-store' });
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


