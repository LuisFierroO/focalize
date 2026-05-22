import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaTaskRepository } from "@/infrastructure/db/PrismaTaskRepository";
import { z } from "zod";

const repo = new PrismaTaskRepository();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { title } = z.object({ title: z.string().min(1) }).parse(await req.json());
  const item = await repo.addSubItem(id, title);
  return NextResponse.json(item, { status: 201 });
}
