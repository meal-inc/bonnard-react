import type { BigValueProps } from '../lib/types';
import { applyFormat } from '../lib/format-value';
import { formatValue } from '../lib/chart-utils';

export function BigValue({ data, value, title, fmt, comparison, comparisonFmt, comparisonTitle, downIsGood }: BigValueProps) {
  const row = data[0];
  if (!row) return null;

  const displayValue = fmt ? applyFormat(row[value], fmt) : formatValue(row[value]);
  const label = title ?? value;

  // Comparison delta
  let comparisonEl: React.ReactNode = null;
  if (comparison && row[comparison] != null) {
    const delta = Number(row[value]) - Number(row[comparison]);
    const deltaFmt = comparisonFmt || fmt;
    const formattedDelta = deltaFmt ? applyFormat(Math.abs(delta), deltaFmt) : formatValue(Math.abs(delta));
    const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '–';
    const isPositive = delta > 0;
    const isNegative = delta < 0;
    const color = delta === 0
      ? 'var(--bon-text-muted)'
      : (isPositive !== !!downIsGood) ? 'var(--bon-positive)' : 'var(--bon-negative)';

    comparisonEl = (
      <p style={{ fontSize: 14, fontWeight: 500, color, margin: 0, marginTop: 4 }}>
        {arrow} {formattedDelta}{comparisonTitle ? ` ${comparisonTitle}` : ''}
      </p>
    );
  }

  return (
    <div
      style={{
        minWidth: 0,
        borderRadius: 'var(--bon-radius)',
        border: '1px solid var(--bon-border)',
        backgroundColor: 'var(--bon-bg-card)',
        padding: 20,
        boxShadow: 'var(--bon-shadow)',
      }}
    >
      <p
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--bon-text-muted)',
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: 'var(--bon-text)',
          margin: 0,
          marginTop: 4,
        }}
      >
        {displayValue}
      </p>
      {comparisonEl}
    </div>
  );
}
