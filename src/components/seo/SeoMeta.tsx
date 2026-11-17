import { useEffect } from 'react';

export interface SeoMetaProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'product';
  canonicalPath?: string;
  twitterCard?: 'summary_large_image' | 'summary';
  siteName?: string;
}

const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85';
const DEFAULT_SITE_NAME = 'GsmScope';

function upsertMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let tag = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertCanonicalLink(url: string) {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export function useSeoMeta({
  title,
  description,
  keywords,
  image,
  imageAlt,
  type = 'website',
  canonicalPath,
  twitterCard = 'summary_large_image',
  siteName = DEFAULT_SITE_NAME,
}: SeoMetaProps) {
  useEffect(() => {
    const brandLabel = siteName || DEFAULT_SITE_NAME;
    const resolvedTitle = title.includes(brandLabel) ? title : `${title} — ${brandLabel}`;
    const resolvedDescription =
      description.length > 165 ? `${description.slice(0, 162).trim()}...` : description;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gsmscope.com';
    const rawImage = image && image.trim().length > 0 ? image.trim() : DEFAULT_OG_IMAGE;
    const resolvedImage =
      rawImage.startsWith('http://') || rawImage.startsWith('https://')
        ? rawImage
        : `${origin}${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`;
    const resolvedImageAlt = imageAlt || resolvedTitle;
    const pathname =
      canonicalPath ||
      (typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/');
    const fullUrl = `${origin}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

    document.title = resolvedTitle;

    // Standard Meta Description
    upsertMetaTag('name', 'description', resolvedDescription);

    // Robots & Googlebot Rich Snippet directives
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
    const robotsDirective = isAdminRoute
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    upsertMetaTag('name', 'robots', robotsDirective);
    upsertMetaTag('name', 'googlebot', robotsDirective);

    // Meta Keywords
    if (keywords && keywords.trim()) {
      upsertMetaTag('name', 'keywords', keywords.trim());
    }

    // OpenGraph Tags
    upsertMetaTag('property', 'og:type', type);
    upsertMetaTag('property', 'og:site_name', brandLabel);
    upsertMetaTag('property', 'og:locale', 'en_US');
    upsertMetaTag('property', 'og:title', resolvedTitle);
    upsertMetaTag('property', 'og:description', resolvedDescription);
    upsertMetaTag('property', 'og:image', resolvedImage);
    upsertMetaTag('property', 'og:image:alt', resolvedImageAlt);
    upsertMetaTag('property', 'og:url', fullUrl);

    // X / Twitter Card Tags
    upsertMetaTag('name', 'twitter:card', twitterCard);
    upsertMetaTag('name', 'twitter:site', '@GsmScope');
    upsertMetaTag('name', 'twitter:title', resolvedTitle);
    upsertMetaTag('name', 'twitter:description', resolvedDescription);
    upsertMetaTag('name', 'twitter:image', resolvedImage);
    upsertMetaTag('name', 'twitter:image:alt', resolvedImageAlt);

    // Canonical URL
    upsertCanonicalLink(fullUrl);
  }, [title, description, keywords, image, imageAlt, type, canonicalPath, twitterCard, siteName]);
}

export default function SeoMeta(props: SeoMetaProps) {
  useSeoMeta(props);
  return null;
}
