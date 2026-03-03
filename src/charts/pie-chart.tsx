import ReactECharts from 'echarts-for-react';
import type { PieChartProps } from '../lib/types';
import { useChartTheme } from '../theme/use-chart-theme';
import { applyFormat } from '../lib/format-value';

export function PieChart({ data, name: nameField, value: valueField, title, fmt }: PieChartProps) {
  const { theme, palette, tooltip } = useChartTheme();
  const pieData = data
    .map((row) => ({
      name: String(row[nameField] ?? ''),
      value: Number(row[valueField]),
    }))
    .filter((d) => !isNaN(d.value));

  const option: Record<string, unknown> = {
    color: palette,
    tooltip: {
      ...tooltip,
      trigger: 'item',
      formatter: fmt
        ? (params: { name: string; value: number; percent: number }) =>
            `${params.name}: ${applyFormat(params.value, fmt)} (${params.percent}%)`
        : '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      type: 'scroll',
      textStyle: { color: theme.colors.legendText, fontSize: 12 },
    },
    grid: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '40%'],
        data: pieData,
        label: { show: false },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' },
        },
      },
    ],
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
