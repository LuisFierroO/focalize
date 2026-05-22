import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaTaskRepository } from "@/infrastructure/db/PrismaTaskRepository";
import { UpdateTaskUseCase } from "@/application/task/UpdateTaskUseCase";
import { DeleteTaskUseCase } from "@/application/task/DeleteTaskUseCase";
import { EisenhowerQuadrant } from "@/domain/task/EisenhowerQuadrant";
import { TaskStatus } from "@/domain/task/Task";
import { z } from "zod";

const repo = new PrismaTaskRepository();

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  quadrant: z.nativeEnum(EisenhowerQuadrant).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = {
    ...parsed.data,
    dueDate: parsed.data.dueDate !== undefined ? (parsed.data.dueDate ? new Date(parsed.data.dueDate) : null) : undefined,
  };

  const task = await new UpdateTaskUseCase(repo).execute(id, data);
  return NextResponse.json(task);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await new DeleteTaskUseCase(repo).execute(id);
  return new NextResponse(null, { status: 204 });
}
