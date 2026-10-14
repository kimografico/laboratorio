import { useMemo } from "react";
import { getComponent } from "../../lib/registry";
import type { PropValues } from "../../lib/props";
import { applyTheme, useTheme } from "../../lib/theme";

interface StageProps {
  componentId: string;
  values: PropValues;
  /** Prop names that should follow the active light/dark theme. */
  themed?: string[];
}

/** Renders a registered experiment component with the given prop values. */
export default function Stage({ componentId, values, themed = [] }: StageProps) {
  const theme = useTheme();
  const Component = getComponent(componentId);
  const resolved = useMemo(() => applyTheme(values, themed, theme), [values, themed, theme]);
  if (!Component) return null;
  return <Component key={theme} {...resolved} />;
}
