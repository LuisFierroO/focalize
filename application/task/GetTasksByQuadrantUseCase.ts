import { ITaskRepository } from "@/domain/task/ITaskRepository";
import { EisenhowerQuadrant } from "@/domain/task/EisenhowerQuadrant";
import { Task } from "@/domain/task/Task";

export class GetTasksByQuadrantUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(quadrant: EisenhowerQuadrant): Promise<Task[]> {
    return this.taskRepository.findByQuadrant(quadrant);
  }
}
