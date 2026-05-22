export interface Event {
  id: string;
  title: string;
  description?: string | null;
  startAt: Date;
  endAt?: Date | null;
  allDay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateEventDTO = Pick<Event, "title" | "startAt"> & {
  description?: string;
  endAt?: Date;
  allDay?: boolean;
};

export type UpdateEventDTO = Partial<Pick<Event, "title" | "description" | "startAt" | "endAt" | "allDay">>;
