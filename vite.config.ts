import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import esbuild from 'esbuild';
import fs from 'fs';
import * as lightningcss from 'lightningcss';
import path from 'path';
import postcss from 'postcss';
import { defineConfig } from 'vite';

function transformModernSelectors(selector: string): string {
  let s = selector;

  // 1. Convert Tailwind v4 group-hover / peer-hover selectors using :is(:where(.group):hover *)
  // into universal CSS2 descendant selectors (.group:hover .group-hover\:...)
  s = s.replace(
    /(\[data-theme=dark\]\s+)?(\.[^\s:]+(?:\\:[^\s:]+)*):is\(:where\(\.group\):hover\s+\*\)/g,
    (_, darkPrefix, cls) => `${darkPrefix || ''}.group:hover ${cls}`
  );

  // 2. Convert Preflight :where(select:is([multiple],[size])) and input:where([type=button],...)
  s = s.replace(
    /:where\(select:is\(\[multiple\],\s*\[size\]\)\)\s*optgroup\s+option/g,
    'select[multiple] optgroup option, select[size] optgroup option'
  );
  s = s.replace(
    /:where\(select:is\(\[multiple\],\s*\[size\]\)\)\s*optgroup/g,
    'select[multiple] optgroup, select[size] optgroup'
  );
  s = s.replace(
    /input:where\(\[type=button\],\s*\[type=reset\],\s*\[type=submit\]\)/g,
    'input[type=button], input[type=reset], input[type=submit]'
  );

  // 3. Unwrap all remaining :where(...) balanced parentheses without splitting inside nested parens/brackets
  while (s.includes(':where(')) {
    const idx = s.indexOf(':where(');
    if (idx === -1) break;
    let depth = 0;
    let closeIdx = -1;
    for (let i = idx + 6; i < s.length; i++) {
      if (s[i] === '(') depth++;
      else if (s[i] === ')') {
        depth--;
        if (depth === 0) {
          closeIdx = i;
          break;
        }
      }
    }
    if (closeIdx === -1) break;
    const inner = s.slice(idx + 7, closeIdx);
    s = s.slice(0, idx) + inner + s.slice(closeIdx + 1);
  }

  return s;
}

