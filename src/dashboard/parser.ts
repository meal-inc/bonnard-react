import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit, SKIP } from 'unist-util-visit';
import yaml from 'yaml';
import type { QueryOptions } from '@bonnard/sdk';
import type { BonnardThemeOverride } from '../theme/theme-types';
import { PALETTES, type PaletteName } from '../theme/presets';
import type {
  ParsedDashboard,
  DashboardFrontmatter,
  DashboardSection,
  ComponentTag,
  ComponentType,
} from '../lib/types';

const VALID_QUERY_NAME = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

const VALID_COMPONENTS: Set<string> = new Set([
  'BigValue',
  'LineChart',
  'BarChart',
  'AreaChart',
  'DataTable',
  'PieChart',
  'DateRange',
  'Dropdown',
]);

/** Input component types that get hoisted into the inputs bar */
const INPUT_COMPONENTS: Set<string> = new Set(['DateRange', 'Dropdown']);

/**
 * Regex to match self-closing component tags:
 *   <BarChart data={name} x="field" y="field" />
 *
 * Captures: [1] component name, [2] attributes string
 */
const COMPONENT_TAG_RE =
  /<(BigValue|LineChart|BarChart|AreaChart|DataTable|PieChart|DateRange|Dropdown)\s+([\s\S]*?)\/>/g;

/**
 * Regex to match Grid wrapping tags:
 *   <Grid cols="3">...</Grid>
 *
 * Captures: [1] attributes string, [2] inner content
 */
const GRID_TAG_RE = /<Grid\s+([\s\S]*?)>([\s\S]*?)<\/Grid>/g;

/**
 * Regex to extract individual props from an attributes string.
 * Matches:
 *   data={name}     → key="data", value from group 2 (curly)
 *   x="field"       → key="x",    value from group 3 (double-quoted)
 *   x='field'       → key="x",    value from group 4 (single-quoted)
 *   horizontal      → key="horizontal", value undefined (boolean shorthand)
 */
const PROP_RE = /([\w$]+)(?:=\{([\w$]+)\}|="([^"]*)"|='([^']*)')?/g;

/**
 * Parse a dashboard markdown string into structured output.
 *
 * Collects all validation errors and reports them together rather than
 * failing on the first error (pattern from Evidence.dev).
 */
export function parseDashboard(markdown: string): ParsedDashboard {
  const errors: string[] = [];

  // 1. Extract frontmatter
  const { data: rawFrontmatter, content: bodyWithoutFrontmatter } = matter(markdown);

  // Resolve theme override from frontmatter
  let themeOverride: BonnardThemeOverride | undefined;
  if (rawFrontmatter.theme && typeof rawFrontmatter.theme === 'object') {
    themeOverride = { ...rawFrontmatter.theme } as BonnardThemeOverride;
    // Resolve named palette strings to arrays
    if (typeof themeOverride.palette === 'string') {
      const name = themeOverride.palette as PaletteName;
      themeOverride.palette = PALETTES[name] ?? undefined;
    }
  }

  const frontmatter: DashboardFrontmatter = {
    title: typeof rawFrontmatter.title === 'string' ? rawFrontmatter.title : 'Untitled Dashboard',
    description: typeof rawFrontmatter.description === 'string' ? rawFrontmatter.description : undefined,
    theme: themeOverride,
  };

  // 2. Parse markdown AST to extract query blocks
  const queries = new Map<string, QueryOptions>();
  const tree = unified().use(remarkParse).parse(bodyWithoutFrontmatter);

  // Collect query node indices to remove after traversal (safer than splicing during visit)
  const nodesToRemove: Array<{ parent: { children: unknown[] }; index: number }> = [];

  // Walk AST to find code blocks with lang "query"
  // Remark parses ```query my_name as lang="query", meta="my_name"
  visit(tree, 'code', (node: { lang?: string | null; meta?: string | null; value: string }, index, parent) => {
    if (node.lang !== 'query') return;

    const name = node.meta?.trim();
    if (!name) {
      errors.push('Query block must have a name: ```query my_query_name');
      return;
    }

    if (!VALID_QUERY_NAME.test(name)) {
      errors.push(`Invalid query name "${name}": must be a valid identifier (letters, numbers, _, $)`);
      return;
    }

    if (queries.has(name)) {
      errors.push(`Duplicate query name "${name}"`);
      return;
    }

    // Parse YAML body as QueryOptions
    try {
      const options = yaml.parse(node.value) as QueryOptions;
      if (!options || (!options.measures && !options.dimensions)) {
        errors.push(`Query "${name}" must specify measures or dimensions`);
        return;
      }
      queries.set(name, options);
    } catch (e) {
      errors.push(`Query "${name}" has invalid YAML: ${e instanceof Error ? e.message : String(e)}`);
      return;
    }

    // Mark for removal from AST
    if (parent && typeof index === 'number') {
      nodesToRemove.push({ parent: parent as { children: unknown[] }, index });
    }

    return SKIP;
  });

  // Remove query nodes in reverse order to avoid index shifting
  for (let i = nodesToRemove.length - 1; i >= 0; i--) {
    const { parent, index } = nodesToRemove[i];
    parent.children.splice(index, 1);
  }

  // Report all errors together
  if (errors.length > 0) {
    throw new Error(`Dashboard parse errors:\n- ${errors.join('\n- ')}`);
  }

  // 3. Convert remaining AST to HTML
  const htmlResult = unified()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .stringify(
      unified()
        .use(remarkRehype, { allowDangerousHtml: true })
        .runSync(tree)
    );

  const html = String(htmlResult);

  // 4. Split HTML into sections: alternating HTML content, component tags, and grid layouts
  const { sections, inputs } = splitIntoSections(html);

  return { frontmatter, queries, inputs, sections };
}

