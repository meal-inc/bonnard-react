import { useState, useMemo } from 'react';
import type { DataTableProps } from '../lib/types';
import { autoFormat, applyFormat, parseFmtProp } from '../lib/format-value';
import { formatColumnHeader } from '../lib/chart-utils';

const DEFAULT_PAGE_SIZE = 10;

const ChevronUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const ChevronsUpDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

/** Check if the first non-null value in a column is numeric */
function isNumericColumn(data: Record<string, unknown>[], col: string): boolean {
  for (const row of data) {
    const v = row[col];
    if (v == null) continue;
    return typeof v === 'number' || (typeof v === 'string' && v !== '' && !isNaN(Number(v)));
  }
  return false;
}

/** Check if the first non-null value in a column looks like an ISO date */
function isDateColumn(data: Record<string, unknown>[], col: string): boolean {
  for (const row of data) {
    const v = row[col];
    if (v == null) continue;
    return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v);
  }
  return false;
}

type SortState = { col: string; asc: boolean } | null;

/** Compare two values for sorting — nulls always last */
function compareValues(a: unknown, b: unknown, asc: boolean): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  const numA = Number(a);
  const numB = Number(b);
  const bothNumeric = !isNaN(numA) && !isNaN(numB) && a !== '' && b !== '';

  let cmp: number;
  if (bothNumeric) {
    cmp = numA - numB;
  } else {
    cmp = String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
  }

  return asc ? cmp : -cmp;
}

/** Cube's default row limit when no explicit limit is set */
const CUBE_DEFAULT_LIMIT = 10_000;

export function DataTable({ data, columns: explicitColumns, fmt, rows: rowsProp, queryLimit }: DataTableProps) {
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(0);

  if (data.length === 0) return null;

  const columns = explicitColumns ?? Object.keys(data[0]);
  const fmtMap = fmt ? parseFmtProp(fmt) : null;
  const numericCols = new Set(columns.filter((col) => isNumericColumn(data, col)));
  const dateCols = new Set(columns.filter((col) => isDateColumn(data, col)));

  const pageSize = rowsProp === 'all' ? data.length : (rowsProp ?? DEFAULT_PAGE_SIZE);
  const paginated = pageSize < data.length;

  const effectiveLimit = queryLimit ?? CUBE_DEFAULT_LIMIT;
  const isTruncated = data.length >= effectiveLimit;

  const formatCell = (col: string, val: unknown): string => {
    const colFmt = fmtMap?.get(col);
    if (colFmt) return applyFormat(val, colFmt);
    return autoFormat(val);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const sortedData = useMemo(() => {
    if (!sort) return data;
    return [...data].sort((a, b) => compareValues(a[sort.col], b[sort.col], sort.asc));
  }, [data, sort]);

  const pageData = paginated ? sortedData.slice(page * pageSize, (page + 1) * pageSize) : sortedData;
  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (col: string) => {
    setSort((prev) => {
      if (prev?.col === col) return { col, asc: !prev.asc };
      return { col, asc: true };
    });
    setPage(0);
  };

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          overflowX: 'auto',
          borderRadius: 'var(--bon-radius)',
          border: '1px solid var(--bon-border)',
          scrollbarWidth: 'thin' as const,
        }}
      >
        <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bon-border)', backgroundColor: 'var(--bon-table-header-bg)' }}>
              {columns.map((col) => {
                const isNumeric = numericCols.has(col);
                const isSorted = sort?.col === col;
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    style={{
                      padding: '8px 12px',
                      fontWeight: 500,
                      color: 'var(--bon-text-muted)',
                      whiteSpace: 'nowrap',
                      userSelect: 'none',
                      cursor: 'pointer',
                      textAlign: isNumeric ? 'right' : 'left',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexDirection: isNumeric ? 'row-reverse' : 'row' }}>
                      {formatColumnHeader(col)}
                      <span style={{ opacity: 0.5 }}>
                        {isSorted ? (
                          sort.asc ? <ChevronUpIcon /> : <ChevronDownIcon />
                        ) : (
                          <ChevronsUpDownIcon />
                        )}
                      </span>
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: i < pageData.length - 1 ? '1px solid var(--bon-border)' : undefined,
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: '6px 12px',
                      textAlign: numericCols.has(col) ? 'right' : 'left',
                      whiteSpace: dateCols.has(col) ? 'nowrap' : undefined,
                      color: 'var(--bon-text)',
                    }}
                  >
                    {formatCell(col, row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(paginated || isTruncated) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 4px 0',
            fontSize: 12,
            color: 'var(--bon-text-muted)',
          }}
        >
          <span>
            {isTruncated
              ? `Showing first ${data.length.toLocaleString()} rows`
              : paginated
                ? `${(page * pageSize + 1).toLocaleString()}\u2013${Math.min((page + 1) * pageSize, sortedData.length).toLocaleString()} of ${sortedData.length.toLocaleString()}`
                : `${data.length.toLocaleString()} rows`}
          </span>
          {paginated && totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  padding: 4,
                  borderRadius: 4,
                  border: 'none',
                  background: 'none',
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  opacity: page === 0 ? 0.3 : 1,
                  color: 'var(--bon-text-muted)',
                }}
              >
                <ChevronLeftIcon />
              </button>
              <span>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  padding: 4,
                  borderRadius: 4,
                  border: 'none',
                  background: 'none',
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages - 1 ? 0.3 : 1,
                  color: 'var(--bon-text-muted)',
                }}
              >
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
