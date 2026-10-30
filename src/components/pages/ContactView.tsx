import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Check, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import { submitContactInquiryApi } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useSeoMeta } from '../seo/SeoMeta';
import FormattedContent from '../common/FormattedContent';

export default function ContactView() {
  const { startGlobalLoading, stopGlobalLoading, showGlobalToast, websiteContent } = useApp();
  const contactEmail = websiteContent?.contactEmail?.trim() || 'info@gsmscope.com';
  const contactPhone = websiteContent?.contactPhone?.trim() || '+2349127408003';
  const whatsappClean = (websiteContent?.whatsappNumber || contactPhone).replace(/[^0-9]/g, '') || '2349127408003';
  const officeLocation = websiteContent?.officeLocation?.trim() || 'Sokoto, Nigeria';

  useSeoMeta({
    title: 'Contact GsmScope — Price Updates, Database Corrections & Support',
    description:
      'Get in touch with the GsmScope editorial and database team to report smartphone price updates, request device reviews, or ask technical questions.',
    type: 'website',
    canonicalPath: '/?tab=contact',
  });

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [subject, setSubject] = useState('Price Correction or Database Update');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    if (!email || !message) {
      showGlobalToast('Please fill out your email and message.', 'error');
      return;
    }

    setIsSending(true);
    startGlobalLoading();

    try {
      await Promise.all([
        submitContactInquiryApi({
          name,
          email,
          phone: phoneInput,
          subject,
          message
        }),
        new Promise((res) => setTimeout(res, 450))
      ]);

      setSent(true);
      showGlobalToast('Message sent to GsmScope editorial desk!', 'success');

      setTimeout(() => {
        setSent(false);
        setEmail('');
        setName('');
        setPhoneInput('');
        setMessage('');
      }, 4000);
    } catch {
      showGlobalToast('Failed to send message. Please try again or email us directly.', 'error');
    } finally {
      stopGlobalLoading();
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4 animate-fadeIn pb-12">
      {/* 1. Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-2 text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400">
          Reach Our Editorial Team
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
          Contact GsmScope
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Have questions, smartphone specification updates, hardware review proposals, or advertising inquiries? Get in touch with our team.
        </p>
      </div>

      {websiteContent?.contactPageContent && websiteContent.contactPageContent.trim() && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-sm text-slate-700 dark:text-slate-300">
          <FormattedContent content={websiteContent.contactPageContent} />
        </div>
      )}

      {/* 2. Direct Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Email Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk']">
              Direct Email
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Send us press releases, device corrections, and business inquiries.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <a 
              href={`mailto:${contactEmail}`} 
              className="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline text-sm block"
            >
              {contactEmail}
            </a>
            <span className="text-[11px] text-slate-400 block mt-0.5">Average reply time: under 4 hours</span>
          </div>
        </div>

        {/* Phone & WhatsApp Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk']">
              Phone &amp; WhatsApp
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Call our editorial desk or chat directly with our staff on WhatsApp.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <a 
              href={`tel:${contactPhone}`} 
              className="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline text-sm block"
            >
              {contactPhone}
            </a>
            <a
              href={`https://wa.me/${whatsappClean}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              <span>Chat on WhatsApp</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Office Location Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk']">
              Location
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {officeLocation}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Mon – Sat: 8:00 AM – 6:00 PM WAT</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Contact Form & Contact Overview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] mb-2">
            Send an Inquiry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Fill out the details below and our team will get back to you promptly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {sent ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 rounded-xl text-emerald-700 dark:text-emerald-300 font-semibold text-center flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Thank you! Your message has been received by GsmScope.</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Phone / WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="Your phone number"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Price Correction or Database Update">Price Correction / Street Market Update</option>
                      <option value="Device Review Request">Device Review Request</option>
                      <option value="Advertising or Sponsored Inquiry">Advertising / Sponsored Placement</option>
                      <option value="Retail Partnership">Retailer / Stockist Listing</option>
                      <option value="General Question">General Editorial Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about the phone model, street price sighting, or partnership proposal..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message to GsmScope</span>
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        </div>

        {/* Official Contact Details & Editorial Standards Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk']">
              Official Contact Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Location</span>
                  <span className="text-slate-600 dark:text-slate-300 mt-0.5 block">{officeLocation}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 flex items-start gap-3">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Email</span>
                  <a href={`mailto:${contactEmail}`} className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold hover:underline block mt-0.5">
                    {contactEmail}
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Phone Number</span>
                  <a href={`tel:${contactPhone}`} className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold hover:underline block mt-0.5">
                    {contactPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Guarantee */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#061a11] to-[#0a2a1a] border border-emerald-950 text-white space-y-2.5 shadow-md">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-sm font-['Space_Grotesk']">
                Accuracy &amp; Correction Guarantee
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every price or specification report submitted is reviewed by our hardware analysts within 24 hours. Verified changes immediately reflect in the public database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
