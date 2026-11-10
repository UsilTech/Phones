import React, { useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Link2,
  Minus,
  Pilcrow,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  label?: string;
  helperText?: string;
  compactToolbar?: boolean;
  headingsAndBodyOnly?: boolean;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write content here... Select text or use the toolbar to add H1, H2, H3 headings, bold text, or bold paragraphs.',
  rows = 6,
  required = false,
  label,
  helperText,
  compactToolbar = false,
  headingsAndBodyOnly = false,
  className = '',
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const focusAndRestoreSelection = (start: number, end: number) => {
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(start, end);
    });
  };

  /**
   * Wraps the currently selected text with prefix/suffix (e.g. **bold** or *italic*).
   * If already wrapped, unwraps it (toggle behavior).
   */
  const wrapSelection = (prefix: string, suffix: string, defaultText: string) => {
    const el = textareaRef.current;
    const current = value || '';
    if (!el) {
      onChange(`${current}${current ? ' ' : ''}${prefix}${defaultText}${suffix}`);
      return;
    }

    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const selected = current.slice(start, end);

    // Check if selection is already wrapped with prefix & suffix
    if (
      selected.startsWith(prefix) &&
      selected.endsWith(suffix) &&
      selected.length >= prefix.length + suffix.length
    ) {
      const unwrapped = selected.slice(prefix.length, selected.length - suffix.length);
      const next = current.slice(0, start) + unwrapped + current.slice(end);
      onChange(next);
      focusAndRestoreSelection(start, start + unwrapped.length);
      return;
    }

    // Check if surrounding characters already have prefix & suffix
    const beforeSlice = current.slice(Math.max(0, start - prefix.length), start);
    const afterSlice = current.slice(end, end + suffix.length);
    if (beforeSlice === prefix && afterSlice === suffix && selected.length > 0) {
      const next =
        current.slice(0, start - prefix.length) +
        selected +
        current.slice(end + suffix.length);
      onChange(next);
      focusAndRestoreSelection(start - prefix.length, end - prefix.length);
      return;
    }

    const inner = selected || defaultText;
    const replacement = `${prefix}${inner}${suffix}`;
    const next = current.slice(0, start) + replacement + current.slice(end);
    onChange(next);
    focusAndRestoreSelection(start + prefix.length, start + prefix.length + inner.length);
  };

  /**
   * Makes the entire current line/paragraph (or all selected paragraphs) bold (**paragraph**),
   * or unbolds it if already bolded.
   */
  const toggleBoldParagraph = () => {
    const el = textareaRef.current;
    const current = value || '';
    if (!el) {
      onChange(current ? `**${current.trim()}**` : '**Bold paragraph text**');
      return;
    }

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    // Expand to full line(s) containing the cursor/selection
    const lineStart = current.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const nextNewline = current.indexOf('\n', end);
    const lineEnd = nextNewline === -1 ? current.length : nextNewline;

    const targetBlock = current.slice(lineStart, lineEnd);
    if (!targetBlock.trim()) {
      const sample = '**Bold paragraph text**';
      const next = current.slice(0, lineStart) + sample + current.slice(lineEnd);
      onChange(next);
      focusAndRestoreSelection(lineStart + 2, lineStart + sample.length - 2);
      return;
    }

    const lines = targetBlock.split('\n');
    const allBold = lines
      .filter((l) => l.trim().length > 0)
      .every((l) => {
        const cleaned = l.trim().replace(/^#{1,6}\s+/, '');
        return cleaned.startsWith('**') && cleaned.endsWith('**') && cleaned.length > 4;
      });

    const transformedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      // Preserve any heading prefix if present
      const headingMatch = trimmed.match(/^(#{1,6}\s+)(.*)$/);
      const prefix = headingMatch ? headingMatch[1] : '';
      const body = headingMatch ? headingMatch[2].trim() : trimmed;

      if (allBold) {
        const unbolded = body.replace(/^\*\*([\s\S]*)\*\*$/, '$1');
        return `${prefix}${unbolded}`;
      } else {
        const cleanBody = body.replace(/^\*\*([\s\S]*)\*\*$/, '$1');
        return `${prefix}**${cleanBody}**`;
      }
    });

    const replacement = transformedLines.join('\n');
    const next = current.slice(0, lineStart) + replacement + current.slice(lineEnd);
    onChange(next);
    focusAndRestoreSelection(lineStart, lineStart + replacement.length);
  };

  /**
   * Sets or toggles a heading level (H1, H2, H3, H4) or resets to normal paragraph (P)
   * on the current line(s).
   */
  const applyHeading = (level: 0 | 1 | 2 | 3 | 4) => {
    const el = textareaRef.current;
    const current = value || '';
    const prefix = level > 0 ? `${'#'.repeat(level)} ` : '';

    if (!el) {
      const sample = level > 0 ? `${prefix}Heading ${level}` : 'Paragraph text';
      onChange(current ? `${current}\n\n${sample}` : sample);
      return;
    }

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    const lineStart = current.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const nextNewline = current.indexOf('\n', end);
    const lineEnd = nextNewline === -1 ? current.length : nextNewline;

    const targetBlock = current.slice(lineStart, lineEnd);
    if (!targetBlock.trim()) {
      const defaultHeading = level > 0 ? `${prefix}Section Heading` : 'New paragraph...';
      const next = current.slice(0, lineStart) + defaultHeading + current.slice(lineEnd);
      onChange(next);
      focusAndRestoreSelection(lineStart + prefix.length, lineStart + defaultHeading.length);
      return;
    }

    const lines = targetBlock.split('\n');
    const transformed = lines.map((line) => {
      const stripped = line.replace(/^\s*#{1,6}\s+/, '');
      if (level === 0) return stripped;
      // If line already has this exact heading prefix, toggle it off
      if (line.trim().startsWith(prefix)) {
        return stripped;
      }
      return `${prefix}${stripped || `Heading ${level}`}`;
    });

    const replacement = transformed.join('\n');
    const next = current.slice(0, lineStart) + replacement + current.slice(lineEnd);
    onChange(next);
    focusAndRestoreSelection(lineStart, lineStart + replacement.length);
  };

  /**
   * Formats selected lines as bullet list, numbered list, or blockquote
   */
  const applyLinePrefix = (mode: 'bullet' | 'number' | 'quote') => {
    const el = textareaRef.current;
    const current = value || '';

    if (!el) {
      const sample =
        mode === 'bullet'
          ? '- List item'
          : mode === 'number'
          ? '1. First item'
          : '> Key takeaway quote';
      onChange(current ? `${current}\n${sample}` : sample);
      return;
    }

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    const lineStart = current.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const nextNewline = current.indexOf('\n', end);
    const lineEnd = nextNewline === -1 ? current.length : nextNewline;

    const targetBlock = current.slice(lineStart, lineEnd);
    if (!targetBlock.trim()) {
      const sample =
        mode === 'bullet'
          ? '- List item'
          : mode === 'number'
          ? '1. List item'
          : '> Highlighted quote or takeaway';
      const next = current.slice(0, lineStart) + sample + current.slice(lineEnd);
      onChange(next);
      focusAndRestoreSelection(lineStart, lineStart + sample.length);
      return;
    }

    const lines = targetBlock.split('\n');
    const transformed = lines.map((line, idx) => {
      const stripped = line
        .replace(/^\s*([-*•]|\d+\.|>)\s+/, '')
        .trim();
      const text = stripped || 'Item';
      if (mode === 'bullet') return `- ${text}`;
      if (mode === 'number') return `${idx + 1}. ${text}`;
      return `> ${text}`;
    });

    const replacement = transformed.join('\n');
    const next = current.slice(0, lineStart) + replacement + current.slice(lineEnd);
    onChange(next);
    focusAndRestoreSelection(lineStart, lineStart + replacement.length);
  };

  const insertDivider = () => {
    const el = textareaRef.current;
    const current = value || '';
    const start = el ? el.selectionStart ?? current.length : current.length;
    const end = el ? el.selectionEnd ?? current.length : current.length;
    const divider = `\n---\n`;
    const next = current.slice(0, start) + divider + current.slice(end);
    onChange(next);
    focusAndRestoreSelection(start + divider.length, start + divider.length);
  };

  const insertLink = () => {
    const el = textareaRef.current;
    const current = value || '';
    const start = el ? el.selectionStart ?? current.length : current.length;
    const end = el ? el.selectionEnd ?? current.length : current.length;
    const selected = current.slice(start, end) || 'Link text';
    const snippet = `[${selected}](https://)`;
    const next = current.slice(0, start) + snippet + current.slice(end);
    onChange(next);
    const urlCursorPos = start + selected.length + 3;
    focusAndRestoreSelection(urlCursorPos, urlCursorPos + 8);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        wrapSelection('**', '**', 'bold text');
      } else if (key === 'i') {
        e.preventDefault();
        wrapSelection('*', '*', 'italic text');
      } else if (key === 'u') {
        e.preventDefault();
        wrapSelection('<u>', '</u>', 'underlined text');
      }
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
            {label}
          </label>
          {helperText && (
            <span className="text-[10px] text-slate-400 font-mono">{helperText}</span>
          )}
        </div>
      )}

      <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden focus-within:border-emerald-500 transition-colors">
        {/* Rich Formatting Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          {headingsAndBodyOnly ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="inline-flex items-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => applyHeading(1)}
                  title="Heading 1 (H1)"
                  className="px-2.5 py-1 rounded text-xs font-black text-slate-800 dark:text-slate-100 hover:bg-emerald-600 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                  <span>H1</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyHeading(2)}
                  title="Heading 2 (H2)"
                  className="px-2.5 py-1 rounded text-xs font-black text-slate-800 dark:text-slate-100 hover:bg-emerald-600 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                  <span>H2</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyHeading(3)}
                  title="Heading 3 (H3)"
                  className="px-2.5 py-1 rounded text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                  <span>H3</span>
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelection('**', '**', 'bold text')}
                  title="Make Selected Text Bold (Ctrl+B)"
                  className="px-2.5 py-1 rounded text-xs font-black text-slate-800 dark:text-slate-100 hover:bg-emerald-600 hover:text-white flex items-center gap-1 cursor-pointer transition-colors border-l border-slate-200 dark:border-slate-800"
                >
                  <Bold className="w-3.5 h-3.5" />
                  <span>Bold</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1">
            {/* Heading Controls: H1, H2, H3, H4, Normal Paragraph */}
            <div className="inline-flex items-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => applyHeading(1)}
                title="Heading 1 (H1)"
                className="px-2 py-1 rounded text-[11px] font-extrabold text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
              >
                <Heading1 className="w-3.5 h-3.5" />
                <span>H1</span>
              </button>
              <button
                type="button"
                onClick={() => applyHeading(2)}
                title="Heading 2 (H2)"
                className="px-2 py-1 rounded text-[11px] font-extrabold text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
              >
                <Heading2 className="w-3.5 h-3.5" />
                <span>H2</span>
              </button>
              <button
                type="button"
                onClick={() => applyHeading(3)}
                title="Heading 3 (H3)"
                className="px-2 py-1 rounded text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
              >
                <Heading3 className="w-3.5 h-3.5" />
                <span>H3</span>
              </button>
              {!compactToolbar && (
                <button
                  type="button"
                  onClick={() => applyHeading(4)}
                  title="Heading 4 (H4)"
                  className="px-2 py-1 rounded text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
                >
                  <Heading4 className="w-3.5 h-3.5" />
                  <span>H4</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => applyHeading(0)}
                title="Normal Paragraph (remove heading)"
                className="px-1.5 py-1 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-0.5 cursor-pointer transition-colors"
              >
                <Pilcrow className="w-3 h-3" />
                <span>P</span>
              </button>
            </div>

            {/* Bold Text & Bold Paragraph Controls */}
            <div className="inline-flex items-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => wrapSelection('**', '**', 'bold text')}
                title="Make Selected Text Bold (Ctrl+B)"
                className="px-2 py-1 rounded text-[11px] font-extrabold text-slate-800 dark:text-slate-100 hover:bg-emerald-600 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Bold className="w-3.5 h-3.5" />
                <span>Bold</span>
              </button>
              <button
                type="button"
                onClick={toggleBoldParagraph}
                title="Make Entire Paragraph Bold"
                className="px-2 py-1 rounded text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white flex items-center gap-1 cursor-pointer transition-colors border-l border-slate-200 dark:border-slate-800"
              >
                <Bold className="w-3 h-3" />
                <span>Bold ¶</span>
              </button>
              <button
                type="button"
                onClick={() => wrapSelection('*', '*', 'italic text')}
                title="Italic Text (Ctrl+I)"
                className="px-1.5 py-1 rounded text-[11px] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white cursor-pointer transition-colors"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => wrapSelection('<u>', '</u>', 'underlined text')}
                title="Underline Text (Ctrl+U)"
                className="px-1.5 py-1 rounded text-[11px] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white cursor-pointer transition-colors"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Lists, Quotes, Links & Dividers */}
            <div className="inline-flex items-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => applyLinePrefix('bullet')}
                title="Bullet List"
                className="px-1.5 py-1 rounded text-[11px] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white cursor-pointer transition-colors"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              {!compactToolbar && (
                <>
                  <button
                    type="button"
                    onClick={() => applyLinePrefix('number')}
                    title="Numbered List"
                    className="px-1.5 py-1 rounded text-[11px] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white cursor-pointer transition-colors"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyLinePrefix('quote')}
                    title="Quote / Callout Block"
                    className="px-1.5 py-1 rounded text-[11px] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white cursor-pointer transition-colors"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={insertLink}
                    title="Insert Link"
                    className="px-1.5 py-1 rounded text-[11px] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white cursor-pointer transition-colors"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={insertDivider}
                    title="Insert Horizontal Section Divider"
                    className="px-1.5 py-1 rounded text-[11px] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white cursor-pointer transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={rows}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none leading-relaxed"
        />
      </div>
    </div>
  );
}
