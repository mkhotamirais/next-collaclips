"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE_MAX, createContactSchema } from "@/lib/schemas/contactSchema";
import { sendEmail } from "@/actions/sendEmail";
import { type ContactValues } from "@/lib/types";

// Gaya kolom isian: memakai token Collaclips, bukan token bawaan shadcn,
// agar tampilannya konsisten walau token shadcn di globals.css berbeda.
const fieldCls =
  "rounded-xl border-line bg-bg/60 px-4 text-fg placeholder:text-muted/70 focus-visible:border-brand/60 focus-visible:ring-brand/20 aria-invalid:border-red-400/60 aria-invalid:ring-red-400/20";
const labelCls = "text-sm font-medium text-fg/90";
const errorCls = "text-red-400";

export default function ContactForm() {
  const t = useTranslations("contact.form");
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // dibuat ulang tiap render agar pesan error ikut berganti saat bahasa berubah
  const schema = createContactSchema({
    nameMin: t("errors.nameMin"),
    emailInvalid: t("errors.emailInvalid"),
    roleRequired: t("errors.roleRequired"),
    messageMin: t("errors.messageMin"),
    messageMax: t("errors.messageMax"),
  });

  const form = useForm<ContactValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
    mode: "onTouched",
  });

  async function onSubmit(values: ContactValues) {
    setStatus("idle");
    try {
      await sendEmail(values);
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const { isSubmitting } = form.formState;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "success" ? (
        <motion.div
          key="success"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          role="status"
          className="flex min-h-104 flex-col items-center justify-center text-center"
        >
          <motion.span
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
            className="grid h-14 w-14 place-items-center rounded-full border border-spark/40 bg-spark/10 text-spark"
          >
            <Check className="h-6 w-6" strokeWidth={3} />
          </motion.span>
          <h3 className="mt-6 font-display text-2xl font-medium">{t("success.title")}</h3>
          <p className="mt-2 max-w-sm text-muted">{t("success.description")}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setStatus("idle")}
            className="mt-8 rounded-full border-line bg-transparent px-6 text-fg hover:bg-white/5"
          >
            {t("success.again")}
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <FieldGroup className="gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="contact-name" className={labelCls}>
                      {t("name.label")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="contact-name"
                      autoComplete="name"
                      placeholder={t("name.placeholder")}
                      aria-invalid={fieldState.invalid}
                      className={cn("h-11", fieldCls)}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className={errorCls} />}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="contact-email" className={labelCls}>
                      {t("email.label")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="contact-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder={t("email.placeholder")}
                      aria-invalid={fieldState.invalid}
                      className={cn("h-11", fieldCls)}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className={errorCls} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="message"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="contact-message" className={labelCls}>
                    {t("message.label")}
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="contact-message"
                    rows={5}
                    placeholder={t("message.placeholder")}
                    aria-invalid={fieldState.invalid}
                    className={cn("min-h-32 resize-none py-3", fieldCls)}
                  />
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-h-5">
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} className={errorCls} />}
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted">
                      {field.value.length}/{MESSAGE_MAX}
                    </span>
                  </div>
                </Field>
              )}
            />

            {status === "error" && (
              <p
                role="alert"
                className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
              >
                {t("failure")}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-12 w-full rounded-full bg-fg px-8 text-bg! hover:bg-white sm:w-auto sm:self-start"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {t("sending")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          </FieldGroup>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
