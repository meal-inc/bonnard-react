/**
 * Shared ECharts theme constants — adapted from metric-builder patterns.
 */
import { autoFormat, applyFormat } from '../lib/format-value';

/** Named color palettes for charts */
export const PALETTES = {
  // Current: Tailwind -600 shades (saturated)
  default: [
    '#2563eb', '#dc2626', '#16a34a', '#ca8a04',
    '#9333ea', '#ec4899', '#0891b2', '#ea580c',
  ],
  // Tableau 10: industry gold standard, moderate saturation
  tableau: [
    '#4e79a7', '#f28e2c', '#e15759', '#76b7b2',
    '#59a14f', '#edc949', '#af7aa1', '#ff9da7',
    '#9c755f', '#bab0ab',
  ],
  // Observable 10: modern, slightly more vibrant
  observable: [
    '#4269d0', '#efb118', '#ff725c', '#6cc5b0',
    '#3ca951', '#ff8ab7', '#a463f2', '#97bbf5',
    '#9c6b4e', '#9498a0',
  ],
  // Metabase: soft/muted, friendly
  metabase: [
    '#509EE3', '#88BF4D', '#A989C5', '#EF8C8C',
    '#F9D45C', '#F2A86F', '#98D9D9', '#7172AD',
  ],
} as const;

export type PaletteName = keyof typeof PALETTES;

// ── Switch this to try different palettes ──
export const CHART_COLORS: readonly string[] = PALETTES.tableau;

/** Mode-aware theme values */
export interface ChartThemeColors {
  text: { label: string; title: string; muted: string };
  tooltip: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    shadow: string;
  };
  gridLine: string;
  legendText: string;
}

const LIGHT_THEME: ChartThemeColors = {
  text: { label: '#6b7280', title: '#374151', muted: '#9ca3af' },
  tooltip: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    textColor: '#374151',
    shadow: 'box-shadow: 0 2px 8px rgba(59,130,246,0.05);',
  },
  gridLine: '#f3f4f6',
  legendText: '#6b7280',
};

const DARK_THEME: ChartThemeColors = {
  text: { label: '#9ca3af', title: '#e5e7eb', muted: '#6b7280' },
  tooltip: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    textColor: '#e5e7eb',
    shadow: 'box-shadow: 0 2px 8px rgba(0,0,0,0.3);',
  },
  gridLine: '#374151',
  legendText: '#9ca3af',
};

export function getChartTheme(isDark: boolean): ChartThemeColors {
  return isDark ? DARK_THEME : LIGHT_THEME;
}

/** Build tooltip config for the current theme */
export function buildTooltip(theme: ChartThemeColors) {
  return {
    backgroundColor: theme.tooltip.backgroundColor,
    borderColor: theme.tooltip.borderColor,
    borderWidth: 1,
    textStyle: { color: theme.tooltip.textColor, fontSize: 13 },
    extraCssText: theme.tooltip.shadow,
    appendToBody: true,
    position(point: number[], _params: unknown, _dom: HTMLElement, _rect: unknown, size: { contentSize: number[]; viewSize: number[] }) {
      const [mouseX] = point;
      const [tooltipW] = size.contentSize;
      const [chartW] = size.viewSize;
      const gap = 15;
      const x = mouseX + gap + tooltipW < chartW
        ? mouseX + gap
        : mouseX - tooltipW - gap;
      return [x, 10];
    },
  };
}

/** Build legend config for the current theme */
export function buildLegend(theme: ChartThemeColors) {
  return {
    type: 'scroll' as const,
    orient: 'horizontal' as const,
    bottom: 0,
    left: 'center' as const,
    textStyle: { color: theme.legendText, fontSize: 12 },
    pageTextStyle: { color: theme.legendText },
    itemWidth: 16,
    itemHeight: 4,
  };
}

export const DEFAULT_CHART_HEIGHT = 320;

/** Check if x-axis labels are ISO dates — if so, use ECharts time axis */
export function isTimeAxis(rawLabels: string[]): boolean {
  if (rawLabels.length === 0) return false;
  // Check first non-empty label
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
  // Detect ISO date strings (2025-01-13T00:00:00.000)
  if (/^\d{4}-\d{2}-\d{2}T/.test(val)) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
  }
  // Detect date-only strings (2025-01-13)
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
    // Use 1 decimal place to avoid duplicates (e.g. 1.5K vs 2K), strip trailing .0
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
