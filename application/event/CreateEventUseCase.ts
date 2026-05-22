import { IEventRepository } from "@/domain/event/IEventRepository";
import { CreateEventDTO, Event } from "@/domain/event/Event";

export class CreateEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(data: CreateEventDTO): Promise<Event> {
    return this.eventRepository.create(data);
  }
}
