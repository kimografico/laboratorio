// @ts-nocheck
// Espiral de Ulam: Los primos sobre una espiral cuadrada forman diagonales. El puntero hace crecer los puntos cercanos.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface EspiralDeUlamBackgroundProps {
  /** Separación (reinicia la escena) */
  step?: number;
  /** Punto */
  size?: number;
  /** Mostrar compuestos */
  comp?: number;
  /** Alcance */
  rad?: number;
  /** Crecimiento */
  gain?: number;
  className?: string;
}

const DEFAULTS = { step: 10, size: 3, comp: 0, rad: 160, gain: 2 };

export default function EspiralDeUlamBackground(props: EspiralDeUlamBackgroundProps) {
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
      setup(s){const N=(Math.ceil(W/P.step)+2)*(Math.ceil(H/P.step)+2),sv=new Uint8Array(N+2);for(let i=2;i*i<=N;i++)if(!sv[i])for(let j=i*i;j<=N;j+=i)sv[j]=1;
       let x=0,y=0,dx=1,dy=0,len=1,seg=0,tl=0;s.p=[];for(let k=1;k<=N;k++){s.p.push([x,y,k>1&&!sv[k]]);x+=dx;y+=dy;if(++seg==len){seg=0;[dx,dy]=[-dy,dx];if(++tl%2==0)len++}}},
      draw(s,t,dt){const cx=W/2,cy=H/2;for(const pr of[false,true]){if(!pr&&!P.comp)continue;g.fillStyle=pr?'#ffd166':'#2c3e50';g.beginPath();
        for(const p of s.p){if(p[2]!=pr)continue;const px=cx+p[0]*P.step,py=cy+p[1]*P.step;if(px<-10||px>W+10||py<-10||py>H+10)continue;const d=ptr.on?Math.hypot(px-ptr.x,py-ptr.y):1e9;dot(g,px,py,P.size*(1+P.gain*Math.max(0,1-d/P.rad)))}g.fill()}}
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
  }, [props.step, props.size, props.comp, props.rad, props.gain]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#101820" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
