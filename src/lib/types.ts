import type { QueryOptions } from '@bonnard/sdk';
import type { BonnardThemeOverride } from '../theme/theme-types';

/** Dashboard record from the database */
export interface Dashboard {
  id: string;
  clerk_org_id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  version: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Dashboard list item (subset for listing) */
export interface DashboardSummary {
  slug: string;
  title: string;
  description: string | null;
  updated_at: string;
}

/** Parsed frontmatter from dashboard markdown */
export interface DashboardFrontmatter {
  title: string;
  description?: string;
  theme?: BonnardThemeOverride;
}

/** A named query extracted from a query code fence */
export interface DashboardQuery {
  name: string;
  options: QueryOptions;
}

/** Component types supported in v1 */
export type ComponentType =
  | 'BigValue'
  | 'LineChart'
  | 'BarChart'
  | 'AreaChart'
  | 'DataTable'
  | 'PieChart'
  | 'DateRange'
  | 'Dropdown';

/** A parsed component tag from the markdown */
export interface ComponentTag {
  type: ComponentType;
  props: Record<string, string>;
}

/** A section of the parsed dashboard — HTML content, a component, or a grid layout */
export type DashboardSection =
  | { kind: 'html'; content: string }
  | { kind: 'component'; component: ComponentTag }
  | { kind: 'grid'; props: Record<string, string>; children: DashboardSection[] };

/** Full output of parseDashboard() */
export interface ParsedDashboard {
  frontmatter: DashboardFrontmatter;
  queries: Map<string, QueryOptions>;
  inputs: ComponentTag[];
  sections: DashboardSection[];
}

/** Date range preset keys */
export type DateRangePreset =
  | 'last-7-days'
  | 'last-30-days'
  | 'last-3-months'
  | 'last-6-months'
  | 'last-12-months'
  | 'month-to-date'
  | 'year-to-date'
  | 'last-year'
  | 'all-time';

/** Props shared by all chart components */
export interface BaseChartProps {
  data: Record<string, unknown>[];
  title?: string;
}

/** Props for BigValue component */
export interface BigValueProps extends BaseChartProps {
  value: string;
  /** Format preset or Excel format code (e.g. "eur2", "$#,##0.00") */
  fmt?: string;
  /** Column name for comparison value (from same data[0] row) */
  comparison?: string;
  /** Format for comparison delta (defaults to fmt) */
  comparisonFmt?: string;
  /** Label after delta, e.g. "vs Plan" */
  comparisonTitle?: string;
  /** Invert colors (for churn, costs — decrease is good) */
  downIsGood?: boolean;
}

/** Display mode for multi-series charts */
export type SeriesType = 'stacked' | 'grouped';

/** Props for axis-based charts (Line, Bar, Area) */
export interface AxisChartProps extends BaseChartProps {
  x: string;
  y: string;
  /** Column to split data into separate series */
  series?: string;
  /** Display mode for multi-series (default: stacked for bar, none for line/area) */
  type?: SeriesType;
  /** Format preset or Excel code for y-axis tooltip values (e.g. "eur2", "0.0%") */
  yFmt?: string;
  /** Column(s) for secondary y-axis (comma-separated) */
  y2?: string;
  /** Format for secondary y-axis */
  y2Fmt?: string;
  /** Override chart type for y2 series */
  y2SeriesType?: 'line' | 'bar' | 'area';
}

/** Props for BarChart (extends axis with optional horizontal) */
export interface BarChartProps extends AxisChartProps {
  horizontal?: boolean;
}

/** Props for PieChart */
export interface PieChartProps extends BaseChartProps {
  name: string;
  value: string;
  /** Format preset or Excel format code for tooltip values */
  fmt?: string;
}

/** Props for DataTable */
export interface DataTableProps extends BaseChartProps {
  columns?: string[];
  /** Column format map: "col:preset,col2:preset" or raw Excel codes */
  fmt?: string;
  /** Rows per page. Default 10. Use "all" to disable pagination. */
  rows?: number | 'all';
  /** The limit used in the query (from API). Used to detect truncated results. */
  queryLimit?: number | null;
}
