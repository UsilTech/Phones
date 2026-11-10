import React from 'react';
import { useApp } from '../../context/AppContext';

export default function GlobalProgressBar() {
  const { isGlobalLoading, globalProgress } = useApp();

  if (!isGlobalLoading && globalProgress <= 0) {
    return null;
  }

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
      style={{ boxShadow: '0 -4px 0 0 #061a11' }}
    >
      {/* High-visibility top track */}
      <div className="w-full h-[3px] bg-[#061a11]">
        {/* Animated Fill Bar */}
        <div
          className={`h-full bg-emerald-500 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-[0_0_10px_rgba(16,185,129,0.9)] relative ${
            globalProgress === 0 ? 'transition-none' : 'transition-[width] duration-200 ease-out'
          }`}
          style={{ width: `${globalProgress}%` }}
        />
      </div>
    </div>
  );
}
