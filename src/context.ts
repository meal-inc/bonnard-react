import { createContext, useContext } from 'react';
import type { createClient } from '@bonnard/sdk';

export interface BonnardContextValue {
  client: ReturnType<typeof createClient>;
  isDark: boolean;
  chartHeight: number;
  palette: readonly string[];
}

export const BonnardContext = createContext<BonnardContextValue | null>(null);

export function useBonnard(): BonnardContextValue {
  const ctx = useContext(BonnardContext);
  if (!ctx) {
    throw new Error('useBonnard() must be used within a <BonnardProvider>');
  }
  return ctx;
}
