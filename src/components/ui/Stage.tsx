import { getComponent } from "../../lib/registry";
import type { PropValues } from "../../lib/props";

interface StageProps {
  componentId: string;
  values: PropValues;
}

/** Renders a registered experiment component with the given prop values. */
export default function Stage({ componentId, values }: StageProps) {
  const Component = getComponent(componentId);
  if (!Component) return null;
  return <Component {...values} />;
}
