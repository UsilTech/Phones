import { ShieldCheck, Lock, Eye, FileText, Bell, Globe2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSeoMeta } from '../seo/SeoMeta';
import FormattedContent from '../common/FormattedContent';

export default function PrivacyPolicyView() {
  const { websiteContent } = useApp();

  useSeoMeta({
    title: 'Privacy Policy — Data Protection & Transparency',
    description:
      'Read the GsmScope Privacy Policy to understand how we protect visitor privacy, handle newsletter subscriptions, and secure community review data.',
    type: 'website',
    canonicalPath: '/?tab=privacy',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>Legal &amp; Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Last Updated: October 26, 2026 · Effective Date: January 1, 2026
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {websiteContent?.privacyPolicyContent && websiteContent.privacyPolicyContent.trim() && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <FormattedContent content={websiteContent.privacyPolicyContent} />
          </div>
        )}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>1. Overview &amp; Commitment</span>
          </h2>
          <p>
            At <strong>GsmScope</strong>, accessible at gsmscope.com, the privacy of our visitors and community members is of utmost importance. This Privacy Policy outlines the types of information collected, recorded, and utilized when you browse our smartphone database, read hardware reviews, use comparison tools, or subscribe to alerts.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-500" />
            <span>2. Information We Collect</span>
          </h2>
          <p>We collect minimal personal data strictly necessary to provide our services:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 text-xs">
            <li>
              <strong>Device &amp; Usage Information:</strong> When browsing GsmScope, we may automatically collect browser type, operating system, referring URLs, pages viewed, and device viewports to optimize responsive presentation.
            </li>
            <li>
              <strong>Newsletter Subscriptions:</strong> If you voluntarily subscribe to our price drop and launch alerts, we store your email address solely to deliver requested updates.
            </li>
            <li>
              <strong>User Comments &amp; Community Reviews:</strong> When submitting reviews or user feedback, we collect the name or pseudonym provided along with your comments.
            </li>
            <li>
              <strong>Preferences:</strong> We store your preferred display currency (NGN or USD) and theme choice (Dark or Light) locally on your device via browser storage.
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>3. How We Use Your Information</span>
          </h2>
          <p>The information we collect is used to:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 text-xs">
            <li>Operate, maintain, and enhance our global mobile specifications database.</li>
            <li>Send periodic market intelligence, new phone launches, and price comparison alerts.</li>
            <li>Prevent fraud, abusive automated scraping, and maintain catalog security.</li>
            <li>Analyze aggregate usage trends to understand which smartphone categories are most sought after.</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-emerald-500" />
            <span>4. Cookies and Web Storage</span>
          </h2>
          <p>
            GsmScope uses standard web storage to store session preferences such as currency conversion choice and dark mode toggle. We do not sell, rent, or trade your personal information to third parties.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-500" />
            <span>5. Contact &amp; Data Rights</span>
          </h2>
          <p>
            You have the right to request access to any personal data held about you or ask for your newsletter subscription to be removed at any time. For questions regarding this policy, contact our compliance team at <a href={`mailto:${websiteContent?.contactEmail?.trim() || 'info@gsmscope.com'}`} className="text-emerald-500 underline font-mono">{websiteContent?.contactEmail?.trim() || 'info@gsmscope.com'}</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
