import ReactECharts from 'echarts-for-react';
import type { BarChartProps } from '../lib/types';
import { buildSeries } from '../lib/build-series';
import { toEChartsSeries } from '../lib/echarts-series';
import type { ChartKind, Y2Config } from '../lib/echarts-series';
import { useChartTheme } from '../theme/use-chart-theme';
import {
  isTimeAxis,
  labelRotation,
  gridBottom,
  formatAxisLabel,
  axisValueFormatter,
  tooltipFormatter,
  dualAxisTooltipFormatter,
} from '../lib/chart-utils';

const Y2_SERIES_TYPE_MAP: Record<string, ChartKind> = {
  line: 'line',
  bar: 'bar',
  area: 'line-area',
};

export function BarChart({ data, x, y, title, horizontal, series, type, yFmt, y2, y2Fmt, y2SeriesType }: BarChartProps) {
  const { theme, palette, tooltip, legend } = useChartTheme();

  // Skip y2 for horizontal bar charts — secondary axis on top is unusual
  const effectiveY2 = horizontal ? undefined : y2;

  const allY = effectiveY2 ? `${y},${effectiveY2}` : y;
  const result = buildSeries(data, x, allY, series);
  const useTimeAxis = !horizontal && isTimeAxis(result.labels);

  const yColCount = y.split(',').filter(Boolean).length;
  const y2Config: Y2Config | undefined = effectiveY2
    ? { startIndex: yColCount, seriesType: y2SeriesType ? Y2_SERIES_TYPE_MAP[y2SeriesType] : undefined }
    : undefined;

  const labels = useTimeAxis ? result.labels : result.labels.map(formatAxisLabel);
  const rotation = horizontal ? 0 : (useTimeAxis ? 0 : labelRotation(labels));
  const { series: echartsSeriesList, showLegend } = toEChartsSeries(
    result, 'bar', type, horizontal, useTimeAxis ? result.labels : undefined, y2Config,
  );

  const categoryAxis: Record<string, unknown> = useTimeAxis
    ? {
        type: 'time',
        axisLabel: { color: theme.colors.textLabel, fontSize: 12, hideOverlap: true },
      }
    : {
        type: 'category',
        data: labels,
        axisLabel: {
          color: theme.colors.textLabel,
          fontSize: 12,
          ...(horizontal ? {} : { rotate: rotation }),
        },
      };

  const valueAxis: Record<string, unknown> = {
    type: 'value',
    axisLabel: { color: theme.colors.textLabel, fontSize: 12, formatter: (v: number) => axisValueFormatter(v, yFmt) },
    splitLine: { lineStyle: { color: theme.colors.gridLine } },
  };

  let yAxisConfig: Record<string, unknown> | Record<string, unknown>[];
  if (effectiveY2 && !horizontal) {
    yAxisConfig = [
      valueAxis,
      {
        type: 'value',
        axisLabel: { color: theme.colors.textLabel, fontSize: 12, formatter: (v: number) => axisValueFormatter(v, y2Fmt) },
        splitLine: { show: false },
      },
    ];
  } else {
    yAxisConfig = valueAxis;
  }

  const tooltipConfig = effectiveY2 && y2Fmt !== yFmt
    ? { ...tooltip, trigger: 'axis', formatter: dualAxisTooltipFormatter(yColCount, yFmt, y2Fmt) }
    : { ...tooltip, trigger: 'axis', valueFormatter: tooltipFormatter(yFmt) };

  const option: Record<string, unknown> = {
    color: palette,
    tooltip: tooltipConfig,
    ...(showLegend && { legend }),
    grid: {
      left: 10,
      right: 10,
      top: 10,
      bottom: (horizontal ? 40 : gridBottom(rotation)) + (showLegend ? 30 : 0),
      containLabel: true,
    },
    [horizontal ? 'yAxis' : 'xAxis']: categoryAxis,
    [horizontal ? 'xAxis' : 'yAxis']: yAxisConfig,
    series: echartsSeriesList,
  };

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <h3 style={{ fontSize: 14, fontWeight: 500, color: theme.colors.textTitle, marginBottom: 4 }}>
          {title}
        </h3>
      )}
      <ReactECharts
        option={option}
        style={{ height: theme.chartHeight, width: '100%' }}
        notMerge={true}
      />
    </div>
  );
}
