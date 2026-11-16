import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "cn";

type ButtonProps = {
  children: ReactNode;
  /** jika diisi, tampil sebagai link (anchor) */
  href?: string;
  variant?: "primary" | "outline" | "ghost";
  /** tampilkan panah di kanan */
  arrow?: boolean;
  className?: string;
  onClick?: () => void;
};

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

const variants = {
  primary:
    // `text-bg!` (important) agar tidak kalah oleh aturan global seperti `a { color: inherit }`
    "bg-fg px-6 py-3 text-bg! shadow-[0_0_40px_-12px] shadow-brand/60 hover:bg-white",
  outline: "border border-line bg-surface/60 px-6 py-3 text-fg backdrop-blur-md hover:bg-surface-2",
  ghost: "px-2 py-3 text-fg/80 hover:text-fg",
};

export default function Button({
  children,
  href,
  variant = "primary",
  arrow = false,
  className,
  onClick,
}: ButtonProps) {
  const cls = cn(base, variants[variant], className);
  const content = (
    <>
      {children}
      {arrow && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
    </>
  );

  return href ? (
    <a href={href} className={cls}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cn(cls, "cursor-pointer")}>
      {content}
    </button>
  );
}
