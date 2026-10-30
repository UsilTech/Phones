import React from 'react';
import { useApp } from '../../context/AppContext';

export default function GlobalProgressBar() {
  const { isGlobalLoading, globalProgress } = useApp();

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(globalProgress)}
      aria-hidden={!isGlobalLoading}
      className={`fixed top-0 left-0 right-0 z-[999999] pointer-events-none transition-opacity duration-200 ${
        isGlobalLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* High-visibility top track */}
      <div className="w-full h-[3.5px] bg-emerald-950/30 overflow-hidden">
        {/* Animated Fill Bar */}
        <div
          className={`h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-200 shadow-[0_0_14px_rgba(16,185,129,1),0_0_6px_rgba(52,211,153,0.95)] relative ${
            globalProgress === 0 ? 'transition-none' : 'transition-[width] duration-200 ease-out'
          }`}
          style={{ width: `${globalProgress}%` }}
        >
          {/* Radiant glowing head accent */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-emerald-200/80 to-white blur-[0.5px]" />
        </div>
      </div>
    </div>
  );
}
