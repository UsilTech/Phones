// Cloudflare Pages Function for /uploads/* image serving
// Automatically serves uploaded images from Cloudflare Edge Cache or stored DataURLs in the Edge DB.

import { loadEdgeDb } from '../api/[[path]].js';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Check Cloudflare Edge Cache first
  try {
    if (typeof caches !== 'undefined' && caches.default) {
      const cached = await caches.default.match(new Request(`https://gsmscope-edge-vault.internal${pathname}`));
      if (cached && cached.ok) {
        return cached;
      }
    }
  } catch {}

  // 2. Check Edge DB uploadDataUrls or mediaLibrary
  try {
    const db = await loadEdgeDb(env);
    let dataUrl = db?.uploadDataUrls?.[pathname];
    if (!dataUrl && Array.isArray(db?.mediaLibrary)) {
      const found = db.mediaLibrary.find((m) => m && m.url === pathname && m.dataUrl);
      if (found) dataUrl = found.dataUrl;
    }

    if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1] || 'image/jpeg';
        const base64Data = match[2];
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        return new Response(bytes, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }
  } catch {}

  // 3. Fall through to static asset if present
  if (context && typeof context.next === 'function') {
    return context.next();
  }
  return new Response('Not Found', { status: 404 });
}
