import ReactECharts from 'echarts-for-react';
import type { PieChartProps } from '../lib/types';
import { useChartTheme } from '../theme/use-chart-theme';
import { CHART_COLORS, DEFAULT_CHART_HEIGHT } from '../theme/chart-theme';

export function PieChart({ data, name: nameField, value: valueField, title }: PieChartProps) {
  const { theme, tooltip } = useChartTheme();
  const pieData = data.map((row) => ({
    name: String(row[nameField] ?? ''),
    value: Number(row[valueField]) || 0,
  }));

  const option: Record<string, unknown> = {
    color: CHART_COLORS,
    tooltip: {
      ...tooltip,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      type: 'scroll',
      textStyle: { color: theme.legendText, fontSize: 12 },
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
