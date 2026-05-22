import { ITaskRepository } from "@/domain/task/ITaskRepository";
import { INotificationService } from "@/domain/notification/INotificationService";
import { NotificationConfig } from "@/domain/notification/NotificationConfig";
import { QUADRANT_LABELS } from "@/domain/task/EisenhowerQuadrant";

export class SendDailyReminderUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly emailService: INotificationService | null,
    private readonly whatsappService: INotificationService | null,
    private readonly config: NotificationConfig
  ) {}

  async execute(): Promise<{ sent: boolean; taskCount: number }> {
    const today = new Date();
    const incompleteTasks = await this.taskRepository.findIncompleteQ1ForDate(today);

    if (incompleteTasks.length === 0) {
      return { sent: false, taskCount: 0 };
    }

    const payload = {
      subject: `Focalize: Tienes ${incompleteTasks.length} tarea(s) Q1 sin completar`,
      body: `Estas tareas urgentes e importantes no fueron completadas hoy:`,
      tasks: incompleteTasks.map((t) => ({
        title: t.title,
        quadrant: QUADRANT_LABELS[t.quadrant].title,
      })),
    };

    if (this.config.emailEnabled && this.emailService) {
      await this.emailService.send(payload);
    }

    if (this.config.whatsappEnabled && this.whatsappService) {
      await this.whatsappService.send(payload);
    }

    return { sent: true, taskCount: incompleteTasks.length };
  }
}
