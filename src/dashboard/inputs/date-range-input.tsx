import { PRESET_OPTIONS, getPresetRange } from '../../lib/date-presets';
import type { DateRangePreset } from '../../lib/types';
import type { DateRangeInputState } from '../../lib/apply-inputs';

const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`;

interface DateRangeInputProps {
  name: string;
  label?: string;
  value: DateRangeInputState;
  onInputChange: (name: string, value: DateRangeInputState) => void;
}

export function DateRangeInput({ name, label, value, onInputChange }: DateRangeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value as DateRangePreset;
    const range = getPresetRange(preset);
    onInputChange(name, { preset, range });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--bon-text-muted)' }}>
          {label}
        </label>
      )}
      <select
        value={value.preset}
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
        {PRESET_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