const LEGACY_BROWSER_FALLBACK_CSS = `
/* Aspect-ratio fallbacks for Chrome < 88 (including Chrome 79) and older Safari/Firefox */
@supports not (aspect-ratio: 1 / 1) {
  .aspect-\\[4\\/3\\] { height: 215px; }
  .aspect-square { height: 220px; }
  .aspect-\\[16\\/9\\] { height: 215px; }
  .aspect-\\[16\\/10\\] { height: 195px; }
  @media (min-width: 640px) {
    .sm\\:aspect-square { height: 260px; }
    .sm\\:aspect-\\[16\\/9\\] { height: 225px; }
  }
  @media (min-width: 768px) {
    .md\\:aspect-\\[2\\/1\\] { height: 215px; }
  }
  @media (min-width: 1024px) {
    .lg\\:aspect-auto { height: 100%; min-height: 280px; }
  }
}

/* Flexbox gap fallbacks for Chrome < 84 (including Chrome 79) and older browsers */
@supports not (inset: 0px) {
  .flex.gap-0\\.5:not(.flex-col) > :not(:first-child), .inline-flex.gap-0\\.5:not(.flex-col) > :not(:first-child) { margin-left: 0.125rem; }
  .flex.gap-1:not(.flex-col) > :not(:first-child), .inline-flex.gap-1:not(.flex-col) > :not(:first-child) { margin-left: 0.25rem; }
  .flex.gap-1\\.5:not(.flex-col) > :not(:first-child), .inline-flex.gap-1\\.5:not(.flex-col) > :not(:first-child) { margin-left: 0.375rem; }
  .flex.gap-2:not(.flex-col) > :not(:first-child), .inline-flex.gap-2:not(.flex-col) > :not(:first-child) { margin-left: 0.5rem; }
  .flex.gap-2\\.5:not(.flex-col) > :not(:first-child), .inline-flex.gap-2\\.5:not(.flex-col) > :not(:first-child) { margin-left: 0.625rem; }
  .flex.gap-3:not(.flex-col) > :not(:first-child), .inline-flex.gap-3:not(.flex-col) > :not(:first-child) { margin-left: 0.75rem; }
  .flex.gap-3\\.5:not(.flex-col) > :not(:first-child), .inline-flex.gap-3\\.5:not(.flex-col) > :not(:first-child) { margin-left: 0.875rem; }
  .flex.gap-4:not(.flex-col) > :not(:first-child), .inline-flex.gap-4:not(.flex-col) > :not(:first-child) { margin-left: 1rem; }
  .flex.gap-5:not(.flex-col) > :not(:first-child), .inline-flex.gap-5:not(.flex-col) > :not(:first-child) { margin-left: 1.25rem; }
  .flex.gap-6:not(.flex-col) > :not(:first-child), .inline-flex.gap-6:not(.flex-col) > :not(:first-child) { margin-left: 1.5rem; }
  .flex.gap-8:not(.flex-col) > :not(:first-child), .inline-flex.gap-8:not(.flex-col) > :not(:first-child) { margin-left: 2rem; }
  .flex.gap-x-4:not(.flex-col) > :not(:first-child) { margin-left: 1rem; }

  .flex.flex-col.gap-0\\.5 > :not(:first-child) { margin-top: 0.125rem; }
  .flex.flex-col.gap-1 > :not(:first-child) { margin-top: 0.25rem; }
  .flex.flex-col.gap-1\\.5 > :not(:first-child) { margin-top: 0.375rem; }
  .flex.flex-col.gap-2 > :not(:first-child) { margin-top: 0.5rem; }
  .flex.flex-col.gap-2\\.5 > :not(:first-child) { margin-top: 0.625rem; }
  .flex.flex-col.gap-3 > :not(:first-child) { margin-top: 0.75rem; }
  .flex.flex-col.gap-3\\.5 > :not(:first-child) { margin-top: 0.875rem; }
  .flex.flex-col.gap-4 > :not(:first-child) { margin-top: 1rem; }
  .flex.flex-col.gap-5 > :not(:first-child) { margin-top: 1.25rem; }
  .flex.flex-col.gap-6 > :not(:first-child) { margin-top: 1.5rem; }
  .flex.flex-col.gap-8 > :not(:first-child) { margin-top: 2rem; }

  @media (min-width: 640px) {
    .sm\\:flex.gap-1:not(.flex-col) > :not(:first-child) { margin-left: 0.25rem; }
    .sm\\:flex.gap-1\\.5:not(.flex-col) > :not(:first-child) { margin-left: 0.375rem; }
    .sm\\:flex.gap-2:not(.flex-col) > :not(:first-child) { margin-left: 0.5rem; }
    .sm\\:flex.gap-2\\.5:not(.flex-col) > :not(:first-child) { margin-left: 0.625rem; }
    .sm\\:flex.gap-3:not(.flex-col) > :not(:first-child) { margin-left: 0.75rem; }
    .flex.sm\\:gap-2\\.5:not(.flex-col) > :not(:first-child) { margin-left: 0.625rem; }
    .flex.sm\\:gap-3:not(.flex-col) > :not(:first-child) { margin-left: 0.75rem; }
    .flex.sm\\:gap-4:not(.flex-col) > :not(:first-child) { margin-left: 1rem; }
    .flex.sm\\:gap-5:not(.flex-col) > :not(:first-child) { margin-left: 1.25rem; }
    .flex.sm\\:gap-6:not(.flex-col) > :not(:first-child) { margin-left: 1.5rem; }
    .flex.flex-col.sm\\:flex-row.gap-2 > :not(:first-child) { margin-top: 0; margin-left: 0.5rem; }
    .flex.flex-col.sm\\:flex-row.gap-2\\.5 > :not(:first-child) { margin-top: 0; margin-left: 0.625rem; }
    .flex.flex-col.sm\\:flex-row.gap-3 > :not(:first-child) { margin-top: 0; margin-left: 0.75rem; }
    .flex.flex-col.sm\\:flex-row.gap-3\\.5 > :not(:first-child) { margin-top: 0; margin-left: 0.875rem; }
    .flex.flex-col.sm\\:flex-row.gap-4 > :not(:first-child) { margin-top: 0; margin-left: 1rem; }
    .flex.flex-col.sm\\:flex-row.gap-5 > :not(:first-child) { margin-top: 0; margin-left: 1.25rem; }
    .flex.flex-col.sm\\:flex-row.gap-6 > :not(:first-child) { margin-top: 0; margin-left: 1.5rem; }
  }

  @media (min-width: 768px) {
    .md\\:flex.gap-1:not(.flex-col) > :not(:first-child) { margin-left: 0.25rem; }
    .md\\:flex.gap-1\\.5:not(.flex-col) > :not(:first-child) { margin-left: 0.375rem; }
    .md\\:flex.gap-2:not(.flex-col) > :not(:first-child) { margin-left: 0.5rem; }
    .md\\:flex.gap-3:not(.flex-col) > :not(:first-child) { margin-left: 0.75rem; }
    .md\\:flex.gap-4:not(.flex-col) > :not(:first-child) { margin-left: 1rem; }
    .flex.flex-col.md\\:flex-row.gap-2 > :not(:first-child) { margin-top: 0; margin-left: 0.5rem; }
    .flex.flex-col.md\\:flex-row.gap-3 > :not(:first-child) { margin-top: 0; margin-left: 0.75rem; }
    .flex.flex-col.md\\:flex-row.gap-4 > :not(:first-child) { margin-top: 0; margin-left: 1rem; }
    .flex.flex-col.md\\:flex-row.gap-5 > :not(:first-child) { margin-top: 0; margin-left: 1.25rem; }
    .flex.flex-col.md\\:flex-row.gap-6 > :not(:first-child) { margin-top: 0; margin-left: 1.5rem; }
  }

  @media (min-width: 1024px) {
    .lg\\:flex.gap-1\\.5:not(.flex-col) > :not(:first-child) { margin-left: 0.375rem; }
    .lg\\:flex.gap-2:not(.flex-col) > :not(:first-child) { margin-left: 0.5rem; }
    .lg\\:flex.gap-3:not(.flex-col) > :not(:first-child) { margin-left: 0.75rem; }
    .lg\\:flex.gap-4:not(.flex-col) > :not(:first-child) { margin-left: 1rem; }
    .lg\\:flex.gap-5:not(.flex-col) > :not(:first-child) { margin-left: 1.25rem; }
    .lg\\:flex.gap-6:not(.flex-col) > :not(:first-child) { margin-left: 1.5rem; }
    .flex.flex-col.lg\\:flex-row.gap-3 > :not(:first-child) { margin-top: 0; margin-left: 0.75rem; }
    .flex.flex-col.lg\\:flex-row.gap-4 > :not(:first-child) { margin-top: 0; margin-left: 1rem; }
    .flex.flex-col.lg\\:flex-row.gap-5 > :not(:first-child) { margin-top: 0; margin-left: 1.25rem; }
    .flex.flex-col.lg\\:flex-row.gap-6 > :not(:first-child) { margin-top: 0; margin-left: 1.5rem; }
  }

  .ml-auto { margin-left: auto !important; }
  .mx-auto { margin-left: auto !important; margin-right: auto !important; }
}
`;

