import { ITaskRepository } from "@/domain/task/ITaskRepository";
import { Task } from "@/domain/task/Task";

export class GetAllTasksUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }
}
