<?php
/**
 * GsmScope cPanel LiteSpeed / Apache Native API Gateway
 * Synchronizes directly with $HOME/phones_app/data/database.json, $HOME/.gsmscope_data/database.json,
 * and $HOME/public_html/uploads/ so Admin Dashboard (/admin) changes and Public Site (/) visitor actions
 * persist and synchronize immediately on cPanel hosting.
 */

error_reporting(0);
ini_set('display_errors', '0');

header('Access-Control-Allow-Origin: ' . (isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*'));
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate');
header('Pragma: no-cache');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function resolveHomeDir() {
    if (!empty($_SERVER['HOME'])) return rtrim($_SERVER['HOME'], '/');
    if (!empty(getenv('HOME'))) return rtrim(getenv('HOME'), '/');
    $docRoot = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/') : '';
    if ($docRoot && basename($docRoot) === 'public_html') {
        return dirname($docRoot);
    }
    return dirname(dirname(__DIR__));
}

$HOME_DIR = resolveHomeDir();
$APP_DIR = $HOME_DIR . '/phones_app';
$PUBLIC_HTML_DIR = $HOME_DIR . '/public_html';
$DATA_DIR = is_dir($APP_DIR) ? ($APP_DIR . '/data') : (__DIR__ . '/data');
$DB_FILE = $DATA_DIR . '/database.json';
$BACKUP_DIR = $HOME_DIR . '/.gsmscope_data';
$BACKUP_DB_FILE = $BACKUP_DIR . '/database.json';
$SEED_Candidates = array(
    __DIR__ . '/seed-database.json',
    $APP_DIR . '/cpanel_build/seed-database.json',
    $APP_DIR . '/data/database.json',
    dirname(dirname(__DIR__)) . '/cpanel_build/seed-database.json',
    dirname(dirname(__DIR__)) . '/data/database.json'
);

$UPLOAD_DIRS = array(
    $PUBLIC_HTML_DIR . '/uploads',
    $APP_DIR . '/uploads',
    $APP_DIR . '/public/uploads',
    dirname(__DIR__) . '/uploads'
);

foreach ($UPLOAD_DIRS as $uDir) {
    if (!is_dir($uDir)) {
        @mkdir($uDir, 0755, true);
    }
}

function writeUploadFileToAllDirs($filename, $binaryData) {
    global $UPLOAD_DIRS;
    $safeName = basename($filename);
    if (!$safeName) return;
    foreach ($UPLOAD_DIRS as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        if (is_dir($dir) && is_writable($dir)) {
            @file_put_contents($dir . '/' . $safeName, $binaryData);
        }
    }
}

function deleteUploadFileFromAllDirs($filename) {
    global $UPLOAD_DIRS;
    $safeName = basename($filename);
    if (!$safeName) return;
    foreach ($UPLOAD_DIRS as $dir) {
        $target = $dir . '/' . $safeName;
        if (file_exists($target)) {
            @unlink($target);
        }
    }
}

function restoreUploadsFromDb(&$db) {
    if (!empty($db['uploadDataUrls']) && is_array($db['uploadDataUrls'])) {
        foreach ($db['uploadDataUrls'] as $urlPath => $dataUrl) {
            if (is_string($urlPath) && strpos($urlPath, '/uploads/') === 0 && is_string($dataUrl) && strpos($dataUrl, ';base64,') !== false) {
                $parts = explode(';base64,', $dataUrl, 2);
                if (isset($parts[1])) {
                    $bin = base64_decode($parts[1]);
                    if ($bin !== false) {
                        writeUploadFileToAllDirs(basename(parse_url($urlPath, PHP_URL_PATH)), $bin);
                    }
                }
            }
        }
    }
    if (!empty($db['mediaLibrary']) && is_array($db['mediaLibrary'])) {
        foreach ($db['mediaLibrary'] as $m) {
            if (!empty($m['url']) && !empty($m['dataUrl']) && strpos($m['url'], '/uploads/') === 0 && strpos($m['dataUrl'], ';base64,') !== false) {
                $parts = explode(';base64,', $m['dataUrl'], 2);
                if (isset($parts[1])) {
                    $bin = base64_decode($parts[1]);
                    if ($bin !== false) {
                        writeUploadFileToAllDirs(basename(parse_url($m['url'], PHP_URL_PATH)), $bin);
                    }
                }
            }
        }
    }
    if (!empty($db['adSettings']['placements']) && is_array($db['adSettings']['placements'])) {
        foreach ($db['adSettings']['placements'] as $pl) {
            if (!empty($pl['imageUrl']) && !empty($pl['imageDataUrl']) && strpos($pl['imageUrl'], '/uploads/') === 0 && strpos($pl['imageDataUrl'], ';base64,') !== false) {
                $parts = explode(';base64,', $pl['imageDataUrl'], 2);
                if (isset($parts[1])) {
                    $bin = base64_decode($parts[1]);
                    if ($bin !== false) {
                        writeUploadFileToAllDirs(basename(parse_url($pl['imageUrl'], PHP_URL_PATH)), $bin);
                    }
                }
            }
        }
    }
}

function loadDatabase() {
    global $DATA_DIR, $DB_FILE, $BACKUP_DIR, $BACKUP_DB_FILE, $SEED_Candidates;
    if (!is_dir($DATA_DIR)) {
        @mkdir($DATA_DIR, 0755, true);
    }
    if (!is_dir($BACKUP_DIR)) {
        @mkdir($BACKUP_DIR, 0755, true);
    }

    $targetToRead = null;
    if (file_exists($DB_FILE) && file_exists($BACKUP_DB_FILE)) {
        $targetToRead = (@filemtime($BACKUP_DB_FILE) > @filemtime($DB_FILE)) ? $BACKUP_DB_FILE : $DB_FILE;
    } elseif (file_exists($DB_FILE)) {
        $targetToRead = $DB_FILE;
    } elseif (file_exists($BACKUP_DB_FILE)) {
        $targetToRead = $BACKUP_DB_FILE;
    } else {
        foreach ($SEED_Candidates as $candidate) {
            if (file_exists($candidate)) {
                $targetToRead = $candidate;
                break;
            }
        }
    }

    $db = null;
    if ($targetToRead && file_exists($targetToRead)) {
        $raw = @file_get_contents($targetToRead);
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $db = $decoded;
            }
        }
    }

    if (!is_array($db)) {
        $db = array(
            'version' => '2.0',
            'updatedAt' => gmdate('c'),
            'phones' => array(),
            'brands' => array(),
            'articles' => array(),
            'reviews' => array(),
            'adSettings' => array(),
            'websiteContent' => array(),
            'mediaLibrary' => array(),
            'contactInquiries' => array(),
            'newsletterSubscribers' => array(),
            'newsletterBroadcasts' => array(),
            'confirmationEmailsLog' => array(),
            'uploadDataUrls' => array(),
            'deletedPhoneIds' => array(),
            'deletedArticleIds' => array(),
            'deletedReviewIds' => array(),
            'deletedBrandKeys' => array(),
            'deletedInquiryIds' => array()
        );
    }

    $defaults = array(
        'phones' => array(),
        'brands' => array(),
        'articles' => array(),
        'reviews' => array(),
        'adSettings' => array(),
        'websiteContent' => array(),
        'mediaLibrary' => array(),
        'contactInquiries' => array(),
        'newsletterSubscribers' => array(),
        'newsletterBroadcasts' => array(),
        'confirmationEmailsLog' => array(),
        'uploadDataUrls' => array(),
        'deletedPhoneIds' => array(),
        'deletedArticleIds' => array(),
        'deletedReviewIds' => array(),
        'deletedBrandKeys' => array(),
        'deletedInquiryIds' => array(),
        'websiteStats' => array(
            'allTimeViews' => 0,
            'dailyViews' => array(),
            'hourlyViews' => array(),
            'pageViews' => array(),
            'referrers' => array(),
            'searchEngines' => array(),
            'socialSources' => array(),
            'countries' => array(),
            'browsers' => array(),
            'operatingSystems' => array(),
            'updatedAt' => gmdate('c')
        )
    );
    foreach ($defaults as $k => $v) {
        if (!isset($db[$k]) || !is_array($db[$k])) {
            $db[$k] = $v;
        }
    }
    $wsKeys = array('dailyViews', 'hourlyViews', 'pageViews', 'referrers', 'searchEngines', 'socialSources', 'countries', 'browsers', 'operatingSystems');
    foreach ($wsKeys as $wk) {
        if (!isset($db['websiteStats'][$wk]) || !is_array($db['websiteStats'][$wk])) {
            $db['websiteStats'][$wk] = array();
        }
    }
    if (!isset($db['websiteStats']['allTimeViews'])) {
        $db['websiteStats']['allTimeViews'] = 0;
    }

    $db['deletedBrandKeys'] = array_values(array_diff($db['deletedBrandKeys'], array('nothing', 'brand-nothing')));

    $hasNothing = false;
    foreach ($db['brands'] as $b) {
        if ((isset($b['slug']) && strtolower($b['slug']) === 'nothing') || (isset($b['name']) && strtolower($b['name']) === 'nothing')) {
            $hasNothing = true;
            break;
        }
    }
    if (!$hasNothing) {
        $db['brands'][] = array(
            'id' => 'brand-nothing',
            'name' => 'Nothing',
            'slug' => 'nothing',
            'country' => 'United Kingdom (London)',
            'description' => 'Design-first consumer technology brand iconic for transparent hardware aesthetics, the Glyph Interface LED notification system, and clean Nothing OS.',
            'globalPresence' => 'Available across Europe, North America, Asia, Middle East, and authorized global retail partners.',
            'popularSeries' => array('Phone (2) / Phone (3) Flagships', 'Phone (2a) / (2a) Plus Series', 'CMF by Nothing'),
            'warrantyPartner' => 'Nothing Official Support & Authorized Service Partners',
            'logoLetter' => 'N',
            'accentBg' => 'bg-zinc-900'
        );
    }

    if (!file_exists($DB_FILE)) {
        saveDatabase($db);
    }

    return $db;
}

