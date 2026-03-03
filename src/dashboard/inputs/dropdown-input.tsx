const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`;

interface DropdownInputProps {
  name: string;
  dimension: string;
  label?: string;
  data: Record<string, unknown>[];
  value: string | null;
  onInputChange: (name: string, value: string | null) => void;
}

export function DropdownInput({
  name,
  dimension,
  label,
  data,
  value,
  onInputChange,
}: DropdownInputProps) {
  // Extract unique dimension values from data
  // Try exact key first, then fall back to suffix match for qualified names
  const resolvedKey = data.length > 0 && !(dimension in data[0])
    ? Object.keys(data[0]).find((k) => k.endsWith(`.${dimension}`)) ?? dimension
    : dimension;

  const options = Array.from(
    new Set(data.map((row) => String(row[resolvedKey] ?? '')).filter(Boolean))
  ).sort();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onInputChange(name, val === '' ? null : val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--bon-text-muted)' }}>
          {label}
        </label>
      )}
      <select
        value={value ?? ''}
        onChange={handleChange}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          width: 180,
          height: 32,
          fontSize: 14,
          padding: '0 28px 0 8px',
          borderRadius: 'var(--bon-radius)',
          border: '1px solid var(--bon-border)',
          backgroundColor: 'var(--bon-bg-card)',
          color: 'var(--bon-text)',
          backgroundImage: CHEVRON_SVG,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          cursor: 'pointer',
        }}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
