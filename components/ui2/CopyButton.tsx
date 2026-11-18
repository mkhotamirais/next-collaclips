"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "cn";

type CopyButtonProps = {
  /** teks yang disalin */
  value: string;
  label: string;
  copiedLabel: string;
  /** hanya ikon (untuk tempat sempit seperti footer) */
  iconOnly?: boolean;
  className?: string;
};

/** Salin ke clipboard; cadangan untuk koneksi non-HTTPS atau browser lama. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function CopyButton({ value, label, copiedLabel, iconOnly = false, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleClick = async () => {
    if (!(await copyText(value))) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  const text = copied ? copiedLabel : label;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={iconOnly ? text : undefined}
        title={iconOnly ? text : undefined}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-full border border-line text-xs font-medium text-muted outline-none transition-colors hover:border-white/20 hover:text-fg focus-visible:ring-2 focus-visible:ring-brand",
          iconOnly ? "h-7 w-7" : "gap-1.5 px-3 py-1",
          className,
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-spark" /> : <Copy className="h-3.5 w-3.5" />}
        {!iconOnly && text}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}
