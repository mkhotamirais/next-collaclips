"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "cn";

type RGB = [number, number, number];

type Puff = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  grow: number;
  rot: number;
  vr: number;
  life: number; // 0..1
  duration: number; // ms
  sprite: number;
  alpha: number;
  phase: number;
};

type SmokeSectionProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

const SPRITE_SIZE = 160;

function hexToRgb(value: string, fallback: RGB): RGB {
  const m = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Gumpalan asap tak beraturan: beberapa gradien lembut yang saling menimpa. */
function makeSprite(color: RGB): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = SPRITE_SIZE;
  const g = c.getContext("2d")!;
  for (let i = 0; i < 7; i++) {
    const x = SPRITE_SIZE * (0.3 + Math.random() * 0.4);
    const y = SPRITE_SIZE * (0.3 + Math.random() * 0.4);
    const r = SPRITE_SIZE * (0.18 + Math.random() * 0.22);
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},0.55)`);
    grad.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  }
  return c;
}

/**
 * Section dengan asap lembut yang naik pelan di latarnya. Tepi atas dan
 * bawah memudar agar menyatu dengan section di sekitarnya.
 */
export default function SmokeSection({ children, id, className }: SmokeSectionProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const css = getComputedStyle(document.documentElement);
    const read = (name: string, fb: RGB) => hexToRgb(css.getPropertyValue(name), fb);

    // sebagian besar ungu, sedikit fuchsia dan putih keabuan
    const sprites = [
      makeSprite(read("--brand", [139, 92, 246])),
      makeSprite(read("--brand", [139, 92, 246])),
      makeSprite(read("--brand-2", [217, 70, 239])),
      makeSprite(read("--fg", [245, 245, 250])),
    ];

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let inView = true;
    let puffs: Puff[] = [];

    const spawn = (p: Partial<Puff>, initial: boolean): Puff => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 60,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.18 + Math.random() * 0.35),
      size: 160 + Math.random() * 180,
      grow: 0.05 + Math.random() * 0.08,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.0004,
      life: initial ? Math.random() : 0,
      duration: 14000 + Math.random() * 10000,
      sprite: Math.floor(Math.random() * sprites.length),
      alpha: 0.07 + Math.random() * 0.09,
      phase: Math.random() * Math.PI * 2,
      ...p,
    });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of puffs) {
        const s = p.size * (1 + p.life * 1.2);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha * Math.sin(Math.PI * p.life);
        ctx.drawImage(sprites[p.sprite], -s / 2, -s / 2, s, s);
        ctx.restore();
      }
    };

    const step = (t: number) => {
      const dt = Math.min(t - last, 64);
      last = t;
      const k = dt / 16.7;

      for (let i = 0; i < puffs.length; i++) {
        const p = puffs[i];
        p.life += dt / p.duration;
        p.x += (p.vx + Math.sin(t * 0.0003 + p.phase) * 0.18) * k;
        p.y += p.vy * k;
        p.rot += p.vr * dt;
        p.size += p.grow * k;
        if (p.life >= 1) puffs[i] = spawn({}, false);
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (!raf && !reduce && inView && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(12, Math.min(32, Math.round(w / 45)));
      puffs = Array.from({ length: count }, () => spawn({}, true));
      if (reduce) draw(); // satu frame statis
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    io.observe(canvas);

    if (!reduce) {
      document.addEventListener("visibilitychange", onVisibility);
      start();
    }

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  return (
    <section id={id} className={cn("relative isolate overflow-hidden", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_25%,black_80%,transparent)] [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_80%,transparent)]"
      >
        <canvas ref={ref} className="h-full w-full" />
      </div>
      {children}
    </section>
  );
}
