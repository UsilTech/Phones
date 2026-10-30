import { useState } from 'react';

interface BrandLogoProps {
  name: string;
  logoUrl?: string;
  className?: string;
}

export default function BrandLogo({ name, logoUrl, className = 'w-5 h-5' }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);
  const brandKey = (name || '').trim().toLowerCase();

  if (logoUrl && logoUrl.trim() && !imgError) {
    return (
      <img
        src={logoUrl.trim()}
        alt={name}
        onError={() => setImgError(true)}
        className={`${className} shrink-0 object-contain rounded-[4px]`}
      />
    );
  }

  switch (brandKey) {
    case 'apple':
      return (
        <svg viewBox="0 0 170 170" className={`${className} shrink-0 fill-current text-slate-800 dark:text-slate-100`}>
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.94-12.04-14.58-6.19-9.5-11.06-20.4-14.6-32.69-3.54-12.3-5.32-23.78-5.32-34.46 0-14.74 3.73-27.08 11.2-37 7.47-9.93 17.06-15.02 28.77-15.28 4.58 0 10.02 1.34 16.32 4.01 6.3 2.68 10.22 4.07 11.77 4.17 1.54 0 5.66-1.46 12.35-4.38 6.69-2.92 12.33-4.22 16.92-3.89 13.08.79 23.47 5.76 31.18 14.93-11.45 6.94-17.05 16.5-16.79 28.69.26 9.68 3.96 17.77 11.09 24.28 7.14 6.51 15.64 10.21 25.5 11.11-2.22 6.66-4.87 13.19-7.94 19.59zM119.22 33.56c0-7.39 2.68-14.36 8.04-20.91 5.36-6.55 11.96-10.77 19.8-12.65.26 1.05.39 2.05.39 3 0 7.39-2.8 14.53-8.4 21.43-5.6 6.89-12.36 10.9-20.28 12.02-.3-1.02-.45-1.99-.45-2.89z" />
        </svg>
      );

    case 'google':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0`}>
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.27 7.31 24 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.04.01 12c0 1.96.45 3.8 1.26 5.42l4.01-3.15z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.73 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
        </svg>
      );

    case 'xiaomi':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[5px] overflow-hidden`}>
          <rect width="24" height="24" rx="5" fill="#FF6900" />
          <path fill="#FFFFFF" d="M6.5 7.5h3.4v5h1.7V7.5H15v9h-3.4v-2.2h-1.7v2.2H6.5v-9zm10 0h1.5v9h-1.5v-9z" />
        </svg>
      );

    case 'oneplus':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#EB0029" />
          <path fill="#FFFFFF" d="M10.8 7v10h1.8V7h-1.8zm-1.6 1.8L7.8 10l-.8-.8 2.4-2.2h1.4v2zM15 11h1.5v-1.5h1V11H19v1h-1.5v1.5h-1V12H15v-1z" />
        </svg>
      );

    case 'honor':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0`}>
          <defs>
            <linearGradient id="honorGrad_common" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00b4d8" />
              <stop offset="50%" stopColor="#7209b7" />
              <stop offset="100%" stopColor="#f72585" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="9.5" fill="none" stroke="url(#honorGrad_common)" strokeWidth="3" />
          <circle cx="12" cy="12" r="4.5" fill="url(#honorGrad_common)" />
        </svg>
      );

    case 'oppo':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[5px] overflow-hidden`}>
          <rect width="24" height="24" rx="5" fill="#008A47" />
          <path fill="#FFFFFF" d="M7.5 9c1.9 0 3.3 1.3 3.3 3s-1.4 3-3.3 3-3.3-1.3-3.3-3 1.4-3 3.3-3zm0 1.5c-1 0-1.8.7-1.8 1.5s.8 1.5 1.8 1.5 1.8-.7 1.8-1.5-.8-1.5-1.8-1.5zm9-1.5c1.9 0 3.3 1.3 3.3 3s-1.4 3-3.3 3-3.3-1.3-3.3-3 1.4-3 3.3-3zm0 1.5c-1 0-1.8.7-1.8 1.5s.8 1.5 1.8 1.5 1.8-.7 1.8-1.5-.8-1.5-1.8-1.5z" />
        </svg>
      );

    case 'tcl':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#E2001A" />
          <text x="12" y="16" fill="#FFFFFF" fontSize="9.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="-0.5">TCL</text>
        </svg>
      );

    case 'huawei':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0`}>
          <g fill="#CF0A2C">
            <path d="M12 2c-.8 2-1.2 4-1 6 .6.3 1.4.3 2 0 .2-2-.2-4-1-6z" />
            <path d="M15.5 3.5c-1.3 1.7-2.1 3.5-2.3 5.6.6.2 1.3.1 1.8-.3 1-1.8 1.4-3.6.5-5.3z" />
            <path d="M18.2 6.5c-1.7 1.2-2.9 2.8-3.4 4.8.6.1 1.2 0 1.6-.5 1.5-1.4 2.2-3.1 1.8-4.3z" />
            <path d="M19.5 10.5c-1.9.6-3.4 1.9-4.2 3.8.5.1 1.1-.1 1.4-.7 1.8-.9 2.7-2.4 2.8-3.1z" />
            <path d="M8.5 3.5c1.3 1.7 2.1 3.5 2.3 5.6-.6.2-1.3.1-1.8-.3-1-1.8-1.4-3.6-.5-5.3z" />
            <path d="M5.8 6.5c1.7 1.2 2.9 2.8 3.4 4.8-.6.1-1.2 0-1.6-.5-1.5-1.4-2.2-3.1-1.8-4.3z" />
            <path d="M4.5 10.5c1.9.6 3.4 1.9 4.2 3.8-.5.1-1.1-.1-1.4-.7-1.8-.9-2.7-2.4-2.8-3.1z" />
            <path d="M9 16.5c1.8.8 4.2.8 6 0-.3.8-.9 1.5-1.6 1.8-1 .4-1.8.4-2.8 0-.7-.3-1.3-1-1.6-1.8z" />
          </g>
        </svg>
      );

    case 'samsung':
      return (
        <svg viewBox="0 0 28 18" className={`${className} shrink-0`}>
          <ellipse cx="14" cy="9" rx="13" ry="8" fill="#0C2340" transform="rotate(-10 14 9)" />
          <text x="14" y="12" fill="#FFFFFF" fontSize="5.8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.4">SAMSUNG</text>
        </svg>
      );

    case 'motorola':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0`}>
          <circle cx="12" cy="12" r="11" fill="#00142E" />
          <path
            fill="#FFFFFF"
            d="M12 7.2c-1.5 2.8-2.9 5.8-4.5 5.8-.9 0-1.5-.6-1.5-1.5 0-1.8 1.9-3.8 3.5-4.8C7.4 7.6 6 9.8 6 12.1c0 2.2 1.4 3.9 3.3 3.9 1.7 0 3-1.6 4-3.5 1 1.9 2.3 3.5 4 3.5 1.9 0 3.3-1.7 3.3-3.9 0-2.3-1.4-4.5-3.5-5.4 1.6 1 3.5 3 3.5 4.8 0 .9-.6 1.5-1.5 1.5-1.6 0-3-3-4.5-5.8-.3-.6-.8-.6-1.1 0z"
          />
        </svg>
      );

    case 'alcatel':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-full overflow-hidden`}>
          <circle cx="12" cy="12" r="11" fill="#00A0D2" />
          <text x="12" y="16.5" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">a</text>
        </svg>
      );

    case 'asus':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#00539B" />
          <text x="12" y="15.5" fill="#FFFFFF" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">ASUS</text>
        </svg>
      );

    case 'infinix':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#059669" />
          <text x="12" y="17" fill="#FFFFFF" fontSize="14" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">i</text>
        </svg>
      );

    case 'iqoo':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#FFC800" />
          <text x="12" y="15" fill="#1E293B" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="-0.5">iQOO</text>
        </svg>
      );

    case 'itel':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#E60012" />
          <text x="12" y="15.5" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontStyle="italic" fontFamily="sans-serif" textAnchor="middle">itel</text>
        </svg>
      );

    case 'oscal':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#0284C7" />
          <text x="12" y="15.5" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">OSCAL</text>
        </svg>
      );

    case 'oukitel':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#EA580C" />
          <text x="12" y="15.5" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">OUKITEL</text>
        </svg>
      );

    case 'realme':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#FFC915" />
          <text x="12" y="17.5" fill="#111827" fontSize="15" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">r</text>
        </svg>
      );

    case 'sony':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#18181B" />
          <text x="12" y="15" fill="#FFFFFF" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.8">SONY</text>
        </svg>
      );

    case 'tecno':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#0066FF" />
          <text x="12" y="15.5" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.2">TECNO</text>
        </svg>
      );

    case 'umidigi':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#6366F1" />
          <text x="12" y="17" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">U</text>
        </svg>
      );

    case 'vivo':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#415FFF" />
          <text x="12" y="15.5" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" fontStyle="italic" fontFamily="sans-serif" textAnchor="middle">vivo</text>
        </svg>
      );

    case 'zte':
      return (
        <svg viewBox="0 0 24 24" className={`${className} shrink-0 rounded-[4px] overflow-hidden`}>
          <rect width="24" height="24" rx="4" fill="#0093DD" />
          <text x="12" y="15.5" fill="#FFFFFF" fontSize="8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">ZTE</text>
        </svg>
      );

    default:
      return (
        <div className={`${className} shrink-0 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs`}>
          {name.charAt(0)}
        </div>
      );
  }
}
