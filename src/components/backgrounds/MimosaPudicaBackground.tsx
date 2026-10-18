import { useEffect, useRef } from "react";

export interface MimosaPudicaBackgroundProps {
  near?: number;
  far?: number;
  size?: number;
  wind?: number;
  touchSensitivity?: number;
  reopenSpeed?: number;
  reopenDelay?: number;
  leavesPerBranch?: number;
  sizeTaper?: number;
  opaqueLeaves?: boolean;
  alpha?: number;
  lineWidth?: number;
  color?: string;
  className?: string;
}

type Leaf = {
  node: number;
  side: number;
  len: number;
  ph: number;
  angle: number;
  reopenAt: number;
};
type Branch = {
  rx: number;
  ry: number;
  base: number;
  curve: number;
  L: number;
  far: boolean;
  ph: number;
  xs: number[];
  ys: number[];
  th: number[];
  baseTh: number[];
  leaves: Leaf[];
  pushAngle: number;
  pushStrength: number;
  NODES: number;
};

const MIN_NODES = 16;
const START_NODE = 2;
const R_CLOSE = 50;
const R_START = 140;
const MAX_CLOSE_ANGLE = Math.PI * 60 / 180;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace(/^#/, "").match(/.{2}/g);
  if (!m) return null;
  return {
    r: parseInt(m[0], 16) / 255,
    g: parseInt(m[1], 16) / 255,
    b: parseInt(m[2], 16) / 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lightenColor(hex: string, amount: number = 0.12): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  // Simple sRGB lightening: mix with white
  const r = rgb.r + (1 - rgb.r) * amount;
  const g = rgb.g + (1 - rgb.g) * amount;
  const b = rgb.b + (1 - rgb.b) * amount;
  return rgbToHex(r, g, b);
}

export default function MimosaPudicaBackground({
  near = 10,
  far = 12,
  size = 120,
  wind = 1.2,
  touchSensitivity = 1,
  reopenSpeed = 6,
  reopenDelay = 2000,
  leavesPerBranch = 14,
  sizeTaper = 65,
  opaqueLeaves = true,
  alpha = 0.4,
  lineWidth = 1.2,
  color,
  className,
}: MimosaPudicaBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });
  const bgColorRef = useRef<string>("");
  const loggedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasStyle = getComputedStyle(canvas);
    const rootStyle = getComputedStyle(document.documentElement);
    let w = 0;
    let h = 0;
    let branches: Branch[] = [];
    let raf = 0;

    function getNodes(count: number): number {
      return Math.max(MIN_NODES, count + 3);
    }

    function make(isFar: boolean, i: number, total: number): Branch {
      const slot = (i + 0.5) / total;
      const fromSide = Math.random() < 0.3;
      let rx: number, ry: number, base: number;
      if (fromSide) {
        const left = Math.random() < 0.5;
        rx = left ? -20 : w + 20;
        ry = h * (0.05 + 0.4 * Math.random());
        base = left ? 0.5 + 0.35 * Math.random() : Math.PI - 0.5 - 0.35 * Math.random();
      } else {
        rx = w * (0.05 + 0.9 * slot) + (Math.random() - 0.5) * 60;
        ry = -20;
        base = Math.PI / 2 + (slot < 0.5 ? 0.45 : -0.45) * (0.4 + 0.6 * Math.random());
      }
      const sc = isFar ? 0.35 : 1;
      const L = Math.min(w, h) * (0.55 + 0.35 * Math.random()) * (isFar ? 0.6 : 1);
      
      const NODES = getNodes(leavesPerBranch);
      const END_NODE = NODES - 1;
      const AVAILABLE_NODES = END_NODE - START_NODE + 1;
      const baseTh = new Array(NODES + 1).fill(base);

      const count = Math.min(leavesPerBranch, AVAILABLE_NODES);
      const leaves: Leaf[] = [];
      const taperFactor = sizeTaper / 100;
      for (let pair = 0; pair < count; pair++) {
        const t = (pair + 0.5) / count;
        const node = Math.round(START_NODE + t * (AVAILABLE_NODES - 1));
        const clampedNode = Math.max(START_NODE, Math.min(END_NODE, node));
        const nodeRatio = (clampedNode - START_NODE) / (END_NODE - START_NODE);
        const taper = 1 - taperFactor * nodeRatio;
        leaves.push({
          node: clampedNode,
          side: 1,
          len: size * sc * (0.7 + 0.4 * Math.random()) * taper,
          ph: Math.random() * Math.PI * 2,
          angle: 0,
          reopenAt: 0,
        });
        leaves.push({
          node: clampedNode,
          side: -1,
          len: size * sc * (0.7 + 0.4 * Math.random()) * taper,
          ph: Math.random() * Math.PI * 2,
          angle: 0,
          reopenAt: 0,
        });
      }

      return {
        rx, ry, base,
        curve: (Math.random() - 0.5) * 0.9,
        L, far: isFar, ph: Math.random() * Math.PI * 2,
        xs: new Array(NODES + 1).fill(rx), ys: new Array(NODES + 1).fill(ry), th: new Array(NODES + 1).fill(base),
        baseTh,
        leaves,
        pushAngle: 0,
        pushStrength: 0,
        NODES,
      };
    }

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      branches = [
        ...Array.from({ length: far }, (_, i) => make(true, i, far)),
        ...Array.from({ length: near }, (_, i) => make(false, i, near)),
      ];
    }

    const onPointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = { x: clientX - rect.left, y: clientY - rect.top, active: true };
    };

    const onPointerLeave = () => {
      pointerRef.current = { x: -9999, y: -9999, active: false };
    };

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function drawBranch(b: Branch, time: number, a: number) {
      const NODES = b.NODES;
      const gust = Math.max(0.2, 0.7 + 0.5 * Math.sin(time * 0.00031 + b.ph) + 0.3 * Math.sin(time * 0.0009 + 1)) * wind;
      const seg = b.L / NODES;
      b.xs[0] = b.rx;
      b.ys[0] = b.ry;
      b.th[0] = b.base;

      const { x: px, y: py, active: hasPointer } = pointerRef.current;

      let branchPushAngle = 0;
      let maxPushStrength = 0;

      if (hasPointer && touchSensitivity > 0) {
        for (let i = 1; i <= NODES; i++) {
          const dx = b.xs[i - 1] - px;
          const dy = b.ys[i - 1] - py;
          const d = Math.hypot(dx, dy);
          const R = 220;
          if (d < R) {
            const force = Math.pow(1 - d / R, 1.5) * touchSensitivity * 0.04;
            const dir = dx >= 0 ? 1 : -1;
            branchPushAngle += dir * force * (1 - (i / NODES) * 0.3);
            maxPushStrength = Math.max(maxPushStrength, force);
          }
        }
      }

      b.pushAngle += (branchPushAngle - b.pushAngle) * 0.1;
      b.pushStrength += (maxPushStrength - b.pushStrength) * 0.1;

      for (let i = 1; i <= NODES; i++) {
        const f = i / NODES;
        let th = b.base + b.curve * f + Math.sin(time * 0.0005 + b.ph - i * 0.32) * 0.09 * gust * Math.pow(f, 1.1);
        th += b.pushAngle * f;
        b.th[i] = th;
        b.xs[i] = b.xs[i - 1] + Math.cos(th) * seg;
        b.ys[i] = b.ys[i - 1] + Math.sin(th) * seg;
      }

      ctx!.beginPath();
      ctx!.moveTo(b.xs[0], b.ys[0]);
      for (let i = 1; i <= NODES; i++) ctx!.lineTo(b.xs[i], b.ys[i]);
      ctx!.lineWidth = lineWidth * (b.far ? 1.8 : 1.2);
      setAlpha(a * (b.far ? 0.35 : 0.8));
      ctx!.stroke();

      for (const lf of b.leaves) {
        const nx = b.xs[lf.node];
        const ny = b.ys[lf.node];

        let targetAngle = 0;
        const wasInfluenced = lf.reopenAt > 0 && time < lf.reopenAt;

        if (hasPointer && touchSensitivity > 0) {
          const dx = nx - px;
          const dy = ny - py;
          const d = Math.hypot(dx, dy);
          const rClose = R_CLOSE + lf.len * 0.3;
          const rStart = R_START + lf.len * 0.5;

          if (d < rStart) {
            const t = 1 - Math.min(1, Math.max(0, (d - rClose) / (rStart - rClose)));
            const eased = t * t * (3 - 2 * t);
            targetAngle = -MAX_CLOSE_ANGLE * eased;
            lf.reopenAt = 0;
          }
        }

        if (!wasInfluenced && lf.reopenAt === 0 && targetAngle === 0 && lf.angle < -0.001) {
          lf.reopenAt = time + reopenDelay;
        }

        const canReopen = lf.reopenAt === 0 || time >= lf.reopenAt;
        const closing = targetAngle < lf.angle;
        const rate = closing ? 0.15 : (canReopen ? reopenSpeed / 1000 : 0);
        lf.angle += (targetAngle - lf.angle) * rate;

        if (lf.angle > -0.001) {
          lf.angle = 0;
          lf.reopenAt = 0;
        }

        const flutter = Math.sin(time * 0.0021 + lf.ph) * 0.12 * gust;
        const baseAngle = b.th[lf.node] + lf.side * (1.05 + flutter);
        const ang = baseAngle + lf.side * lf.angle;
        const L = lf.len;
        const Wd = L * 0.15;
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        ctx!.setTransform(c, s, -s, c, nx, ny);
        ctx!.beginPath();
        ctx!.moveTo(0, 0);
        ctx!.quadraticCurveTo(L * 0.5, -Wd, L, 0);
        ctx!.quadraticCurveTo(L * 0.5, Wd, 0, 0);

        const isNearAndOpaque = opaqueLeaves && !b.far;
        if (isNearAndOpaque) {
          ctx!.fillStyle = bgColorRef.current;
          setAlpha(1);
          ctx!.fill();
          ctx!.fillStyle = ctx!.strokeStyle;
        } else {
          setAlpha(a * (b.far ? 0.3 : 0.22));
          ctx!.fill();
        }

        if (!b.far) {
          ctx!.lineWidth = lineWidth;
          setAlpha(a * 0.75);
          ctx!.stroke();
          ctx!.beginPath();
          ctx!.moveTo(0, 0);
          ctx!.lineTo(L * 0.9, 0);
          for (let k = 1; k <= 3; k++) {
            const x = L * 0.2 * k;
            ctx!.moveTo(x, 0);
            ctx!.lineTo(x + L * 0.1, -Wd * 0.55 * (1 - k * 0.12));
            ctx!.moveTo(x, 0);
            ctx!.lineTo(x + L * 0.1, Wd * 0.55 * (1 - k * 0.12));
          }
          setAlpha(a * 0.3);
          ctx!.stroke();
        }
        ctx!.setTransform(1, 0, 0, 1, 0, 0);
      }
    }

    function animate(time: number) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      const ink = canvasStyle.getPropertyValue("--leaves-color").trim() || canvasStyle.color;
      const k = canvasStyle.getPropertyValue("--leaves-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      for (const b of branches) drawBranch(b, time, alpha * mul * (b.far ? 0.25 : 1));
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    if (opaqueLeaves && !loggedRef.current) {
      const surface = rootStyle.getPropertyValue("--surface").trim();
      const panel = rootStyle.getPropertyValue("--panel").trim();
      const canvasBg = canvasStyle.backgroundColor;
      const baseColor = surface || panel || canvasBg;
      const lightened = baseColor ? lightenColor(baseColor, 0.12) : "";
      bgColorRef.current = lightened;
      console.log("[MimosaPudica] opaqueLeaves bgColor:", {
        "--surface": surface || "(empty)",
        "--panel": panel || "(empty)",
        "canvas.backgroundColor": canvasBg || "(empty)",
        base: baseColor,
        lightened,
      });
      loggedRef.current = true;
    } else if (!opaqueLeaves) {
      loggedRef.current = false;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener("pointermove", (e) => onPointer(e.clientX, e.clientY));
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerout", onPointerLeave);

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", (e) => onPointer(e.clientX, e.clientY));
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerout", onPointerLeave);
    };
  }, [near, far, size, wind, touchSensitivity, reopenSpeed, reopenDelay, leavesPerBranch, sizeTaper, opaqueLeaves, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--leaves-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ touchAction: "none", backgroundColor: "var(--surface, var(--panel))" }} />
    </div>
  );
}