import { ITaskRepository } from "@/domain/task/ITaskRepository";
import { CreateTaskDTO, Task } from "@/domain/task/Task";

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(data: CreateTaskDTO): Promise<Task> {
    return this.taskRepository.create(data);
  }
}
