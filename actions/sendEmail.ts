"use server";

import { ContactValues } from "@/lib/types";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(values: ContactValues) {
  const name = values.name?.trim();
  const senderEmail = values.email?.trim();
  const message = values.message?.trim();

  if (!name || !senderEmail || !message) {
    return {
      ok: false,
      message: "Semua field harus diisi.",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Collaclips <contact@collaclips.com>",
      to: ["contact@collaclips.com"],
      replyTo: senderEmail,
      // replyTo: "halo@collaclps.com",
      subject: `Pesan kontak baru dari ${name}`,
      text: [`Nama: ${name}`, `Email: ${senderEmail}`, "", "Pesan:", message].join("\n"),
    });

    if (error) {
      console.error("Resend error:", error);

      return {
        ok: false,
        message: "Gagal mengirim email.",
      };
    }

    console.log("Resend Email sent:", data?.id);

    return {
      ok: true,
      message: "Berhasil",
    };
  } catch (error) {
    console.error("Server error:", error);

    return {
      ok: false,
      message: "Terjadi kesalahan server.",
    };
  }
}
