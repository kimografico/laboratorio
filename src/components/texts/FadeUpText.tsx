export interface FadeUpTextProps {
  /** Texto a animar */
  children: string;
  className?: string;
  /** Duración de la animación de cada carácter (s) */
  duration?: number;
  /** Retraso inicial (s) */
  delay?: number;
  /** Retraso entre caracteres (s) */
  stagger?: number;
  /** Desplazamiento vertical inicial (em) */
  distance?: number;
  /** Bucle infinito o una sola vez */
  loop?: boolean;
  /** Separador para dividir el texto en "palabras" */
  separator?: string;
}

export default function FadeUpText({
  children,
  className,
  duration = 0.7,
  delay = 0,
  stagger = 0.045,
  distance = 0.6,
  loop = false,
  separator = " ",
}: FadeUpTextProps) {
  const text = children.trim();
  const words = text.split(separator);

  let offset = 0;
  const wordData = words.map((word) => {
    const chars = [...word].map((char, i) => ({ char, delay: delay + (offset + i) * stagger }));
    offset += word.length + separator.length;
    return chars;
  });

  return (
    <span
      key={`${text}|${duration}|${delay}|${stagger}|${distance}|${loop}|${separator}`}
      className={`fadeup-text ${className ?? ""}`.trim()}
      aria-label={text}
      style={
        {
          "--tx-duration": `${duration}s`,
          "--tx-distance": `${distance}em`,
          "--tx-iteration": loop ? "infinite" : "1",
        } as React.CSSProperties
      }
    >
      {wordData.map((chars, wi) => (
        <span className="tx-word" aria-hidden="true" key={wi}>
          {chars.map(({ char, delay: d }, ci) => (
            <span className="tx-char" style={{ "--tx-char-delay": `${d}s` } as React.CSSProperties} key={ci}>
              {char}
            </span>
          ))}
          {wi < wordData.length - 1 && <span className="tx-sep">{separator}</span>}
        </span>
      ))}
    </span>
  );
}
