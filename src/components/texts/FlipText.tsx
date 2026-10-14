export interface FlipTextProps {
  /** Texto a animar */
  children: string;
  className?: string;
  /** Duración de un ciclo completo (giro + pausa) en segundos */
  duration?: number;
  /** Retraso inicial en segundos */
  delay?: number;
  /** Bucle infinito o una sola vez */
  loop?: boolean;
  /** Separador para dividir el texto en "palabras" */
  separator?: string;
  /** Si es true, todos los caracteres animan a la vez (sin stagger) */
  together?: boolean;
}

export default function FlipText({
  children,
  className,
  duration = 4.5,
  delay = 0,
  loop = true,
  separator = " ",
  together = false,
}: FlipTextProps) {
  const text = children.trim();
  const words = text.split(separator);
  const totalChars = text.length;

  let offset = 0;
  const wordData = words.map((word) => {
    const chars = [...word].map((char, i) => {
      const globalIndex = offset + i;
      const d = together
        ? delay
        : Math.sin((globalIndex / totalChars) * (Math.PI / 2)) * (duration * 0.25) + delay;
      return { char, delay: d };
    });
    offset += word.length + separator.length;
    return chars;
  });

  return (
    <div
      key={`${text}|${duration}|${delay}|${loop}|${separator}|${together}`}
      className={`flip-text-wrapper ${className ?? ""}`.trim()}
      aria-label={text}
      style={
        {
          "--flip-duration": `${duration}s`,
          "--flip-iteration": loop ? "infinite" : "1",
        } as React.CSSProperties
      }
    >
      {wordData.map((chars, wi) => (
        <span className="word" aria-hidden="true" key={wi}>
          {chars.map(({ char, delay: charDelay }, ci) => (
            <span className="flip-char" data-char={char} style={{ "--flip-delay": `${charDelay}s` } as React.CSSProperties} key={ci}>
              <span className="face">{char}</span>
            </span>
          ))}
          {wi < wordData.length - 1 && <span className="separator">{separator}</span>}
        </span>
      ))}
    </div>
  );
}