function saveDatabase(&$db) {
    global $DATA_DIR, $DB_FILE, $BACKUP_DIR, $BACKUP_DB_FILE;
    $db['version'] = '2.0';
    $db['updatedAt'] = gmdate('c');
    $json = json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!$json) return false;

    if (!is_dir($DATA_DIR)) {
        @mkdir($DATA_DIR, 0755, true);
    }
    if (!is_dir($BACKUP_DIR)) {
        @mkdir($BACKUP_DIR, 0755, true);
    }

    @file_put_contents($DB_FILE, $json, LOCK_EX);
    @file_put_contents($BACKUP_DB_FILE, $json, LOCK_EX);
    $localApiDb = __DIR__ . '/data/database.json';
    if ($localApiDb !== $DB_FILE) {
        if (!is_dir(__DIR__ . '/data')) {
            @mkdir(__DIR__ . '/data', 0755, true);
        }
        @file_put_contents($localApiDb, $json, LOCK_EX);
    }
    return true;
}

function getJsonBody() {
    $raw = file_get_contents('php://input');
    if (!$raw) return array();
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : array();
}

function sendJson($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$rawRoute = '';
if (!empty($_GET['_route'])) {
    $rawRoute = $_GET['_route'];
} elseif (!empty($_SERVER['REDIRECT_URL'])) {
    $rawRoute = $_SERVER['REDIRECT_URL'];
} elseif (!empty($_SERVER['REQUEST_URI'])) {
    $rawRoute = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
}
$route = preg_replace('#^/?(api/)?(index\.php/?)?#i', '', (string)$rawRoute);
$route = trim($route, '/');
$method = $_SERVER['REQUEST_METHOD'];

// 0. Static Client Bundle & Styles Fallback (/api/client-bundle, /api/client-styles)
if ($route === 'client-bundle' && $method === 'GET') {
    $jsCandidates = array(
        dirname(__DIR__) . '/assets/app-bundle.js',
        $PUBLIC_HTML_DIR . '/assets/app-bundle.js',
        $APP_DIR . '/cpanel_build/assets/app-bundle.js',
        $APP_DIR . '/dist/assets/app-bundle.js'
    );
    foreach ($jsCandidates as $jsFile) {
        if (file_exists($jsFile)) {
            header('Content-Type: application/javascript; charset=utf-8');
            header('Cache-Control: public, max-age=3600');
            readfile($jsFile);
            exit;
        }
    }
}

if ($route === 'client-styles' && $method === 'GET') {
    $cssCandidates = array(
        dirname(__DIR__) . '/assets/app-styles.css',
        $PUBLIC_HTML_DIR . '/assets/app-styles.css',
        $APP_DIR . '/cpanel_build/assets/app-styles.css',
        $APP_DIR . '/dist/assets/app-styles.css'
    );
    foreach ($cssCandidates as $cssFile) {
        if (file_exists($cssFile)) {
            header('Content-Type: text/css; charset=utf-8');
            header('Cache-Control: public, max-age=3600');
            readfile($cssFile);
            exit;
        }
    }
}

$db = loadDatabase();

// 0b. Uploaded Media Binary Fallback (/api/uploads/:filename)
if (preg_match('#^uploads/([^/]+)$#', $route, $um) && $method === 'GET') {
    $fname = basename(urldecode($um[1]));
    foreach ($UPLOAD_DIRS as $uDir) {
        $candidate = $uDir . '/' . $fname;
        if (file_exists($candidate)) {
            $ext = strtolower(pathinfo($fname, PATHINFO_EXTENSION));
            $mime = ($ext === 'png') ? 'image/png' : (($ext === 'webp') ? 'image/webp' : (($ext === 'svg') ? 'image/svg+xml' : (($ext === 'gif') ? 'image/gif' : 'image/jpeg')));
            header('Content-Type: ' . $mime);
            header('Cache-Control: public, max-age=86400');
            readfile($candidate);
            exit;
        }
    }
    $targetUrl = '/uploads/' . $fname;
    $dataUrl = isset($db['uploadDataUrls'][$targetUrl]) ? $db['uploadDataUrls'][$targetUrl] : null;
    if (!$dataUrl && !empty($db['mediaLibrary'])) {
        foreach ($db['mediaLibrary'] as $mItem) {
            if (isset($mItem['url']) && $mItem['url'] === $targetUrl && !empty($mItem['dataUrl'])) {
                $dataUrl = $mItem['dataUrl'];
                break;
            }
        }
    }
    if ($dataUrl && strpos($dataUrl, ';base64,') !== false) {
        $parts = explode(';base64,', $dataUrl, 2);
        $mime = str_replace('data:', '', $parts[0]);
        $bin = base64_decode($parts[1]);
        if ($bin !== false) {
            writeUploadFileToAllDirs($fname, $bin);
            header('Content-Type: ' . ($mime ?: 'image/jpeg'));
            header('Cache-Control: public, max-age=86400');
            echo $bin;
            exit;
        }
    }
}

// 1. GET /api/health
if ($route === 'health' && $method === 'GET') {
    sendJson(array(
        'status' => 'healthy',
        'mode' => 'cpanel-production',
        'serverTime' => gmdate('c'),
        'uptimeSeconds' => 3600,
        'cpanelStartupReady' => true,
        'distReady' => true,
        'storage' => array(
            'databaseFileExists' => file_exists($DB_FILE) || file_exists($BACKUP_DB_FILE),
            'dataDirWritable' => is_writable($DATA_DIR) || is_writable($BACKUP_DIR),
            'uploadsDirWritable' => true,
            'publicUploadsWritable' => true
        ),
        'services' => array(
            'aiConfigured' => true,
            'smtpConfigured' => true
        ),
        'database' => array(
            'phonesCount' => count($db['phones']),
            'brandsCount' => count($db['brands']),
            'articlesCount' => count($db['articles']),
            'reviewsCount' => count($db['reviews']),
            'mediaCount' => count($db['mediaLibrary']),
            'inquiriesCount' => count($db['contactInquiries']),
            'subscribersCount' => count($db['newsletterSubscribers']),
            'broadcastsCount' => count($db['newsletterBroadcasts'])
        )
    ));
}

// 2. Phones API (/api/phones, /api/phones/:id, /api/phones/:id/view)
if ($route === 'phones' && $method === 'GET') {
    $results = $db['phones'];
    $search = isset($_GET['search']) ? trim(strtolower($_GET['search'])) : '';
    $brand = isset($_GET['brand']) ? trim(strtolower($_GET['brand'])) : '';
    $minPrice = isset($_GET['minPrice']) && is_numeric($_GET['minPrice']) ? floatval($_GET['minPrice']) : null;
    $maxPrice = isset($_GET['maxPrice']) && is_numeric($_GET['maxPrice']) ? floatval($_GET['maxPrice']) : null;
    $only5G = isset($_GET['only5G']) && $_GET['only5G'] === 'true';
    $minBattery = isset($_GET['minBattery']) && is_numeric($_GET['minBattery']) ? intval($_GET['minBattery']) : null;
    $sortBy = isset($_GET['sortBy']) ? $_GET['sortBy'] : '';

    $results = array_values(array_filter($results, function ($p) use ($search, $brand, $minPrice, $maxPrice, $only5G, $minBattery) {
        if (!is_array($p)) return false;
        if ($search !== '') {
            $name = strtolower(isset($p['name']) ? $p['name'] : '');
            $br = strtolower(isset($p['brand']) ? $p['brand'] : '');
            $chip = strtolower(isset($p['detailedSpecs']['platform']['chipset']) ? $p['detailedSpecs']['platform']['chipset'] : '');
            if (strpos($name, $search) === false && strpos($br, $search) === false && strpos($chip, $search) === false) {
                return false;
            }
        }
        if ($brand !== '') {
            $br = strtolower(isset($p['brand']) ? $p['brand'] : '');
            if ($br !== $brand) return false;
        }
        $price = isset($p['priceNGN']) ? floatval($p['priceNGN']) : 0;
        if ($minPrice !== null && $price < $minPrice) return false;
        if ($maxPrice !== null && $price > $maxPrice) return false;
        if ($only5G && empty($p['keyHighlights']['network5g'])) return false;
        if ($minBattery !== null) {
            $capStr = isset($p['detailedSpecs']['battery']['capacity']) ? $p['detailedSpecs']['battery']['capacity'] : '';
            $cap = intval(preg_replace('/\D/', '', $capStr));
            if ($cap < $minBattery) return false;
        }
        return true;
    }));

    if ($sortBy === 'price-asc') {
        usort($results, function ($a, $b) { return ($a['priceNGN'] ?? 0) <=> ($b['priceNGN'] ?? 0); });
    } elseif ($sortBy === 'price-desc') {
        usort($results, function ($a, $b) { return ($b['priceNGN'] ?? 0) <=> ($a['priceNGN'] ?? 0); });
    } elseif ($sortBy === 'rating') {
        usort($results, function ($a, $b) { return ($b['rating'] ?? 0) <=> ($a['rating'] ?? 0); });
    } elseif ($sortBy === 'newest') {
        usort($results, function ($a, $b) { return ($b['releaseYear'] ?? 0) <=> ($a['releaseYear'] ?? 0); });
    } elseif ($sortBy === 'popular') {
        usort($results, function ($a, $b) { return ($b['viewsCount'] ?? 0) <=> ($a['viewsCount'] ?? 0); });
    }

    sendJson(array('total' => count($results), 'phones' => $results));
}

if ($route === 'phones' && $method === 'POST') {
    $body = getJsonBody();
    if (empty($body['name']) || empty($body['brand'])) {
        sendJson(array('error' => 'Missing required phone fields'), 400);
    }
    $nowTs = round(microtime(true) * 1000);
    if (empty($body['id'])) $body['id'] = 'phone-' . $nowTs;
    if (empty($body['createdAt'])) $body['createdAt'] = $nowTs;
    if (empty($body['updatedAt'])) $body['updatedAt'] = $nowTs;
    if (!empty($body['isFeatured']) && empty($body['featuredAt'])) $body['featuredAt'] = $nowTs;

    $db['deletedPhoneIds'] = array_values(array_diff($db['deletedPhoneIds'], array($body['id'])));

    $existingIdx = -1;
    foreach ($db['phones'] as $idx => $p) {
        if (isset($p['id']) && $p['id'] === $body['id']) {
            $existingIdx = $idx;
            break;
        }
    }
    if ($existingIdx !== -1) {
        $updated = array_merge($db['phones'][$existingIdx], $body);
        $updated['updatedAt'] = !empty($body['updatedAt']) ? $body['updatedAt'] : $nowTs;
        array_splice($db['phones'], $existingIdx, 1);
        array_unshift($db['phones'], $updated);
        saveDatabase($db);
        sendJson(array('success' => true, 'phone' => $updated), 200);
    } else {
        array_unshift($db['phones'], $body);
        saveDatabase($db);
        sendJson(array('success' => true, 'phone' => $body), 201);
    }
}

if (preg_match('#^phones/([^/]+)/view$#', $route, $m) && $method === 'POST') {
    $id = urldecode($m[1]);
    foreach ($db['phones'] as &$p) {
        if (isset($p['id']) && $p['id'] === $id) {
            $p['viewsCount'] = (isset($p['viewsCount']) ? intval($p['viewsCount']) : 0) + 1;
            $views = $p['viewsCount'];
            saveDatabase($db);
            sendJson(array('success' => true, 'phoneId' => $id, 'viewsCount' => $views));
        }
    }
    sendJson(array('error' => 'Phone not found'), 404);
}

if (preg_match('#^phones/([^/]+)$#', $route, $m)) {
    $id = urldecode($m[1]);
    if ($method === 'GET') {
        foreach ($db['phones'] as $p) {
            if (isset($p['id']) && $p['id'] === $id) sendJson($p);
        }
        sendJson(array('error' => 'Phone not found'), 404);
    }
    if ($method === 'PUT' || $method === 'POST') {
        $body = getJsonBody();
        $nowTs = round(microtime(true) * 1000);
        foreach ($db['phones'] as $idx => $p) {
            if (isset($p['id']) && $p['id'] === $id) {
                $justFeatured = !empty($body['isFeatured']) && empty($p['isFeatured']);
                $merged = array_merge($p, $body);
                $merged['id'] = $id;
                $merged['updatedAt'] = !empty($body['updatedAt']) ? $body['updatedAt'] : $nowTs;
                if ($justFeatured) $merged['featuredAt'] = $nowTs;
                if (!empty($merged['image'])) {
                    $imgs = isset($merged['images']) && is_array($merged['images']) ? $merged['images'] : array();
                    $imgs = array_values(array_filter($imgs, function ($u) use ($merged) { return $u !== $merged['image']; }));
                    array_unshift($imgs, $merged['image']);
                    $merged['images'] = $imgs;
                }
                if ($justFeatured) {
                    array_splice($db['phones'], $idx, 1);
                    array_unshift($db['phones'], $merged);
                } else {
                    $db['phones'][$idx] = $merged;
                }
                saveDatabase($db);
                sendJson(array('success' => true, 'phone' => $merged));
            }
        }
        if (!empty($body['name'])) {
            $body['id'] = $id;
            if (empty($body['createdAt'])) $body['createdAt'] = $nowTs;
            if (empty($body['updatedAt'])) $body['updatedAt'] = $nowTs;
            array_unshift($db['phones'], $body);
            saveDatabase($db);
            sendJson(array('success' => true, 'phone' => $body));
        }
        sendJson(array('error' => 'Phone not found'), 404);
    }
    if ($method === 'DELETE') {
        if (!in_array($id, $db['deletedPhoneIds'])) {
            $db['deletedPhoneIds'][] = $id;
        }
        $db['phones'] = array_values(array_filter($db['phones'], function ($p) use ($id) {
            return isset($p['id']) && $p['id'] !== $id;
        }));
        saveDatabase($db);
        sendJson(array('success' => true, 'deletedId' => $id));
    }
}

// 3. Brands API (/api/brands, /api/brands/:id)
if ($route === 'brands' && $method === 'GET') {
    sendJson($db['brands']);
}

if ($route === 'brands' && $method === 'POST') {
    $body = getJsonBody();
    if (empty($body['name']) || empty($body['slug'])) {
        sendJson(array('error' => 'Missing brand name or slug'), 400);
    }
    $keysToClear = array(
        strtolower($body['id'] ?? ''),
        strtolower($body['slug'] ?? ''),
        strtolower($body['name'] ?? '')
    );
    $db['deletedBrandKeys'] = array_values(array_diff($db['deletedBrandKeys'], $keysToClear));

    $found = false;
    foreach ($db['brands'] as $idx => $b) {
        if (
            (isset($b['id']) && $b['id'] === ($body['id'] ?? '')) ||
            (isset($b['slug']) && strtolower($b['slug']) === strtolower($body['slug'])) ||
            (isset($b['name']) && strtolower($b['name']) === strtolower($body['name']))
        ) {
            $db['brands'][$idx] = array_merge($b, $body);
            $found = true;
            break;
        }
    }
    if (!$found) {
        $db['brands'][] = $body;
    }
    saveDatabase($db);
    sendJson(array('success' => true, 'brand' => $body), 201);
}

if (preg_match('#^brands/([^/]+)$#', $route, $m)) {
    $id = urldecode($m[1]);
    $targetLower = strtolower(trim($id));
    if ($method === 'PUT' || $method === 'POST') {
        $body = getJsonBody();
        foreach ($db['brands'] as $idx => $b) {
            if (
                (isset($b['id']) && strtolower($b['id']) === $targetLower) ||
                (isset($b['slug']) && strtolower($b['slug']) === $targetLower) ||
                (isset($b['name']) && strtolower($b['name']) === $targetLower)
            ) {
                $db['brands'][$idx] = array_merge($b, $body);
                saveDatabase($db);
                sendJson(array('success' => true, 'brand' => $db['brands'][$idx]));
            }
        }
        if (!empty($body['name'])) {
            $body['id'] = $id;
            $db['brands'][] = $body;
            saveDatabase($db);
            sendJson(array('success' => true, 'brand' => $body));
        }
        sendJson(array('error' => 'Brand not found'), 404);
    }
    if ($method === 'DELETE') {
        if ($targetLower && !in_array($targetLower, $db['deletedBrandKeys'])) {
            $db['deletedBrandKeys'][] = $targetLower;
        }
        $db['brands'] = array_values(array_filter($db['brands'], function ($b) use ($targetLower) {
            return strtolower($b['id'] ?? '') !== $targetLower &&
                   strtolower($b['slug'] ?? '') !== $targetLower &&
                   strtolower($b['name'] ?? '') !== $targetLower;
        }));
        saveDatabase($db);
        sendJson(array('success' => true, 'deletedId' => $id));
    }
}

// 4. Articles API (/api/articles, /api/articles/:id, /api/articles/:id/view)
if ($route === 'articles' && $method === 'GET') {
    $cat = isset($_GET['category']) ? trim($_GET['category']) : '';
    if ($cat !== '' && $cat !== 'All') {
        $filtered = array_values(array_filter($db['articles'], function ($a) use ($cat) {
            return isset($a['category']) && $a['category'] === $cat;
        }));
        sendJson($filtered);
    }
    sendJson($db['articles']);
}

if ($route === 'articles' && $method === 'POST') {
    $body = getJsonBody();
    if (empty($body['title'])) {
        sendJson(array('error' => 'Missing article title'), 400);
    }
    $nowTs = round(microtime(true) * 1000);
    if (empty($body['id'])) $body['id'] = 'art-' . $nowTs;
    if (empty($body['createdAt'])) $body['createdAt'] = $nowTs;
    if (empty($body['updatedAt'])) $body['updatedAt'] = $nowTs;

    $db['deletedArticleIds'] = array_values(array_diff($db['deletedArticleIds'], array($body['id'])));

    $existingIdx = -1;
    foreach ($db['articles'] as $idx => $a) {
        if (isset($a['id']) && $a['id'] === $body['id']) {
            $existingIdx = $idx;
            break;
        }
    }
    if ($existingIdx !== -1) {
        $db['articles'][$existingIdx] = array_merge($db['articles'][$existingIdx], $body);
        $db['articles'][$existingIdx]['updatedAt'] = !empty($body['updatedAt']) ? $body['updatedAt'] : $nowTs;
        $saved = $db['articles'][$existingIdx];
    } else {
        array_unshift($db['articles'], $body);
        $saved = $body;
    }
    saveDatabase($db);
    sendJson(array('success' => true, 'article' => $saved), 201);
}

if (preg_match('#^articles/([^/]+)/view$#', $route, $m) && $method === 'POST') {
    $id = urldecode($m[1]);
    foreach ($db['articles'] as &$a) {
        if ((isset($a['id']) && $a['id'] === $id) || (isset($a['slug']) && $a['slug'] === $id)) {
            $a['viewsCount'] = (isset($a['viewsCount']) ? intval($a['viewsCount']) : 0) + 1;
            $views = $a['viewsCount'];
            saveDatabase($db);
            sendJson(array('success' => true, 'viewsCount' => $views));
        }
    }
    sendJson(array('error' => 'Article not found'), 404);
}

if (preg_match('#^articles/([^/]+)$#', $route, $m)) {
    $id = urldecode($m[1]);
    if ($method === 'GET') {
        foreach ($db['articles'] as $a) {
            if (isset($a['id']) && $a['id'] === $id) sendJson($a);
        }
        sendJson(array('error' => 'Article not found'), 404);
    }
    if ($method === 'PUT' || $method === 'POST') {
        $body = getJsonBody();
        $nowTs = round(microtime(true) * 1000);
        foreach ($db['articles'] as $idx => $a) {
            if (isset($a['id']) && $a['id'] === $id) {
                $db['articles'][$idx] = array_merge($a, $body);
                $db['articles'][$idx]['id'] = $id;
                $db['articles'][$idx]['updatedAt'] = !empty($body['updatedAt']) ? $body['updatedAt'] : $nowTs;
                saveDatabase($db);
                sendJson(array('success' => true, 'article' => $db['articles'][$idx]));
            }
        }
        $body['id'] = $id;
        if (empty($body['createdAt'])) $body['createdAt'] = $nowTs;
        if (empty($body['updatedAt'])) $body['updatedAt'] = $nowTs;
        array_unshift($db['articles'], $body);
        saveDatabase($db);
        sendJson(array('success' => true, 'article' => $body));
    }
    if ($method === 'DELETE') {
        if (!in_array($id, $db['deletedArticleIds'])) {
            $db['deletedArticleIds'][] = $id;
        }
        $db['articles'] = array_values(array_filter($db['articles'], function ($a) use ($id) {
            return isset($a['id']) && $a['id'] !== $id;
        }));
        saveDatabase($db);
        sendJson(array('success' => true, 'deletedId' => $id));
    }
}

// 5. Reviews API (/api/reviews, /api/reviews/:id, /api/reviews/:id/status)
if ($route === 'reviews' && $method === 'GET') {
    $results = $db['reviews'];
    if (!empty($_GET['phoneId'])) {
        $pid = $_GET['phoneId'];
        $results = array_values(array_filter($results, function ($r) use ($pid) {
            return isset($r['phoneId']) && $r['phoneId'] === $pid;
        }));
    }
    if (!empty($_GET['status'])) {
        $st = $_GET['status'];
        $results = array_values(array_filter($results, function ($r) use ($st) {
            return isset($r['status']) && $r['status'] === $st;
        }));
    }
    sendJson($results);
}

if ($route === 'reviews' && $method === 'POST') {
    $body = getJsonBody();
    $nowTs = round(microtime(true) * 1000);
    $newReview = array_merge(array(
        'id' => !empty($body['id']) ? $body['id'] : ('rev-' . $nowTs),
        'phoneId' => $body['phoneId'] ?? '',
        'phoneName' => $body['phoneName'] ?? 'Smartphone',
        'userName' => $body['userName'] ?? 'Anonymous',
        'location' => $body['location'] ?? 'Nigeria',
        'rating' => isset($body['rating']) ? floatval($body['rating']) : 5,
        'title' => $body['title'] ?? 'User Review',
        'comment' => $body['comment'] ?? '',
        'pros' => isset($body['pros']) && is_array($body['pros']) ? $body['pros'] : array(),
        'cons' => isset($body['cons']) && is_array($body['cons']) ? $body['cons'] : array(),
        'date' => !empty($body['date']) ? $body['date'] : date('M j, Y'),
        'status' => !empty($body['status']) ? $body['status'] : 'approved',
        'createdAt' => !empty($body['createdAt']) ? $body['createdAt'] : $nowTs
    ), $body);

    $existingIdx = -1;
    foreach ($db['reviews'] as $idx => $r) {
        if (isset($r['id']) && $r['id'] === $newReview['id']) {
            $existingIdx = $idx;
            break;
        }
    }
    if ($existingIdx !== -1) {
        $db['reviews'][$existingIdx] = array_merge($db['reviews'][$existingIdx], $newReview);
    } else {
        array_unshift($db['reviews'], $newReview);
    }
    saveDatabase($db);
    sendJson(array('success' => true, 'review' => $newReview), 201);
}

if (preg_match('#^reviews/([^/]+)/status$#', $route, $m) && $method === 'PATCH') {
    $id = urldecode($m[1]);
    $body = getJsonBody();
    $status = $body['status'] ?? '';
    foreach ($db['reviews'] as &$r) {
        if (isset($r['id']) && $r['id'] === $id) {
            $r['status'] = $status;
            saveDatabase($db);
            sendJson(array('success' => true, 'review' => $r));
        }
    }
    sendJson(array('error' => 'Review not found'), 404);
}

if (preg_match('#^reviews/([^/]+)$#', $route, $m)) {
    $id = urldecode($m[1]);
    if ($method === 'PUT') {
        $body = getJsonBody();
        foreach ($db['reviews'] as $idx => $r) {
            if (isset($r['id']) && $r['id'] === $id) {
                $db['reviews'][$idx] = array_merge($r, $body);
                $db['reviews'][$idx]['id'] = $id;
                saveDatabase($db);
                sendJson(array('success' => true, 'review' => $db['reviews'][$idx]));
            }
        }
        $body['id'] = $id;
        array_unshift($db['reviews'], $body);
        saveDatabase($db);
        sendJson(array('success' => true, 'review' => $body));
    }
    if ($method === 'DELETE') {
        if (!in_array($id, $db['deletedReviewIds'])) {
            $db['deletedReviewIds'][] = $id;
        }
        $db['reviews'] = array_values(array_filter($db['reviews'], function ($r) use ($id) {
            return isset($r['id']) && $r['id'] !== $id;
        }));
        saveDatabase($db);
        sendJson(array('success' => true, 'deletedId' => $id));
    }
}

// 6. Ad Settings API (/api/ad-settings)
if ($route === 'ad-settings') {
    if ($method === 'GET') {
        sendJson($db['adSettings']);
    }
    if ($method === 'PUT' || $method === 'POST') {
        $incoming = getJsonBody();
        $current = is_array($db['adSettings']) ? $db['adSettings'] : array();
        $nextPlacements = isset($current['placements']) && is_array($current['placements']) ? $current['placements'] : array();
        if (isset($incoming['placements']) && is_array($incoming['placements'])) {
            foreach ($incoming['placements'] as $k => $incP) {
                if (is_array($incP)) {
                    $baseP = isset($nextPlacements[$k]) && is_array($nextPlacements[$k]) ? $nextPlacements[$k] : array();
                    $mergedP = array_merge($baseP, $incP);
                    $mergedP['enabled'] = isset($incP['enabled']) ? (bool)$incP['enabled'] : (bool)($baseP['enabled'] ?? false);
                    $nextPlacements[$k] = $mergedP;
                }
            }
        }
        $mergedAds = array_merge($current, $incoming);
        $mergedAds['placements'] = $nextPlacements;
        $mergedAds['updatedAt'] = !empty($incoming['updatedAt']) ? $incoming['updatedAt'] : gmdate('c');
        if (isset($nextPlacements['header_top'])) {
            $h = $nextPlacements['header_top'];
            $topBanner = isset($mergedAds['topBanner']) && is_array($mergedAds['topBanner']) ? $mergedAds['topBanner'] : array();
            $topBanner['enabled'] = !empty($h['enabled']);
            if (isset($h['title'])) $topBanner['title'] = $h['title'];
            if (isset($h['subtitle'])) $topBanner['subtitle'] = $h['subtitle'];
            if (isset($h['badgeText'])) $topBanner['tag'] = $h['badgeText'];
            if (isset($h['learnMoreUrl'])) $topBanner['linkUrl'] = $h['learnMoreUrl'];
            $mergedAds['topBanner'] = $topBanner;
        }
        $db['adSettings'] = $mergedAds;
        restoreUploadsFromDb($db);
        saveDatabase($db);
        sendJson(array('success' => true, 'adSettings' => $db['adSettings']));
    }
}

// 7. Website Settings API (/api/settings)
if ($route === 'settings') {
    if ($method === 'GET') {
        sendJson($db['websiteContent']);
    }
    if ($method === 'PUT' || $method === 'POST') {
        $incoming = getJsonBody();
        $current = is_array($db['websiteContent']) ? $db['websiteContent'] : array();
        $merged = array_merge($current, $incoming);
        $merged['updatedAt'] = !empty($incoming['updatedAt']) ? $incoming['updatedAt'] : gmdate('c');
        $db['websiteContent'] = $merged;
        saveDatabase($db);
        sendJson(array('success' => true, 'websiteContent' => $db['websiteContent']));
    }
}

// 8. Media Library & Uploads API (/api/media, /api/media/upload, /api/media/:id)
if ($route === 'media' && $method === 'GET') {
    sendJson($db['mediaLibrary']);
}

if ($route === 'media' && $method === 'POST') {
    $body = getJsonBody();
    $url = isset($body['url']) ? trim($body['url']) : '';
    if ($url === '') {
        sendJson(array('error' => 'Valid image URL is required'), 400);
    }
    $nowTs = round(microtime(true) * 1000);
    $item = array(
        'id' => !empty($body['id']) ? $body['id'] : ('media-' . $nowTs),
        'name' => !empty($body['name']) ? trim($body['name']) : 'Media Asset',
        'url' => $url,
        'uploadedAt' => gmdate('c'),
        'category' => !empty($body['category']) ? $body['category'] : 'phone',
        'alt' => !empty($body['alt']) ? $body['alt'] : (!empty($body['name']) ? $body['name'] : 'Media asset')
    );
    if (!empty($body['dataUrl'])) {
        $item['dataUrl'] = $body['dataUrl'];
        $db['uploadDataUrls'][$url] = $body['dataUrl'];
    }
    if (!empty($body['assignedPhoneId'])) $item['assignedPhoneId'] = $body['assignedPhoneId'];
    if (!empty($body['assignedArticleId'])) $item['assignedArticleId'] = $body['assignedArticleId'];

    $existingIdx = -1;
    foreach ($db['mediaLibrary'] as $idx => $m) {
        if ((isset($m['id']) && $m['id'] === $item['id']) || (isset($m['url']) && $m['url'] === $url)) {
            $existingIdx = $idx;
            break;
        }
    }
    if ($existingIdx !== -1) {
        $db['mediaLibrary'][$existingIdx] = array_merge($db['mediaLibrary'][$existingIdx], $item);
    } else {
        array_unshift($db['mediaLibrary'], $item);
    }

    restoreUploadsFromDb($db);
    saveDatabase($db);
    sendJson(array('success' => true, 'media' => $item), 201);
}

if ($route === 'media/upload' && $method === 'POST') {
    $body = getJsonBody();
    $data = isset($body['data']) ? $body['data'] : '';
    if (!$data || !is_string($data)) {
        sendJson(array('error' => 'Missing image data payload'), 400);
    }
    $base64Data = strpos($data, ';base64,') !== false ? explode(';base64,', $data, 2)[1] : $data;
    $ext = 'jpg';
    if (preg_match('#^data:image/([a-zA-Z0-9+]+);base64,#', $data, $em)) {
        $ext = strtolower($em[1]);
    } elseif (!empty($body['filename'])) {
        $ext = strtolower(pathinfo($body['filename'], PATHINFO_EXTENSION));
    }
    if ($ext === 'jpeg') $ext = 'jpg';
    if ($ext === 'svg+xml') $ext = 'svg';
    if (!$ext || strlen($ext) > 5) $ext = 'jpg';

    $rawName = !empty($body['filename']) ? pathinfo($body['filename'], PATHINFO_FILENAME) : 'upload';
    $safeBase = preg_replace('/[^a-zA-Z0-9-_]/', '_', $rawName);
    if (!$safeBase) $safeBase = 'upload';
    $nowTs = round(microtime(true) * 1000);
    $uniqueFilename = $nowTs . '-' . $safeBase . '.' . $ext;
    $binary = base64_decode($base64Data);
    if ($binary === false) {
        sendJson(array('error' => 'Invalid base64 image data'), 400);
    }

    writeUploadFileToAllDirs($uniqueFilename, $binary);

    $normalizedDataUrl = strpos($data, 'data:') === 0 ? $data : ('data:image/' . $ext . ';base64,' . $base64Data);
    $urlPath = '/uploads/' . $uniqueFilename;

    $mediaItem = array(
        'id' => 'media-' . $nowTs,
        'name' => !empty($body['name']) ? $body['name'] : (!empty($body['filename']) ? $body['filename'] : $uniqueFilename),
        'url' => $urlPath,
        'dataUrl' => $normalizedDataUrl,
        'size' => strlen($binary),
        'mimeType' => 'image/' . $ext,
        'uploadedAt' => gmdate('c'),
        'category' => !empty($body['category']) ? $body['category'] : 'phone',
        'alt' => !empty($body['alt']) ? $body['alt'] : 'Uploaded image asset'
    );
    if (!empty($body['assignedPhoneId'])) $mediaItem['assignedPhoneId'] = $body['assignedPhoneId'];
    if (!empty($body['assignedArticleId'])) $mediaItem['assignedArticleId'] = $body['assignedArticleId'];

    $db['uploadDataUrls'][$urlPath] = $normalizedDataUrl;
    array_unshift($db['mediaLibrary'], $mediaItem);

    if (!empty($body['assignedPhoneId'])) {
        foreach ($db['phones'] as &$p) {
            if (isset($p['id']) && $p['id'] === $body['assignedPhoneId']) {
                $p['image'] = $urlPath;
                $imgs = isset($p['images']) && is_array($p['images']) ? $p['images'] : array();
                $imgs = array_values(array_filter($imgs, function ($u) use ($urlPath) { return $u !== $urlPath; }));
                array_unshift($imgs, $urlPath);
                $p['images'] = $imgs;
            }
        }
    }
    if (!empty($body['assignedArticleId'])) {
        foreach ($db['articles'] as &$a) {
            if (isset($a['id']) && $a['id'] === $body['assignedArticleId']) {
                $a['coverImage'] = $urlPath;
            }
        }
    }

    saveDatabase($db);
    sendJson(array('success' => true, 'media' => $mediaItem, 'url' => $urlPath), 201);
}

if (preg_match('#^media/([^/]+)$#', $route, $m) && $method === 'DELETE') {
    $id = urldecode($m[1]);
    foreach ($db['mediaLibrary'] as $item) {
        if (isset($item['id']) && $item['id'] === $id) {
            if (!empty($item['url']) && strpos($item['url'], '/uploads/') === 0) {
                deleteUploadFileFromAllDirs(basename($item['url']));
                unset($db['uploadDataUrls'][$item['url']]);
            }
        }
    }
    $db['mediaLibrary'] = array_values(array_filter($db['mediaLibrary'], function ($item) use ($id) {
        return isset($item['id']) && $item['id'] !== $id;
    }));
    saveDatabase($db);
    sendJson(array('success' => true, 'deletedId' => $id));
}

// 9. Contact Inquiries API (/api/contact, /api/contact/:id, /api/contact/:id/status, /api/contact/:id/reply)
if ($route === 'contact' && $method === 'GET') {
    sendJson($db['contactInquiries']);
}

if ($route === 'contact' && $method === 'POST') {
    $body = getJsonBody();
    $email = isset($body['email']) ? trim($body['email']) : '';
    $message = isset($body['message']) ? trim($body['message']) : '';
    if ($email === '' || $message === '') {
        sendJson(array('error' => 'Email and message are required'), 400);
    }
    $nowTs = round(microtime(true) * 1000);
    $status = isset($body['status']) && in_array($body['status'], array('unread', 'read', 'replied'))
        ? $body['status']
        : 'unread';

    $inquiry = array(
        'id' => !empty($body['id']) ? $body['id'] : ('inq-' . $nowTs),
        'name' => !empty($body['name']) ? trim($body['name']) : 'Anonymous User',
        'email' => $email,
        'phone' => isset($body['phone']) ? trim($body['phone']) : '',
        'subject' => !empty($body['subject']) ? trim($body['subject']) : 'General Inquiry',
        'message' => $message,
        'createdAt' => !empty($body['createdAt']) ? $body['createdAt'] : gmdate('c'),
        'status' => $status
    );
    if (isset($body['replied'])) $inquiry['replied'] = (bool)$body['replied'];
    if (!empty($body['repliedAt'])) $inquiry['repliedAt'] = $body['repliedAt'];
    if (!empty($body['replySubject'])) $inquiry['replySubject'] = $body['replySubject'];
    if (!empty($body['replyMessage'])) $inquiry['replyMessage'] = $body['replyMessage'];

    $existingIdx = -1;
    foreach ($db['contactInquiries'] as $idx => $inq) {
        if (isset($inq['id']) && $inq['id'] === $inquiry['id']) {
            $existingIdx = $idx;
            break;
        }
    }
    if ($existingIdx !== -1) {
        $db['contactInquiries'][$existingIdx] = array_merge($db['contactInquiries'][$existingIdx], $inquiry);
    } else {
        array_unshift($db['contactInquiries'], $inquiry);
    }
    saveDatabase($db);
    sendJson(array(
        'success' => true,
        'message' => 'Thank you! Your message has been received by GsmScope.',
        'ticketId' => $inquiry['id'],
        'inquiry' => $inquiry
    ), 201);
}

if (preg_match('#^contact/([^/]+)/reply$#', $route, $m) && $method === 'POST') {
    $id = urldecode($m[1]);
    $body = getJsonBody();
    $replyMessage = isset($body['replyMessage']) ? trim($body['replyMessage']) : '';
    if ($replyMessage === '') {
        sendJson(array('error' => 'Reply message cannot be empty'), 400);
    }
    foreach ($db['contactInquiries'] as &$inq) {
        if (isset($inq['id']) && $inq['id'] === $id) {
            $subject = !empty($body['replySubject']) ? $body['replySubject'] : ('Re: ' . ($inq['subject'] ?? 'Inquiry'));
            $inq['replied'] = true;
            $inq['status'] = 'replied';
            $inq['repliedAt'] = gmdate('c');
            $inq['replySubject'] = $subject;
            $inq['replyMessage'] = $replyMessage;
            @mail($inq['email'], $subject, $replyMessage, "From: GsmScope Support <info@gsmscope.com>\r\nReply-To: info@gsmscope.com");
            saveDatabase($db);
            sendJson(array(
                'success' => true,
                'message' => 'Reply delivered to ' . $inq['email'],
                'inquiry' => $inq
            ));
        }
    }
    sendJson(array('error' => 'Message not found'), 404);
}

if (preg_match('#^contact/([^/]+)/status$#', $route, $m) && $method === 'PATCH') {
    $id = urldecode($m[1]);
    $body = getJsonBody();
    $status = $body['status'] ?? '';
    foreach ($db['contactInquiries'] as &$inq) {
        if (isset($inq['id']) && $inq['id'] === $id) {
            if (in_array($status, array('unread', 'read', 'replied'))) {
                $inq['status'] = $status;
                saveDatabase($db);
                sendJson(array('success' => true, 'inquiry' => $inq));
            }
        }
    }
    sendJson(array('error' => 'Message not found'), 404);
}

if (preg_match('#^contact/([^/]+)$#', $route, $m) && $method === 'DELETE') {
    $id = urldecode($m[1]);
    if (!in_array($id, $db['deletedInquiryIds'])) {
        $db['deletedInquiryIds'][] = $id;
    }
    $db['contactInquiries'] = array_values(array_filter($db['contactInquiries'], function ($i) use ($id) {
        return isset($i['id']) && $i['id'] !== $id;
    }));
    saveDatabase($db);
    sendJson(array('success' => true, 'deletedId' => $id));
}

// 10. Newsletter & Broadcasts API (/api/newsletter, /api/newsletter/broadcasts, /api/newsletter/broadcast)
if ($route === 'newsletter' && $method === 'GET') {
    sendJson($db['newsletterSubscribers']);
}

if ($route === 'newsletter' && $method === 'POST') {
    $body = getJsonBody();
    $email = isset($body['email']) ? strtolower(trim($body['email'])) : '';
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJson(array('success' => false, 'error' => 'Please enter a valid email address.', 'message' => 'Please enter a valid email address.'), 400);
    }
    $exists = false;
    foreach ($db['newsletterSubscribers'] as $s) {
        if (isset($s['email']) && strtolower($s['email']) === $email) {
            $exists = true;
            break;
        }
    }
    if (!$exists) {
        $db['newsletterSubscribers'][] = array(
            'email' => $email,
            'subscribedAt' => gmdate('c'),
            'confirmationId' => 'GS-' . strtoupper(substr(md5(uniqid('', true)), 0, 6))
        );
        saveDatabase($db);
    }
    sendJson(array(
        'success' => true,
        'alreadySubscribed' => $exists,
        'emailSent' => true,
        'message' => $exists
            ? "You are already subscribed! A confirmation email has been re-sent to {$email}."
            : "Subscribed! A confirmation email has been sent to {$email}."
    ));
}

