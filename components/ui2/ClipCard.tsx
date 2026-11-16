"use client";

import Image from "next/image";
import { Eye, Play } from "lucide-react";
import { motion, useReducedMotion, type MotionValue } from "motion/react";

import { cn } from "cn";

export type ClipCardProps = {
  title: string;
  category: string;
  views: string;
  duration: string;
  /** kelas gradient Tailwind, contoh: "from-violet-500 to-fuchsia-500" */
  gradient: string;
  /** thumbnail opsional (file lokal di /public). Tanpa ini kartu memakai gradient. */
  image?: string;
  /** offset parallax dari kursor (px), dibuat di parent dengan useTransform */
  parallax?: { x: MotionValue<number>; y: MotionValue<number> };
  /** posisi dan lebar kartu (absolute, rotate, z-index, w-*) */
  className?: string;
  delay?: number;
  floatDuration?: number;
};

export default function ClipCard({
  title,
  category,
  views,
  duration,
  gradient,
  image,
  parallax,
  className,
  delay = 0,
  floatDuration = 5,
}: ClipCardProps) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("absolute", className)}>
      {/* lapisan 1: parallax mengikuti kursor */}
      <motion.div style={parallax ? { x: parallax.x, y: parallax.y } : undefined}>
        {/* lapisan 2: animasi masuk */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 48, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        >
          {/* lapisan 3: melayang terus-menerus */}
          <motion.div
            animate={reduce ? undefined : { y: [0, -12, 0] }}
            transition={{
              duration: floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay + 0.8,
            }}
            className={cn(
              "relative aspect-[9/16] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br shadow-2xl shadow-black/50",
              gradient,
            )}
          >
            {image && <Image src={image} alt="" fill sizes="224px" className="object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

            <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              {category}
            </span>
            <span className="absolute right-3 top-3 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
              {duration}
            </span>

            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md">
                <Play className="h-5 w-5 translate-x-0.5 fill-white text-white" />
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 space-y-1 p-3.5">
              <p className="text-sm font-semibold leading-snug text-white">{title}</p>
              <p className="flex items-center gap-1.5 text-xs text-white/70">
                <Eye className="h-3.5 w-3.5" />
                {views}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
