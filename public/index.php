<?php
/**
 * GsmScope cPanel / Apache / LiteSpeed SSR OpenGraph & Twitter Card Injector
 * Ensures Facebook, X (Twitter), WhatsApp, Telegram, Discord, and LinkedIn crawlers
 * receive the exact shared article or phone title, description, and image instead of a default fallback.
 */

error_reporting(0);
ini_set('display_errors', '0');

$indexHtmlPath = __DIR__ . '/index.html';
if (!file_exists($indexHtmlPath)) {
    http_response_code(500);
    echo 'index.html not found';
    exit;
}

$html = file_get_contents($indexHtmlPath);

function gsmEscapeAttr($str) {
    return htmlspecialchars((string)$str, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function gsmResolveHomeDir() {
    if (!empty($_SERVER['HOME'])) return rtrim($_SERVER['HOME'], '/');
    if (!empty(getenv('HOME'))) return rtrim(getenv('HOME'), '/');
    $docRoot = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/') : '';
    if ($docRoot && basename($docRoot) === 'public_html') {
        return dirname($docRoot);
    }
    return dirname(__DIR__);
}

function gsmGetOrigin() {
    $host = !empty($_SERVER['HTTP_X_FORWARDED_HOST'])
        ? trim(explode(',', $_SERVER['HTTP_X_FORWARDED_HOST'])[0])
        : (!empty($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'gsmscope.com');
    $isLocal = (strpos($host, 'localhost') === 0 || strpos($host, '127.0.0.1') === 0);
    $forwardedProto = !empty($_SERVER['HTTP_X_FORWARDED_PROTO'])
        ? trim(explode(',', $_SERVER['HTTP_X_FORWARDED_PROTO'])[0])
        : '';
    $isHttps = ($forwardedProto === 'https') || (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || !$isLocal;
    $proto = $forwardedProto ?: ($isHttps ? 'https' : 'http');
    return $proto . '://' . $host;
}

function gsmSlugify($str) {
    $s = strtolower(trim((string)$str));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim((string)$s, '-');
}

function gsmCleanPhoneSlug($ph) {
    $rawSlug = isset($ph['slug']) ? trim((string)$ph['slug']) : '';
    if ($rawSlug !== '' && !preg_match('/-\d{10,14}$/', $rawSlug)) {
        return strtolower($rawSlug);
    }
    $strippedId = trim(preg_replace('/-\d{10,14}$/', '', strtolower(trim((string)($ph['id'] ?? '')))), '-');
    if ($strippedId !== '' && $strippedId !== 'phone') {
        return $strippedId;
    }
    $byName = gsmSlugify($ph['name'] ?? '');
    return $byName !== '' ? $byName : strtolower((string)($ph['id'] ?? 'phone'));
}

function gsmMatchesPhone($ph, $query) {
    $q = strtolower(trim(rawurldecode((string)$query)));
    if ($q === '') return false;
    $qStripped = preg_replace('/-\d{10,14}$/', '', $q);
    $pId = strtolower(trim((string)($ph['id'] ?? '')));
    $pSlug = strtolower(trim((string)($ph['slug'] ?? '')));
    $pClean = gsmCleanPhoneSlug($ph);
    return (
        $pId === $q ||
        ($pSlug !== '' && $pSlug === $q) ||
        $pClean === $q ||
        $pClean === $qStripped ||
        ($pId !== '' && preg_replace('/-\d{10,14}$/', '', $pId) === $qStripped)
    );
}

function gsmLoadDb() {
    $homeDir = gsmResolveHomeDir();
    // Always pick the newest LIVE database.json first; never let freshly deployed seed-database.json override live content
    $liveCandidates = array(
        $homeDir . '/.gsmscope_data/database.json',
        $homeDir . '/phones_app/data/database.json',
        $homeDir . '/public_html/api/data/database.json',
        __DIR__ . '/api/data/database.json',
        $homeDir . '/gsmscope/data/database.json',
        $homeDir . '/nodejs/data/database.json',
        __DIR__ . '/data/database.json',
        dirname(__DIR__) . '/data/database.json'
    );
    $bestFile = null;
    $bestMtime = -1;
    foreach ($liveCandidates as $cand) {
        if (file_exists($cand) && @filesize($cand) > 100) {
            $mt = @filemtime($cand);
            if ($bestFile === null || $mt > $bestMtime) {
                $bestFile = $cand;
                $bestMtime = $mt;
            }
        }
    }
    if ($bestFile === null) {
        $seedCandidates = array(
            __DIR__ . '/api/seed-database.json',
            __DIR__ . '/seed-database.json',
            $homeDir . '/phones_app/cpanel_build/seed-database.json'
        );
        foreach ($seedCandidates as $sc) {
            if (file_exists($sc) && @filesize($sc) > 50) {
                $bestFile = $sc;
                break;
            }
        }
    }
    if ($bestFile) {
        $raw = @file_get_contents($bestFile);
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) return $decoded;
        }
    }
    return array();
}

function gsmExtractFirstImg($content) {
    if (!is_string($content) || $content === '') return '';
    if (preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', $content, $m)) {
        return trim($m[1]);
    }
    return '';
}

function gsmResolveAssetUrl($origin, $rawUrl, $ogEndpointFallback = '') {
    $defaultImg = $origin . '/assets/images/hero_flagship_phones_1792578844852.jpg';
    $trimmed = trim((string)$rawUrl);
    if ($trimmed === '' || strpos($trimmed, 'photo-1511707171634') !== false) {
        return $ogEndpointFallback !== '' ? $ogEndpointFallback : $defaultImg;
    }
    if (strpos($trimmed, 'data:') === 0) {
        return $ogEndpointFallback !== '' ? $ogEndpointFallback : $defaultImg;
    }
    if (strpos($trimmed, '//') === 0) {
        return 'https:' . str_replace(' ', '%20', $trimmed);
    }
    if (preg_match('/^https?:\/\//i', $trimmed)) {
        return str_replace(' ', '%20', $trimmed);
    }
    if (strpos($trimmed, '/src/assets/images/') === 0 || strpos($trimmed, 'src/assets/images/') === 0) {
        $fname = basename(parse_url($trimmed, PHP_URL_PATH));
        return $origin . '/assets/images/' . rawurlencode($fname);
    }
    $norm = (strpos($trimmed, '/') === 0) ? $trimmed : ('/' . $trimmed);
    return $origin . str_replace(' ', '%20', $norm);
}

$origin = gsmGetOrigin();
$db = gsmLoadDb();
$wc = isset($db['websiteContent']) && is_array($db['websiteContent']) ? $db['websiteContent'] : array();
$siteName = !empty($wc['siteName']) ? $wc['siteName'] : 'GsmScope';

$pageTitle = !empty($wc['seoTitle'])
    ? $wc['seoTitle']
    : (!empty($wc['defaultSeoTitle']) ? $wc['defaultSeoTitle'] : ($siteName . ' — Phone Specs and Prices in Naira and USD'));
$pageDescription = !empty($wc['seoDescription'])
    ? $wc['seoDescription']
    : (!empty($wc['defaultSeoDescription']) ? $wc['defaultSeoDescription'] : 'Browse smartphone specifications with current Nigerian naira and USD prices, compare devices, read technology news and find the best phones for every budget.');
$canonicalUrl = $origin . '/';
$ogType = 'website';
$ogImage = gsmResolveAssetUrl($origin, $wc['ogImageUrl'] ?? '/assets/images/hero_flagship_phones_1792578844852.jpg');
$ogImageAlt = $pageTitle;

$reqUriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$phoneQuery = isset($_GET['phone']) ? trim((string)$_GET['phone']) : '';
$articleQuery = isset($_GET['article']) ? trim((string)$_GET['article']) : '';
if ($articleQuery === '' && preg_match('#^/articles?/([^/?\#]+)#i', $reqUriPath, $pm)) {
    $articleQuery = trim($pm[1]);
}
if ($phoneQuery === '' && preg_match('#^/phones?/([^/?\#]+)#i', $reqUriPath, $pm)) {
    $phoneQuery = trim($pm[1]);
}

if ($articleQuery !== '' && !empty($db['articles']) && is_array($db['articles'])) {
    $aqLower = strtolower(rawurldecode($articleQuery));
    foreach ($db['articles'] as $art) {
        $aId = strtolower(trim((string)($art['id'] ?? '')));
        $aSlug = strtolower(trim((string)($art['slug'] ?? '')));
        $aTitleSlug = gsmSlugify($art['title'] ?? '');
        if ($aId === $aqLower || ($aSlug !== '' && $aSlug === $aqLower) || ($aTitleSlug !== '' && $aTitleSlug === $aqLower)) {
            $slugOrId = !empty($art['slug']) ? $art['slug'] : $art['id'];
            $pageTitle = !empty($art['seoTitle']) ? $art['seoTitle'] : ($art['title'] ?? 'Article');
            $pageDescription = !empty($art['seoDescription']) ? $art['seoDescription'] : ($art['summary'] ?? $pageDescription);
            $canonicalUrl = $origin . '/?article=' . rawurlencode($slugOrId);
            $ogType = 'article';
            $rawImg = trim((string)($art['coverImage'] ?? ''));
            if ($rawImg === '') {
                $rawImg = gsmExtractFirstImg($art['content'] ?? '');
            }
            $ogEndpoint = $origin . '/api/og-image?type=article&id=' . rawurlencode($slugOrId);
            $ogImage = gsmResolveAssetUrl($origin, $rawImg, $ogEndpoint);
            $ogImageAlt = $art['title'] ?? $pageTitle;
            break;
        }
    }
} elseif ($phoneQuery !== '' && !empty($db['phones']) && is_array($db['phones'])) {
    foreach ($db['phones'] as $ph) {
        if (gsmMatchesPhone($ph, $phoneQuery)) {
            $slugOrId = gsmCleanPhoneSlug($ph);
            $priceUsd = isset($ph['priceUSD']) ? $ph['priceUSD'] : '';
            $priceNgn = isset($ph['priceNGN']) ? number_format((float)$ph['priceNGN']) : '';
            $pageTitle = !empty($ph['seoTitle'])
                ? $ph['seoTitle']
                : (($ph['name'] ?? 'Phone') . ' Full Specifications, Reviews & Price ($' . $priceUsd . ' / ₦' . $priceNgn . ')');
            $kh = isset($ph['keyHighlights']) && is_array($ph['keyHighlights']) ? $ph['keyHighlights'] : array();
            $pageDescription = !empty($ph['seoDescription'])
                ? $ph['seoDescription']
                : (($ph['name'] ?? 'Phone') . ' complete specifications: ' . ($kh['display'] ?? '') . ' display, ' . ($kh['processor'] ?? '') . ' processor, ' . ($kh['camera'] ?? '') . ' camera, ' . ($kh['battery'] ?? '') . ' battery, and verified price.');
            $canonicalUrl = $origin . '/?phone=' . rawurlencode($slugOrId);
            $ogType = 'product';
            $rawImg = trim((string)($ph['image'] ?? ''));
            if ($rawImg === '' && !empty($ph['images'][0])) {
                $rawImg = trim((string)$ph['images'][0]);
            }
            if ($rawImg === '' && !empty($ph['gallery'][0])) {
                $rawImg = trim((string)$ph['gallery'][0]);
            }
            $ogEndpoint = $origin . '/api/og-image?type=phone&id=' . rawurlencode($slugOrId);
            $ogImage = gsmResolveAssetUrl($origin, $rawImg, $ogEndpoint);
            $ogImageAlt = ($ph['name'] ?? 'Phone') . ' — Full Specifications & Price';
            break;
        }
    }
}

$escapedSiteRegex = preg_quote((string)$siteName, '/');
$cleanTitlePattern = '/\s*(?:\||—|–|-|•)+\s*(?:GsmScope|' . $escapedSiteRegex . ')(?:\s+(?:CMS|Guides))?\s*$/iu';
$prevTitle = '';
while ($pageTitle !== $prevTitle) {
    $prevTitle = $pageTitle;
    $pageTitle = trim((string)preg_replace($cleanTitlePattern, '', (string)$pageTitle));
}
if ($pageTitle === '') {
    $pageTitle = $siteName;
}

$html = preg_replace('/<title>[\s\S]*?<\/title>/i', '<title>' . gsmEscapeAttr($pageTitle) . '</title>', $html, 1);
$html = preg_replace('/<meta[^>]*name=["\']description["\'][^>]*\/?>/i', '<meta name="description" content="' . gsmEscapeAttr($pageDescription) . '" />', $html, 1);
$html = preg_replace('/<link[^>]*rel=["\']canonical["\'][^>]*\/?>/i', '<link rel="canonical" href="' . gsmEscapeAttr($canonicalUrl) . '" />', $html, 1);
$html = preg_replace('/<meta[^>]*property=["\']og:type["\'][^>]*\/?>/i', '<meta property="og:type" content="' . gsmEscapeAttr($ogType) . '" />', $html, 1);
$html = preg_replace('/<meta[^>]*property=["\']og:site_name["\'][^>]*\/?>/i', '<meta property="og:site_name" content="' . gsmEscapeAttr($siteName) . '" />', $html, 1);
$html = preg_replace('/<meta[^>]*property=["\']og:title["\'][^>]*\/?>/i', '<meta property="og:title" content="' . gsmEscapeAttr($pageTitle) . '" />', $html, 1);
$html = preg_replace('/<meta[^>]*property=["\']og:description["\'][^>]*\/?>/i', '<meta property="og:description" content="' . gsmEscapeAttr($pageDescription) . '" />', $html, 1);
$html = preg_replace('/<meta[^>]*property=["\']og:url["\'][^>]*\/?>/i', '<meta property="og:url" content="' . gsmEscapeAttr($canonicalUrl) . '" />', $html, 1);
$html = preg_replace('/<meta[^>]*property=["\']og:image["\'][^>]*\/?>/i', '<meta property="og:image" content="' . gsmEscapeAttr($ogImage) . '" />', $html, 1);
if (preg_match('/<meta[^>]*property=["\']og:image:secure_url["\'][^>]*\/?>/i', $html)) {
    $html = preg_replace('/<meta[^>]*property=["\']og:image:secure_url["\'][^>]*\/?>/i', '<meta property="og:image:secure_url" content="' . gsmEscapeAttr($ogImage) . '" />', $html, 1);
} else {
    $html = preg_replace('/(<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>)/i', '$1' . "\n    " . '<meta property="og:image:secure_url" content="' . gsmEscapeAttr($ogImage) . '" />', $html, 1);
}
$html = preg_replace('/<meta[^>]*property=["\']og:image:alt["\'][^>]*\/?>/i', '<meta property="og:image:alt" content="' . gsmEscapeAttr($ogImageAlt) . '" />', $html, 1);
$html = preg_replace('/<meta[^>]*property=["\']og:image:width["\'][^>]*\/?>\s*/i', '', $html);
$html = preg_replace('/<meta[^>]*property=["\']og:image:height["\'][^>]*\/?>\s*/i', '', $html);
$html = preg_replace('/<meta[^>]*name=["\']twitter:title["\'][^>]*\/?>/i', '<meta name="twitter:title" content="' . gsmEscapeAttr($pageTitle) . '" />', $html, 1);
$html = preg_replace('/<meta[^>]*name=["\']twitter:description["\'][^>]*\/?>/i', '<meta name="twitter:description" content="' . gsmEscapeAttr($pageDescription) . '" />', $html, 1);
$html = preg_replace('/<meta[^>]*name=["\']twitter:image["\'][^>]*\/?>/i', '<meta name="twitter:image" content="' . gsmEscapeAttr($ogImage) . '" />', $html, 1);
$html = preg_replace('/<meta[^>]*name=["\']twitter:image:alt["\'][^>]*\/?>/i', '<meta name="twitter:image:alt" content="' . gsmEscapeAttr($ogImageAlt) . '" />', $html, 1);

$customScripts = isset($wc['customScripts']) && is_array($wc['customScripts']) ? $wc['customScripts'] : array();
if (!empty($customScripts)) {
    $isAdminPath = ($reqUriPath === '/admin' || strpos($reqUriPath, '/admin/') === 0);
    $robotsMeta = isset($customScripts['robotsTxtMeta']) ? trim((string)$customScripts['robotsTxtMeta']) : '';
    if (!$isAdminPath && $robotsMeta !== '') {
        $html = preg_replace('/<meta[^>]*name=["\']robots["\'][^>]*\/?>/i', '<meta name="robots" content="' . gsmEscapeAttr($robotsMeta) . '" />', $html, 1);
        $html = preg_replace('/<meta[^>]*name=["\']googlebot["\'][^>]*\/?>/i', '<meta name="googlebot" content="' . gsmEscapeAttr($robotsMeta) . '" />', $html, 1);
    }

    $headExtras = array();

    $googleVerify = isset($customScripts['metaVerificationGoogle']) ? trim((string)$customScripts['metaVerificationGoogle']) : '';
    if ($googleVerify !== '' && stripos($googleVerify, 'gsmscope-verified-token') === false) {
        if (preg_match('/^<meta\b/i', $googleVerify)) {
            $headExtras[] = $googleVerify;
        } else {
            $headExtras[] = '<meta name="google-site-verification" content="' . gsmEscapeAttr($googleVerify) . '" />';
        }
    }

    $bingVerify = isset($customScripts['metaVerificationBing']) ? trim((string)$customScripts['metaVerificationBing']) : '';
    if ($bingVerify !== '' && stripos($bingVerify, 'gsmscope-bing-token') === false) {
        if (preg_match('/^<meta\b/i', $bingVerify)) {
            $headExtras[] = $bingVerify;
        } else {
            $headExtras[] = '<meta name="msvalidate.01" content="' . gsmEscapeAttr($bingVerify) . '" />';
        }
    }

    $customHeadMeta = isset($customScripts['customHeadMeta']) ? trim((string)$customScripts['customHeadMeta']) : '';
    if ($customHeadMeta !== '') {
        $headExtras[] = $customHeadMeta;
    }

    $headerScriptsRaw = isset($customScripts['headerScripts']) ? trim((string)$customScripts['headerScripts']) : '';
    if ($headerScriptsRaw !== '' && $headerScriptsRaw !== '<!-- Google Analytics / GTM Head Script -->') {
        $headExtras[] = $headerScriptsRaw;
    }

    if (!empty($headExtras)) {
        $headInjection = implode("\n    ", $headExtras) . "\n  </head>";
        if (stripos($html, '</head>') !== false) {
            $html = str_ireplace('</head>', $headInjection, $html);
        }
    }

    $bodyTopRaw = isset($customScripts['bodyTopScripts']) ? trim((string)$customScripts['bodyTopScripts']) : '';
    if ($bodyTopRaw !== '' && $bodyTopRaw !== '<!-- Custom Body Open Script (e.g. GTM noscript) -->') {
        $html = preg_replace_callback('/<body([^>]*)>/i', function ($m) use ($bodyTopRaw) {
            return $m[0] . "\n    " . $bodyTopRaw;
        }, $html, 1);
    }

    $footerRaw = isset($customScripts['footerScripts']) ? trim((string)$customScripts['footerScripts']) : '';
    if ($footerRaw !== '' && $footerRaw !== '<!-- Custom Footer Analytics / Chat Widget Script -->') {
        if (stripos($html, '</body>') !== false) {
            $html = str_ireplace('</body>', "    " . $footerRaw . "\n  </body>", $html);
        }
    }
}

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
header('X-LiteSpeed-Cache-Control: no-cache');
echo $html;
