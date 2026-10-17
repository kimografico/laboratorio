export interface BlurInTextProps {
  /** Texto a animar */
  children: string;
  className?: string;
  /** Duración de la animación de cada carácter (s) */
  duration?: number;
  /** Retraso inicial (s) */
  delay?: number;
  /** Retraso entre caracteres (s) */
  stagger?: number;
  /** Desenfoque inicial (px) */
  blur?: number;
  /** Bucle infinito o una sola vez */
  loop?: boolean;
  /** Separador para dividir el texto en "palabras" */
  separator?: string;
}

export default function BlurInText({
  children,
  className,
  duration = 0.8,
  delay = 0,
  stagger = 0.045,
  blur = 10,
  loop = false,
  separator = " ",
}: BlurInTextProps) {
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
      key={`${text}|${duration}|${delay}|${stagger}|${blur}|${loop}|${separator}`}
      className={`blurin-text ${className ?? ""}`.trim()}
      aria-label={text}
      style={
        {
          "--tx-duration": `${duration}s`,
          "--tx-blur": `${blur}px`,
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
