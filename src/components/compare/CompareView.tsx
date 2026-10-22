import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Eye, 
  Layers, 
  Sparkles, 
  AlertCircle,
  Smartphone,
  Cpu,
  Camera,
  Battery,
  Wifi,
  Radio
} from 'lucide-react';

export default function CompareView() {
  const { 
    compareList, 
    removeFromCompare, 
    clearCompare, 
    addToCompare, 
    phones, 
    formatNaira,
    setSelectedPhone
  } = useApp();

  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [searchPickerOpen, setSearchPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Selected phones for comparison
  const comparedPhones = compareList
    .map((id) => phones.find((p) => p.id === id))
    .filter(Boolean) as typeof phones;

  // Unselected phones available to add
  const availableToAdd = phones.filter((p) => !compareList.includes(p.id));
  const filteredAvailable = availableToAdd.filter((p) => 
    p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const isDifferent = (values: string[]) => {
    if (values.length <= 1) return false;
    const first = values[0].trim().toLowerCase();
    return values.some(v => v.trim().toLowerCase() !== first);
  };

  const renderComparisonRow = (label: string, getVal: (p: typeof phones[0]) => string) => {
    const values = comparedPhones.map(getVal);
    const diff = highlightDifferences && isDifferent(values);

    return (
      <tr className={`border-b border-slate-800/80 transition-colors ${diff ? 'bg-emerald-950/20' : ''}`}>
        <td className="py-3 px-4 text-xs font-medium text-slate-400 bg-slate-900/60 w-44 sticky left-0 z-10 border-r border-slate-800">
          <div className="flex items-center justify-between">
            <span>{label}</span>
            {diff && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Different between devices" />
            )}
          </div>
        </td>
        {comparedPhones.map((phone) => (
          <td key={phone.id} className="py-3 px-4 text-xs text-slate-200 align-top min-w-[200px]">
            {getVal(phone)}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Smartphone Comparison Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare up to 4 devices side-by-side with Nigerian retail Naira prices and comprehensive technical parameters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Highlight diff toggle */}
          <button
            onClick={() => setHighlightDifferences(!highlightDifferences)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-2 cursor-pointer ${
              highlightDifferences
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Highlight Differences: {highlightDifferences ? 'ON' : 'OFF'}</span>
          </button>

          {/* Add device button */}
          {compareList.length < 4 && (
            <button
              onClick={() => setSearchPickerOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Device ({compareList.length}/4)</span>
            </button>
          )}

          {/* Clear compare list */}
          {compareList.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg hover:border-rose-900/40 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Comparison Area */}
      {comparedPhones.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Phones Selected for Comparison</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select 2 to 4 phones from the database to inspect differences in camera sensors, battery endurance, Nigerian market prices, and chipset speed.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                addToCompare('tecno-camon-30-pro-5g');
                addToCompare('samsung-galaxy-s24-ultra');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Compare Tecno Camon 30 Pro vs Galaxy S24 Ultra
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950">
                  <th className="p-4 text-xs font-semibold text-slate-400 w-44 sticky left-0 z-20 bg-slate-950 border-r border-slate-800">
                    Device Overview
                  </th>
                  {comparedPhones.map((phone) => (
                    <th key={phone.id} className="p-4 align-top min-w-[220px]">
                      <div className="relative group flex flex-col items-start">
                        <button
                          onClick={() => removeFromCompare(phone.id)}
                          className="absolute -top-1 right-0 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Remove device"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="w-24 h-24 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden mb-2.5 flex items-center justify-center p-2">
                          {phone.image ? (
                            <img
                              src={phone.image}
                              alt={phone.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Smartphone className="w-8 h-8 text-slate-600" />
                          )}
                        </div>

                        <span className="text-[11px] font-mono text-emerald-400">{phone.brand}</span>
                        <h4 className="font-bold text-white text-sm line-clamp-1 mb-1">
                          {phone.name}
                        </h4>

                        <div className="text-base font-bold font-mono text-emerald-400 tabular-nums mb-2">
                          {formatNaira(phone.priceNGN)}
                        </div>

                        <button
                          onClick={() => setSelectedPhone(phone)}
                          className="text-[11px] font-semibold text-slate-300 hover:text-emerald-400 flex items-center gap-1 py-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Spec Sheet</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* SECTION: PRICING & MARKET */}
                <tr className="bg-slate-950/80 font-bold text-slate-300 text-xs border-y border-slate-800">
                  <td colSpan={comparedPhones.length + 1} className="py-2 px-4 uppercase tracking-wider text-emerald-400">
                    NIGERIAN MARKET &amp; PRICING
                  </td>
                </tr>
                {renderComparisonRow('Official Price (NGN)', (p) => formatNaira(p.priceNGN))}
                {renderComparisonRow('Market Status', (p) => p.marketStatus)}
                {renderComparisonRow('Naira Pricing Insights', (p) => p.nairaPriceNotes)}

                {/* SECTION: PERFORMANCE & OS */}
                <tr className="bg-slate-950/80 font-bold text-slate-300 text-xs border-y border-slate-800">
                  <td colSpan={comparedPhones.length + 1} className="py-2 px-4 uppercase tracking-wider text-emerald-400">
                    PLATFORM &amp; PERFORMANCE
                  </td>
                </tr>
                {renderComparisonRow('Operating System', (p) => p.detailedSpecs.platform.os)}
                {renderComparisonRow('Processor / Chipset', (p) => p.detailedSpecs.platform.chipset)}
                {renderComparisonRow('CPU Architecture', (p) => p.detailedSpecs.platform.cpu)}
                {renderComparisonRow('GPU Graphics', (p) => p.detailedSpecs.platform.gpu)}
                {renderComparisonRow('AnTuTu v10 Benchmark', (p) => p.detailedSpecs.platform.antutuScore)}

                {/* SECTION: MEMORY */}
                <tr className="bg-slate-950/80 font-bold text-slate-300 text-xs border-y border-slate-800">
                  <td colSpan={comparedPhones.length + 1} className="py-2 px-4 uppercase tracking-wider text-emerald-400">
                    MEMORY &amp; STORAGE
                  </td>
                </tr>
                {renderComparisonRow('RAM Capacity', (p) => p.detailedSpecs.memory.ramVariants.join(', '))}
                {renderComparisonRow('Storage Options', (p) => `${p.detailedSpecs.memory.storageVariants.join(', ')} (${p.detailedSpecs.memory.storageType})`)}
                {renderComparisonRow('MicroSD Expansion', (p) => p.detailedSpecs.memory.cardSlot)}

                {/* SECTION: DISPLAY */}
                <tr className="bg-slate-950/80 font-bold text-slate-300 text-xs border-y border-slate-800">
                  <td colSpan={comparedPhones.length + 1} className="py-2 px-4 uppercase tracking-wider text-emerald-400">
                    DISPLAY
                  </td>
                </tr>
                {renderComparisonRow('Screen Type', (p) => p.detailedSpecs.display.type)}
                {renderComparisonRow('Size & Ratio', (p) => p.detailedSpecs.display.size)}
                {renderComparisonRow('Resolution & Density', (p) => p.detailedSpecs.display.resolution)}
                {renderComparisonRow('Peak Brightness', (p) => p.detailedSpecs.display.brightness)}
                {renderComparisonRow('Glass Protection', (p) => p.detailedSpecs.display.protection)}

                {/* SECTION: CAMERAS */}
                <tr className="bg-slate-950/80 font-bold text-slate-300 text-xs border-y border-slate-800">
                  <td colSpan={comparedPhones.length + 1} className="py-2 px-4 uppercase tracking-wider text-emerald-400">
                    CAMERAS
                  </td>
                </tr>
                {renderComparisonRow('Rear Camera Setup', (p) => p.detailedSpecs.mainCamera.setup)}
                {renderComparisonRow('Rear Video Capability', (p) => p.detailedSpecs.mainCamera.video)}
                {renderComparisonRow('Selfie Camera', (p) => p.detailedSpecs.selfieCamera.setup)}
                {renderComparisonRow('Front Video Recording', (p) => p.detailedSpecs.selfieCamera.video)}

                {/* SECTION: BATTERY & CHARGING */}
                <tr className="bg-slate-950/80 font-bold text-slate-300 text-xs border-y border-slate-800">
                  <td colSpan={comparedPhones.length + 1} className="py-2 px-4 uppercase tracking-wider text-emerald-400">
                    BATTERY &amp; CHARGING
                  </td>
                </tr>
                {renderComparisonRow('Battery Capacity', (p) => p.detailedSpecs.battery.capacity)}
                {renderComparisonRow('Wired Fast Charging', (p) => p.detailedSpecs.battery.charging)}
                {renderComparisonRow('Wireless Charging', (p) => p.detailedSpecs.battery.wirelessCharging)}

                {/* SECTION: CONNECTIVITY & BUILD */}
                <tr className="bg-slate-950/80 font-bold text-slate-300 text-xs border-y border-slate-800">
                  <td colSpan={comparedPhones.length + 1} className="py-2 px-4 uppercase tracking-wider text-emerald-400">
                    CONNECTIVITY &amp; BODY
                  </td>
                </tr>
                {renderComparisonRow('5G Compatibility', (p) => p.detailedSpecs.network.bands5g)}
                {renderComparisonRow('Dimensions & Weight', (p) => `${p.detailedSpecs.body.dimensions} · ${p.detailedSpecs.body.weight}`)}
                {renderComparisonRow('Water / Dust Resistance', (p) => p.detailedSpecs.body.waterResistance)}
                {renderComparisonRow('NFC & Audio Jack', (p) => `NFC: ${p.detailedSpecs.connectivity.nfc} · Jack: ${p.detailedSpecs.sound.jack35mm}`)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Device Modal Dialog */}
      {searchPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Select Phone to Add</h3>
              <button 
                onClick={() => setSearchPickerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              autoFocus
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search phone or brand..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-emerald-500 outline-none"
            />

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {filteredAvailable.map((phone) => (
                <div
                  key={phone.id}
                  onClick={() => {
                    addToCompare(phone.id);
                    setSearchPickerOpen(false);
                    setPickerSearch('');
                  }}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-emerald-500/50 flex items-center justify-between cursor-pointer group transition-colors"
                >
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400">{phone.brand}</span>
                    <h5 className="font-semibold text-white text-xs group-hover:text-emerald-400">
                      {phone.name}
                    </h5>
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      {formatNaira(phone.priceNGN)}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded">
                    + Add
                  </span>
                </div>
              ))}
              {filteredAvailable.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No matching phones found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
