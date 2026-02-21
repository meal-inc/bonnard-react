import React, { useMemo, useEffect, useState } from 'react';
import { createClient, type BonnardConfig } from '@bonnard/sdk';
import { BonnardContext } from './context';
import type { BonnardThemeOverride } from './theme/theme-types';
import { resolveTheme } from './theme/resolve-theme';
import { themeToCssVars } from './theme/theme-to-css-vars';

export interface BonnardProviderProps {
  children: React.ReactNode;
  config: BonnardConfig;
  darkMode?: boolean | 'auto';
  /** Org-level theme overrides (from organization settings) */
  orgTheme?: BonnardThemeOverride | null;
  /** Dashboard-level theme overrides */
  dashboardTheme?: BonnardThemeOverride | null;
  /** Convenience shorthand for additional overrides (applied last) */
  theme?: BonnardThemeOverride | null;
}

export function BonnardProvider({
  children,
  config,
  darkMode = 'auto',
  orgTheme,
  dashboardTheme,
  theme,
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

  const resolvedTheme = useMemo(
    () => resolveTheme(isDark, orgTheme, dashboardTheme, theme),
    [isDark, orgTheme, dashboardTheme, theme],
  );

  const cssVars = useMemo(() => themeToCssVars(resolvedTheme), [resolvedTheme]);

  const value = useMemo(
    () => ({ client, theme: resolvedTheme }),
    [client, resolvedTheme],
  );

  return (
    <BonnardContext.Provider value={value}>
      <div style={{
        ...cssVars,
        backgroundColor: 'var(--bon-bg)',
        color: 'var(--bon-text)',
        colorScheme: isDark ? 'dark' : 'light',
        minHeight: '100%',
      }}>
        {children}
      </div>
    </BonnardContext.Provider>
  );
}
