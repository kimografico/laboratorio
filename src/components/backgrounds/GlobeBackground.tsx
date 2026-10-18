import { useEffect, useRef } from "react";

export interface GlobeBackgroundProps {
  /** Número de paralelos (líneas de latitud) */
  lat?: number;
  /** Número de meridianos (líneas de longitud) */
  lon?: number;
  /** Diámetro de la esfera como fracción de la dimensión menor del contenedor (0.2-0.9) */
  size?: number;
  /** Altura del bulto que levanta el puntero, como fracción del radio */
  bump?: number;
  /** Anchura del bulto (radianes aproximados) */
  spread?: number;
  /** Velocidad de giro automático */
  spin?: number;
  /** Suavizado con el que la esfera se inclina y el bulto sigue al puntero */
  ease?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

const TAU = Math.PI * 2;

export default function GlobeBackground({
  lat = 12,
  lon = 24,
  size = 0.7,
  bump = 0.35,
  spread = 0.4,
  spin = 0.00025,
  ease = 0.2,
  lineWidth = 0.5,
  color = "rgba(0, 0, 0, 0.5)",
  background = "#e0dad5",
  className,
}: GlobeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const OFF = -9999;
    const cap = 4 * (lat + 2) * (lon + 2) * 4;
    const bucketAlpha = [0.18, 0.5, 1];
    const segs = [new Float32Array(cap), new Float32Array(cap), new Float32Array(cap)];
    const count = [0, 0, 0];

    let width = 0;
    let height = 0;
    let px = OFF;
    let py = OFF;
    let tx = OFF;
    let ty = OFF;
    let nx = 0.5;
    let ny = 0.5;
    let raf = 0;

    // Resultado de project(): coordenadas de pantalla y profundidad
    let sx = 0;
    let sy = 0;
    let sz = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      if (px === OFF) {
        px = tx;
        py = ty;
      }
    }

    function animate(time: number) {
      if (px !== OFF) {
        px += (tx - px) * ease;
        py += (ty - py) * ease;
        nx += (Math.min(1, Math.max(0, px / width)) - nx) * ease;
        ny += (Math.min(1, Math.max(0, py / height)) - ny) * ease;
      }

      const cx = width / 2;
      const cy = height / 2;
      const R = (Math.min(width, height) * size) / 2;
      const D = R * 3.2;
      const yaw = time * spin + (nx - 0.5) * 0.9;
      const pitch = 0.35 + (ny - 0.5) * 0.5;
      const cyw = Math.cos(yaw);
      const syw = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);

      // Dirección del puntero sobre la esfera (espacio de vista) y cuánto influye
      let cdx = 0;
      let cdy = 0;
      let cdz = 1;
      let cs = 0;
      if (px !== OFF) {
        const dx = (px - cx) / R;
        const dy = -(py - cy) / R;
        const rr = Math.hypot(dx, dy);
        const z = rr < 1 ? Math.sqrt(1 - rr * rr) : 0;
        const m = Math.hypot(rr < 1 ? dx : dx / rr, rr < 1 ? dy : dy / rr, z) || 1;
        cdx = (rr < 1 ? dx : dx / rr) / m;
        cdy = (rr < 1 ? dy : dy / rr) / m;
        cdz = z / m;
        cs = rr < 1 ? 1 : Math.max(0, 1 - (rr - 1) * 1.5);
      }
      const sg2 = spread * spread;
      const t = time * 0.001;

      // Punto de la esfera por latitud/longitud: se gira, se levanta bajo el puntero y se proyecta con perspectiva
      function project(phi: number, theta: number) {
        const bx = Math.cos(phi) * Math.cos(theta);
        const by = Math.sin(phi);
        const bz = Math.cos(phi) * Math.sin(theta);
        // Giro alrededor de Y (yaw) y luego de X (cabeceo)
        const x1 = bx * cyw + bz * syw;
        const z1 = -bx * syw + bz * cyw;
        const y2 = by * cp - z1 * sp;
        const z2 = by * sp + z1 * cp;
        let f = 1 + 0.02 * Math.sin(by * 5 + bx * 3 + t * 1.2);
        if (cs > 0) f += bump * cs * Math.exp(-(1 - (x1 * cdx + y2 * cdy + z2 * cdz)) / sg2);
        const k = D / (D - z2 * R * f);
        sx = cx + x1 * R * f * k;
        sy = cy - y2 * R * f * k;
        sz = z2;
      }

      count[0] = count[1] = count[2] = 0;
      function addSeg(x0: number, y0: number, z0: number) {
        const b = (z0 + sz) / 2 > 0.33 ? 2 : (z0 + sz) / 2 > -0.33 ? 1 : 0;
        const o = count[b] * 4;
        segs[b][o] = x0;
        segs[b][o + 1] = y0;
        segs[b][o + 2] = sx;
        segs[b][o + 3] = sy;
        count[b]++;
      }

      // Paralelos
      const pts = lon * 2;
      for (let i = 1; i < lat; i++) {
        const phi = -Math.PI / 2 + (Math.PI * i) / lat;
        project(phi, 0);
        let x0 = sx;
        let y0 = sy;
        let z0 = sz;
        for (let j = 1; j <= pts; j++) {
          project(phi, (TAU * j) / pts);
          addSeg(x0, y0, z0);
          x0 = sx;
          y0 = sy;
          z0 = sz;
        }
      }
      // Meridianos
      const lp = lat * 2;
      for (let m = 0; m < lon; m++) {
        const theta = (TAU * m) / lon;
        project(-Math.PI / 2, theta);
        let x0 = sx;
        let y0 = sy;
        let z0 = sz;
        for (let k = 1; k <= lp; k++) {
          project(-Math.PI / 2 + (Math.PI * k) / lp, theta);
          addSeg(x0, y0, z0);
          x0 = sx;
          y0 = sy;
          z0 = sz;
        }
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.strokeStyle = color;
      ctx!.lineCap = "round";
      for (let b = 0; b < 3; b++) {
        ctx!.beginPath();
        const s = segs[b];
        for (let n = 0; n < count[b]; n++) {
          ctx!.moveTo(s[n * 4], s[n * 4 + 1]);
          ctx!.lineTo(s[n * 4 + 2], s[n * 4 + 3]);
        }
        ctx!.globalAlpha = bucketAlpha[b];
        ctx!.lineWidth = lineWidth * (b === 2 ? 1.2 : 1);
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;

      raf = requestAnimationFrame(animate);
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
  }, [lat, lon, size, bump, spread, spin, ease, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
