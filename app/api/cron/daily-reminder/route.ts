import { NextResponse } from "next/server";
import { PrismaTaskRepository } from "@/infrastructure/db/PrismaTaskRepository";
import { ResendEmailService } from "@/infrastructure/notifications/ResendEmailService";
import { CallMeBotWhatsAppService } from "@/infrastructure/notifications/CallMeBotWhatsAppService";
import { SendDailyReminderUseCase } from "@/application/notification/SendDailyReminderUseCase";
import { prisma } from "@/infrastructure/db/prisma/client";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await prisma.notificationConfig.findFirst();
  if (!config) {
    return NextResponse.json({ message: "No notification config found" });
  }

  const emailService = config.emailEnabled ? new ResendEmailService() : null;
  const whatsappService =
    config.whatsappEnabled && config.whatsappPhone
      ? new CallMeBotWhatsAppService(config.whatsappPhone, process.env.CALLMEBOT_API_KEY ?? "")
      : null;

  const useCase = new SendDailyReminderUseCase(
    new PrismaTaskRepository(),
    emailService,
    whatsappService,
    config
  );

  const result = await useCase.execute();
  return NextResponse.json(result);
}
