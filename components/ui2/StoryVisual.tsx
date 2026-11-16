"use client";

import { Check, Eye, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "cn";

type Chapter = { label: string; title: string; text: string; meta: string };
type SceneProps = { meta: string; clipTitle: string; reduce: boolean | null };

const BAR_COUNT = 48;
const SPARK_AT = 0.4; // posisi "momen emas" pada video (0..1)
const sparkLeft = `${8 + 84 * SPARK_AT}%`;

// acak yang deterministik agar server dan client sama
const seeded = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => ({
  h: Math.round((0.25 + seeded(i) * 0.6) * 100),
}));

/** Gelombang suara video panjang. `lit` menyalakan bar di sekitar momen emas. */
function Wave({ lit, reduce }: { lit: boolean; reduce: boolean | null }) {
  return (
    <div className="absolute inset-x-[8%] top-1/2 flex h-24 -translate-y-1/2 items-center gap-0.75">
      {BARS.map((b, i) => {
        const near = Math.abs((i + 0.5) / BAR_COUNT - SPARK_AT) < 0.04;
        return (
          <motion.span
            key={i}
            initial={reduce ? false : { scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.012 }}
            style={{ height: `${b.h}%` }}
            className={cn(
              "flex-1 rounded-full transition-colors duration-500",
              near && lit ? "bg-spark" : near ? "bg-white/25" : "bg-white/10",
            )}
          />
        );
      })}
    </div>
  );
}

/* Bab 1 — momen emas yang tenggelam */
function SceneBuried({ reduce }: SceneProps) {
  return (
    <>
      <Wave lit={false} reduce={reduce} />
      <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: sparkLeft }}>
        <motion.span
          animate={reduce ? undefined : { opacity: [0.15, 0.6, 0.15], scale: [1, 1.8, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="block h-2 w-2 rounded-full bg-spark"
        />
      </span>
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-bg/70 via-transparent to-bg/70" />
    </>
  );
}

/* Bab 2 — clipper menemukannya */
function SceneFound({ meta, reduce }: SceneProps) {
  return (
    <>
      <Wave lit reduce={reduce} />

      <motion.div
        initial={reduce ? false : { left: "8%" }}
        animate={{ left: sparkLeft }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-y-[22%] w-px -translate-x-1/2 bg-linear-to-b from-white via-brand-2 to-brand shadow-[0_0_14px_2px] shadow-brand-2/70"
      />

      <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: sparkLeft }}>
        <motion.span
          initial={reduce ? false : { scale: 0.4, opacity: 0 }}
          animate={reduce ? { scale: 1, opacity: 0.6 } : { scale: [0.4, 1.8], opacity: [0.9, 0] }}
          transition={{
            duration: 1.4,
            delay: 1.4,
            repeat: reduce ? 0 : Infinity,
            repeatDelay: 0.6,
          }}
          className="block h-14 w-14 rounded-full border-2 border-brand-2"
        />
      </span>

      <span className="absolute -translate-x-1/2" style={{ left: sparkLeft, top: "20%" }}>
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="block rounded-md bg-brand-2 px-2 py-1 font-mono text-xs font-semibold text-white"
        >
          {meta}
        </motion.span>
      </span>
    </>
  );
}

