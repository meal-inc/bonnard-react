import type { DateRangePreset } from './types';

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function today(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface PresetDef {
  label: string;
  getRange: () => [string, string];
}

const PRESETS: Record<DateRangePreset, PresetDef> = {
  'last-7-days': {
    label: 'Last 7 Days',
    getRange: () => {
      const end = today();
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return [fmt(start), fmt(end)];
    },
  },
  'last-30-days': {
    label: 'Last 30 Days',
    getRange: () => {
      const end = today();
      const start = new Date(end);
      start.setDate(start.getDate() - 29);
      return [fmt(start), fmt(end)];
    },
  },
  'last-3-months': {
    label: 'Last 3 Months',
    getRange: () => {
      const end = today();
      const start = new Date(end);
      const targetMonth = start.getMonth() - 3;
      start.setDate(1);
      start.setMonth(targetMonth);
      start.setDate(Math.min(end.getDate(), daysInMonth(start.getFullYear(), start.getMonth())));
      return [fmt(start), fmt(end)];
    },
  },
  'last-6-months': {
    label: 'Last 6 Months',
    getRange: () => {
      const end = today();
      const start = new Date(end);
      const targetMonth = start.getMonth() - 6;
      start.setDate(1);
      start.setMonth(targetMonth);
      start.setDate(Math.min(end.getDate(), daysInMonth(start.getFullYear(), start.getMonth())));
      return [fmt(start), fmt(end)];
    },
  },
  'last-12-months': {
    label: 'Last 12 Months',
    getRange: () => {
      const end = today();
      const start = new Date(end);
      start.setFullYear(start.getFullYear() - 1);
      return [fmt(start), fmt(end)];
    },
  },
  'month-to-date': {
    label: 'Month to Date',
    getRange: () => {
      const end = today();
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      return [fmt(start), fmt(end)];
    },
  },
  'year-to-date': {
    label: 'Year to Date',
    getRange: () => {
      const end = today();
      const start = new Date(end.getFullYear(), 0, 1);
      return [fmt(start), fmt(end)];
    },
  },
  'last-year': {
    label: 'Last Year',
    getRange: () => {
      const end = today();
      const start = new Date(end.getFullYear() - 1, 0, 1);
      const yearEnd = new Date(end.getFullYear() - 1, 11, 31);
      return [fmt(start), fmt(yearEnd)];
    },
  },
  'all-time': {
    label: 'All Time',
    getRange: () => ['2000-01-01', fmt(today())],
  },
};

/** Resolve a preset key to a concrete [start, end] date range */
export function getPresetRange(preset: DateRangePreset): [string, string] {
  const def = PRESETS[preset];
  if (!def) throw new Error(`Unknown date preset: ${preset}`);
  return def.getRange();
}

/** Get the display label for a preset */
export function getPresetLabel(preset: DateRangePreset): string {
  return PRESETS[preset]?.label ?? preset;
}

/** Ordered array of preset options for UI rendering */
export const PRESET_OPTIONS: { key: DateRangePreset; label: string }[] = [
  { key: 'last-7-days', label: 'Last 7 Days' },
  { key: 'last-30-days', label: 'Last 30 Days' },
  { key: 'last-3-months', label: 'Last 3 Months' },
  { key: 'last-6-months', label: 'Last 6 Months' },
  { key: 'last-12-months', label: 'Last 12 Months' },
  { key: 'month-to-date', label: 'Month to Date' },
  { key: 'year-to-date', label: 'Year to Date' },
  { key: 'last-year', label: 'Last Year' },
  { key: 'all-time', label: 'All Time' },
];
