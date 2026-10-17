export interface TypewriterTextProps {
  /** Texto a escribir */
  children: string;
  className?: string;
  /** Tiempo entre caracteres (s) */
  speed?: number;
  /** Retraso inicial (s) */
  delay?: number;
  /** Mostrar cursor parpadeante */
  caret?: boolean;
}

export default function TypewriterText({
  children,
  className,
  speed = 0.06,
  delay = 0.3,
  caret = true,
}: TypewriterTextProps) {
  const text = children.replace(/\s+/g, " ").trim();
  const chars = text.length;
  const typeDuration = Math.max(0.1, chars * speed);

  return (
    <span
      key={`${text}|${speed}|${delay}|${caret}`}
      className={`typewriter-text ${caret ? "has-caret" : ""} ${className ?? ""}`.trim()}
      aria-label={text}
      style={
        {
          "--tx-chars": chars,
          "--tx-duration": `${typeDuration}s`,
          "--tx-delay": `${delay}s`,
        } as React.CSSProperties
      }
    >
      <span className="tw-inner" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
