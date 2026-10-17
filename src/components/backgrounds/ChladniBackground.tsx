import { useEffect, useRef } from "react";

export interface ChladniBackgroundProps {
  /** Partículas por cada 10.000 px² del contenedor */
  density?: number;
  /** Tamaño de cada partícula (px) */
  size?: number;
  /** Velocidad con la que cambian los modos de vibración por sí solos (1 = normal, 0 = patrón fijo) */
  speed?: number;
  /** Cuánto cambia la figura según la posición del puntero (0 = no reacciona) */
  follow?: number;
  /** Fuerza de la vibración: más alto, las partículas se sacuden más antes de asentarse en las líneas */
  shake?: number;
  /** Opacidad de las partículas (0-1) */
  alpha?: number;
  /** Opcional: fija el color de la arena. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

export default function ChladniBackground({
  density = 60,
  size = 1.8,
  speed = 1,
  follow = 1,
  shake = 1,
  alpha = 0.55,
  color,
  className,
}: ChladniBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let U = new Float32Array(0); // posición de cada partícula, normalizada (0-1)
    let V = new Float32Array(0);
    let hasPointer = false;
    let tx = 0.5;
    let ty = 0.5;
    let lastX = -1;
    let lastY = -1;
    let pspeed = 0; // velocidad del puntero, suavizada
    let frame = 0;
    let a = 2.6; // modos de vibración actuales (continuos: la figura se transforma sin saltos)
    let b = 3.8;
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      const n = Math.round((density * w * h) / 10000);
      U = new Float32Array(n).map(() => Math.random());
      V = new Float32Array(n).map(() => Math.random());
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (lastX >= 0) pspeed = Math.min(40, pspeed + Math.hypot(x - lastX, y - lastY) * 0.3);
      lastX = x;
      lastY = y;
      tx = Math.min(1, Math.max(0, x / w));
      ty = Math.min(1, Math.max(0, y / h));
      hasPointer = true;
    }

    function animate(time: number) {
      raf = requestAnimationFrame(animate);
      // Las partículas se asientan despacio: se calcula a 30 fps (con pasos dobles) y los fotogramas impares
      // conservan el dibujo anterior
      if (frame++ % 2 === 1) return;
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--chladni-color").trim() || style.color;
      const k = style.getPropertyValue("--chladni-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;

      // Modos objetivo: sin puntero recorren despacio una trayectoria lenta; con puntero, su posición los elige
      const t = time * speed;
      const idleA = 2.8 + 2.2 * Math.sin(t * 0.00006) + 0.8 * Math.sin(t * 0.00017 + 1);
      const idleB = 4.0 + 2.4 * Math.sin(t * 0.00005 + 1.7) + 0.7 * Math.sin(t * 0.00013);
      const ptrA = 1.5 + 5 * tx;
      const ptrB = 1.5 + 5 * ty;
      const mix = hasPointer ? Math.min(1, follow) : 0;
      a += (idleA + (ptrA - idleA) * mix - a) * 0.024;
      b += (idleB + (ptrB - idleB) * mix - b) * 0.024;
      pspeed *= 0.87;

      // Placa de Chladni: f(u,v) = cos(aπu)·cos(bπv) − cos(bπu)·cos(aπv). La arena se acumula donde f = 0
      const PI = Math.PI;
      const eta = 0.00022;
      const jit = 0.0045 * shake * (0.5 + Math.min(1, pspeed / 20));
      for (let i = 0; i < U.length; i++) {
        const u = U[i];
        const v = V[i];
        const cau = Math.cos(a * PI * u);
        const sau = Math.sin(a * PI * u);
        const cbu = Math.cos(b * PI * u);
        const sbu = Math.sin(b * PI * u);
        const cav = Math.cos(a * PI * v);
        const sav = Math.sin(a * PI * v);
        const cbv = Math.cos(b * PI * v);
        const sbv = Math.sin(b * PI * v);
        const f = cau * cbv - cbu * cav;
        const fu = PI * (-a * sau * cbv + b * sbu * cav);
        const fv = PI * (-b * cau * sbv + a * cbu * sav);
        // Deriva hacia la línea nodal (baja por el gradiente de f²) + sacudida proporcional a lo lejos que está de ella
        const af = Math.abs(f);
        let nu = u - eta * f * fu + (Math.random() - 0.5) * jit * af;
        let nv = v - eta * f * fv + (Math.random() - 0.5) * jit * af;
        // Rebote en los bordes
        if (nu < 0) nu = -nu;
        else if (nu > 1) nu = 2 - nu;
        if (nv < 0) nv = -nv;
        else if (nv > 1) nv = 2 - nv;
        U[i] = nu;
        V[i] = nv;
      }

      ctx!.fillStyle = ink;
      ctx!.globalAlpha = Math.min(1, alpha * mul);
      const s = size;
      for (let i = 0; i < U.length; i++) ctx!.fillRect(U[i] * w - s / 2, V[i] * h - s / 2, s, s);
      ctx!.globalAlpha = 1;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => onPointer(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [density, size, speed, follow, shake, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--chladni-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
