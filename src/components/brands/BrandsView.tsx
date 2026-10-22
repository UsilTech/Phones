import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Brand } from '../../types';
import PhoneCard from '../phones/PhoneCard';
import { ShieldCheck, MapPin, Smartphone, ArrowRight } from 'lucide-react';

export default function BrandsView() {
  const { brands, phones, selectedBrand, setSelectedBrand } = useApp();
  const [activeBrand, setActiveBrand] = useState<Brand>(selectedBrand || brands[0]);

  const brandPhones = phones.filter((p) => 
    p.brand.toLowerCase() === activeBrand.name.toLowerCase()
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Smartphone Manufacturers &amp; Official Nigerian Partners
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore mobile brands officially operating in Nigeria, authorized warranty repair centers (Carlcare, Samsung, Raya), and active device lineups.
        </p>
      </div>

      {/* Brands Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {brands.map((b) => {
          const isSelected = activeBrand.id === b.id;
          const phoneCount = phones.filter(p => p.brand.toLowerCase() === b.name.toLowerCase()).length;
          return (
            <button
              key={b.id}
              onClick={() => {
                setActiveBrand(b);
                setSelectedBrand(b);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-lg'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs ${b.accentBg}`}>
                  {b.logoLetter}
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {phoneCount} models
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{b.name}</h3>
                <span className="text-[10px] text-slate-400 truncate block">{b.country}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Brand Dossier Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg ${activeBrand.accentBg}`}>
              {activeBrand.logoLetter}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{activeBrand.name} Nigeria</h2>
              <p className="text-xs text-slate-400">{activeBrand.description}</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeBrand.officialPresenceInNigeria}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">{activeBrand.warrantyPartner}</span>
            </div>
          </div>
        </div>

        {/* Series Highlights */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">Popular Device Series:</span>
          <div className="flex flex-wrap gap-2 text-xs">
            {activeBrand.popularSeries.map((series, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-medium">
                {series}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Phones under selected brand */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>{activeBrand.name} Phones in Nigerian Market ({brandPhones.length})</span>
          </h3>
        </div>

        {brandPhones.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
            No devices currently indexed for {activeBrand.name}. You can add devices via the Admin Studio.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brandPhones.map((phone) => (
              <PhoneCard key={phone.id} phone={phone} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
