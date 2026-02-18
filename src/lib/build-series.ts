/**
 * Pure data transformation: splits flat query results into multi-series datasets.
 *
 * Four cases:
 * | y columns | series prop | Result                        |
 * |-----------|-------------|-------------------------------|
 * | Single    | None        | 1 dataset (current behavior)  |
 * | Single    | Set         | N datasets (per series value)  |
 * | Multiple  | None        | N datasets (per y column)      |
 * | Multiple  | Set         | N*M datasets                   |
 */

export interface SeriesDataset {
  /** Legend label */
  name: string;
  /** One value per x-axis label (null for missing combinations) */
  values: (number | null)[];
}

export interface BuildSeriesResult {
  /** Ordered x-axis labels */
  labels: string[];
  /** One dataset per series */
  datasets: SeriesDataset[];
}

/**
 * Build multi-series datasets from flat query data.
 *
 * @param data  - Flat array of row objects from query
 * @param x     - Column name for x-axis
 * @param y     - Column name(s) for y-axis, comma-separated for multiple
 * @param series - Optional column name to split data into separate series
 */
export function buildSeries(
  data: Record<string, unknown>[],
  x: string,
  y: string,
  series?: string,
): BuildSeriesResult {
  if (!data || data.length === 0) {
    return { labels: [], datasets: [] };
  }

  // Sort rows by x-axis so time series render chronologically
  // (APIs may return data in arbitrary order when no orderBy is specified).
  // Only sort when x values look like ISO dates to avoid reordering categorical data.
  const firstX = String(data[0][x] ?? '');
  if (/^\d{4}-\d{2}-\d{2}/.test(firstX)) {
    data = [...data].sort((a, b) => {
      const aVal = String(a[x] ?? '');
      const bVal = String(b[x] ?? '');
      return aVal.localeCompare(bVal);
    });
  }

  const yColumns = y.split(',').map((col) => col.trim()).filter(Boolean);

  // No series column — simple case
  if (!series) {
    const labels = data.map((row) => String(row[x] ?? ''));
    const datasets: SeriesDataset[] = yColumns.map((col) => ({
      name: col,
      values: data.map((row) => {
        const val = row[col];
        return val == null ? null : Number(val);
      }),
    }));
    return { labels, datasets };
  }

  // Series column set — pivot data
  // 1. Collect ordered unique x values and series values
  const xValues: string[] = [];
  const xSet = new Set<string>();
  const seriesKeys: string[] = [];
  const seriesSet = new Set<string>();

  for (const row of data) {
    const xRaw = String(row[x] ?? '');
    if (!xSet.has(xRaw)) {
      xSet.add(xRaw);
      xValues.push(xRaw);
    }
    const sk = String(row[series] ?? '');
    if (!seriesSet.has(sk)) {
      seriesSet.add(sk);
      seriesKeys.push(sk);
    }
  }

  // 2. Build lookup: "xVal\0seriesVal" → row
  const lookup = new Map<string, Record<string, unknown>>();
  for (const row of data) {
    const key = `${String(row[x] ?? '')}\0${String(row[series] ?? '')}`;
    lookup.set(key, row);
  }

  // 3. Build datasets
  const datasets: SeriesDataset[] = [];

  for (const sk of seriesKeys) {
    for (const col of yColumns) {
      // Name: series value for single-y; "SeriesVal - Column" for multi-y
      const name = yColumns.length === 1 ? sk : `${sk} - ${col}`;

      const values = xValues.map((xRaw) => {
        const row = lookup.get(`${xRaw}\0${sk}`);
        if (!row) return null;
        const val = row[col];
        return val == null ? null : Number(val);
      });

      datasets.push({ name, values });
    }
  }

  return { labels: xValues, datasets };
}
