import { useState, useEffect, useRef } from 'react';
import { Article, Phone } from '../../types';
import { INITIAL_ARTICLES } from '../../data/seedData';
import { useApp } from '../../context/AppContext';
import { useSeoMeta } from '../seo/SeoMeta';
import SocialShareBar from '../common/SocialShareBar';
import ScrollProgressBar from '../common/ScrollProgressBar';
import FormattedContent from '../common/FormattedContent';
import LazyImage from '../common/LazyImage';
import { 
  Clock, 
  Tag, 
  Smartphone, 
  Eye, 
  MessageSquare, 
  Send, 
  Check, 
  ExternalLink,
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  Scale 
} from 'lucide-react';

interface ArticleDetailPageProps {
  article: Article;
  onBack: () => void;
}

const DEFAULT_ARTICLE_COMMENTS = [
  {
    id: 'c-1',
    name: 'Chidi Okafor',
    text: 'Really solid breakdown. The real-world battery endurance numbers are super helpful before upgrading.',
    date: '2 hours ago'
  },
  {
    id: 'c-2',
    name: 'Bisi Adeleke',
    text: 'Pricing has been fluctuating a lot lately, glad to see verified retail estimates included here.',
    date: '5 hours ago'
  }
];

export default function ArticleDetailPage({ article, onBack }: ArticleDetailPageProps) {
  const { 
    articles, 
    phones, 
    selectedPhone,
    setSelectedArticle, 
    setSelectedPhone, 
    activeTab,
    setActiveTab,
    formatNaira,
    formatUSD,
    addToCompare,
    recordArticleView
  } = useApp();

  const articleContentRef = useRef<HTMLElement>(null);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const isSeedArticle = INITIAL_ARTICLES.some((a) => a.id === article?.id);
  const [comments, setComments] = useState<Array<{ id: string; name: string; text: string; date: string }>>(
    isSeedArticle ? DEFAULT_ARTICLE_COMMENTS : []
  );
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  const prevArticleIdRef = useRef<string | undefined>(article?.id);

  useEffect(() => {
    if (prevArticleIdRef.current !== article?.id) {
      prevArticleIdRef.current = article?.id;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    if (article?.id) {
      recordArticleView(article.id);
      const fallback = INITIAL_ARTICLES.some((a) => a.id === article.id) ? DEFAULT_ARTICLE_COMMENTS : [];
      try {
        const raw = localStorage.getItem('gsmscope_article_comments_v1');
        const map = raw ? JSON.parse(raw) : {};
        setComments(Array.isArray(map[article.id]) ? map[article.id] : fallback);
      } catch {
        setComments(fallback);
      }
    }
  }, [article?.id]);

  useSeoMeta({
    title: article.seoTitle || `${article.title} — GsmScope`,
    description: article.seoDescription || article.summary || `Read ${article.title} on GsmScope — expert smartphone analysis, hardware testing, and mobile industry news.`,
    keywords: article.seoKeywords || (article.tags || []).join(', ') || `${article.title}, ${article.category}, smartphone news`,
    image: article.coverImage,
    imageAlt: article.title,
    type: 'article',
    canonicalPath: `/?article=${encodeURIComponent(article.slug || article.id)}`,
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentName.trim() && commentText.trim()) {
      const nextComments = [
        ...comments,
        {
          id: 'c-' + Date.now(),
          name: commentName.trim(),
          text: commentText.trim(),
          date: 'Just now'
        }
      ];
      setComments(nextComments);
      try {
        const raw = localStorage.getItem('gsmscope_article_comments_v1');
        const map = raw ? JSON.parse(raw) : {};
        map[article.id] = nextComments;
        localStorage.setItem('gsmscope_article_comments_v1', JSON.stringify(map));
      } catch {}
      setCommentSubmitted(true);
      setCommentName('');
      setCommentText('');
      setTimeout(() => setCommentSubmitted(false), 3000);
    }
  };

  // SIDEBAR 1: Mentioned smartphones explicitly linked in this article
  const mentionedPhones: Phone[] = (article.relatedPhoneIds || [])
    .map(id => phones.find(p => p.id === id))
    .filter((p): p is Phone => Boolean(p));

  // Check if this is an individual phone review article and resolve the reviewed phone
  const isReviewArticle =
    article.category.toLowerCase().includes('review') ||
    /\breview\b/i.test(article.title);

  const reviewedPhone: Phone | undefined = (() => {
    if (!isReviewArticle) return undefined;
    const titleLower = article.title.toLowerCase();
    const slugLower = (article.slug || '').toLowerCase();

    // 1. If relatedPhoneIds has an exact single phone
    if (mentionedPhones.length === 1) {
      return mentionedPhones[0];
    }

    // 2. Match phone name in article title
    const titleMatched = phones.find((p) => {
      const pName = p.name.toLowerCase().trim();
      const pBrand = p.brand.toLowerCase().trim();
      if (!pName) return false;
      const modelOnly = pName.startsWith(pBrand + ' ')
        ? pName.slice(pBrand.length + 1).trim()
        : pName;
      return titleLower.includes(pName) || (modelOnly.length >= 4 && titleLower.includes(modelOnly));
    });
    if (titleMatched) return titleMatched;

    // 3. First mentioned phone from relatedPhoneIds
    if (mentionedPhones.length > 0) return mentionedPhones[0];

    // 4. Match via slug
    const slugMatched = phones.find((p) => p.id && slugLower.includes(p.id.toLowerCase()));
    if (slugMatched) return slugMatched;

    return undefined;
  })();

  // Only show phones that are genuinely linked or reviewed on this page (never show fake fallback phones)
  const displayMentionedPhones: Phone[] = (() => {
    const combined: Phone[] = [...mentionedPhones];
    if (reviewedPhone && !combined.some((p) => p.id === reviewedPhone.id)) {
      combined.unshift(reviewedPhone);
    }
    return combined;
  })();

  const specScores = (() => {
    if (!isReviewArticle) return null;

    const specs = reviewedPhone?.detailedSpecs;
    const highlights = reviewedPhone?.keyHighlights;
    const pageText = `${article.title || ''} ${article.summary || ''} ${article.content || ''}`;
    const pageTextLower = pageText.toLowerCase();

    // 1. Performance score determined strictly by real phone core specs on this page (chipset, AnTuTu, RAM, storage type)
    const antutuRaw = specs?.platform?.antutuScore || '';
    const pageAntutuMatch =
      pageText.match(/(\d[\d,]{5,8})\s*(?:points?)?\s*\(?antutu/i) ||
      pageText.match(/antutu[^0-9]{0,25}(\d[\d,]{5,8})/i);
    const antutuValue =
      parseInt(antutuRaw.replace(/[^0-9]/g, ''), 10) ||
      (pageAntutuMatch ? parseInt(pageAntutuMatch[1].replace(/[^0-9]/g, ''), 10) : 0);

    const phoneChipsetRaw = `${specs?.platform?.chipset || ''} ${highlights?.processor || ''} ${specs?.platform?.cpu || ''}`.trim();
    const pageChipsetMatch = pageText.match(
      /\b(snapdragon\s+[a-z0-9\s\+]+|dimensity\s+\d+[a-z0-9\s\-]*|apple\s+a\d+\s*(?:pro|bionic)?|a1[5-9]\s*(?:pro|bionic)|exynos\s+\d+|tensor\s+g\d+|helio\s+[a-z0-9]+|unisoc\s+[a-z0-9]+|kirin\s+\d+)/i
    );
    const chipsetText = `${phoneChipsetRaw} ${pageChipsetMatch ? pageChipsetMatch[1] : ''}`.toLowerCase().trim();

    const phoneRamRaw = `${(specs?.memory?.ramVariants || []).join(' ')} ${highlights?.ram || ''}`.trim();
    const pageRamMatches = pageText.match(/\b(4|6|8|12|16|24)\s*GB\s*(?:RAM|LPDDR)/gi) || [];
    const ramCombinedText = `${phoneRamRaw} ${pageRamMatches.join(' ')}`;
    const ramMatches = ramCombinedText.match(/(\d+)\s*GB/gi) || [];
    const maxRam = ramMatches.reduce((max, item) => {
      const val = parseInt(item, 10) || 0;
      return val > max && val <= 32 ? val : max;
    }, 0);

    const storageType = `${specs?.memory?.storageType || ''} ${
      /\b(ufs\s*[234]\.\d|nvme|emmc\s*5\.1)\b/i.exec(pageText)?.[0] || ''
    }`.toLowerCase().trim();

    const hasRealPerfSpecs =
      antutuValue > 0 ||
      Boolean(phoneChipsetRaw && phoneChipsetRaw.toLowerCase() !== 'octa-core 5g processor' && phoneChipsetRaw.toLowerCase() !== 'octa-core') ||
      Boolean(pageChipsetMatch) ||
      maxRam > 0 ||
      Boolean(storageType);

    let perfScore: number | null = null;
    if (hasRealPerfSpecs) {
      let score = 6.2;
      if (antutuValue >= 1750000) {
        score = 9.6;
      } else if (antutuValue >= 1400000) {
        score = 9.2 + ((antutuValue - 1400000) / 350000) * 0.4;
      } else if (antutuValue >= 900000) {
        score = 8.3 + ((antutuValue - 900000) / 500000) * 0.8;
      } else if (antutuValue >= 500000) {
        score = 7.4 + ((antutuValue - 500000) / 400000) * 0.8;
      } else if (antutuValue > 0) {
        score = 5.8 + (Math.min(antutuValue, 500000) / 500000) * 1.5;
      } else if (
        chipsetText.includes('3 nm') ||
        chipsetText.includes('3nm') ||
        chipsetText.includes('a18') ||
        chipsetText.includes('a17 pro') ||
        chipsetText.includes('8 gen 3') ||
        chipsetText.includes('8 elite') ||
        chipsetText.includes('dimensity 9400') ||
        chipsetText.includes('dimensity 9300')
      ) {
        score = 9.5;
      } else if (
        chipsetText.includes('4 nm') ||
        chipsetText.includes('4nm') ||
        chipsetText.includes('8 gen 2') ||
        chipsetText.includes('8s gen 3') ||
        chipsetText.includes('a16') ||
        chipsetText.includes('tensor g4') ||
        chipsetText.includes('tensor g3') ||
        chipsetText.includes('dimensity 9200') ||
        chipsetText.includes('dimensity 8300') ||
        chipsetText.includes('exynos 2400')
      ) {
        score = 8.9;
      } else if (
        chipsetText.includes('6 nm') ||
        chipsetText.includes('6nm') ||
        chipsetText.includes('7 gen') ||
        chipsetText.includes('dimensity 8') ||
        chipsetText.includes('dimensity 7') ||
        chipsetText.includes('a15')
      ) {
        score = 8.0;
      } else if (chipsetText.includes('dimensity') || chipsetText.includes('snapdragon') || chipsetText.includes('helio g99') || chipsetText.includes('helio g100')) {
        score = 7.4;
      } else if (chipsetText.length > 0) {
        score = 6.8;
      }

      if (maxRam >= 16) score += 0.3;
      else if (maxRam >= 12) score += 0.2;
      else if (maxRam >= 8) score += 0.1;
      else if (maxRam > 0 && maxRam <= 4) score -= 0.2;

      if (storageType.includes('ufs 4') || storageType.includes('nvme')) score += 0.2;
      else if (storageType.includes('ufs 3')) score += 0.1;
      else if (storageType.includes('emmc')) score -= 0.2;

      perfScore = Math.min(10, Math.max(5.0, Math.round(score * 10) / 10));
    }

    // 2. Camera score determined strictly by real phone core specs on this page (MP, OIS, telephoto/periscope, video, selfie)
    const phoneCamRaw = `${specs?.mainCamera?.setup || ''} ${specs?.mainCamera?.features || ''} ${highlights?.camera || ''}`.trim();
    const phoneVideoRaw = (specs?.mainCamera?.video || '').trim();
    const phoneSelfieRaw = `${specs?.selfieCamera?.setup || ''} ${specs?.selfieCamera?.video || ''}`.trim();

    const pageCamMpMatches = pageText.match(/\b(\d{2,3})\s*MP\b/gi) || [];
    const mainCamText = `${phoneCamRaw} ${pageCamMpMatches.join(' ')}`.toLowerCase();
    const mainVideoText = `${phoneVideoRaw} ${/\b(8k|4k@\d+fps|4k\s*video|1080p)\b/i.exec(pageText)?.[0] || ''}`.toLowerCase();
    const selfieText = phoneSelfieRaw.toLowerCase();

    const mpMatches = mainCamText.match(/(\d+)\s*mp/gi) || [];
    const maxMainMp = mpMatches.reduce((max, item) => {
      const val = parseInt(item, 10) || 0;
      return val > max && val <= 250 ? val : max;
    }, 0);

    const hasRealCamSpecs =
      maxMainMp > 0 ||
      Boolean(phoneCamRaw) ||
      Boolean(phoneVideoRaw) ||
      /\b(ois|periscope|telephoto|ultrawide)\b/i.test(phoneCamRaw);

    let camScore: number | null = null;
    if (hasRealCamSpecs) {
      let score = 5.6;
      if (maxMainMp >= 200) score += 1.4;
      else if (maxMainMp >= 100) score += 1.1;
      else if (maxMainMp >= 48) score += 0.9;
      else if (maxMainMp >= 32) score += 0.6;
      else if (maxMainMp > 0) score += 0.3;

      const camSearchScope = `${mainCamText} ${Boolean(phoneCamRaw) ? '' : pageTextLower}`;
      if (camSearchScope.includes('ois') || camSearchScope.includes('sensor-shift')) score += 1.2;
      if (camSearchScope.includes('periscope') || camSearchScope.includes('5x') || camSearchScope.includes('telephoto') || camSearchScope.includes('3x')) score += 1.1;
      if (camSearchScope.includes('ultrawide') || camSearchScope.includes('uw') || camSearchScope.includes('120˚') || camSearchScope.includes('114˚')) score += 0.5;
      if (mainVideoText.includes('8k') || mainVideoText.includes('4k@120') || mainVideoText.includes('prores') || mainVideoText.includes('10-bit')) score += 0.6;
      else if (mainVideoText.includes('4k@60') || mainVideoText.includes('4k@30/60')) score += 0.4;
      else if (mainVideoText.includes('4k')) score += 0.2;

      if (selfieText.includes('4k') || selfieText.includes('50 mp') || selfieText.includes('32 mp')) score += 0.3;
      else if (selfieText.includes('12 mp') || selfieText.includes('16 mp')) score += 0.1;

      camScore = Math.min(10, Math.max(5.0, Math.round(score * 10) / 10));
    }

    // 3. Battery score determined strictly by real phone core specs on this page (mAh capacity, charging wattage, wireless charging)
    const phoneBatRaw = `${specs?.battery?.capacity || ''} ${highlights?.battery || ''}`.trim();
    const batCapSource = phoneBatRaw || pageText;
    const batCapMatch = batCapSource.match(/\b(\d{4,5})\s*mAh\b/i) || phoneBatRaw.match(/\b(\d{4,5})\b/);
    const batteryMah = batCapMatch ? parseInt(batCapMatch[1], 10) : 0;

    const phoneChargeRaw = `${specs?.battery?.charging || ''} ${highlights?.charging || ''}`.trim();
    const wattMatch =
      phoneChargeRaw.match(/\b(\d{1,3})\s*W\b/i) ||
      pageText.match(/\b(\d{2,3})\s*W\s*(?:wired|fast|supervooc|hypercharge|charging|turbo)/i);
    const chargeWatts = wattMatch ? parseInt(wattMatch[1], 10) : 0;

    const wirelessRaw = (specs?.battery?.wirelessCharging || '').toLowerCase();
    const hasWireless =
      (wirelessRaw.length > 0 && !wirelessRaw.startsWith('no') && !wirelessRaw.includes('none')) ||
      /\b\d+\s*W\s*wireless\b/i.test(pageText);

    const hasRealBatSpecs = batteryMah > 0 || chargeWatts > 0 || Boolean(phoneBatRaw) || Boolean(phoneChargeRaw);

    let batScore: number | null = null;
    if (hasRealBatSpecs) {
      let score = 5.2;
      if (batteryMah >= 6000) score += 2.6;
      else if (batteryMah >= 5400) score += 2.3;
      else if (batteryMah >= 5100) score += 1.9;
      else if (batteryMah >= 5000) score += 1.6;
      else if (batteryMah >= 4500) score += 1.3;
      else if (batteryMah > 0) score += 0.8;

      if (chargeWatts >= 100) score += 1.8;
      else if (chargeWatts >= 65) score += 1.4;
      else if (chargeWatts >= 40) score += 1.0;
      else if (chargeWatts >= 25) score += 0.7;
      else if (chargeWatts >= 15) score += 0.4;

      if (hasWireless) score += 0.5;
      if (chipsetText.includes('3 nm') || chipsetText.includes('3nm')) score += 0.4;
      else if (chipsetText.includes('4 nm') || chipsetText.includes('4nm')) score += 0.2;

      batScore = Math.min(10, Math.max(5.0, Math.round(score * 10) / 10));
    }

    // 4. Display score determined strictly by real phone core specs on this page (panel type, refresh rate, resolution/PPI, nits brightness)
    const phoneDispTypeRaw = `${specs?.display?.type || ''} ${highlights?.display || ''}`.trim();
    const phoneDispResRaw = (specs?.display?.resolution || '').trim();
    const phoneDispBrightRaw = (specs?.display?.brightness || '').trim();
    const phoneDispRefreshRaw = (specs?.display?.refreshRate || '').trim();
    const phoneDispProtRaw = (specs?.display?.protection || '').trim();

    const pageDispPanelMatch = pageText.match(/\b(dynamic\s+ltpo\s+amoled|ltpo\s+amoled|super\s+retina\s+xdr|super\s+actua|amoled|oled|ips\s+lcd)\b/i);
    const pageRefreshMatch = pageText.match(/\b(60|90|120|144|165)\s*Hz\b/i);
    const pageNitsMatch = pageText.match(/\b(\d{3,4})\s*nits\b/i);

    const dispType = `${phoneDispTypeRaw} ${pageDispPanelMatch ? pageDispPanelMatch[1] : ''}`.toLowerCase().trim();
    const dispRes = phoneDispResRaw.toLowerCase();
    const dispBright = `${phoneDispBrightRaw} ${phoneDispTypeRaw} ${pageNitsMatch ? pageNitsMatch[0] : ''}`.toLowerCase();
    const dispRefresh = `${phoneDispRefreshRaw} ${dispType} ${pageRefreshMatch ? pageRefreshMatch[0] : ''}`.toLowerCase();
    const dispProt = phoneDispProtRaw.toLowerCase();

    const hasRealDispSpecs =
      Boolean(phoneDispTypeRaw) ||
      Boolean(phoneDispResRaw) ||
      Boolean(phoneDispBrightRaw) ||
      Boolean(phoneDispRefreshRaw) ||
      Boolean(pageDispPanelMatch) ||
      Boolean(pageRefreshMatch) ||
      Boolean(pageNitsMatch);

    let dispScore: number | null = null;
    if (hasRealDispSpecs) {
      let score = 5.4;
      if (dispType.includes('ltpo') || dispType.includes('super retina xdr') || dispType.includes('super actua') || dispType.includes('dynamic ltpo')) {
        score += 2.1;
      } else if (dispType.includes('amoled') || dispType.includes('oled')) {
        score += 1.6;
      } else if (dispType.length > 0) {
        score += 0.6;
      }

      if (dispRefresh.includes('165hz') || dispRefresh.includes('144hz') || dispRefresh.includes('1-120hz') || dispRefresh.includes('adaptive')) {
        score += 1.1;
      } else if (dispRefresh.includes('120hz')) {
        score += 0.9;
      } else if (dispRefresh.includes('90hz')) {
        score += 0.5;
      }

      const ppiMatch = dispRes.match(/(\d{3})\s*ppi/i);
      const ppi = ppiMatch
        ? parseInt(ppiMatch[1], 10)
        : dispRes.includes('1440') || dispRes.includes('1320') || dispRes.includes('1264') || dispRes.includes('1220')
        ? 450
        : dispRes.includes('1080')
        ? 395
        : 0;
      if (ppi >= 440) score += 0.8;
      else if (ppi >= 380) score += 0.5;
      else if (ppi > 0) score += 0.2;

      const nitsMatch = dispBright.match(/(\d{3,4})\s*nits/i);
      const nits = nitsMatch ? parseInt(nitsMatch[1], 10) : 0;
      if (nits >= 2400) score += 0.8;
      else if (nits >= 1600) score += 0.6;
      else if (nits >= 1000) score += 0.4;
      else if (nits > 0) score += 0.2;

      if (dispProt.includes('armor') || dispProt.includes('victus') || dispProt.includes('ceramic shield')) {
        score += 0.2;
      }

      dispScore = Math.min(10, Math.max(5.0, Math.round(score * 10) / 10));
    }

    const metrics: Array<{ label: string; value: number; detail?: string }> = [];
    if (perfScore !== null) {
      const perfDetail =
        specs?.platform?.chipset ||
        highlights?.processor ||
        (pageChipsetMatch ? pageChipsetMatch[1] : '') ||
        (maxRam > 0 ? `${maxRam}GB RAM` : '');
      metrics.push({ label: 'Performance', value: perfScore, detail: perfDetail || undefined });
    }
    if (camScore !== null) {
      const camDetail =
        highlights?.camera ||
        specs?.mainCamera?.setup ||
        (maxMainMp > 0 ? `${maxMainMp}MP Camera` : '');
      metrics.push({ label: 'Camera', value: camScore, detail: camDetail || undefined });
    }
    if (batScore !== null) {
      const batParts = [
        batteryMah > 0 ? `${batteryMah} mAh` : (highlights?.battery || ''),
        chargeWatts > 0 ? `${chargeWatts}W` : (highlights?.charging || ''),
      ].filter(Boolean);
      metrics.push({ label: 'Battery', value: batScore, detail: batParts.join(' · ') || undefined });
    }
    if (dispScore !== null) {
      const dispDetail =
        highlights?.display ||
        specs?.display?.type ||
        [pageDispPanelMatch?.[1], pageRefreshMatch?.[0]].filter(Boolean).join(' ');
      metrics.push({ label: 'Display', value: dispScore, detail: dispDetail || undefined });
    }

    // Never show a fake Score Card if no phone core specs were added on this page
    if (metrics.length === 0) {
      return null;
    }

    const sumScores = metrics.reduce((acc, m) => acc + m.value, 0);
    const overallScore = Math.min(
      10,
      Math.max(5.0, Math.round((sumScores / metrics.length) * 10) / 10)
    );

    return {
      overall: overallScore,
      metrics,
      phoneName: reviewedPhone?.name,
    };
  })();

  const formatScoreValue = (val: number) => Number(val.toFixed(1)).toString();

  // SIDEBAR 2: Trending & Most Read Articles (sorted by highest visitor views)
  const trendingArticles = [...articles]
    .filter(a => a.id !== article.id)
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
    .slice(0, 5);

  // SIDEBAR 3: Popular smartphones in Nigeria by views
  const popularPhonesByViews = [...phones]
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <ScrollProgressBar targetRef={articleContentRef} />

      {/* Main 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* MAIN ARTICLE BODY (8 Columns) */}
        <article ref={articleContentRef} className="lg:col-span-8 space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                {article.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>{article.date}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {article.readTime}
              </span>
            </div>

            <h1 className="post-title text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight leading-tight">
              {article.title}
            </h1>
          </div>

          {/* Featured Cover Banner */}
          <div className="relative aspect-[16/9] w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md">
            <LazyImage
              src={article.coverImage}
              alt={article.title}
              priority
              fallbackSrc="/src/assets/images/hero_flagship_phones_1792578844852.jpg"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Lead / Summary Callout */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
            <FormattedContent content={article.summary} compact />
          </div>

          {/* Article Prose Content (Supports H1-H4 Headings, Bold Text, Bold Paragraphs, Lists & Quotes) */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            <FormattedContent content={article.content} />
          </div>

          {/* Expert Score Card after last paragraph on individual phone review pages (only shown when real phone core specs exist on the page) */}
          {isReviewArticle && specScores && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              {/* Top Row: Circular Ring Score + Title */}
              <div className="flex items-center gap-5 sm:gap-6 mb-6">
                <div className="relative w-20 h-20 sm:w-[88px] sm:h-[88px] shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="9"
                      className="text-slate-100 dark:text-slate-800"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#00a854"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={263.89}
                      strokeDashoffset={263.89 - (specScores.overall / 10) * 263.89}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute text-2xl sm:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {formatScoreValue(specScores.overall)}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-[22px] font-bold text-slate-900 dark:text-white leading-tight">
                    Score
                  </h3>
                  <p className="text-xs sm:text-[15px] text-slate-600 dark:text-slate-400 mt-1">
                    Out of 10 — calculated from {specScores.phoneName ? `${specScores.phoneName} core specs` : 'phone core specs on this page'}
                  </p>
                </div>
              </div>

              {/* Spec-Measured Sub-Score Bars */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {specScores.metrics.map((metric) => (
                  <div key={metric.label} className="py-3.5 sm:py-4 first:pt-2 last:pb-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <span className="text-sm sm:text-base font-normal text-slate-900 dark:text-slate-100">
                          {metric.label}
                        </span>
                        {metric.detail && (
                          <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {metric.detail}
                          </span>
                        )}
                      </div>
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white shrink-0">
                        {formatScoreValue(metric.value)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 sm:h-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#00a854] transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, (metric.value / 10) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                <Tag className="w-3.5 h-3.5" />
                Tags:
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="site-badge text-[9px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-px rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Social Media Sharing Row after Article Content */}
          <SocialShareBar
            title={`${article.title} — GsmScope`}
            path={`/?article=${encodeURIComponent(article.slug || article.id)}`}
          />

          {/* Author Bio Box */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk']">
                About GsmScope
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Specialized in global telecommunications, smartphone battery endurance benchmarks, camera sensor evaluations, and international retail price movements.
              </p>
            </div>
          </div>

          {/* Discussion & User Comments Section */}
          <section className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk'] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Reader Discussion ({comments.length})</span>
              </h3>
            </div>

            {/* Existing Comments */}
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    <span className="text-slate-400 text-[11px]">{c.date}</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <FormattedContent content={c.text} compact />
                  </div>
                </div>
              ))}
            </div>

            {/* Leave a Comment Form */}
            <form onSubmit={handleAddComment} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Join the conversation</h4>
              {commentSubmitted ? (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Your comment has been added!</span>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="Your name or nickname..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  <textarea
                    rows={3}
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts, experiences or questions..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </section>
        </article>

        {/* SIDEBARS (4 Columns) */}
        <aside aria-label="Article related sidebars" className="lg:col-span-4 space-y-6">

          {/* SIDEBAR WIDGET 1: Smartphones Mentioned in this Article */}
          {displayMentionedPhones.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Phones Mentioned</span>
                </h3>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {displayMentionedPhones.length} {displayMentionedPhones.length === 1 ? 'Device' : 'Devices'}
                </span>
              </div>

              <div className="space-y-3">
                {displayMentionedPhones.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedArticle(null);
                      setSelectedPhone(p);
                    }}
                    className="group p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-[#061a11] transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-[58px] h-14 bg-slate-950 rounded-lg overflow-hidden p-0 shrink-0 border border-slate-200 dark:border-slate-800">
                      <LazyImage
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block truncate">
                        {p.brand}
                      </span>
                      <h4 className="post-title font-bold text-slate-900 dark:text-white text-xs leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {p.name}
                      </h4>
                      <div className="flex items-center justify-end text-[11px] mt-1">
                        <span className="text-slate-400 text-[10px] group-hover:text-emerald-500 flex items-center">
                          Specs →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIDEBAR WIDGET 2: Popular Phones by Views Count */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Popular phones</span>
              </h3>
              <button
                onClick={() => {
                  setSelectedPhone(null);
                  setSelectedArticle(null);
                  setActiveTab('phones');
                }}
                className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                All phones →
              </button>
            </div>

            <div className="space-y-3">
              {popularPhonesByViews.map((popPhone, idx) => (
                <div
                  key={popPhone.id}
                  onClick={() => {
                    setSelectedArticle(null);
                    setSelectedPhone(popPhone);
                  }}
                  className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 w-4 text-center">
                    0{idx + 1}
                  </span>
                  <div className="w-15 h-12 bg-slate-950 rounded-lg overflow-hidden p-0 shrink-0 border border-slate-200 dark:border-slate-800">
                    <LazyImage
                      src={popPhone.image}
                      alt={popPhone.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="post-title font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {popPhone.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {(popPhone.viewsCount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR WIDGET 4: Tech Tip & Editorial Desk */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#061a11] to-[#0a2a1a] border border-emerald-950 text-white space-y-3 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400">
              GsmScope Editorial
            </span>
            <h4 className="font-bold text-sm font-['Space_Grotesk']">
              Have a Tech Tip or Phone Correction?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our hardware researchers track daily global smartphone releases, firmware updates, and retail price movements.
            </p>
            <div className="pt-2 border-t border-emerald-900/60 text-xs">
              <button
                onClick={() => {
                  setSelectedPhone(null);
                  setSelectedArticle(null);
                  setActiveTab('contact');
                }}
                className="text-emerald-400 font-normal hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Send a tip to the newsroom</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
