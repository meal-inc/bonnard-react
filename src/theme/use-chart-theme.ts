import { useBonnard } from '../context';
import type { BonnardTheme } from './theme-types';

/** Build ECharts tooltip config from theme */
function buildTooltip(theme: BonnardTheme) {
  return {
    backgroundColor: theme.colors.tooltip.bg,
    borderColor: theme.colors.tooltip.border,
    borderWidth: 1,
    textStyle: { color: theme.colors.tooltip.text, fontSize: 13 },
    extraCssText: `box-shadow: ${theme.colors.tooltip.shadow};`,
    appendToBody: true,
    position(point: number[], _params: unknown, _dom: HTMLElement, _rect: unknown, size: { contentSize: number[]; viewSize: number[] }) {
      const [mouseX] = point;
      const [tooltipW] = size.contentSize;
      const [chartW] = size.viewSize;
      const gap = 15;
      const x = mouseX + gap + tooltipW < chartW
        ? mouseX + gap
        : mouseX - tooltipW - gap;
      return [x, 10];
    },
  };
}

/** Build ECharts legend config from theme */
function buildLegend(theme: BonnardTheme) {
  return {
    type: 'scroll' as const,
    orient: 'horizontal' as const,
    bottom: 0,
    left: 'center' as const,
    textStyle: { color: theme.colors.legendText, fontSize: 12 },
    pageTextStyle: { color: theme.colors.legendText },
    itemWidth: 16,
    itemHeight: 4,
  };
}

/**
 * Returns mode-aware chart theme values from BonnardProvider context.
 */
export function useChartTheme() {
  const { theme } = useBonnard();

  return {
    theme,
    isDark: theme.isDark,
    palette: theme.palette,
    tooltip: buildTooltip(theme),
    legend: buildLegend(theme),
  };
}
