import * as z from "zod";
import { ContactErrorMessages } from "../types";
export const MESSAGE_MAX = 1000;

export function createContactSchema(m: ContactErrorMessages) {
  return z.object({
    name: z.string().trim().min(2, m.nameMin).max(80, m.nameMin),
    email: z.string().trim().email(m.emailInvalid),
    message: z.string().trim().min(3, m.messageMin).max(MESSAGE_MAX, m.messageMax),
  });
}

export type ContactValues = z.infer<ReturnType<typeof createContactSchema>>;
