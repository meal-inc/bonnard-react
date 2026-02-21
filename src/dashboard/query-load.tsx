import { ReactNode } from 'react';

interface QueryLoadProps {
  data: Record<string, unknown>[] | undefined;
  loading: boolean;
  error: string | undefined;
  children: (data: Record<string, unknown>[]) => ReactNode;
}

/**
 * QueryLoad — wraps chart components to handle loading / error / empty states.
 */
export function QueryLoad({ data, loading, error, children }: QueryLoadProps) {
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 200,
          fontSize: 14,
          color: 'var(--bon-text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '2px solid var(--bon-spinner-color)',
              borderTopColor: 'transparent',
              animation: 'bonnard-spin 0.6s linear infinite',
            }}
          />
          Loading data…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          borderRadius: 'var(--bon-radius)',
          border: '1px solid var(--bon-border-error)',
          backgroundColor: 'var(--bon-bg-error)',
          padding: 16,
          fontSize: 14,
          color: 'var(--bon-text-error)',
        }}
      >
        Query error: {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 200,
          fontSize: 14,
          color: 'var(--bon-text-muted)',
        }}
      >
        No data available
      </div>
    );
  }

  return <>{children(data)}</>;
}
