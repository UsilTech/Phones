import { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

interface NotableBrand {
  name: string;
  slug?: string;
}

// Ordered strictly with user requested top 10 first:
// Apple, Google, Xiaomi, OnePlus, Honor, Oppo, TCL, Huawei, Samsung, Motorola
// Followed by the remaining catalog brands
const NOTABLE_BRANDS: NotableBrand[] = [
  { name: 'Apple', slug: 'apple' },
  { name: 'Google', slug: 'google' },
  { name: 'Xiaomi', slug: 'xiaomi' },
  { name: 'OnePlus', slug: 'oneplus' },
  { name: 'Honor', slug: 'honor' },
  { name: 'Oppo', slug: 'oppo' },
  { name: 'TCL', slug: 'tcl' },
  { name: 'Huawei', slug: 'huawei' },
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Motorola', slug: 'motorola' },
  // Remaining brands
  { name: 'Alcatel', slug: 'alcatel' },
  { name: 'Asus', slug: 'asus' },
  { name: 'Infinix', slug: 'infinix' },
  { name: 'IQOO', slug: 'iqoo' },
  { name: 'Itel', slug: 'itel' },
  { name: 'Oscal', slug: 'oscal' },
  { name: 'Oukitel', slug: 'oukitel' },
  { name: 'Realme', slug: 'realme' },
  { name: 'Sony', slug: 'sony' },
  { name: 'Tecno', slug: 'tecno' },
  { name: 'Umidigi', slug: 'umidigi' },
  { name: 'Vivo', slug: 'vivo' },
  { name: 'ZTE', slug: 'zte' }
];

export default function BrandSliderSection() {
  const {
    brands,
    selectedBrand,
    activeTab,
    setSelectedBrand,
    setActiveTab,
    setSelectedPhone,
    setSelectedArticle,
    triggerNavigation
  } = useApp();
  const sliderRef = useRef<HTMLDivElement>(null);

  // Merge live brands from AppContext with NOTABLE_BRANDS priority order so any newly added 24th+ brand in Admin Dashboard is immediately shown
  const defaultBrandSlugs = new Set(
    NOTABLE_BRANDS.map((nb) => (nb.slug || nb.name).toLowerCase())
  );
  const defaultBrandNames = new Set(
    NOTABLE_BRANDS.map((nb) => nb.name.toLowerCase())
  );

  // Custom brands added via Admin Dashboard (beyond the initial 23 seed brands)
  const customAddedBrands = brands.filter(
    (b) =>
      !defaultBrandNames.has(b.name.toLowerCase()) &&
      !defaultBrandSlugs.has((b.slug || '').toLowerCase())
  );

  // Default notable brands enriched with live brand record (and only included if not deleted in Admin)
  const activeNotableBrands = NOTABLE_BRANDS.map((nb) => {
    const matched = brands.find(
      (b) =>
        b.name.toLowerCase() === nb.name.toLowerCase() ||
        (nb.slug && b.slug.toLowerCase() === nb.slug.toLowerCase())
    );
    if (brands.length > 0 && !matched) return null;
    return matched || {
      id: nb.slug || nb.name.toLowerCase(),
      name: nb.name,
      slug: nb.slug || nb.name.toLowerCase(),
      logoUrl: undefined,
    };
  }).filter((b): b is NonNullable<typeof b> => Boolean(b));

  const sliderBrands = [...activeNotableBrands, ...customAddedBrands];

  const handleBrandClick = (bName: string) => {
    triggerNavigation(() => {
      if (setSelectedPhone) setSelectedPhone(null);
      if (setSelectedArticle) setSelectedArticle(null);
      const matched = brands.find(
        (b) => b.name.toLowerCase() === bName.toLowerCase() || b.slug.toLowerCase() === bName.toLowerCase()
      );
      const slug = bName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const brandToOpen = matched || {
        id: slug,
        name: bName,
        slug,
        logoLetter: bName.charAt(0).toUpperCase(),
        accentBg: 'from-emerald-900/40 to-slate-900',
        country: 'Global',
        description: `Explore ${bName} smartphones with complete specifications, reviews, comparisons, and market prices.`,
        officialPresenceInNigeria: 'Authorized Retail & Distribution',
        globalPresence: 'Global Distribution',
        popularSeries: [`${bName} Series`],
        warrantyPartner: 'Authorized Service Network',
      };
      setSelectedBrand(brandToOpen);
      setActiveTab('brands');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = direction === 'left' ? -260 : 260;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs relative select-none">
      <div className="w-full max-w-full px-2 sm:px-4 py-2 flex items-center gap-1.5">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          aria-label="Scroll left brands"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal Slider Track - Brand Logos + Names */}
        <div
          ref={sliderRef}
          className="flex-1 flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth px-2 py-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sliderBrands.map((b) => {
            const isCurrentBrand =
              activeTab === 'brands' &&
              selectedBrand?.name.toLowerCase() === b.name.toLowerCase();
            return (
              <button
                key={b.id || b.name}
                onClick={() => handleBrandClick(b.name)}
                className={`shrink-0 flex items-center gap-2 py-1 px-2.5 rounded-lg transition-all cursor-pointer font-extrabold text-sm sm:text-[15px] font-['Space_Grotesk'] tracking-tight whitespace-nowrap ${
                  isCurrentBrand
                    ? 'bg-[#00a950] text-white shadow-xs'
                    : 'text-[#00a950] hover:text-[#00853f] dark:hover:text-[#2bd97b] hover:bg-[#00a950]/10'
                }`}
              >
                <BrandLogo name={b.name} logoUrl={b.logoUrl} className="w-4 h-4" />
                <span>{b.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          aria-label="Scroll right brands"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
