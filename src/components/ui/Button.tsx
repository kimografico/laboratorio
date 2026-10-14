import { ArrowRight, Check, Download, Plus, type LucideIcon } from "lucide-react";

export interface ButtonProps {
  /** Texto del botón */
  label?: string;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: "none" | "arrow-right" | "plus" | "check" | "download";
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const ICONS: Record<string, LucideIcon> = {
  "arrow-right": ArrowRight,
  plus: Plus,
  check: Check,
  download: Download,
};

const SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2.5 px-6 text-base",
};

const ICON_SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  solid: "bg-fg text-surface hover:bg-fg/90",
  outline: "border border-line-strong text-fg hover:border-fg/60 hover:bg-subtle",
  ghost: "text-muted hover:bg-subtle hover:text-fg",
};

export default function Button({
  label = "Botón",
  variant = "solid",
  size = "md",
  icon = "none",
  iconPosition = "right",
  fullWidth = false,
  disabled = false,
  className,
  onClick,
}: ButtonProps) {
  const Icon = icon !== "none" ? ICONS[icon] : null;
  const iconClass = ICON_SIZES[size];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${SIZES[size]} ${VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className ?? ""}`.trim()}
    >
      {Icon && iconPosition === "left" && <Icon className={iconClass} />}
      <span>{label}</span>
      {Icon && iconPosition === "right" && <Icon className={iconClass} />}
    </button>
  );
}
