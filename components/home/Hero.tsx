"use client";

// import { MousePointer2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, type Variants } from "motion/react";

import Button from "@/components/ui2/Button";
import CountUp from "@/components/ui2/CountUp";
import DotImageRepel from "@/components/ui2/DotImageRepel";
import MagicBackground from "@/components/ui2/MagicBackground";

type Stat = { value: number; suffix?: string; decimals?: number; label: string };

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function Hero() {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();
  const stats = t.raw("stats") as Stat[];

  return (
    <section
      id="home"
      className="relative isolate flex min-h-svh items-center overflow-hidden bg-bg pb-16 pt-28 text-fg"
    >
      <MagicBackground />

      <div className="mx-auto grid w-full max-w-6xl 2xl:max-w-7xl items-center gap-12 px-6 xl:grid-cols-[1.3fr_0.7fr]">
        <motion.div
          variants={stagger}
          initial={reduce ? false : "hidden"}
          animate="show"
          className="text-center xl:text-left"
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-spark" />
            {t("badge")}
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl 2xl:text-7xl"
          >
            {t.rich("title", {
              miring: (chunks) => <span className="highlight-hero">{chunks}</span>,
            })}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg xl:mx-0"
          >
            {t("description")}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center xl:justify-start"
          >
            <Button href="#creators" variant="primary">
              {t("ctaCreator")}
            </Button>
            <Button href="#clippers" variant="ghost" arrow>
              {t("ctaClipper")}
            </Button>
          </motion.div>

          <motion.dl
            variants={fadeUp}
            className="mt-12 grid max-w-xl grid-cols-2 md:grid-cols-4 gap-6 border-t border-line pt-6 text-center sm:text-left mx-auto xl:mx-0"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-display text-2xl font-medium tabular-nums sm:text-3xl">
                  <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
                </dd>
                <dt className="mt-1 text-xs text-muted">{s.label}</dt>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="mx-auto w-full max-w-sm"
        >
          <DotImageRepel className="aspect-square" />
          {/* <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
            <MousePointer2 className="h-3.5 w-3.5 text-brand" />
            {t("hint")}
          </p> */}
        </motion.div>
      </div>
    </section>
  );
}
