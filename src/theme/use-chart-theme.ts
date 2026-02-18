import { useBonnard } from '../context';
import { getChartTheme, buildTooltip, buildLegend } from './chart-theme';

/**
 * Returns mode-aware chart theme values.
 * Reads isDark from BonnardProvider context.
 */
export function useChartTheme() {
  const { isDark } = useBonnard();
  const theme = getChartTheme(isDark);

  return {
    isDark,
    theme,
    tooltip: buildTooltip(theme),
    legend: buildLegend(theme),
  };
}
