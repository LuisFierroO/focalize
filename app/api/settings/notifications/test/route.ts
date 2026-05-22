import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma/client";
import { ResendEmailService } from "@/infrastructure/notifications/ResendEmailService";
import { CallMeBotWhatsAppService } from "@/infrastructure/notifications/CallMeBotWhatsAppService";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await prisma.notificationConfig.findFirst();
  if (!config) return NextResponse.json({ error: "No hay configuración guardada" }, { status: 400 });

  const payload = {
    subject: "Focalize — Notificación de prueba ✓",
    body: "Esta es una notificación de prueba. Tus canales están configurados correctamente.",
    tasks: [
      { title: "Ejemplo de tarea urgente", quadrant: "Q1" },
      { title: "Ejemplo de tarea importante", quadrant: "Q2" },
    ],
  };

  const results: { email?: string; whatsapp?: string } = {};

  if (config.emailEnabled) {
    if (!process.env.RESEND_API_KEY) {
      results.email = "error: RESEND_API_KEY no configurado";
    } else {
      try {
        await new ResendEmailService().send(payload);
        results.email = "ok";
      } catch (e) {
        results.email = `error: ${e instanceof Error ? e.message : "desconocido"}`;
      }
    }
  }

  if (config.whatsappEnabled) {
    if (!config.whatsappPhone) {
      results.whatsapp = "error: teléfono no configurado";
    } else if (!process.env.CALLMEBOT_API_KEY) {
      results.whatsapp = "error: CALLMEBOT_API_KEY no configurado";
    } else {
      try {
        await new CallMeBotWhatsAppService(config.whatsappPhone, process.env.CALLMEBOT_API_KEY).send(payload);
        results.whatsapp = "ok";
      } catch (e) {
        results.whatsapp = `error: ${e instanceof Error ? e.message : "desconocido"}`;
      }
    }
  }

  const allOk = Object.values(results).every((v) => v === "ok");
  return NextResponse.json({ success: allOk, results });
}
