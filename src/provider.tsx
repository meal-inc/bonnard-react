import React, { useMemo, useEffect, useState } from 'react';
import { createClient, type BonnardConfig } from '@bonnard/sdk';
import { BonnardContext } from './context';
import { PALETTES, CHART_COLORS, type PaletteName } from './theme/chart-theme';

export interface BonnardProviderProps {
  children: React.ReactNode;
  config: BonnardConfig;
  darkMode?: boolean | 'auto';
  palette?: PaletteName | string[];
  chartHeight?: number;
}

export function BonnardProvider({
  children,
  config,
  darkMode = 'auto',
  palette,
  chartHeight = 320,
}: BonnardProviderProps) {
  const client = useMemo(() => createClient(config), [config]);

  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    if (darkMode !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [darkMode]);

  const isDark = darkMode === 'auto' ? systemDark : darkMode;

  const resolvedPalette = useMemo(() => {
    if (!palette) return CHART_COLORS;
    if (Array.isArray(palette)) return palette;
    return PALETTES[palette] ?? CHART_COLORS;
  }, [palette]);

  const value = useMemo(
    () => ({ client, isDark, chartHeight, palette: resolvedPalette }),
    [client, isDark, chartHeight, resolvedPalette],
  );

  return (
    <BonnardContext.Provider value={value}>
      <div className={isDark ? 'bonnard-dark' : 'bonnard-light'}>
        {children}
      </div>
    </BonnardContext.Provider>
  );
}
