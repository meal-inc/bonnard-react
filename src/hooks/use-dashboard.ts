import { useState, useEffect } from 'react';
import { useBonnard } from '../context';
import type { DashboardResult } from '@bonnard/sdk';

export interface UseDashboardResult {
  dashboard: DashboardResult['dashboard'] | undefined;
  loading: boolean;
  error: string | undefined;
}

export function useDashboard(slug: string): UseDashboardResult {
  const { client } = useBonnard();
  const [dashboard, setDashboard] = useState<DashboardResult['dashboard'] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);

    client.getDashboard(slug).then(
      (result) => {
        if (!cancelled) {
          setDashboard(result.dashboard);
          setLoading(false);
        }
      },
      (err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard');
          setLoading(false);
        }
      },
    );

    return () => { cancelled = true; };
  }, [client, slug]);

  return { dashboard, loading, error };
}
