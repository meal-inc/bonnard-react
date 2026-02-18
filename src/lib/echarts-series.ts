/**
 * Converts BuildSeriesResult into ECharts series[] + legend config.
 */
import type { BuildSeriesResult } from './build-series';
import type { SeriesType } from './types';

type ChartKind = 'bar' | 'line' | 'line-area';

interface EChartsSeriesConfig {
  series: Record<string, unknown>[];
  showLegend: boolean;
}

/**
 * Convert BuildSeriesResult to ECharts series and legend config.
 *
 * @param result      - Output from buildSeries()
 * @param chartKind   - 'bar', 'line', or 'line-area'
 * @param seriesType  - 'stacked', 'grouped', or undefined
 * @param horizontal  - For bar charts: swap axes
 * @param rawLabels   - When provided, converts data to [label, value] pairs (for time axis)
 */
export function toEChartsSeries(
  result: BuildSeriesResult,
  chartKind: ChartKind,
  seriesType?: SeriesType,
  horizontal?: boolean,
  rawLabels?: string[],
): EChartsSeriesConfig {
  const multiSeries = result.datasets.length > 1;

  // Determine stacking
  let stack: string | undefined;
  if (chartKind === 'bar') {
    // Bar: default stacked when multi-series, unless explicitly grouped
    stack = multiSeries && seriesType !== 'grouped' ? 'stack1' : undefined;
  } else if (chartKind === 'line-area') {
    // Area: stack only when explicitly requested
    stack = seriesType === 'stacked' ? 'stack1' : undefined;
  }
  // Line: no stacking by default

  const series = result.datasets.map((ds, idx) => {
    // For time axis, pair each value with its raw label: [isoDate, value]
    const data = rawLabels
      ? rawLabels.map((label, i) => [label, ds.values[i]])
      : ds.values;

    const base: Record<string, unknown> = {
      name: ds.name,
      data,
    };

    if (chartKind === 'bar') {
      base.type = 'bar';
      base.barMaxWidth = 40;
      if (stack) base.stack = stack;
      // Only round corners on the top segment of a stack (last series)
      const isTop = !stack || idx === result.datasets.length - 1;
      base.itemStyle = {
        borderRadius: isTop
          ? (horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0])
          : 0,
      };
    } else {
      // line or line-area
      base.type = 'line';
      base.smooth = true;
      base.symbol = 'circle';
      base.symbolSize = 6;
      base.lineStyle = { width: 2 };
      if (stack) base.stack = stack;
      if (chartKind === 'line-area') {
        base.areaStyle = { opacity: stack ? 0.6 : 0.15 };
      }
    }

    return base;
  });

  return { series, showLegend: multiSeries };
}
