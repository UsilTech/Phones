import React, { useState, useEffect } from 'react';
import { Phone } from '../../types';
import { useApp } from '../../context/AppContext';
import { Scale, Check, Eye, Smartphone, Cpu, Battery, Camera } from 'lucide-react';

interface PhoneCardProps {
  phone: Phone;
  onSelect?: () => void;
  hidePrice?: boolean;
}

export default function PhoneCard({ phone, onSelect, hidePrice = false }: PhoneCardProps) {
  const { 
    formatNaira, 
    formatUSD, 
    currency, 
    addToCompare, 
    removeFromCompare, 
    isInCompare, 
    setSelectedPhone,
    triggerNavigation 
  } = useApp();
  
  const inCompare = isInCompare(phone.id);
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [phone.image]);

  useEffect(() => {
    if (!inCompare) {
      setJustAdded(false);
    }
  }, [inCompare]);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(phone.id);
      setJustAdded(false);
    } else {
      addToCompare(phone.id);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 900);
    }
  };

  const handleCardClick = () => {
    triggerNavigation(() => {
      if (onSelect) {
        onSelect();
      } else {
        setSelectedPhone(phone);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  };

  const hasValidImage = Boolean(phone.image && !imgError);

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:border-emerald-500/60 transition-all hover:shadow-xl cursor-pointer shadow-sm"
    >
      {/* Top Media Area */}
      <div className="relative w-full aspect-[4/3] bg-[#061a11]/60 overflow-hidden flex items-center justify-center p-0">
        {hasValidImage ? (
          <img
            src={phone.image}
            alt={phone.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/90 text-slate-400 p-4">
            <Smartphone className="w-8 h-8 mb-1.5 text-emerald-500/60" />
            <span className="text-[11px] font-bold text-slate-300 truncate max-w-[90%] text-center">{phone.name}</span>
            <span className="text-[9px] font-mono text-emerald-400/80 uppercase mt-0.5">{phone.brand}</span>
          </div>
        )}

        {/* Brand Chip in top left matching GsmScope */}
        <span className="site-badge absolute top-2.5 left-2.5 px-1.5 py-px text-[9px] font-mono font-semibold rounded bg-[#061a11]/90 text-emerald-400 border border-emerald-500/30">
          {phone.brand}
        </span>

        {/* Quick compare toggle float */}
        <button
          onClick={handleToggleCompare}
          className={`site-badge absolute top-2.5 right-2.5 px-1.5 py-px rounded-md text-[9px] font-medium transition-all duration-300 flex items-center gap-1 shadow-md ${
            inCompare
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50 animate-compare-pulse'
              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
          }`}
          title={inCompare ? 'Remove from comparison' : 'Add to compare'}
        >
          {justAdded && (
            <span className="absolute inset-0 rounded-md bg-emerald-400/40 animate-ping pointer-events-none" />
          )}
          {inCompare ? <Check className="w-3 h-3" /> : <Scale className="w-3 h-3" />}
          <span className="text-[9px] pr-0.5">{inCompare ? 'Comparing' : 'Compare'}</span>
        </button>
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="post-title font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2.5 font-['Space_Grotesk']">
            {phone.name}
          </h3>

          {/* Key Specs Line matching gsmSpecLine */}
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{phone.keyHighlights.display}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{phone.keyHighlights.processor}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Battery className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{phone.keyHighlights.battery} · {phone.keyHighlights.ram}/{phone.keyHighlights.storage}</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs gap-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">View details</span>
          <span className="font-normal text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0 whitespace-nowrap">
            <span className="whitespace-nowrap">Full specs</span>
            <Eye className="w-3.5 h-3.5 shrink-0 ml-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
