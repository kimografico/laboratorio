// @ts-nocheck
// Fuego: Fuego celular clásico con paleta de llama. El puntero es una antorcha; clic = llamarada.
// Generado desde el laboratorio de fondos. La paleta se genera a partir del color de llama.
import { useEffect, useId, useRef } from "react";

export interface FuegoBackgroundProps {
  /** Tamaño de píxel (reinicia la escena) */
  b?: number;
  /** Enfriamiento */
  decay?: number;
  /** Viento */
  wind?: number;
  /** Base encendida */
  base?: number;
  /** Tamaño de la llamarada (clic, px) */
  bsize?: number;
  /** Radio de la antorcha (px, 0 = apagada) */
  torch?: number;
  /** Color de la llama */
  color?: string;
  className?: string;
}

const DEFAULTS = { b: 5, decay: 3, wind: 0.4, base: 1, bsize: 50, torch: 25, color: "#ffc800" };

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [255, 106, 0];
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

export default function FuegoBackground(props: FuegoBackgroundProps) {
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
      setup(s){s.w=Math.ceil(W/P.b);s.h=Math.ceil(H/P.b);s.f=new Uint8Array(s.w*s.h);s.o=document.createElement('canvas');s.o.width=s.w;s.o.height=s.h;s.x=s.o.getContext('2d');s.d=s.x.createImageData(s.w,s.h);
       const fc=hexToRgb(P.color);
       s.pal=Array.from({length:37},(_,i)=>{const v=i/36;if(v<.6){const k=v/.6;return[fc[0]*k,fc[1]*k,fc[2]*k]}const k=(v-.6)/.4;return[fc[0]+(255-fc[0])*k,fc[1]+(255-fc[1])*k,fc[2]+(255-fc[2])*k]})},
      blaze(s,x,y,r){const ci=x/P.b|0,cj=y/P.b|0;for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r){const ii=ci+i,jj=cj+j;if(ii>=0&&jj>=0&&ii<s.w&&jj<s.h)s.f[jj*s.w+ii]=36}},
      click(s,x,y){this.blaze(s,x,y,Math.max(1,Math.round((P.bsize+P.torch)/P.b)))},
      draw(s,t,dt){const w=s.w,h=s.h,f=s.f,D=s.d.data,wd=P.wind;for(let i=0;i<w;i++)f[(h-1)*w+i]=R()<P.base?36:0;if(ptr.on&&P.torch>0)this.blaze(s,ptr.x,ptr.y,Math.max(1,Math.round(P.torch/P.b)));
       for(let j=0;j<h-1;j++)for(let i=0;i<w;i++){const sh=(R()*3|0)-1+(R()<Math.abs(wd)/2?Math.sign(wd):0),tx=Math.max(0,Math.min(w-1,i+sh));f[j*w+tx]=Math.max(0,f[(j+1)*w+i]-(R()*P.decay|0))}
       for(let k=0;k<w*h;k++){const c=s.pal[f[k]];D[k*4]=c[0];D[k*4+1]=c[1];D[k*4+2]=c[2];D[k*4+3]=f[k]?255:0}
       s.x.putImageData(s.d,0,0);g.imageSmoothingEnabled=false;g.drawImage(s.o,0,0,W,H)}
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
  }, [props.b, props.decay, props.wind, props.base, props.bsize, props.torch, props.color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#050202" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