function transformCssForAllBrowsers(rawCss: string, filename = 'index.css'): string {
  try {
    // 1. Pre-process with PostCSS:
    // - Extract @property initial-values for Chrome < 85 and remove @property rules
    // - Unwrap @layer for Chrome < 99
    // - Unwrap Tailwind v4's @supports property fallback block
    // - Convert :where() and :is() selectors for Chrome < 88
    // - Convert logical properties (padding-inline, margin-block, inset, etc.) for Chrome < 87
    // - Add transform fallbacks before standalone translate/rotate/scale properties for Chrome < 104
    const root = postcss.parse(rawCss);
    const propertyDefaults: string[] = [];

    root.walkAtRules('property', (rule) => {
      const propName = rule.params.trim();
      let initVal = '';
      rule.walkDecls('initial-value', (decl) => {
        initVal = decl.value.trim();
      });
      if (propName.startsWith('--') && initVal) {
        propertyDefaults.push(`${propName}: ${initVal};`);
      }
      rule.remove();
    });

    root.walkAtRules('layer', (rule) => {
      if (rule.nodes && rule.nodes.length > 0) {
        rule.replaceWith(rule.nodes);
      } else {
        rule.remove();
      }
    });

    root.walkAtRules('supports', (rule) => {
      if (
        rule.params.includes('-webkit-hyphens') ||
        rule.params.includes('-moz-orient') ||
        rule.params.includes('margin-trim')
      ) {
        if (rule.nodes && rule.nodes.length > 0) {
          rule.replaceWith(rule.nodes);
        } else {
          rule.remove();
        }
      }
    });

    root.walkRules((rule) => {
      if (rule.selector && (rule.selector.includes(':where(') || rule.selector.includes(':is('))) {
        rule.selector = transformModernSelectors(rule.selector);
      }
    });

    root.walkDecls((decl) => {
      const { prop, value } = decl;
      if (prop === 'padding-inline') {
        decl.cloneBefore({ prop: 'padding-left', value });
        decl.cloneBefore({ prop: 'padding-right', value });
        decl.remove();
      } else if (prop === 'padding-block') {
        decl.cloneBefore({ prop: 'padding-top', value });
        decl.cloneBefore({ prop: 'padding-bottom', value });
        decl.remove();
      } else if (prop === 'padding-inline-start') {
        decl.cloneBefore({ prop: 'padding-left', value });
        decl.remove();
      } else if (prop === 'padding-inline-end') {
        decl.cloneBefore({ prop: 'padding-right', value });
        decl.remove();
      } else if (prop === 'margin-inline') {
        decl.cloneBefore({ prop: 'margin-left', value });
        decl.cloneBefore({ prop: 'margin-right', value });
        decl.remove();
      } else if (prop === 'margin-block') {
        decl.cloneBefore({ prop: 'margin-top', value });
        decl.cloneBefore({ prop: 'margin-bottom', value });
        decl.remove();
      } else if (prop === 'margin-block-start') {
        decl.cloneBefore({ prop: 'margin-top', value });
        decl.remove();
      } else if (prop === 'margin-block-end') {
        decl.cloneBefore({ prop: 'margin-bottom', value });
        decl.remove();
      } else if (prop === 'margin-inline-start') {
        decl.cloneBefore({ prop: 'margin-left', value });
        decl.remove();
      } else if (prop === 'margin-inline-end') {
        decl.cloneBefore({ prop: 'margin-right', value });
        decl.remove();
      } else if (prop === 'inset-inline') {
        decl.cloneBefore({ prop: 'left', value });
        decl.cloneBefore({ prop: 'right', value });
        decl.remove();
      } else if (prop === 'inset-block') {
        decl.cloneBefore({ prop: 'top', value });
        decl.cloneBefore({ prop: 'bottom', value });
        decl.remove();
      } else if (prop === 'inset' && !value.includes(' ')) {
        decl.cloneBefore({ prop: 'top', value });
        decl.cloneBefore({ prop: 'right', value });
        decl.cloneBefore({ prop: 'bottom', value });
        decl.cloneBefore({ prop: 'left', value });
        decl.remove();
      } else if (prop === 'border-block-style') {
        decl.cloneBefore({ prop: 'border-top-style', value });
        decl.cloneBefore({ prop: 'border-bottom-style', value });
        decl.remove();
      } else if (prop === 'border-block-width') {
        decl.cloneBefore({ prop: 'border-top-width', value });
        decl.cloneBefore({ prop: 'border-bottom-width', value });
        decl.remove();
      } else if (prop === 'overflow-x' && value === 'clip') {
        decl.cloneBefore({ prop: 'overflow-x', value: 'hidden' });
      } else if (prop === 'overflow-y' && value === 'clip') {
        decl.cloneBefore({ prop: 'overflow-y', value: 'hidden' });
      } else if (prop === 'translate') {
        if (value.includes('--tw-translate-x')) {
          decl.cloneBefore({
            prop: 'transform',
            value: 'translate(var(--tw-translate-x, 0), var(--tw-translate-y, 0))',
          });
        }
      } else if (prop === 'rotate') {
        decl.cloneBefore({
          prop: 'transform',
          value: `rotate(${value})`,
        });
      } else if (prop === 'scale') {
        if (value.includes('--tw-scale-x')) {
          decl.cloneBefore({
            prop: 'transform',
            value: 'scale(var(--tw-scale-x, 1), var(--tw-scale-y, 1))',
          });
        } else {
          decl.cloneBefore({
            prop: 'transform',
            value: `scale(${value})`,
          });
        }
      }
    });

    let intermediateCss = root.toString();
    if (propertyDefaults.length > 0) {
      intermediateCss = `*, ::before, ::after, ::backdrop { ${propertyDefaults.join(' ')} }\n` + intermediateCss;
    }

    // 2. Convert oklch(), color-mix(), and range media queries (@media (width >= ...)) for Chrome 49+ / Safari 10+
    const lres = lightningcss.transform({
      filename,
      code: Buffer.from(intermediateCss),
      targets: {
        chrome: 49 << 16,
        safari: 10 << 16,
        firefox: 52 << 16,
        android: 49 << 16,
        ios_saf: 10 << 16,
      },
    });

    // 3. Remove redundant @supports (color: color-mix(...)) / lab(...) blocks and convert remaining color-mix() to universal rgba()
    const postRoot = postcss.parse(lres.code.toString());
    postRoot.walkAtRules('supports', (rule) => {
      if (rule.params.includes('color-mix') || rule.params.includes('lab(')) {
        rule.remove();
      }
    });

    postRoot.walkDecls((decl) => {
      if (decl.value && /\bin\s+(?:oklab|oklch|srgb-linear|srgb|hsl|hwb)\b/i.test(decl.value) && !decl.value.includes('color-mix(')) {
        decl.value = decl.value.replace(/\s+in\s+(?:oklab|oklch|srgb-linear|srgb|hsl|hwb)\b/gi, '');
      }
      if (decl.value && decl.value.includes('color-mix(')) {
        decl.value = decl.value.replace(
          /color-mix\(\s*in\s+[a-z0-9-]+\s*,\s*(#[0-9a-fA-F]{3,8}|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\))\s+([\d.]+)%\s*,\s*transparent\s*\)/gi,
          (match, colorPart, pctStr) => {
            const alpha = Math.max(0, Math.min(1, parseFloat(pctStr) / 100));
            const alphaRounded = Math.round(alpha * 1000) / 1000;
            const c = colorPart.trim();
            if (c.startsWith('#')) {
              const hex = c.slice(1);
              let r = 0, g = 0, b = 0;
              if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
              } else if (hex.length >= 6) {
                r = parseInt(hex.slice(0, 2), 16);
                g = parseInt(hex.slice(2, 4), 16);
                b = parseInt(hex.slice(4, 6), 16);
              }
              return `rgba(${r}, ${g}, ${b}, ${alphaRounded})`;
            }
            const rgbMatch = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
            if (rgbMatch) {
              return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alphaRounded})`;
            }
            return match;
          }
        );
      }
    });

    return postRoot.toString() + '\n' + LEGACY_BROWSER_FALLBACK_CSS;
  } catch (err) {
    console.warn('[CSS Compat Transform Warning]', err);
    return rawCss;
  }
}

export default defineConfig(() => {
  const buildVersion = Date.now().toString(36);
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'universal-browser-compat-css-dev',
        transform(code, id) {
          if (id.includes('.css') && (code.includes('@layer') || code.includes('oklch'))) {
            return { code: transformCssForAllBrowsers(code, id), map: null };
          }
          return null;
        },
      },
      {
        name: 'universal-browser-compat',
        enforce: 'post' as const,
        // Transform JS & CSS in dev server mode
        transform(code, id) {
          if (id.includes('.css')) {
            if (code.includes('__vite__css =')) {
              const startIdx = code.indexOf('const __vite__css = "');
              const endIdx = code.indexOf('"\n__vite__updateStyle(');
              if (startIdx !== -1 && endIdx !== -1) {
                try {
                  const jsonStr = code.slice(startIdx + 'const __vite__css = '.length, endIdx + 1);
                  const raw = JSON.parse(jsonStr);
                  const converted = transformCssForAllBrowsers(raw, id);
                  return {
                    code:
                      code.slice(0, startIdx) +
                      `const __vite__css = ${JSON.stringify(converted)}` +
                      code.slice(endIdx + 1),
                    map: null,
                  };
                } catch {}
              }
            }
          }
          // In dev mode, downlevel src TS/TSX/JS modules so Chrome < 80 / Safari < 13.1 never hit SyntaxError on ?. or ??
          if (/\.(tsx?|jsx?)$/.test(id) && !id.includes('node_modules')) {
            try {
              const out = esbuild.transformSync(code, {
                target: 'es2015',
                format: 'esm',
              });
              return { code: out.code, map: out.map || null };
            } catch {
              return null;
            }
          }
          return null;
        },
        // In production build, downlevel JS chunks to ES2015
        renderChunk(code, chunk) {
          if (chunk.fileName.endsWith('.js')) {
            try {
              const out = esbuild.transformSync(code, {
                target: 'es2015',
                format: 'esm',
              });
              return { code: out.code, map: out.map || null };
            } catch {
              return null;
            }
          }
          return null;
        },
        // In production build, convert all CSS assets (unwrap @layer + convert oklch to hex/rgba)
        // and compile the JS bundle into a universal classic IIFE script that runs on Chrome 55/59/79+ AND modern browsers without <script type="module">
        generateBundle(_options, bundle) {
          for (const [fileName, asset] of Object.entries(bundle)) {
            if (fileName.endsWith('.css') && asset.type === 'asset') {
              const rawSource =
                typeof asset.source === 'string'
                  ? asset.source
                  : Buffer.from(asset.source).toString('utf-8');
              asset.source = transformCssForAllBrowsers(rawSource, fileName);
            }
          }

          // Build a self-contained classic IIFE bundle (no ES module import/export syntax) so browsers without <script type="module"> (like Chrome 59) run it directly
          try {
            const iifeBuild = esbuild.buildSync({
              entryPoints: [path.resolve(import.meta.dirname || '.', 'src/main.tsx')],
              bundle: true,
              format: 'iife',
              target: ['chrome55', 'es2015'],
              write: false,
              minify: true,
              loader: {
                '.png': 'dataurl',
                '.jpg': 'dataurl',
                '.jpeg': 'dataurl',
                '.webp': 'dataurl',
                '.svg': 'dataurl',
                '.css': 'empty',
              },
              define: {
                'process.env.NODE_ENV': '"production"',
              },
            });
            const iifeCode = Buffer.from(iifeBuild.outputFiles[0].contents).toString('utf-8');

            // Replace the main JS chunk content with the classic IIFE code and emit a stable /assets/app-bundle.js asset
            for (const [fileName, chunk] of Object.entries(bundle)) {
              if (fileName.endsWith('.js') && chunk.type === 'chunk' && chunk.isEntry) {
                chunk.code = iifeCode;
              }
            }
            this.emitFile({
              type: 'asset',
              fileName: 'assets/app-bundle.js',
              source: iifeCode,
            });
          } catch (err) {
            console.warn('[IIFE Bundle Fallback Warning]', err);
          }
        },
        transformIndexHtml: {
          order: 'post' as const,
          handler(html) {
            // Replace <script type="module" crossorigin src="/assets/index-....js"></script>
            // with a standard <script defer src="/assets/index-....js?v=..."></script> and bust stale CSS cache
            return html
              .replace(
                /<script\s+type="module"\s+crossorigin\s+src="([^"]+)"><\/script>/gi,
                `<script defer src="$1?v=${buildVersion}"></script>`
              )
              .replace(
                /<link\s+rel="stylesheet"\s+crossorigin\s+href="([^"]+)">/gi,
                `<link rel="stylesheet" href="$1?v=${buildVersion}">`
              )
              .replace(/<link\s+rel="modulepreload"[^>]*>/gi, '');
          },
        },
        closeBundle() {
          // Automatically bundle src/server-main.ts into a cPanel/Passenger/LiteSpeed-compatible CommonJS startup file (both app.cjs & app.js),
          // copy compiled frontend assets into /cpanel_build (so they persist in Git even after `npm run clean` deletes `dist/`),
          // and sync functions/_seed.js for Cloudflare Workers / Pages Functions
          try {
            const rootDir = path.resolve(import.meta.dirname || '.', '.');
            const cjsOutPath = path.resolve(rootDir, 'app.cjs');
            esbuild.buildSync({
              entryPoints: [path.resolve(rootDir, 'src/server-main.ts')],
              bundle: true,
              platform: 'node',
              format: 'cjs',
              target: ['node18'],
              outfile: cjsOutPath,
              external: [
                'vite',
                'esbuild',
                'lightningcss',
                'postcss',
                '@tailwindcss/vite',
                '@vitejs/plugin-react',
                '@vitejs/plugin-legacy',
              ],
              define: {
                'process.env.CPANEL_MODE': '"1"',
              },
              logLevel: 'silent',
            });
            // Copy identical self-contained CommonJS bundle to app.js so cPanel default startup file (app.js) works with require()
            fs.copyFileSync(cjsOutPath, path.resolve(rootDir, 'app.js'));

            // Copy built dist/index.html and dist/assets/* into /cpanel_build so GitHub exports always include the compiled production frontend
            const distDir = path.resolve(rootDir, 'dist');
            const cpanelBuildDir = path.resolve(rootDir, 'cpanel_build');
            if (fs.existsSync(distDir)) {
              fs.rmSync(cpanelBuildDir, { recursive: true, force: true });
              fs.cpSync(distDir, cpanelBuildDir, { recursive: true });
            }

            const dbJsonPath = path.resolve(rootDir, 'data', 'database.json');
            const functionsDir = path.resolve(rootDir, 'functions');
            if (fs.existsSync(dbJsonPath)) {
              if (fs.existsSync(cpanelBuildDir)) {
                fs.copyFileSync(dbJsonPath, path.resolve(cpanelBuildDir, 'seed-database.json'));
              }
              if (!fs.existsSync(functionsDir)) {
                fs.mkdirSync(functionsDir, { recursive: true });
              }
              const rawDb = fs.readFileSync(dbJsonPath, 'utf-8');
              fs.writeFileSync(
                path.resolve(functionsDir, '_seed.js'),
                `// Auto-generated from data/database.json for Cloudflare Pages Functions\nexport const SEED_DB = ${rawDb};\n`,
                'utf-8'
              );
            }
          } catch (err) {
            console.warn('[cPanel / Cloudflare Bundle Warning]', err);
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      allowedHosts: true as const,
      cors: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      allowedHosts: true as const,
      cors: true,
    },
  };
});

