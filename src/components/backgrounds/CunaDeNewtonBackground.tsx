// @ts-nocheck
// Cuna de Newton: Bolas colgantes que se transmiten el impulso. Clic = levanta bolas desde el lado izquierdo o derecho.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface CunaDeNewtonBackgroundProps {
  /** Bolas (reinicia la escena) */
  n?: number;
  /** Longitud hilo */
  len?: number;
  /** Gravedad */
  gr?: number;
  /** Rozamiento */
  damp?: number;
  /** Bolas levantadas */
  lift?: number;
  className?: string;
}

const DEFAULTS = { n: 5, len: 0.45, gr: 18, damp: 0.01, lift: 1 };

export default function CunaDeNewtonBackground(props: CunaDeNewtonBackgroundProps) {
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
    const P: any = { ...DEFAULTS, ...props };
    const ptr = { x: -9999, y: -9999, on: false };
    let W = 0, H = 0, S: any = {}, raf = 0, last = 0;
    const dot = (k,x,y,r)=>{k.moveTo(x+r,y);k.arc(x,y,r,0,TAU)};
    const ant = (k,x,y,a,z)=>{const ca=Math.cos(a),sa=Math.sin(a);k.beginPath();dot(k,x-2*z*ca,y-2*z*sa,1.1*z);dot(k,x,y,.8*z);dot(k,x+1.6*z*ca,y+1.6*z*sa,.7*z);k.fill()};
    const E: any = {
      setup(s){s.r=Math.min(W,H)*.04;s.b=Array.from({length:P.n},()=>({a:0,w:0}));s.b[0].a=-.8},
      click(s,x){const k=Math.min(P.lift,P.n-1);for(const b of s.b){b.a=0;b.w=0}if(x<W/2)for(let i=0;i<k;i++)s.b[i].a=-.8;else for(let i=0;i<k;i++)s.b[P.n-1-i].a=.8},
      draw(s,t,dt){const L=H*P.len,r=s.r,x0=W/2-(P.n-1)*r,y0=H*.2;
       for(let st=0;st<8;st++){const h=dt/8;for(const b of s.b){b.w+=-(P.gr*100/L)*Math.sin(b.a)*h-P.damp*b.w*h;b.a+=b.w*h}
        for(let i=0;i<P.n-1;i++){const A=s.b[i],B=s.b[i+1],xa=Math.sin(A.a)*L+i*2*r,xb=Math.sin(B.a)*L+(i+1)*2*r;if(xb-xa<2*r&&A.w>B.w){const k=A.w;A.w=B.w;B.w=k}}}
       g.fillStyle='#555b6a';g.fillRect(x0-r*2,y0-6,P.n*2*r+r*2,6);g.strokeStyle='#8a90a0';g.lineWidth=1.5;g.fillStyle='#d3d8e2';
       s.b.forEach((b,i)=>{const px=x0+i*2*r,bx=px+Math.sin(b.a)*L,by=y0+Math.cos(b.a)*L;g.beginPath();g.moveTo(px,y0);g.lineTo(bx,by);g.stroke();g.beginPath();dot(g,bx,by,r);g.fill()})}
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
  }, [props.n, props.len, props.gr, props.damp, props.lift]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#1b1d24" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
