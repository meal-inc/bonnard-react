import { useState, useEffect } from 'react';

/** @deprecated */
interface DashboardData {
  slug: string;
  title: string;
  description: string | null;
  content: string;
  version: number;
  created_at: string;
  updated_at: string;
}

/** @deprecated */
export interface UseDashboardResult {
  dashboard: DashboardData | undefined;
  loading: boolean;
  error: string | undefined;
}

/**
 * @deprecated The markdown dashboard system is deprecated and will be removed in a future version.
 * Use `bon dashboard deploy` to deploy HTML dashboards instead.
 */
export function useDashboard(_slug: string): UseDashboardResult {
  const [error] = useState<string>('useDashboard is deprecated. Use `bon dashboard deploy` for HTML dashboards.');

  useEffect(() => {
    console.warn('[Bonnard] useDashboard() is deprecated and no longer functional. Use `bon dashboard deploy` for HTML dashboards.');
  }, []);

  return { dashboard: undefined, loading: false, error };
}