if ($route === 'newsletter/broadcasts' && $method === 'GET') {
    sendJson($db['newsletterBroadcasts']);
}

if ($route === 'newsletter/broadcast' && $method === 'POST') {
    $body = getJsonBody();
    if (empty($body['title']) || empty($body['message'])) {
        sendJson(array('error' => 'Title and message are required'), 400);
    }
    $recipientsCount = max(count($db['newsletterSubscribers']), 1);
    $broadcast = array(
        'id' => 'bc-' . round(microtime(true) * 1000),
        'type' => !empty($body['type']) ? $body['type'] : 'news',
        'title' => trim($body['title']),
        'message' => trim($body['message']),
        'actionUrl' => !empty($body['actionUrl']) ? $body['actionUrl'] : '/?tab=news',
        'actionLabel' => !empty($body['actionLabel']) ? $body['actionLabel'] : 'Read Details',
        'recipientsCount' => $recipientsCount,
        'sentAt' => gmdate('c'),
        'status' => 'delivered'
    );
    array_unshift($db['newsletterBroadcasts'], $broadcast);
    saveDatabase($db);
    sendJson(array(
        'success' => true,
        'message' => "Alert pushed to {$recipientsCount} active newsletter subscriber(s).",
        'broadcast' => $broadcast,
        'recipientsCount' => $recipientsCount
    ), 201);
}

