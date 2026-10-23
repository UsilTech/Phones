import { Phone, Brand, Article, Review } from '../types';

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
  phoneId: string;
  phoneName: string;
  userName: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
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

export async function subscribeNewsletterApi(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await res.json();
  } catch (err) {
    console.warn('API subscribeNewsletter failed:', err);
    return { success: false, message: 'Network error subscribing to alerts.' };
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
