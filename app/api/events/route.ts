import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaEventRepository } from "@/infrastructure/db/PrismaEventRepository";
import { z } from "zod";

const repo = new PrismaEventRepository();

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  const events = await repo.findByMonth(year, month);
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const schema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime().optional(),
    allDay: z.boolean().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const event = await repo.create({
    ...parsed.data,
    startAt: new Date(parsed.data.startAt),
    endAt: parsed.data.endAt ? new Date(parsed.data.endAt) : undefined,
  });
  return NextResponse.json(event, { status: 201 });
}
