import type { BonnardTheme } from './theme-types';

/**
 * Convert a BonnardTheme into a React inline style object of --bon-* CSS custom properties.
 * This allows the provider to inject theme values without relying on class-based selectors.
 */
export function themeToCssVars(theme: BonnardTheme): React.CSSProperties {
  const { colors } = theme;
  return {
    '--bon-font': theme.fontFamily,
    '--bon-bg': colors.bg,
    '--bon-bg-muted': colors.bgMuted,
    '--bon-bg-card': colors.bgCard,
    '--bon-border': colors.border,
    '--bon-border-error': colors.borderError,
    '--bon-text': colors.text,
    '--bon-text-muted': colors.textMuted,
    '--bon-text-title': colors.textTitle,
    '--bon-text-label': colors.textLabel,
    '--bon-text-error': colors.textError,
    '--bon-text-warn': colors.textWarn,
    '--bon-bg-error': colors.bgError,
    '--bon-bg-warn': colors.bgWarn,
    '--bon-border-warn': colors.borderWarn,
    '--bon-shadow': colors.shadow,
    '--bon-radius': colors.radius,
    '--bon-chart-height': `${theme.chartHeight}px`,
    '--bon-tooltip-bg': colors.tooltip.bg,
    '--bon-tooltip-border': colors.tooltip.border,
    '--bon-tooltip-text': colors.tooltip.text,
    '--bon-tooltip-shadow': colors.tooltip.shadow,
    '--bon-grid-line': colors.gridLine,
    '--bon-legend-text': colors.legendText,
    '--bon-table-header-bg': colors.table.headerBg,
    '--bon-table-hover': colors.table.hoverBg,
    '--bon-positive': colors.positive,
    '--bon-negative': colors.negative,
    '--bon-input-bg': colors.input.bg,
    '--bon-input-border': colors.input.border,
    '--bon-spinner-color': colors.spinnerColor,
  } as React.CSSProperties;
}
