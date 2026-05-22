import { prisma } from "./prisma/client";
import { ITaskRepository } from "@/domain/task/ITaskRepository";
import { EisenhowerQuadrant as PrismaQuadrant, TaskStatus as PrismaStatus } from "@prisma/client";
import { EisenhowerQuadrant } from "@/domain/task/EisenhowerQuadrant";
import { Task, SubItem, CreateTaskDTO, UpdateTaskDTO, TaskStatus } from "@/domain/task/Task";
import { startOfDay, endOfDay } from "date-fns";

export class PrismaTaskRepository implements ITaskRepository {
  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({ where: { id }, include: { subItems: { orderBy: { order: "asc" } } } }) as Promise<Task | null>;
  }

  async findAll(): Promise<Task[]> {
    return prisma.task.findMany({
      include: { subItems: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    }) as Promise<Task[]>;
  }

  async findByQuadrant(quadrant: EisenhowerQuadrant): Promise<Task[]> {
    return prisma.task.findMany({
      where: { quadrant },
      include: { subItems: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    }) as Promise<Task[]>;
  }

  async findByDate(date: Date): Promise<Task[]> {
    return prisma.task.findMany({
      where: {
        dueDate: { gte: startOfDay(date), lte: endOfDay(date) },
      },
      include: { subItems: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    }) as Promise<Task[]>;
  }

  async findIncompleteQ1ForDate(date: Date): Promise<Task[]> {
    return prisma.task.findMany({
      where: {
        quadrant: EisenhowerQuadrant.Q1,
        status: { not: TaskStatus.DONE },
        OR: [
          { dueDate: { gte: startOfDay(date), lte: endOfDay(date) } },
          { dueDate: null },
        ],
      },
      include: { subItems: { orderBy: { order: "asc" } } },
    }) as Promise<Task[]>;
  }

  async create(data: CreateTaskDTO): Promise<Task> {
    return prisma.task.create({
      data: {
        title: data.title,
        quadrant: data.quadrant,
        description: data.description,
        dueDate: data.dueDate,
      },
      include: { subItems: true },
    }) as Promise<Task>;
  }

  async update(id: string, data: UpdateTaskDTO): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: {
        ...data,
        completedAt: data.status === TaskStatus.DONE ? new Date() : undefined,
      },
      include: { subItems: { orderBy: { order: "asc" } } },
    }) as Promise<Task>;
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }

  async addSubItem(taskId: string, title: string): Promise<SubItem> {
    const count = await prisma.subItem.count({ where: { taskId } });
    return prisma.subItem.create({ data: { taskId, title, order: count } }) as Promise<SubItem>;
  }

  async updateSubItem(id: string, done: boolean): Promise<SubItem> {
    return prisma.subItem.update({ where: { id }, data: { done } }) as Promise<SubItem>;
  }

  async deleteSubItem(id: string): Promise<void> {
    await prisma.subItem.delete({ where: { id } });
  }
}
