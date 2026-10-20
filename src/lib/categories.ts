export const EXPERIMENT_CATEGORIES = [
  "pendiente",
  "geometria",
  "matematica",
  "naturaleza",
  "simulacion",
  "texts",
] as const;

export type ExperimentCategory = (typeof EXPERIMENT_CATEGORIES)[number];

export const BACKGROUND_CATEGORIES = [
  "geometria",
  "matematica",
  "naturaleza",
  "simulacion",
] as const;

export const CATEGORY_LABELS: Record<ExperimentCategory, string> = {
  pendiente: "Pendientes",
  geometria: "Geometría",
  matematica: "Matemáticas",
  naturaleza: "Naturaleza",
  simulacion: "Simulación",
  texts: "Textos",
};

export function isBackgroundCategory(category: string): boolean {
  return (BACKGROUND_CATEGORIES as readonly string[]).includes(category);
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category as ExperimentCategory] ?? category;
}
