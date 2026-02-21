export interface BonnardTheme {
  isDark: boolean;
  palette: readonly string[];
  chartHeight: number;

  colors: {
    bg: string;
    bgMuted: string;
    bgCard: string;
    border: string;
    borderError: string;
    text: string;
    textMuted: string;
    textTitle: string;
    textLabel: string;
    textError: string;
    textWarn: string;
    bgError: string;
    bgWarn: string;
    borderWarn: string;
    shadow: string;
    radius: string;
    spinnerColor: string;
    tooltip: { bg: string; border: string; text: string; shadow: string };
    gridLine: string;
    legendText: string;
    table: { headerBg: string; hoverBg: string };
    input: { bg: string; border: string };
  };
}

export type BonnardThemeOverride = DeepPartial<Omit<BonnardTheme, 'isDark'>>;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (readonly string[] | string | number | boolean)
    ? T[P]
    : T[P] extends object ? DeepPartial<T[P]> : T[P];
};
