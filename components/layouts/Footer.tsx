"use client";

import { useSyncExternalStore, type ComponentType } from "react";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { SiInstagram, SiWhatsapp } from "react-icons/si";

import Logo from "@/components/Logo";
import { MENU_KEYS } from "@/lib/constants";

type Channel = { id: string; label: string; value: string; href: string };

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  email: Mail,
  whatsapp: SiWhatsapp,
  instagram: SiInstagram,
};

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
  const year = useCurrentYear();

  const channels = tContact.raw("channels") as Channel[];

  return (
    <footer className="border-t border-line bg-bg-deep text-fg">
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl px-6 py-14">
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
              {channels.map((c) => {
                const Icon = ICONS[c.id];

                return (
                  <li key={c.id}>
                    <a
                      href={c.href}
                      {...(c.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                      className="group flex items-center gap-3 break-all text-sm transition-colors hover:text-brand focus-visible:text-brand focus-visible:outline-none"
                    >
                      {Icon && (
                        <Icon className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-brand" />
                      )}
                      {c.value}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-sm text-muted">{t("copyright", { year: year ?? "" })}</p>
        </div>
      </div>
    </footer>
  );
}
