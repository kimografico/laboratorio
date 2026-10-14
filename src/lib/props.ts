export type PropType =
  | "number"
  | "color"
  | "text"
  | "boolean"
  | "colors"
  | "select";

export interface PropDef {
  name: string;
  label?: string;
  type: PropType;
  default?: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export type PropValues = Record<string, unknown>;

export function defaultsFromProps(props: PropDef[]): PropValues {
  const values: PropValues = {};
  for (const p of props) {
    values[p.name] = p.default ?? (p.type === "boolean" ? false : p.type === "number" ? 0 : "");
  }
  return values;
}