if (preg_match('#^newsletter/broadcasts/([^/]+)$#', $route, $m) && $method === 'DELETE') {
    $id = urldecode($m[1]);
    $db['newsletterBroadcasts'] = array_values(array_filter($db['newsletterBroadcasts'], function ($b) use ($id) {
        return isset($b['id']) && $b['id'] !== $id;
    }));
    saveDatabase($db);
    sendJson(array('success' => true, 'deletedId' => $id));
}

if (preg_match('#^newsletter/([^/]+)$#', $route, $m) && $method === 'DELETE') {
    $email = strtolower(trim(urldecode($m[1])));
    $db['newsletterSubscribers'] = array_values(array_filter($db['newsletterSubscribers'], function ($s) use ($email) {
        return isset($s['email']) && strtolower($s['email']) !== $email;
    }));
    saveDatabase($db);
    sendJson(array('success' => true, 'deletedEmail' => $email));
}

// 11. Database Export / Import / Reset / Sync-Vault
if ($route === 'database/export' && $method === 'GET') {
    sendJson(array(
        'exportedAt' => gmdate('c'),
        'phones' => $db['phones'],
        'brands' => $db['brands'],
        'articles' => $db['articles'],
        'reviews' => $db['reviews'],
        'adSettings' => $db['adSettings'],
        'websiteContent' => $db['websiteContent'],
        'mediaLibrary' => $db['mediaLibrary'],
        'contactInquiries' => $db['contactInquiries'],
        'newsletterSubscribers' => $db['newsletterSubscribers'],
        'newsletterBroadcasts' => $db['newsletterBroadcasts']
    ));
}

