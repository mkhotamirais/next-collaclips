import { ComponentProps } from "react";
import { MENU_KEYS } from "./constants";
import { Link } from "@/i18n/navigation";
import * as z from "zod";
import { createContactSchema } from "./schemas/contactSchema";

export type MenuKey = (typeof MENU_KEYS)[number];

export type MenuItem = { label: string; url: ComponentProps<typeof Link>["href"] };

export type ContactErrorMessages = {
  nameMin: string;
  emailInvalid: string;
  roleRequired: string;
  messageMin: string;
  messageMax: string;
};

export type ContactValues = z.infer<ReturnType<typeof createContactSchema>>;
