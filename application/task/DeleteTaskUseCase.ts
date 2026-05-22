import { ITaskRepository } from "@/domain/task/ITaskRepository";

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<void> {
    return this.taskRepository.delete(id);
  }
}
