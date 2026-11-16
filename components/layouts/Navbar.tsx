"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, type Variants } from "motion/react";

import { cn } from "cn";

import Logo from "@/components/Logo";
import SwitchLangBtn from "@/components/ui2/SwitchLangBtn";
import { MENU_KEYS, type MenuKey } from "@/lib/constants";

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const row: Variants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

/**
 * Navbar responsif.
 * - ≥ 768px (md): menu horizontal dengan pil penanda section aktif.
 * - < 768px: tombol hamburger yang membuka panel menu dengan latar redup.
 */
export default function Navbar() {
  const t = useTranslations("menu");
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<MenuKey>("home");

  const close = useCallback(() => setOpen(false), []);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  const links = MENU_KEYS.map((key) => ({
    key,
    label: t(`${key}.label`),
    href: t(`${key}.url`),
  }));

  // tandai menu sesuai section yang sedang berada di tengah layar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id as MenuKey);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    MENU_KEYS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // layar melebar ke desktop: tutup panel mobile
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // saat panel terbuka: kunci scroll halaman dan tutup dengan Escape
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
          open
            ? "border-line bg-bg/95 backdrop-blur-xl"
            : scrolled
              ? "border-line bg-bg/70 backdrop-blur-xl"
              : "border-transparent",
        )}
      >
        <nav aria-label="Utama" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo onClick={close} />

          {/* desktop */}
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const isActive = active === l.key;
              return (
                <li key={l.key}>
                  <a
                    href={l.href}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative isolate rounded-full px-4 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand",
                      isActive ? "text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-full bg-white/10"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <SwitchLangBtn />

            {/* tombol hamburger: hanya mobile */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Menu"
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-line text-fg outline-none focus-visible:ring-2 focus-visible:ring-brand md:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "close" : "open"}
                  initial={reduce ? false : { rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={reduce ? undefined : { rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>

        {/* panel menu mobile */}
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.28, ease: "easeInOut" }}
              className="max-h-[calc(100svh-4rem)] overflow-y-auto md:hidden"
            >
              <motion.ul
                variants={list}
                initial={reduce ? false : "hidden"}
                animate="show"
                className="mx-auto max-w-6xl px-6 pb-4"
              >
                {links.map((l) => {
                  const isActive = active === l.key;
                  return (
                    <motion.li key={l.key} variants={row} className="border-t border-line">
                      <a
                        href={l.href}
                        onClick={close}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "flex items-center justify-between py-4 font-display text-xl outline-none transition-colors focus-visible:text-brand",
                          isActive ? "text-fg" : "text-muted",
                        )}
                      >
                        {l.label}
                        {isActive && (
                          <span aria-hidden className="h-2 w-2 rounded-full bg-brand shadow-[0_0_12px] shadow-brand" />
                        )}
                      </a>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* latar redup di belakang panel mobile; klik untuk menutup.
          Berada di luar <header> karena backdrop-filter pada header
          akan menjadikannya acuan posisi untuk elemen fixed. */}
      <AnimatePresence>
        {open && (
          <motion.div
            aria-hidden
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
