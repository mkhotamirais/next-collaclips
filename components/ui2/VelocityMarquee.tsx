"use client";

import Image from "next/image";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useEffect, useRef } from "react";

export type ClientLogo = {
  name: string;
  /** Path/URL logo. Kosongkan untuk memakai placeholder teks. */
  src?: string;
  /** Lebar asli gambar (untuk next/image). Default 120. */
  width?: number;
};

/** Contoh data. Ganti lewat prop `logos` kalau logo asli sudah ada. */
const PLACEHOLDER_LOGOS: ClientLogo[] = [
  { name: "Vryce" },
  { name: "Skymusic" },
  //   { name: "AldiProperty" },
  //   { name: "Collaclips" },
];

const EDGE_FADE = "linear-gradient(to right, transparent, black 10%, black 90%, transparent)";

/** Menjaga nilai tetap di rentang [min, max) supaya loop mulus. */
function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

/* ---------- Logo (placeholder atau gambar) ---------- */

const TYPE_STYLES = [
  "font-display text-xl font-medium tracking-tight",
  "font-serif text-2xl italic",
  "font-sans text-lg font-bold tracking-wide",
];

function Glyph({ index }: { index: number }) {
  const shape = index % 3;
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
      {shape === 0 && <circle cx="12" cy="12" r="10" />}
      {shape === 1 && <rect x="4.5" y="4.5" width="15" height="15" rx="4" transform="rotate(45 12 12)" />}
      {shape === 2 && <path d="M12 2 22 21H2z" />}
    </svg>
  );
}

function LogoMark({ logo, index }: { logo: ClientLogo; index: number }) {
  if (logo.src) {
    return (
      <Image
        src={logo.src}
        alt={logo.name}
        width={logo.width ?? 120}
        height={32}
        className="h-8 w-auto opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
      />
    );
  }

  return (
    <span
      className={`flex items-center gap-2.5 text-muted transition-colors hover:text-fg ${
        TYPE_STYLES[Math.floor(index / 2) % TYPE_STYLES.length]
      }`}
    >
      <Glyph index={index} />
      {logo.name}
    </span>
  );
}

/* ---------- Satu set logo (diduplikasi agar loop mulus) ---------- */

function LogoSet({
  logos,
  startIndex,
  hidden,
  listRef,
}: {
  logos: ClientLogo[];
  startIndex: number;
  hidden?: boolean;
  listRef?: React.Ref<HTMLUListElement>;
}) {
  return (
    <ul
      ref={listRef}
      aria-hidden={hidden || undefined}
      className="flex min-w-[100vw] shrink-0 items-center justify-around"
    >
      {logos.map((logo, i) => (
        <li key={logo.name} className="flex shrink-0 items-center px-8 sm:px-12">
          <LogoMark logo={logo} index={startIndex + i} />
        </li>
      ))}
    </ul>
  );
}

/* ---------- Satu baris marquee ---------- */

type RowProps = {
  logos: ClientLogo[];
  /** Piksel per detik. Negatif = geser ke kiri, positif = ke kanan. */
  baseVelocity: number;
  startIndex: number;
};

function MarqueeRow({ logos, baseVelocity, startIndex }: RowProps) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const direction = useRef(1);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

  // Ukur lebar satu set logo, supaya kecepatan konstan (px/detik)
  // berapa pun jumlah logonya.
  const setRef = useRef<HTMLUListElement>(null);
  const setWidth = useRef(0);

  useEffect(() => {
    const el = setRef.current;
    if (!el) return;
    const update = () => {
      setWidth.current = el.offsetWidth;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [logos]);

  // Track berisi 2 set identik; geser tepat selebar satu set lalu ulang.
  const x = useTransform(baseX, (v) => {
    const w = setWidth.current;
    return w ? `${wrap(-w, 0, v)}px` : "0px";
  });

  useAnimationFrame((_, delta) => {
    if (reduce) return;

    const v = smoothVelocity.get();
    // Scroll ke bawah/atas membalik arah, dengan ambang kecil agar tidak bergetar.
    if (v < -5) direction.current = -1;
    else if (v > 5) direction.current = 1;

    // Makin cepat scroll, makin cepat marquee (maksimal 7x).
    const boost = Math.min(Math.abs(v) / 400, 6);
    const dt = Math.min(delta, 64) / 1000; // cegah lompatan setelah pindah tab

    baseX.set(baseX.get() + direction.current * baseVelocity * dt * (1 + boost));
  });

  return (
    <div className="overflow-hidden" style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}>
      <motion.div style={{ x }} className="flex w-max will-change-transform">
        <LogoSet logos={logos} startIndex={startIndex} listRef={setRef} />
        {!reduce && <LogoSet logos={logos} startIndex={startIndex} hidden />}
      </motion.div>
    </div>
  );
}

/* ---------- Komponen utama ---------- */

type Props = {
  logos?: ClientLogo[];
  /** Kecepatan dasar dalam piksel per detik. Default 60. */
  speed?: number;
  /** Label aksesibilitas untuk region ini. */
  label?: string;
  className?: string;
};

export default function VelocityMarquee({
  logos = PLACEHOLDER_LOGOS,
  speed = 60,
  label = "Our clients",
  className = "",
}: Props) {
  const mid = Math.ceil(logos.length / 2);
  const top = logos.slice(0, mid);
  const bottom = logos.slice(mid);

  return (
    <div role="region" aria-label={label} className={`flex flex-col gap-6 py-4 ${className}`}>
      {/* Baris 1 ke kiri, baris 2 ke kanan */}
      <MarqueeRow logos={top} baseVelocity={-speed} startIndex={0} />
      <MarqueeRow logos={bottom.length ? bottom : top} baseVelocity={speed * 0.85} startIndex={top.length} />
    </div>
  );
}
