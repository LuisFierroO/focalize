import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaEventRepository } from "@/infrastructure/db/PrismaEventRepository";
import { z } from "zod";

const repo = new PrismaEventRepository();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const schema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().nullable().optional(),
    allDay: z.boolean().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const event = await repo.update(id, {
    ...parsed.data,
    startAt: parsed.data.startAt ? new Date(parsed.data.startAt) : undefined,
    endAt: parsed.data.endAt !== undefined ? (parsed.data.endAt ? new Date(parsed.data.endAt) : null) : undefined,
  });
  return NextResponse.json(event);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await repo.delete(id);
  return new NextResponse(null, { status: 204 });
}
