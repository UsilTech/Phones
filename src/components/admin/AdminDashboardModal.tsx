import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Phone, Brand, Article, Review, AdSettings } from '../../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  AlertCircle,
  Smartphone,
  Tag,
  Newspaper,
  MessageSquare,
  DollarSign,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink
} from 'lucide-react';

export default function AdminDashboardModal() {
  const { 
    activeTab,
    setActiveTab,
    isAdminAuthenticated,
    adminLogout,
    phones,
    addPhone,
    updatePhone,
    deletePhone,
    updatePhonePrice,
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    reviews,
    updateReviewStatus,
    deleteReview,
    adSettings,
    updateAdSettings,
    resetToDefaults,
    exportDatabaseJson,
    importDatabaseJson,
    formatNaira
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'phones' | 'pricing' | 'brands' | 'news' | 'reviews' | 'ads' | 'backup'>('phones');
  
  // Quick price update states
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPriceVal, setNewPriceVal] = useState<number>(0);
  const [newPriceNotes, setNewPriceNotes] = useState<string>('');

  // Phone editing / creation form state
  const [isPhoneFormOpen, setIsPhoneFormOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<Partial<Phone> | null>(null);

  // Brand form state
  const [isBrandFormOpen, setIsBrandFormOpen] = useState(false);
  const [brandForm, setBrandForm] = useState<Partial<Brand>>({
    name: '',
    country: 'Nigeria / Global',
    description: '',
    officialPresenceInNigeria: 'Nationwide presence',
    warrantyPartner: 'Authorized Service Center',
    popularSeries: ['Flagship Series'],
    logoLetter: 'N',
    accentBg: 'bg-emerald-600'
  });

  // Article form state
  const [isArticleFormOpen, setIsArticleFormOpen] = useState(false);
  const [articleForm, setArticleForm] = useState<Partial<Article>>({
    title: '',
    category: 'News',
    coverImage: '/src/assets/images/news_nigeria_tech_1792578846595.jpg',
    summary: '',
    content: '',
    author: { name: 'Editorial Desk', role: 'Staff Writer' },
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: '4 min read',
    tags: ['Nigeria', 'Mobile Tech']
  });

  // Notification / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (activeTab !== 'admin' || !isAdminAuthenticated) return null;

  // Initialize phone form with defaults
  const handleOpenAddPhone = () => {
    setEditingPhone({
      id: 'phone-' + Date.now(),
      name: '',
      brand: brands[0]?.name || 'Tecno',
      priceNGN: 250000,
      priceRange: '200k-350k',
      marketStatus: 'Available in Nigeria',
      nairaPriceNotes: 'Official Nigerian Carlcare / Slot warranty.',
      releaseYear: 2025,
      releaseDate: 'January 2025',
      image: '/src/assets/images/hero_flagship_phones_1792578844852.jpg',
      accentColor: '#10b981',
      rating: 4.5,
      reviewsCount: 1,
      viewsCount: 100,
      categories: ['best-budget'],
      isFeatured: false,
      isPopular: true,
      keyHighlights: {
        display: '6.78" 120Hz AMOLED 1080p',
        processor: 'MediaTek Dimensity / Helio',
        ram: '8GB (+8GB)',
        storage: '256GB',
        camera: '50MP OIS + 8MP',
        battery: '5000 mAh',
        charging: '33W Fast Charge',
        os: 'Android 14',
        network5g: true
      },
      detailedSpecs: {
        network: {
          technology: 'GSM / HSPA / LTE / 5G',
          bands5g: 'SA/NSA compatible with MTN & Airtel 5G (n78/n1/n3)',
          speed: 'HSPA, LTE, 5G',
          sim: 'Dual SIM (Nano-SIM, dual stand-by)'
        },
        body: {
          dimensions: '164.0 x 75.0 x 7.9 mm',
          weight: '185 g',
          build: 'Glass front, composite back, polycarbonate frame',
          waterResistance: 'IP54 splash resistant'
        },
        display: {
          type: 'AMOLED, 120Hz, 1200 nits (peak)',
          size: '6.78 inches, 1080 x 2400 pixels',
          resolution: '1080 x 2400 pixels (~395 ppi)',
          protection: 'Corning Gorilla Glass',
          brightness: '1200 nits peak',
          refreshRate: '120Hz'
        },
        platform: {
          os: 'Android 14',
          chipset: 'MediaTek Dimensity / Qualcomm Snapdragon',
          cpu: 'Octa-core',
          gpu: 'Mali / Adreno',
          antutuScore: '520,000 (v10)'
        },
        memory: {
          ramVariants: ['8GB', '12GB'],
          storageVariants: ['128GB', '256GB'],
          cardSlot: 'microSDXC',
          storageType: 'UFS 2.2'
        },
        mainCamera: {
          setup: '50 MP (wide, OIS) + 8 MP (ultrawide) + 2 MP',
          features: 'Dual-LED flash, HDR, Super Night',
          video: '4K@30fps, 1080p@60fps'
        },
        selfieCamera: {
          setup: '32 MP, (wide)',
          features: 'Dual-LED flash',
          video: '1080p@30fps'
        },
        battery: {
          capacity: '5000 mAh',
          charging: '33W wired charging',
          wirelessCharging: 'No'
        },
        sound: {
          loudspeaker: 'Yes, dual stereo speakers',
          jack35mm: 'Yes'
        },
        connectivity: {
          wlan: 'Wi-Fi 802.11 a/b/g/n/ac/6',
          bluetooth: '5.3',
          nfc: 'Yes',
          radio: 'FM radio',
          usb: 'USB Type-C 2.0',
          infrared: 'No'
        },
        sensors: 'Fingerprint (under display), accelerometer, gyro, proximity, compass'
      }
    });
    setIsPhoneFormOpen(true);
  };

  const handleEditPhone = (p: Phone) => {
    setEditingPhone(JSON.parse(JSON.stringify(p)));
    setIsPhoneFormOpen(true);
  };

  const handleSavePhoneForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhone || !editingPhone.name) return;

    const exists = phones.some(p => p.id === editingPhone.id);
    if (exists) {
      updatePhone(editingPhone as Phone);
      showToast(`Updated "${editingPhone.name}" successfully!`);
    } else {
      addPhone(editingPhone as Phone);
      showToast(`Added "${editingPhone.name}" to database!`);
    }
    setIsPhoneFormOpen(false);
    setEditingPhone(null);
  };

  const handleQuickSavePrice = (phoneId: string) => {
    if (newPriceVal <= 0) return;
    updatePhonePrice(phoneId, newPriceVal, undefined, newPriceNotes);
    setEditingPriceId(null);
    showToast('Nigerian Naira price updated successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-['Space_Grotesk']">GsmScope Admin Studio</h2>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-semibold">
                  AUTHENTICATED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Manage phones, Nigerian specs, prices (₦), brands, articles &amp; moderation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Return to public website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
            <button
              onClick={() => adminLogout()}
              className="px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Log out from administrator session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer ml-1"
              title="Close admin panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs py-2 px-6 text-center font-medium">
            {toastMessage}
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/60 overflow-x-auto text-xs font-medium">
          {[
            { id: 'phones', label: 'Phones Database', icon: Smartphone, count: phones.length },
            { id: 'pricing', label: 'Quick Price Manager', icon: DollarSign },
            { id: 'brands', label: 'Brands', icon: Tag, count: brands.length },
            { id: 'news', label: 'News & Guides', icon: Newspaper, count: articles.length },
            { id: 'reviews', label: 'Review Moderation', icon: MessageSquare, count: reviews.filter(r => r.status === 'pending').length },
            { id: 'ads', label: 'Ad Placements', icon: Settings },
            { id: 'backup', label: 'Data Backup', icon: RotateCcw }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`py-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-300">
          
          {/* TAB 1: PHONES DATABASE */}
          {activeAdminTab === 'phones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-sm">Indexed Smartphones ({phones.length})</h3>
                  <p className="text-slate-400 text-[11px]">Add, edit specs, change images, and configure hardware details.</p>
                </div>
                <button
                  onClick={handleOpenAddPhone}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Smartphone</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Phone Name</th>
                      <th className="py-2.5 px-4">Brand</th>
                      <th className="py-2.5 px-4">Nigerian Price</th>
                      <th className="py-2.5 px-4">Chipset</th>
                      <th className="py-2.5 px-4">5G</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {phones.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-300">{p.brand}</td>
                        <td className="py-2.5 px-4 font-mono text-emerald-400 font-bold tabular-nums">
                          {formatNaira(p.priceNGN)}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 truncate max-w-[160px]">
                          {p.keyHighlights.processor}
                        </td>
                        <td className="py-2.5 px-4">
                          {p.keyHighlights.network5g ? (
                            <span className="text-[10px] text-emerald-400 font-semibold">5G YES</span>
                          ) : (
                            <span className="text-[10px] text-slate-500">4G LTE</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditPhone(p)}
                            className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                            title="Edit full phone specifications"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                                deletePhone(p.id);
                                showToast(`Deleted ${p.name}`);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete phone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: QUICK PRICE MANAGER */}
          {activeAdminTab === 'pricing' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm">Nigerian Naira (₦) Real-Time Price Manager</h3>
                <p className="text-slate-400 text-[11px]">
                  Rapidly calibrate retail phone prices in response to Computer Village, Slot, or exchange rate fluctuations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {phones.map((phone) => {
                  const isEditing = editingPriceId === phone.id;
                  return (
                    <div 
                      key={phone.id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="text-[10px] font-mono text-emerald-400">{phone.brand}</span>
                          <h4 className="font-bold text-white text-sm">{phone.name}</h4>
                        </div>
                        <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                          {formatNaira(phone.priceNGN)}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="mt-2 space-y-2 pt-2 border-t border-slate-800">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">New Price in Naira (₦)</label>
                            <input
                              type="number"
                              value={newPriceVal}
                              onChange={(e) => setNewPriceVal(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Market Insight / Warranty Note</label>
                            <input
                              type="text"
                              value={newPriceNotes}
                              onChange={(e) => setNewPriceNotes(e.target.value)}
                              placeholder="e.g. Current retail price at Slot Ikeja with Carlcare coverage"
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-white text-[11px]"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="px-2.5 py-1 bg-slate-800 rounded text-slate-300"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleQuickSavePrice(phone.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              <span>Update Price</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 truncate max-w-[200px]">{phone.nairaPriceNotes}</span>
                          <button
                            onClick={() => {
                              setEditingPriceId(phone.id);
                              setNewPriceVal(phone.priceNGN);
                              setNewPriceNotes(phone.nairaPriceNotes);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-emerald-400 font-semibold"
                          >
                            Edit Price (₦)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BRANDS */}
          {activeAdminTab === 'brands' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-sm">Manufacturer Directory ({brands.length})</h3>
                  <p className="text-slate-400 text-[11px]">Manage brand descriptions, warranty networks, and series.</p>
                </div>
                <button
                  onClick={() => setIsBrandFormOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Brand</span>
                </button>
              </div>

              {isBrandFormOpen && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white">Create / Add New Mobile Brand</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={brandForm.name || ''}
                        onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                        placeholder="e.g. Motorola, Realme, Huawei"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Country / HQ</label>
                      <input
                        type="text"
                        value={brandForm.country || ''}
                        onChange={(e) => setBrandForm({ ...brandForm, country: e.target.value })}
                        placeholder="e.g. United States"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Warranty Partner in Nigeria</label>
                    <input
                      type="text"
                      value={brandForm.warrantyPartner || ''}
                      onChange={(e) => setBrandForm({ ...brandForm, warrantyPartner: e.target.value })}
                      placeholder="e.g. Authorized Warranty Service Center"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsBrandFormOpen(false)}
                      className="px-3 py-1.5 bg-slate-800 rounded text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!brandForm.name) return;
                        addBrand({
                          id: 'brand-' + brandForm.name.toLowerCase().replace(/\s+/g, '-'),
                          name: brandForm.name,
                          slug: brandForm.name.toLowerCase().replace(/\s+/g, '-'),
                          country: brandForm.country || 'Global',
                          description: brandForm.description || 'International smartphone manufacturer.',
                          officialPresenceInNigeria: brandForm.officialPresenceInNigeria || 'Nationwide sales in Nigeria.',
                          popularSeries: brandForm.popularSeries || ['Standard Series'],
                          warrantyPartner: brandForm.warrantyPartner || 'Authorized Service Centers',
                          logoLetter: brandForm.name.charAt(0),
                          accentBg: 'bg-emerald-600'
                        });
                        setIsBrandFormOpen(false);
                        showToast(`Brand "${brandForm.name}" added!`);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold"
                    >
                      Save Brand
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {brands.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{b.name}</h4>
                      <p className="text-[11px] text-slate-400">{b.country}</p>
                      <p className="text-[10px] text-emerald-400 mt-1">{b.warrantyPartner}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete brand ${b.name}?`)) {
                          deleteBrand(b.id);
                          showToast(`Deleted ${b.name}`);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NEWS & GUIDES */}
          {activeAdminTab === 'news' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-sm">Editorial News &amp; Buying Guides ({articles.length})</h3>
                  <p className="text-slate-400 text-[11px]">Publish hardware comparisons, tech reviews, and market insights.</p>
                </div>
                <button
                  onClick={() => setIsArticleFormOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write Article</span>
                </button>
              </div>

              {isArticleFormOpen && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-sm">Compose Tech Article</h4>
                  <div>
                    <label className="block text-slate-400 mb-1">Headline</label>
                    <input
                      type="text"
                      value={articleForm.title || ''}
                      onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                      placeholder="e.g. Tecno Phantom V Fold 2 Nigerian Hands-on Review"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Category</label>
                      <select
                        value={articleForm.category}
                        onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                      >
                        <option value="News">News</option>
                        <option value="Buying Guide">Buying Guide</option>
                        <option value="Comparison">Comparison</option>
                        <option value="Review">Review</option>
                        <option value="Launch">Product Launch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Author Name</label>
                      <input
                        type="text"
                        value={articleForm.author?.name || ''}
                        onChange={(e) => setArticleForm({ 
                          ...articleForm, 
                          author: { name: e.target.value, role: 'Tech Journalist' } 
                        })}
                        placeholder="e.g. Segun Adeyemi"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Summary / Lead</label>
                    <textarea
                      rows={2}
                      value={articleForm.summary || ''}
                      onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                      placeholder="Short teaser for cards and search engine snippets"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Article Body (Prose / Markdown)</label>
                    <textarea
                      rows={5}
                      value={articleForm.content || ''}
                      onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                      placeholder="Write the full tech article here..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white font-sans"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsArticleFormOpen(false)}
                      className="px-3 py-1.5 bg-slate-800 rounded text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!articleForm.title || !articleForm.content) return;
                        addArticle({
                          id: 'art-' + Date.now(),
                          title: articleForm.title,
                          slug: articleForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                          category: articleForm.category || 'News',
                          coverImage: articleForm.coverImage || '/src/assets/images/news_nigeria_tech_1792578846595.jpg',
                          summary: articleForm.summary || 'Smartphone analysis and Nigerian market guide.',
                          content: articleForm.content,
                          author: articleForm.author || { name: 'Staff Reviewer', role: 'Hardware Analyst' },
                          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                          readTime: '5 min read',
                          tags: ['Nigeria', 'Phones', 'Specs'],
                          featured: false
                        });
                        setIsArticleFormOpen(false);
                        showToast(`Published article: "${articleForm.title}"`);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold"
                    >
                      Publish Article
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {articles.map((art) => (
                  <div key={art.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">{art.category}</span>
                      <h4 className="font-bold text-white text-sm">{art.title}</h4>
                      <p className="text-[11px] text-slate-400">{art.author.name} · {art.date}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete article: "${art.title}"?`)) {
                          deleteArticle(art.id);
                          showToast('Article deleted');
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: REVIEW MODERATION */}
          {activeAdminTab === 'reviews' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm">Community Ratings &amp; Review Moderation</h3>
                <p className="text-slate-400 text-[11px]">
                  Approve user reviews before they appear publicly on device pages to filter out fake ratings or spam.
                </p>
              </div>

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rev.userName}</span>
                        <span className="text-slate-500">({rev.location})</span>
                        <span className="text-slate-500">on</span>
                        <span className="text-emerald-400 font-semibold">{rev.phoneName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold ${
                        rev.status === 'approved' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                          : rev.status === 'pending'
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}>
                        {rev.status}
                      </span>
                    </div>

                    <div className="text-amber-400 font-bold">
                      {'★'.repeat(rev.rating)} <span className="text-white text-xs ml-1">{rev.title}</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{rev.comment}</p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                      {rev.status !== 'approved' && (
                        <button
                          onClick={() => {
                            updateReviewStatus(rev.id, 'approved');
                            showToast('Review approved and published.');
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                      {rev.status !== 'rejected' && (
                        <button
                          onClick={() => {
                            updateReviewStatus(rev.id, 'rejected');
                            showToast('Review marked rejected.');
                          }}
                          className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded font-semibold text-xs"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => {
                          deleteReview(rev.id);
                          showToast('Review permanently deleted.');
                        }}
                        className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ADS & MONETIZATION */}
          {activeAdminTab === 'ads' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm">Monetization &amp; Advertisement Placements</h3>
                <p className="text-slate-400 text-[11px]">
                  Configure top header sponsorship bar, sidebar banner ads, and partner links.
                </p>
              </div>

              {/* Top Banner Controls */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">Top Announcement / Sponsor Banner</h4>
                  <button
                    onClick={() => updateAdSettings({
                      ...adSettings,
                      topBanner: { ...adSettings.topBanner, enabled: !adSettings.topBanner.enabled }
                    })}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      adSettings.topBanner.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {adSettings.topBanner.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Banner Title</label>
                    <input
                      type="text"
                      value={adSettings.topBanner.title}
                      onChange={(e) => updateAdSettings({
                        ...adSettings,
                        topBanner: { ...adSettings.topBanner, title: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tag (e.g. SPONSORED, DEALS)</label>
                    <input
                      type="text"
                      value={adSettings.topBanner.tag}
                      onChange={(e) => updateAdSettings({
                        ...adSettings,
                        topBanner: { ...adSettings.topBanner, tag: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Subtitle / Deal Description</label>
                  <input
                    type="text"
                    value={adSettings.topBanner.subtitle}
                    onChange={(e) => updateAdSettings({
                      ...adSettings,
                      topBanner: { ...adSettings.topBanner, subtitle: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
              </div>

              {/* Sidebar Sponsor Controls */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">Sidebar / In-Feed Promotional Card</h4>
                  <button
                    onClick={() => updateAdSettings({
                      ...adSettings,
                      sidebarBanner: { ...adSettings.sidebarBanner, enabled: !adSettings.sidebarBanner.enabled }
                    })}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      adSettings.sidebarBanner.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {adSettings.sidebarBanner.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Campaign Headline</label>
                    <input
                      type="text"
                      value={adSettings.sidebarBanner.title}
                      onChange={(e) => updateAdSettings({
                        ...adSettings,
                        sidebarBanner: { ...adSettings.sidebarBanner, title: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Sponsor Brand Name</label>
                    <input
                      type="text"
                      value={adSettings.sidebarBanner.sponsor}
                      onChange={(e) => updateAdSettings({
                        ...adSettings,
                        sidebarBanner: { ...adSettings.sidebarBanner, sponsor: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Promo Details</label>
                  <input
                    type="text"
                    value={adSettings.sidebarBanner.subtitle}
                    onChange={(e) => updateAdSettings({
                      ...adSettings,
                      sidebarBanner: { ...adSettings.sidebarBanner, subtitle: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: BACKUP, EXPORT & RESET */}
          {activeAdminTab === 'backup' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm">System Storage &amp; Database Backups</h3>
                <p className="text-slate-400 text-[11px]">
                  All edits, prices, phones, and reviews persist in your browser LocalStorage. You can export a JSON backup or restore default seeds.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Export */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <Download className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-white">Export Database JSON</h4>
                  <p className="text-slate-400 text-[11px]">Download all phones, specifications, prices, articles, and reviews as a portable JSON file.</p>
                  <button
                    onClick={() => {
                      const json = exportDatabaseJson();
                      const blob = new Blob([json], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `naijatech-backup-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      showToast('Database exported successfully!');
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-semibold"
                  >
                    Download JSON
                  </button>
                </div>

                {/* Import */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <Upload className="w-5 h-5 text-blue-400" />
                  <h4 className="font-bold text-white">Import Database JSON</h4>
                  <p className="text-slate-400 text-[11px]">Restore or load an existing JSON file to replace or update current contents.</p>
                  <input
                    type="file"
                    accept=".json"
                    id="import-json-input"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content && importDatabaseJson(content)) {
                          showToast('Database imported successfully!');
                        } else {
                          alert('Invalid JSON file format.');
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                  <button
                    onClick={() => document.getElementById('import-json-input')?.click()}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-semibold"
                  >
                    Choose JSON File
                  </button>
                </div>

                {/* Reset Defaults */}
                <div className="p-4 rounded-xl bg-slate-900 border border-rose-900/40 space-y-3">
                  <RotateCcw className="w-5 h-5 text-rose-400" />
                  <h4 className="font-bold text-white">Reset to Default Data</h4>
                  <p className="text-slate-400 text-[11px]">Revert all database records to the initial Nigerian phone models and prices.</p>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all data back to initial seeds? Custom modifications will be cleared.')) {
                        resetToDefaults();
                        showToast('Reset to default seed data completed.');
                      }
                    }}
                    className="w-full py-2 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800/60 rounded-lg font-semibold"
                  >
                    Reset All Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Phone Spec Editor Sub-Dialog */}
        {isPhoneFormOpen && editingPhone && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-base">
                  {editingPhone.id?.startsWith('phone-') ? 'Add New Smartphone' : `Edit: ${editingPhone.name}`}
                </h3>
                <button
                  onClick={() => setIsPhoneFormOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePhoneForm} className="space-y-4 text-xs">
                {/* Basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Phone Name</label>
                    <input
                      type="text"
                      required
                      value={editingPhone.name || ''}
                      onChange={(e) => setEditingPhone({ ...editingPhone, name: e.target.value })}
                      placeholder="e.g. Tecno Camon 30 Premier"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Brand</label>
                    <select
                      value={editingPhone.brand || brands[0]?.name}
                      onChange={(e) => setEditingPhone({ ...editingPhone, brand: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Price in Nigerian Naira (₦)</label>
                    <input
                      type="number"
                      required
                      value={editingPhone.priceNGN || 0}
                      onChange={(e) => setEditingPhone({ ...editingPhone, priceNGN: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Market Status</label>
                    <select
                      value={editingPhone.marketStatus}
                      onChange={(e) => setEditingPhone({ ...editingPhone, marketStatus: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                    >
                      <option value="Available in Nigeria">Available in Nigeria</option>
                      <option value="Pre-order">Pre-order</option>
                      <option value="Coming Soon">Coming Soon</option>
                      <option value="Rumored">Rumored</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Release Year</label>
                    <input
                      type="number"
                      value={editingPhone.releaseYear || 2025}
                      onChange={(e) => setEditingPhone({ ...editingPhone, releaseYear: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">5G Supported?</label>
                    <select
                      value={editingPhone.keyHighlights?.network5g ? 'yes' : 'no'}
                      onChange={(e) => {
                        const val = e.target.value === 'yes';
                        setEditingPhone({
                          ...editingPhone,
                          keyHighlights: { ...editingPhone.keyHighlights!, network5g: val }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                    >
                      <option value="yes">Yes (5G Enabled)</option>
                      <option value="no">No (4G LTE Only)</option>
                    </select>
                  </div>
                </div>

                {/* Naira pricing notes */}
                <div>
                  <label className="block text-slate-400 mb-1">Naira Price Notes &amp; Warranty Context</label>
                  <input
                    type="text"
                    value={editingPhone.nairaPriceNotes || ''}
                    onChange={(e) => setEditingPhone({ ...editingPhone, nairaPriceNotes: e.target.value })}
                    placeholder="e.g. Official Carlcare 13-month warranty in Computer Village & Slot."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                  />
                </div>

                {/* Key specs highlight */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase text-emerald-400">Key Specification Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Display Summary</label>
                      <input
                        type="text"
                        value={editingPhone.keyHighlights?.display || ''}
                        onChange={(e) => setEditingPhone({
                          ...editingPhone,
                          keyHighlights: { ...editingPhone.keyHighlights!, display: e.target.value }
                        })}
                        placeholder="6.78&quot; 144Hz AMOLED"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Processor</label>
                      <input
                        type="text"
                        value={editingPhone.keyHighlights?.processor || ''}
                        onChange={(e) => setEditingPhone({
                          ...editingPhone,
                          keyHighlights: { ...editingPhone.keyHighlights!, processor: e.target.value }
                        })}
                        placeholder="MediaTek Dimensity 8200 Ultimate"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">RAM</label>
                      <input
                        type="text"
                        value={editingPhone.keyHighlights?.ram || ''}
                        onChange={(e) => setEditingPhone({
                          ...editingPhone,
                          keyHighlights: { ...editingPhone.keyHighlights!, ram: e.target.value }
                        })}
                        placeholder="12GB (+12GB Extended)"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Storage</label>
                      <input
                        type="text"
                        value={editingPhone.keyHighlights?.storage || ''}
                        onChange={(e) => setEditingPhone({
                          ...editingPhone,
                          keyHighlights: { ...editingPhone.keyHighlights!, storage: e.target.value }
                        })}
                        placeholder="256GB / 512GB"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Camera Summary</label>
                      <input
                        type="text"
                        value={editingPhone.keyHighlights?.camera || ''}
                        onChange={(e) => setEditingPhone({
                          ...editingPhone,
                          keyHighlights: { ...editingPhone.keyHighlights!, camera: e.target.value }
                        })}
                        placeholder="50MP Sony IMX890 OIS + 50MP UW"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Battery &amp; Charging</label>
                      <input
                        type="text"
                        value={editingPhone.keyHighlights?.battery || ''}
                        onChange={(e) => setEditingPhone({
                          ...editingPhone,
                          keyHighlights: { ...editingPhone.keyHighlights!, battery: e.target.value }
                        })}
                        placeholder="5000 mAh (70W FastCharge)"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPhoneFormOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Smartphone Record</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
