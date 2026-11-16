"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { Play, Scissors } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";

import { cn } from "cn";

type Card = {
  category: string;
  title: string;
  views: string;
  duration: string;
};

const TOTAL_SECONDS = 7512; // 02:05:12
const LOOP_SECONDS = 10; // lama playhead menyapu satu video
const BAR_COUNT = 72;

// momen yang "dipotong": posisi awal dan lebar (0..1 dari panjang video)
const SEGMENTS = [
  {
    at: 0.11,
    w: 0.09,
    bar: "bg-brand",
    box: "border-brand/60 bg-brand/15",
    thumb: "from-violet-500 to-fuchsia-500",
  },
  {
    at: 0.43,
    w: 0.11,
    bar: "bg-brand-2",
    box: "border-brand-2/60 bg-brand-2/15",
    thumb: "from-fuchsia-600 to-rose-500",
  },
  {
    at: 0.76,
    w: 0.08,
    bar: "bg-spark",
    box: "border-spark/60 bg-spark/15",
    thumb: "from-lime-400 to-emerald-500",
  },
] as const;

// acak yang deterministik, supaya server dan client menghasilkan bentuk sama
const seeded = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// bentuk gelombang suara: naik turun seperti orang berbicara
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const base = 0.25 + seeded(i) * 0.55;
  const envelope = 0.6 + 0.4 * Math.sin((i / BAR_COUNT) * Math.PI * 3.2);
  return {
    height: Math.round(Math.min(1, base * envelope + 0.12) * 100),
    r: seeded(i + 99),
  };
});

const fmt = (seconds: number) => {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
};

const TICKS = [0, 0.25, 0.5, 0.75, 1].map((p) => fmt(p * TOTAL_SECONDS));

