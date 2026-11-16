import { Link } from "@/i18n/navigation";
import React, { ComponentProps } from "react";
import SwitchLangBtn from "../ui2/SwitchLangBtn";
import { useTranslations } from "next-intl";

type Props = {
  menuKeys: string[];
};

export default function NavDesktop({ menuKeys }: Props) {
  const t = useTranslations("menu");

  return (
    <div className="hidden md:flex items-center gap-2">
      <nav className="mr-4 flex">
        {menuKeys.map((item, i) => (
          <Link
            key={i}
            href={t(`${item}.url`) as ComponentProps<typeof Link>["href"]}
            className="text-sm font-medium text-muted hover:text-accent transition-colors px-3"
          >
            {t(`${item}.label`)}
          </Link>
        ))}
      </nav>
      <SwitchLangBtn />
    </div>
  );
}
