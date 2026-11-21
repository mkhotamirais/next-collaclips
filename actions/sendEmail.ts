"use server";

import { ContactValues } from "@/lib/types";
import { Resend } from "resend";
// import { getTranslations } from "next-intl/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const isProd = process.env.NODE_ENV === "production";

const email = isProd
  ? { from: "Collaclips contact <website@collaclips.com>", to: "halo@collaclips.com" }
  : { from: "Acme <onboarding@resend.dev>", to: "delivered@resend.dev" };

export async function sendEmail(values: ContactValues) {
  // const t = await getTranslations();

  if (!values.name || !values.email || !values.message) return { ok: false, message: "Semua field harus diisi." };

  const name = values.name.replace(/[\r\n]+/g, " ");
  try {
    const { error } = await resend.emails.send({
      from: email.from,
      to: email.to,
      replyTo: values.email,
      subject: `New message from ${name} via collaclips.com`,
      text: `Name: ${name}\nEmail: ${values.email}\nMessage:\n${values.message}`,
    });

    if (error) {
      console.error("Resend Error: ", error);
      return { ok: false, message: "Gagal mengirim email" };
    }
    return { ok: true, message: "Berhasil" };
  } catch (err) {
    console.error("Server Error", err);
    return { ok: false, error: "Terjadi kesalahan server" };
  }
}
