import { ITaskRepository } from "@/domain/task/ITaskRepository";
import { TaskStatus, Task } from "@/domain/task/Task";

export class CompleteTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<Task> {
    return this.taskRepository.update(id, {
      status: TaskStatus.DONE,
    });
  }
}
