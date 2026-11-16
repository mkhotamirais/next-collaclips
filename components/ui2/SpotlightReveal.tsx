"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";

import { cn } from "cn";

type SpotlightRevealProps = {
  /** konten statis (teks). Dirender dua kali: redup dan terang di dalam sorot. */
  children: ReactNode;
  className?: string;
  /** jari-jari sorot (px) */
  radius?: number;
};

/**
 * Teks redup yang "menyala" di area sorot yang mengikuti kursor.
 * Warna teks diatur wrapper ini, jadi jangan beri warna sendiri pada children.
 * Di perangkat sentuh, sorot bergerak pelan sendiri.
 */
export default function SpotlightReveal({ children, className, radius = 240 }: SpotlightRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glow = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 30 });
  const sy = useSpring(y, { stiffness: 220, damping: 30 });
  const sglow = useSpring(glow, { stiffness: 120, damping: 24 });

  const mask = useMotionTemplate`radial-gradient(circle ${radius}px at ${sx}px ${sy}px, black 0%, transparent 100%)`;

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
    glow.set(1);
  };
  const onPointerLeave = () => glow.set(0);

  // perangkat sentuh tidak punya kursor: sorot melayang pelan sendiri
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    if (!window.matchMedia("(hover: none)").matches) return;

    const { width, height } = el.getBoundingClientRect();
    glow.set(1);
    const cx = animate(x, [width * 0.15, width * 0.85], {
      duration: 7,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    });
    const cy = animate(y, [height * 0.3, height * 0.7], {
      duration: 5,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    });
    return () => {
      cx.stop();
      cy.stop();
    };
  }, [reduce, x, y, glow]);

  return (
    <div ref={ref} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className={cn("relative", className)}>
      <div className="text-fg/45">{children}</div>
      <motion.div
        aria-hidden
        style={{ maskImage: mask, WebkitMaskImage: mask, opacity: sglow }}
        className="pointer-events-none absolute inset-0 text-fg"
      >
        {children}
      </motion.div>
    </div>
  );
}