/* Bab 3 — dipotong dan dipoles */
function SceneCut({ meta, clipTitle, reduce }: SceneProps) {
  const words = clipTitle.split(" ");

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative aspect-9/16 h-[80%] overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-2xl shadow-black/50"
      >
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20" />

        {/* tiga detik pertama: bagian yang harus menarik */}
        <div className="absolute inset-x-3 top-3 h-1 rounded-full bg-white/25">
          <motion.span
            initial={reduce ? false : { width: 0 }}
            animate={{ width: "14%" }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="block h-full rounded-full bg-white"
          />
        </div>
        <span className="absolute right-3 top-6 rounded-md bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-white backdrop-blur-md">
          {meta}
        </span>

        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md">
            <Play className="h-4 w-4 translate-x-0.5 fill-white text-white" />
          </div>
        </div>

        {/* teks yang muncul kata demi kata, seperti caption */}
        <div className="absolute inset-x-3 bottom-4 flex flex-wrap justify-center gap-x-1.5 gap-y-1 rounded-lg bg-black/55 px-2.5 py-2 backdrop-blur-md">
          {words.map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.18, duration: 0.3 }}
              className="text-[11px] font-extrabold uppercase leading-none text-white"
            >
              {w}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* Bab 4 — disetujui bersama */
function SceneApproved({ meta, reduce }: SceneProps) {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div className="absolute inset-0 flex items-center justify-center gap-6 px-8">
      <motion.div
        initial={reduce ? false : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative aspect-9/16 h-[62%] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-linear-to-br from-violet-500 via-fuchsia-500 to-pink-500"
      >
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 grid place-items-center">
          <Play className="h-5 w-5 fill-white text-white" />
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        {/* catatan kecil dari creator */}
        <motion.div
          initial={reduce ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-40 rounded-2xl bg-white/10 p-3 sm:w-44"
        >
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-linear-to-br from-brand to-brand-2" />
            <span className="h-1.5 w-12 rounded-full bg-white/30" />
          </div>
          <span className="mt-2.5 block h-1.5 w-full rounded-full bg-white/20" />
          <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-white/20" />
        </motion.div>

        {/* stempel setuju */}
        <div className="flex items-center gap-3">
          <motion.span
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 14, delay: 1.1 }}
            className="relative grid h-12 w-12 place-items-center rounded-full bg-spark text-bg"
          >
            <Check className="h-6 w-6" strokeWidth={3} />
            {!reduce &&
              angles.map((a) => (
                <motion.span
                  key={a}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: Math.cos((a * Math.PI) / 180) * 34,
                    y: Math.sin((a * Math.PI) / 180) * 34,
                  }}
                  transition={{ duration: 0.8, delay: 1.15 }}
                  className="absolute left-1/2 top-1/2 -ml-0.5 -mt-0.5 h-1 w-1 rounded-full bg-spark"
                />
              ))}
          </motion.span>
          <span className="rounded-md bg-spark/15 px-2 py-1 font-mono text-xs font-semibold text-spark">{meta}</span>
        </div>
      </div>
    </div>
  );
}

/* Bab 5 — menyebar ke mana-mana */
function SceneSpread({ meta, reduce }: SceneProps) {
  const platforms = [
    { name: "TikTok", pos: "left-[8%] top-[22%]" },
    { name: "Reels", pos: "right-[8%] top-[28%]" },
    { name: "Shorts", pos: "left-[16%] bottom-[24%]" },
  ];

  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={reduce ? false : { scale: 0.4, opacity: 0 }}
            animate={reduce ? { scale: 1 + i * 0.4, opacity: 0.3 } : { scale: [0.4, 2.2], opacity: [0.6, 0] }}
            transition={{
              duration: 3,
              repeat: reduce ? 0 : Infinity,
              delay: i,
              ease: "easeOut",
            }}
            className="absolute left-1/2 top-1/2 -ml-20 -mt-20 h-40 w-40 rounded-full border border-brand/40"
          />
        ))}

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-9/16 h-[46%] overflow-hidden rounded-xl border border-white/10 bg-linear-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-xl shadow-black/40"
        >
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <Play className="h-4 w-4 fill-white text-white" />
          </div>
        </motion.div>
      </div>

      {platforms.map((p, i) => (
        <motion.span
          key={p.name}
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.6 + i * 0.2 }}
          className={cn(
            "absolute rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md",
            p.pos,
          )}
        >
          {p.name}
        </motion.span>
      ))}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex items-center gap-2 rounded-full bg-linear-to-r from-brand to-brand-2 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_0_28px_-6px] shadow-brand/70"
        >
          <Eye className="h-4 w-4" />
          {meta}
        </motion.span>
      </div>
    </>
  );
}

const SCENES = [SceneBuried, SceneFound, SceneCut, SceneApproved, SceneSpread];

type StoryVisualProps = {
  /** indeks bab yang sedang aktif */
  index: number;
  /** false = scene tidak dirender (dipakai untuk versi mobile yang belum terlihat) */
  play?: boolean;
  className?: string;
};

export default function StoryVisual({ index, play = true, className }: StoryVisualProps) {
  const t = useTranslations("story");
  const reduce = useReducedMotion();

  const chapters = t.raw("chapters") as Chapter[];
  const clipTitle = t("clipTitle");
  const chapter = chapters[index];
  const Scene = SCENES[index] ?? SceneBuried;

  return (
    <div
      aria-hidden
      className={cn(
        "relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-white/10 bg-surface/60 shadow-[0_40px_120px_-40px] shadow-brand/40 backdrop-blur-xl",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,color-mix(in_oklab,var(--brand)_18%,transparent),transparent)]" />

      <span className="absolute left-5 top-4 z-10 text-[10px] font-semibold uppercase tracking-widest text-muted">
        {chapter?.label}
      </span>
      <div className="absolute right-5 top-4 z-10 flex gap-1.5">
        {chapters.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-5 bg-linear-to-r from-brand to-brand-2" : "w-1.5 bg-white/20",
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {play && (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Scene meta={chapter?.meta ?? ""} clipTitle={clipTitle} reduce={reduce} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
