import { ComponentProps } from "react";
import { MENU_KEYS } from "./constants";
import { Link } from "@/i18n/navigation";

export type MenuKey = (typeof MENU_KEYS)[number];

export type MenuItem = { label: string; url: ComponentProps<typeof Link>["href"] };
