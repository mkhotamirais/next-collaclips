"use client";

import { useId, useOptimistic, useTransition } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "cn";

const LANGUAGES: Record<string, { label: string; short: string }> = {
  id: { label: "Bahasa Indonesia", short: "ID" },
  en: { label: "English", short: "EN" },
};

export default function SwitchLangBtn({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const pillId = useId(); // unik per instance (navbar desktop + menu mobile)
  const reduceMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();

  // Pill langsung bergeser saat diklik, tanpa menunggu navigasi selesai
  const [activeLocale, setActiveLocale] = useOptimistic(locale);

  const handleChange = (nextLocale: string) => {
    if (nextLocale === activeLocale) return;

    startTransition(() => {
      setActiveLocale(nextLocale);
      router.replace(
        // @ts-expect-error -- pathname dan params selalu cocok
        { pathname, params },
        { locale: nextLocale, scroll: false }, // tetap di posisi scroll sekarang
      );
    });
  };

  return (
    <div
      role="group"
      aria-label="Pilih bahasa / Select language"
      aria-busy={isPending}
      className={cn(
        "relative inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md transition-opacity",
        isPending && "opacity-80",
        className,
      )}
    >
      {routing.locales.map((l) => {
        const isActive = l === activeLocale;

        return (
          <motion.button
            key={l}
            type="button"
            lang={l}
            onClick={() => handleChange(l)}
            aria-pressed={isActive}
            aria-label={LANGUAGES[l]?.label ?? l}
            whileTap={{ scale: reduceMotion ? 1 : 0.92 }}
            className={cn(
              "relative z-10 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wider outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-violet-400",
              isActive ? "text-white" : "text-white/55 hover:text-white",
            )}
          >
            {isActive && (
              <motion.span
                layoutId={pillId}
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_18px_-2px_rgba(168,85,247,0.7)]"
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            {LANGUAGES[l]?.short ?? l.toUpperCase()}
          </motion.button>
        );
      })}
    </div>
  );
}
