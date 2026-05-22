import { EisenhowerQuadrant } from "./EisenhowerQuadrant";

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface SubItem {
  id: string;
  title: string;
  done: boolean;
  order: number;
  taskId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  quadrant: EisenhowerQuadrant;
  status: TaskStatus;
  dueDate?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subItems: SubItem[];
}

export type CreateTaskDTO = Pick<Task, "title" | "quadrant"> & {
  description?: string;
  dueDate?: Date;
};

export type UpdateTaskDTO = Partial<Pick<Task, "title" | "description" | "quadrant" | "status" | "dueDate">>;
