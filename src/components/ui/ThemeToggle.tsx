import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Size = "xs" | "sm" | "md" | "lg";
type Shape = "circle" | "rounded" | "squared";

interface ThemeToggleProps {
  size?: Size;
  variant?: "toggle" | "solid" | "mini" | "solid-mini";
  /** Forma del botón en los modos mini */
  shape?: Shape;
  /** Si es true, cambia el tema del sitio. Por defecto es solo visual (galería). */
  interactive?: boolean;
}

const TRACK: Record<Size, { box: string; knob: string; on: string; icon: string; pad: string }> = {
  xs: { box: "h-6 w-12", knob: "h-4 w-4", on: "translate-x-6", icon: "h-3 w-3", pad: "px-1" },
  sm: { box: "h-7 w-14", knob: "h-5 w-5", on: "translate-x-7", icon: "h-3.5 w-3.5", pad: "px-1.5" },
  md: { box: "h-9 w-[4.5rem]", knob: "h-7 w-7", on: "translate-x-[2.25rem]", icon: "h-4 w-4", pad: "px-2" },
  lg: { box: "h-11 w-20", knob: "h-9 w-9", on: "translate-x-9", icon: "h-5 w-5", pad: "px-2.5" },
};

const MINI: Record<Size, { box: string; icon: string }> = {
  xs: { box: "h-6 w-6", icon: "h-3.5 w-3.5" },
  sm: { box: "h-8 w-8", icon: "h-4 w-4" },
  md: { box: "h-10 w-10", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12", icon: "h-6 w-6" },
};

const RADIUS: Record<Shape, string> = {
  circle: "rounded-full",
  rounded: "rounded-xl",
  squared: "rounded-none",
};

export default function ThemeToggle({
  size = "md",
  variant = "toggle",
  shape = "circle",
  interactive = false,
}: ThemeToggleProps) {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    if (!interactive) return;
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {}
  };

  const filled = variant === "solid" || variant === "solid-mini";
  const fill = filled ? "currentColor" : "none";

  if (variant === "mini" || variant === "solid-mini") {
    const s = MINI[size];
    return (
      <button
        type="button"
        aria-label="Cambiar tema claro/oscuro"
        onClick={toggle}
        className={`inline-flex items-center justify-center ${RADIUS[shape]} border border-line-strong bg-subtle-strong text-fg transition-colors hover:border-fg/40 ${s.box}`}
      >
        {light ? (
          <Sun className={s.icon} fill={fill} />
        ) : (
          <Moon className={s.icon} fill={fill} />
        )}
      </button>
    );
  }

  const s = TRACK[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!light}
      aria-label="Cambiar tema claro/oscuro"
      onClick={toggle}
      className={`relative inline-flex items-center rounded-full border border-line-strong bg-subtle-strong transition-colors hover:border-fg/40 ${s.box}`}
    >
      <span
        className={`pointer-events-none absolute inset-0 flex items-center justify-between text-faint ${s.pad}`}
      >
        <Sun className={s.icon} fill={fill} />
        <Moon className={s.icon} fill={fill} />
      </span>
      <span
        className={`absolute left-1 grid place-items-center rounded-full bg-fg text-surface shadow transition-transform duration-300 ${s.knob} ${
          light ? "translate-x-0" : s.on
        }`}
      >
        {light ? (
          <Sun className={s.icon} fill={fill} />
        ) : (
          <Moon className={s.icon} fill={fill} />
        )}
      </span>
    </button>
  );
}
