import type { QueryOptions, Filter } from '@bonnard/sdk';
import type { ComponentTag, DateRangePreset } from './types';
import { getPresetRange } from './date-presets';

export interface DateRangeInputState {
  preset: DateRangePreset;
  range: [string, string];
}

export type InputsState = Record<string, DateRangeInputState | string | null>;

/**
 * Apply all active inputs to a single query's options.
 *
 * - DateRange: overrides timeDimension.dateRange on targeted queries
 * - Dropdown: adds/replaces a filter on the specified dimension
 */
export function applyInputsToQuery(
  queryName: string,
  baseOptions: QueryOptions,
  inputTags: ComponentTag[],
  inputsState: InputsState,
): QueryOptions {
  let options = structuredClone(baseOptions);

  for (const input of inputTags) {
    const { type, props } = input;
    const inputName = props.name;
    if (!inputName) continue;

    const state = inputsState[inputName];
    if (state === undefined) continue;

    if (type === 'DateRange') {
      options = applyDateRange(queryName, options, props, state as DateRangeInputState | null);
    } else if (type === 'Dropdown') {
      options = applyDropdown(queryName, options, props, state as string | null);
    }
  }

  return options;
}

function applyDateRange(
  queryName: string,
  options: QueryOptions,
  props: Record<string, string>,
  state: DateRangeInputState | null,
): QueryOptions {
  // Only apply to queries that have a timeDimension
  if (!options.timeDimension) return options;

  // Check targeting: if queries prop specified, only apply to listed queries
  if (props.queries) {
    const targets = props.queries.split(',').map((s) => s.trim());
    if (!targets.includes(queryName)) return options;
  }

  if (!state) return options;

  options.timeDimension = {
    ...options.timeDimension,
    dateRange: state.range,
  };

  return options;
}

/**
 * Extract the short field name from a potentially qualified name.
 * "sales_invoices.status" → "status", "status" → "status"
 */
function shortFieldName(name: string): string {
  const dot = name.indexOf('.');
  return dot >= 0 ? name.slice(dot + 1) : name;
}

/**
 * Resolve a filter dimension for a target query.
 *
 * The Dropdown `dimension` prop is qualified with the data query's view
 * (e.g. "sales_opportunities.assignee"). When the filter targets a query
 * from a different view, we re-qualify the dimension with that view's prefix.
 */
function resolveFilterDimension(dimension: string, targetQuery: QueryOptions): string {
  const field = shortFieldName(dimension);

  const allFields = [
    ...(targetQuery.measures || []),
    ...(targetQuery.dimensions || []),
  ];

  if (allFields.length === 0) return dimension;

  // Prefer an exact match by short name — handles cross-view queries correctly
  const match = allFields.find((f) => shortFieldName(f) === field);
  if (match) return match;

  // Fall back to first field's view prefix
  const firstDot = allFields[0].indexOf('.');
  if (firstDot < 0) return dimension;

  const viewPrefix = allFields[0].slice(0, firstDot);
  return `${viewPrefix}.${field}`;
}

function applyDropdown(
  queryName: string,
  options: QueryOptions,
  props: Record<string, string>,
  state: string | null,
): QueryOptions {
  const dimension = props.dimension;
  if (!dimension) return options;

  // Dropdown requires explicit queries prop
  if (!props.queries) return options;

  const targets = props.queries.split(',').map((s) => s.trim());

  // Never filter the dropdown's own data source query (prevents circular dep)
  const dataQuery = props.data;
  if (dataQuery && dataQuery === queryName) return options;

  if (!targets.includes(queryName)) return options;

  const resolved = resolveFilterDimension(dimension, options);
  const field = shortFieldName(dimension);

  // "All" (null) means remove any existing filter on this dimension
  if (state === null || state === '') {
    if (options.filters) {
      options.filters = options.filters.filter((f) => shortFieldName(f.dimension) !== field);
      if (options.filters.length === 0) delete options.filters;
    }
    return options;
  }

  // Add or replace the filter
  const newFilter: Filter = {
    dimension: resolved,
    operator: 'equals',
    values: [state],
  };

  if (!options.filters) {
    options.filters = [newFilter];
  } else {
    const idx = options.filters.findIndex((f) => shortFieldName(f.dimension) === field);
    if (idx >= 0) {
      options.filters[idx] = newFilter;
    } else {
      options.filters.push(newFilter);
    }
  }

  return options;
}

/**
 * Build the initial inputsState from input tags (using their defaults).
 */
export function buildInitialInputsState(inputs: ComponentTag[]): InputsState {
  const state: InputsState = {};

  for (const input of inputs) {
    const { type, props } = input;
    const name = props.name;
    if (!name) continue;

    if (type === 'DateRange') {
      const rawPreset = props.default || 'last-6-months';
      let preset: DateRangePreset;
      try {
        preset = rawPreset as DateRangePreset;
        getPresetRange(preset); // validate
      } catch {
        console.warn(`[Bonnard] Unknown date preset "${rawPreset}", falling back to "last-6-months"`);
        preset = 'last-6-months';
      }
      state[name] = { preset, range: getPresetRange(preset) };
    } else if (type === 'Dropdown') {
      // Default to null ("All") unless a default is specified
      state[name] = props.default || null;
    }
  }

  return state;
}
