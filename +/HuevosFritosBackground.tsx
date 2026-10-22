// @ts-nocheck
// Huevos fritos: Clic = nuevo huevo. Las claras se funden, las yemas no. El ratón inclina la sartén.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface HuevosFritosBackgroundProps {
  /** Inclinación */
  tilt?: number;
  /** Fricción */
  fric?: number;
  /** Yema */
  yolk?: number;
  /** Tamaño */
  size?: number;
  /** Máx. huevos */
  max?: number;
  className?: string;
}

const DEFAULTS = { tilt: 1.2, fric: 0.95, yolk: 0.34, size: 65, max: 25 };

export default function HuevosFritosBackground(props: HuevosFritosBackgroundProps) {
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
      setup(s){s.e=[];for(let i=0;i<3;i++)this.click(s,W*(.3+.2*i),H*(.4+.2*(i%2)))},
      click(s,x,y){const r=P.size*(.8+.4*R());s.e.push({x,y,vx:0,vy:0,r,yx:0,yy:0,k:0,l:Array.from({length:4},()=>[R()*TAU,r*(.25+.3*R()),r*(.5+.3*R())])});if(s.e.length>P.max)s.e.shift()},
      draw(s,t,dt){const ax=ptr.on?(ptr.x/W-.5)*P.tilt:0,ay=ptr.on?(ptr.y/H-.5)*P.tilt:0;
       g.fillStyle='#f7f3ea';g.beginPath();
       for(const e of s.e){e.k+=(1-e.k)*.07;e.vx=(e.vx+ax*.5)*P.fric;e.vy=(e.vy+ay*.5)*P.fric;e.x+=e.vx;e.y+=e.vy;
        if(e.x<e.r){e.x=e.r;e.vx*=-.3}if(e.x>W-e.r){e.x=W-e.r;e.vx*=-.3}if(e.y<e.r){e.y=e.r;e.vy*=-.3}if(e.y>H-e.r){e.y=H-e.r;e.vy*=-.3}
        e.yx+=(ax*e.r*2-e.yx)*.06;e.yy+=(ay*e.r*2-e.yy)*.06;const m=Math.hypot(e.yx,e.yy),mx=e.r*.45;if(m>mx){e.yx*=mx/m;e.yy*=mx/m}
        dot(g,e.x,e.y,e.r*.8*e.k);for(const[a,d,r]of e.l)dot(g,e.x+Math.cos(a)*d*e.k,e.y+Math.sin(a)*d*e.k,r*e.k)}
       g.fill();
       for(const e of s.e){const r=e.r*P.yolk*e.k,x=e.x+e.yx,y=e.y+e.yy;q.fillStyle='#f2a900';q.beginPath();dot(q,x,y,r);q.fill();q.fillStyle='rgba(255,255,255,.5)';q.beginPath();dot(q,x-r*.3,y-r*.3,r*.22);q.fill()}}
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
  }, [props.tilt, props.fric, props.yolk, props.size, props.max]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#26231e" }}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id={fid} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={7} result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
          </filter>
        </defs>
      </svg>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "url(#" + fid + ")" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