export default function ClipTimeline() {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();
  const clips = (t.raw("cards") as Card[]).slice(0, SEGMENTS.length);

  // 0..1: posisi playhead
  const progress = useMotionValue(0);
  const [inside, setInside] = useState(-1); // indeks momen yang sedang dipotong
  const [passed, setPassed] = useState(0); // jumlah momen yang sudah selesai

  const trackRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<() => void>(() => {});
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hovering = useRef(false);

  const timecode = useTransform(progress, (v) => fmt(v * TOTAL_SECONDS));
  const playheadLeft = useTransform(progress, (v) => `${v * 100}%`);

  // state hanya berubah saat melewati batas momen, bukan di setiap frame
  useMotionValueEvent(progress, "change", (v) => {
    let ins = -1;
    let done = 0;
    SEGMENTS.forEach((s, i) => {
      if (v >= s.at && v < s.at + s.w) ins = i;
      if (v >= s.at + s.w) done = i + 1;
    });
    setInside(ins);
    setPassed(done);
  });

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    controls.current?.stop();
  }, []);

  const play = useCallback(() => {
    clear();
    const remaining = Math.max(1 - progress.get(), 0.001);
    controls.current = animate(progress, 1, {
      duration: remaining * LOOP_SECONDS,
      ease: "linear",
      onComplete: () => {
        timer.current = setTimeout(() => {
          progress.set(0);
          timer.current = setTimeout(() => playRef.current(), 700);
        }, 2400);
      },
    });
  }, [clear, progress]);

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    if (reduce) {
      progress.set(1); // tampilan akhir, tanpa gerak
      return;
    }
    timer.current = setTimeout(play, 1200);
    return clear;
  }, [reduce, play, clear, progress]);

  // geser playhead sendiri dengan kursor
  const onPointerEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    hovering.current = true;
    clear();
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!hovering.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    progress.set(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
  };
  const onPointerLeave = () => {
    if (!hovering.current) return;
    hovering.current = false;
    if (!reduce) play();
  };

  const status = inside >= 0 ? "cutting" : passed >= SEGMENTS.length ? "done" : "idle";

  return (
    <div
      aria-hidden
      className="relative mx-auto w-full max-w-4xl rounded-[1.75rem] border border-white/10 bg-surface/50 p-4 text-left shadow-[0_40px_120px_-40px] shadow-brand/40 backdrop-blur-xl sm:p-6"
    >
      {/* kilau tipis di tepi atas panel */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

      {/* header: timecode dan status */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">{t("timeline.source")}</span>
          <span className="font-mono text-sm tabular-nums text-fg">
            <motion.span>{timecode}</motion.span>
            <span className="text-muted"> / {fmt(TOTAL_SECONDS)}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              status === "cutting" && "animate-pulse bg-brand-2",
              status === "done" && "bg-spark",
              status === "idle" && "bg-white/40",
            )}
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={status}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {t(`timeline.status.${status}`)}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* trek: gelombang suara + momen + playhead */}
      <div
        ref={trackRef}
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative mt-9 h-24 cursor-col-resize select-none"
      >
        <div className="absolute inset-0 flex items-center gap-0.75">
          {BARS.map((b, i) => {
            const pos = (i + 0.5) / BAR_COUNT;
            const seg = SEGMENTS.findIndex((s) => pos >= s.at && pos <= s.at + s.w);
            const lit = seg >= 0 && (inside === seg || passed > seg);

            return (
              <motion.span
                key={i}
                style={{ height: `${b.height}%` }}
                animate={reduce ? undefined : { scaleY: [1, 0.55 + b.r * 0.3, 1] }}
                transition={{
                  duration: 1.6 + b.r * 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: b.r,
                }}
                className={cn(
                  "flex-1 rounded-full transition-colors duration-300",
                  lit ? SEGMENTS[seg].bar : "bg-white/15",
                )}
              />
            );
          })}
        </div>

        {SEGMENTS.map((s, i) => {
          const active = inside === i || passed > i;

          return (
            <div
              key={i}
              style={{ left: `${s.at * 100}%`, width: `${s.w * 100}%` }}
              className={cn(
                "absolute -inset-y-1.5 rounded-xl border transition-all duration-300",
                active ? cn("border-solid", s.box) : "border-dashed border-white/15",
              )}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                <AnimatePresence>
                  {passed > i && (
                    <motion.span
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="block rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-fg"
                    >
                      {clips[i]?.duration}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {/* playhead */}
        <motion.div
          style={{ left: playheadLeft }}
          className="pointer-events-none absolute -bottom-2 -top-3 z-10 w-px -translate-x-1/2 bg-linear-to-b from-white via-brand-2 to-brand shadow-[0_0_16px_2px] shadow-brand-2/70"
        >
          <motion.span
            animate={inside >= 0 && !reduce ? { rotate: [0, -18, 18, -18, 0] } : { rotate: 0 }}
            transition={{ duration: 0.5, repeat: inside >= 0 ? Infinity : 0 }}
            className="absolute -top-6 left-1/2 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full bg-white text-bg shadow-lg"
          >
            <Scissors className="h-3.5 w-3.5" />
          </motion.span>
        </motion.div>
      </div>

      {/* skala waktu */}
      <div className="mt-3 flex justify-between font-mono text-[10px] tabular-nums text-muted">
        {TICKS.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>

      {/* klip yang dihasilkan */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {clips.map((c, i) => (
          <div key={c.title} className="relative min-h-23">
            <div className="absolute inset-0 rounded-2xl border border-dashed border-white/10" />
            <AnimatePresence>
              {passed > i && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 16, scale: 0.94, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className="relative flex items-center gap-3 rounded-2xl border border-line bg-bg/70 p-3 backdrop-blur-md"
                >
                  <div
                    className={cn(
                      "grid h-17 w-9.5 shrink-0 place-items-center rounded-lg bg-linear-to-br",
                      SEGMENTS[i].thumb,
                    )}
                  >
                    <Play className="h-3.5 w-3.5 fill-white text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">{c.category}</p>
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">{c.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {c.duration} · {c.views}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
