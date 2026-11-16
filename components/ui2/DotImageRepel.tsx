"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "cn";

type RGB = [number, number, number];

type Dot = {
  hx: number; // posisi asal
  hy: number;
  ox: number; // offset dari posisi asal (didorong kursor, lalu kembali)
  oy: number;
  vx: number;
  vy: number;
  r: number;
  base: RGB;
  heat: number; // 0..1, seberapa jauh titik terdorong
  phase: number;
};

type DotImageRepelProps = {
  /** gambar sumber (file lokal di /public). Tanpa ini dipakai ikon play bawaan. */
  src?: string;
  /** jarak antar titik (px); makin kecil makin detail */
  gap?: number;
  /** jari-jari tolakan kursor (px) */
  radius?: number;
  /** pakai warna asli gambar (true) atau gradasi brand (false) */
  keepColors?: boolean;
  /** ukuran ditentukan parent, mis. `aspect-square w-full max-w-md` */
  className?: string;
};

function hexToRgb(value: string, fallback: RGB): RGB {
  const m = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ikon play bawaan: cincin ganda + segitiga. */
function drawGlyph(c: CanvasRenderingContext2D, w: number, h: number) {
  const s = Math.min(w, h);
  const cx = w / 2;
  const cy = h / 2;
  c.clearRect(0, 0, w, h);
  c.strokeStyle = "#fff";
  c.fillStyle = "#fff";

  c.lineWidth = s * 0.055;
  c.beginPath();
  c.arc(cx, cy, s * 0.4, 0, Math.PI * 2);
  c.stroke();

  c.lineWidth = s * 0.02;
  c.beginPath();
  c.arc(cx, cy, s * 0.31, 0, Math.PI * 2);
  c.stroke();

  const r = s * 0.15;
  c.beginPath();
  c.moveTo(cx - r * 0.6, cy - r);
  c.lineTo(cx + r * 1.1, cy);
  c.lineTo(cx - r * 0.6, cy + r);
  c.closePath();
  c.fill();
}

/**
 * Gambar yang tersusun dari titik-titik. Titik menjauh dari kursor lalu
 * kembali ke tempatnya, dan berubah warna saat terdorong.
 */
export default function DotImageRepel({
  src,
  gap = 9,
  radius = 110,
  keepColors = false,
  className,
}: DotImageRepelProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const css = getComputedStyle(document.documentElement);
    const read = (name: string, fb: RGB) => hexToRgb(css.getPropertyValue(name), fb);
    const brand = read("--brand", [139, 92, 246]);
    const brand2 = read("--brand-2", [217, 70, 239]);
    const spark = read("--spark", [163, 230, 53]);

    // perangkat sentuh: titik "hantu" yang berkeliling pelan
    const touchOnly = window.matchMedia("(hover: none)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let inView = true;
    let dots: Dot[] = [];
    let img: HTMLImageElement | null = null;
    const pointer = { x: -9999, y: -9999, on: false };

    const drawSource = (c: CanvasRenderingContext2D) => {
      if (!img) return drawGlyph(c, w, h);
      const ratio = Math.min(w / img.width, h / img.height);
      const dw = img.width * ratio;
      const dh = img.height * ratio;
      c.clearRect(0, 0, w, h);
      c.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    const render = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      let px = pointer.x;
      let py = pointer.y;
      let active = pointer.on;
      if (!active && touchOnly && !reduce) {
        px = w * (0.5 + 0.32 * Math.cos(t * 0.0007));
        py = h * (0.5 + 0.32 * Math.sin(t * 0.0009));
        active = true;
      }

      for (const d of dots) {
        if (!reduce) {
          const dx = d.hx + d.ox - px;
          const dy = d.hy + d.oy - py;
          const dist = Math.hypot(dx, dy);

          if (active && dist < radius) {
            const near = 1 - dist / radius;
            const f = near * near * 2.2;
            d.vx += (dx / (dist || 1)) * f;
            d.vy += (dy / (dist || 1)) * f;
          }

          // pegas: kembali ke posisi asal
          d.vx += -d.ox * 0.05;
          d.vy += -d.oy * 0.05;
          d.vx *= 0.88;
          d.vy *= 0.88;
          d.ox += d.vx;
          d.oy += d.vy;

          const moved = Math.min(1, Math.hypot(d.ox, d.oy) / (gap * 2));
          d.heat += (moved - d.heat) * 0.15;
        }

        const k = Math.min(1, d.heat * 1.3);
        const rr = Math.round(mix(d.base[0], spark[0], k));
        const gg = Math.round(mix(d.base[1], spark[1], k));
        const bb = Math.round(mix(d.base[2], spark[2], k));
        const alpha = reduce ? 0.9 : 0.72 + 0.2 * Math.sin(t * 0.0015 + d.phase);

        ctx.fillStyle = `rgba(${rr},${gg},${bb},${alpha})`;
        ctx.beginPath();
        ctx.arc(d.hx + d.ox, d.hy + d.oy, d.r * (1 + d.heat * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // baca piksel sumber, ubah jadi titik
    const build = () => {
      if (!w || !h) return;
      if (src && !img) return; // tunggu gambar selesai dimuat

      const off = document.createElement("canvas");
      off.width = Math.round(w);
      off.height = Math.round(h);
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      drawSource(octx);

      let data: Uint8ClampedArray;
      try {
        data = octx.getImageData(0, 0, off.width, off.height).data;
      } catch {
        return; // gambar dari domain lain tidak bisa dibaca
      }

      const next: Dot[] = [];
      for (let y = gap / 2; y < off.height; y += gap) {
        for (let x = gap / 2; x < off.width; x += gap) {
          const i = (Math.floor(y) * off.width + Math.floor(x)) * 4;
          const a = data[i + 3] / 255;
          const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
          const strength = img ? a * lum : a;
          if (strength < 0.15) continue;

          const tt = (x / off.width + y / off.height) / 2;
          const base: RGB =
            img && keepColors
              ? [data[i], data[i + 1], data[i + 2]]
              : [
                  Math.round(mix(brand[0], brand2[0], tt)),
                  Math.round(mix(brand[1], brand2[1], tt)),
                  Math.round(mix(brand[2], brand2[2], tt)),
                ];

          next.push({
            hx: x,
            hy: y,
            ox: 0,
            oy: 0,
            vx: 0,
            vy: 0,
            r: gap * (0.16 + 0.3 * strength),
            base,
            heat: 0,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
      dots = next;
      if (reduce) render(0); // satu frame statis
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

    let image: HTMLImageElement | null = null;
    if (src) {
      image = new Image();
      image.onload = () => {
        img = image;
        build();
      };
      image.src = src;
    }

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
      if (image) image.onload = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce, src, gap, radius, keepColors]);

  return <canvas ref={ref} aria-hidden className={cn("h-full w-full", className)} />;
}
