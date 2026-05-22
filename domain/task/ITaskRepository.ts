import { EisenhowerQuadrant } from "./EisenhowerQuadrant";
import { Task, CreateTaskDTO, UpdateTaskDTO, SubItem } from "./Task";

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findByQuadrant(quadrant: EisenhowerQuadrant): Promise<Task[]>;
  findByDate(date: Date): Promise<Task[]>;
  findIncompleteQ1ForDate(date: Date): Promise<Task[]>;
  create(data: CreateTaskDTO): Promise<Task>;
  update(id: string, data: UpdateTaskDTO): Promise<Task>;
  delete(id: string): Promise<void>;
  addSubItem(taskId: string, title: string): Promise<SubItem>;
  updateSubItem(id: string, done: boolean): Promise<SubItem>;
  deleteSubItem(id: string): Promise<void>;
}
