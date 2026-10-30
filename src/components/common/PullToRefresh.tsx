import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

function checkStandaloneInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneDisplay =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches;
  const isIOSStandalone = Boolean((window.navigator as any).standalone);
  const isAndroidTWA =
    typeof document !== 'undefined' && document.referrer.includes('android-app://');
  return isStandaloneDisplay || isIOSStandalone || isAndroidTWA;
}

/**
 * Custom Rolling Green Dots Spinner
 * Arranges small circular green dots radially around a circle
 * that continuously roll until the page refresh completes.
 */
function RollingGreenDots() {
  const dots = [
    { cx: 20, cy: 6.5, opacity: 1.0, r: 3, color: '#10b981' },
    { cx: 29.5, cy: 10.5, opacity: 0.92, r: 2.8, color: '#ffffff' },
    { cx: 33.5, cy: 20, opacity: 0.84, r: 2.7, color: '#10b981' },
    { cx: 29.5, cy: 29.5, opacity: 0.74, r: 2.5, color: '#ffffff' },
    { cx: 20, cy: 33.5, opacity: 0.64, r: 2.4, color: '#10b981' },
    { cx: 10.5, cy: 29.5, opacity: 0.52, r: 2.2, color: '#ffffff' },
    { cx: 6.5, cy: 20, opacity: 0.40, r: 2.0, color: '#10b981' },
    { cx: 10.5, cy: 10.5, opacity: 0.28, r: 1.8, color: '#ffffff' },
  ];

  return (
    <svg
      className="w-10 h-10 animate-spin"
      viewBox="0 0 40 40"
      fill="none"
      style={{
        animationDuration: '0.8s',
        filter: 'drop-shadow(0 1px 4px rgba(6, 78, 59, 0.55))',
      }}
      aria-hidden="true"
    >
      {dots.map((dot, idx) => (
        <circle
          key={idx}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={dot.color}
          fillOpacity={dot.opacity}
          stroke={dot.color === '#ffffff' ? '#10b981' : 'none'}
          strokeWidth={dot.color === '#ffffff' ? '0.6' : '0'}
        />
      ))}
    </svg>
  );
}

