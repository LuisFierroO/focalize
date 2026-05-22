import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma/client";
import { z } from "zod";

async function getOrCreateConfig() {
  const existing = await prisma.notificationConfig.findFirst();
  if (existing) return existing;
  return prisma.notificationConfig.create({ data: {} });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = await getOrCreateConfig();
  return NextResponse.json({
    ...config,
    callmebotConfigured: !!process.env.CALLMEBOT_API_KEY,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const schema = z.object({
    emailEnabled: z.boolean().optional(),
    whatsappEnabled: z.boolean().optional(),
    whatsappPhone: z.string().nullable().optional(),
    reminderHour: z.number().min(0).max(23).optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const config = await getOrCreateConfig();
  const updated = await prisma.notificationConfig.update({
    where: { id: config.id },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}
