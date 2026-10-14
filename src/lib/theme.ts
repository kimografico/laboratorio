import { useEffect, useState } from "react";
import type { PropValues } from "./props";

export type Theme = "light" | "dark";

const THEME_BG: Record<Theme, string> = {
  dark: "#111113",
  light: "#e0dad5",
};

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseColor(input: string): RGBA | null {
  const value = input.trim();

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value);
  if (hex) {
    const h = hex[1];
    const part = (s: string) => parseInt(s, 16);
    if (h.length === 3 || h.length === 4) {
      return {
        r: part(h[0] + h[0]),
        g: part(h[1] + h[1]),
        b: part(h[2] + h[2]),
        a: h.length === 4 ? part(h[3] + h[3]) / 255 : 1,
      };
    }
    return {
      r: part(h.slice(0, 2)),
      g: part(h.slice(2, 4)),
      b: part(h.slice(4, 6)),
      a: h.length === 8 ? part(h.slice(6, 8)) / 255 : 1,
    };
  }

  const rgb = /^rgba?\(([^)]+)\)$/i.exec(value);
  if (rgb) {
    const parts = rgb[1]
      .split(/[,/\s]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length >= 3) {
      const r = Number(parts[0]);
      const g = Number(parts[1]);
      const b = Number(parts[2]);
      let a = 1;
      if (parts.length >= 4) {
        a = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : Number(parts[3]);
      }
      if ([r, g, b, a].every((n) => Number.isFinite(n))) return { r, g, b, a };
    }
  }

  return null;
}

function luminance({ r, g, b }: RGBA): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function toRgba({ r, g, b, a }: RGBA): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

/**
 * Keeps authored foreground colors that already fit the active theme and
 * inverts those designed for the opposite one (preserving alpha).
 */
function adaptForeground(value: string, theme: Theme): string {
  const color = parseColor(value);
  if (!color) return value;
  const targetsDarkTheme = luminance(color) > 0.5;
  if (targetsDarkTheme === (theme === "dark")) return value;
  return toRgba({ r: 255 - color.r, g: 255 - color.g, b: 255 - color.b, a: color.a });
}

/**
 * Returns a copy of the prop values where the given `themed` props follow the
 * active theme. `background` props adopt the theme canvas color; the rest are
 * treated as foreground strokes.
 */
export function applyTheme(values: PropValues, themed: string[], theme: Theme): PropValues {
  if (!themed.length) return values;
  const out: PropValues = { ...values };
  for (const name of themed) {
    const value = out[name];
    if (typeof value !== "string") continue;
    out[name] = name === "background" ? THEME_BG[theme] : adaptForeground(value, theme);
  }
  return out;
}

/** Tracks the active theme, reacting to the `light` class on <html>. */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
