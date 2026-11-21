"use server";

import { ContactValues } from "@/lib/types";
import { Resend } from "resend";
// import { getTranslations } from "next-intl/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const isProd = process.env.NODE_ENV === "production";

const emailDev = {
  from: "Acme <onboarding@resend.dev",
  to: "delivered@resend.dev",
};

const emailProd = {
  from: "Collaclips Contact <halo@collaclips.com>",
  to: "halo@collaclips.com",
};

const emailFrom = isProd ? emailProd.from : emailDev.from;
const emailTo = isProd ? emailProd.to : emailDev.to;

export async function sendEmail(values: ContactValues) {
  // const t = await getTranslations();

  const { name, email, message } = values;

  if (!name || !email || !message) return { ok: false, message: "Semua field harus diisi." };

  try {
    const { error } = await resend.emails.send({
      from: emailFrom,
      to: [`${emailTo}`],
      replyTo: email,
      subject: `New message from ${name} via collaclips.id`,
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    });

    if (error) {
      console.error("Resend Error: ", error);
      return { ok: false, message: "Gagal mengirim email" };
    }
  } catch (err) {
    console.error("Server Error", err);
    return { ok: false, error: "Terjadi kesalahan server" };
  }
}
