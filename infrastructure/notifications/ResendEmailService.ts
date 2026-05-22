import { Resend } from "resend";
import { INotificationService, NotificationPayload } from "@/domain/notification/INotificationService";

export class ResendEmailService implements INotificationService {
  private resend: Resend;
  private toEmail: string;
  private fromEmail: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY!);
    this.toEmail = process.env.NOTIFICATION_EMAIL!;
    this.fromEmail = process.env.RESEND_FROM_EMAIL!;
  }

  async send(payload: NotificationPayload): Promise<void> {
    const taskList = payload.tasks.map((t) => `• ${t.title}`).join("\n");

    await this.resend.emails.send({
      from: this.fromEmail,
      to: this.toEmail,
      subject: payload.subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #ef4444;">🔴 Focalize — Recordatorio diario</h2>
          <p>${payload.body}</p>
          <ul style="padding-left: 20px;">
            ${payload.tasks.map((t) => `<li><strong>${t.title}</strong></li>`).join("")}
          </ul>
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            Abre Focalize para completar tus tareas urgentes.
          </p>
        </div>
      `,
    });
  }
}
