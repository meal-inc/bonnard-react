/**
 * Converts BuildSeriesResult into ECharts series[] + legend config.
 */
import type { BuildSeriesResult } from './build-series';
import type { SeriesType } from './types';

export type ChartKind = 'bar' | 'line' | 'line-area';

export interface EChartsSeriesConfig {
  series: Record<string, unknown>[];
  showLegend: boolean;
}

export interface Y2Config {
  /** Index in datasets where y2 series start */
  startIndex: number;
  /** Override chart type for y2 series */
  seriesType?: ChartKind;
}

/**
 * Convert BuildSeriesResult to ECharts series and legend config.
 *
 * @param result      - Output from buildSeries()
 * @param chartKind   - 'bar', 'line', or 'line-area'
 * @param seriesType  - 'stacked', 'grouped', or undefined
 * @param horizontal  - For bar charts: swap axes
 * @param rawLabels   - When provided, converts data to [label, value] pairs (for time axis)
 * @param y2Config    - Secondary y-axis config: which datasets go on yAxisIndex 1
 */
export function toEChartsSeries(
  result: BuildSeriesResult,
  chartKind: ChartKind,
  seriesType?: SeriesType,
  horizontal?: boolean,
  rawLabels?: string[],
  y2Config?: Y2Config,
): EChartsSeriesConfig {
  const multiSeries = result.datasets.length > 1;

  // Determine stacking (only for primary y-axis series)
  let stack: string | undefined;
  if (chartKind === 'bar') {
    stack = multiSeries && seriesType !== 'grouped' ? 'stack1' : undefined;
  } else if (chartKind === 'line-area') {
    stack = seriesType === 'stacked' ? 'stack1' : undefined;
  }

  const series = result.datasets.map((ds, idx) => {
    const data = rawLabels
      ? rawLabels.map((label, i) => [label, ds.values[i]])
      : ds.values;

    const isY2 = y2Config != null && idx >= y2Config.startIndex;
    const effectiveKind = isY2 && y2Config?.seriesType ? y2Config.seriesType : chartKind;

    const base: Record<string, unknown> = {
      name: ds.name,
      data,
    };

    if (isY2) {
      base.yAxisIndex = 1;
    }

    // y2 series never stack with primary series
    const effectiveStack = isY2 ? undefined : stack;

    if (effectiveKind === 'bar') {
      base.type = 'bar';
      base.barMaxWidth = 40;
      if (effectiveStack) base.stack = effectiveStack;
      const isTop = !effectiveStack || idx === result.datasets.length - 1;
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
      if (effectiveStack) base.stack = effectiveStack;
      if (effectiveKind === 'line-area') {
        base.areaStyle = { opacity: effectiveStack ? 0.6 : 0.15 };
      }
    }

    return base;
  });

  return { series, showLegend: multiSeries };
}
