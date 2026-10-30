import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function JsonLdScript() {
  const {
    activeTab,
    selectedPhone,
    selectedArticle,
    selectedBrand,
    phones,
    brands,
    articles,
    reviews,
    compareList,
    filterState,
  } = useApp();

  useEffect(() => {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://gsmscope.com';

    const orgId = `${origin}/#organization`;
    const websiteId = `${origin}/#website`;

    const toAbsoluteUrl = (raw?: string) => {
      if (!raw) return `${origin}/assets/aistudio/GsmScope_header_logo_dark.webp`;
      if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
      return `${origin}${raw.startsWith('/') ? raw : `/${raw}`}`;
    };

    const organizationNode: Record<string, unknown> = {
      '@type': 'Organization',
      '@id': orgId,
      name: 'GsmScope',
      url: `${origin}/`,
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl('/assets/aistudio/GsmScope_header_logo_dark.webp'),
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Sokoto',
        addressCountry: 'NG',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+234-800-GSMSCOPE',
          contactType: 'customer support',
          email: 'hello@gsmscope.com',
          availableLanguage: ['English'],
        },
      ],
    };

    const webSiteNode: Record<string, unknown> = {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${origin}/`,
      name: 'GsmScope — Global Phone Specs, Reviews and Prices',
      description:
        'Browse smartphone specifications with global USD and local prices, compare devices, read technology news and find the best phones for every budget.',
      publisher: { '@id': orgId },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${origin}/?tab=phones&q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };

    const graph: Record<string, unknown>[] = [organizationNode, webSiteNode];

    if (selectedPhone) {
      const phoneUrl = `${origin}/?phone=${encodeURIComponent(selectedPhone.id)}`;
      const availabilityUrl =
        selectedPhone.marketStatus === 'Pre-order'
          ? 'https://schema.org/PreOrder'
          : selectedPhone.marketStatus === 'Coming Soon' || selectedPhone.marketStatus === 'Rumored'
            ? 'https://schema.org/PreSale'
            : 'https://schema.org/InStock';

      const approvedReviews = reviews.filter(
        (r) => r.phoneId === selectedPhone.id && r.status === 'approved'
      );

      // Rich BreadcrumbList for Phone Detail Page
      graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${phoneUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${origin}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Phones',
            item: `${origin}/?tab=phones`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: selectedPhone.brand,
            item: `${origin}/?tab=brands&brand=${encodeURIComponent(selectedPhone.brand)}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: selectedPhone.name,
            item: phoneUrl,
          },
        ],
      });

      const additionalProperties = [
        {
          '@type': 'PropertyValue',
          name: 'Display',
          value: `${selectedPhone.detailedSpecs?.display?.type || selectedPhone.keyHighlights?.display || ''} (${selectedPhone.detailedSpecs?.display?.size || ''}, ${selectedPhone.detailedSpecs?.display?.refreshRate || ''})`.trim(),
        },
        {
          '@type': 'PropertyValue',
          name: 'Processor / Chipset',
          value:
            selectedPhone.detailedSpecs?.platform?.chipset ||
            selectedPhone.keyHighlights?.processor ||
            '',
        },
        {
          '@type': 'PropertyValue',
          name: 'RAM',
          value:
            selectedPhone.detailedSpecs?.memory?.ramVariants?.join(', ') ||
            selectedPhone.keyHighlights?.ram ||
            '',
        },
        {
          '@type': 'PropertyValue',
          name: 'Internal Storage',
          value:
            selectedPhone.detailedSpecs?.memory?.storageVariants?.join(', ') ||
            selectedPhone.keyHighlights?.storage ||
            '',
        },
        {
          '@type': 'PropertyValue',
          name: 'Main Camera',
          value:
            selectedPhone.detailedSpecs?.mainCamera?.setup ||
            selectedPhone.keyHighlights?.camera ||
            '',
        },
        {
          '@type': 'PropertyValue',
          name: 'Selfie Camera',
          value: selectedPhone.detailedSpecs?.selfieCamera?.setup || '',
        },
        {
          '@type': 'PropertyValue',
          name: 'Battery Capacity',
          value:
            selectedPhone.detailedSpecs?.battery?.capacity ||
            selectedPhone.keyHighlights?.battery ||
            '',
        },
        {
          '@type': 'PropertyValue',
          name: 'Charging Speed',
          value:
            selectedPhone.detailedSpecs?.battery?.charging ||
            selectedPhone.keyHighlights?.charging ||
            '',
        },
        {
          '@type': 'PropertyValue',
          name: 'Operating System',
          value:
            selectedPhone.detailedSpecs?.platform?.os ||
            selectedPhone.keyHighlights?.os ||
            '',
        },
        {
          '@type': 'PropertyValue',
          name: '5G Support',
          value: selectedPhone.keyHighlights?.network5g ? 'Yes' : 'No',
        },
        {
          '@type': 'PropertyValue',
          name: 'AnTuTu Score',
          value: selectedPhone.detailedSpecs?.platform?.antutuScore || '',
        },
        {
          '@type': 'PropertyValue',
          name: 'Dimensions & Weight',
          value: `${selectedPhone.detailedSpecs?.body?.dimensions || ''} / ${selectedPhone.detailedSpecs?.body?.weight || ''}`.trim(),
        },
      ].filter((prop) => prop.value && prop.value !== '/');

      const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;
      const productImages = (
        selectedPhone.images && selectedPhone.images.length > 0
          ? selectedPhone.images
          : [selectedPhone.image]
      ).map((img) => toAbsoluteUrl(img));

      const productSchema: Record<string, unknown> = {
        '@type': 'Product',
        '@id': `${phoneUrl}#product`,
        name: selectedPhone.name,
        sku: selectedPhone.id,
        mpn: selectedPhone.modelNumber || selectedPhone.id,
        category: 'Smartphones',
        releaseDate: selectedPhone.releaseDate || String(selectedPhone.releaseYear),
        image: productImages,
        description:
          selectedPhone.seoDescription ||
          `${selectedPhone.name} full smartphone specifications, global price ($${selectedPhone.priceUSD} / ₦${selectedPhone.priceNGN.toLocaleString()}), ${selectedPhone.keyHighlights?.display || ''} display, ${selectedPhone.keyHighlights?.processor || ''} processor, ${selectedPhone.keyHighlights?.camera || ''} camera, and ${selectedPhone.keyHighlights?.battery || ''} battery.`,
        brand: {
          '@type': 'Brand',
          name: selectedPhone.brand,
        },
        offers: [
          {
            '@type': 'Offer',
            url: phoneUrl,
            priceCurrency: 'USD',
            price: selectedPhone.priceUSD,
            priceValidUntil,
            availability: availabilityUrl,
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@id': orgId },
          },
          {
            '@type': 'Offer',
            url: phoneUrl,
            priceCurrency: 'NGN',
            price: selectedPhone.priceNGN,
            priceValidUntil,
            availability: availabilityUrl,
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@id': orgId },
          },
        ],
        additionalProperty: additionalProperties,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: selectedPhone.rating || 4.5,
          bestRating: 5,
          worstRating: 1,
          reviewCount: Math.max(selectedPhone.reviewsCount || 1, approvedReviews.length, 1),
        },
        ...(approvedReviews.length > 0
          ? {
              review: approvedReviews.slice(0, 10).map((r) => ({
                '@type': 'Review',
                author: {
                  '@type': 'Person',
                  name: r.userName,
                },
                datePublished: r.date,
                name: r.title,
                reviewBody: r.comment,
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: r.rating,
                  bestRating: 5,
                  worstRating: 1,
                },
              })),
            }
          : {}),
      };

      graph.push(productSchema);

      // FAQPage Schema for Phone Detail Rich Results
      graph.push({
        '@type': 'FAQPage',
        '@id': `${phoneUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is the price of ${selectedPhone.name} in USD and NGN?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${selectedPhone.name} is priced at approximately $${selectedPhone.priceUSD.toLocaleString()} USD (₦${selectedPhone.priceNGN.toLocaleString()} NGN). Market status: ${selectedPhone.marketStatus || 'Available'}.`,
            },
          },
          {
            '@type': 'Question',
            name: `What processor, RAM, and storage does ${selectedPhone.name} have?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${selectedPhone.name} is powered by the ${selectedPhone.detailedSpecs?.platform?.chipset || selectedPhone.keyHighlights?.processor} chipset paired with ${selectedPhone.keyHighlights?.ram} RAM and ${selectedPhone.keyHighlights?.storage} storage running ${selectedPhone.detailedSpecs?.platform?.os || selectedPhone.keyHighlights?.os}.`,
            },
          },
          {
            '@type': 'Question',
            name: `What are the camera and battery specifications of ${selectedPhone.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${selectedPhone.name} features a ${selectedPhone.detailedSpecs?.mainCamera?.setup || selectedPhone.keyHighlights?.camera} main camera and a ${selectedPhone.detailedSpecs?.battery?.capacity || selectedPhone.keyHighlights?.battery} battery with ${selectedPhone.detailedSpecs?.battery?.charging || selectedPhone.keyHighlights?.charging || 'fast charging'}.`,
            },
          },
        ],
      });
    } else if (selectedArticle) {
      const articleUrl = `${origin}/?article=${encodeURIComponent(selectedArticle.slug || selectedArticle.id)}`;
      const isReview =
        selectedArticle.category?.toLowerCase().includes('review') ||
        selectedArticle.title?.toLowerCase().includes('review');
      const relatedPhone = phones.find((p) => selectedArticle.relatedPhoneIds?.includes(p.id));

      // Rich BreadcrumbList for Article Detail Page
      graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${articleUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${origin}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: isReview ? 'Reviews' : 'News & Guides',
            item: `${origin}/?tab=${isReview ? 'reviews' : 'news'}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: selectedArticle.title,
            item: articleUrl,
          },
        ],
      });

      const articleSchema: Record<string, unknown> = {
        '@type': isReview ? 'TechArticle' : 'NewsArticle',
        '@id': `${articleUrl}#article`,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleUrl,
        },
        headline: selectedArticle.seoTitle || selectedArticle.title,
        description: selectedArticle.seoDescription || selectedArticle.summary,
        image: [selectedArticle.coverImage || relatedPhone?.image]
          .filter(Boolean)
          .map((img) => toAbsoluteUrl(img)),
        datePublished: selectedArticle.date,
        dateModified: selectedArticle.date,
        articleSection: selectedArticle.category,
        keywords: selectedArticle.seoKeywords || selectedArticle.tags?.join(', ') || selectedArticle.category,
        author: {
          '@type': 'Person',
          name: selectedArticle.author?.name || 'GsmScope Editorial Team',
          jobTitle: selectedArticle.author?.role || 'Senior Tech Editor',
        },
        publisher: { '@id': orgId },
      };

      graph.push(articleSchema);

      if (isReview && relatedPhone) {
        graph.push({
          '@type': 'Review',
          '@id': `${articleUrl}#editorial-review`,
          name: selectedArticle.title,
          reviewBody: selectedArticle.summary,
          datePublished: selectedArticle.date,
          author: {
            '@type': 'Person',
            name: selectedArticle.author?.name || 'GsmScope Editorial Team',
          },
          publisher: { '@id': orgId },
          itemReviewed: {
            '@type': 'Product',
            name: relatedPhone.name,
            image: toAbsoluteUrl(relatedPhone.image),
            brand: {
              '@type': 'Brand',
              name: relatedPhone.brand,
            },
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: relatedPhone.rating || 4.5,
            bestRating: 5,
            worstRating: 1,
          },
        });
      }
    } else if (activeTab === 'brands') {
      if (selectedBrand) {
        const brandPhones = phones.filter(
          (p) => p.brand.toLowerCase() === selectedBrand.name.toLowerCase()
        );
        const brandUrl = `${origin}/?tab=brands&brand=${encodeURIComponent(selectedBrand.name)}`;
        graph.push({
          '@type': 'CollectionPage',
          '@id': `${brandUrl}#collection`,
          url: brandUrl,
          name: `${selectedBrand.name} Smartphones — Full Specs & Prices`,
          description: selectedBrand.description,
          about: {
            '@type': 'Brand',
            name: selectedBrand.name,
            description: selectedBrand.description,
          },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: brandPhones.length,
            itemListElement: brandPhones.slice(0, 20).map((phone, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${origin}/?phone=${encodeURIComponent(phone.id)}`,
              name: phone.name,
            })),
          },
        });
      } else {
        const brandsUrl = `${origin}/?tab=brands`;
        graph.push({
          '@type': 'CollectionPage',
          '@id': `${brandsUrl}#collection`,
          url: brandsUrl,
          name: 'All Mobile Phone Brands Directory — GsmScope',
          description: 'Explore smartphone manufacturers, popular device series, and full specifications.',
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: brands.length,
            itemListElement: brands.map((b, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${origin}/?tab=brands&brand=${encodeURIComponent(b.name)}`,
              name: b.name,
            })),
          },
        });
      }
    } else if (activeTab === 'phones' || activeTab === 'best-phones') {
      const pageUrl = `${origin}/?tab=${activeTab}`;
      graph.push({
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#collection`,
        url: pageUrl,
        name:
          activeTab === 'best-phones'
            ? 'Best Smartphones by Category & Budget — GsmScope'
            : filterState.categoryPreset
              ? `${filterState.categoryPreset} — GsmScope`
              : 'World Mobile Phone Database — GsmScope',
        description:
          'Explore the complete GsmScope smartphone database with full technical specifications, 5G bands, battery ratings, and live global prices.',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: phones.length,
          itemListElement: phones.slice(0, 15).map((phone, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${origin}/?phone=${encodeURIComponent(phone.id)}`,
            name: phone.name,
          })),
        },
      });
    } else if (activeTab === 'compare') {
      const comparePhones = phones.filter((p) => compareList.includes(p.id));
      graph.push({
        '@type': 'WebPage',
        '@id': `${origin}/?tab=compare#webpage`,
        url: `${origin}/?tab=compare`,
        name:
          comparePhones.length > 0
            ? `Compare ${comparePhones.map((p) => p.name).join(' vs ')} — GsmScope`
            : 'Side-by-Side Smartphone Specs Comparison Tool — GsmScope',
        description:
          'Compare up to 3 smartphones side-by-side across display, chipset, camera, battery, 5G bands, and global prices.',
      });
    } else if (activeTab === 'news' || activeTab === 'reviews' || activeTab === 'guides') {
      const pageUrl = `${origin}/?tab=${activeTab}`;
      graph.push({
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#collection`,
        url: pageUrl,
        name:
          activeTab === 'reviews'
            ? 'In-Depth Smartphone Hardware Reviews — GsmScope'
            : activeTab === 'guides'
              ? 'Smartphone Buying Guides & Recommendations — GsmScope'
              : 'Latest Mobile Technology & Smartphone News — GsmScope',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: articles.length,
          itemListElement: articles.slice(0, 15).map((art, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${origin}/?article=${encodeURIComponent(art.slug || art.id)}`,
            name: art.title,
          })),
        },
      });
    } else if (activeTab === 'about') {
      graph.push({
        '@type': 'AboutPage',
        '@id': `${origin}/?tab=about#aboutpage`,
        url: `${origin}/?tab=about`,
        name: 'About GsmScope — Global Mobile Phone Specs & Price Database',
        description:
          'Learn how GsmScope tracks smartphone specifications, hardware benchmarks, reviews, and global retail pricing.',
        mainEntity: { '@id': orgId },
      });
    } else if (activeTab === 'contact') {
      graph.push({
        '@type': 'ContactPage',
        '@id': `${origin}/?tab=contact#contactpage`,
        url: `${origin}/?tab=contact`,
        name: 'Contact GsmScope — Editorial, Support & Partnerships',
        description:
          'Get in touch with the GsmScope editorial and technical specification team in Sokoto, Nigeria.',
        mainEntity: { '@id': orgId },
      });
    } else {
      // Home or general view: include WebApplication + Trending ItemList
      graph.push({
        '@type': 'WebApplication',
        '@id': `${origin}/#webapp`,
        name: 'GsmScope — Global Phone Specs, Reviews and Prices',
        url: `${origin}/`,
        applicationCategory: 'ReferenceApplication',
        operatingSystem: 'All',
        description:
          'Browse smartphone specifications with global USD and local prices, compare devices, read technology news and find the best phones for every budget.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      });

      if (phones.length > 0) {
        graph.push({
          '@type': 'ItemList',
          '@id': `${origin}/#trending-phones`,
          name: 'Trending Smartphones on GsmScope',
          itemListElement: phones.slice(0, 8).map((phone, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${origin}/?phone=${encodeURIComponent(phone.id)}`,
            name: phone.name,
          })),
        });
      }
    }

    const schemaPayload = {
      '@context': 'https://schema.org',
      '@graph': graph,
    };

    let scriptTag = document.getElementById('json-ld-specs') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-specs';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaPayload);
  }, [
    activeTab,
    selectedPhone,
    selectedArticle,
    selectedBrand,
    phones,
    brands,
    articles,
    reviews,
    compareList,
    filterState.categoryPreset,
  ]);

  return null;
}
