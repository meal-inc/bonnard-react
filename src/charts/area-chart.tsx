import ReactECharts from 'echarts-for-react';
import type { AxisChartProps } from '../lib/types';
import { buildSeries } from '../lib/build-series';
import { toEChartsSeries } from '../lib/echarts-series';
import { useChartTheme } from '../theme/use-chart-theme';
import {
  CHART_COLORS,
  DEFAULT_CHART_HEIGHT,
  isTimeAxis,
  labelRotation,
  gridBottom,
  formatAxisLabel,
  axisValueFormatter,
  tooltipFormatter,
} from '../theme/chart-theme';

export function AreaChart({ data, x, y, title, series, type, yFmt }: AxisChartProps) {
  const { theme, tooltip, legend } = useChartTheme();
  const result = buildSeries(data, x, y, series);
  const useTimeAxis = isTimeAxis(result.labels);

  const labels = useTimeAxis ? result.labels : result.labels.map(formatAxisLabel);
  const rotation = useTimeAxis ? 0 : labelRotation(labels);
  const { series: echartsSeriesList, showLegend } = toEChartsSeries(
    result, 'line-area', type, undefined, useTimeAxis ? result.labels : undefined,
  );

  const xAxisConfig: Record<string, unknown> = useTimeAxis
    ? {
        type: 'time',
        axisLabel: { color: theme.text.label, fontSize: 12, hideOverlap: true },
      }
    : {
        type: 'category',
        data: labels,
        axisLabel: { color: theme.text.label, fontSize: 12, rotate: rotation },
        boundaryGap: false,
      };

  const option: Record<string, unknown> = {
    color: CHART_COLORS,
    tooltip: { ...tooltip, trigger: 'axis', valueFormatter: tooltipFormatter(yFmt) },
    ...(showLegend && { legend }),
    grid: {
      left: 10,
      right: 10,
      top: 10,
      bottom: gridBottom(rotation) + (showLegend ? 30 : 0),
      containLabel: true,
    },
    xAxis: xAxisConfig,
    yAxis: {
      type: 'value',
      axisLabel: { color: theme.text.label, fontSize: 12, formatter: axisValueFormatter },
      splitLine: { lineStyle: { color: theme.gridLine } },
    },
    series: echartsSeriesList,
  };

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--bon-text-title)', marginBottom: 4 }}>
          {title}
        </h3>
      )}
      <ReactECharts
        option={option}
        style={{ height: DEFAULT_CHART_HEIGHT, width: '100%' }}
        notMerge={true}
      />
    </div>
  );
}
