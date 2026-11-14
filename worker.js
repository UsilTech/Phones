// Cloudflare Worker entry point for Wrangler (npx wrangler deploy)
// Handles:
// 1. /api/*     -> Full persistent Edge API (Phones, Articles, Reviews, Brands, Ads, Settings, Media, Contact, Newsletter)
// 2. /uploads/* -> Edge image serving from Cloudflare Cache API & Edge DB DataURLs
// 3. /*         -> Static assets from ./dist via env.ASSETS with SPA fallback to /index.html (including /admin)

import { onRequest as handleApiRequest } from './functions/api/[[path]].js';
import { onRequest as handleUploadsRequest } from './functions/uploads/[[path]].js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const context = {
      request,
      env,
      waitUntil: ctx && typeof ctx.waitUntil === 'function' ? ctx.waitUntil.bind(ctx) : () => {},
      next: async () => {
        if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
          return env.ASSETS.fetch(request);
        }
        return new Response('Not Found', { status: 404 });
      },
    };

    // 1. API routes (/api/*)
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return handleApiRequest(context);
    }

    // 2. Uploaded media routes (/uploads/*)
    if (pathname.startsWith('/uploads/')) {
      return handleUploadsRequest(context);
    }

    // 3. Static assets & SPA fallback (/admin, etc.)
    if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status !== 404) {
        return assetRes;
      }
      // SPA fallback to /index.html for client-side routes like /admin
      const indexUrl = new URL('/index.html', request.url);
      return env.ASSETS.fetch(new Request(indexUrl, request));
    }

    return new Response('Not Found', { status: 404 });
  },
};
