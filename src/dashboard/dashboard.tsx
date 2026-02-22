import { useDashboard } from '../hooks/use-dashboard';
import { DashboardViewer } from './dashboard-viewer';

export interface DashboardProps {
  slug?: string;
  content?: string;
  onInputsChange?: (params: URLSearchParams) => void;
  initialInputs?: Record<string, string>;
  className?: string;
}

export function Dashboard({ slug, content, onInputsChange, initialInputs, className }: DashboardProps) {
  if (content) {
    return (
      <div className={className}>
        <DashboardViewer content={content} onInputsChange={onInputsChange} initialInputs={initialInputs} />
      </div>
    );
  }

  if (slug) {
    return <DashboardFromSlug slug={slug} onInputsChange={onInputsChange} initialInputs={initialInputs} className={className} />;
  }

  return null;
}

function DashboardFromSlug({
  slug,
  onInputsChange,
  initialInputs,
  className,
}: {
  slug: string;
  onInputsChange?: (params: URLSearchParams) => void;
  initialInputs?: Record<string, string>;
  className?: string;
}) {
  const { dashboard, loading, error } = useDashboard(slug);

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
          Loading dashboard…
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
        Failed to load dashboard: {error}
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className={className}>
      <DashboardViewer content={dashboard.content} onInputsChange={onInputsChange} initialInputs={initialInputs} />
    </div>
  );
}
