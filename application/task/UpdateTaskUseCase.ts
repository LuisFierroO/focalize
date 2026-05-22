import { ITaskRepository } from "@/domain/task/ITaskRepository";
import { UpdateTaskDTO, Task } from "@/domain/task/Task";

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string, data: UpdateTaskDTO): Promise<Task> {
    return this.taskRepository.update(id, data);
  }
}
