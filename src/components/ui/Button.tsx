import type { CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  Heart,
  Maximize2,
  Minimize2,
  Plus,
  RotateCcw,
  Search,
  type LucideIcon,
} from "lucide-react";

type Size = "xs" | "sm" | "md" | "lg";
type Variant = "solid" | "outline" | "ghost";
type IconName =
  | "none"
  | "arrow-left"
  | "arrow-right"
  | "plus"
  | "check"
  | "download"
  | "search"
  | "heart"
  | "rotate-ccw"
  | "maximize"
  | "minimize"
  | "copy";

export interface ButtonProps {
  /** Texto del botón (ignorado en modo solo icono) */
  label?: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconPosition?: "left" | "right";
  /** Renderiza solo el icono, sin texto */
  iconOnly?: boolean;
  /** Forma del botón (borde redondeado, pill o cuadrado) */
  shape?: "circle" | "rounded" | "squared";
  /** Distintivo numérico o de texto que se muestra junto a la etiqueta */
  badge?: string | number;
  fullWidth?: boolean;
  /** Color personalizado (hex). Vacío = usa los tokens del tema */
  color?: string;
  disabled?: boolean;
  className?: string;
  /** Si se define, el botón se renderiza como enlace (`<a>`) */
  href?: string;
  onClick?: () => void;
}

const ICONS: Record<string, LucideIcon> = {
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  plus: Plus,
  check: Check,
  download: Download,
  search: Search,
  heart: Heart,
  "rotate-ccw": RotateCcw,
  maximize: Maximize2,
  minimize: Minimize2,
  copy: Copy,
};

const TEXT_SIZE: Record<Size, string> = {
  xs: "gap-1 text-xs [--pad-x:0.625rem] [--pad-y:0.375rem]",
  sm: "gap-1.5 text-xs [--pad-x:0.75rem] [--pad-y:0.5rem]",
  md: "gap-2 text-sm [--pad-x:1rem] [--pad-y:0.625rem]",
  lg: "gap-2.5 text-base [--pad-x:1.5rem] [--pad-y:0.75rem]",
};

const ICON_BOX: Record<Size, string> = {
  xs: "[--pad-x:0.4375rem] [--pad-y:0.4375rem]",
  sm: "[--pad-x:0.5rem] [--pad-y:0.5rem]",
  md: "[--pad-x:0.625rem] [--pad-y:0.625rem]",
  lg: "[--pad-x:0.75rem] [--pad-y:0.75rem]",
};

const GLYPH_TEXT: Record<Size, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const GLYPH_ICON: Record<Size, string> = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const THEMED_VARIANTS: Record<Variant, string> = {
  solid: "bg-fg text-surface enabled:hover:bg-fg/90",
  outline: "border border-line-strong text-fg enabled:hover:border-fg/60 enabled:hover:bg-subtle",
  ghost: "text-muted enabled:hover:bg-subtle enabled:hover:text-fg",
};

const CUSTOM_VARIANTS: Record<Variant, string> = {
  solid:
    "bg-[color:var(--btn)] text-[color:var(--btn-on)] enabled:hover:bg-[color:var(--btn-hover)]",
  outline:
    "border border-[color:var(--btn-border)] text-[color:var(--btn)] enabled:hover:border-[color:var(--btn)] enabled:hover:bg-[color:var(--btn-soft)]",
  ghost: "text-[color:var(--btn)] enabled:hover:bg-[color:var(--btn-soft)]",
};

const BADGE: Record<Variant, string> = {
  solid: "bg-surface/20 text-surface/70",
  outline: "bg-subtle-strong text-faint",
  ghost: "bg-subtle-strong text-faint",
};

const CUSTOM_BADGE: Record<Variant, string> = {
  solid: "bg-[color:var(--btn-on)]/20 text-[color:var(--btn-on)]/70",
  outline: "bg-[color:var(--btn-soft)] text-[color:var(--btn)]",
  ghost: "bg-[color:var(--btn-soft)] text-[color:var(--btn)]",
};

const RADIUS: Record<NonNullable<ButtonProps["shape"]>, string> = {
  circle: "rounded-full",
  rounded: "rounded-xl",
  squared: "rounded-none",
};

function parseHex(input: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgba({ r, g, b }: { r: number; g: number; b: number }, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function Button({
  label = "Botón",
  variant = "solid",
  size = "md",
  icon = "none",
  iconPosition = "right",
  iconOnly = false,
  shape = "circle",
  badge,
  fullWidth = false,
  color = "",
  disabled = false,
  className,
  href,
  onClick,
}: ButtonProps) {
  const rgb = parseHex(color);
  const custom = !!rgb;

  const Icon = ICONS[icon] ?? (iconOnly ? ArrowRight : null);
  const glyph = iconOnly ? GLYPH_ICON[size] : GLYPH_TEXT[size];

  const style: CSSProperties =
    custom ?
      ({
        "--btn": color,
        "--btn-hover": rgba(rgb, 0.85),
        "--btn-soft": rgba(rgb, 0.12),
        "--btn-border": rgba(rgb, 0.5),
        "--btn-on": 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b > 140 ? "#0b0b0c" : "#ffffff",
      } as CSSProperties)
    : {};

  const variantClass = custom ? CUSTOM_VARIANTS[variant] : THEMED_VARIANTS[variant];
  const radius = RADIUS[shape];
  const sizing = iconOnly ? ICON_BOX[size] : TEXT_SIZE[size];
  const interaction =
    "px-[var(--pad-x)] py-[var(--pad-y)] " +
    "enabled:active:px-[calc(var(--pad-x)_-_1px)] enabled:active:py-[calc(var(--pad-y)_-_1px)] enabled:active:m-[1px]";

  const baseClasses = [
    "inline-flex items-center justify-center font-medium transition",
    radius,
    sizing,
    fullWidth ? "w-full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const badgeNode =
    badge !== undefined && badge !== null && badge !== "" ? (
      <span
        className={`rounded-full px-1.5 text-xs ${custom ? CUSTOM_BADGE[variant] : BADGE[variant]}`}
      >
        {badge}
      </span>
    ) : null;

  const content =
    iconOnly ?
      Icon && <Icon className={glyph} />
    : <>
        {Icon && iconPosition === "left" && <Icon className={glyph} />}
        <span>{label}</span>
        {badgeNode}
        {Icon && iconPosition === "right" && <Icon className={glyph} />}
      </>;

  if (href !== undefined && !disabled) {
    const linkHover = variantClass.split("enabled:").join("");
    const linkInteraction = interaction.split("enabled:").join("");
    return (
      <a
        href={href}
        aria-label={iconOnly ? label || icon : undefined}
        style={style}
        className={[baseClasses, linkInteraction, linkHover].filter(Boolean).join(" ")}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={iconOnly ? label || icon : undefined}
      style={style}
      className={[
        baseClasses,
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:transition-none",
        interaction,
        variantClass,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {content}
    </button>
  );
}
