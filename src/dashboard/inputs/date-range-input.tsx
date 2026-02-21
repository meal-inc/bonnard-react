import { PRESET_OPTIONS, getPresetRange } from '../../lib/date-presets';
import type { DateRangePreset } from '../../lib/types';
import type { DateRangeInputState } from '../../lib/apply-inputs';

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
        {PRESET_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
