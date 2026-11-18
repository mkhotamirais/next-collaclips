"use client";

import { useTranslations } from "next-intl";

import Reveal from "@/components/ui2/Reveal";
import SpotlightReveal from "@/components/ui2/SpotlightReveal";

export default function Statement() {
  const t = useTranslations("statement");

  return (
    <section id="statement" className="relative bg-bg px-6 py-24 sm:py-36">
      <Reveal className="mx-auto max-w-4xl text-center">
        <SpotlightReveal className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
          <p>{t("text")}</p>
        </SpotlightReveal>
        {/* <p className="mt-10 text-xs uppercase tracking-[0.2em] text-muted">{t("hint")}</p> */}
      </Reveal>
    </section>
  );
}
