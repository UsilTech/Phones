import React, { useState, useEffect, useRef } from 'react';

// Global session cache of already-loaded/decoded image sources for instant 0ms re-renders
const loadedImageCache = new Set<string>();

// Shared IntersectionObserver pool so hundreds of cards share a single observer instance
type ObserverCallback = () => void;
const observerCallbacks = new WeakMap<Element, ObserverCallback>();
let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            const cb = observerCallbacks.get(entry.target);
            if (cb) {
              observerCallbacks.delete(entry.target);
              sharedObserver?.unobserve(entry.target);
              cb();
            }
          }
        }
      },
      {
        // Begin loading & decoding 450px before the element enters the viewport
        rootMargin: '450px 0px',
        threshold: 0.01,
      }
    );
  }
  return sharedObserver;
}

/**
 * Optimizes external image URLs (e.g. Unsplash) for faster download without altering local or data URLs.
 */
export function optimizeImageSrc(src?: string): string {
  if (!src) return '';
  if (src.startsWith('data:') || src.startsWith('/') || src.startsWith('blob:')) {
    return src;
  }
  if (src.includes('images.unsplash.com')) {
    try {
      const url = new URL(src);
      if (!url.searchParams.has('auto')) url.searchParams.set('auto', 'format');
      if (!url.searchParams.has('q')) url.searchParams.set('q', '75');
      return url.toString();
    } catch {
      return src;
    }
  }
  return src;
}

/**
 * Preloads and decodes an array of image URLs during browser idle time so carousels and tabs switch instantaneously.
 */
export function preloadImages(urls: (string | undefined | null)[]) {
  if (typeof window === 'undefined') return;
  const validUrls = urls
    .map((u) => (u ? optimizeImageSrc(u) : ''))
    .filter((u) => Boolean(u) && !loadedImageCache.has(u));

  if (validUrls.length === 0) return;

  const runPreload = () => {
    for (const url of validUrls) {
      if (loadedImageCache.has(url)) continue;
      const img = new Image();
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().catch(() => {}).finally(() => {
            loadedImageCache.add(url);
          });
        } else {
          loadedImageCache.add(url);
        }
      };
      img.src = url;
    }
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runPreload, { timeout: 1500 });
  } else {
    setTimeout(runPreload, 120);
  }
}

export interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
  alt: string;
  /** Set true for above-the-fold hero/featured images to load eagerly with high fetchPriority */
  priority?: boolean;
  /** Optional fallback image URL if the primary image fails to load */
  fallbackSrc?: string;
  /** Optional wrapper class name if needed; defaults to filling the parent container */
  wrapperClassName?: string;
}

export default function LazyImage({
  src,
  alt,
  priority = false,
  fallbackSrc,
  className = '',
  wrapperClassName = 'w-full h-full',
  onError,
  onLoad,
  ...rest
}: LazyImageProps) {
  const normalizedSrc = optimizeImageSrc(src);
  const [activeSrc, setActiveSrc] = useState<string>(normalizedSrc);
  const isCached = Boolean(normalizedSrc && loadedImageCache.has(normalizedSrc));

  // Start visible immediately if priority or already cached in memory
  const [shouldLoad, setShouldLoad] = useState<boolean>(priority || isCached);
  const [isLoaded, setIsLoaded] = useState<boolean>(isCached);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const nextSrc = optimizeImageSrc(src);
    setActiveSrc(nextSrc);
    const alreadyCached = Boolean(nextSrc && loadedImageCache.has(nextSrc));
    if (alreadyCached) {
      setShouldLoad(true);
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
      if (priority) {
        setShouldLoad(true);
      }
    }
  }, [src, priority]);

  // Observe container for viewport proximity when not priority and not yet triggered
  useEffect(() => {
    if (shouldLoad || !activeSrc) return;
    const el = containerRef.current;
    const observer = getSharedObserver();
    if (!el || !observer) {
      setShouldLoad(true);
      return;
    }

    observerCallbacks.set(el, () => {
      setShouldLoad(true);
    });
    observer.observe(el);

    return () => {
      observerCallbacks.delete(el);
      observer.unobserve(el);
    };
  }, [shouldLoad, activeSrc]);

  // Check if the browser already completed loading from disk cache synchronously
  useEffect(() => {
    if (shouldLoad && imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      if (activeSrc) loadedImageCache.add(activeSrc);
      setIsLoaded(true);
    }
  }, [shouldLoad, activeSrc]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    const finishReveal = () => {
      if (activeSrc) loadedImageCache.add(activeSrc);
      setIsLoaded(true);
      onLoad?.(e);
    };

    if (typeof target.decode === 'function' && !isCached) {
      target.decode().catch(() => {}).finally(finishReveal);
    } else {
      finishReveal();
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && activeSrc !== fallbackSrc) {
      setActiveSrc(fallbackSrc);
      return;
    }
    setIsLoaded(true);
    onError?.(e);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${wrapperClassName}`}
    >
      {/* Subtle shimmer skeleton while image is fetching/decoding */}
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-slate-900/90 animate-pulse pointer-events-none"
        />
      )}

      {shouldLoad && activeSrc && (
        <img
          ref={imgRef}
          src={activeSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} ${
            isCached
              ? 'opacity-100'
              : `transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`
          }`}
          {...rest}
        />
      )}
    </div>
  );
}
