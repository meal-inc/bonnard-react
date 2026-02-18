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
export { PALETTES, CHART_COLORS } from './theme/chart-theme';
export type { PaletteName } from './theme/chart-theme';

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
