import { format } from 'numfmt';

/** Named presets mapping to Excel format codes */
const PRESETS: Record<string, string> = {
  num0: '#,##0',
  num1: '#,##0.0',
  num2: '#,##0.00',
  usd: '$#,##0',
  usd2: '$#,##0.00',
  eur: '#,##0 "€"',
  eur2: '#,##0.00 "€"',
  gbp: '£#,##0',
  gbp2: '£#,##0.00',
  chf: '"CHF "#,##0',
  chf2: '"CHF "#,##0.00',
  pct: '0%',
  pct1: '0.0%',
  pct2: '0.00%',
  shortdate: 'd mmm yyyy',
  longdate: 'd mmmm yyyy',
  monthyear: 'mmm yyyy',
};

/** Resolve a preset name to an Excel format code, or pass through raw codes */
export function parsePreset(name: string): string {
  return PRESETS[name] ?? name;
}

/** Detect whether an Excel format code is a date pattern */
export function isDatePattern(pattern: string): boolean {
  // Strip quoted strings, then check for date tokens
  const stripped = pattern.replace(/"[^"]*"/g, '').replace(/\[[^\]]*\]/g, '');
  return /[ymdhs]/i.test(stripped);
}

/** Format a value with a preset name or raw Excel format code */
export function applyFormat(value: unknown, fmt: string): string {
  if (value == null) return '\u2014';
  const pattern = parsePreset(fmt);

  // Coerce ISO strings to Date for date patterns
  if (isDatePattern(pattern) && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return format(pattern, d);
    }
  }

  const num = Number(value);
  if (!isNaN(num)) {
    return format(pattern, num);
  }

  return String(value);
}

/** Auto-detect value type and format with sensible defaults */
export function autoFormat(value: unknown): string {
  if (value == null) return '\u2014';

  // ISO date string
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return format('d mmm yyyy', d);
    }
  }

  // Number or numeric string
  const num = Number(value);
  if (typeof value === 'number' || (typeof value === 'string' && value !== '' && !isNaN(num))) {
    return Number.isInteger(num) ? format('#,##0', num) : format('#,##0.##', num);
  }

  return String(value);
}

/**
 * Parse a fmt prop string like "revenue:eur2,date:shortdate" into a column→format map.
 * Splits on commas only when followed by a column name and colon (to avoid breaking
 * Excel format codes that contain commas like `#,##0`).
 * A single format without a colon (e.g. `fmt="eur2"`) is returned under the empty key.
 */
export function parseFmtProp(fmt: string): Map<string, string> {
  const map = new Map<string, string>();
  // Split on commas followed by word+colon (column:format boundary)
  const entries = fmt.split(/,(?=\s*[a-zA-Z_]\w*\s*:)/);
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) {
      // Single format (for BigValue) — store under empty key
      map.set('', trimmed);
    } else {
      const col = trimmed.slice(0, colonIdx).trim();
      const fmtVal = trimmed.slice(colonIdx + 1).trim();
      map.set(col, fmtVal);
    }
  }
  return map;
}
