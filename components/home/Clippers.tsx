"use client";

import { useId, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "cn";

import Button from "@/components/ui2/Button";
import CheckList from "@/components/ui2/CheckList";
import Reveal from "@/components/ui2/Reveal";
import SectionHeading from "@/components/ui2/SectionHeading";

type Category = { id: string; label: string };
type Source = {
  title: string;
  creator: string;
  /** id kategori, harus cocok dengan salah satu id di `categories` */
  category: string;
  duration: string;
  url: string;
};

export default function Clippers() {
  const t = useTranslations("clippers");
  const reduce = useReducedMotion();
  const pillId = useId();
  const [active, setActive] = useState("all");

  const benefits = t.raw("benefits") as string[];
  const categories = t.raw("sources.categories") as Category[];
  const items = t.raw("sources.items") as Source[];

  const labelOf = (id: string) => categories.find((c) => c.id === id)?.label ?? id;
  const visible = active === "all" ? items : items.filter((i) => i.category === active);

  return (
    <section id="clippers" className="relative bg-bg py-24 text-fg sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* pengantar */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              align="left"
              eyebrow={t("eyebrow")}
              title={t("title")}
              highlight={t("titleHighlight")}
              description={t("description")}
            />
            <Reveal delay={0.2}>
              <Button href="#contact" arrow className="mt-8">
                {t("cta")}
              </Button>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <CheckList items={benefits} />
          </Reveal>
        </div>

        {/* bahan yang bisa dipotong */}
        <div className="mt-24 border-t border-line pt-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <Reveal>
              <h3 className="font-display text-2xl font-medium sm:text-3xl">{t("sources.title")}</h3>
              <p className="mt-2 max-w-md text-muted">{t("sources.description")}</p>
            </Reveal>

            <div role="group" aria-label={t("sources.filterLabel")} className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const isActive = c.id === active;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActive(c.id)}
                    aria-pressed={isActive}
                    className={cn(
                      "relative isolate cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium outline-none transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-brand",
                      isActive ? "border-transparent text-bg!" : "border-line text-muted hover:text-fg",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId={pillId}
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-full bg-fg"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <motion.ul layout className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((item) => (
                <motion.li
                  key={item.url}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col rounded-2xl border border-line bg-surface/40 p-5 outline-none transition-colors hover:border-white/20 hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="uppercase tracking-[0.15em]">{labelOf(item.category)}</span>
                      <span className="font-mono tabular-nums">{item.duration}</span>
                    </div>
                    <h4 className="mt-4 line-clamp-2 font-display text-lg font-medium leading-snug">{item.title}</h4>
                    <div className="mt-auto flex items-center justify-between pt-6 text-sm">
                      <span className="text-muted">{item.creator}</span>
                      <span className="inline-flex items-center gap-1 text-fg/80 transition-colors group-hover:text-fg">
                        {t("sources.openLabel")}
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </a>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
