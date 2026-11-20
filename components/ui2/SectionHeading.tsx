import { cn } from "cn";

import Reveal from "./Reveal";
import { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  // title: string | ((chunks: ReactNode) => ReactNode),
  title: ReactNode;
  /** potongan judul bergaya serif miring, tampil setelah `title` */
  highlight?: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow && (
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</span>
        </Reveal>
      )}

      <Reveal delay={0.08}>
        <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-fg sm:text-4xl lg:text-5xl">
          {title}{" "}
          {highlight && (
            <span className="bg-linear-to-r from-brand to-brand-2 bg-clip-text pr-[0.08em] font-serif font-normal italic text-transparent">
              {highlight}
            </span>
          )}
        </h2>
      </Reveal>

      {description && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
