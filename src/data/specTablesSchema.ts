import { Phone } from '../types';

export interface SpecSubtableItem {
  id: string;
  label: string;
  keyPath: string;
  enabled: boolean;
}

export interface SpecTableGroup {
  id: string;
  title: string;
  code: string;
  enabled: boolean;
  subtables: SpecSubtableItem[];
}

export const DEFAULT_SPEC_TABLES: SpecTableGroup[] = [
  {
    id: 'tbl-general',
    title: 'GENERAL',
    code: 'general',
    enabled: true,
    subtables: [
      { id: 'sub-gen-rel', label: 'Release', keyPath: 'releaseDate', enabled: true },
      { id: 'sub-gen-mod', label: 'Model', keyPath: 'modelNumber', enabled: true },
      { id: 'sub-gen-sta', label: 'Status', keyPath: 'marketStatus', enabled: true },
      { id: 'sub-gen-pri', label: 'Price', keyPath: 'priceUSD / priceNGN', enabled: true },
    ],
  },
  {
    id: 'tbl-design',
    title: 'DESIGN',
    code: 'body',
    enabled: true,
    subtables: [
      { id: 'sub-body-dim', label: 'Dimensions', keyPath: 'body.dimensions', enabled: true },
      { id: 'sub-body-weight', label: 'Weight', keyPath: 'body.weight', enabled: true },
      { id: 'sub-body-build', label: 'Build', keyPath: 'body.build', enabled: true },
      { id: 'sub-body-water', label: 'Water Resistance', keyPath: 'body.waterResistance', enabled: true },
    ],
  },
  {
    id: 'tbl-display',
    title: 'DISPLAY',
    code: 'display',
    enabled: true,
    subtables: [
      { id: 'sub-disp-type', label: 'Type', keyPath: 'display.type', enabled: true },
      { id: 'sub-disp-size', label: 'Size', keyPath: 'display.size', enabled: true },
      { id: 'sub-disp-res', label: 'Resolution', keyPath: 'display.resolution', enabled: true },
      { id: 'sub-disp-prot', label: 'Protection', keyPath: 'display.protection', enabled: true },
      { id: 'sub-disp-bri', label: 'Peak Brightness', keyPath: 'display.brightness', enabled: true },
      { id: 'sub-disp-ref', label: 'Refresh Rate', keyPath: 'display.refreshRate', enabled: true },
    ],
  },
  {
    id: 'tbl-camera',
    title: 'CAMERA',
    code: 'camera',
    enabled: true,
    subtables: [
      { id: 'sub-cam-main', label: 'Main Camera Setup', keyPath: 'mainCamera.setup', enabled: true },
      { id: 'sub-cam-feat', label: 'Features', keyPath: 'mainCamera.features', enabled: true },
      { id: 'sub-cam-vid', label: 'Video Capabilities', keyPath: 'mainCamera.video', enabled: true },
      { id: 'sub-cam-selfie', label: 'Front Selfie Camera', keyPath: 'selfieCamera.setup', enabled: true },
      { id: 'sub-cam-selffeat', label: 'Selfie Features', keyPath: 'selfieCamera.features', enabled: true },
      { id: 'sub-cam-selfvid', label: 'Selfie Video', keyPath: 'selfieCamera.video', enabled: true },
    ],
  },
  {
    id: 'tbl-battery',
    title: 'BATTERY',
    code: 'battery',
    enabled: true,
    subtables: [
      { id: 'sub-bat-cap', label: 'Battery Capacity', keyPath: 'battery.capacity', enabled: true },
      { id: 'sub-bat-chg', label: 'Wired Charging', keyPath: 'battery.charging', enabled: true },
      { id: 'sub-bat-wir', label: 'Wireless Charging', keyPath: 'battery.wirelessCharging', enabled: true },
    ],
  },
  {
    id: 'tbl-memory',
    title: 'MEMORY',
    code: 'memory',
    enabled: true,
    subtables: [
      { id: 'sub-mem-ram', label: 'RAM Options', keyPath: 'memory.ramVariants', enabled: true },
      { id: 'sub-mem-rom', label: 'Storage Options', keyPath: 'memory.storageVariants', enabled: true },
      { id: 'sub-mem-type', label: 'Storage Type', keyPath: 'memory.storageType', enabled: true },
      { id: 'sub-mem-slot', label: 'MicroSD Expansion', keyPath: 'memory.cardSlot', enabled: true },
    ],
  },
  {
    id: 'tbl-platform',
    title: 'PLATFORM',
    code: 'platform',
    enabled: true,
    subtables: [
      { id: 'sub-plat-os', label: 'Operating System', keyPath: 'platform.os', enabled: true },
      { id: 'sub-plat-chip', label: 'Chipset', keyPath: 'platform.chipset', enabled: true },
      { id: 'sub-plat-cpu', label: 'CPU', keyPath: 'platform.cpu', enabled: true },
      { id: 'sub-plat-gpu', label: 'GPU', keyPath: 'platform.gpu', enabled: true },
      { id: 'sub-plat-antutu', label: 'AnTuTu Score (v10)', keyPath: 'platform.antutuScore', enabled: true },
    ],
  },
  {
    id: 'tbl-security',
    title: 'SECURITY',
    code: 'security',
    enabled: true,
    subtables: [
      { id: 'sub-sec-bio', label: 'Biometrics', keyPath: 'biometrics', enabled: true },
      { id: 'sub-sec-sen', label: 'Sensors', keyPath: 'sensors', enabled: true },
      { id: 'sub-sec-hw', label: 'Security Hardware', keyPath: 'securityHardware', enabled: true },
    ],
  },
  {
    id: 'tbl-network',
    title: 'NETWORK',
    code: 'network',
    enabled: true,
    subtables: [
      { id: 'sub-net-tech', label: 'Technology', keyPath: 'network.technology', enabled: true },
      { id: 'sub-net-5g', label: '5G Bands', keyPath: 'network.bands5g', enabled: true },
      { id: 'sub-net-spd', label: 'Speed', keyPath: 'network.speed', enabled: true },
      { id: 'sub-net-sim', label: 'SIM Configuration', keyPath: 'network.sim', enabled: true },
    ],
  },
  {
    id: 'tbl-conn',
    title: 'CONNECTIVITY',
    code: 'connectivity',
    enabled: true,
    subtables: [
      { id: 'sub-con-wlan', label: 'WLAN', keyPath: 'connectivity.wlan', enabled: true },
      { id: 'sub-con-bt', label: 'Bluetooth', keyPath: 'connectivity.bluetooth', enabled: true },
      { id: 'sub-con-nfc', label: 'NFC', keyPath: 'connectivity.nfc', enabled: true },
      { id: 'sub-con-usb', label: 'USB', keyPath: 'connectivity.usb', enabled: true },
      { id: 'sub-con-ir', label: 'Infrared port', keyPath: 'connectivity.infrared', enabled: true },
      { id: 'sub-con-pos', label: 'Positioning', keyPath: 'connectivity.positioning', enabled: true },
    ],
  },
  {
    id: 'tbl-multimedia',
    title: 'MULTIMEDIA',
    code: 'sound',
    enabled: true,
    subtables: [
      { id: 'sub-snd-spk', label: 'Loudspeaker', keyPath: 'sound.loudspeaker', enabled: true },
      { id: 'sub-snd-jack', label: '3.5mm Headphone Jack', keyPath: 'sound.jack35mm', enabled: true },
      { id: 'sub-snd-rad', label: 'FM Radio', keyPath: 'connectivity.radio', enabled: true },
      { id: 'sub-snd-aud', label: 'Audio Specs', keyPath: 'sound.audioSpecs', enabled: true },
    ],
  },
];

