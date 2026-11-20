import React, { useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Phone } from '../../types';
import LazyImage from './LazyImage';
import { 
  TrendingUp, 
  Smartphone, 
  Sparkles, 
  ArrowRight, 
  Search, 
  Star,
  Cpu,
  Camera,
  Battery
} from 'lucide-react';

interface PredictiveSearchDropdownProps {
  searchTerm: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectPhone: (phone: Phone) => void;
  onSubmitSearch?: (query: string) => void;
  selectedIndex?: number;
  setSelectedIndex?: (idx: number) => void;
  containerClassName?: string;
}

export default function PredictiveSearchDropdown({
  searchTerm,
  isOpen,
  onClose,
  onSelectPhone,
  onSubmitSearch,
  selectedIndex = -1,
  setSelectedIndex,
  containerClassName = ''
}: PredictiveSearchDropdownProps) {
  const { phones } = useApp();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute suggestions based on query and phone popularity
  const { matchingPhones, isPopularFallback } = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    // If query is empty, show the top popular smartphones
    if (!q) {
      const popular = [...phones]
        .sort((a, b) => {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        })
        .slice(0, 6);
      return { matchingPhones: popular, isPopularFallback: true };
    }

    // Match query against phone name, brand, processor, and keywords
    const matches = phones.filter((phone) => {
      const name = (phone.name || '').toLowerCase();
      const brand = (phone.brand || '').toLowerCase();
      const processor = (
        phone.detailedSpecs?.platform?.chipset || 
        phone.keyHighlights?.processor || 
        ''
      ).toLowerCase();
      const model = (phone.modelNumber || '').toLowerCase();
      const camera = (phone.keyHighlights?.camera || '').toLowerCase();

      return (
        name.includes(q) ||
        brand.includes(q) ||
        processor.includes(q) ||
        model.includes(q) ||
        camera.includes(q)
      );
    });

    // Sort matching results: exact name starts-with first, then isPopular, then views
    matches.sort((a, b) => {
      const aNameStarts = (a.name || '').toLowerCase().startsWith(q);
      const bNameStarts = (b.name || '').toLowerCase().startsWith(q);
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;

      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;

      return (b.viewsCount || 0) - (a.viewsCount || 0);
    });

    return { 
      matchingPhones: matches.slice(0, 6), 
      isPopularFallback: false 
    };
  }, [searchTerm, phones]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-[#071f14] dark:bg-slate-900 border border-emerald-500/40 shadow-2xl backdrop-blur-xl overflow-hidden animate-fadeIn text-slate-100 ${containerClassName}`}
      role="listbox"
      aria-label="Predictive phone suggestions"
    >
      {/* Top Banner / Indicator */}
      <div className="px-4 py-2 bg-[#04150d] dark:bg-slate-950/80 border-b border-emerald-950/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
          {isPopularFallback ? (
            <>
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Popular Smartphones</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Matching Phone Suggestions ({matchingPhones.length})</span>
            </>
          )}
        </div>
        <span className="text-[10px] text-slate-500 hidden sm:inline font-mono">
          Use ↑↓ to navigate · Enter to view
        </span>
      </div>

      {/* Suggestion Items */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-emerald-950/40 dark:divide-slate-800/60 custom-scrollbar">
        {matchingPhones.length > 0 ? (
          matchingPhones.map((phone, idx) => {
            const isSelected = selectedIndex === idx;
            const chipset = phone.detailedSpecs?.platform?.chipset || phone.keyHighlights?.processor || '';
            const camera = phone.keyHighlights?.camera || '';
            const battery = phone.keyHighlights?.battery || phone.detailedSpecs?.battery?.capacity || '';

            return (
              <div
                key={phone.id}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setSelectedIndex?.(idx)}
                onClick={() => onSelectPhone(phone)}
                className={`p-3 transition-colors cursor-pointer flex items-center justify-between gap-3 group ${
                  isSelected 
                    ? 'bg-emerald-950/80 text-white' 
                    : 'hover:bg-emerald-950/40 text-slate-200'
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-black/60 border border-emerald-500/20 shrink-0 overflow-hidden">
                    {phone.image ? (
                      <LazyImage
                        src={phone.image}
                        alt={phone.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-emerald-500/50" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {phone.brand}
                      </span>
                      {phone.isPopular && (
                        <span className="text-[9px] font-mono uppercase font-semibold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" /> Popular
                        </span>
                      )}
                      {phone.rating && (
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5 ml-auto sm:ml-0">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>{phone.rating.toFixed(1)}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white truncate font-['Space_Grotesk'] mt-0.5">
                      {phone.name}
                    </h4>

                    {/* Quick Specs Snippet */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 truncate mt-0.5">
                      {chipset && (
                        <span className="flex items-center gap-1 truncate max-w-[140px] sm:max-w-[180px]">
                          <Cpu className="w-3 h-3 text-emerald-400/80 shrink-0" />
                          <span className="truncate">{chipset}</span>
                        </span>
                      )}
                      {camera && (
                        <span className="hidden sm:flex items-center gap-1 truncate max-w-[140px]">
                          <Camera className="w-3 h-3 text-emerald-400/80 shrink-0" />
                          <span className="truncate">{camera}</span>
                        </span>
                      )}
                      {battery && (
                        <span className="hidden md:flex items-center gap-1 shrink-0">
                          <Battery className="w-3 h-3 text-emerald-400/80" />
                          <span>{battery}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Action */}
                <div className="text-right shrink-0 flex items-center">
                  <span className="text-[11px] text-slate-400 group-hover:text-emerald-300 flex items-center gap-1 transition-colors">
                    <span className="hidden sm:inline">View specs</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400/80" />
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 px-4 text-center space-y-1">
            <p className="text-xs text-slate-300">
              No direct smartphone matches for &ldquo;<span className="text-emerald-400 font-semibold">{searchTerm}</span>&rdquo;
            </p>
            <p className="text-[11px] text-slate-500">
              Press Enter or click below to search across full hardware specs &amp; articles.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Search Action */}
      {searchTerm.trim() && (
        <button
          type="button"
          onClick={() => onSubmitSearch?.(searchTerm.trim())}
          className="w-full px-4 py-2.5 bg-[#03150d] hover:bg-emerald-950 border-t border-emerald-950/80 text-left text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              Search all database results for &ldquo;<strong>{searchTerm.trim()}</strong>&rdquo;
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      )}
    </div>
  );
}
