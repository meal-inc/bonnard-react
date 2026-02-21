/**
 * Pure utility functions for chart formatting — no theme dependency.
 */
import { autoFormat, applyFormat } from './format-value';

/** Check if x-axis labels are ISO dates — if so, use ECharts time axis */
export function isTimeAxis(rawLabels: string[]): boolean {
  if (rawLabels.length === 0) return false;
  for (const label of rawLabels) {
    if (!label) continue;
    return /^\d{4}-\d{2}-\d{2}/.test(label);
  }
  return false;
}

/** Determine axis label rotation based on longest label length */
export function labelRotation(labels: string[]): number {
  const maxLen = labels.reduce((max, l) => Math.max(max, String(l).length), 0);
  return maxLen > 10 ? -45 : 0;
}

/** Grid bottom padding based on rotation */
export function gridBottom(rotation: number): number {
  return rotation === 0 ? 5 : 30;
}

/** Format a number for display (compact notation for large values) */
export function formatValue(val: unknown): string {
  if (val == null) return '\u2014';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  if (Number.isInteger(num)) return num.toLocaleString();
  return num.toFixed(2);
}

/** ECharts tooltip valueFormatter — uses explicit format or compact fallback */
export function tooltipFormatter(yFmt?: string): ((val: number) => string) {
  if (yFmt) {
    return (val: number) => applyFormat(val, yFmt);
  }
  return (val: number) => formatValue(val);
}

/** Format axis label — detects ISO dates and formats them nicely */
export function formatAxisLabel(val: string): string {
  if (/^\d{4}-\d{2}-\d{2}T/.test(val)) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const d = new Date(val + 'T00:00:00');
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
  }
  return val;
}

/** ECharts y-axis formatter — uses explicit format or compact fallback */
export function axisValueFormatter(val: number, yFmt?: string): string {
  if (yFmt) return applyFormat(val, yFmt);
  if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) {
    const k = val / 1_000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(val);
}

/** Convert snake_case or camelCase field names to Title Case */
export function formatColumnHeader(col: string): string {
  return col
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
