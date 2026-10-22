// @ts-nocheck
// Dados: Rejilla de dados: el puntero los hace rodar al pasar. Clic = tirada general.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface DadosBackgroundProps {
  /** Tamaño (reinicia la escena) */
  cell?: number;
  /** Alcance */
  rad?: number;
  /** Duración tirada (s) */
  roll?: number;
  className?: string;
}

const DEFAULTS = { cell: 56, rad: 60, roll: 0.6 };

export default function DadosBackground(props: DadosBackgroundProps) {
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
      F: [[[0,0]],[[-1,-1],[1,1]],[[-1,-1],[0,0],[1,1]],[[-1,-1],[1,-1],[-1,1],[1,1]],[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]],
      setup(s){s.d=[];const n=Math.ceil(W/P.cell),m=Math.ceil(H/P.cell);for(let j=0;j<m;j++)for(let i=0;i<n;i++)s.d.push({x:(i+.5)*P.cell,y:(j+.5)*P.cell,f:R()*6|0,r:0,ft:0,dir:R()<.5?-1:1})},
      click(s){for(const d of s.d)d.r=P.roll*(.5+R())},
      draw(s,t,dt){const z=P.cell*.38;for(const d of s.d){if(d.r<=0&&ptr.on&&Math.hypot(d.x-ptr.x,d.y-ptr.y)<P.rad)d.r=P.roll;if(d.r>0){d.r-=dt;d.ft-=dt;if(d.ft<=0){d.f=R()*6|0;d.ft=.07}}
        const k=Math.max(0,d.r/P.roll);g.save();g.translate(d.x,d.y);g.rotate(d.dir*k*5);g.scale(1+.2*Math.sin(k*Math.PI),1+.2*Math.sin(k*Math.PI));
        g.fillStyle='#f6f1e4';g.beginPath();g.roundRect(-z,-z,z*2,z*2,z*.3);g.fill();g.fillStyle='#1b1b1b';g.beginPath();for(const[a,b]of this.F[d.f])dot(g,a*z*.5,b*z*.5,z*.16);g.fill();g.restore()}}
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
  }, [props.cell, props.rad, props.roll]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#1f3a2e" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
