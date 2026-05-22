import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaTaskRepository } from "@/infrastructure/db/PrismaTaskRepository";
import { GetAllTasksUseCase } from "@/application/task/GetAllTasksUseCase";
import { CreateTaskUseCase } from "@/application/task/CreateTaskUseCase";
import { EisenhowerQuadrant } from "@/domain/task/EisenhowerQuadrant";
import { z } from "zod";

const repo = new PrismaTaskRepository();

const createSchema = z.object({
  title: z.string().min(1).max(200),
  quadrant: z.nativeEnum(EisenhowerQuadrant),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await new GetAllTasksUseCase(repo).execute();
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const task = await new CreateTaskUseCase(repo).execute({
    ...parsed.data,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
  });
  return NextResponse.json(task, { status: 201 });
}
