import React from 'react';

interface FormattedContentProps {
  content: string | string[];
  className?: string;
  compact?: boolean;
}

/**
 * Strips markdown/HTML formatting markers for plain-text previews, meta descriptions, or single-line excerpts.
 */
export function stripFormattingToPlainText(input?: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]+>/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*•]\s+/gm, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .trim();
}

/**
 * Parses inline formatting within a line or paragraph:
 * - **bold** or __bold__ or <b>bold</b> or <strong>bold</strong>
 * - *italic* or <i>italic</i> or <em>italic</em>
 * - <u>underline</u>
 * - `inline code`
 * - [Link Text](https://...)
 */
function renderInlineFormatting(text: string, keyPrefix: string): React.ReactNode[] {
  if (!text) return [];

  // Normalize simple inline HTML tags to markdown-compatible tokens before tokenizing
  const normalized = text
    .replace(/<(strong|b)>(.*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)>(.*?)<\/\1>/gi, '*$2*')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`');

  // Regex matching:
  // 1. <u>...</u>
  // 2. **...** or __...__
  // 3. *...*
  // 4. `...`
  // 5. [text](url)
  const tokenRegex = /(<u>[\s\S]*?<\/u>|\*\*[\s\S]+?\*\*|__[\s\S]+?__|(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)|`[^`\n]+`|\[[^\]]+\]\([^)]+\))/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partIdx = 0;

  while ((match = tokenRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(normalized.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-inl-${partIdx++}`;

    if (token.startsWith('<u>') && token.endsWith('</u>')) {
      const inner = token.slice(3, -4);
      nodes.push(
        <u key={key} className="underline decoration-emerald-500/70 underline-offset-4">
          {renderInlineFormatting(inner, key)}
        </u>
      );
    } else if (
      (token.startsWith('**') && token.endsWith('**')) ||
      (token.startsWith('__') && token.endsWith('__'))
    ) {
      const inner = token.slice(2, -2);
      nodes.push(
        <strong key={key} className="font-bold text-slate-900 dark:text-white">
          {renderInlineFormatting(inner, key)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const inner = token.slice(1, -1);
      nodes.push(
        <em key={key} className="italic text-slate-800 dark:text-slate-200">
          {renderInlineFormatting(inner, key)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const inner = token.slice(1, -1);
      nodes.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-mono text-[0.9em]"
        >
          {inner}
        </code>
      );
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const isExternal = /^https?:\/\//i.test(href);
        nodes.push(
          <a
            key={key}
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-3 hover:text-emerald-500"
          >
            {label}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(token);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < normalized.length) {
    nodes.push(normalized.slice(lastIndex));
  }

  return nodes;
}

/**
 * Renders rich formatted text supporting:
 * - Headings: # H1, ## H2, ### H3, #### H4 (and HTML <h1>..<h4> tags)
 * - Bold text & Bold paragraphs: **bold**, __bold__, <b>, <strong>
 * - Italic & Underline: *italic*, <u>underline</u>
 * - Bullet lists (- or •) and Numbered lists (1. 2.)
 * - Blockquotes (> quote)
 * - Horizontal dividers (---)
 * - Links [Title](https://...)
 */
export default function FormattedContent({
  content,
  className = '',
  compact = false,
}: FormattedContentProps) {
  const rawText = Array.isArray(content) ? content.join('\n\n') : content || '';
  if (!rawText.trim()) return null;

  // Convert block-level HTML heading/paragraph tags if written directly by the user
  const preprocessed = rawText
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<\/?(ul|ol|p)[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n');

  const lines = preprocessed.split(/\r?\n/);
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    // Horizontal Rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      elements.push(
        <hr
          key={`hr-${i}`}
          className="my-5 border-t border-slate-200 dark:border-slate-800"
        />
      );
      i++;
      continue;
    }

    // H1 Heading (# )
    if (line.startsWith('# ')) {
      const headingText = line.slice(2).trim();
      elements.push(
        <h1
          key={`h1-${i}`}
          className={
            compact
              ? "text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight mt-4 mb-1.5"
              : "text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight leading-snug mt-6 mb-2 first:mt-0"
          }
        >
          {renderInlineFormatting(headingText, `h1-${i}`)}
        </h1>
      );
      i++;
      continue;
    }

    // H2 Heading (## )
    if (line.startsWith('## ')) {
      const headingText = line.slice(3).trim();
      elements.push(
        <h2
          key={`h2-${i}`}
          className={
            compact
              ? "text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight mt-3.5 mb-1.5"
              : "text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight leading-snug mt-5 mb-2 first:mt-0"
          }
        >
          {renderInlineFormatting(headingText, `h2-${i}`)}
        </h2>
      );
      i++;
      continue;
    }

    // H3 Heading (### )
    if (line.startsWith('### ')) {
      const headingText = line.slice(4).trim();
      elements.push(
        <h3
          key={`h3-${i}`}
          className={
            compact
              ? "text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] mt-3 mb-1"
              : "text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] leading-snug mt-4 mb-1.5 first:mt-0"
          }
        >
          {renderInlineFormatting(headingText, `h3-${i}`)}
        </h3>
      );
      i++;
      continue;
    }

    // H4 Heading (#### )
    if (line.startsWith('#### ')) {
      const headingText = line.slice(5).trim();
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400 font-['Space_Grotesk'] leading-snug mt-3.5 mb-1 first:mt-0"
        >
          {renderInlineFormatting(headingText, `h4-${i}`)}
        </h4>
      );
      i++;
      continue;
    }

    // Blockquote (> )
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="pl-4 py-2 my-3 border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-r-xl italic text-slate-700 dark:text-slate-200"
        >
          {renderInlineFormatting(quoteLines.join(' '), `quote-${i}`)}
        </blockquote>
      );
      continue;
    }

    // Unordered Bullet List (- or * or •)
    if (/^([-*•])\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^([-*•])\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^([-*•])\s+/, ''));
        i++;
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          className="list-disc pl-5 space-y-1.5 my-2.5 text-slate-700 dark:text-slate-300 marker:text-emerald-500"
        >
          {items.map((item, idx) => (
            <li key={`ul-${i}-${idx}`} className="leading-relaxed">
              {renderInlineFormatting(item, `ul-${i}-${idx}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered Numbered List (1. 2. etc.)
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol
          key={`ol-${i}`}
          className="list-decimal pl-5 space-y-1.5 my-2.5 text-slate-700 dark:text-slate-300 marker:text-emerald-600 dark:marker:text-emerald-400 marker:font-bold"
        >
          {items.map((item, idx) => (
            <li key={`ol-${i}-${idx}`} className="leading-relaxed">
              {renderInlineFormatting(item, `ol-${i}-${idx}`)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Standard Paragraph (collect consecutive regular lines or treat each line break as paragraph)
    elements.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {renderInlineFormatting(line, `p-${i}`)}
      </p>
    );
    i++;
  }

  return (
    <div className={`${compact ? 'space-y-2' : 'space-y-4'} ${className}`}>
      {elements}
    </div>
  );
}
