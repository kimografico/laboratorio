export interface ShineTextProps {
  /** Texto a animar */
  children: string;
  className?: string;
  /** Duración de un barrido completo (s) */
  duration?: number;
  /** Retraso inicial (s) */
  delay?: number;
  /** Ángulo del barrido (grados) */
  angle?: number;
  /** Bucle infinito o una sola vez */
  loop?: boolean;
}

export default function ShineText({
  children,
  className,
  duration = 3,
  delay = 0,
  angle = 100,
  loop = true,
}: ShineTextProps) {
  const text = children.trim();

  return (
    <span
      key={`${text}|${duration}|${delay}|${angle}|${loop}`}
      className={`shine-text ${className ?? ""}`.trim()}
      style={
        {
          "--tx-duration": `${duration}s`,
          "--tx-delay": `${delay}s`,
          "--tx-angle": `${angle}deg`,
          "--tx-iteration": loop ? "infinite" : "1",
        } as React.CSSProperties
      }
    >
      {text}
    </span>
  );
}