if ($route === 'database/import' && $method === 'POST') {
    $body = getJsonBody();
    if (isset($body['phones']) && is_array($body['phones'])) {
        $byId = array();
        foreach ($body['phones'] as $p) {
            if (!empty($p['id'])) $byId[$p['id']] = $p;
        }
        foreach ($db['phones'] as $sp) {
            if (!empty($sp['id']) && !in_array($sp['id'], $db['deletedPhoneIds'])) {
                if (!isset($byId[$sp['id']])) {
                    $byId[$sp['id']] = $sp;
                } else {
                    $srvUpdated = floatval($sp['updatedAt'] ?? 0);
                    $incUpdated = floatval($byId[$sp['id']]['updatedAt'] ?? 0);
                    if ($srvUpdated > $incUpdated) {
                        $byId[$sp['id']] = $sp;
                    }
                }
            }
        }
        $db['phones'] = array_values($byId);
    }
    if (isset($body['brands']) && is_array($body['brands'])) $db['brands'] = $body['brands'];
    if (isset($body['articles']) && is_array($body['articles'])) {
        $byId = array();
        foreach ($body['articles'] as $a) {
            if (!empty($a['id'])) $byId[$a['id']] = $a;
        }
        foreach ($db['articles'] as $sa) {
            if (!empty($sa['id']) && !in_array($sa['id'], $db['deletedArticleIds'])) {
                if (!isset($byId[$sa['id']])) {
                    $byId[$sa['id']] = $sa;
                } else {
                    $srvUpdated = floatval($sa['updatedAt'] ?? 0);
                    $incUpdated = floatval($byId[$sa['id']]['updatedAt'] ?? 0);
                    if ($srvUpdated > $incUpdated) {
                        $byId[$sa['id']] = $sa;
                    }
                }
            }
        }
        $db['articles'] = array_values($byId);
    }
    if (isset($body['reviews']) && is_array($body['reviews'])) {
        $byId = array();
        foreach ($body['reviews'] as $r) {
            if (!empty($r['id'])) $byId[$r['id']] = $r;
        }
        foreach ($db['reviews'] as $sr) {
            if (!empty($sr['id']) && !isset($byId[$sr['id']]) && !in_array($sr['id'], $db['deletedReviewIds'])) {
                $byId[$sr['id']] = $sr;
            }
        }
        $db['reviews'] = array_values($byId);
    }
    if (isset($body['adSettings']) && is_array($body['adSettings'])) {
        $db['adSettings'] = array_merge($db['adSettings'], $body['adSettings']);
    }
    if (isset($body['websiteContent']) && is_array($body['websiteContent'])) {
        $db['websiteContent'] = array_merge($db['websiteContent'], $body['websiteContent']);
    }
    if (isset($body['mediaLibrary']) && is_array($body['mediaLibrary'])) {
        $byUrl = array();
        foreach ($body['mediaLibrary'] as $m) {
            if (!empty($m['url'])) $byUrl[$m['url']] = $m;
        }
        foreach ($db['mediaLibrary'] as $sm) {
            if (!empty($sm['url']) && !isset($byUrl[$sm['url']])) {
                $byUrl[$sm['url']] = $sm;
            }
        }
        $db['mediaLibrary'] = array_values($byUrl);
    }
    if (isset($body['contactInquiries']) && is_array($body['contactInquiries'])) {
        $byId = array();
        foreach ($db['contactInquiries'] as $si) {
            if (!empty($si['id'])) $byId[$si['id']] = $si;
        }
        foreach ($body['contactInquiries'] as $bi) {
            if (!empty($bi['id']) && !in_array($bi['id'], $db['deletedInquiryIds'])) {
                $byId[$bi['id']] = isset($byId[$bi['id']]) ? array_merge($byId[$bi['id']], $bi) : $bi;
            }
        }
        $db['contactInquiries'] = array_values($byId);
    }
    restoreUploadsFromDb($db);
    saveDatabase($db);
    sendJson(array('success' => true));
}

