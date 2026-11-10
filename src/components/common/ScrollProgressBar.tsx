import React, { useState, useEffect, useCallback } from 'react';

interface ScrollProgressBarProps {
  targetRef?: React.RefObject<HTMLElement | null>;
}

export default function ScrollProgressBar({ targetRef }: ScrollProgressBarProps) {
  const [progress, setProgress] = useState(0);

  const calculateProgress = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || 1;

    if (scrollTop <= 0) {
      setProgress(0);
      return;
    }

    const el = targetRef?.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + scrollTop;
      const elementHeight = el.offsetHeight;
      const totalScrollable = elementTop + elementHeight - windowHeight;

      if (totalScrollable <= 0) {
        setProgress(100);
        return;
      }

      const currentProgress = Math.min(100, Math.max(0, (scrollTop / totalScrollable) * 100));
      setProgress(currentProgress);
      return;
    }

    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    const totalScrollable = docHeight - windowHeight;

    if (totalScrollable <= 0) {
      setProgress(100);
      return;
    }

    const currentProgress = Math.min(100, Math.max(0, (scrollTop / totalScrollable) * 100));
    setProgress(currentProgress);
  }, [targetRef]);

  useEffect(() => {
    calculateProgress();

    window.addEventListener('scroll', calculateProgress, { passive: true });
    window.addEventListener('resize', calculateProgress, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        calculateProgress();
      });
      if (targetRef?.current) {
        resizeObserver.observe(targetRef.current);
      } else if (document.body) {
        resizeObserver.observe(document.body);
      }
    }

    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [calculateProgress, targetRef]);

  if (progress <= 0) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="fixed top-0 left-0 right-0 z-[70] h-0.5 w-full bg-[#061a11] pointer-events-none"
      style={{ boxShadow: '0 -4px 0 0 #061a11' }}
    >
      <div
        className="h-full bg-emerald-500 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_6px_rgba(16,185,129,0.6)] transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
