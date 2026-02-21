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
  const options = Array.from(
    new Set(data.map((row) => String(row[dimension] ?? '')).filter(Boolean))
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
          width: 180,
          height: 32,
          fontSize: 14,
          padding: '0 8px',
          borderRadius: 'var(--bon-radius)',
          border: '1px solid var(--bon-input-border)',
          backgroundColor: 'var(--bon-input-bg)',
          color: 'var(--bon-text)',
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