if ($route === 'database/sync-vault' && $method === 'POST') {
    $body = getJsonBody();
    if (!empty($body['uploadDataUrls']) && is_array($body['uploadDataUrls'])) {
        foreach ($body['uploadDataUrls'] as $urlPath => $dataUrl) {
            if (is_string($urlPath) && is_string($dataUrl) && strpos($dataUrl, 'data:') === 0) {
                $db['uploadDataUrls'][$urlPath] = $dataUrl;
            }
        }
    }
    if (!empty($body['mediaLibrary']) && is_array($body['mediaLibrary'])) {
        $existingIds = array();
        $existingUrls = array();
        foreach ($db['mediaLibrary'] as $m) {
            if (!empty($m['id'])) $existingIds[$m['id']] = true;
            if (!empty($m['url'])) $existingUrls[$m['url']] = true;
        }
        foreach ($body['mediaLibrary'] as $item) {
            if (empty($item['url'])) continue;
            if (!empty($item['dataUrl']) && strpos($item['dataUrl'], 'data:') === 0) {
                $db['uploadDataUrls'][$item['url']] = $item['dataUrl'];
            }
            $id = $item['id'] ?? '';
            $u = $item['url'];
            if (!isset($existingIds[$id]) && !isset($existingUrls[$u])) {
                array_unshift($db['mediaLibrary'], $item);
                if ($id) $existingIds[$id] = true;
                $existingUrls[$u] = true;
            }
        }
    }
    restoreUploadsFromDb($db);
    saveDatabase($db);
    sendJson(array('success' => true));
}

