// Provider + context
export { BonnardProvider } from './provider';
export type { BonnardProviderProps } from './provider';
export { useBonnard } from './context';
export type { BonnardContextValue } from './context';

// Charts
export { BarChart } from './charts/bar-chart';
export { LineChart } from './charts/line-chart';
export { AreaChart } from './charts/area-chart';
export { PieChart } from './charts/pie-chart';
export { BigValue } from './charts/big-value';
export { DataTable } from './charts/data-table';

// Universal renderer
export { BonnardChart } from './bonnard-chart';
export type { BonnardChartSpec } from './bonnard-chart';

// Hooks
export { useBonnardQuery } from './hooks/use-query';
export type { UseBonnardQueryOptions, UseBonnardQueryResult } from './hooks/use-query';

// Theme
export type { BonnardTheme, BonnardThemeOverride } from './theme/theme-types';
export { PALETTES } from './theme/presets';
export type { PaletteName } from './theme/presets';
export { resolveTheme, applyOverrides } from './theme/resolve-theme';
export { useChartTheme } from './theme/use-chart-theme';

// Types re-exported for convenience
export type {
  BarChartProps,
  AxisChartProps,
  PieChartProps,
  BigValueProps,
  DataTableProps,
  BaseChartProps,
  SeriesType,
} from './lib/types';
