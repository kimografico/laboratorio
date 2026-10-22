// @ts-nocheck
// Teseracto: Hipercubo de cuatro dimensiones proyectado a 2D. `mouseX` y `mouseY` eligen el eje o plano que mueve cada dirección del puntero.
// Generado desde el laboratorio de fondos. Multicolor conserva la paleta arcoíris; `color` fija un color único.
import { useEffect, useId, useRef } from "react";

export interface TeseractoBackgroundProps {
  /** Tamaño */
  size?: number;
  /** Giro inicial alrededor del eje X, en grados */
  initX?: number;
  /** Giro inicial alrededor del eje Y, en grados */
  initY?: number;
  /** Giro inicial alrededor del eje Z, en grados */
  initZ?: number;
  /** Velocidad de giro alrededor del eje X (plano YZ) */
  rx?: number;
  /** Velocidad de giro alrededor del eje Y (plano XZ) */
  ry?: number;
  /** Velocidad de giro alrededor del eje Z (plano XY) */
  rz?: number;
  /** Velocidad de giro en la cuarta dimensión (plano XW) */
  rw?: number;
  /** Intensidad del efecto del puntero sobre la orientación 4D */
  mouse?: number;
  /** Eje o plano que mueve el puntero en horizontal (`X`, `Y`, `Z`, `W`, `XY`, `XZ`, `XW`, `YZ`, `YW`, `ZW`, `none`) */
  mouseX?: string;
  /** Eje o plano que mueve el puntero en vertical (`X`, `Y`, `Z`, `W`, `XY`, `XZ`, `XW`, `YZ`, `YW`, `ZW`, `none`) */
  mouseY?: string;
  /** Perspectiva */
  persp?: number;
  /** Grosor */
  lw?: number;
  /** Brillo */
  glow?: number;
  /** Colores arcoíris para las aristas; los vértices quedan blancos */
  multicolor?: boolean;
  /** Color único para aristas y vértices; tiene prioridad sobre `multicolor` */
  color?: string;
  className?: string;
}

const DEFAULTS = { size: 310, initX: 0, initY: 65, initZ: 0, rx: 0, ry: 0, rz: 0, rw: 0, mouse: 0.75, mouseX: "ZW", mouseY: "none", persp: 3, lw: 2, glow: 0.5, multicolor: false, color: "" };
const AXIS: Record<string, string> = { X: "yz", Y: "xz", Z: "xy", W: "xw", XY: "xy", XZ: "xz", XW: "xw", YZ: "yz", YW: "yw", ZW: "zw" };

export default function TeseractoBackground(props: TeseractoBackgroundProps) {
  const { className, color } = props;
  const cRef = useRef<HTMLCanvasElement>(null);
  const oRef = useRef<HTMLCanvasElement>(null);
  const fid = "goo-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const c = cRef.current!;
    const o = oRef.current!;
    const g = c.getContext("2d")!;
    const q = o.getContext("2d")!;
    const style = getComputedStyle(c);
    const themeInk = style.getPropertyValue("--fg").trim() || style.color || "#fff";
    const R = Math.random;
    const TAU = Math.PI * 2;
    const DEG = Math.PI / 180;
    const P: any = { ...DEFAULTS, ...props };
    const ptr = { x: -9999, y: -9999, on: false };
    let W = 0, H = 0, S: any = {}, raf = 0, last = 0;
    const dot = (k,x,y,r)=>{k.moveTo(x+r,y);k.arc(x,y,r,0,TAU)};
    const ant = (k,x,y,a,z)=>{const ca=Math.cos(a),sa=Math.sin(a);k.beginPath();dot(k,x-2*z*ca,y-2*z*sa,1.1*z);dot(k,x,y,.8*z);dot(k,x+1.6*z*ca,y+1.6*z*sa,.7*z);k.fill()};
    const E: any = {
      setup(s){s.v=[];for(let i=0;i<16;i++)s.v.push([i&1?1:-1,i&2?1:-1,i&4?1:-1,i&8?1:-1]);s.e=[];for(let i=0;i<16;i++)for(let b=0;b<4;b++){const j=i^(1<<b);if(j>i)s.e.push([i,j])}s.Ax=0;s.Ay=0;s.Az=0;s.Aw=0;s.ax=0;s.ay=0},
      draw(s,t,dt){s.Ax+=dt*P.rx;s.Ay+=dt*P.ry;s.Az+=dt*P.rz;s.Aw+=dt*P.rw;const tx=ptr.on?(ptr.x/W-.5)*TAU*P.mouse:s.ax,ty=ptr.on?(ptr.y/H-.5)*TAU*P.mouse:s.ay;s.ax+=(tx-s.ax)*.1;s.ay+=(ty-s.ay)*.1;
       const rot=(p,i,j,a)=>{const c=Math.cos(a),n=Math.sin(a),u=p[i],v=p[j];p[i]=u*c-v*n;p[j]=u*n+v*c},d4=P.persp+1.5;
       const A:any={yz:s.Ax+(P.initX||0)*DEG,xz:s.Ay+(P.initY||0)*DEG,xy:s.Az+(P.initZ||0)*DEG,xw:s.Aw,yw:0,zw:0};
       const add=(k:any,a:number)=>{const q=AXIS[String(k).toUpperCase()];if(q)A[q]+=a};
       add(P.mouseX,s.ax);add(P.mouseY,s.ay);
       const pts=s.v.map(v=>{const p=v.slice();if(A.xw)rot(p,0,3,A.xw);if(A.yw)rot(p,1,3,A.yw);if(A.zw)rot(p,2,3,A.zw);if(A.yz)rot(p,1,2,A.yz);if(A.xz)rot(p,0,2,A.xz);if(A.xy)rot(p,0,1,A.xy);const f=d4/Math.max(.3,d4-p[3]),x=p[0]*f,y=p[1]*f,z=p[2]*f,f3=d4/Math.max(.3,d4+1-z*.5);return[W/2+x*f3*P.size*.5,H/2+y*f3*P.size*.5,p[3]]});
       const customInk=style.getPropertyValue("--teseracto-color").trim(),dim=!P.multicolor&&!customInk,ink=customInk||(dim?themeInk:"");
       g.lineCap='round';for(const[i,j]of s.e){const a=pts[i],b=pts[j],d=(a[2]+b[2])/2,al=dim?.25+d*.15:1;g.strokeStyle=ink||`hsl(${200+(d+1)*80},85%,65%)`;g.globalAlpha=dim?al*P.glow*.35:P.glow*.35;g.lineWidth=P.lw*4;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();g.globalAlpha=dim?al:1;g.lineWidth=P.lw;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}
       g.fillStyle=ink||'#fff';g.globalAlpha=dim?.25:1;g.beginPath();for(const p of pts)dot(g,p[0],p[1],3);g.fill();g.globalAlpha=1}
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
  }, [props.size, props.initX, props.initY, props.initZ, props.rx, props.ry, props.rz, props.rw, props.mouse, props.mouseX, props.mouseY, props.persp, props.lw, props.glow, props.multicolor]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#0b0f1a", ...(color ? { "--teseracto-color": color } : {}) } as React.CSSProperties}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
