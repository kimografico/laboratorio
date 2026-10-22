// @ts-nocheck
// Tinta: Mueve el ratón para dejar tinta que se funde; clic = gota grande.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";
import { getInkDropScale } from "../../lib/ink";

export interface TintaBackgroundProps {
  /** Tamaño */
  size?: number;
  /** Duración total heredada (s). @deprecated Use growTime, holdTime, and fadeTime instead. */
  life?: number;
  /** Emisión */
  emit?: number;
  /** Deriva */
  drift?: number;
  /** Velocidad de animación */
  speed?: number;
  /** Tiempo de crecimiento (s) */
  growTime?: number;
  /** Pausa en el tamaño máximo (s) */
  holdTime?: number;
  /** Tiempo de desvanecimiento (s) */
  fadeTime?: number;
  /** Multiplicador de expansión máxima */
  maxScale?: number;
  /** Multiplicador de tamaño al hacer clic */
  clickScale?: number;
  className?: string;
}

const DEFAULTS = {
  size: 22,
  emit: 25,
  drift: 12,
  speed: 1,
  growTime: 1.5,
  holdTime: 0.5,
  fadeTime: 2,
  maxScale: 1,
  clickScale: 3,
};

export default function TintaBackground(props: TintaBackgroundProps) {
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
    const legacyScale =
      props.growTime === undefined && props.holdTime === undefined && props.fadeTime === undefined && props.life !== undefined
        ? props.life / 4
        : 1;
    const P: any = {
      ...DEFAULTS,
      ...props,
      speed: props.speed ?? DEFAULTS.speed,
      growTime: props.growTime ?? DEFAULTS.growTime * legacyScale,
      holdTime: props.holdTime ?? DEFAULTS.holdTime * legacyScale,
      fadeTime: props.fadeTime ?? DEFAULTS.fadeTime * legacyScale,
      maxScale: props.maxScale ?? DEFAULTS.maxScale,
      clickScale: props.clickScale ?? DEFAULTS.clickScale,
    };
    P.totalLife = P.growTime + P.holdTime + P.fadeTime;
    const ink = getComputedStyle(c).getPropertyValue("--fg").trim() || "#161a2b";
    const ptr = { x: -9999, y: -9999, on: false };
    let W = 0, H = 0, S: any = {}, raf = 0, last = 0;
    const dot = (k,x,y,r)=>{k.moveTo(x+r,y);k.arc(x,y,r,0,TAU)};
    const ant = (k,x,y,a,z)=>{const ca=Math.cos(a),sa=Math.sin(a);k.beginPath();dot(k,x-2*z*ca,y-2*z*sa,1.1*z);dot(k,x,y,.8*z);dot(k,x+1.6*z*ca,y+1.6*z*sa,.7*z);k.fill()};
    const E: any = {
      setup(s){s.d=[]},
      add(s,x,y,r){s.d.push({x,y,r,a:0,vx:(R()-.5)*P.drift,vy:(R()-.5)*P.drift})},
      click(s,x,y){this.add(s,x,y,P.size*P.clickScale)},
      draw(s,t,dt){if(ptr.on&&R()<dt*P.emit)this.add(s,ptr.x+(R()-.5)*20,ptr.y+(R()-.5)*20,P.size*(.5+R()));
       const step=dt*P.speed;s.d=s.d.filter(d=>(d.a+=step)<P.totalLife);g.fillStyle=ink;g.beginPath();for(const d of s.d){d.x+=d.vx*step;d.y+=d.vy*step;dot(g,d.x,d.y,d.r*getInkDropScale(d.a,P.growTime,P.holdTime,P.fadeTime,P.maxScale))}g.fill()}
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
  }, [
    props.size,
    props.life,
    props.emit,
    props.drift,
    props.speed,
    props.growTime,
    props.holdTime,
    props.fadeTime,
    props.maxScale,
    props.clickScale,
  ]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "var(--panel)" }}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id={fid} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={9} result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
          </filter>
        </defs>
      </svg>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "url(#" + fid + ")" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
