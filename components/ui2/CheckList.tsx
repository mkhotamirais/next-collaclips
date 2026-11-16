import { Check } from "lucide-react";

import { cn } from "cn";

export default function CheckList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-4 py-4">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-brand/40 text-brand">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className="text-base text-fg/90">{item}</span>
        </li>
      ))}
    </ul>
  );
}
