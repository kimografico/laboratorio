export interface TrackingInTextProps {
  /** Texto a animar */
  children: string;
  className?: string;
  /** Duración de la animación (s) */
  duration?: number;
  /** Retraso inicial (s) */
  delay?: number;
  /** Espaciado inicial entre letras (em) */
  spread?: number;
  /** Bucle infinito o una sola vez */
  loop?: boolean;
}

export default function TrackingInText({
  children,
  className,
  duration = 1.2,
  delay = 0,
  spread = 0.4,
  loop = false,
}: TrackingInTextProps) {
  const text = children.trim();

  return (
    <span
      key={`${text}|${duration}|${delay}|${spread}|${loop}`}
      className={`tracking-text ${className ?? ""}`.trim()}
      style={
        {
          "--tx-duration": `${duration}s`,
          "--tx-delay": `${delay}s`,
          "--tx-spread": `${spread}em`,
          "--tx-iteration": loop ? "infinite" : "1",
        } as React.CSSProperties
      }
    >
      {text}
    </span>
  );
}
