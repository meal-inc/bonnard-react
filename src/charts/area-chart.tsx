import ReactECharts from 'echarts-for-react';
import type { AxisChartProps } from '../lib/types';
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

export function AreaChart({ data, x, y, title, series, type, yFmt, y2, y2Fmt, y2SeriesType }: AxisChartProps) {
  const { theme, palette, tooltip, legend } = useChartTheme();
  const allY = y2 ? `${y},${y2}` : y;
  const result = buildSeries(data, x, allY, series);
  const useTimeAxis = isTimeAxis(result.labels);

  const yColCount = y.split(',').filter(Boolean).length;
  const y2Config: Y2Config | undefined = y2
    ? { startIndex: yColCount, seriesType: y2SeriesType ? Y2_SERIES_TYPE_MAP[y2SeriesType] : undefined }
    : undefined;

  const labels = useTimeAxis ? result.labels : result.labels.map(formatAxisLabel);
  const rotation = useTimeAxis ? 0 : labelRotation(labels);
  const { series: echartsSeriesList, showLegend } = toEChartsSeries(
    result, 'line-area', type, undefined, useTimeAxis ? result.labels : undefined, y2Config,
  );

  const xAxisConfig: Record<string, unknown> = useTimeAxis
    ? {
        type: 'time',
        axisLabel: { color: theme.colors.textLabel, fontSize: 12, hideOverlap: true },
      }
    : {
        type: 'category',
        data: labels,
        axisLabel: { color: theme.colors.textLabel, fontSize: 12, rotate: rotation },
        boundaryGap: false,
      };

  const yAxisArr: Record<string, unknown>[] = [
    {
      type: 'value',
      axisLabel: { color: theme.colors.textLabel, fontSize: 12, formatter: (v: number) => axisValueFormatter(v, yFmt) },
      splitLine: { lineStyle: { color: theme.colors.gridLine } },
    },
  ];
  if (y2) {
    yAxisArr.push({
      type: 'value',
      axisLabel: { color: theme.colors.textLabel, fontSize: 12, formatter: (v: number) => axisValueFormatter(v, y2Fmt) },
      splitLine: { show: false },
    });
  }

  const tooltipConfig = y2 && y2Fmt !== yFmt
    ? { ...tooltip, trigger: 'axis', formatter: dualAxisTooltipFormatter(yColCount, yFmt, y2Fmt) }
    : { ...tooltip, trigger: 'axis', valueFormatter: tooltipFormatter(yFmt) };

  const option: Record<string, unknown> = {
    color: palette,
    tooltip: tooltipConfig,
    ...(showLegend && { legend }),
    grid: {
      left: 10,
      right: y2 ? 10 : 10,
      top: 10,
      bottom: gridBottom(rotation) + (showLegend ? 30 : 0),
      containLabel: true,
    },
    xAxis: xAxisConfig,
    yAxis: y2 ? yAxisArr : yAxisArr[0],
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
