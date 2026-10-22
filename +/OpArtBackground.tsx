// @ts-nocheck
// Op-art: Tablero de ajedrez ondulante; el puntero lo abomba como una lente.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface OpArtBackgroundProps {
  /** Casillas */
  n?: number;
  /** Ondulación */
  amp?: number;
  /** Lente */
  lens?: number;
  /** Alcance */
  rad?: number;
  className?: string;
}

const DEFAULTS = { n: 28, amp: 14, lens: 0.9, rad: 220 };

export default function OpArtBackground(props: OpArtBackgroundProps) {
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
      setup(s){s.x=W/2;s.y=H/2},
      draw(s,t,dt){s.x+=((ptr.on?ptr.x:W/2+Math.sin(t/2000)*W*.2)-s.x)*.1;s.y+=((ptr.on?ptr.y:H/2)-s.y)*.1;const c=W/P.n,m=Math.ceil(H/c),V=[];
       for(let j=0;j<=m;j++){V[j]=[];for(let i=0;i<=P.n;i++){let x=i*c,y=j*c;const dx=x-s.x,dy=y-s.y,f=P.lens*Math.exp(-((Math.hypot(dx,dy)/P.rad)**2))*.6;x+=Math.sin(y/70+t/900)*P.amp+dx*f;y+=Math.sin(x/90+t/1100)*P.amp+dy*f;V[j][i]=[x,y]}}
       g.fillStyle='#111';g.beginPath();for(let j=0;j<m;j++)for(let i=0;i<P.n;i++)if((i+j)&1){const a=V[j][i],b=V[j][i+1],e=V[j+1][i+1],f=V[j+1][i];g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineTo(e[0],e[1]);g.lineTo(f[0],f[1]);g.closePath()}g.fill()}
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
  }, [props.n, props.amp, props.lens, props.rad]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#f3f3f3" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
