import { useApp } from '../../context/AppContext';
import { 
  Camera, 
  BatteryCharging, 
  Wifi, 
  Gamepad2, 
  Crown, 
  ArrowRight 
} from 'lucide-react';

export default function BestCategoriesSection() {
  const { setCategoryPreset, setActiveTab, setSelectedPhone, setSelectedArticle, triggerNavigation } = useApp();

  const categories = [
    {
      id: 'best-camera',
      title: 'Mobile Photography',
      description: 'Sony IMX890, 200MP sensors, optical zoom, and studio-grade low-light portraits.',
      icon: Camera,
      iconColor: 'text-emerald-400',
      gradientBg: 'from-[#03130d] via-[#062417] to-[#0a3824]',
      borderColor: 'border-emerald-900/60 hover:border-emerald-500/60',
      glowColor: 'bg-emerald-500'
    },
    {
      id: 'best-battery',
      title: 'Battery & Charging',
      description: '5500 mAh+ multi-day endurance with 70W - 120W ultra-fast wired and wireless charging.',
      icon: BatteryCharging,
      iconColor: 'text-amber-400',
      gradientBg: 'from-[#0c0803] via-[#1a1104] to-[#2a1b06]',
      borderColor: 'border-amber-900/60 hover:border-amber-500/60',
      glowColor: 'bg-amber-500'
    },
    {
      id: 'best-5g',
      title: '5G & Connectivity',
      description: 'Sub-6GHz and mmWave gigabit cellular speeds across verified carrier bands.',
      icon: Wifi,
      iconColor: 'text-blue-400',
      gradientBg: 'from-[#030d1d] via-[#061936] to-[#092954]',
      borderColor: 'border-blue-900/60 hover:border-blue-500/60',
      glowColor: 'bg-blue-500'
    },
    {
      id: 'best-gaming',
      title: 'Best Gaming Phones',
      description: '144Hz AMOLED displays, liquid vapor cooling, and sustained peak frame rates.',
      icon: Gamepad2,
      iconColor: 'text-purple-400',
      gradientBg: 'from-[#11041b] via-[#210735] to-[#340b52]',
      borderColor: 'border-purple-900/60 hover:border-purple-500/60',
      glowColor: 'bg-purple-500'
    },
    {
      id: 'top-rated',
      title: 'Top Premium Flagships',
      description: 'Grade 5 Titanium builds, 7-year software upgrades, and benchmark performance.',
      icon: Crown,
      iconColor: 'text-yellow-400',
      gradientBg: 'from-[#08071c] via-[#10103b] to-[#1c1c5e]',
      borderColor: 'border-indigo-900/60 hover:border-indigo-500/60',
      glowColor: 'bg-indigo-500'
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Space_Grotesk']">
            Buying Guides
          </h2>
        </div>
        <button
          onClick={() => {
            triggerNavigation(() => {
              setSelectedPhone(null);
              setSelectedArticle(null);
              window.dispatchEvent(new CustomEvent('gsmscope:reset-guide'));
              setActiveTab('guides');
              window.scrollTo({ top: 0, behavior: 'instant' });
            });
          }}
          className="text-xs font-normal text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
        >
          <span>All Guides</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={() => {
                triggerNavigation(() => {
                  setCategoryPreset(cat.id);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                });
              }}
              className={`group relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 overflow-hidden border ${cat.borderColor} bg-gradient-to-r ${cat.gradientBg} shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 ${
                idx === categories.length - 1 && categories.length % 2 !== 0 ? 'md:col-span-2' : ''
              }`}
            >
              {/* Ambient Corner Glow Blur */}
              <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity ${cat.glowColor}`} />

              {/* Left Content Column */}
              <div className="relative z-10 flex-1 min-w-0 pr-1 sm:pr-3 space-y-2">
                <h3 className="font-bold text-white text-[17px] sm:text-[18px] font-['Space_Grotesk'] tracking-tight leading-snug group-hover:text-emerald-300 transition-colors">
                  {cat.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>

                <div className="pt-1.5 flex items-center gap-1.5 text-xs sm:text-sm font-normal text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  <span>Explore Guides</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Right Visual Icon Showcase */}
              <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl group-hover:scale-105 group-hover:border-white/25 transition-all duration-300">
                <Icon className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 ${cat.iconColor} group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]`} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
