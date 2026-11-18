"use client";

import { useTranslations } from "next-intl";

import Button from "@/components/ui2/Button";
import CheckList from "@/components/ui2/CheckList";
import CountUp from "@/components/ui2/CountUp";
import Reveal from "@/components/ui2/Reveal";
import SectionHeading from "@/components/ui2/SectionHeading";

type Figure = { value: number; suffix?: string; label: string };

export default function Creators() {
  const t = useTranslations("creators");
  const benefits = t.raw("benefits") as string[];
  const figures = t.raw("figures") as Figure[];

  return (
    <section id="creators" className="relative border-t border-line bg-bg py-24 text-fg sm:py-32">
      <div className="mx-auto grid max-w-6xl 2xl:max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20">
        {/* angka */}
        <Reveal className="order-2 lg:order-1">
          <div className="divide-y divide-line rounded-3xl border border-line bg-surface/40">
            {figures.map((f) => (
              <div key={f.label} className="p-8 sm:p-10">
                <p className="font-display text-6xl font-light tabular-nums tracking-tight sm:text-7xl">
                  <CountUp value={f.value} suffix={f.suffix} />
                </p>
                <p className="mt-3 text-muted">{f.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* teks */}
        <div className="order-1 lg:order-2">
          <SectionHeading
            align="left"
            eyebrow={t("eyebrow")}
            title={t("title")}
            highlight={t("titleHighlight")}
            description={t("description")}
          />
          <Reveal delay={0.1} className="mt-8">
            <CheckList items={benefits} />
          </Reveal>
          <Reveal delay={0.2}>
            <Button href="#contact" arrow className="mt-8">
              {t("cta")}
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
