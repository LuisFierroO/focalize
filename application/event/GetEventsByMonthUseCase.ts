import { IEventRepository } from "@/domain/event/IEventRepository";
import { Event } from "@/domain/event/Event";

export class GetEventsByMonthUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(year: number, month: number): Promise<Event[]> {
    return this.eventRepository.findByMonth(year, month);
  }
}
