"use client";

import { useTranslations } from "next-intl";

import Button from "@/components/ui2/Button";
import Reveal from "@/components/ui2/Reveal";
import ScrollStory, { type ScrollStoryItem } from "@/components/ui2/ScrollStory";
import SectionHeading from "@/components/ui2/SectionHeading";
import StoryVisual from "@/components/ui2/StoryVisual";

export default function Story() {
  const t = useTranslations("story");
  const items = t.raw("chapters") as ScrollStoryItem[];

  return (
    <section id="story" className="relative bg-bg py-24 text-fg sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          highlight={t("titleHighlight")}
          description={t("description")}
        />

        <div className="mt-16">
          <ScrollStory items={items} renderVisual={(index, play) => <StoryVisual index={index} play={play} />} />
        </div>

        <Reveal className="mx-auto mt-20 max-w-2xl text-center">
          <p className="font-serif text-2xl italic leading-snug text-fg/90 sm:text-3xl">{t("closing")}</p>
          <Button href="#contact" variant="outline" arrow className="mt-8">
            {t("cta")}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
