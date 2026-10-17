import { useState, useSyncExternalStore } from "react";
import type { PropValues } from "./props";

/** Frases de ejemplo para los experimentos de texto. */
export const PHRASES: string[] = [
  "Construye héroes que reaccionan",
  "Dale vida a tus interfaces",
  "Detalles que dejan huella",
  "Movimiento con propósito",
  "Diseño que se siente vivo",
  "Cada píxel cuenta",
];

/** Clave de localStorage donde se guarda el texto compartido (override global). */
export const TEXT_STORAGE_KEY = "laboratorio:text";

/** Devuelve el texto guardado por el usuario, o `null` si no hay override. */
export function getSharedText(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(TEXT_STORAGE_KEY);
    return value && value.trim() ? value : null;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();

/** Suscripción al texto compartido (mismo tab + evento `storage` de otros tabs). */
export function subscribeSharedText(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * Guarda el texto compartido. Un valor vacío elimina el override y vuelve a
 * dejar que cada card use una frase al azar de `PHRASES`.
 */
export function setSharedText(value: string): void {
  if (typeof window === "undefined") return;
  try {
    if (value.trim()) window.localStorage.setItem(TEXT_STORAGE_KEY, value);
    else window.localStorage.removeItem(TEXT_STORAGE_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
  for (const listener of listeners) listener();
}

// Baraja por ciclos: reparte las frases sin repetir hasta agotarlas y rebaraja.
let deck: string[] = [];
let deckIndex = 0;

function shuffled<T>(items: T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Siguiente frase al azar, evitando repetir dentro del ciclo actual. */
export function randomPhrase(): string {
  if (deckIndex >= deck.length) {
    deck = shuffled(PHRASES);
    deckIndex = 0;
  }
  return deck[deckIndex++];
}

/** Texto por defecto de los experimentos de texto: override guardado o frase al azar. */
export function resolveSharedText(): string {
  return getSharedText() ?? randomPhrase();
}

/** Aplica el texto compartido a la prop `children` de los experimentos de texto. */
export function applySharedText(values: PropValues, category: string, text: string): PropValues {
  if (category !== "texts") return values;
  return { ...values, children: text };
}

/** Texto compartido reactivo: override de localStorage o una frase al azar por instancia. */
export function useSharedText(): string {
  const stored = useSyncExternalStore(subscribeSharedText, getSharedText, () => null);
  const [fallback] = useState(randomPhrase);
  return stored ?? fallback;
}
