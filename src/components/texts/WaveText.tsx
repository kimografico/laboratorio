export interface WaveTextProps {
  /** Texto a animar */
  children: string;
  className?: string;
  /** Duración de un ciclo completo de la onda (s) */
  duration?: number;
  /** Desfase entre caracteres (s) */
  stagger?: number;
  /** Amplitud de la onda (em) */
  amplitude?: number;
  /** Bucle infinito o una sola vez */
  loop?: boolean;
  /** Separador para dividir el texto en "palabras" */
  separator?: string;
}

export default function WaveText({
  children,
  className,
  duration = 2,
  stagger = 0.08,
  amplitude = 0.35,
  loop = true,
  separator = " ",
}: WaveTextProps) {
  const text = children.trim();
  const words = text.split(separator);

  let offset = 0;
  const wordData = words.map((word) => {
    const chars = [...word].map((char, i) => ({ char, delay: (offset + i) * stagger }));
    offset += word.length + separator.length;
    return chars;
  });

  return (
    <span
      key={`${text}|${duration}|${stagger}|${amplitude}|${loop}|${separator}`}
      className={`wave-text ${className ?? ""}`.trim()}
      aria-label={text}
      style={
        {
          "--tx-duration": `${duration}s`,
          "--tx-amplitude": `${amplitude}em`,
          "--tx-iteration": loop ? "infinite" : "1",
        } as React.CSSProperties
      }
    >
      {wordData.map((chars, wi) => (
        <span className="tx-word" aria-hidden="true" key={wi}>
          {chars.map(({ char, delay: d }, ci) => (
            <span className="tx-char" style={{ "--tx-char-delay": `${-d}s` } as React.CSSProperties} key={ci}>
              {char}
            </span>
          ))}
          {wi < wordData.length - 1 && <span className="tx-sep">{separator}</span>}
        </span>
      ))}
    </span>
  );
}
