import React from 'react';
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
    setSelectedPhone 
  } = useApp();
  
  const inCompare = isInCompare(phone.id);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(phone.id);
    } else {
      addToCompare(phone.id);
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      setSelectedPhone(phone);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:border-emerald-500/60 transition-all hover:shadow-xl cursor-pointer shadow-sm"
    >
      {/* Top Media Area */}
      <div className="relative w-full aspect-[4/3] bg-[#061a11]/60 overflow-hidden flex items-center justify-center p-4">
        {/* Subtle decorative glow */}
        <div 
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
          style={{ background: `radial-gradient(circle at center, ${phone.accentColor}, transparent 70%)` }}
        />
        
        {phone.image ? (
          <img
            src={phone.image}
            alt={phone.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-16 h-28 border border-slate-700 rounded-lg bg-slate-900 flex flex-col items-center justify-center text-slate-500">
            <Smartphone className="w-6 h-6 mb-1 text-slate-400" />
            <span className="text-[10px] font-mono">{phone.brand}</span>
          </div>
        )}

        {/* Brand Chip in top left matching GsmScope */}
        <span className="absolute top-3 left-3 px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-[#061a11]/90 text-emerald-400 border border-emerald-500/30">
          {phone.brand}
        </span>

        {/* Quick compare toggle float */}
        <button
          onClick={handleToggleCompare}
          className={`absolute top-3 right-3 p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-md ${
            inCompare
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
          }`}
          title={inCompare ? 'Remove from comparison' : 'Add to compare'}
        >
          {inCompare ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
          <span className="text-[10px] pr-0.5">{inCompare ? 'Comparing' : 'Compare'}</span>
        </button>

        {phone.keyHighlights.network5g && (
          <div className="absolute bottom-3 left-3 px-1.5 py-0.5 text-[9px] font-mono tracking-wider font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-500/40 rounded">
            5G
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{phone.releaseYear}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">★ {phone.rating.toFixed(1)}</span>
            <span aria-hidden="true">·</span>
            <span>{phone.reviewsCount} reviews</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2 font-['Space_Grotesk']">
            {phone.name}
          </h3>

          {/* Dual Currency Price Block (Hidden on Homepage posts when hidePrice=true) */}
          {!hidePrice && (
            <div className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {currency === 'USD' ? formatUSD(phone.priceUSD) : formatNaira(phone.priceNGN)}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  ({currency === 'USD' ? formatNaira(phone.priceNGN) : formatUSD(phone.priceUSD)})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {phone.marketStatus}
              </p>
            </div>
          )}

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
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">View details</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            <span>Full Specs</span>
            <Eye className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
