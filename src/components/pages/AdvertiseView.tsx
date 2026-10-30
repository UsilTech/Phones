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
  ExternalLink,
  Loader2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { submitContactInquiryApi } from '../../services/api';
import { useSeoMeta } from '../seo/SeoMeta';
import FormattedContent from '../common/FormattedContent';

export default function AdvertiseView() {
  const { setActiveTab, formatNaira, formatUSD, startGlobalLoading, stopGlobalLoading, showGlobalToast, websiteContent } = useApp();
  const contactEmail = websiteContent?.contactEmail || 'info@gsmscope.com';
  const contactPhone = websiteContent?.contactPhone || '+2349127408003';
  const whatsappClean = (websiteContent?.whatsappNumber || contactPhone).replace(/[^0-9]/g, '');

  useSeoMeta({
    title: 'Advertise with GsmScope — Reach High-Intent Smartphone Buyers',
    description:
      'Partner with GsmScope to showcase your mobile brand, retail store, or telecom service to high-intent smartphone buyers and tech enthusiasts.',
    type: 'website',
    canonicalPath: '/?tab=advertise',
  });

  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerBrand, setPartnerBrand] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [formatChosen, setFormatChosen] = useState('Homepage Hero Device Spotlight');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!partnerEmail || !partnerBrand) {
      showGlobalToast('Please enter your brand name and email address.', 'error');
      return;
    }

    setIsSubmitting(true);
    startGlobalLoading();

    try {
      await Promise.all([
        submitContactInquiryApi({
          name: partnerBrand,
          email: partnerEmail,
          phone: partnerPhone,
          subject: `Advertising Proposal: ${formatChosen}`,
          message: `Brand/Retailer ${partnerBrand} requested advertising proposal for ${formatChosen}. Contact phone: ${partnerPhone || 'N/A'}`
        }),
        new Promise((res) => setTimeout(res, 450))
      ]);

      setSubmitted(true);
      showGlobalToast('Rate card request received! We will reach out shortly.', 'success');

      setTimeout(() => {
        setSubmitted(false);
        setPartnerEmail('');
        setPartnerBrand('');
        setPartnerPhone('');
      }, 4000);
    } catch {
      showGlobalToast('Failed to submit advertising request. Please contact us directly.', 'error');
    } finally {
      stopGlobalLoading();
      setIsSubmitting(false);
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
          Advertise on GsmScope
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Position your smartphone brand, retailer outlet, or hardware company in front of high-intent tech buyers actively researching their next phone purchase worldwide.
        </p>
      </div>

      {websiteContent?.advertisePageContent && websiteContent.advertisePageContent.trim() && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-sm text-slate-700 dark:text-slate-300">
          <FormattedContent content={websiteContent.advertisePageContent} />
        </div>
      )}

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
            85%+
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Tech Purchase Intent
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Audience actively comparing detailed hardware specs, camera sensor results, and market prices.
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
            Direct impressions on phone comparison charts and verified global pricing guides.
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
          <span className="site-badge text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-px rounded border border-emerald-200 dark:border-emerald-500/30">
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
                Dedicated comprehensive article examining your phone’s camera performance, 5G band support, battery tests, and global retail availability. Permanently indexed on GsmScope and shared to our newsletter.
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
                High-visibility alert banner displayed across all pages. Ideal for flash sales, pre-order launches, hardware announcements, or new retail availability.
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
                Featured badge and buy button link in the &ldquo;Global Pricing &amp; Retailers&rdquo; tab on phone detail pages. Connect directly with buyers ready to place an order.
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
                      placeholder="e.g. Mobile Brand, Authorized Retailer"
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
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Requesting Rate Card...</span>
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-4 h-4" />
                      <span>Request Rate Card &amp; Media Kit</span>
                    </>
                  )}
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
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2.5 text-slate-200 hover:text-emerald-300 transition-colors"
            >
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono">{contactEmail}</span>
            </a>
            <a
              href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-2.5 text-slate-200 hover:text-emerald-300 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono">{contactPhone}</span>
            </a>
            <a
              href={`https://wa.me/${whatsappClean || '2349127408003'}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline pt-1"
            >
              <span>Instant WhatsApp Chat</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-4 border-t border-emerald-900/60 text-[11px] text-slate-400">
            Payment accepted via International Wire, Cards (USD), or local bank transfer.
          </div>
        </div>
      </div>
    </div>
  );
}
