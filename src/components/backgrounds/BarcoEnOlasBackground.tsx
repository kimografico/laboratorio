// @ts-nocheck
// Barco en olas: Un barquito cabalgando las olas e inclinándose con la pendiente. El puntero lo guía (X) y levanta la mar (Y).
// Generado desde el laboratorio de fondos. Con `color` activo usa su paleta; desactivado, color de texto para las líneas y fondo para el relleno.
import { useEffect, useId, useRef } from "react";

export interface BarcoEnOlasBackgroundProps {
  /** Cantidad de capas de olas */
  waves?: number;
  /** Separación vertical entre capas de olas */
  sep?: number;
  /** Altura de olas */
  amp?: number;
  /** Velocidad */
  sp?: number;
  /** Longitud de onda */
  len?: number;
  /** Barco */
  size?: number;
  /** Suavizado del movimiento del barco (menor = más suave) */
  ease?: number;
  /** Paleta original; desactivado usa el color de texto para las líneas y el fondo para el relleno */
  color?: boolean;
  /** Grosor de línea (solo con `color` desactivado) */
  lw?: number;
  /** Opacidad (solo con `color` desactivado) */
  alpha?: number;
  /** Color de línea (solo con `color` desactivado); vacío usa el color de texto del tema */
  lineColor?: string;
  className?: string;
}

const DEFAULTS = { waves: 5, sep: 50, amp: 22, sp: 2.6, len: 500, size: 90, ease: 0.006, color: false, lw: 0.7, alpha: 1, lineColor: "#808080" };

const WAVE_ANCHORS = [
  { k: 0.8, col: "#5aa5c9", amp: 0.6 },
  { k: 1, col: "#2e7ea8", amp: 1 },
  { k: 1.2, col: "#1f6389", amp: 0.7 },
];

const rgbOf = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function mixColor(a: string, b: string, t: number) {
  const A = rgbOf(a);
  const B = rgbOf(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
}

function waveLayers(count: number, sep: number) {
  const n = Math.max(1, Math.round(count));
  return Array.from({ length: n }, (_, i) => {
    const x = (n === 1 ? 0 : i / (n - 1)) * (WAVE_ANCHORS.length - 1);
    const a = Math.min(WAVE_ANCHORS.length - 2, Math.floor(x));
    const t = Math.min(1, x - a);
    const A = WAVE_ANCHORS[a];
    const B = WAVE_ANCHORS[a + 1];
    return {
      k: A.k + (B.k - A.k) * t,
      off: (i - (n - 1) / 2) * sep,
      amp: A.amp + (B.amp - A.amp) * t,
      col: mixColor(A.col, B.col, t),
    };
  });
}

export default function BarcoEnOlasBackground(props: BarcoEnOlasBackgroundProps) {
  const { className } = props;
  const cRef = useRef<HTMLCanvasElement>(null);
  const oRef = useRef<HTMLCanvasElement>(null);
  const fid = "goo-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const c = cRef.current!;
    const o = oRef.current!;
    const g = c.getContext("2d")!;
    const q = o.getContext("2d")!;
    const R = Math.random;
    const TAU = Math.PI * 2;
    const style = getComputedStyle(c);
    const paper = style.getPropertyValue("--panel").trim() || style.backgroundColor || "#000";
    const P: any = { ...DEFAULTS, ...props };
    const ink = (typeof P.lineColor === "string" && P.lineColor.trim()) || style.getPropertyValue("--fg").trim() || style.color || "#fff";
    const layers = waveLayers(P.waves, P.sep);
    const back = Math.max(1, Math.round(layers.length / 3));
    const ptr = { x: -9999, y: -9999, on: false };
    let W = 0, H = 0, S: any = {}, raf = 0, last = 0;
    const dot = (k,x,y,r)=>{k.moveTo(x+r,y);k.arc(x,y,r,0,TAU)};
    const ant = (k,x,y,a,z)=>{const ca=Math.cos(a),sa=Math.sin(a);k.beginPath();dot(k,x-2*z*ca,y-2*z*sa,1.1*z);dot(k,x,y,.8*z);dot(k,x+1.6*z*ca,y+1.6*z*sa,.7*z);k.fill()};
    const E: any = {
      setup(s){s.x=W*.3;s.a=P.amp},
      wave(x,t,k,ph,a){return Math.sin(x/P.len*TAU+t*P.sp*k+ph)*a+Math.sin(x/(P.len*.47)*TAU-t*P.sp*k*1.3+ph*2)*a*.35},
      draw(s,t,dt){g.globalAlpha=P.color?1:P.alpha;const T=t/1000,base=H*.62,ease=P.ease;s.x+=((ptr.on?ptr.x:W*.5+Math.sin(T*.3)*W*.3)-s.x)*ease;s.a+=((ptr.on?P.amp*(.4+1.4*(1-ptr.y/H)):P.amp)-s.a)*ease;
       const shape=(col,build)=>{g.fillStyle=P.color?col:paper;g.beginPath();build();g.fill();if(!P.color){g.strokeStyle=ink;g.lineWidth=P.lw;g.stroke()}};
       shape('#ffb347',()=>dot(g,W*.8,H*.25,45));
       const L=(w)=>shape(w.col,()=>{g.moveTo(-10,H+10);for(let x=-10;x<=W+10;x+=8)g.lineTo(x,base+w.off+this.wave(x,T,w.k,w.off,s.a*w.amp));g.lineTo(W+10,H+10)});
       for(let i=0;i<back&&i<layers.length;i++)L(layers[i]);
       const y=base+this.wave(s.x,T,1,0,s.a),y2=base+this.wave(s.x+6,T,1,0,s.a),ang=Math.atan2(y2-y,6),z=P.size;
       g.save();g.translate(s.x,y);g.rotate(ang);shape('#7a4a2a',()=>{g.moveTo(-z,-z*.1);g.lineTo(z,-z*.1);g.lineTo(z*.7,z*.5);g.lineTo(-z*.7,z*.5);g.closePath()});
       g.strokeStyle=P.color?'#4a2c18':ink;g.lineWidth=P.color?3:P.lw*1.5;g.beginPath();g.moveTo(0,-z*.1);g.lineTo(0,-z*1.9);g.stroke();
       shape('#fffaf0',()=>{g.moveTo(z*.08,-z*1.85);g.lineTo(z*.9,-z*.3);g.lineTo(z*.08,-z*.3);g.closePath();g.moveTo(-z*.08,-z*1.6);g.lineTo(-z*.7,-z*.3);g.lineTo(-z*.08,-z*.3);g.closePath()});g.restore();
       for(let i=back;i<layers.length;i++)L(layers[i]);g.globalAlpha=1}
    };

    const reset = () => { S = {}; if (E.setup) E.setup(S); };
    function resize() {
      W = c.width = o.width = c.clientWidth;
      H = c.height = o.height = c.clientHeight;
      reset();
    }
    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
      ptr.on = ptr.x >= 0 && ptr.y >= 0 && ptr.x <= r.width && ptr.y <= r.height;
    };
    const onDown = (e: PointerEvent) => { onMove(e); if (ptr.on && E.click) E.click(S, ptr.x, ptr.y); };
    function loop(t: number) {
      const dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      g.clearRect(0, 0, W, H);
      q.clearRect(0, 0, W, H);
      E.draw(S, t, dt);
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(c);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    resize();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [props.waves, props.sep, props.amp, props.sp, props.len, props.size, props.ease, props.color, props.lw, props.alpha, props.lineColor]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#f5d7a1" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
