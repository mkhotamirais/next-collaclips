"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "cn";

// import Button from "@/components/ui2/Button";
import Reveal from "@/components/ui2/Reveal";
import SectionHeading from "@/components/ui2/SectionHeading";

type FaqItem = { q: string; a: string };

export default function FAQ() {
  const t = useTranslations("faq");
  const reduce = useReducedMotion();
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  const KEEP = [0, 1, 6, 7];

  // const items = t.raw("items").slice(1, 3) as FaqItem[];
  const items = (t.raw("items") as FaqItem[]).filter((_, i) => KEEP.includes(i));

  return (
    <section id="faq" className="relative bg-bg py-24 text-fg sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          highlight={t("titleHighlight")}
          description={t("description")}
        />

        <Reveal className="mx-auto mt-14 max-w-3xl">
          <div className="border-t border-line">
            {items.map((item, i) => {
              const isOpen = open === i;
              const buttonId = `${baseId}-button-${i}`;
              const panelId = `${baseId}-panel-${i}`;

              return (
                <div key={item.q} className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left outline-none focus-visible:text-brand"
                    >
                      <span
                        className={cn(
                          "font-display text-base font-medium transition-colors sm:text-lg",
                          isOpen ? "text-fg" : "text-fg/80 group-hover:text-fg",
                        )}
                      >
                        {item.q}
                      </span>
                      <motion.span
                        aria-hidden
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: reduce ? 0 : 0.25 }}
                        className={cn("shrink-0 transition-colors", isOpen ? "text-brand" : "text-muted")}
                      >
                        <Plus className="h-5 w-5" />
                      </motion.span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="panel"
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: reduce ? 0 : 0.3,
                          ease: "easeInOut",
                        }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 leading-relaxed text-muted">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* <div className="mt-14 text-center">
            <p className="font-display text-xl font-medium">{t("stillAsking.title")}</p>
            <p className="mt-2 text-muted">{t("stillAsking.description")}</p>
            <Button href="#contact" variant="outline" className="mt-6">
              {t("stillAsking.cta")}
            </Button>
          </div> */}
        </Reveal>
      </div>
    </section>
  );
}