/**
 * Split HTML string into sections of HTML content, component tags, and grid layouts.
 * Input components (DateRange, Dropdown) are hoisted into a separate inputs array.
 */
function splitIntoSections(html: string): { sections: DashboardSection[]; inputs: ComponentTag[] } {
  const sections: DashboardSection[] = [];
  const inputs: ComponentTag[] = [];
  let lastIndex = 0;

  // Combined regex: match Grid wrapping tags OR self-closing component tags (including inputs)
  const COMBINED_RE = /<Grid\s+([\s\S]*?)>([\s\S]*?)<\/Grid>|<(BigValue|LineChart|BarChart|AreaChart|DataTable|PieChart|DateRange|Dropdown)\s+([\s\S]*?)\/>/g;
  COMBINED_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = COMBINED_RE.exec(html)) !== null) {
    // Add any HTML content before this match
    const before = html.slice(lastIndex, match.index).trim();
    if (before) {
      sections.push({ kind: 'html', content: before });
    }

    if (match[1] !== undefined) {
      // Grid match: [1] = attrs, [2] = inner content
      const props = parseProps(match[1]);
      const inner = splitIntoSections(match[2]);
      inputs.push(...inner.inputs);
      sections.push({ kind: 'grid', props, children: inner.sections });
    } else {
      // Component match: [3] = name, [4] = attrs
      const component = parseComponentTag(match[3], match[4]);
      if (component) {
        if (INPUT_COMPONENTS.has(component.type)) {
          inputs.push(component);
        } else {
          sections.push({ kind: 'component', component });
        }
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining HTML content after the last match
  const remaining = html.slice(lastIndex).trim();
  if (remaining) {
    sections.push({ kind: 'html', content: remaining });
  }

  return { sections, inputs };
}

/**
 * Parse an attributes string into a props Record.
 */
function parseProps(attrsString: string): Record<string, string> {
  const props: Record<string, string> = {};
  PROP_RE.lastIndex = 0;

  let propMatch: RegExpExecArray | null;
  while ((propMatch = PROP_RE.exec(attrsString)) !== null) {
    const key = propMatch[1];
    const value = propMatch[2] ?? propMatch[3] ?? propMatch[4] ?? 'true';
    props[key] = value;
  }

  return props;
}

/**
 * Parse component attributes string into a ComponentTag.
 */
function parseComponentTag(name: string, attrsString: string): ComponentTag | null {
  if (!VALID_COMPONENTS.has(name)) return null;
  const props = parseProps(attrsString);
  return { type: name as ComponentType, props };
}
