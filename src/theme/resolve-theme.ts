import type { BonnardTheme, BonnardThemeOverride } from './theme-types';
import { LIGHT_PRESET, DARK_PRESET, PALETTES, type PaletteName } from './presets';

/**
 * Deep-merge source into target. Arrays and primitives are replaced, objects are merged.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = result[key];
    if (
      srcVal != null &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      tgtVal != null &&
      typeof tgtVal === 'object' &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(tgtVal, srcVal);
    } else if (srcVal !== undefined) {
      result[key] = srcVal;
    }
  }
  return result;
}

/** Resolve a palette that may be a named string or an array */
function resolvePalette(
  palette: readonly string[] | string | undefined,
  fallback: readonly string[],
): readonly string[] {
  if (!palette) return fallback;
  if (typeof palette === 'string') {
    return PALETTES[palette as PaletteName] ?? fallback;
  }
  return palette;
}

/**
 * Build a full BonnardTheme by selecting a base preset (light/dark) and
 * applying zero or more partial overrides in order.
 */
export function resolveTheme(
  isDark: boolean,
  ...overrides: (BonnardThemeOverride | undefined | null)[]
): BonnardTheme {
  let theme: BonnardTheme = isDark ? { ...DARK_PRESET } : { ...LIGHT_PRESET };

  for (const override of overrides) {
    if (!override) continue;
    const { palette, ...rest } = override;
    theme = deepMerge(theme, rest) as BonnardTheme;
    theme.palette = resolvePalette(palette as readonly string[] | string | undefined, theme.palette);
  }

  // isDark is always determined by the provider, not overrides
  theme.isDark = isDark;
  return theme;
}

/**
 * Layer additional overrides on top of an already-resolved theme.
 * Used by DashboardViewer to apply frontmatter theme on top of the provider theme.
 */
export function applyOverrides(
  base: BonnardTheme,
  ...overrides: (BonnardThemeOverride | undefined | null)[]
): BonnardTheme {
  let theme = { ...base };

  for (const override of overrides) {
    if (!override) continue;
    const { palette, ...rest } = override;
    theme = deepMerge(theme, rest) as BonnardTheme;
    theme.palette = resolvePalette(palette as readonly string[] | string | undefined, theme.palette);
  }

  theme.isDark = base.isDark;
  return theme;
}