export function getEffectiveSpecTablesSchema(schemaFromContent?: any): SpecTableGroup[] {
  if (Array.isArray(schemaFromContent) && schemaFromContent.length > 0) {
    return schemaFromContent;
  }
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('gsmscope_spec_tables_schema_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }
  return DEFAULT_SPEC_TABLES;
}

export function getSpecPlaceholder(keyPath: string, label?: string): string {
  const placeholders: Record<string, string> = {
    releaseDate: 'e.g. 2025, January',
    modelNumber: 'e.g. SM-S928B',
    marketStatus: 'Available',
    'body.dimensions': '162.3 x 79.0 x 8.6 mm',
    'body.weight': '232 g',
    'body.build': 'Glass front, titanium frame, glass back',
    'body.waterResistance': 'IP68 dust/water resistant (up to 1.5m for 30 min)',
    'display.type': 'Dynamic LTPO AMOLED 2X, 120Hz, HDR10+',
    'display.size': '6.8 inches, 114.7 cm² (~88.5% screen-to-body ratio)',
    'display.resolution': '1440 x 3120 pixels, 19.5:9 ratio (~505 ppi density)',
    'display.protection': 'Corning Gorilla Glass Armor',
    'display.brightness': '2600 nits (peak)',
    'display.refreshRate': '1Hz - 120Hz adaptive',
    'platform.os': 'Android 15, up to 7 major upgrades',
    'platform.chipset': 'Qualcomm SM8650-AC Snapdragon 8 Gen 3 (4 nm)',
    'platform.cpu': '8-core (1x3.39GHz Cortex-X4 & 3x3.1GHz Cortex-A720...)',
    'platform.gpu': 'Adreno 750 (1 GHz)',
    'platform.antutuScore': '1,823,822 (AnTuTu v10)',
    'memory.ramVariants': '8GB, 12GB, 16GB',
    'memory.storageVariants': '128GB, 256GB, 512GB, 1TB',
    'memory.storageType': 'UFS 4.0 / NVMe',
    'memory.cardSlot': 'No or microSDXC (dedicated slot)',
    'mainCamera.setup': '200 MP, f/1.7 (wide) OIS + 50 MP (periscope telephoto) 5x zoom + 12 MP (ultrawide)',
    'mainCamera.features': 'Laser AF, LED flash, auto-HDR, panorama',
    'mainCamera.video': '8K@24/30fps, 4K@30/60/120fps, 1080p@30/60/240fps, HDR10+',
    'selfieCamera.setup': '12 MP, f/2.2, 26mm (wide), Dual Pixel PDAF',
    'selfieCamera.features': 'Auto-HDR, HDR10+',
    'selfieCamera.video': '4K@30/60fps, 1080p@30fps',
    'battery.capacity': 'Li-Ion 5000 mAh, non-removable',
    'battery.charging': '45W wired, PD3.0, 65% in 30 min',
    'battery.wirelessCharging': '15W wireless (Qi/PMA), 4.5W reverse wireless',
    'network.technology': 'GSM / CDMA / HSPA / EVDO / LTE / 5G',
    'network.bands5g': 'SA/NSA/Sub6, Bands n1, n3, n5, n7, n8, n20, n28, n38, n40, n41, n77, n78',
    'network.speed': 'HSPA 42.2/5.76 Mbps, LTE-A, 5G',
    'network.sim': 'Dual SIM (2 Nano-SIMs + eSIM, dual stand-by)',
    'connectivity.wlan': 'Wi-Fi 802.11 a/b/g/n/ac/6e/7, tri-band',
    'connectivity.bluetooth': '5.3, A2DP, LE',
    'connectivity.nfc': 'Yes',
    'connectivity.usb': 'USB Type-C 3.2, DisplayPort 1.2, OTG',
    'connectivity.infrared': 'Yes or No',
    'connectivity.radio': 'No or FM radio',
    'connectivity.positioning': 'GPS (L1+L5), GLONASS, BDS, GALILEO, QZSS',
    'sound.loudspeaker': 'Yes, with stereo speakers',
    'sound.jack35mm': 'No or Yes',
    'sound.audioSpecs': '32-bit/384kHz audio, Tuned by AKG, Dolby Atmos',
    biometrics: 'Fingerprint (under display, ultrasonic) / Face ID',
    securityHardware: 'Samsung Knox Vault / Apple Secure Enclave',
    sensors: 'Fingerprint, accelerometer, gyro, proximity, compass, barometer',
  };
  return placeholders[keyPath] || (label ? `Enter ${label}...` : 'Enter specification value...');
}

export function getPhoneSpecEditorValue(phone: Phone, keyPath: string): string {
  const specs: any = phone.detailedSpecs || {};
  switch (keyPath) {
    case 'releaseDate':
      return phone.releaseDate || '';
    case 'modelNumber':
      return phone.modelNumber || '';
    case 'marketStatus':
      return phone.marketStatus || 'Available';
    case 'biometrics':
    case 'security.biometrics':
      return specs.biometrics ?? specs.security?.biometrics ?? '';
    case 'sensors':
    case 'security.sensors':
      return specs.sensors ?? specs.security?.sensors ?? '';
    case 'securityHardware':
    case 'security.securityHardware':
      return specs.securityHardware ?? specs.security?.securityHardware ?? '';
    case 'connectivity.radio':
    case 'sound.radio':
      return specs.connectivity?.radio ?? specs.sound?.radio ?? '';
    default: {
      if (keyPath.includes('.')) {
        const [groupKey, ...rest] = keyPath.split('.');
        const fieldKey = rest.join('.');
        const groupVal = specs[groupKey];
        if (groupVal && typeof groupVal === 'object') {
          const val = groupVal[fieldKey];
          if (Array.isArray(val)) return val.join(', ');
          return val !== undefined && val !== null ? String(val) : '';
        }
        return specs[keyPath] !== undefined ? String(specs[keyPath]) : '';
      }
      if (keyPath in specs && typeof specs[keyPath] !== 'object') {
        return String(specs[keyPath] ?? '');
      }
      if (keyPath in (phone as any) && typeof (phone as any)[keyPath] !== 'object') {
        return String((phone as any)[keyPath] ?? '');
      }
      return '';
    }
  }
}

export function setPhoneSpecEditorValue(phone: Phone, keyPath: string, value: string): Phone {
  const specs: any = { ...(phone.detailedSpecs || {}) };
  if (keyPath === 'releaseDate') {
    return { ...phone, releaseDate: value };
  }
  if (keyPath === 'modelNumber') {
    return { ...phone, modelNumber: value };
  }
  if (keyPath === 'marketStatus') {
    return { ...phone, marketStatus: value };
  }
  if (keyPath === 'biometrics' || keyPath === 'security.biometrics') {
    return { ...phone, detailedSpecs: { ...specs, biometrics: value } };
  }
  if (keyPath === 'sensors' || keyPath === 'security.sensors') {
    return { ...phone, detailedSpecs: { ...specs, sensors: value } };
  }
  if (keyPath === 'securityHardware' || keyPath === 'security.securityHardware') {
    return { ...phone, detailedSpecs: { ...specs, securityHardware: value } };
  }
  if (keyPath === 'connectivity.radio' || keyPath === 'sound.radio') {
    return {
      ...phone,
      detailedSpecs: {
        ...specs,
        connectivity: { ...(specs.connectivity || {}), radio: value },
      },
    };
  }
  if (keyPath.includes('.')) {
    const [groupKey, ...rest] = keyPath.split('.');
    const fieldKey = rest.join('.');
    const currentGroup =
      specs[groupKey] && typeof specs[groupKey] === 'object' ? { ...specs[groupKey] } : {};
    currentGroup[fieldKey] = value;
    return {
      ...phone,
      detailedSpecs: {
        ...specs,
        [groupKey]: currentGroup,
      },
    };
  }
  return {
    ...phone,
    detailedSpecs: {
      ...specs,
      [keyPath]: value,
    },
  };
}

export function getPhoneSpecDisplayValue(
  phone: Phone,
  keyPath: string,
  helpers: {
    formatUSD: (n: number) => string;
    formatNaira: (n: number) => string;
    getDeviceModelNumber: (p: Phone) => string;
    hasSeparateStorageTypeRow?: boolean;
  }
): string {
  const specs: any = phone.detailedSpecs || {};
  switch (keyPath) {
    case 'releaseDate':
      return phone.releaseDate || String(phone.releaseYear || '');
    case 'modelNumber':
      return phone.modelNumber || helpers.getDeviceModelNumber(phone);
    case 'marketStatus':
      return phone.marketStatus?.toLowerCase().includes('discontinued')
        ? 'Discontinued'
        : phone.marketStatus || 'Available';
    case 'priceUSD / priceNGN':
      return `${helpers.formatUSD(phone.priceUSD)} / ${helpers.formatNaira(phone.priceNGN)}`;
    case 'memory.ramVariants':
      return Array.isArray(specs.memory?.ramVariants) && specs.memory.ramVariants.length > 0
        ? specs.memory.ramVariants.join(', ')
        : phone.keyHighlights.ram;
    case 'memory.storageVariants': {
      const variants =
        Array.isArray(specs.memory?.storageVariants) && specs.memory.storageVariants.length > 0
          ? specs.memory.storageVariants.join(', ')
          : phone.keyHighlights.storage;
      if (!helpers.hasSeparateStorageTypeRow && specs.memory?.storageType) {
        return `${variants} (${specs.memory.storageType})`;
      }
      return variants;
    }
    case 'memory.storageType':
      return specs.memory?.storageType || 'UFS';
    case 'memory.cardSlot':
      return specs.memory?.cardSlot || 'No';
    case 'platform.antutuScore':
      return specs.platform?.antutuScore || 'N/A';
    case 'biometrics':
    case 'security.biometrics':
      return (
        specs.biometrics ||
        specs.security?.biometrics ||
        (specs.sensors?.toLowerCase().includes('face id')
          ? 'Face ID (3D facial structured recognition)'
          : specs.sensors?.toLowerCase().includes('fingerprint')
          ? specs.sensors?.toLowerCase().includes('under display')
            ? 'Fingerprint (under display, optical/ultrasonic)'
            : 'Fingerprint (side-mounted / capacitive)'
          : 'Biometric Screen Authentication')
      );
    case 'sensors':
    case 'security.sensors':
      return specs.sensors || specs.security?.sensors || '';
    case 'securityHardware':
    case 'security.securityHardware':
      return (
        specs.securityHardware ||
        specs.security?.securityHardware ||
        (phone.brand.toLowerCase() === 'apple'
          ? 'Apple Secure Enclave, Face ID TrueDepth'
          : phone.brand.toLowerCase() === 'google'
          ? 'Titan M2 security coprocessor'
          : phone.brand.toLowerCase() === 'samsung'
          ? 'Samsung Knox Vault, EAL5+ certified'
          : 'Hardware-backed Keystore & ARM TrustZone TEE')
      );
    case 'connectivity.wlan':
      return specs.connectivity?.wlan || 'Wi-Fi 802.11 a/b/g/n/ac/6, dual-band, Wi-Fi Direct';
    case 'connectivity.bluetooth':
      return specs.connectivity?.bluetooth || '5.3, A2DP, LE';
    case 'connectivity.nfc':
      return specs.connectivity?.nfc || 'Yes (market/region dependent)';
    case 'connectivity.usb':
      return specs.connectivity?.usb || 'USB Type-C 2.0, OTG';
    case 'connectivity.infrared':
      return (
        specs.connectivity?.infrared ||
        (phone.brand.toLowerCase() === 'xiaomi' || phone.brand.toLowerCase() === 'tecno'
          ? 'Yes'
          : 'No')
      );
    case 'connectivity.positioning':
      return specs.connectivity?.positioning || 'GPS (L1+L5), GLONASS, BDS, GALILEO, QZSS, NavIC';
    case 'connectivity.radio':
    case 'sound.radio':
      return specs.connectivity?.radio || specs.sound?.radio || 'No';
    case 'sound.loudspeaker':
      return specs.sound?.loudspeaker || 'Yes, with stereo speakers';
    case 'sound.jack35mm':
      return specs.sound?.jack35mm || 'No';
    case 'sound.audioSpecs':
      return (
        specs.sound?.audioSpecs ||
        (phone.priceUSD >= 700
          ? '32-bit/384kHz Hi-Res audio, Dolby Atmos stereo tuning'
          : '24-bit/192kHz Hi-Res audio')
      );
    default:
      return getPhoneSpecEditorValue(phone, keyPath);
  }
}
