import ReactECharts from 'echarts-for-react';
import type { BarChartProps } from '../lib/types';
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

export function BarChart({ data, x, y, title, horizontal, series, type, yFmt }: BarChartProps) {
  const { theme, tooltip, legend } = useChartTheme();
  const result = buildSeries(data, x, y, series);
  const useTimeAxis = !horizontal && isTimeAxis(result.labels);

  const labels = useTimeAxis ? result.labels : result.labels.map(formatAxisLabel);
  const rotation = horizontal ? 0 : (useTimeAxis ? 0 : labelRotation(labels));
  const { series: echartsSeriesList, showLegend } = toEChartsSeries(
    result, 'bar', type, horizontal, useTimeAxis ? result.labels : undefined,
  );

  const categoryAxis: Record<string, unknown> = useTimeAxis
    ? {
        type: 'time',
        axisLabel: { color: theme.text.label, fontSize: 12, hideOverlap: true },
      }
    : {
        type: 'category',
        data: labels,
        axisLabel: {
          color: theme.text.label,
          fontSize: 12,
          ...(horizontal ? {} : { rotate: rotation }),
        },
      };

  const valueAxis: Record<string, unknown> = {
    type: 'value',
    axisLabel: { color: theme.text.label, fontSize: 12, formatter: (v: number) => axisValueFormatter(v, yFmt) },
    splitLine: { lineStyle: { color: theme.gridLine } },
  };

  const option: Record<string, unknown> = {
    color: CHART_COLORS,
    tooltip: { ...tooltip, trigger: 'axis', valueFormatter: tooltipFormatter(yFmt) },
    ...(showLegend && { legend }),
    grid: {
      left: 10,
      right: 10,
      top: 10,
      bottom: (horizontal ? 40 : gridBottom(rotation)) + (showLegend ? 30 : 0),
      containLabel: true,
    },
    [horizontal ? 'yAxis' : 'xAxis']: categoryAxis,
    [horizontal ? 'xAxis' : 'yAxis']: valueAxis,
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
