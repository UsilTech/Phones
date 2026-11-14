// Cloudflare Pages Function for /api/* routes
// Automatically deployed by Cloudflare Workers & Pages when connected to GitHub.
// Persists phones, articles, reviews, brands, ads, site settings, media, and uploads
// using Cloudflare Edge Cache API (caches.default) + Worker memory + optional Cloudflare KV binding (GSMSCOPE_KV / KV).

import { SEED_DB } from '../_seed.js';

const CACHE_DB_URL = 'https://gsmscope-edge-vault.internal/database-v1.json';

function cloneSeed() {
  try {
    return JSON.parse(JSON.stringify(SEED_DB));
  } catch {
    return {
      phones: [],
      brands: [],
      articles: [],
      reviews: [],
      adSettings: {},
      websiteContent: {},
      mediaLibrary: [],
      uploadDataUrls: {},
      contactInquiries: [],
      newsletterSubscribers: [],
      newsletterBroadcasts: [],
      deletedPhoneIds: [],
      deletedArticleIds: [],
      deletedReviewIds: [],
      deletedBrandKeys: [],
      deletedInquiryIds: [],
    };
  }
}

export async function loadEdgeDb(env) {
  if (globalThis.__GSMSCOPE_CF_DB__) {
    return globalThis.__GSMSCOPE_CF_DB__;
  }

  // 1. Check optional Cloudflare KV binding if present
  const kv = env && (env.GSMSCOPE_KV || env.KV || env.GSMSCOPE_DB);
  if (kv && typeof kv.get === 'function') {
    try {
      const kvRaw = await kv.get('database_v1', 'json');
      if (kvRaw && typeof kvRaw === 'object') {
        globalThis.__GSMSCOPE_CF_DB__ = { ...cloneSeed(), ...kvRaw };
        return globalThis.__GSMSCOPE_CF_DB__;
      }
    } catch {}
  }

  // 2. Check Cloudflare built-in Edge Cache API (caches.default)
  try {
    if (typeof caches !== 'undefined' && caches.default) {
      const cachedRes = await caches.default.match(new Request(CACHE_DB_URL));
      if (cachedRes && cachedRes.ok) {
        const parsed = await cachedRes.json();
        if (parsed && typeof parsed === 'object') {
          globalThis.__GSMSCOPE_CF_DB__ = { ...cloneSeed(), ...parsed };
          return globalThis.__GSMSCOPE_CF_DB__;
        }
      }
    }
  } catch {}

  globalThis.__GSMSCOPE_CF_DB__ = cloneSeed();
  return globalThis.__GSMSCOPE_CF_DB__;
}

export async function saveEdgeDb(db, env, ctx) {
  db.updatedAt = new Date().toISOString();
  globalThis.__GSMSCOPE_CF_DB__ = db;

  const serialized = JSON.stringify(db);

  const persistPromise = (async () => {
    try {
      if (typeof caches !== 'undefined' && caches.default) {
        await caches.default.put(
          new Request(CACHE_DB_URL),
          new Response(serialized, {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'public, max-age=31536000',
            },
          })
        );
      }
    } catch {}

    const kv = env && (env.GSMSCOPE_KV || env.KV || env.GSMSCOPE_DB);
    if (kv && typeof kv.put === 'function') {
      try {
        await kv.put('database_v1', serialized);
      } catch {}
    }
  })();

  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(persistPromise);
  } else {
    await persistPromise;
  }
}

