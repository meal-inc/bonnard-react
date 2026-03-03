import type { BonnardTheme } from './theme-types';

/** Named color palettes for charts */
export const PALETTES = {
  default: [
    '#2563eb', '#dc2626', '#16a34a', '#ca8a04',
    '#9333ea', '#ec4899', '#0891b2', '#ea580c',
  ],
  tableau: [
    '#4e79a7', '#f28e2c', '#e15759', '#76b7b2',
    '#59a14f', '#edc949', '#af7aa1', '#ff9da7',
    '#9c755f', '#bab0ab',
  ],
  observable: [
    '#4269d0', '#efb118', '#ff725c', '#6cc5b0',
    '#3ca951', '#ff8ab7', '#a463f2', '#97bbf5',
    '#9c6b4e', '#9498a0',
  ],
  metabase: [
    '#509EE3', '#88BF4D', '#A989C5', '#EF8C8C',
    '#F9D45C', '#F2A86F', '#98D9D9', '#7172AD',
  ],
} as const;

export type PaletteName = keyof typeof PALETTES;

const DEFAULT_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const LIGHT_PRESET: BonnardTheme = {
  isDark: false,
  palette: PALETTES.tableau,
  chartHeight: 320,
  fontFamily: DEFAULT_FONT,
  colors: {
    bg: '#ffffff',
    bgMuted: '#f9fafb',
    bgCard: '#ffffff',
    border: '#e5e7eb',
    borderError: '#fecaca',
    text: '#111827',
    textMuted: '#6b7280',
    textTitle: '#374151',
    textLabel: '#6b7280',
    textError: '#b91c1c',
    textWarn: '#a16207',
    bgError: '#fef2f2',
    bgWarn: '#fefce8',
    borderWarn: '#fde68a',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    radius: '8px',
    spinnerColor: '#6b7280',
    tooltip: {
      bg: '#ffffff',
      border: '#e5e7eb',
      text: '#374151',
      shadow: '0 2px 8px rgba(59, 130, 246, 0.05)',
    },
    gridLine: '#f3f4f6',
    legendText: '#6b7280',
    table: {
      headerBg: 'rgba(107, 114, 128, 0.05)',
      hoverBg: 'rgba(107, 114, 128, 0.04)',
    },
    positive: '#16a34a',
    negative: '#dc2626',
    input: {
      bg: '#ffffff',
      border: '#d1d5db',
    },
  },
};

export const DARK_PRESET: BonnardTheme = {
  isDark: true,
  palette: PALETTES.tableau,
  chartHeight: 320,
  fontFamily: DEFAULT_FONT,
  colors: {
    bg: '#111827',
    bgMuted: '#1f2937',
    bgCard: '#1f2937',
    border: '#374151',
    borderError: '#7f1d1d',
    text: '#f9fafb',
    textMuted: '#9ca3af',
    textTitle: '#e5e7eb',
    textLabel: '#9ca3af',
    textError: '#fca5a5',
    textWarn: '#fcd34d',
    bgError: 'rgba(127, 29, 29, 0.2)',
    bgWarn: 'rgba(161, 98, 7, 0.15)',
    borderWarn: '#92400e',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    radius: '8px',
    spinnerColor: '#9ca3af',
    tooltip: {
      bg: '#1f2937',
      border: '#374151',
      text: '#e5e7eb',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    },
    gridLine: '#374151',
    legendText: '#9ca3af',
    table: {
      headerBg: 'rgba(156, 163, 175, 0.08)',
      hoverBg: 'rgba(156, 163, 175, 0.05)',
    },
    positive: '#4ade80',
    negative: '#f87171',
    input: {
      bg: '#1f2937',
      border: '#4b5563',
    },
  },
};
