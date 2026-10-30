import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SocialShareBarProps {
  title?: string;
  path?: string;
  className?: string;
}

export default function SocialShareBar({ title, path, className = '' }: SocialShareBarProps) {
  const { activeTab, selectedPhone, selectedArticle, selectedBrand, showGlobalToast } = useApp();
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://gsmscope.com';

  // Resolve canonical path dynamically if not explicitly provided
  const resolvedPath = (() => {
    if (path) return path;
    if (selectedArticle) {
      return `/?article=${encodeURIComponent(selectedArticle.slug || selectedArticle.id)}`;
    }
    if (selectedPhone) {
      return `/?phone=${encodeURIComponent((selectedPhone as any).slug || selectedPhone.id)}`;
    }
    if (activeTab === 'brands' && selectedBrand) {
      return `/?tab=brands&brand=${encodeURIComponent(selectedBrand.name)}`;
    }
    if (activeTab && activeTab !== 'home') {
      return `/?tab=${encodeURIComponent(activeTab)}`;
    }
    return '/';
  })();

  const shareUrl = `${origin}${resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`}`;

  // Resolve share title dynamically if not explicitly provided
  const shareTitle = (() => {
    if (title) return title;
    if (selectedArticle) return `${selectedArticle.title} — GsmScope`;
    if (selectedPhone) return `${selectedPhone.name} Full Specifications & Price — GsmScope`;
    if (activeTab === 'brands' && selectedBrand) return `${selectedBrand.name} Smartphones — GsmScope`;
    if (typeof document !== 'undefined' && document.title) return document.title;
    return 'GsmScope — Global Phone Specs, Reviews and Prices';
  })();

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  const encodedWhatsappText = encodeURIComponent(`${shareTitle} ${shareUrl}`);

  const facebookShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const xShareHref = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const telegramShareHref = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
  const whatsappShareHref = `https://api.whatsapp.com/send?text=${encodedWhatsappText}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      showGlobalToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showGlobalToast('Could not copy link. Please try again.', 'error');
    }
  };

  return (
    <div
      aria-label="Share this page"
      className={`w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 shadow-sm ${className}`}
    >
      {/* Single fill center row across all devices */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5 w-full items-center justify-center">
        {/* 1. Facebook */}
        <a
          href={facebookShareHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          title="Share on Facebook"
          className="w-full h-9 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.98] text-white flex items-center justify-center px-2 transition-all shadow-xs cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>

        {/* 2. X / Twitter */}
        <a
          href={xShareHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X (Twitter)"
          title="Share on X (Twitter)"
          className="w-full h-9 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-black dark:hover:bg-slate-900 border border-slate-800 active:scale-[0.98] text-white flex items-center justify-center px-2 transition-all shadow-xs cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>

        {/* 3. Telegram */}
        <a
          href={telegramShareHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Telegram"
          title="Share on Telegram"
          className="w-full h-9 rounded-xl bg-[#229ED9] hover:bg-[#1e8fc4] active:scale-[0.98] text-white flex items-center justify-center px-2 transition-all shadow-xs cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </a>

        {/* 4. WhatsApp */}
        <a
          href={whatsappShareHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
          className="w-full h-9 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] text-white flex items-center justify-center px-2 transition-all shadow-xs cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.124.553 4.197 1.604 6.023L.098 24l6.105-1.601a11.983 11.983 0 0 0 5.828 1.51h.005c6.645 0 12.03-5.385 12.03-12.031 0-3.214-1.252-6.236-3.524-8.509C18.268 1.252 15.245 0 12.031 0zm6.564 17.243c-.276.779-1.604 1.491-2.238 1.587-.585.088-1.326.125-2.14-.134-.493-.157-1.125-.366-1.936-.716-3.407-1.471-5.632-4.901-5.802-5.128-.17-.227-1.385-1.842-1.385-3.514 0-1.672.877-2.494 1.188-2.834.311-.34.679-.425.905-.425.226 0 .453.002.651.012.209.01.488-.079.764.582.283.68.962 2.352 1.047 2.522.085.17.142.368.028.595-.113.227-.17.368-.34.567-.17.198-.357.442-.51.595-.17.17-.347.354-.149.694.198.34.88 1.452 1.889 2.352 1.298 1.157 2.392 1.516 2.732 1.686.34.17.538.142.736-.085.198-.227.849-.992 1.075-1.332.226-.34.453-.283.764-.17.311.113 1.981.935 2.321 1.105.34.17.566.255.651.397.085.141.085.821-.191 1.6z" />
          </svg>
        </a>

        {/* 5. Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label="Copy page link"
          title="Copy link"
          className={`w-full h-9 rounded-xl flex items-center justify-center px-2 transition-all shadow-xs cursor-pointer active:scale-[0.98] border ${
            copied
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
          }`}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          ) : (
            <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
}
