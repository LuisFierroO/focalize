import { prisma } from "./prisma/client";
import { IEventRepository } from "@/domain/event/IEventRepository";
import { Event, CreateEventDTO, UpdateEventDTO } from "@/domain/event/Event";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export class PrismaEventRepository implements IEventRepository {
  async findById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({ where: { id } }) as Promise<Event | null>;
  }

  async findByMonth(year: number, month: number): Promise<Event[]> {
    const date = new Date(year, month - 1, 1);
    return prisma.event.findMany({
      where: {
        startAt: { gte: startOfMonth(date), lte: endOfMonth(date) },
      },
      orderBy: { startAt: "asc" },
    }) as Promise<Event[]>;
  }

  async findByDate(date: Date): Promise<Event[]> {
    return prisma.event.findMany({
      where: {
        startAt: { gte: startOfDay(date), lte: endOfDay(date) },
      },
      orderBy: { startAt: "asc" },
    }) as Promise<Event[]>;
  }

  async create(data: CreateEventDTO): Promise<Event> {
    return prisma.event.create({ data }) as Promise<Event>;
  }

  async update(id: string, data: UpdateEventDTO): Promise<Event> {
    return prisma.event.update({ where: { id }, data }) as Promise<Event>;
  }

  async delete(id: string): Promise<void> {
    await prisma.event.delete({ where: { id } });
  }
}
