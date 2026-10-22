import { 
  ShieldCheck, 
  Database, 
  Scale, 
  Globe2, 
  MapPin, 
  Award, 
  Mail, 
  Phone, 
  Cpu, 
  Battery, 
  Wifi, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AboutView() {
  const { setActiveTab } = useApp();

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4 animate-fadeIn pb-12">
      {/* 1. Page Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-2 text-center max-w-3xl mx-auto">
        <span className="text-[11px] font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400">
          About GsmScope
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
          Nigeria&apos;s Independent Mobile Technology Authority
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          GsmScope is built to provide Nigerian smartphone shoppers, retailers, and tech enthusiasts with reliable hardware specifications, authentic street market prices, and rigorous real-world reviews.
        </p>
      </div>

      {/* 2. Core Mission & Nigerian Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Solving the Nigerian Smartphone Buying Challenge
          </h2>
          <p>
            Purchasing a mobile phone in Nigeria involves navigating rapid exchange rate shifts between the Naira and US Dollar, varying street pricing between retail chains like <strong>Slot Systems</strong>, online platforms like <strong>Jumia</strong>, and open markets such as <strong>Ikeja Computer Village</strong>.
          </p>
          <p>
            Additionally, buyers must verify critical local factors: whether a device supports <strong>MTN and Airtel 5G network bands (Band n78 / Band n28)</strong>, whether its battery can endure local power outages, and whether official warranty repairs are supported by centers like <strong>Carlcare</strong> or <strong>Samsung Experience Centers</strong>.
          </p>
          <p>
            At <strong>GsmScope</strong>, we bridge this gap by conducting hands-on empirical testing, maintaining live price trackers in both Nigerian Naira (₦) and US Dollars ($), and publishing unbiased verdicts without corporate influence.
          </p>
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#061a11] to-[#0a2a1a] border border-emerald-950 text-white space-y-4 shadow-xl">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400">
            Our Commitment
          </span>
          <h3 className="text-lg font-bold font-['Space_Grotesk']">
            100% Verified Hardware Benchmarks
          </h3>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Real Nigerian street prices checked weekly at major phone hubs.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Tested battery endurance during actual screen-on time in Nigerian daily conditions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Carrier-grade 4G/5G band verification for Nigerian telco networks.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Clear indication of Carlcare and authorized service center warranty coverage.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Three Pillars of GsmScope */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk']">
            Comprehensive Database
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Every device profile contains complete specs: chipset benchmarks (AnTuTu v10), display refresh rates, camera sensor apertures, memory configurations, and battery charging speeds.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk']">
            Side-by-Side Comparisons
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Direct spec comparisons allow users to weigh competing models from Tecno, Infinix, Samsung, Redmi, Apple, and OnePlus before committing their hard-earned money.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk']">
            Editorial Independence
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Our reviews and ratings are never influenced by manufacturer sponsorship. When a phone overheats or has subpar cameras, we say so directly.
          </p>
        </div>
      </div>

      {/* 4. Methodology & Testing Criteria */}
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
          Our Phone Evaluation Methodology
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-slate-900 dark:text-white block">Sustained Performance</span>
            <p className="text-slate-500 dark:text-slate-400">Throttling tests over 30 minutes of gaming and multitasking in ambient room temperatures.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <Battery className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-slate-900 dark:text-white block">Battery Real-World Drain</span>
            <p className="text-slate-500 dark:text-slate-400">Measured on 4G LTE/5G dual-SIM standby, social media browsing, and video streaming.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-slate-900 dark:text-white block">Nigerian 5G Reception</span>
            <p className="text-slate-500 dark:text-slate-400">Signal strength tested across key residential and commercial areas in Lagos and Abuja.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-slate-900 dark:text-white block">Build Quality &amp; Repairs</span>
            <p className="text-slate-500 dark:text-slate-400">Screen drop resistance, port durability, and availability of replacement parts.</p>
          </div>
        </div>
      </div>

      {/* 5. Contact & Headquarters Card with User's Contact Details */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#061a11] via-[#0a2a1a] to-[#04120a] border border-emerald-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400">
            Get In Touch
          </span>
          <h3 className="text-xl font-bold font-['Space_Grotesk']">
            Collaborate with the GsmScope Editorial Team
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            For device review requests, editorial corrections, or media inquiries, contact our Lagos headquarters.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
            <a 
              href="mailto:info@gsmscope.com" 
              className="flex items-center gap-1.5 text-emerald-400 hover:underline font-mono"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>info@gsmscope.com</span>
            </a>
            <a 
              href="tel:+2349127408003" 
              className="flex items-center gap-1.5 text-emerald-400 hover:underline font-mono"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+2349127408003</span>
            </a>
            <span className="flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ikeja Computer Village, Lagos</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('contact')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors shrink-0 cursor-pointer shadow-md"
        >
          Contact Our Team
        </button>
      </div>
    </div>
  );
}
