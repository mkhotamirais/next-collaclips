"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring } from "motion/react";

import { cn } from "cn";

export type ScrollStoryItem = {
  label: string;
  title: string;
  text: string;
  meta?: string;
};

type ScrollStoryProps = {
  items: ScrollStoryItem[];
  /** gambar panggung untuk bab ke-`index`; `play` = apakah boleh dimainkan */
  renderVisual: (index: number, play: boolean) => ReactNode;
  className?: string;
};

/** Versi mobile: visual tampil di dalam bab, baru diputar saat terlihat. */
function InlineVisual({ index, renderVisual }: { index: number; renderVisual: ScrollStoryProps["renderVisual"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });

  return (
    <div ref={ref} className="mb-6 lg:hidden">
      {renderVisual(index, inView)}
    </div>
  );
}

function Step({
  index,
  item,
  activeIndex,
  onActive,
  renderVisual,
}: {
  index: number;
  item: ScrollStoryItem;
  activeIndex: number;
  onActive: (i: number) => void;
  renderVisual: ScrollStoryProps["renderVisual"];
}) {
  const ref = useRef<HTMLElement>(null);
  // bab dianggap aktif saat melewati garis tengah layar
  const hit = useInView(ref, { margin: "-45% 0px -45% 0px" });

  useEffect(() => {
    if (hit) onActive(index);
  }, [hit, index, onActive]);

  const active = index === activeIndex;
  const reached = index <= activeIndex;

  return (
    <article
      ref={ref}
      className={cn(
        "relative flex min-h-[50vh] flex-col justify-center py-10 pl-8 transition-opacity duration-500 lg:min-h-[65vh] lg:pl-10",
        active ? "opacity-100" : "lg:opacity-35",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300",
          reached ? "border-brand bg-brand shadow-[0_0_14px] shadow-brand" : "border-line bg-bg",
        )}
      />

      <InlineVisual index={index} renderVisual={renderVisual} />

      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{item.label}</span>
      <h3 className="mt-3 font-display text-2xl font-medium leading-tight sm:text-3xl">{item.title}</h3>
      <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{item.text}</p>
      {item.meta && (
        <span className="mt-6 w-fit rounded-full border border-line px-3 py-1 font-mono text-xs text-fg">
          {item.meta}
        </span>
      )}
    </article>
  );
}

/**
 * Cerita yang berganti bab saat di-scroll. Di desktop panggung visual
 * menempel di kiri; di mobile visual ikut di dalam tiap bab.
 */
export default function ScrollStory({ items, renderVisual, className }: ScrollStoryProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // garis progres yang terisi mengikuti scroll
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 60%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  return (
    <div className={cn("grid gap-12 lg:grid-cols-2 lg:gap-20", className)}>
      <div className="relative hidden lg:block">
        <div className="sticky top-28">{renderVisual(active, true)}</div>
      </div>

      <div ref={listRef} className="relative">
        <div aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-line">
          <motion.div
            style={{ scaleY: reduce ? 1 : fill }}
            className="h-full origin-top bg-gradient-to-b from-brand to-brand-2"
          />
        </div>

        {items.map((item, i) => (
          <Step
            key={item.label}
            index={i}
            item={item}
            activeIndex={active}
            onActive={setActive}
            renderVisual={renderVisual}
          />
        ))}
      </div>
    </div>
  );
}