export default function PullToRefresh() {
  const { refreshData } = useApp();
  const [isAppInstalled] = useState<boolean>(() => checkStandaloneInstalled());
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const isHorizontalSwipeRef = useRef(false);
  const pullDistanceRef = useRef(0);

  const THRESHOLD = 100; // Normalized threshold corresponding to ~45% of viewport height pull
  const MAX_PULL = 120;  // Rubberband maximum
  const DEADZONE_Y = 45; // Minimum straight-down pull before showing indicator

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Prevent native browser pull-to-refresh on standard browsers;
    // when installed via popup/PWA, contain overscroll so our custom PullToRefresh runs cleanly.
    document.documentElement.style.overscrollBehaviorY = isAppInstalled ? 'contain' : 'none';
    document.body.style.overscrollBehaviorY = isAppInstalled ? 'contain' : 'none';

    // Pull-to-refresh is strictly disabled for users visiting the site on regular browsers
    if (!isAppInstalled) {
      isPullingRef.current = false;
      pullDistanceRef.current = 0;
      setPullDistance(0);
      setIsRefreshing(false);
      return;
    }

    const getRequiredScreenPull = () => Math.max(220, window.innerHeight * 0.45);

    const resetPullState = () => {
      isPullingRef.current = false;
      pullDistanceRef.current = 0;
      setPullDistance(0);
    };

    // --- Touch Events (Mobile) ---
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        resetPullState();
        return;
      }
      if (window.scrollY <= 2 && !isRefreshing) {
        startXRef.current = e.touches[0].clientX;
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
        isHorizontalSwipeRef.current = false;
      } else {
        resetPullState();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshing || isHorizontalSwipeRef.current) return;

      if (window.scrollY > 2) {
        resetPullState();
        return;
      }

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startXRef.current;
      const deltaY = currentY - startYRef.current;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Never trigger or show when sweeping left or right
      if (absX > 12 && absX >= absY * 0.5) {
        isHorizontalSwipeRef.current = true;
        resetPullState();
        return;
      }

      if (deltaY < 0) {
        resetPullState();
        return;
      }

      // Only start showing progress after passing vertical deadzone with a strictly downward pull
      if (deltaY > DEADZONE_Y && deltaY > absX * 2) {
        if (e.cancelable) {
          e.preventDefault();
        }
        const requiredPull = getRequiredScreenPull();
        const effectiveDelta = deltaY - DEADZONE_Y;
        const requiredEffective = Math.max(160, requiredPull - DEADZONE_Y);
        const normalized = Math.min(MAX_PULL, (effectiveDelta / requiredEffective) * THRESHOLD);
        pullDistanceRef.current = normalized;
        setPullDistance(normalized);
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      if (isHorizontalSwipeRef.current) {
        isHorizontalSwipeRef.current = false;
        resetPullState();
        return;
      }

      const reachedThreshold = pullDistanceRef.current >= THRESHOLD;
      if (reachedThreshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(THRESHOLD);

        try {
          await refreshData();
        } catch {
          // handled silently
        } finally {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsRefreshing(false);
            setIsFadingOut(false);
            setPullDistance(0);
          }, 300);
        }
      } else {
        setPullDistance(0);
      }
      pullDistanceRef.current = 0;
    };

    // --- Mouse Drag Fallback (Desktop / Touch Emulation) ---
    const handleMouseDown = (e: MouseEvent) => {
      if (window.scrollY <= 2 && !isRefreshing && e.button === 0) {
        startXRef.current = e.clientX;
        startYRef.current = e.clientY;
        isPullingRef.current = true;
        isHorizontalSwipeRef.current = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPullingRef.current || isRefreshing || isHorizontalSwipeRef.current) return;
      if (window.scrollY > 2) {
        resetPullState();
        return;
      }

      const deltaX = e.clientX - startXRef.current;
      const deltaY = e.clientY - startYRef.current;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Ignore left or right sweeps
      if (absX > 12 && absX >= absY * 0.5) {
        isHorizontalSwipeRef.current = true;
        resetPullState();
        return;
      }

      if (deltaY < 0) {
        resetPullState();
        return;
      }

      if (deltaY > DEADZONE_Y && deltaY > absX * 2) {
        const requiredPull = getRequiredScreenPull();
        const effectiveDelta = deltaY - DEADZONE_Y;
        const requiredEffective = Math.max(160, requiredPull - DEADZONE_Y);
        const normalized = Math.min(MAX_PULL, (effectiveDelta / requiredEffective) * THRESHOLD);
        pullDistanceRef.current = normalized;
        setPullDistance(normalized);
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    const handleMouseUp = () => {
      if (isPullingRef.current) {
        handleTouchEnd();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);

      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [refreshData, isRefreshing, isAppInstalled]);

  if (!isAppInstalled) return null;

  const isVisible = pullDistance > 0 || isRefreshing;
  if (!isVisible) return null;

  // As user pulls down, progress goes from 0 to 1
  const progress = Math.min(1, Math.max(0, pullDistance / THRESHOLD));

  // As user pulls down, full green circle (56px) reduces to small (20px)
  const circleSize = Math.max(20, Math.round(56 - progress * 36));

  return (
    <div
      aria-hidden="true"
      style={{
        top: '33.333vh',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
      className={`fixed z-[999990] pointer-events-none select-none transition-opacity duration-200 ${
        isFadingOut ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
      }`}
    >
      {isRefreshing ? (
        /* After release: ring of small green dots keep rolling continuously around the circle in transparent not dark background */
        <div className="w-12 h-12 bg-transparent flex items-center justify-center animate-fadeIn">
          <RollingGreenDots />
        </div>
      ) : (
        /* As user pulls down: full green circle that reduces to small */
        <div
          style={{
            width: `${circleSize}px`,
            height: `${circleSize}px`,
          }}
          className="rounded-full bg-emerald-500 shadow-[0_4px_24px_rgba(16,185,129,0.45)] ring-2 ring-emerald-300/40 transition-[width,height] duration-75 ease-out flex items-center justify-center"
        />
      )}
    </div>
  );
}
