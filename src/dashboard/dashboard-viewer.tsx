import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useBonnard, BonnardContext } from '../context';
import { parseDashboard } from './parser';
import type { ParsedDashboard, DashboardSection, ComponentTag, SeriesType } from '../lib/types';
import { applyInputsToQuery, buildInitialInputsState } from '../lib/apply-inputs';
import type { InputsState, DateRangeInputState } from '../lib/apply-inputs';
import type { DateRangePreset } from '../lib/types';
import { getPresetRange } from '../lib/date-presets';
import { applyOverrides } from '../theme/resolve-theme';
import { themeToCssVars } from '../theme/theme-to-css-vars';
import { QueryLoad } from './query-load';
import {
  BigValue,
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  DataTable,
} from '../charts';
import { DateRangeInput } from './inputs/date-range-input';
import { DropdownInput } from './inputs/dropdown-input';

type QueryState = {
  data?: Record<string, unknown>[];
  loading: boolean;
  error?: string;
  limit?: number | null;
};

interface DashboardViewerProps {
  content: string;
  onInputsChange?: (params: URLSearchParams) => void;
  initialInputs?: Record<string, string>;
}

const GRID_COL_STYLES: Record<string, React.CSSProperties> = {
  '1': { gridTemplateColumns: '1fr' },
  '2': { gridTemplateColumns: 'repeat(2, 1fr)' },
  '3': { gridTemplateColumns: 'repeat(3, 1fr)' },
  '4': { gridTemplateColumns: 'repeat(4, 1fr)' },
  '5': { gridTemplateColumns: 'repeat(5, 1fr)' },
  '6': { gridTemplateColumns: 'repeat(6, 1fr)' },
};

/**
 * DashboardViewer — parses dashboard markdown and renders it.
 */
export function DashboardViewer({ content, onInputsChange, initialInputs }: DashboardViewerProps) {
  const { client, theme: outerTheme } = useBonnard();
  const [parsed, setParsed] = useState<ParsedDashboard | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [queryStates, setQueryStates] = useState<Map<string, QueryState>>(new Map());
  const [inputsState, setInputsState] = useState<InputsState>({});
  const isInitialRender = useRef(true);

  // Parse markdown on mount / content change
  useEffect(() => {
    try {
      const result = parseDashboard(content);
      setParsed(result);
      setParseError(null);
      const defaults = buildInitialInputsState(result.inputs);

      // Merge URL-provided initial values over defaults
      if (initialInputs) {
        for (const input of result.inputs) {
          const name = input.props.name;
          if (!name || !(name in initialInputs)) continue;
          const urlValue = initialInputs[name];

          if (input.type === 'DateRange') {
            try {
              const range = getPresetRange(urlValue as DateRangePreset);
              defaults[name] = { preset: urlValue as DateRangePreset, range };
            } catch { /* invalid preset, keep default */ }
          } else if (input.type === 'Dropdown') {
            defaults[name] = urlValue || null;
          }
        }
      }

      setInputsState(defaults);
      isInitialRender.current = true;
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse dashboard');
      setParsed(null);
    }
  }, [content, initialInputs]);

  // Execute queries using SDK client
  const executeQueries = useCallback(
    async (
      queries: Map<string, import('@bonnard/sdk').QueryOptions>,
      inputs: ComponentTag[],
      currentInputsState: InputsState,
      queryNames?: string[],
    ) => {
      const namesToExecute = queryNames ?? Array.from(queries.keys());

      setQueryStates((prev) => {
        const next = new Map(prev);
        for (const name of namesToExecute) {
          next.set(name, { loading: true });
        }
        return next;
      });

      await Promise.all(
        namesToExecute.map(async (name) => {
          const baseOptions = queries.get(name);
          if (!baseOptions) return;

          const options = applyInputsToQuery(name, baseOptions, inputs, currentInputsState);

          try {
            const result = await client.query(options);
            setQueryStates((prev) => {
              const next = new Map(prev);
              next.set(name, { loading: false, data: result.data as Record<string, unknown>[], limit: options.limit ?? null });
              return next;
            });
          } catch (err) {
            setQueryStates((prev) => {
              const next = new Map(prev);
              next.set(name, {
                loading: false,
                error: err instanceof Error ? err.message : 'Query failed',
              });
              return next;
            });
          }
        }),
      );
    },
    [client],
  );

  // Initial query execution when parsed
  useEffect(() => {
    if (parsed && parsed.queries.size > 0 && isInitialRender.current) {
      isInitialRender.current = false;
      executeQueries(parsed.queries, parsed.inputs, inputsState);
    }
  }, [parsed, inputsState, executeQueries]);

  // Handle input changes
  const handleInputChange = useCallback(
    (inputName: string, value: DateRangeInputState | string | null) => {
      if (!parsed) return;

      const next = { ...inputsState, [inputName]: value };
      setInputsState(next);

      const changedInput = parsed.inputs.find((i) => i.props.name === inputName);
      if (!changedInput) return;

      let affectedQueries: string[];

      if (changedInput.type === 'DateRange') {
        if (changedInput.props.queries) {
          affectedQueries = changedInput.props.queries.split(',').map((s) => s.trim());
        } else {
          affectedQueries = Array.from(parsed.queries.entries())
            .filter(([, opts]) => opts.timeDimension)
            .map(([name]) => name);
        }
      } else {
        affectedQueries = changedInput.props.queries
          ? changedInput.props.queries.split(',').map((s) => s.trim())
          : [];
      }

      if (affectedQueries.length > 0) {
        executeQueries(parsed.queries, parsed.inputs, next, affectedQueries);
      }

      if (onInputsChange) {
        const params = new URLSearchParams();
        for (const [key, val] of Object.entries(next)) {
          if (val == null) continue;
          if (typeof val === 'string') { if (val) params.set(key, val); }
          else if ('preset' in val) params.set(key, val.preset);
        }
        onInputsChange(params);
      }
    },
    [parsed, inputsState, executeQueries, onInputsChange],
  );

  if (parseError) {
    return (
      <div
        style={{
          borderRadius: 'var(--bon-radius)',
          border: '1px solid var(--bon-border-error)',
          backgroundColor: 'var(--bon-bg-error)',
          padding: 16,
        }}
      >
        <h3 style={{ fontWeight: 500, color: 'var(--bon-text-error)', marginBottom: 4, margin: 0 }}>
          Dashboard Parse Error
        </h3>
        <pre style={{ fontSize: 14, color: 'var(--bon-text-error)', whiteSpace: 'pre-wrap', margin: 0 }}>
          {parseError}
        </pre>
      </div>
    );
  }

  if (!parsed) return null;

  const groupedSections = groupConsecutiveBigValues(parsed.sections);

  return (
    <DashboardThemeWrapper
      outerTheme={outerTheme}
      client={client}
      frontmatterTheme={parsed.frontmatter.theme}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {parsed.inputs.length > 0 && (
          <InputsBar
            inputs={parsed.inputs}
            inputsState={inputsState}
            queryStates={queryStates}
            onInputChange={handleInputChange}
          />
        )}
        {groupedSections.map((section, i) => (
          <SectionRenderer key={i} section={section} queryStates={queryStates} />
        ))}
      </div>
    </DashboardThemeWrapper>
  );
}