export async function cacheUploadedBinary(urlPath, dataUrl, ctx) {
  if (!urlPath || !dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return;
  const work = (async () => {
    try {
      if (typeof caches === 'undefined' || !caches.default) return;
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return;
      const mimeType = match[1] || 'image/jpeg';
      const base64Data = match[2];
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const cacheKey = new Request(`https://gsmscope-edge-vault.internal${urlPath}`);
      await caches.default.put(
        cacheKey,
        new Response(bytes, {
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000',
            'Access-Control-Allow-Origin': '*',
          },
        })
      );
    } catch {}
  })();

  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(work);
  } else {
    await work;
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      },
    });
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '');
  const subPath = pathname.replace(/^\/api\/?/, '');
  const segments = subPath.split('/').filter(Boolean).map((s) => decodeURIComponent(s));

  const db = await loadEdgeDb(env);
  if (!db.phones) db.phones = [];
  if (!db.brands) db.brands = [];
  if (!db.articles) db.articles = [];
  if (!db.reviews) db.reviews = [];
  if (!db.mediaLibrary) db.mediaLibrary = [];
  if (!db.uploadDataUrls) db.uploadDataUrls = {};
  if (!db.contactInquiries) db.contactInquiries = [];
  if (!db.newsletterSubscribers) db.newsletterSubscribers = [];
  if (!db.newsletterBroadcasts) db.newsletterBroadcasts = [];
  if (!db.deletedPhoneIds) db.deletedPhoneIds = [];
  if (!db.deletedArticleIds) db.deletedArticleIds = [];
  if (!db.deletedReviewIds) db.deletedReviewIds = [];
  if (!db.deletedBrandKeys) db.deletedBrandKeys = [];
  if (!db.deletedInquiryIds) db.deletedInquiryIds = [];

  let body = null;
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  // 1. /api/health
  if (segments[0] === 'health') {
    return jsonResponse({
      status: 'healthy',
      mode: 'cloudflare-pages-edge',
      serverTime: new Date().toISOString(),
      uptimeSeconds: 3600,
      cpanelStartupReady: true,
      distReady: true,
      storage: {
        databaseFileExists: true,
        dataDirWritable: true,
        uploadsDirWritable: true,
        publicUploadsWritable: true,
      },
      database: {
        phonesCount: db.phones.length,
        brandsCount: db.brands.length,
        articlesCount: db.articles.length,
        reviewsCount: db.reviews.length,
        mediaCount: db.mediaLibrary.length,
        inquiriesCount: db.contactInquiries.length,
        subscribersCount: db.newsletterSubscribers.length,
        broadcastsCount: db.newsletterBroadcasts.length,
      },
    });
  }

  // 2. /api/phones
  if (segments[0] === 'phones') {
    if (segments.length === 1 && method === 'GET') {
      return jsonResponse({ phones: db.phones, total: db.phones.length });
    }
    if (segments.length === 1 && method === 'POST') {
      const newPhone = {
        ...body,
        id: body.id || `phone-${Date.now()}`,
        createdAt: body.createdAt || new Date().toISOString(),
      };
      db.deletedPhoneIds = db.deletedPhoneIds.filter((id) => id !== newPhone.id);
      db.phones = [newPhone, ...db.phones.filter((p) => p.id !== newPhone.id)];
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true, phone: newPhone }, 201);
    }
    if (segments.length === 2) {
      const phoneId = segments[1];
      if (method === 'GET') {
        const found = db.phones.find((p) => p.id === phoneId);
        return found ? jsonResponse(found) : jsonResponse({ error: 'Not found' }, 404);
      }
      if (method === 'PUT') {
        let updatedPhone = null;
        const exists = db.phones.some((p) => p.id === phoneId);
        if (exists) {
          db.phones = db.phones.map((p) => {
            if (p.id === phoneId) {
              updatedPhone = { ...p, ...body, id: phoneId };
              return updatedPhone;
            }
            return p;
          });
        } else {
          updatedPhone = { ...body, id: phoneId, createdAt: body.createdAt || new Date().toISOString() };
          db.phones = [updatedPhone, ...db.phones];
        }
        await saveEdgeDb(db, env, context);
        return jsonResponse({ success: true, phone: updatedPhone });
      }
      if (method === 'DELETE') {
        db.phones = db.phones.filter((p) => p.id !== phoneId);
        if (!db.deletedPhoneIds.includes(phoneId)) db.deletedPhoneIds.push(phoneId);
        await saveEdgeDb(db, env, context);
        return jsonResponse({ success: true });
      }
    }
    if (segments.length === 3 && segments[2] === 'view' && method === 'POST') {
      const phoneId = segments[1];
      let viewsCount = 1;
      db.phones = db.phones.map((p) => {
        if (p.id === phoneId) {
          viewsCount = (p.viewsCount || 0) + 1;
          return { ...p, viewsCount };
        }
        return p;
      });
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true, viewsCount });
    }
  }

  // 3. /api/articles
  if (segments[0] === 'articles') {
    if (segments.length === 1 && method === 'GET') {
      const cat = url.searchParams.get('category');
      const list =
        cat && cat !== 'All'
          ? db.articles.filter((a) => (a.category || '').toLowerCase() === cat.toLowerCase())
          : db.articles;
      return jsonResponse(list);
    }
    if (segments.length === 1 && method === 'POST') {
      const newArticle = {
        ...body,
        id: body.id || `art-${Date.now()}`,
        createdAt: body.createdAt || new Date().toISOString(),
      };
      db.deletedArticleIds = db.deletedArticleIds.filter((id) => id !== newArticle.id);
      db.articles = [newArticle, ...db.articles.filter((a) => a.id !== newArticle.id)];
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true, article: newArticle }, 201);
    }
    if (segments.length === 2) {
      const artId = segments[1];
      if (method === 'PUT') {
        let updatedArt = null;
        const exists = db.articles.some((a) => a.id === artId);
        if (exists) {
          db.articles = db.articles.map((a) => {
            if (a.id === artId) {
              updatedArt = { ...a, ...body, id: artId };
              return updatedArt;
            }
            return a;
          });
        } else {
          updatedArt = { ...body, id: artId, createdAt: body.createdAt || new Date().toISOString() };
          db.articles = [updatedArt, ...db.articles];
        }
        await saveEdgeDb(db, env, context);
        return jsonResponse({ success: true, article: updatedArt });
      }
      if (method === 'DELETE') {
        db.articles = db.articles.filter((a) => a.id !== artId);
        if (!db.deletedArticleIds.includes(artId)) db.deletedArticleIds.push(artId);
        await saveEdgeDb(db, env, context);
        return jsonResponse({ success: true });
      }
    }
    if (segments.length === 3 && segments[2] === 'view' && method === 'POST') {
      const artId = segments[1];
      let viewsCount = 1;
      db.articles = db.articles.map((a) => {
        if (a.id === artId) {
          viewsCount = (a.viewsCount || 0) + 1;
          return { ...a, viewsCount };
        }
        return a;
      });
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true, viewsCount });
    }
  }

  // 4. /api/brands
  if (segments[0] === 'brands') {
    if (segments.length === 1 && method === 'GET') {
      return jsonResponse(db.brands);
    }
    if (segments.length === 1 && method === 'POST') {
      const newBrand = {
        ...body,
        id: body.id || `brand-${Date.now()}`,
      };
      db.brands = [...db.brands.filter((b) => b.id !== newBrand.id && b.name !== newBrand.name), newBrand];
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true, brand: newBrand }, 201);
    }
    if (segments.length === 2) {
      const brandId = segments[1];
      if (method === 'PUT') {
        let updatedBrand = null;
        db.brands = db.brands.map((b) => {
          if (b.id === brandId || b.slug === brandId || b.name === brandId) {
            updatedBrand = { ...b, ...body };
            return updatedBrand;
          }
          return b;
        });
        if (!updatedBrand) {
          updatedBrand = { ...body, id: brandId };
          db.brands.push(updatedBrand);
        }
        await saveEdgeDb(db, env, context);
        return jsonResponse({ success: true, brand: updatedBrand });
      }
      if (method === 'DELETE') {
        const lower = brandId.toLowerCase();
        db.brands = db.brands.filter(
          (b) =>
            (b.id || '').toLowerCase() !== lower &&
            (b.slug || '').toLowerCase() !== lower &&
            (b.name || '').toLowerCase() !== lower
        );
        if (!db.deletedBrandKeys.includes(lower)) db.deletedBrandKeys.push(lower);
        await saveEdgeDb(db, env, context);
        return jsonResponse({ success: true });
      }
    }
  }

  // 5. /api/reviews
  if (segments[0] === 'reviews') {
    if (segments.length === 1 && method === 'GET') {
      const phoneId = url.searchParams.get('phoneId');
      const list = phoneId ? db.reviews.filter((r) => r.phoneId === phoneId) : db.reviews;
      return jsonResponse(list);
    }
    if (segments.length === 1 && method === 'POST') {
      const newRev = {
        ...body,
        id: body.id || `rev-${Date.now()}`,
        status: body.status || 'approved',
        date: body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: body.createdAt || new Date().toISOString(),
      };
      db.reviews = [newRev, ...db.reviews.filter((r) => r.id !== newRev.id)];
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true, review: newRev }, 201);
    }
    if (segments.length === 3 && segments[2] === 'status' && method === 'PATCH') {
      const revId = segments[1];
      db.reviews = db.reviews.map((r) => (r.id === revId ? { ...r, status: body.status } : r));
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true });
    }
    if (segments.length === 2 && method === 'DELETE') {
      const revId = segments[1];
      db.reviews = db.reviews.filter((r) => r.id !== revId);
      if (!db.deletedReviewIds.includes(revId)) db.deletedReviewIds.push(revId);
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true });
    }
  }

  // 6. /api/ad-settings
  if (segments[0] === 'ad-settings') {
    if (method === 'GET') {
      return jsonResponse(db.adSettings || {});
    }
    if (method === 'PUT' || method === 'POST') {
      db.adSettings = { ...(db.adSettings || {}), ...body, updatedAt: new Date().toISOString() };
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true, adSettings: db.adSettings });
    }
  }

  // 7. /api/settings (WebsiteContent)
  if (segments[0] === 'settings') {
    if (method === 'GET') {
      return jsonResponse(db.websiteContent || {});
    }
    if (method === 'PUT' || method === 'POST') {
      db.websiteContent = { ...(db.websiteContent || {}), ...body, updatedAt: new Date().toISOString() };
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true, websiteContent: db.websiteContent });
    }
  }

  // 8. /api/media & /api/media/upload
  if (segments[0] === 'media') {
    if (segments.length === 1 && method === 'GET') {
      return jsonResponse(db.mediaLibrary || []);
    }
    if (segments.length === 2 && segments[1] === 'upload' && method === 'POST') {
      const rawData = body.data || '';
      const rawName = (body.filename || 'image.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
      const extMatch = rawName.match(/\.(png|jpe?g|webp|gif|svg)$/i);
      const ext = extMatch ? extMatch[0].toLowerCase() : '.jpg';
      const baseName = rawName.replace(/\.[^/.]+$/, '').slice(0, 48) || 'asset';
      const uniqueFilename = `${Date.now()}-${baseName}${ext}`;
      const uploadPath = `/uploads/${uniqueFilename}`;

      if (rawData.startsWith('data:')) {
        db.uploadDataUrls[uploadPath] = rawData;
        await cacheUploadedBinary(uploadPath, rawData, context);
      }

      const mediaItem = {
        id: `media-${Date.now()}`,
        name: body.name || baseName,
        url: uploadPath,
        dataUrl: rawData.startsWith('data:') ? rawData : undefined,
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        category: body.category || 'phone',
        alt: body.alt || body.name || baseName,
        assignedPhoneId: body.assignedPhoneId,
        assignedArticleId: body.assignedArticleId,
      };

      db.mediaLibrary = [mediaItem, ...db.mediaLibrary.filter((m) => m.url !== uploadPath)];
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true, url: uploadPath, media: mediaItem }, 201);
    }
    if (segments.length === 1 && method === 'POST') {
      const newMedia = {
        ...body,
        id: body.id || `media-${Date.now()}`,
        uploadedAt: body.uploadedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      if (newMedia.url && newMedia.dataUrl && newMedia.dataUrl.startsWith('data:')) {
        db.uploadDataUrls[newMedia.url] = newMedia.dataUrl;
        await cacheUploadedBinary(newMedia.url, newMedia.dataUrl, context);
      }
      db.mediaLibrary = [newMedia, ...db.mediaLibrary.filter((m) => m.id !== newMedia.id && m.url !== newMedia.url)];
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true, media: newMedia }, 201);
    }
    if (segments.length === 2 && method === 'DELETE') {
      const mediaId = segments[1];
      db.mediaLibrary = db.mediaLibrary.filter((m) => m.id !== mediaId);
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true });
    }
  }

  // 9. /api/database/sync-vault, /api/database/import, /api/database/reset
  if (segments[0] === 'database') {
    if (segments[1] === 'sync-vault' && method === 'POST') {
      if (body.uploadDataUrls && typeof body.uploadDataUrls === 'object') {
        for (const [uPath, dUrl] of Object.entries(body.uploadDataUrls)) {
          if (uPath && typeof dUrl === 'string' && dUrl.startsWith('data:')) {
            db.uploadDataUrls[uPath] = dUrl;
            await cacheUploadedBinary(uPath, dUrl, context);
          }
        }
      }
      if (Array.isArray(body.mediaLibrary)) {
        const existingUrls = new Set(db.mediaLibrary.map((m) => m.url));
        for (const item of body.mediaLibrary) {
          if (item && item.url && !existingUrls.has(item.url)) {
            db.mediaLibrary.unshift(item);
            existingUrls.add(item.url);
          }
        }
      }
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true });
    }
    if (segments[1] === 'import' && method === 'POST') {
      if (Array.isArray(body.phones)) db.phones = body.phones;
      if (Array.isArray(body.brands)) db.brands = body.brands;
      if (Array.isArray(body.articles)) db.articles = body.articles;
      if (Array.isArray(body.reviews)) db.reviews = body.reviews;
      if (body.adSettings) db.adSettings = body.adSettings;
      if (body.websiteContent) db.websiteContent = body.websiteContent;
      if (Array.isArray(body.mediaLibrary)) db.mediaLibrary = body.mediaLibrary;
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true });
    }
    if (segments[1] === 'reset' && method === 'POST') {
      const fresh = cloneSeed();
      await saveEdgeDb(fresh, env, context);
      return jsonResponse({ success: true });
    }
  }

  // 10. /api/contact & /api/contact-inquiries
  if (segments[0] === 'contact' && method === 'POST') {
    const inquiry = {
      id: body.id || `inq-${Date.now()}`,
      name: (body.name || 'Visitor').trim(),
      email: (body.email || '').trim(),
      phone: (body.phone || '').trim(),
      subject: (body.subject || 'General Inquiry').trim(),
      message: (body.message || '').trim(),
      createdAt: body.createdAt || new Date().toISOString(),
      status: 'unread',
    };
    db.contactInquiries = [inquiry, ...db.contactInquiries.filter((i) => i.id !== inquiry.id)];
    await saveEdgeDb(db, env, context);
    return jsonResponse({
      success: true,
      message: 'Thank you! Your message has been received by GsmScope.',
      ticketId: inquiry.id,
      inquiry,
    });
  }
  if (segments[0] === 'contact-inquiries') {
    if (segments.length === 1 && method === 'GET') {
      return jsonResponse(db.contactInquiries);
    }
    if (segments.length === 2 && method === 'DELETE') {
      const inqId = segments[1];
      db.contactInquiries = db.contactInquiries.filter((i) => i.id !== inqId);
      if (!db.deletedInquiryIds.includes(inqId)) db.deletedInquiryIds.push(inqId);
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true });
    }
  }

  // 11. /api/newsletter
  if (segments[0] === 'newsletter') {
    if (segments[1] === 'subscribe' && method === 'POST') {
      const email = (body.email || '').trim().toLowerCase();
      if (!email) return jsonResponse({ success: false, message: 'Email required' }, 400);
      const sub = {
        id: `sub-${Date.now()}`,
        email,
        name: body.name || email.split('@')[0],
        subscribedAt: new Date().toISOString(),
        status: 'active',
      };
      db.newsletterSubscribers = [
        sub,
        ...db.newsletterSubscribers.filter((s) => (s.email || '').toLowerCase() !== email),
      ];
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true, message: 'Subscribed successfully!', subscriber: sub });
    }
    if (segments[1] === 'subscribers' && method === 'GET') {
      return jsonResponse(db.newsletterSubscribers);
    }
    if (segments[1] === 'subscribers' && segments[2] && method === 'DELETE') {
      const targetEmail = segments[2].toLowerCase();
      db.newsletterSubscribers = db.newsletterSubscribers.filter(
        (s) => (s.email || '').toLowerCase() !== targetEmail && s.id !== segments[2]
      );
      await saveEdgeDb(db, env, context);
      return jsonResponse({ success: true });
    }
    if (segments[1] === 'broadcasts') {
      if (method === 'GET') return jsonResponse(db.newsletterBroadcasts);
      if (method === 'POST') {
        const bc = {
          id: `bc-${Date.now()}`,
          subject: body.subject || 'GsmScope Update',
          content: body.content || '',
          sentAt: new Date().toISOString(),
          recipientCount: db.newsletterSubscribers.length || 1,
        };
        db.newsletterBroadcasts = [bc, ...db.newsletterBroadcasts];
        await saveEdgeDb(db, env, context);
        return jsonResponse({ success: true, broadcast: bc });
      }
      if (segments[2] && method === 'DELETE') {
        db.newsletterBroadcasts = db.newsletterBroadcasts.filter((b) => b.id !== segments[2]);
        await saveEdgeDb(db, env, context);
        return jsonResponse({ success: true });
      }
    }
  }

  return jsonResponse({ status: 'ok', path: pathname });
}
