import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function JsonLdScript() {
  const { selectedPhone, phones } = useApp();

  useEffect(() => {
    // Generate structured data
    let schemaData;

    if (selectedPhone) {
      // Product & Tech Specs Schema
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: selectedPhone.name,
        image: selectedPhone.image,
        description: `${selectedPhone.name} specifications, Nigerian Naira price (₦${selectedPhone.priceNGN}), camera setup, battery capacity, and review in Nigeria.`,
        brand: {
          '@type': 'Brand',
          name: selectedPhone.brand
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'NGN',
          price: selectedPhone.priceNGN,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'NaijaTech Specs Nigeria'
          }
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: selectedPhone.rating,
          reviewCount: selectedPhone.reviewsCount
        }
      };
    } else {
      // WebSite & Tech Portal Catalog Schema
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'NaijaTech Specs',
        url: window.location.origin,
        description: 'Comprehensive Nigerian mobile technology platform with smartphone database, prices in Naira (₦), specs comparisons and reviews.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${window.location.origin}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };
    }

    // Inject or update ld+json script tag
    let scriptTag = document.getElementById('json-ld-specs') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-specs';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData);
  }, [selectedPhone, phones]);

  return null;
}
