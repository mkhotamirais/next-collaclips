"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "cn";

type RGB = [number, number, number];

type Particle = {
  hx: number; // posisi asal
  hy: number;
  ox: number; // offset dari posisi asal (didorong kursor, lalu kembali)
  oy: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  speed: number;
  star: boolean;
  accent: RGB;
  heat: number; // 0..1, seberapa dekat dengan kursor
};

type SparkleFieldProps = {
  className?: string;
  /** luas area (px²) per partikel; makin kecil makin rapat */
  density?: number;
  /** jari-jari pengaruh kursor (px) */
  radius?: number;
};

function hexToRgb(value: string, fallback: RGB): RGB {
  const m = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export default function SparkleField({ className, density = 9000, radius = 130 }: SparkleFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // warna diambil dari token di globals.css
    const css = getComputedStyle(document.documentElement);
    const read = (name: string, fb: RGB) => hexToRgb(css.getPropertyValue(name), fb);
    const brand = read("--brand", [139, 92, 246]);
    const brand2 = read("--brand-2", [217, 70, 239]);
    const spark = read("--spark", [163, 230, 53]);
    const fg = read("--fg", [245, 245, 250]);

    const pickAccent = (): RGB => {
      const r = Math.random();
      return r < 0.45 ? brand : r < 0.85 ? brand2 : spark;
    };

    // perangkat sentuh tidak punya kursor: pakai titik "hantu" yang melayang pelan
    const touchOnly = window.matchMedia("(hover: none)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let inView = true;
    let particles: Particle[] = [];
    const pointer = { x: -9999, y: -9999, on: false, s: 0 };

    const build = () => {
      const count = Math.min(Math.round((w * h) / density), 170);
      particles = Array.from({ length: count }, () => {
        const star = Math.random() < 0.28;
        return {
          hx: Math.random() * w,
          hy: Math.random() * h,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
          r: star ? 1.8 + Math.random() * 1.8 : 0.5 + Math.random() * 0.9,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 1.4,
          star,
          accent: pickAccent(),
          heat: 0,
        };
      });
    };

    const drawStar = (x: number, y: number, r: number) => {
      const k = r * 0.25;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + k, y - k);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x + k, y + k);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - k, y + k);
      ctx.lineTo(x - r, y);
      ctx.lineTo(x - k, y - k);
      ctx.closePath();
      ctx.fill();
    };

    const render = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      let px = pointer.x;
      let py = pointer.y;
      let active = pointer.on;
      if (!active && touchOnly && !reduce) {
        px = w * (0.5 + 0.35 * Math.sin(t * 0.0004));
        py = h * (0.45 + 0.3 * Math.sin(t * 0.0006 + 1));
        active = true;
      }
      pointer.s += ((active ? 1 : 0) - pointer.s) * 0.08;

      // cahaya lembut mengikuti kursor
      if (pointer.s > 0.01) {
        const g = ctx.createRadialGradient(px, py, 0, px, py, radius * 1.6);
        g.addColorStop(0, `rgba(${brand[0]},${brand[1]},${brand[2]},${0.16 * pointer.s})`);
        g.addColorStop(1, `rgba(${brand[0]},${brand[1]},${brand[2]},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      for (const p of particles) {
        let near = 0;

        if (!reduce) {
          const dx = p.hx + p.ox - px;
          const dy = p.hy + p.oy - py;
          const d = Math.hypot(dx, dy);

          if (active && d < radius) {
            near = 1 - d / radius;
            const f = near * near * 1.2;
            p.vx += (dx / (d || 1)) * f;
            p.vy += (dy / (d || 1)) * f;
          }

          // pegas: kembali ke posisi asal
          p.vx += -p.ox * 0.04;
          p.vy += -p.oy * 0.04;
          p.vx *= 0.9;
          p.vy *= 0.9;
          p.ox += p.vx;
          p.oy += p.vy;
          p.heat += (near - p.heat) * 0.12;
        }

        const tw = reduce ? 0.7 : 0.5 + 0.5 * Math.sin(t * 0.001 * p.speed + p.phase);
        const alpha = Math.min(1, 0.18 + tw * 0.35 + p.heat * 0.7);
        const k = Math.min(1, p.heat * 1.5);
        const rr = Math.round(mix(fg[0], p.accent[0], k));
        const gg = Math.round(mix(fg[1], p.accent[1], k));
        const bb = Math.round(mix(fg[2], p.accent[2], k));
        const x = p.hx + p.ox;
        const y = p.hy + p.oy;
        const r = p.r * (1 + p.heat * 1.8);

        if (p.heat > 0.25) {
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${alpha * 0.18})`;
          ctx.beginPath();
          ctx.arc(x, y, r * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${rr},${gg},${bb},${alpha})`;
        if (p.star) {
          drawStar(x, y, r * 1.6);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (t: number) => {
      render(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !reduce && inView && !document.hidden) {
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (reduce) render(0); // satu frame statis
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.on = true;
    };
    const onLeave = () => {
      pointer.on = false;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // hentikan animasi saat tidak terlihat supaya hemat baterai
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    io.observe(canvas);

    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("blur", onLeave);
      document.documentElement.addEventListener("mouseleave", onLeave);
      document.addEventListener("visibilitychange", onVisibility);
      start();
    }

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce, density, radius]);

  return (
    <canvas ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />
  );
}
