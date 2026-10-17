export interface GlowTextProps {
  /** Texto a animar */
  children: string;
  className?: string;
  /** Duración de un ciclo del pulso (s) */
  duration?: number;
  /** Retraso inicial (s) */
  delay?: number;
  /** Intensidad del resplandor */
  intensity?: number;
  /** Bucle infinito o una sola vez */
  loop?: boolean;
}

export default function GlowText({
  children,
  className,
  duration = 2.5,
  delay = 0,
  intensity = 1,
  loop = true,
}: GlowTextProps) {
  const text = children.trim();

  return (
    <span
      key={`${text}|${duration}|${delay}|${intensity}|${loop}`}
      className={`glow-text ${className ?? ""}`.trim()}
      style={
        {
          "--tx-duration": `${duration}s`,
          "--tx-delay": `${delay}s`,
          "--tx-intensity": intensity,
          "--tx-iteration": loop ? "infinite" : "1",
        } as React.CSSProperties
      }
    >
      {text}
    </span>
  );
}
