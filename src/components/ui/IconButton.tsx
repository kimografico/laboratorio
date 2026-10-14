import { ArrowRight, Check, Download, Heart, Plus, Search, type LucideIcon } from "lucide-react";

export interface IconButtonProps {
  icon?: "arrow-right" | "plus" | "check" | "download" | "search" | "heart";
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const ICONS: Record<string, LucideIcon> = {
  "arrow-right": ArrowRight,
  plus: Plus,
  check: Check,
  download: Download,
  search: Search,
  heart: Heart,
};

const SIZES: Record<NonNullable<IconButtonProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const ICON_SIZES: Record<NonNullable<IconButtonProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const VARIANTS: Record<NonNullable<IconButtonProps["variant"]>, string> = {
  solid: "bg-fg text-surface hover:bg-fg/90",
  outline: "border border-line-strong text-fg hover:border-fg/60 hover:bg-subtle",
  ghost: "text-muted hover:bg-subtle hover:text-fg",
};

export default function IconButton({
  icon = "arrow-right",
  variant = "solid",
  size = "md",
  shape = "circle",
  disabled = false,
  className,
  onClick,
}: IconButtonProps) {
  const Icon = ICONS[icon] ?? ArrowRight;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={icon}
      className={`inline-flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-40 ${shape === "circle" ? "rounded-full" : "rounded-xl"} ${SIZES[size]} ${VARIANTS[variant]} ${className ?? ""}`.trim()}
    >
      <Icon className={ICON_SIZES[size]} />
    </button>
  );
}
