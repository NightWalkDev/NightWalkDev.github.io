const THEME_COLORS = ['yellow', 'rust', 'green', 'cream', 'teal', 'panel'];

function readableTextOn(hex: string): string {
  const s = hex.replace('#', '');
  const full = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5 ? '#141110' : '#fff4de';
}

/** Resolves a theme color name or a hex value into a background and a readable text color. */
export function resolveColor(color: string | undefined, fallback = 'panel'): { bg: string; on: string } {
  const value = (color ?? fallback).trim();
  if (value.startsWith('#')) return { bg: value, on: readableTextOn(value) };
  const name = THEME_COLORS.includes(value) ? value : fallback;
  const cssName = name === 'panel' ? 'panel-color' : name;
  return { bg: `var(--${cssName})`, on: `var(--on-${cssName})` };
}