/**
 * Wraps children in an inner BonnardContext with dashboard-level theme overrides
 * applied on top of the outer (provider-level) theme. If no frontmatter theme is
 * set, renders children directly without an extra provider.
 */
function DashboardThemeWrapper({
  outerTheme,
  client,
  frontmatterTheme,
  children,
}: {
  outerTheme: import('../theme/theme-types').BonnardTheme;
  client: ReturnType<typeof import('@bonnard/sdk').createClient>;
  frontmatterTheme?: import('../theme/theme-types').BonnardThemeOverride;
  children: React.ReactNode;
}) {
  const innerTheme = useMemo(() => {
    if (!frontmatterTheme) return outerTheme;
    return applyOverrides(outerTheme, frontmatterTheme);
  }, [outerTheme, frontmatterTheme]);

  const innerCssVars = useMemo(() => themeToCssVars(innerTheme), [innerTheme]);

  if (!frontmatterTheme) return <>{children}</>;

  return (
    <BonnardContext.Provider value={{ client, theme: innerTheme }}>
      <div style={{
        ...innerCssVars,
        backgroundColor: 'var(--bon-bg)',
        color: 'var(--bon-text)',
      }}>
        {children}
      </div>
    </BonnardContext.Provider>
  );
}

function InputsBar({
  inputs,
  inputsState,
  queryStates,
  onInputChange,
}: {
  inputs: ComponentTag[];
  inputsState: InputsState;
  queryStates: Map<string, QueryState>;
  onInputChange: (name: string, value: DateRangeInputState | string | null) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        gap: 16,
        borderRadius: 'var(--bon-radius)',
        backgroundColor: 'var(--bon-bg-muted)',
        padding: '12px 16px',
      }}
    >
      {inputs.map((input) => {
        const { type, props } = input;
        const name = props.name;
        if (!name) return null;

        if (type === 'DateRange') {
          const value = inputsState[name] as DateRangeInputState | undefined;
          if (!value) return null;
          return (
            <DateRangeInput
              key={name}
              name={name}
              label={props.label}
              value={value}
              onInputChange={onInputChange}
            />
          );
        }

        if (type === 'Dropdown') {
          const dataRef = props.data;
          const data = dataRef ? queryStates.get(dataRef)?.data ?? [] : [];
          return (
            <DropdownInput
              key={name}
              name={name}
              dimension={props.dimension}
              label={props.label}
              data={data}
              value={(inputsState[name] as string | null) ?? null}
              onInputChange={onInputChange}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

function groupConsecutiveBigValues(sections: DashboardSection[]): DashboardSection[] {
  const result: DashboardSection[] = [];
  let bigValueRun: DashboardSection[] = [];

  const flushRun = () => {
    if (bigValueRun.length > 1) {
      result.push({
        kind: 'grid',
        props: { cols: String(Math.min(bigValueRun.length, 4)) },
        children: bigValueRun,
      });
    } else if (bigValueRun.length === 1) {
      result.push(bigValueRun[0]);
    }
    bigValueRun = [];
  };

  for (const section of sections) {
    if (section.kind === 'component' && section.component.type === 'BigValue') {
      bigValueRun.push(section);
    } else {
      flushRun();
      result.push(section);
    }
  }

  flushRun();
  return result;
}

function SectionRenderer({
  section,
  queryStates,
}: {
  section: DashboardSection;
  queryStates: Map<string, QueryState>;
}) {
  if (section.kind === 'html') {
    // Content is sanitized with DOMPurify before rendering
    const sanitized = DOMPurify.sanitize(section.content);
    return (
      <div
        className="bon-prose"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  if (section.kind === 'grid') {
    const cols = section.props.cols || '2';
    const colStyle = GRID_COL_STYLES[cols] || GRID_COL_STYLES['2'];
    return (
      <div style={{ display: 'grid', gap: 16, ...colStyle }}>
        {section.children.map((child, i) => (
          <SectionRenderer key={i} section={child} queryStates={queryStates} />
        ))}
      </div>
    );
  }

  // Wrap chart/table components in a card for visual consistency
  const isBigValue = section.component.type === 'BigValue';
  const inner = <ComponentRenderer component={section.component} queryStates={queryStates} />;

  if (isBigValue) return inner;

  return (
    <div
      style={{
        borderRadius: 'var(--bon-radius, 8px)',
        border: '1px solid var(--bon-border)',
        backgroundColor: 'var(--bon-bg-card)',
        padding: 16,
      }}
    >
      {inner}
    </div>
  );
}

function ComponentRenderer({
  component,
  queryStates,
}: {
  component: ComponentTag;
  queryStates: Map<string, QueryState>;
}) {
  const { type, props } = component;
  const dataRef = props.data;

  if (!dataRef) {
    return (
      <div
        style={{
          borderRadius: 'var(--bon-radius)',
          border: '1px solid var(--bon-border-warn)',
          backgroundColor: 'var(--bon-bg-warn)',
          padding: 12,
          fontSize: 14,
          color: 'var(--bon-text-warn)',
        }}
      >
        Component &lt;{type}&gt; is missing a &quot;data&quot; prop
      </div>
    );
  }

  const qs = queryStates.get(dataRef);

  return (
    <QueryLoad
      data={qs?.data}
      loading={qs?.loading ?? true}
      error={qs?.error}
    >
      {(data) => {
        switch (type) {
          case 'BigValue':
            return (
              <BigValue
                data={data}
                value={props.value}
                title={props.title}
                fmt={props.fmt}
                comparison={props.comparison}
                comparisonFmt={props.comparisonFmt}
                comparisonTitle={props.comparisonTitle}
                downIsGood={props.downIsGood === 'true'}
              />
            );
          case 'BarChart':
            return (
              <BarChart
                data={data}
                x={props.x}
                y={props.y}
                title={props.title}
                horizontal={props.horizontal === 'true'}
                series={props.series}
                type={props.type as SeriesType}
                yFmt={props.yFmt}
                y2={props.y2}
                y2Fmt={props.y2Fmt}
                y2SeriesType={props.y2SeriesType as 'line' | 'bar' | 'area' | undefined}
              />
            );
          case 'LineChart':
            return (
              <LineChart
                data={data}
                x={props.x}
                y={props.y}
                title={props.title}
                series={props.series}
                type={props.type as SeriesType}
                yFmt={props.yFmt}
                y2={props.y2}
                y2Fmt={props.y2Fmt}
                y2SeriesType={props.y2SeriesType as 'line' | 'bar' | 'area' | undefined}
              />
            );
          case 'AreaChart':
            return (
              <AreaChart
                data={data}
                x={props.x}
                y={props.y}
                title={props.title}
                series={props.series}
                type={props.type as SeriesType}
                yFmt={props.yFmt}
                y2={props.y2}
                y2Fmt={props.y2Fmt}
                y2SeriesType={props.y2SeriesType as 'line' | 'bar' | 'area' | undefined}
              />
            );
          case 'PieChart':
            return (
              <PieChart
                data={data}
                name={props.name}
                value={props.value}
                title={props.title}
                fmt={props.fmt}
              />
            );
          case 'DataTable':
            return (
              <DataTable
                data={data}
                columns={props.columns ? props.columns.split(',').map((c: string) => c.trim()) : undefined}
                fmt={props.fmt}
                rows={props.rows === 'all' ? 'all' : props.rows ? Number(props.rows) : undefined}
                queryLimit={qs?.limit}
              />
            );
          default:
            return (
              <div
                style={{
                  borderRadius: 'var(--bon-radius)',
                  border: '1px solid var(--bon-border-warn)',
                  backgroundColor: 'var(--bon-bg-warn)',
                  padding: 12,
                  fontSize: 14,
                  color: 'var(--bon-text-warn)',
                }}
              >
                Unknown component: {type}
              </div>
            );
        }
      }}
    </QueryLoad>
  );
}
