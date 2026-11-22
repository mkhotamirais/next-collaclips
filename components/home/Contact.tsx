"use client";

// import { ArrowUpRight, AtSign, MessageCircle, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import ContactForm from "@/components/ui2/ContactForm";
import Reveal from "@/components/ui2/Reveal";
import SectionHeading from "@/components/ui2/SectionHeading";
import SmokeSection from "@/components/ui2/SmokeSection";

// type Channel = { id: string; label: string; value: string; href: string };

// const ICONS: Record<string, LucideIcon> = {
//   whatsapp: MessageCircle,
//   instagram: AtSign,
// };

export default function Contact() {
  const t = useTranslations("contact");

  // email dikirim lewat form; di sini hanya jalur langsung (WhatsApp dan Instagram)
  // const channels = (t.raw("channels") as Channel[]).filter((c) => c.id !== "email");

  return (
    <SmokeSection id="contact" className="bg-bg py-28 text-fg sm:py-36">
      <div className="container">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          highlight={t("titleHighlight")}
          description={t("description")}
        />

        {/* <div className="mx-auto mt-14 grid max-w-5xl gap-10 md:grid-cols-[1.5fr_1fr] lg:gap-12 px-6"> */}
        <div className="mx-auto mt-14 max-w-3xl sm:px-6">
          <Reveal delay={0.1}>
            <div className="rounded-xl sm:rounded-3xl border border-line bg-surface/40 p-4 sm:backdrop-blur-xl sm:p-8">
              <ContactForm />
            </div>
          </Reveal>

          {/* <Reveal delay={0.2}>
            <h3 className="font-display text-xl font-medium">{t("direct.title")}</h3>
            <p className="mt-2 text-muted">{t("direct.description")}</p>

            <ul className="mt-6 space-y-3">
              {channels.map((c) => {
                const Icon = ICONS[c.id] ?? MessageCircle;
                return (
                  <li key={c.id}>
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 rounded-2xl border border-line bg-bg/50 p-5 backdrop-blur-md outline-none transition-colors hover:border-white/20 focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand/40 text-brand">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                          {c.label}
                        </span>
                        <span className="mt-0.5 block truncate text-sm font-medium">{c.value}</span>
                      </span>
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </Reveal> */}
        </div>
      </div>
    </SmokeSection>
  );
}
