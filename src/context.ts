import { createContext, useContext } from 'react';
import type { createClient } from '@bonnard/sdk';
import type { BonnardTheme } from './theme/theme-types';

export interface BonnardContextValue {
  client: ReturnType<typeof createClient>;
  theme: BonnardTheme;
}

export const BonnardContext = createContext<BonnardContextValue | null>(null);

export function useBonnard(): BonnardContextValue {
  const ctx = useContext(BonnardContext);
  if (!ctx) {
    throw new Error('useBonnard() must be used within a <BonnardProvider>');
  }
  return ctx;
}