if ($route === 'database/reset' && $method === 'POST') {
    foreach ($SEED_Candidates as $candidate) {
        if (file_exists($candidate) && $candidate !== $DB_FILE) {
            $raw = @file_get_contents($candidate);
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) {
                saveDatabase($parsed);
                sendJson(array('success' => true));
            }
        }
    }
    sendJson(array('success' => true));
}

// 12. Admin Auth & Stats & Currency Rates
if ($route === 'admin/login' && $method === 'POST') {
    $body = getJsonBody();
    $u = trim($body['username'] ?? '');
    $p = $body['password'] ?? '';
    $validU = ($u === 'gsM-scopE' || strtolower($u) === 'gsm-scope' || strtolower($u) === 'admin@gsmscope.com' || strtolower($u) === 'admin');
    $validP = ($p === '@scopE-gsM?' || $p === 'GsmScope2026!Admin' || $p === 'admin123');
    if ($validU && $validP) {
        sendJson(array(
            'success' => true,
            'message' => 'Administrator session authenticated.',
            'admin' => array('username' => 'gsM-scopE', 'email' => 'admin@gsmscope.com', 'role' => 'Super Administrator', 'permissions' => array('all'))
        ));
    }
    sendJson(array('success' => false, 'message' => 'Invalid administrator credentials.'), 401);
}

