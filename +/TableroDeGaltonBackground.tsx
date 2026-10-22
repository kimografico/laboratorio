// @ts-nocheck
// Tablero de Galton: Bolas que caen entre clavijas y forman una campana de Gauss. Clic = suelta una bola; el ratón las empuja.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface TableroDeGaltonBackgroundProps {
  /** Filas de clavijas (reinicia la escena) */
  rows?: number;
  /** Caída por segundo */
  rate?: number;
  /** Gravedad */
  grav?: number;
  /** Rebote */
  bounce?: number;
  /** Tamaño bola (reinicia la escena) */
  ball?: number;
  className?: string;
}

const DEFAULTS = { rows: 10, rate: 8, grav: 700, bounce: 0.5, ball: 3.5 };

export default function TableroDeGaltonBackground(props: TableroDeGaltonBackgroundProps) {
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
      setup(s){const sp=Math.min(W/(P.rows+4),H*.7/(P.rows+1)),cx=W/2,y0=H*.1;s.sp=sp;s.p=[];for(let j=0;j<P.rows;j++)for(let i=0;i<=j+1;i++)s.p.push([cx+(i-(j+1)/2)*sp,y0+j*sp*.9]);s.y1=y0+P.rows*sp*.9;s.n=P.rows+2;s.bc=new Array(s.n).fill(0);s.d=[];s.b=[];s.acc=0},
      click(s,x,y){s.b.push({x,y,vx:0,vy:0,r:P.ball})},
      draw(s,t,dt){s.acc+=dt*P.rate;while(s.acc>=1){s.acc--;s.b.push({x:W/2+(R()-.5)*3,y:H*.04,vx:0,vy:0,r:P.ball})}
       const L=W/2-s.n*s.sp/2;
       for(const b of s.b){b.vy+=P.grav*dt;if(ptr.on){const dx=b.x-ptr.x,dy=b.y-ptr.y,d=Math.hypot(dx,dy);if(d<60&&d>0){b.vx+=dx/d*600*dt;b.vy+=dy/d*600*dt}}
        b.x+=b.vx*dt;b.y+=b.vy*dt;
        for(const p of s.p){const dx=b.x-p[0],dy=b.y-p[1],d=Math.hypot(dx,dy),m=b.r+3;if(d<m&&d>0){const nx=dx/d,ny=dy/d,vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=(1+P.bounce)*vn*nx;b.vy-=(1+P.bounce)*vn*ny}b.x=p[0]+nx*m;b.y=p[1]+ny*m}}
        if(b.y>s.y1){const i=Math.max(0,Math.min(s.n-1,Math.floor((b.x-L)/s.sp))),lo=L+i*s.sp+b.r,hi=L+(i+1)*s.sp-b.r;if(b.x<lo){b.x=lo;b.vx*=-.3}if(b.x>hi){b.x=hi;b.vx*=-.3}
         const fl=H-8-s.bc[i]*b.r*1.9;if(b.y>=fl){s.bc[i]++;b.done=1;s.d.push([b.x,fl,b.r]);if(s.bc[i]*b.r*1.9>H-s.y1-40){s.d=[];s.bc.fill(0)}}}
        if(b.x<-20||b.x>W+20||b.y>H+20)b.done=1}
       s.b=s.b.filter(b=>!b.done);
       g.strokeStyle='#44506a';g.lineWidth=2;g.beginPath();for(let i=0;i<=s.n;i++){g.moveTo(L+i*s.sp,s.y1);g.lineTo(L+i*s.sp,H)}g.stroke();
       g.fillStyle='#7b8cb0';g.beginPath();for(const p of s.p)dot(g,p[0],p[1],3);g.fill();
       g.fillStyle='#ffcf5a';g.beginPath();for(const b of s.b)dot(g,b.x,b.y,b.r);for(const d of s.d)dot(g,d[0],d[1],d[2]);g.fill()}
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
  }, [props.rows, props.rate, props.grav, props.bounce, props.ball]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#1c2230" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
