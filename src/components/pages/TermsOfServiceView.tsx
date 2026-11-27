import { Scale, CheckCircle2, AlertCircle, FileText, Globe2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSeoMeta } from '../seo/SeoMeta';
import FormattedContent from '../common/FormattedContent';

export default function TermsOfServiceView() {
  const { websiteContent } = useApp();

  useSeoMeta({
    title: 'Terms of Service — Platform Usage & Legal Agreement',
    description:
      'Review the GsmScope Terms of Service governing access to our smartphone specification database, price trackers, comparison tools, and user reviews.',
    type: 'website',
    canonicalPath: '/?tab=terms',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold uppercase">
          <Scale className="w-4 h-4" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Last Updated: October 26, 2026 · Effective Date: January 1, 2026
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {websiteContent?.termsOfServiceContent && websiteContent.termsOfServiceContent.trim() && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <FormattedContent content={websiteContent.termsOfServiceContent} />
          </div>
        )}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p>
            By accessing or using <strong>GsmScope</strong> (the "Platform", "Service", or "gsmscope.com"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you disagree with any part of these terms, you may not access our services.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>2. Intellectual Property &amp; Database Content</span>
          </h2>
          <p>
            The device specification database, editorial benchmarks, comparison matrices, scoring algorithms, and written reviews published on GsmScope are protected by copyright, database rights, and intellectual property laws. You may browse, share links, and use specification summaries for personal, non-commercial purposes with appropriate attribution. Automated web scraping, bulk harvesting, or mirroring without prior written permission is prohibited.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-500" />
            <span>3. Accuracy of Specifications &amp; Pricing Disclaimer</span>
          </h2>
          <p>
            While our editorial team strives for 100% precision in hardware details, smartphone manufacturers frequently modify components, carrier band support, and regional specifications across different market releases.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 text-xs">
            <li>
              <strong>Pricing Estimates:</strong> Prices listed in US Dollars ($) and local currencies are representative market indicators based on verified retail channels. Street prices may vary based on currency exchange fluctuations, import duties, and retailer promotions.
            </li>
            <li>
              <strong>Purchase Decisions:</strong> Always verify precise variant configurations (RAM, storage, network band compatibility) with your local retailer or carrier prior to purchase.
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-emerald-500" />
            <span>4. Community Guidelines &amp; User Comments</span>
          </h2>
          <p>
            Users may submit reviews and ratings for smartphones. Submissions containing profanity, defamatory statements, false advertising, hate speech, or spam will be removed by our moderation team.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-500" />
            <span>5. Limitation of Liability &amp; Governing Law</span>
          </h2>
          <p>
            In no event shall GsmScope, its founders, or contributors be liable for any indirect, incidental, or consequential damages resulting from your use of information obtained through the platform. These terms are governed by the laws applicable to digital information services.
          </p>
        </div>
      </div>
    </div>
  );
}
