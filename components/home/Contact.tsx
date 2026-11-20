"use client";

import { AtSign, Mail, MessageCircle, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

import CopyButton from "@/components/ui2/CopyButton";
import Reveal from "@/components/ui2/Reveal";
import SectionHeading from "@/components/ui2/SectionHeading";
import SmokeSection from "@/components/ui2/SmokeSection";
import { cn } from "cn";

type Channel = { id: string; label: string; value: string; href: string };

const ICONS: Record<string, LucideIcon> = {
  email: Mail,
  whatsapp: MessageCircle,
  instagram: AtSign,
};

export default function Contact() {
  const t = useTranslations("contact");
  const reduce = useReducedMotion();
  const channels = t.raw("channels") as Channel[];

  return (
    <SmokeSection id="contact" className="bg-bg py-28 text-fg sm:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          highlight={t("titleHighlight")}
          description={t("description")}
        />

        <ul className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-3">
          {channels.map((c, i) => {
            const Icon = ICONS[c.id] ?? Mail;
            const external = !c.href.startsWith("mailto:");

            return (
              <li key={c.id}>
                <Reveal delay={0.15 + i * 0.1} className="h-full">
                  <motion.div
                    whileHover={reduce ? undefined : { y: -3 }}
                    className="relative flex h-full flex-col items-center gap-3 rounded-2xl border border-line bg-bg/50 p-6 text-center backdrop-blur-md transition-colors hover:border-white/20"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-brand/40 text-brand">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{c.label}</span>

                    {/* seluruh kartu bisa diklik lewat link ini (stretched link) */}
                    {/* <div className={cn("inline-flex items-center gap-2", c.label === "Email" ? "mt-0" : "mt-1.5")}> */}
                    <a
                      href={c.href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="break-all text-sm font-medium outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-brand"
                    >
                      {c.value}
                    </a>

                    {/* tombol salin hanya untuk email; z-10 agar di atas link */}
                    {/* {c.id === "email" && (
                        <CopyButton
                          iconOnly
                          value={c.value}
                          label={t("copyLabel")}
                          copiedLabel={t("copiedLabel")}
                          className="relative z-10 mt-1"
                        />
                      )}
                    </div> */}
                  </motion.div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </SmokeSection>
  );
}
