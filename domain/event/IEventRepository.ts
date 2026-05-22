import { Event, CreateEventDTO, UpdateEventDTO } from "./Event";

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findByMonth(year: number, month: number): Promise<Event[]>;
  findByDate(date: Date): Promise<Event[]>;
  create(data: CreateEventDTO): Promise<Event>;
  update(id: string, data: UpdateEventDTO): Promise<Event>;
  delete(id: string): Promise<void>;
}
