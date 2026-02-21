import React from 'react';
import { BarChart } from './charts/bar-chart';
import { LineChart } from './charts/line-chart';
import { AreaChart } from './charts/area-chart';
import { PieChart } from './charts/pie-chart';
import { BigValue } from './charts/big-value';
import { DataTable } from './charts/data-table';
import type { SeriesType } from './lib/types';

export interface BonnardChartSpec {
  chartType: 'bar' | 'line' | 'area' | 'pie' | 'big_value' | 'table';
  data: Record<string, unknown>[];
  title?: string;
  x?: string;
  y?: string;
  series?: string;
  name?: string;
  value?: string;
  fmt?: string;
  horizontal?: boolean;
  type?: SeriesType;
  columns?: string[];
  rows?: number | 'all';
  yFmt?: string;
}

export function BonnardChart({ spec }: { spec: BonnardChartSpec }) {
  const { chartType, data, title } = spec;

  switch (chartType) {
    case 'bar':
      return (
        <BarChart
          data={data}
          x={spec.x!}
          y={spec.y!}
          title={title}
          horizontal={spec.horizontal}
          series={spec.series}
          type={spec.type}
          yFmt={spec.yFmt}
        />
      );
    case 'line':
      return (
        <LineChart
          data={data}
          x={spec.x!}
          y={spec.y!}
          title={title}
          series={spec.series}
          type={spec.type}
          yFmt={spec.yFmt}
        />
      );
    case 'area':
      return (
        <AreaChart
          data={data}
          x={spec.x!}
          y={spec.y!}
          title={title}
          series={spec.series}
          type={spec.type}
          yFmt={spec.yFmt}
        />
      );
    case 'pie':
      return (
        <PieChart
          data={data}
          name={spec.name!}
          value={spec.value!}
          title={title}
        />
      );
    case 'big_value':
      return (
        <BigValue
          data={data}
          value={spec.value!}
          title={title}
          fmt={spec.fmt}
        />
      );
    case 'table':
      return (
        <DataTable
          data={data}
          columns={spec.columns}
          fmt={spec.fmt}
          rows={spec.rows}
        />
      );
    default:
      return null;
  }
}
