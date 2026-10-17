export interface GlitchTextProps {
  /** Texto a animar */
  children: string;
  className?: string;
  /** Duración de un ciclo (s) */
  duration?: number;
  /** Retraso inicial (s) */
  delay?: number;
  /** Intensidad del desplazamiento */
  intensity?: number;
  /** Bucle infinito o una sola vez */
  loop?: boolean;
}

export default function GlitchText({
  children,
  className,
  duration = 3,
  delay = 0,
  intensity = 1,
  loop = true,
}: GlitchTextProps) {
  const text = children.trim();

  return (
    <span
      key={`${text}|${duration}|${delay}|${intensity}|${loop}`}
      className={`glitch-text ${className ?? ""}`.trim()}
      data-text={text}
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
