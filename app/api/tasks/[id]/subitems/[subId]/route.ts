import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaTaskRepository } from "@/infrastructure/db/PrismaTaskRepository";
import { z } from "zod";

const repo = new PrismaTaskRepository();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; subId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subId } = await params;
  const { done } = z.object({ done: z.boolean() }).parse(await req.json());
  const item = await repo.updateSubItem(subId, done);
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; subId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subId } = await params;
  await repo.deleteSubItem(subId);
  return new NextResponse(null, { status: 204 });
}
