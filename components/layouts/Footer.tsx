"use client";

import { useSyncExternalStore } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";

import Logo from "@/components/Logo";
import { MENU_KEYS } from "@/lib/constants";

type Channel = { id: string; label: string; value: string; href: string };

// Tahun dibaca hanya di browser. Saat prerender nilainya null, sehingga
// `new Date()` tidak pernah dievaluasi di server (Next.js 16 melarangnya).
const subscribe = () => () => {};
const getYear = () => new Date().getFullYear();
const getServerYear = () => null;

function useCurrentYear() {
  return useSyncExternalStore<number | null>(subscribe, getYear, getServerYear);
}

export default function Footer() {
  const t = useTranslations("footer");
  const tMenu = useTranslations("menu");
  const tContact = useTranslations("contact");
  const reduce = useReducedMotion();
  const year = useCurrentYear();

  const channels = tContact.raw("channels") as Channel[];

  const backToTop = () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

  return (
    <footer className="border-t border-line bg-bg-deep text-fg">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t("tagline")}</p>
          </div>

          <nav aria-label={t("navTitle")}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{t("navTitle")}</h2>
            <ul className="mt-5 space-y-3">
              {MENU_KEYS.map((key) => (
                <li key={key}>
                  <a
                    href={tMenu(`${key}.url`)}
                    className="text-sm transition-colors hover:text-brand focus-visible:text-brand focus-visible:outline-none"
                  >
                    {tMenu(`${key}.label`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{t("contactTitle")}</h2>
            <ul className="mt-5 space-y-3">
              {channels.map((c) => (
                <li key={c.id}>
                  <a
                    href={c.href}
                    {...(c.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                    className="break-all text-sm transition-colors hover:text-brand focus-visible:text-brand focus-visible:outline-none"
                  >
                    {c.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-sm text-muted">{t("copyright", { year: year ?? "" })}</p>
          <button
            type="button"
            onClick={backToTop}
            className="group inline-flex cursor-pointer items-center gap-2 text-sm text-muted outline-none transition-colors hover:text-fg focus-visible:text-fg"
          >
            {t("backToTop")}
            <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
