import { useEffect, useMemo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface BreadcrumbItem {
  label: string;
  canonicalPath: string;
  onClick?: () => void;
  isCurrent?: boolean;
}

export default function Breadcrumbs() {
  const {
    activeTab,
    setActiveTab,
    selectedPhone,
    setSelectedPhone,
    selectedArticle,
    setSelectedArticle,
    selectedBrand,
    setSelectedBrand,
    brands,
    filterState,
    resetFilters,
    triggerNavigation,
  } = useApp();

  const navigateHome = () => {
    triggerNavigation(() => {
      setSelectedPhone(null);
      setSelectedArticle(null);
      setSelectedBrand(null);
      setActiveTab('home');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  };

  const navigateToBrandsDirectory = () => {
    triggerNavigation(() => {
      setSelectedPhone(null);
      setSelectedArticle(null);
      setSelectedBrand(null);
      setActiveTab('brands');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  };

  const navigateToBrand = (brandName: string) => {
    triggerNavigation(() => {
      setSelectedPhone(null);
      setSelectedArticle(null);
      const matched = brands.find(
        (b) =>
          b.name.toLowerCase() === brandName.toLowerCase() ||
          b.slug.toLowerCase() === brandName.toLowerCase()
      );
      const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const brandToOpen = matched || {
        id: slug,
        name: brandName,
        slug,
        logoLetter: brandName.charAt(0).toUpperCase(),
        accentBg: 'from-emerald-900/40 to-slate-900',
        country: 'Global',
        description: `Explore ${brandName} smartphones with complete specifications, reviews, comparisons, and market prices.`,
        officialPresenceInNigeria: 'Authorized Retail & Distribution',
        globalPresence: 'Global Distribution',
        popularSeries: [`${brandName} Series`],
        warrantyPartner: 'Authorized Service Network',
      };
      setSelectedBrand(brandToOpen);
      setActiveTab('brands');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  };

  const items = useMemo<BreadcrumbItem[]>(() => {
    const list: BreadcrumbItem[] = [
      {
        label: 'Home',
        canonicalPath: '/',
        onClick: navigateHome,
      },
    ];

    // 1. Viewing a specific Article or Device Review Page
    if (selectedArticle) {
      const isReviewArticle =
        activeTab === 'reviews' ||
        selectedArticle.category?.toLowerCase().includes('review') ||
        selectedArticle.title?.toLowerCase().includes('review') ||
        selectedArticle.id?.startsWith('review-');

      if (isReviewArticle) {
        list.push({
          label: 'Reviews',
          canonicalPath: '/?tab=reviews',
          onClick: () => {
            triggerNavigation(() => {
              setSelectedArticle(null);
              setSelectedPhone(null);
              setActiveTab('reviews');
              window.scrollTo({ top: 0, behavior: 'instant' });
            });
          },
        });
      } else {
        list.push({
          label: 'News',
          canonicalPath: '/?tab=news',
          onClick: () => {
            triggerNavigation(() => {
              setSelectedArticle(null);
              setSelectedPhone(null);
              setActiveTab('news');
              window.scrollTo({ top: 0, behavior: 'instant' });
            });
          },
        });
      }

      list.push({
        label: selectedArticle.title,
        canonicalPath: `/?article=${encodeURIComponent(selectedArticle.slug || selectedArticle.id)}`,
        isCurrent: true,
      });

      return list;
    }

    // 2. Viewing a specific Phone Detail Page (e.g., Home > Brands > Apple > iPhone 16 Pro Max)
    if (selectedPhone) {
      list.push({
        label: 'Brands',
        canonicalPath: '/?tab=brands',
        onClick: navigateToBrandsDirectory,
      });

      if (selectedPhone.brand) {
        list.push({
          label: selectedPhone.brand,
          canonicalPath: `/?tab=brands&brand=${encodeURIComponent(selectedPhone.brand)}`,
          onClick: () => navigateToBrand(selectedPhone.brand),
        });
      }

      list.push({
        label: selectedPhone.name,
        canonicalPath: `/?phone=${encodeURIComponent((selectedPhone as any).slug || selectedPhone.id)}`,
        isCurrent: true,
      });

      return list;
    }

    // 3. Viewing Brands Tab (e.g., Home > Brands or Home > Brands > Apple)
    if (activeTab === 'brands') {
      if (selectedBrand) {
        list.push({
          label: 'Brands',
          canonicalPath: '/?tab=brands',
          onClick: navigateToBrandsDirectory,
        });
        list.push({
          label: selectedBrand.name,
          canonicalPath: `/?tab=brands&brand=${encodeURIComponent(selectedBrand.name)}`,
          isCurrent: true,
        });
      } else {
        list.push({
          label: 'Brands',
          canonicalPath: '/?tab=brands',
          isCurrent: true,
        });
      }
      return list;
    }

    // 4. Viewing Phones Database Tab
    if (activeTab === 'phones') {
      const hasSubFilter =
        Boolean(filterState.categoryPreset) ||
        filterState.selectedBrands.length === 1 ||
        Boolean(filterState.searchQuery.trim());

      if (hasSubFilter) {
        list.push({
          label: 'Phones',
          canonicalPath: '/?tab=phones',
          onClick: () => {
            triggerNavigation(() => {
              resetFilters();
              window.scrollTo({ top: 0, behavior: 'instant' });
            });
          },
        });

        if (filterState.categoryPreset) {
          list.push({
            label: filterState.categoryPreset,
            canonicalPath: `/?tab=phones&preset=${encodeURIComponent(filterState.categoryPreset)}`,
            isCurrent: true,
          });
        } else if (filterState.selectedBrands.length === 1) {
          list.push({
            label: `${filterState.selectedBrands[0]} Phones`,
            canonicalPath: `/?tab=phones&brand=${encodeURIComponent(filterState.selectedBrands[0])}`,
            isCurrent: true,
          });
        } else if (filterState.searchQuery.trim()) {
          list.push({
            label: `Search: "${filterState.searchQuery.trim()}"`,
            canonicalPath: `/?tab=phones&q=${encodeURIComponent(filterState.searchQuery.trim())}`,
            isCurrent: true,
          });
        }
      } else {
        list.push({
          label: 'Phones',
          canonicalPath: '/?tab=phones',
          isCurrent: true,
        });
      }
      return list;
    }

    // 5. Other Top-Level Tabs
    const tabLabels: Record<string, { label: string; path: string }> = {
      'best-phones': { label: 'Best Phones', path: '/?tab=best-phones' },
      compare: { label: 'Compare Specs', path: '/?tab=compare' },
      news: { label: 'News', path: '/?tab=news' },
      reviews: { label: 'Reviews', path: '/?tab=reviews' },
      'user-reviews': { label: 'User Reviews', path: '/?tab=user-reviews' },
      guides: { label: 'Buying Guides', path: '/?tab=guides' },
      about: { label: 'About Us', path: '/?tab=about' },
      contact: { label: 'Contact Us', path: '/?tab=contact' },
      advertise: { label: 'Advertise', path: '/?tab=advertise' },
      privacy: { label: 'Privacy Policy', path: '/?tab=privacy' },
      terms: { label: 'Terms of Service', path: '/?tab=terms' },
    };

    if (activeTab !== 'home' && tabLabels[activeTab]) {
      list.push({
        label: tabLabels[activeTab].label,
        canonicalPath: tabLabels[activeTab].path,
        onClick: () => {
          triggerNavigation(() => {
            setSelectedPhone(null);
            setSelectedArticle(null);
            window.dispatchEvent(new CustomEvent('gsmscope:reset-guide'));
            window.scrollTo({ top: 0, behavior: 'instant' });
          });
        },
        isCurrent: true,
      });
      return list;
    }

    // Default Home state
    list[0].isCurrent = true;
    return list;
  }, [
    activeTab,
    selectedPhone,
    selectedArticle,
    selectedBrand,
    filterState.categoryPreset,
    filterState.selectedBrands,
    filterState.searchQuery,
    brands,
  ]);

  // Inject Schema.org BreadcrumbList JSON-LD structured data for SEO
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gsmscope.com';
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.label,
        item: `${origin}${item.canonicalPath}`,
      })),
    };

    let scriptTag = document.getElementById('json-ld-breadcrumbs') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-breadcrumbs';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(breadcrumbSchema);
  }, [items]);

  // Only render the visual breadcrumb bar when deeper than root Home, or show full path
  if (items.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="w-full bg-slate-50/90 dark:bg-slate-900/75 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs transition-colors"
    >
      <div className="w-full max-w-full px-[calc(1rem-5px)] sm:px-[calc(2rem-5px)] lg:px-[calc(3rem-5px)] py-2">
        <ol
          itemScope
          itemType="https://schema.org/BreadcrumbList"
          className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
        >
          {items.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;

            return (
              <li
                key={`${item.canonicalPath}-${index}`}
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
                className="flex items-center gap-1.5 min-w-0"
              >
                {!isFirst && (
                  <ChevronRight
                    className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0"
                    aria-hidden="true"
                  />
                )}

                {isLast || !item.onClick ? (
                  <span
                    itemProp="name"
                    aria-current={isLast ? 'page' : undefined}
                    className="font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-[220px] sm:max-w-[360px] md:max-w-[520px]"
                  >
                    {item.label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="inline-flex items-center gap-1 font-normal text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {isFirst && <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                    <span itemProp="name">{item.label}</span>
                  </button>
                )}

                <meta itemProp="position" content={String(index + 1)} />
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
