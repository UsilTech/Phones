import { useApp } from '../../context/AppContext';
import { 
  Camera, 
  BatteryCharging, 
  Gamepad2, 
  Wifi, 
  Banknote, 
  Award, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function BestCategoriesSection() {
  const { setCategoryPreset, setActiveTab } = useApp();

  const categories = [
    {
      id: 'under-100k',
      title: 'Best Under ₦100,000',
      description: 'Maximum entry-level value with 5000 mAh batteries, type-C charging, and 90Hz displays.',
      icon: Banknote,
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      count: 'Tecno Pop 8 & friends'
    },
    {
      id: 'under-200k',
      title: 'Best Under ₦200,000',
      description: 'The sweet spot for Nigerian students and budget power-users. Fast 33W charge & 108MP sensors.',
      icon: Banknote,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      count: 'Infinix Hot 40 Pro class'
    },
    {
      id: 'under-300k',
      title: 'Best Under ₦300,000',
      description: 'Curved AMOLED screens, 256GB storage, and high-performance Helio G99 chips.',
      icon: Banknote,
      accent: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      count: 'Tecno Spark 20 Pro+ class'
    },
    {
      id: 'best-camera',
      title: 'Best Camera Phones',
      description: 'Sony IMX890, 200MP ISOCELL sensors, OIS stabilization, and advanced night portraits.',
      icon: Camera,
      accent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      count: 'Galaxy S24 Ultra & Camon 30 Pro'
    },
    {
      id: 'best-5g',
      title: 'Best 5G Smartphones',
      description: 'Verified compatibility with MTN 5G and Airtel 5G across Lagos, Abuja, and Port Harcourt.',
      icon: Wifi,
      accent: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      count: 'Full Band n78 / n1 / n3'
    },
    {
      id: 'best-battery',
      title: 'Best Battery & Fast Charge',
      description: '5000 mAh+ endurance with 70W - 120W wired and wireless MagCharge for Nigerian power realities.',
      icon: BatteryCharging,
      accent: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      count: '0-100% in under 30 mins'
    },
    {
      id: 'best-gaming',
      title: 'Best Gaming Phones',
      description: '120Hz-144Hz AMOLED screens, liquid cooling chambers, and Snapdragon 8 Gen 3 / Dimensity 8200.',
      icon: Gamepad2,
      accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      count: 'High frame-rate PUBG & CODM'
    },
    {
      id: 'best-phones',
      title: 'Top Premium Flagships',
      description: 'Titanium builds, 7-year OS updates, 4K 120fps Dolby Vision, and industry benchmark performance.',
      icon: Award,
      accent: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      count: 'iPhone 16 Pro Max & S24 Ultra'
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-['Space_Grotesk']">
            Buying Guides
          </h2>
        </div>
        <button
          onClick={() => setActiveTab('phones')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
        >
          <span>All Phones</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={() => setCategoryPreset(cat.id)}
              className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${cat.accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Filter →
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1 font-['Space_Grotesk']">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>{cat.count}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
