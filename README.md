# @bonnard/react

React components for embedding [Bonnard](https://www.bonnard.dev) charts and dashboards in any React app.

## Install

```bash
npm install @bonnard/react @bonnard/sdk
```

## Quick Start

### 1. Add the provider

```tsx
import { BonnardProvider } from '@bonnard/react';
import '@bonnard/react/styles.css';

function App() {
  return (
    <BonnardProvider config={{ apiKey: 'bon_pk_...' }}>
      <MyAnalyticsPage />
    </BonnardProvider>
  );
}
```

### 2. Render a chart

```tsx
import { BarChart } from '@bonnard/react';

function RevenueByCategory() {
  return (
    <BarChart
      title="Revenue by Category"
      measures={['orders.revenue']}
      dimensions={['orders.product_category']}
    />
  );
}
```

### 3. Use the query hook

```tsx
import { useBonnardQuery } from '@bonnard/react';

function OrderStats() {
  const { data, loading, error } = useBonnardQuery({
    query: {
      measures: ['orders.revenue', 'orders.count'],
      dimensions: ['orders.status'],
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {data?.map((row, i) => (
        <li key={i}>{row['orders.status']}: ${row['orders.revenue']}</li>
      ))}
    </ul>
  );
}
```

## Charts

All chart components accept data inline or query props:

| Component | Description |
|-----------|-------------|
| `<BarChart>` | Vertical or horizontal bar chart |
| `<LineChart>` | Line chart with optional time axis |
| `<AreaChart>` | Stacked or overlapping area chart |
| `<PieChart>` | Pie / donut chart |
| `<BigValue>` | Single KPI number with optional comparison |
| `<DataTable>` | Sortable, paginated data table |
| `<BonnardChart>` | Universal renderer — pass a `spec` object |

## Dashboards (Deprecated)

> **Deprecated**: The markdown dashboard system is deprecated and will be removed in a future version. Use `bon dashboard deploy` to deploy HTML dashboards instead.

For rendering full dashboard layouts, use the dashboard sub-entry:

```tsx
import { Dashboard } from '@bonnard/react/dashboard';

// From a saved dashboard
<Dashboard slug="sales-overview" />

// From markdown content
<Dashboard content={markdownString} />
```

The dashboard entry adds parser dependencies (gray-matter, remark, rehype). Only import it if you need it — the main entry stays lightweight.

## Theming

### Dark mode

```tsx
<BonnardProvider config={{ apiKey: '...' }} darkMode={true}>
```

Options: `true`, `false`, or `'auto'` (default — uses `prefers-color-scheme`).

### Custom colors

Override CSS custom properties to match your brand:

```css
:root {
  --bon-bg: #fafafa;
  --bon-text: #1a1a1a;
  --bon-border: #e0e0e0;
  --bon-radius: 12px;
}
```

### Color palettes

```tsx
<BonnardProvider config={{ apiKey: '...' }} palette="observable">
```

Built-in palettes: `default`, `tableau`, `observable`, `metabase`. Or pass a custom array of hex colors.

## API

### `<BonnardProvider>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `BonnardConfig` | — | SDK config (`apiKey` or `fetchToken`) |
| `darkMode` | `boolean \| 'auto'` | `'auto'` | Dark mode control |
| `palette` | `PaletteName \| string[]` | `'tableau'` | Chart color palette |
| `chartHeight` | `number` | `320` | Default chart height in px |

### `useBonnardQuery(options)`

| Option | Type | Description |
|--------|------|-------------|
| `query` | `QueryOptions` | Cube query (measures, dimensions, filters, etc.) |
| `skip` | `boolean` | Skip execution (for conditional queries) |

Returns `{ data, loading, error, refetch }`.

## Links

- [Bonnard Docs](https://docs.bonnard.dev)
- [SDK Package](https://www.npmjs.com/package/@bonnard/sdk)
- [Discord](https://discord.com/invite/RQuvjGRz)

## License

[MIT](./LICENSE)
