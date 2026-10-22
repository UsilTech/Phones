import React, { useState } from 'react';
import { 
  Megaphone, 
  Users, 
  Eye, 
  TrendingUp, 
  CheckCircle, 
  Mail, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  DollarSign, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdvertiseView() {
  const { setActiveTab, formatNaira, formatUSD } = useApp();
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerBrand, setPartnerBrand] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [formatChosen, setFormatChosen] = useState('Homepage Hero Device Spotlight');
  const [submitted, setSubmitted] = useState(false);

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerEmail && partnerBrand) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setPartnerEmail('');
        setPartnerBrand('');
        setPartnerPhone('');
      }, 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4 animate-fadeIn pb-12">
      {/* 1. Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-2 text-center max-w-3xl mx-auto">
        <span className="text-[11px] font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400">
          Media Partnerships &amp; Sponsorships
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
          Advertise on GsmScope Nigeria
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Position your smartphone brand, retailer outlet, or accessories store in front of high-intent tech buyers actively researching their next phone purchase in Nigeria.
        </p>
      </div>

      {/* 2. Key Audience Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            75,000+
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Monthly Active Readers
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Smartphone shoppers researching budget, mid-range and flagship upgrades before buying.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            82%
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Nigerian Audience
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Heavy concentration across Lagos (Ikeja, Yaba, Lekki), Abuja, Port Harcourt, and Ibadan.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            140K+
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Monthly Specs Sheet Views
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Direct impressions on phone comparison charts and verified Nigerian price guides.
          </p>
        </div>
      </div>

      {/* 3. Sponsorship Formats & Transparent Rate Card */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
              Sponsorship Formats &amp; Placement Rates
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transparent, competitive advertising packages billed in Naira (₦) or US Dollars ($).
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/30">
            Discounts for 3+ Month Commitments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Format 01
                </span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                  ₦180,000 / week ($120)
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Homepage Hero Carousel Spotlight
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Featured position in the main rotating header carousel on the GsmScope homepage. Includes device hero photography, price note, and direct click-through to your store or product landing page.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Estimated impressions: 45,000/week</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Highest Impact</span>
            </div>
          </div>

          {/* Format 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Format 02
                </span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                  ₦250,000 / piece ($165)
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Sponsored Hardware Review &amp; Buying Guide
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dedicated comprehensive article examining your phone’s camera performance, 5G band support, battery tests, and Nigerian retail availability. Permanently indexed on GsmScope and shared to our newsletter.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Permanent SEO &amp; Google Index</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Deep Engagement</span>
            </div>
          </div>

          {/* Format 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Format 03
                </span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                  ₦120,000 / week ($80)
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Top Announcement Banner
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                High-visibility alert banner displayed across all pages. Ideal for flash sales, pre-order launches, Black Friday deals, or retail outlet openings in Computer Village.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Maximum Click-Through Rate</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Broad Reach</span>
            </div>
          </div>

          {/* Format 4 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Format 04
                </span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                  ₦95,000 / month ($65)
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Verified Retailer / Store Listing
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Featured badge and buy button link in the &ldquo;Where to Buy in Nigeria&rdquo; tab on phone detail pages. Connect directly with buyers ready to place an order.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Direct Lead Generation</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">High Conversion</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Inquiry & Media Kit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] mb-2">
            Request an Advertising Proposal
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Tell us about your brand or retail outlet, and our partnerships lead will reach out with a customized campaign proposal.
          </p>

          <form onSubmit={handleInquiry} className="space-y-4">
            {submitted ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 rounded-xl text-emerald-700 dark:text-emerald-300 font-semibold text-center flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Thank you! Our partnerships team will contact you within 4 hours.</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Brand or Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerBrand}
                      onChange={(e) => setPartnerBrand(e.target.value)}
                      placeholder="e.g. Slot Nigeria, Tecno Mobile"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      required
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      placeholder="marketing@brand.com"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={partnerPhone}
                      onChange={(e) => setPartnerPhone(e.target.value)}
                      placeholder="e.g. +234 912 740 8003"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Desired Format
                    </label>
                    <select
                      value={formatChosen}
                      onChange={(e) => setFormatChosen(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Homepage Hero Device Spotlight">Homepage Hero Spotlight</option>
                      <option value="Sponsored Review & Buying Guide">Sponsored Review &amp; Buying Guide</option>
                      <option value="Top Announcement Banner">Top Announcement Banner</option>
                      <option value="Retailer / Store Listing">Verified Retailer Listing</option>
                      <option value="Custom Media Package">Custom 360 Campaign</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Request Rate Card &amp; Media Kit</span>
                </button>
              </>
            )}
          </form>
        </div>

        {/* Contact Info Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#061a11] to-[#0a2a1a] border border-emerald-950 text-white space-y-4 shadow-xl">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400">
            Direct Commercial Line
          </span>
          <h3 className="text-lg font-bold font-['Space_Grotesk']">
            Talk Directly to Our Partnerships Team
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Need immediate placement for a smartphone launch or flash sale? Reach out to our commercial desk:
          </p>

          <div className="space-y-3 pt-2 border-t border-emerald-900/60 text-xs">
            <a
              href="mailto:info@gsmscope.com"
              className="flex items-center gap-2.5 text-slate-200 hover:text-emerald-300 transition-colors"
            >
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono">info@gsmscope.com</span>
            </a>
            <a
              href="tel:+2349127408003"
              className="flex items-center gap-2.5 text-slate-200 hover:text-emerald-300 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono">+2349127408003</span>
            </a>
            <a
              href="https://wa.me/2349127408003"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline pt-1"
            >
              <span>Instant WhatsApp Chat</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-4 border-t border-emerald-900/60 text-[11px] text-slate-400">
            Payment accepted via Nigerian Bank Transfer (NGN) or International Wire / Cards (USD).
          </div>
        </div>
      </div>
    </div>
  );
}
