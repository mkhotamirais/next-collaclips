"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";

type CountUpProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** lama animasi (detik) */
  duration?: number;
  className?: string;
};

/** Angka yang menghitung naik dari 0 saat masuk layar. Format mengikuti locale aktif. */
export default function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className,
}: CountUpProps) {
  const locale = useLocale();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const mv = useMotionValue(0);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [locale, decimals],
  );
  const text = useTransform(mv, (v) => `${prefix}${formatter.format(v)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, reduce, value, duration, mv]);

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  );
}
