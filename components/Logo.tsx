import { cn } from "cn";
import React from "react";

type Props = {
  className?: string;
  onClick?: () => void;
};

export default function Logo({ className, onClick }: Props) {
  return (
    <a href="#home" onClick={onClick} className={cn("text-fg", className)} aria-label="Collaclips">
      COLLACLIPS
    </a>
  );
}
