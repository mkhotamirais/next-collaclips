"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "cn";

import SparkleField from "./SparkleField";

// tekstur grain halus agar latar terasa seperti film
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

type MagicBackgroundProps = {
  className?: string;
  /** bintik berkilau yang bereaksi pada kursor */
  sparkles?: boolean;
};

/**
 * Latar "magis" yang tenang: sorot cahaya, dua gumpalan cahaya yang melayang,
 * garis penggaris tipis, bintik berkilau, dan grain. Taruh di dalam elemen
 * yang `relative isolate`.
 */
export default function MagicBackground({ className, sparkles = true }: MagicBackgroundProps) {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--brand)_22%,transparent),transparent)]" />

      <motion.div
        animate={reduce ? undefined : { x: [-40, 40, -40], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 top-10 h-[640px] w-[640px] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--brand)_26%,transparent),transparent)]"
      />
      <motion.div
        animate={reduce ? undefined : { x: [40, -40, 40], y: [30, 0, 30] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-40 top-40 h-[640px] w-[640px] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--brand-2)_18%,transparent),transparent)]"
      />

      <div className="absolute inset-0 opacity-[0.05] [background-image:repeating-linear-gradient(to_right,white_0,white_1px,transparent_1px,transparent_96px)] [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" />

      {sparkles && <SparkleField density={22000} radius={110} />}

      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