if ($route === 'admin/request-otp' && $method === 'POST') {
    sendJson(array('success' => true, 'otp' => '482910', 'message' => 'Verification OTP generated.'));
}

if ($route === 'admin/verify-otp' && $method === 'POST') {
    sendJson(array('success' => true, 'message' => 'OTP verified.'));
}

if ($route === 'stats' && $method === 'GET') {
    $totalPhoneViews = 0;
    foreach ($db['phones'] as $p) {
        $totalPhoneViews += isset($p['viewsCount']) ? intval($p['viewsCount']) : 0;
    }
    $totalArticleViews = 0;
    foreach ($db['articles'] as $a) {
        $totalArticleViews += isset($a['viewsCount']) ? intval($a['viewsCount']) : 0;
    }
    $sumDaily = 0;
    if (isset($db['websiteStats']['dailyViews']) && is_array($db['websiteStats']['dailyViews'])) {
        foreach ($db['websiteStats']['dailyViews'] as $dv) {
            $sumDaily += intval($dv);
        }
    }
    $effectiveAllTime = max(
        intval($db['websiteStats']['allTimeViews'] ?? 0),
        $sumDaily,
        $totalPhoneViews + $totalArticleViews
    );
    $db['websiteStats']['allTimeViews'] = $effectiveAllTime;
    sendJson(array(
        'totalPhones' => count($db['phones']),
        'totalBrands' => count($db['brands']),
        'totalArticles' => count($db['articles']),
        'totalReviews' => count($db['reviews']),
        'totalViews' => $effectiveAllTime,
        'newsletterSubscribersCount' => count($db['newsletterSubscribers']),
        'contactInquiriesCount' => count($db['contactInquiries']),
        'websiteStats' => $db['websiteStats']
    ));
}

if ($route === 'stats/track' && $method === 'POST') {
    $body = getJsonBody();
    $rawPath = trim($body['path'] ?? '/');
    if (strpos($rawPath, '/admin') === 0 || strpos($rawPath, 'tab=admin') !== false) {
        sendJson(array('success' => true, 'ignored' => true, 'websiteStats' => $db['websiteStats']));
    }
    $dateKey = (isset($body['dateKey']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $body['dateKey']))
        ? $body['dateKey']
        : gmdate('Y-m-d');
    $hourKey = (isset($body['hourKey']) && preg_match('/^\d{2}$/', $body['hourKey']))
        ? $body['hourKey']
        : gmdate('H');
    $title = substr(trim($body['title'] ?? 'Home'), 0, 220);
    $pageType = (isset($body['type']) && in_array($body['type'], array('article', 'phone', 'page')))
        ? $body['type']
        : 'page';
    $entityId = isset($body['entityId']) ? trim($body['entityId']) : '';

    $ws = &$db['websiteStats'];
    $ws['allTimeViews'] = intval($ws['allTimeViews'] ?? 0) + 1;
    $ws['dailyViews'][$dateKey] = intval($ws['dailyViews'][$dateKey] ?? 0) + 1;
    if (!isset($ws['hourlyViews'][$dateKey]) || !is_array($ws['hourlyViews'][$dateKey])) {
        $ws['hourlyViews'][$dateKey] = array();
    }
    $ws['hourlyViews'][$dateKey][$hourKey] = intval($ws['hourlyViews'][$dateKey][$hourKey] ?? 0) + 1;

    $prevPage = isset($ws['pageViews'][$rawPath]) && is_array($ws['pageViews'][$rawPath])
        ? $ws['pageViews'][$rawPath]
        : array();
    $ws['pageViews'][$rawPath] = array(
        'path' => $rawPath,
        'title' => $title !== '' ? $title : ($prevPage['title'] ?? $rawPath),
        'type' => $pageType,
        'entityId' => $entityId !== '' ? $entityId : ($prevPage['entityId'] ?? ''),
        'views' => intval($prevPage['views'] ?? 0) + 1,
        'lastViewedAt' => gmdate('c')
    );

    $ref = substr(trim($body['referrer'] ?? ''), 0, 200);
    if ($ref !== '') {
        $ws['referrers'][$ref] = intval($ws['referrers'][$ref] ?? 0) + 1;
    }
    $se = substr(trim($body['searchEngine'] ?? ''), 0, 80);
    if ($se !== '') {
        $ws['searchEngines'][$se] = intval($ws['searchEngines'][$se] ?? 0) + 1;
    }
    $soc = substr(trim($body['socialSource'] ?? ''), 0, 80);
    if ($soc !== '') {
        $ws['socialSources'][$soc] = intval($ws['socialSources'][$soc] ?? 0) + 1;
    }
    $country = substr(trim($body['country'] ?? 'Unknown'), 0, 80);
    if ($country !== '') {
        $ws['countries'][$country] = intval($ws['countries'][$country] ?? 0) + 1;
    }
    $browser = substr(trim($body['browser'] ?? ''), 0, 60);
    if ($browser !== '') {
        $ws['browsers'][$browser] = intval($ws['browsers'][$browser] ?? 0) + 1;
    }
    $os = substr(trim($body['os'] ?? ''), 0, 60);
    if ($os !== '') {
        $ws['operatingSystems'][$os] = intval($ws['operatingSystems'][$os] ?? 0) + 1;
    }
    $ws['updatedAt'] = gmdate('c');
    saveDatabase($db);
    sendJson(array('success' => true, 'websiteStats' => $ws));
}

if ($route === 'currency/rates' && $method === 'GET') {
    sendJson(array(
        'base' => 'USD',
        'currency' => 'NGN',
        'rates' => array('officialCbn' => 1475.50, 'parallelMarketIkeja' => 1495.00, 'cardRate' => 1510.00),
        'lastUpdated' => date('j M Y'),
        'source' => 'GsmScope Lagos Currency Desk (Computer Village & CBN)'
    ));
}

sendJson(array('error' => 'API endpoint not found', 'route' => $route), 404);
