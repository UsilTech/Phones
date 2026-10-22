import { Phone, Brand, Article, Review, AdSettings } from '../types';

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-infinix',
    name: 'Infinix',
    slug: 'infinix',
    country: 'Hong Kong (Transsion)',
    description: 'Trendsetting smart brand focused on youth, high refresh rate displays, fast charging tech, and gaming performance in Nigeria.',
    officialPresenceInNigeria: 'Extensive retail presence in Computer Village, Slot, 3CHub, and official Jumia flagship store.',
    popularSeries: ['Smart (Budget Entry)', 'Hot (Affordable Gaming)', 'Note (All-Round FastCharge)', 'Zero (Flagship Design)'],
    warrantyPartner: 'Carlcare Service Centers (12 + 1 months warranty nationwide)',
    logoLetter: 'I',
    accentBg: 'bg-emerald-600'
  },
  {
    id: 'brand-tecno',
    name: 'Tecno',
    slug: 'tecno',
    country: 'Hong Kong (Transsion)',
    description: 'Leading smartphone brand in Africa known for camera innovations, balanced pricing, and nationwide Carlcare support.',
    officialPresenceInNigeria: 'Official Headquarters in Ikeja, Lagos; Carlcare authorized service network across all 36 states.',
    popularSeries: ['Pop (Budget)', 'Spark (Mainstream Value)', 'Camon (Camera Flagships)', 'Phantom (Premium Ultra)'],
    warrantyPartner: 'Carlcare Service Centers (13 - 14 months warranty)',
    logoLetter: 'T',
    accentBg: 'bg-blue-600'
  },
  {
    id: 'brand-samsung',
    name: 'Samsung',
    slug: 'samsung',
    country: 'South Korea',
    description: 'Global technology giant producing industry-leading Dynamic AMOLED displays, Galaxy S Ultra flagships, and Galaxy A series.',
    officialPresenceInNigeria: 'Samsung Electronics West Africa, Victoria Island, Lagos; nationwide authorized experience stores.',
    popularSeries: ['Galaxy S (Ultra Flagships)', 'Galaxy Z (Foldables)', 'Galaxy A (Mid-range & Budget)'],
    warrantyPartner: 'Samsung Authorized Service Centers (24 months warranty on select devices)',
    logoLetter: 'S',
    accentBg: 'bg-indigo-600'
  },
  {
    id: 'brand-apple',
    name: 'Apple',
    slug: 'apple',
    country: 'United States',
    description: 'Maker of iPhone, renowned for custom Apple Silicon, iOS ecosystem integration, benchmark video recording, and resale value.',
    officialPresenceInNigeria: 'Redington / Authorized Apple Resellers (iStore, Slot, Pointek).',
    popularSeries: ['iPhone 16 / 16 Pro Max', 'iPhone 15 / 15 Pro', 'iPhone SE'],
    warrantyPartner: 'Apple Authorized Service Providers (Redington, iStore)',
    logoLetter: 'A',
    accentBg: 'bg-slate-700'
  },
  {
    id: 'brand-xiaomi',
    name: 'Xiaomi',
    slug: 'xiaomi',
    country: 'China',
    description: 'Consumer electronics brand known for aggressive spec-to-price ratios, HyperOS, and Leica co-engineered mobile cameras.',
    officialPresenceInNigeria: 'Xiaomi Authorized Stores (Ikeja City Mall, Jabi Lake Mall Abuja) & Jumia Official.',
    popularSeries: ['Redmi (Budget Value)', 'Redmi Note (Mid-range kings)', 'Xiaomi Series (High-End Flagship)', 'POCO (Gaming)'],
    warrantyPartner: 'Xiaomi Authorized Service (Raya Service)',
    logoLetter: 'X',
    accentBg: 'bg-orange-600'
  },
  {
    id: 'brand-google',
    name: 'Google',
    slug: 'google',
    country: 'United States',
    description: 'Google Pixel series featuring computational photography, clean Google Tensor AI processing, and 7 years of OS updates.',
    officialPresenceInNigeria: 'Available through trusted tech importers, Slot, and Computer Village flagship stores.',
    popularSeries: ['Pixel Pro', 'Pixel Standard', 'Pixel A-Series'],
    warrantyPartner: 'Merchant Warranty & Tech Repair Specialists',
    logoLetter: 'G',
    accentBg: 'bg-teal-600'
  },
  {
    id: 'brand-oneplus',
    name: 'OnePlus',
    slug: 'oneplus',
    country: 'China',
    description: 'Performance-driven brand offering fluid OxygenOS, ultra-fast 100W charging, Snapdragon powerhouses, and Hasselblad imaging.',
    officialPresenceInNigeria: 'Distributed via premium mobile retail outlets and e-commerce platforms in Lagos & Abuja.',
    popularSeries: ['OnePlus R Series', 'OnePlus Flagship Number Series', 'OnePlus Nord'],
    warrantyPartner: 'Authorized Retail Warranty',
    logoLetter: '1+',
    accentBg: 'bg-red-600'
  },
  {
    id: 'brand-umidigi',
    name: 'Umidigi',
    slug: 'umidigi',
    country: 'China',
    description: 'Known for rugged smartphones, massive 6000 mAh batteries, and budget smartphones tailored for heavy outdoor and work environments.',
    officialPresenceInNigeria: 'Available via Jumia, Konga, and Ikeja Computer Village stores.',
    popularSeries: ['G Series (Mecha & Rugged)', 'A Series (Affordable)', 'Bison (Waterproof Outdoor)'],
    warrantyPartner: 'Authorized Importer Warranty',
    logoLetter: 'U',
    accentBg: 'bg-amber-600'
  }
];

