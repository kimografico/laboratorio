// @ts-nocheck
// Sismógrafo: Papel que avanza trazando vibraciones. Mover el ratón o hacer clic provoca terremotos.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface SismografoBackgroundProps {
  /** Canales (reinicia la escena) */
  ch?: number;
  /** Velocidad papel */
  sp?: number;
  /** Ruido base */
  noise?: number;
  /** Sensibilidad */
  gain?: number;
  /** Amortiguación */
  dec?: number;
  className?: string;
}

const DEFAULTS = { ch: 3, sp: 120, noise: 4, gain: 1, dec: 0.95 };

export default function SismografoBackground(props: SismografoBackgroundProps) {
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
      setup(s){s.h=Array.from({length:P.ch},()=>[]);s.q=0;s.lx=null;s.ly=0;s.acc=0},
      click(s){s.q=Math.max(s.q,90*P.gain)},
      draw(s,t,dt){const mv=ptr.on&&s.lx!=null?Math.hypot(ptr.x-s.lx,ptr.y-s.ly):0;s.lx=ptr.on?ptr.x:null;s.ly=ptr.y;s.q=Math.max(s.q*P.dec**(dt*60),mv*P.gain*.6);
       s.acc+=dt*P.sp;const n=Math.floor(s.acc/2);s.acc-=n*2;const L=Math.ceil(W/2)+2;
       for(let i=0;i<n;i++)s.h.forEach((a,c)=>{a.push((R()-.5)*P.noise+(R()-.5)*2*s.q*(1+c*.25)*Math.sin(t/30+c));if(a.length>L)a.shift()});
       g.strokeStyle='rgba(120,90,50,.25)';g.lineWidth=1;g.beginPath();for(let x=W%40;x<W;x+=40){g.moveTo(x,0);g.lineTo(x,H)}g.stroke();
       g.strokeStyle='#a3201d';g.lineWidth=1.3;const bh=H/P.ch;s.h.forEach((a,c)=>{const cy=bh*(c+.5);g.beginPath();a.forEach((v,i)=>{const x=W-(a.length-1-i)*2,y=cy+Math.max(-bh*.48,Math.min(bh*.48,v));i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()})}
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
  }, [props.ch, props.sp, props.noise, props.gain, props.dec]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#efe6cf" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