export const INITIAL_PHONES: Phone[] = [
  {
    id: 'smart-20',
    name: 'Smart 20',
    brand: 'Infinix',
    priceNGN: 130000,
    priceUSD: 85,
    oldPriceNGN: 145000,
    priceRange: '100k-200k',
    marketStatus: 'Available in Nigeria',
    nairaPriceNotes: 'Best for low budget users in Nigeria. Available nationwide with official Carlcare 12+1 month warranty.',
    releaseYear: 2024,
    releaseDate: 'October 2024',
    screenSizeInches: 6.6,
    image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    accentColor: '#10b981',
    rating: 3.8,
    reviewsCount: 42,
    viewsCount: 34500,
    categories: ['best-budget', 'under-200k', 'under-100k'],
    isFeatured: true,
    isPopular: true,
    keyHighlights: {
      display: '6.6" 90Hz Punch-Hole LCD',
      processor: 'MediaTek Helio G81 Ultimate',
      ram: '4GB (+4GB Extended)',
      storage: '64GB / 128GB',
      camera: '13MP Dual Camera + Dual Flash',
      battery: '5200 mAh',
      charging: '18W Type-C Fast Charge',
      os: 'Android 14 (Go edition), XOS 14',
      network5g: false
    },
    detailedSpecs: {
      network: {
        technology: 'GSM / HSPA / LTE',
        bands5g: '4G LTE bands 1, 3, 5, 7, 8, 20, 28, 38, 40, 41 (Compatible with MTN, Airtel, Glo, 9mobile 4G)',
        speed: 'HSPA, LTE-A',
        sim: 'Dual SIM (Nano-SIM, dual stand-by)'
      },
      body: {
        dimensions: '163.6 x 75.6 x 8.5 mm',
        weight: '186 g',
        build: 'Glass front, textured composite back with Dynamic Island notification animation',
        waterResistance: 'IP54 splash resistant'
      },
      display: {
        type: 'IPS LCD, 90Hz, 500 nits (peak)',
        size: '6.6 inches, 104.6 cm2 (~84.5% screen-to-body ratio)',
        resolution: '720 x 1612 pixels, 20:9 ratio (~267 ppi density)',
        protection: 'Reinforced scratch-resistant glass',
        brightness: '500 nits peak',
        refreshRate: '90Hz'
      },
      platform: {
        os: 'Android 14 (Go edition), XOS 14',
        chipset: 'MediaTek Helio G81 Ultimate (12nm)',
        cpu: 'Octa-core (2x2.0 GHz Cortex-A75 & 6x1.8 GHz Cortex-A55)',
        gpu: 'Mali-G52 MC2',
        antutuScore: '265,000 (v10)'
      },
      memory: {
        ramVariants: ['4GB'],
        storageVariants: ['64GB', '128GB'],
        cardSlot: 'microSDXC (dedicated slot)',
        storageType: 'eMMC 5.1'
      },
      mainCamera: {
        setup: '13 MP, f/1.8, (wide), AF + 0.08 MP (auxiliary lens)',
        features: 'Dual-LED flash, HDR, portrait mode',
        video: '1080p@30fps'
      },
      selfieCamera: {
        setup: '8 MP, f/2.0, (wide), Front Dual Flash',
        features: 'Selfie flash, Beauty AI',
        video: '1080p@30fps'
      },
      battery: {
        capacity: '5200 mAh non-removable',
        charging: '18W wired via Type-C',
        wirelessCharging: 'No'
      },
      sound: {
        loudspeaker: 'Yes, with stereo sound (300% volume boost)',
        jack35mm: 'Yes (3.5mm audio jack included)'
      },
      connectivity: {
        wlan: 'Wi-Fi 802.11 a/b/g/n/ac, dual-band',
        bluetooth: '5.0, A2DP, LE',
        nfc: 'No',
        radio: 'FM radio',
        usb: 'USB Type-C 2.0, OTG',
        infrared: 'No'
      },
      sensors: 'Fingerprint (side-mounted), accelerometer, proximity'
    }
  },
  {
    id: 'oneplus-12r',
    name: 'OnePlus 12R',
    brand: 'OnePlus',
    priceNGN: 895000,
    priceUSD: 599,
    oldPriceNGN: 940000,
    priceRange: '600k-1.2m',
    marketStatus: 'Available in Nigeria',
    nairaPriceNotes: 'A performance bargain: last generation flagship Snapdragon 8 Gen 2 chip, 16GB of RAM, a huge 5500 mAh battery and 100W charging. Ideal for gaming and heavy multitasking.',
    releaseYear: 2024,
    releaseDate: 'January 2024',
    screenSizeInches: 6.78,
    image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    accentColor: '#dc2626',
    rating: 4.9,
    reviewsCount: 88,
    viewsCount: 42000,
    categories: ['best-gaming', 'best-battery', 'best-5g', 'best-phones'],
    isFeatured: true,
    isPopular: true,
    keyHighlights: {
      display: '6.78" 120Hz 1.5K ProXDR LTPO4 AMOLED',
      processor: 'Qualcomm Snapdragon 8 Gen 2 4nm',
      ram: '16GB LPDDR5X',
      storage: '256GB UFS 3.1',
      camera: '50MP Sony IMX890 OIS + 8MP UW + 2MP Macro',
      battery: '5500 mAh',
      charging: '100W SUPERVOOC (1-100% in 26m)',
      os: 'Android 14, OxygenOS 14',
      network5g: true
    },
    detailedSpecs: {
      network: {
        technology: 'GSM / CDMA / HSPA / LTE / 5G',
        bands5g: 'SA/NSA: 1, 2, 3, 5, 7, 8, 20, 28, 38, 40, 41, 77, 78 (Full MTN & Airtel 5G)',
        speed: 'HSPA, LTE-A (CA), 5G',
        sim: 'Dual SIM (Nano-SIM, dual stand-by)'
      },
      body: {
        dimensions: '163.3 x 75.3 x 8.8 mm',
        weight: '207 g',
        build: 'Gorilla Glass Victus 2 front, glass back, aluminum alloy frame',
        waterResistance: 'IP64 dust/water resistant'
      },
      display: {
        type: 'LTPO4 AMOLED, 1B colors, 120Hz, Dolby Vision, HDR10+, 4500 nits (peak)',
        size: '6.78 inches, 111.7 cm2 (~90.9% screen-to-body ratio)',
        resolution: '1264 x 2780 pixels (~450 ppi density)',
        protection: 'Corning Gorilla Glass Victus 2',
        brightness: '4500 nits peak',
        refreshRate: '1-120Hz adaptive'
      },
      platform: {
        os: 'Android 14, OxygenOS 14',
        chipset: 'Qualcomm SM8550-AB Snapdragon 8 Gen 2 (4 nm)',
        cpu: 'Octa-core (1x3.2 GHz Cortex-X3 & 2x2.8 GHz Cortex-A715 & 2x2.8 GHz Cortex-A710 & 3x2.0 GHz Cortex-A510)',
        gpu: 'Adreno 740',
        antutuScore: '1,530,000 (v10)'
      },
      memory: {
        ramVariants: ['16GB'],
        storageVariants: ['256GB'],
        cardSlot: 'No',
        storageType: 'UFS 3.1'
      },
      mainCamera: {
        setup: '50 MP, f/1.8, 24mm (wide), 1/1.56", 1.0µm, PDAF, OIS Sony IMX890 + 8 MP, f/2.2, 16mm, 112˚ (ultrawide) + 2 MP (macro)',
        features: 'Dual-LED flash, HDR, panorama',
        video: '4K@30/60fps, 1080p@30/60/120/240fps, gyro-EIS, OIS'
      },
      selfieCamera: {
        setup: '16 MP, f/2.4, 26mm (wide)',
        features: 'HDR, panorama',
        video: '1080p@30fps, gyro-EIS'
      },
      battery: {
        capacity: '5500 mAh non-removable',
        charging: '100W wired, 1-100% in 26 min (advertised)',
        wirelessCharging: 'No'
      },
      sound: {
        loudspeaker: 'Yes, with stereo speakers (Dolby Atmos)',
        jack35mm: 'No'
      },
      connectivity: {
        wlan: 'Wi-Fi 802.11 a/b/g/n/ac/6/7, dual-band',
        bluetooth: '5.3, A2DP, LE, aptX HD',
        nfc: 'Yes',
        radio: 'No',
        usb: 'USB Type-C 2.0',
        infrared: 'Yes'
      },
      sensors: 'Fingerprint (under display, optical), accelerometer, gyro, proximity, compass, color spectrum'
    }
  },
  {
    id: 'google-pixel-8-pro',
    name: 'Google Pixel 8 Pro',
    brand: 'Google',
    priceNGN: 1540000,
    priceUSD: 999,
    oldPriceNGN: 1620000,
    priceRange: 'flagship',
    marketStatus: 'Available in Nigeria',
    nairaPriceNotes: 'Google\'s computational photography at its best: excellent point and shoot results, seven years of software updates and the cleanest version of Android available in Nigeria.',
    releaseYear: 2023,
    releaseDate: 'October 2023',
    screenSizeInches: 6.7,
    image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    accentColor: '#14b8a6',
    rating: 4.8,
    reviewsCount: 65,
    viewsCount: 39000,
    categories: ['best-camera', 'best-5g', 'best-phones'],
    isFeatured: true,
    isPopular: true,
    keyHighlights: {
      display: '6.7" 120Hz Super Actua LTPO OLED',
      processor: 'Google Tensor G3 4nm',
      ram: '12GB LPDDR5X',
      storage: '128GB / 256GB / 512GB UFS 3.1',
      camera: '50MP OIS + 48MP 5x Telephoto + 48MP UW',
      battery: '5050 mAh',
      charging: '30W wired, 23W wireless',
      os: 'Android 15 (7 Years of OS Updates)',
      network5g: true
    },
    detailedSpecs: {
      network: {
        technology: 'GSM / HSPA / LTE / 5G',
        bands5g: 'Sub-6 GHz and mmWave (Full support for Nigerian 5G networks)',
        speed: 'HSPA, LTE-A (CA), 5G',
        sim: 'Nano-SIM and eSIM'
      },
      body: {
        dimensions: '162.6 x 76.5 x 8.8 mm',
        weight: '213 g',
        build: 'Corning Gorilla Glass Victus 2 front and back, matte finish, polished aluminum frame',
        waterResistance: 'IP68 dust/water resistant (up to 1.5m for 30 min)'
      },
      display: {
        type: 'LTPO OLED, 120Hz, HDR10+, 2400 nits (peak)',
        size: '6.7 inches, 108.7 cm2 (~87.4% screen-to-body ratio)',
        resolution: '1344 x 2992 pixels, 20:9 ratio (~489 ppi density)',
        protection: 'Corning Gorilla Glass Victus 2',
        brightness: '2400 nits peak',
        refreshRate: '1-120Hz adaptive'
      },
      platform: {
        os: 'Android 15 (7 major OS upgrades)',
        chipset: 'Google Tensor G3 (4 nm)',
        cpu: 'Nona-core (1x3.0 GHz Cortex-X3 & 4x2.45 GHz Cortex-A715 & 4x2.15 GHz Cortex-A510)',
        gpu: 'Immortalis-G715s MC10',
        antutuScore: '1,120,000 (v10)'
      },
      memory: {
        ramVariants: ['12GB'],
        storageVariants: ['128GB', '256GB', '512GB'],
        cardSlot: 'No',
        storageType: 'UFS 3.1'
      },
      mainCamera: {
        setup: '50 MP, f/1.7, 25mm (wide), 1/1.31", 1.2µm, dual pixel PDAF, multi-zone Laser AF, OIS + 48 MP (periscope telephoto, 5x optical, OIS) + 48 MP (ultrawide, 126˚)',
        features: 'Best Take, Magic Audio Eraser, Night Sight, Video Boost',
        video: '4K@24/30/60fps, 1080p@30/60/120/240fps; gyro-EIS, OIS, 10-bit HDR'
      },
      selfieCamera: {
        setup: '10.5 MP, f/2.2, 20mm (ultrawide), 1/3.1", 1.22µm, PDAF',
        features: 'Auto-HDR, panorama',
        video: '4K@24/30/60fps, 1080p@30/60fps'
      },
      battery: {
        capacity: '5050 mAh non-removable',
        charging: '30W wired, PD3.0, 50% in 30 min (advertised)',
        wirelessCharging: '23W wireless (Pixel Stand), 12W with Qi, reverse wireless'
      },
      sound: {
        loudspeaker: 'Yes, with stereo speakers',
        jack35mm: 'No'
      },
      connectivity: {
        wlan: 'Wi-Fi 802.11 a/b/g/n/ac/6e/7, tri-band',
        bluetooth: '5.3, A2DP, LE, aptX HD',
        nfc: 'Yes',
        radio: 'No',
        usb: 'USB Type-C 3.2',
        infrared: 'No'
      },
      sensors: 'Fingerprint (under display, optical), accelerometer, gyro, proximity, compass, barometer, thermometer'
    }
  },
  {
    id: 'xiaomi-redmi-13c',
    name: 'Xiaomi Redmi 13C',
    brand: 'Xiaomi',
    priceNGN: 175000,
    priceUSD: 119,
    oldPriceNGN: 189000,
    priceRange: '100k-200k',
    marketStatus: 'Available in Nigeria',
    nairaPriceNotes: 'Dependable budget favorite with clean 90Hz display, 50MP AI primary camera, and 5000 mAh battery with 18W charging.',
    releaseYear: 2023,
    releaseDate: 'November 2023',
    screenSizeInches: 6.74,
    image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    accentColor: '#ea580c',
    rating: 4.3,
    reviewsCount: 52,
    viewsCount: 29000,
    categories: ['best-budget', 'under-200k'],
    isFeatured: false,
    isPopular: true,
    keyHighlights: {
      display: '6.74" 90Hz IPS LCD',
      processor: 'MediaTek Helio G85 12nm',
      ram: '6GB / 8GB',
      storage: '128GB / 256GB eMMC 5.1',
      camera: '50MP f/1.8 + 2MP Macro + Auxiliary',
      battery: '5000 mAh',
      charging: '18W Type-C wired',
      os: 'Android 13, MIUI 14 (Upgraded to HyperOS)',
      network5g: false
    },
    detailedSpecs: {
      network: {
        technology: 'GSM / HSPA / LTE',
        bands5g: '4G LTE bands 1, 3, 5, 7, 8, 20, 28, 38, 40, 41',
        speed: 'HSPA, LTE',
        sim: 'Dual SIM (Nano-SIM, dual stand-by)'
      },
      body: {
        dimensions: '168.0 x 78.0 x 8.09 mm',
        weight: '192 g',
        build: 'Glass front (Corning Gorilla Glass), plastic frame, plastic back',
        waterResistance: 'None'
      },
      display: {
        type: 'IPS LCD, 90Hz, 450 nits (typ), 600 nits (HBM)',
        size: '6.74 inches, 109.7 cm2 (~83.7% screen-to-body ratio)',
        resolution: '720 x 1600 pixels, 20:9 ratio (~260 ppi density)',
        protection: 'Corning Gorilla Glass',
        brightness: '600 nits HBM',
        refreshRate: '90Hz'
      },
      platform: {
        os: 'Android 13, MIUI 14 for POCO / Xiaomi',
        chipset: 'Mediatek MT6769Z Helio G85 (12nm)',
        cpu: 'Octa-core (2x2.0 GHz Cortex-A75 & 6x1.8 GHz Cortex-A55)',
        gpu: 'Mali-G52 MC2',
        antutuScore: '280,000 (v10)'
      },
      memory: {
        ramVariants: ['6GB', '8GB'],
        storageVariants: ['128GB', '256GB'],
        cardSlot: 'microSDXC (dedicated slot)',
        storageType: 'eMMC 5.1'
      },
      mainCamera: {
        setup: '50 MP, f/1.8, 28mm (wide), 0.64µm, PDAF + 2 MP (macro) + 0.08 MP (auxiliary)',
        features: 'LED flash, HDR, filmCamera filters',
        video: '1080p@30fps'
      },
      selfieCamera: {
        setup: '8 MP, f/2.0',
        features: 'HDR, Soft-light ring',
        video: '1080p@30fps'
      },
      battery: {
        capacity: '5000 mAh non-removable',
        charging: '18W wired, PD',
        wirelessCharging: 'No'
      },
      sound: {
        loudspeaker: 'Yes',
        jack35mm: 'Yes (3.5mm jack included)'
      },
      connectivity: {
        wlan: 'Wi-Fi 802.11 a/b/g/n/ac, dual-band',
        bluetooth: '5.3, A2DP, LE',
        nfc: 'Yes (market dependent)',
        radio: 'FM radio',
        usb: 'USB Type-C 2.0',
        infrared: 'No'
      },
      sensors: 'Fingerprint (side-mounted), accelerometer, compass, virtual proximity sensing'
    }
  },
  {
    id: 'xiaomi-redmi-note-13-pro-5g',
    name: 'Xiaomi Redmi Note 13 Pro 5G',
    brand: 'Xiaomi',
    priceNGN: 450000,
    priceUSD: 299,
    oldPriceNGN: 480000,
    priceRange: '350k-600k',
    marketStatus: 'Available in Nigeria',
    nairaPriceNotes: 'Class-leading 200MP OIS sensor, crisp 1.5K 120Hz AMOLED screen, and Snapdragon 7s Gen 2 chip. 67W turbo charger included.',
    releaseYear: 2024,
    releaseDate: 'January 2024',
    screenSizeInches: 6.67,
    image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    accentColor: '#f97316',
    rating: 4.7,
    reviewsCount: 94,
    viewsCount: 38000,
    categories: ['best-camera', 'best-5g', 'best-budget'],
    isFeatured: false,
    isPopular: true,
    keyHighlights: {
      display: '6.67" 120Hz 1.5K CrystalRes AMOLED',
      processor: 'Snapdragon 7s Gen 2 4nm 5G',
      ram: '8GB / 12GB',
      storage: '256GB / 512GB UFS 2.2',
      camera: '200MP Samsung ISOCELL HP3 OIS + 8MP UW + 2MP',
      battery: '5100 mAh',
      charging: '67W Turbo Charge (100% in 44m)',
      os: 'Android 14, Xiaomi HyperOS',
      network5g: true
    },
    detailedSpecs: {
      network: {
        technology: 'GSM / CDMA / HSPA / EVDO / LTE / 5G',
        bands5g: 'SA/NSA: 1, 3, 5, 7, 8, 20, 28, 38, 40, 41, 66, 77, 78',
        speed: 'HSPA, LTE-A, 5G',
        sim: 'Dual SIM (Nano-SIM, dual stand-by) or Nano-SIM and eSIM'
      },
      body: {
        dimensions: '161.2 x 74.2 x 7.98 mm',
        weight: '187 g',
        build: 'Gorilla Glass Victus front, glass back, plastic frame',
        waterResistance: 'IP54 splash resistant'
      },
      display: {
        type: 'AMOLED, 68B colors, 120Hz, Dolby Vision, 1800 nits (peak)',
        size: '6.67 inches, 107.4 cm2 (~89.8% screen-to-body ratio)',
        resolution: '1220 x 2712 pixels, 20:9 ratio (~446 ppi density)',
        protection: 'Corning Gorilla Glass Victus',
        brightness: '1800 nits peak',
        refreshRate: '120Hz'
      },
      platform: {
        os: 'Android 14, HyperOS',
        chipset: 'Qualcomm SM7435-AB Snapdragon 7s Gen 2 (4 nm)',
        cpu: 'Octa-core (4x2.40 GHz Cortex-A78 & 4x1.95 GHz Cortex-A55)',
        gpu: 'Adreno 710',
        antutuScore: '610,000 (v10)'
      },
      memory: {
        ramVariants: ['8GB', '12GB'],
        storageVariants: ['256GB', '512GB'],
        cardSlot: 'No',
        storageType: 'UFS 2.2'
      },
      mainCamera: {
        setup: '200 MP, f/1.7, (wide), 1/1.4", 0.56µm, multi-directional PDAF, OIS + 8 MP, f/2.2, 118˚ (ultrawide) + 2 MP (macro)',
        features: 'Dual-LED dual-tone flash, HDR, panorama, 4x in-sensor zoom',
        video: '4K@30fps, 1080p@30/60/120fps, gyro-EIS'
      },
      selfieCamera: {
        setup: '16 MP, f/2.4, (wide)',
        features: 'HDR, panorama',
        video: '1080p@30/60fps'
      },
      battery: {
        capacity: '5100 mAh non-removable',
        charging: '67W wired, PD3.0, 100% in 44 min (advertised)',
        wirelessCharging: 'No'
      },
      sound: {
        loudspeaker: 'Yes, with stereo speakers (Dolby Atmos)',
        jack35mm: 'Yes (3.5mm headphone jack preserved)'
      },
      connectivity: {
        wlan: 'Wi-Fi 802.11 a/b/g/n/ac, dual-band',
        bluetooth: '5.2, A2DP, LE',
        nfc: 'Yes',
        radio: 'No',
        usb: 'USB Type-C 2.0, OTG',
        infrared: 'Yes'
      },
      sensors: 'Fingerprint (under display, optical), accelerometer, gyro, compass, virtual proximity'
    }
  },
  {
    id: 'samsung-galaxy-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    priceNGN: 1850000,
    priceUSD: 1230,
    oldPriceNGN: 1980000,
    priceRange: 'flagship',
    marketStatus: 'Available in Nigeria',
    nairaPriceNotes: 'Official Samsung West Africa 24-month warranty. S-Pen included in box. Anti-reflective Gorilla Armor display tested in Lagos.',
    releaseYear: 2024,
    releaseDate: 'January 2024',
    screenSizeInches: 6.8,
    image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    accentColor: '#4f46e5',
    rating: 4.9,
    reviewsCount: 310,
    viewsCount: 64200,
    categories: ['best-camera', 'best-5g', 'best-gaming', 'best-phones'],
    isFeatured: true,
    isPopular: true,
    keyHighlights: {
      display: '6.8" 120Hz Dynamic LTPO AMOLED 2X',
      processor: 'Snapdragon 8 Gen 3 for Galaxy 4nm',
      ram: '12GB LPDDR5X',
      storage: '256GB / 512GB / 1TB UFS 4.0',
      camera: '200MP OIS + 50MP 5x Periscope + 10MP 3x + 12MP UW',
      battery: '5000 mAh',
      charging: '45W wired, 15W wireless',
      os: 'Android 14, One UI 6.1 (7 Years of OS Updates)',
      network5g: true
    },
    detailedSpecs: {
      network: {
        technology: 'GSM / CDMA / HSPA / EVDO / LTE / 5G',
        bands5g: 'SA/NSA/Sub6 - Full Nigerian telecom carrier compatibility (MTN, Airtel, Glo, 9mobile)',
        speed: 'HSPA, LTE-A (up to 7CA), 5G',
        sim: 'Nano-SIM and eSIM or Dual Nano-SIM'
      },
      body: {
        dimensions: '162.3 x 79.0 x 8.6 mm',
        weight: '232 g',
        build: 'Corning Gorilla Armor front & back, Grade 2 Titanium frame',
        waterResistance: 'IP68 dust/water resistant (up to 1.5m for 30 min)'
      },
      display: {
        type: 'Dynamic LTPO AMOLED 2X, 120Hz, HDR10+, anti-reflective coating',
        size: '6.8 inches, 113.5 cm2 (~88.5% screen-to-body ratio)',
        resolution: '1440 x 3120 pixels, 19.5:9 ratio (~505 ppi density)',
        protection: 'Corning Gorilla Armor',
        brightness: '2600 nits (peak)',
        refreshRate: '1-120Hz adaptive'
      },
      platform: {
        os: 'Android 14, One UI 6.1, Galaxy AI suite',
        chipset: 'Qualcomm SM8650-AC Snapdragon 8 Gen 3 (4 nm)',
        cpu: '8-core (1x3.39GHz Cortex-X4 & 3x3.1GHz Cortex-A720 & 2x2.9GHz Cortex-A720 & 2x2.2GHz Cortex-A520)',
        gpu: 'Adreno 750 (1 GHz)',
        antutuScore: '1,860,000 (v10)'
      },
      memory: {
        ramVariants: ['12GB'],
        storageVariants: ['256GB', '512GB', '1TB'],
        cardSlot: 'No',
        storageType: 'UFS 4.0'
      },
      mainCamera: {
        setup: '200 MP (f/1.7, 24mm wide, multi-directional PDAF, Laser AF, OIS) + 50 MP (periscope telephoto, 5x optical, OIS) + 10 MP (telephoto, 3x optical, OIS) + 12 MP (ultrawide, 120˚)',
        features: 'LED flash, auto-HDR, panorama, 8K video at 30fps, 4K at 120fps',
        video: '8K@24/30fps, 4K@30/60/120fps, 1080p@30/60/240fps, HDR10+'
      },
      selfieCamera: {
        setup: '12 MP, f/2.2, 26mm (wide), Dual Pixel PDAF',
        features: 'Dual video call, Auto-HDR, HDR10+',
        video: '4K@30/60fps, 1080p@30fps'
      },
      battery: {
        capacity: '5000 mAh non-removable',
        charging: '45W wired, PD3.0, 65% in 30 min (advertised)',
        wirelessCharging: '15W wireless (Qi/PMA), 4.5W reverse wireless'
      },
      sound: {
        loudspeaker: 'Yes, stereo speakers tuned by AKG',
        jack35mm: 'No'
      },
      connectivity: {
        wlan: 'Wi-Fi 802.11 a/b/g/n/ac/6e/7, tri-band, Wi-Fi Direct',
        bluetooth: '5.3, A2DP, LE',
        nfc: 'Yes',
        radio: 'No',
        usb: 'USB Type-C 3.2, DisplayPort 1.2, OTG',
        infrared: 'No'
      },
      sensors: 'Fingerprint (under display, ultrasonic), accelerometer, gyro, proximity, compass, barometer, UWB'
    }
  },
  {
    id: 'apple-iphone-16-pro-max',
    name: 'Apple iPhone 16 Pro Max',
    brand: 'Apple',
    priceNGN: 2450000,
    priceUSD: 1630,
    oldPriceNGN: 2550000,
    priceRange: 'flagship',
    marketStatus: 'Available in Nigeria',
    nairaPriceNotes: 'Official Nigerian retail stock with 1-Year international Apple warranty. Dual SIM variants available across Slot and iStore Nigeria.',
    releaseYear: 2024,
    releaseDate: 'September 2024',
    screenSizeInches: 6.9,
    image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    accentColor: '#334155',
    rating: 4.9,
    reviewsCount: 285,
    viewsCount: 78000,
    categories: ['best-camera', 'best-5g', 'best-gaming', 'best-phones'],
    isFeatured: true,
    isPopular: true,
    keyHighlights: {
      display: '6.9" 120Hz Super Retina XDR OLED',
      processor: 'Apple A18 Pro 3nm',
      ram: '8GB Unified',
      storage: '256GB / 512GB / 1TB NVMe',
      camera: '48MP Fusion Camera + 48MP UW + 12MP 5x Tetraprism Zoom',
      battery: '4685 mAh',
      charging: 'Fast wired PD, 25W MagSafe wireless',
      os: 'iOS 18 (Apple Intelligence support)',
      network5g: true
    },
    detailedSpecs: {
      network: {
        technology: 'GSM / CDMA / HSPA / EVDO / LTE / 5G',
        bands5g: 'Global Sub-6 GHz and mmWave bands (Full compatibility with MTN, Airtel, Mafab 5G)',
        speed: 'HSPA, LTE-A, 5G',
        sim: 'Dual eSIM or Nano-SIM and eSIM'
      },
      body: {
        dimensions: '163.0 x 77.6 x 8.25 mm',
        weight: '227 g',
        build: 'Ceramic Shield front, textured matte glass back, Grade 5 Titanium frame, Camera Control button',
        waterResistance: 'IP68 (6m up to 30 mins)'
      },
      display: {
        type: 'Super Retina XDR OLED, 120Hz ProMotion, HDR10, Dolby Vision',
        size: '6.9 inches, 115.6 cm2 (~91.4% screen-to-body ratio)',
        resolution: '1320 x 2868 pixels (~460 ppi density)',
        protection: 'Ceramic Shield glass (2024 gen)',
        brightness: '2000 nits peak outdoor, 1 nit minimum',
        refreshRate: '1-120Hz ProMotion'
      },
      platform: {
        os: 'iOS 18, upgradable to future iOS versions',
        chipset: 'Apple A18 Pro (3 nm)',
        cpu: 'Hexa-core (2 performance + 4 efficiency)',
        gpu: 'Apple 6-core GPU with hardware ray tracing',
        antutuScore: '1,920,000 (v10)'
      },
      memory: {
        ramVariants: ['8GB'],
        storageVariants: ['256GB', '512GB', '1TB'],
        cardSlot: 'No',
        storageType: 'NVMe'
      },
      mainCamera: {
        setup: '48 MP Fusion (24mm, f/1.78, sensor-shift OIS) + 48 MP Ultrawide (13mm, f/2.2, 120˚) + 12 MP 5x Telephoto (120mm, f/2.8, 3D sensor-shift OIS)',
        features: 'Sapphire crystal lens cover, 4K 120fps Dolby Vision, ProRes, Log video, spatial audio',
        video: '4K@24/25/30/60/100/120fps Dolby Vision HDR, ProRes'
      },
      selfieCamera: {
        setup: '12 MP TrueDepth camera, f/1.9, autofocus with Focus Pixels',
        features: 'Retina Flash, Cinematic mode (4K HDR@30fps)',
        video: '4K@24/25/30/60fps, 1080p@25/30/60/120fps'
      },
      battery: {
        capacity: '4685 mAh non-removable',
        charging: 'Up to 50% charge in ~30 minutes with 20W adapter or higher',
        wirelessCharging: 'MagSafe wireless charging up to 25W, Qi2 up to 15W'
      },
      sound: {
        loudspeaker: 'Yes, with spatial audio stereo playback',
        jack35mm: 'No'
      },
      connectivity: {
        wlan: 'Wi-Fi 7 (802.11be) with 2x2 MIMO',
        bluetooth: '5.3',
        nfc: 'Yes with reader mode',
        radio: 'No',
        usb: 'USB Type-C 3.2 Gen 2 (up to 10Gb/s), DisplayPort',
        infrared: 'No'
      },
      sensors: 'Face ID, LiDAR Scanner, barometer, high-g accelerometer, high dynamic range gyro'
    }
  },
  {
    id: 'tecno-camon-30-pro-5g',
    name: 'Tecno Camon 30 Pro 5G',
    brand: 'Tecno',
    priceNGN: 520000,
    priceUSD: 350,
    oldPriceNGN: 545000,
    priceRange: '350k-600k',
    marketStatus: 'Available in Nigeria',
    nairaPriceNotes: 'Sony IMX890 50MP OIS sensor, 144Hz AMOLED screen, 70W fast charging. Official Carlcare 13-month warranty.',
    releaseYear: 2024,
    releaseDate: 'May 2024',
    screenSizeInches: 6.78,
    image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    accentColor: '#2563eb',
    rating: 4.8,
    reviewsCount: 142,
    viewsCount: 28400,
    categories: ['best-camera', 'best-5g', 'best-battery'],
    isFeatured: true,
    isPopular: true,
    keyHighlights: {
      display: '6.78" 144Hz AMOLED 1080p',
      processor: 'Dimensity 8200 Ultimate 4nm',
      ram: '12GB (+12GB Extended)',
      storage: '256GB / 512GB UFS 3.1',
      camera: '50MP Sony IMX890 OIS + 50MP UW + 50MP Selfie',
      battery: '5000 mAh',
      charging: '70W Ultra Charge (0-100% in 45m)',
      os: 'Android 14, HIOS 14',
      network5g: true
    },
    detailedSpecs: {
      network: {
        technology: 'GSM / HSPA / LTE / 5G',
        bands5g: 'SA/NSA: n1/n3/n5/n7/n8/n20/n28/n38/n40/n41/n77/n78 (Full MTN & Airtel 5G)',
        speed: 'HSPA, LTE-A, 5G NR',
        sim: 'Dual SIM (Nano-SIM, dual stand-by)'
      },
      body: {
        dimensions: '164.0 x 74.5 x 7.7 mm',
        weight: '188 g',
        build: 'Glass front (Gorilla Glass 5), faux leather or glass back, aluminum alloy frame',
        waterResistance: 'IP54 splash resistant'
      },
      display: {
        type: 'AMOLED, 1B colors, 144Hz refresh rate, HDR10+',
        size: '6.78 inches, 111.0 cm2 (~90.8% screen-to-body ratio)',
        resolution: '1080 x 2436 pixels (~393 ppi density)',
        protection: 'Corning Gorilla Glass 5',
        brightness: '1300 nits peak',
        refreshRate: '144Hz'
      },
      platform: {
        os: 'Android 14, HIOS 14 (Guaranteed 2 major OS upgrades)',
        chipset: 'MediaTek Dimensity 8200 Ultimate (4 nm)',
        cpu: 'Octa-core (1x3.1 GHz Cortex-A78 & 3x3.0 GHz Cortex-A78 & 4x2.0 GHz Cortex-A55)',
        gpu: 'Mali-G610 MC6',
        antutuScore: '942,000 (v10)'
      },
      memory: {
        ramVariants: ['12GB'],
        storageVariants: ['256GB', '512GB'],
        cardSlot: 'No',
        storageType: 'UFS 3.1'
      },
      mainCamera: {
        setup: '50 MP (wide, f/1.9, 1/1.56", 1.0µm, PDAF, OIS Sony IMX890) + 50 MP (ultrawide, 114˚) + 2 MP (depth)',
        features: 'Dual-LED flash, HDR, Super Night 3.0, 4K 60fps video',
        video: '4K@60fps, 1080p@30/60fps, gyro-EIS'
      },
      selfieCamera: {
        setup: '50 MP, f/2.5, 24mm (wide), PDAF with eye autofocus',
        features: 'Dual-LED flash, 4K video recording',
        video: '4K@60fps, 1080p@30fps'
      },
      battery: {
        capacity: '5000 mAh non-removable',
        charging: '70W wired fast charging (0-100% in 45 min)',
        wirelessCharging: 'No'
      },
      sound: {
        loudspeaker: 'Yes, dual stereo speakers with Dolby Atmos',
        jack35mm: 'No'
      },
      connectivity: {
        wlan: 'Wi-Fi 802.11 a/b/g/n/ac/6, dual-band',
        bluetooth: '5.3, A2DP, LE',
        nfc: 'Yes',
        radio: 'FM radio',
        usb: 'USB Type-C 2.0, OTG',
        infrared: 'Yes'
      },
      sensors: 'Fingerprint (under display, optical), accelerometer, gyro, proximity, compass'
    }
  },
  {
    id: 'umidigi-g5-mecha',
    name: 'Umidigi G5 Mecha',
    brand: 'Umidigi',
    priceNGN: 160000,
    priceUSD: 110,
    oldPriceNGN: 175000,
    priceRange: '100k-200k',
    marketStatus: 'Available in Nigeria',
    nairaPriceNotes: 'Rugged smartphone with 6000 mAh battery built for challenging worksites, delivery riders, and long power outages in Nigeria.',
    releaseYear: 2024,
    releaseDate: 'March 2024',
    screenSizeInches: 6.6,
    image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    accentColor: '#d97706',
    rating: 4.4,
    reviewsCount: 38,
    viewsCount: 19800,
    categories: ['best-battery', 'best-budget', 'under-200k'],
    isFeatured: false,
    isPopular: false,
    keyHighlights: {
      display: '6.6" 90Hz HD+ Reinforced Glass',
      processor: 'Unisoc T606 Octa-Core',
      ram: '8GB (+8GB Virtual)',
      storage: '128GB',
      camera: '50MP AI Main + 2MP Depth',
      battery: '6000 mAh Super Battery',
      charging: '18W Type-C wired',
      os: 'Android 13',
      network5g: false
    },
    detailedSpecs: {
      network: {
        technology: 'GSM / HSPA / LTE',
        bands5g: '4G LTE bands 1, 2, 3, 4, 5, 7, 8, 12, 17, 20, 28',
        speed: 'HSPA, LTE',
        sim: 'Dual SIM (Nano-SIM, dual stand-by)'
      },
      body: {
        dimensions: '164.7 x 76.5 x 9.9 mm',
        weight: '225 g',
        build: 'Reinforced polycarbonate bumper body, metallic armor accents',
        waterResistance: 'IP68 and IP69K waterproof & dustproof'
      },
      display: {
        type: 'IPS LCD, 90Hz',
        size: '6.6 inches, 720 x 1612 pixels (~267 ppi)',
        resolution: '720 x 1612 pixels',
        protection: 'Scratch-resistant glass',
        brightness: '500 nits',
        refreshRate: '90Hz'
      },
      platform: {
        os: 'Android 13',
        chipset: 'Unisoc T606 (12 nm)',
        cpu: 'Octa-core (2x1.6 GHz Cortex-A75 & 6x1.6 GHz Cortex-A55)',
        gpu: 'Mali-G57 MP1',
        antutuScore: '250,000 (v10)'
      },
      memory: {
        ramVariants: ['8GB'],
        storageVariants: ['128GB'],
        cardSlot: 'microSDXC (dedicated)',
        storageType: 'eMMC 5.1'
      },
      mainCamera: {
        setup: '50 MP, f/1.8 + 2 MP (depth)',
        features: 'LED flash, HDR, Night Mode',
        video: '1080p@30fps'
      },
      selfieCamera: {
        setup: '8 MP, f/2.2',
        features: 'Face unlock',
        video: '1080p@30fps'
      },
      battery: {
        capacity: '6000 mAh non-removable',
        charging: '18W wired',
        wirelessCharging: 'No'
      },
      sound: {
        loudspeaker: 'Yes, heavy volume speaker',
        jack35mm: 'Yes'
      },
      connectivity: {
        wlan: 'Wi-Fi 802.11 a/b/g/n/ac',
        bluetooth: '5.0',
        nfc: 'Yes',
        radio: 'FM radio',
        usb: 'USB Type-C 2.0, OTG',
        infrared: 'No'
      },
      sensors: 'Fingerprint (side-mounted), accelerometer, compass'
    }
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-iphone-16-nigeria',
    title: 'iPhone 16 series: what Nigerian buyers should know',
    slug: 'iphone-16-series-what-nigerian-buyers-should-know',
    category: 'Smartphone News',
    coverImage: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    summary: 'Prices, camera changes and the features that actually matter if you are upgrading from an older iPhone in Nigeria.',
    content: `Apple has refreshed the iPhone line up, and the headline changes are immediately visible: narrower bezels, lighter titanium builds, the dedicated Camera Control button on all models, and Apple Intelligence. But in Nigeria, where the exchange rate pushes flagship phone prices well past two million naira, the question is simple: which changes actually matter in daily life, and which model gives the best return on your money?

### The Price Reality in Nigeria
At authorized resellers like Slot and iStore Nigeria, as well as trusted Computer Village importers:
- **iPhone 16 Standard (128GB)**: ~₦1,650,000 ($1,100)
- **iPhone 16 Plus (128GB)**: ~₦1,850,000 ($1,230)
- **iPhone 16 Pro (128GB/256GB)**: ~₦2,050,000 ($1,360)
- **iPhone 16 Pro Max (256GB)**: ~₦2,450,000 ($1,630)

### What Actually Matters If You Are Upgrading
1. **Battery Life**: The 16 Pro Max is a genuine two-day device even under heavy Lagos traffic use with Google Maps navigation and mobile hotspot running.
2. **Camera Control**: The capacitive button allows rapid switching between exposure, depth of field and zoom without tapping the screen.
3. **4K 120fps Dolby Vision**: For Nigerian content creators and wedding videographers, shooting 4K at 120fps with spatial audio is an industry-grade superpower.

### The Recommendation
If you already own an iPhone 15 Pro Max, there is little compelling reason to spend another million naira on the upgrade. However, if you are moving from an iPhone 11, 12, or 13, the leap in battery endurance, 5G carrier speed, and camera versatility is transformative.`,
    author: {
      name: 'GsmScope Editors',
      role: 'Hardware Editorial Team'
    },
    date: '2 Mar 2026',
    readTime: '6 min read',
    tags: ['iPhone 16', 'Apple', 'Nigerian Prices', 'Buying Advice', 'Lagos Tech'],
    featured: true,
    relatedPhoneIds: ['apple-iphone-16-pro-max']
  },
  {
    id: 'art-redmi-vs-infinix',
    title: 'Redmi Note 13 Pro vs Infinix Note 40 Pro: which should you buy?',
    slug: 'redmi-note-13-pro-vs-infinix-note-40-pro-which-should-you-buy',
    category: 'Comparisons',
    coverImage: '/src/assets/images/news_camera_sensor_1792578845370.jpg',
    summary: 'Two of the most popular mid range phones in Nigeria go head to head on camera, battery, screen and price.',
    content: `Both phones target the exact same Nigerian buyer: someone who wants a vibrant AMOLED screen, fast charging, sharp camera sensors, and 5G connectivity without spending a fortune.

### Design and Display
- **Redmi Note 13 Pro 5G**: Flat 6.67" 1.5K CrystalRes AMOLED panel with 1800 nits peak brightness and Gorilla Glass Victus.
- **Infinix Note 40 Pro+ 5G**: 6.78" 3D-Curved AMOLED panel with 1300 nits and an eye-catching Active Halo notification light on the back.

The curved display on the Infinix looks more luxurious in hand, but the Redmi’s flat 1.5K screen is sharper and significantly easier to protect with affordable tempered screen guards from Computer Village.

### Charging and Power Outages
Here, Infinix pulls off a technological masterstroke for Nigerian living conditions:
- **Infinix Note 40 Pro+**: 100W All-Round FastCharge (0 to 50% in 12 minutes) PLUS 20W wireless MagCharge with a MagPad and magnetic phone case included inside the retail box.
- **Redmi Note 13 Pro 5G**: 67W Turbo Charge (0 to 100% in 44 minutes). Fast, but lacks wireless charging.

### Camera Performance
Redmi’s 200MP Samsung ISOCELL sensor captures slightly more fine textile detail in daylight, while the Infinix 108MP camera excels with vibrant skin tones tuned specifically for African melanin tones under natural Nigerian sunlight.

### Verdict
If your priority is 100W hyper charging and free magnetic wireless accessories during rolling power outages, the **Infinix Note 40 Pro+** wins. If you prefer a sharper 1.5K display and higher resolution 200MP camera crops, choose the **Redmi Note 13 Pro 5G**.`,
    author: {
      name: 'Ada Nwosu',
      role: 'Senior Hardware Reviewer'
    },
    date: '24 Feb 2026',
    readTime: '7 min read',
    tags: ['Redmi', 'Infinix', 'Comparison', 'Mid-Range', 'Nigeria Tech'],
    featured: true,
    relatedPhoneIds: ['xiaomi-redmi-note-13-pro-5g']
  },
  {
    id: 'art-budget-under-200k',
    title: 'Best budget phones under 200,000 naira in Nigeria',
    slug: 'best-budget-phones-under-200-000-naira-in-nigeria',
    category: 'Buying Guides',
    coverImage: '/src/assets/images/news_nigeria_tech_1792578846595.jpg',
    summary: 'Five phones that stretch a small budget the furthest, covering battery life, screen quality and camera basics.',
    content: `A tight budget does not mean a bad phone. In Nigeria’s current macroeconomic landscape, the ₦100,000 to ₦200,000 price window is where 65% of smartphone transactions take place.

We tested over 10 devices in Lagos and Ibadan to pick the top models that deliver reliable performance:

### 1. Infinix Smart 20 (₦130,000 / $85)
The overall budget winner. Features a large 5200 mAh battery that easily outlasts generator runs, a smooth 90Hz display, and 18W Type-C charging.

### 2. Xiaomi Redmi 13C (₦175,000 / $119)
The reliability champion. Powered by the MediaTek Helio G85 chipset, the Redmi 13C provides dependable multitasking, 6GB or 8GB of RAM options, and a respectable 50MP camera.

### 3. Umidigi G5 Mecha (₦160,000 / $110)
For outdoor workers and field agents. Features a massive 6000 mAh battery pack, rugged bumpers, and IP68 water resistance against rain and dust.

### 4. Tecno Pop 8 (₦92,000 / $62)
The undisputed sub-₦100k leader. Punch-hole display, stereo speakers, and clean Android Go software.`,
    author: {
      name: 'GsmScope Editors',
      role: 'Staff Buyers Desk'
    },
    date: '15 Feb 2026',
    readTime: '5 min read',
    tags: ['Budget Phones', 'Under 200k', 'Smart 20', 'Redmi 13C', 'Nigeria'],
    featured: false,
    relatedPhoneIds: ['smart-20', 'xiaomi-redmi-13c', 'umidigi-g5-mecha']
  },
  {
    id: 'art-5g-worth-it-2026',
    title: 'Is 5G worth it in Nigeria in 2026?',
    slug: 'is-5g-worth-it-in-nigeria-in-2026',
    category: 'Tech Updates',
    coverImage: '/src/assets/images/news_mobile_processor_1792578846003.jpg',
    summary: 'Coverage is expanding fastest in Lagos, Abuja and Port Harcourt. Here is when a 5G phone makes sense for you.',
    content: `5G coverage in Nigeria keeps expanding, but it is still concentrated in major commercial capitals: Lagos (Victoria Island, Ikoyi, Lekki, Ikeja), Abuja (Maitama, Wuse, Central Area), Port Harcourt, Kano, and parts of Ibadan.

### When 5G Is Worth It
- **If you work remotely or stream**: Peak speeds exceed 500-700 Mbps on MTN 5G and Airtel 5G, providing fiber-like latency for Zoom meetings and large uploads.
- **Future-proofing**: If you plan to keep your smartphone for 2 to 4 years, buying a 5G device now prevents premature obsolescence.

### When You Can Safely Save Your Money
If you live in semi-urban or rural areas where 4G LTE is the only available network, paying an extra ₦80,000 - ₦150,000 premium solely for a 5G modem is unnecessary. High-performing 4G devices like the Tecno Spark 20 Pro+ offer superior screens and cameras at lower costs.`,
    author: {
      name: 'Tunde Balogun',
      role: 'Telecom Infrastructure Analyst'
    },
    date: '5 Feb 2026',
    readTime: '4 min read',
    tags: ['5G Network', 'MTN', 'Airtel', 'Nigeria Tech', 'Connectivity'],
    featured: false,
    relatedPhoneIds: ['oneplus-12r', 'xiaomi-redmi-note-13-pro-5g']
  },
  {
    id: 'art-s24-ultra-lagos-review',
    title: 'Samsung Galaxy S24 Ultra review: still the camera king?',
    slug: 'samsung-galaxy-s24-ultra-review-still-the-camera-king',
    category: 'Reviews',
    coverImage: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
    summary: 'Six months of daily use in Lagos: how the 200MP camera, the S Pen and the battery hold up in real life.',
    content: `The Galaxy S24 Ultra is Samsung's most expensive non-foldable phone. After six months of navigating Lagos yellow buses, third mainland bridge traffic, high-contrast outdoor sun, and business meetings in Victoria Island, here is our verdict.

### The Gorilla Armor Anti-Reflective Glass
This is arguably the single greatest real-world improvement in modern smartphone displays. Under direct tropical sunlight at Bar Beach or in an open vehicle, you can clearly read emails, edit documents and review photos without squinting or maxing out brightness until your battery dies.

### Battery Life and Charging
The 5000 mAh battery consistently delivers 8 to 9 hours of screen-on-time. With 45W charging, a quick 30-minute top-up before leaving the office gives you 65% juice, easily carrying you through Lagos traffic jams.

### S-Pen Productivity
Signing contracts and PDF documents on the go without finding a cyber cafe or printer has saved our team countless hours.

### The Verdict
At ₦1,850,000 ($1,230), the Galaxy S24 Ultra is an investment for professionals, executives, and power users. With 7 years of promised Android OS upgrades and titanium construction, it remains the most complete smartphone money can buy in Nigeria.`,
    author: {
      name: 'Ada Nwosu',
      role: 'Senior Hardware Reviewer'
    },
    date: '28 Jan 2026',
    readTime: '8 min read',
    tags: ['Samsung', 'Galaxy S24 Ultra', 'Lagos Review', 'Flagship', 'Cameras'],
    featured: true,
    relatedPhoneIds: ['samsung-galaxy-s24-ultra']
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-op-12r',
    phoneId: 'oneplus-12r',
    phoneName: 'OnePlus 12R',
    userName: 'Chinedu Okeke',
    location: 'Lekki, Lagos',
    rating: 5,
    title: 'Incredible battery life and very fast charging',
    comment: 'The 5500 mAh battery easily lasts me through the crazy Lagos traffic, and when it needs a top up, the 100W charger gets it to 100% before I finish breakfast. Screen is very bright outdoors in direct sun.',
    pros: ['100W SUPERVOOC charging', '5500 mAh endurance', 'Snapdragon 8 Gen 2 handles PUBG smoothly'],
    cons: ['No telephoto zoom lens', 'Curved screen can trigger accidental palm touches'],
    date: '10 Feb 2026',
    status: 'approved'
  },
  {
    id: 'rev-s24u',
    phoneId: 'samsung-galaxy-s24-ultra',
    phoneName: 'Samsung Galaxy S24 Ultra',
    userName: 'Ada Nwosu',
    location: 'Victoria Island, Lagos',
    rating: 5,
    title: 'Still the camera king in Lagos',
    comment: 'The antireflective glass is magical. You can read spreadsheets under blinding Abuja sunlight. The 200MP camera and 5x optical zoom capture crisp stage performances and night bridge light trails.',
    pros: ['Gorilla Armor anti-glare screen', 'S-Pen for signing documents', '7-year software updates'],
    cons: ['Very expensive in Naira exchange rate', 'Heavy titanium weight'],
    date: '28 Jan 2026',
    status: 'approved'
  },
  {
    id: 'rev-smart-20',
    phoneId: 'smart-20',
    phoneName: 'Smart 20',
    userName: 'Ibrahim Musa',
    location: 'Kano State',
    rating: 4,
    title: 'Solid daily driver under ₦150k',
    comment: 'For ₦130,000, getting 5200 mAh and a 90Hz punch-hole screen is remarkable value. Sound is loud through the stereo speakers and calls are clear on MTN.',
    pros: ['Big 5200 mAh battery', 'Loud speaker volume', 'Type-C charging'],
    cons: ['Low light camera is average', '18W charging takes about 2 hours'],
    date: '12 Jan 2026',
    status: 'approved'
  },
  {
    id: 'rev-redmi-13c',
    phoneId: 'xiaomi-redmi-13c',
    phoneName: 'Xiaomi Redmi 13C',
    userName: 'Tariq Al-Hassan',
    location: 'Ikeja, Lagos',
    rating: 4,
    title: 'Dependable phone for university student budget',
    comment: 'Does everything I need: WhatsApp, TikTok, PDF textbooks, and banking apps without stuttering. 50MP camera takes clear photos for notes and daylight portraits.',
    pros: ['Helio G85 handles multitasking well', 'Headphone jack included', 'Clean glass-look back'],
    cons: ['Charging brick in box is 10W even though phone supports 18W'],
    date: '18 Jan 2026',
    status: 'approved'
  }
];

export const INITIAL_AD_SETTINGS: AdSettings = {
  topBanner: {
    enabled: true,
    title: 'Price Drop and Launch Alerts',
    subtitle: 'Track live Nigerian Naira (₦) & USD ($) price updates, new phone launches, and verified warranty deals.',
    linkUrl: '#phones',
    tag: 'GSMSCOPE LIVE'
  },
  sidebarBanner: {
    enabled: true,
    title: 'Reach 50,000+ Daily Smartphone Buyers',
    subtitle: 'GsmScope offers sponsored articles, banner placements, and featured device spots across Nigeria.',
    sponsor: 'GsmScope Partner Network',
    linkUrl: '#advertise'
  },
  sponsoredPhoneId: 'oneplus-12r'
};
