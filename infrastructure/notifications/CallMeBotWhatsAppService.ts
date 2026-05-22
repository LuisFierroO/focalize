import { INotificationService, NotificationPayload } from "@/domain/notification/INotificationService";

export class CallMeBotWhatsAppService implements INotificationService {
  private phone: string;
  private apiKey: string;

  constructor(phone: string, apiKey: string) {
    this.phone = phone;
    this.apiKey = apiKey;
  }

  async send(payload: NotificationPayload): Promise<void> {
    const taskList = payload.tasks.map((t) => `• ${t.title}`).join("%0A");
    const message = encodeURIComponent(`🔴 *Focalize — Recordatorio*%0A${payload.body}%0A%0A${taskList}`);

    const url = `https://api.callmebot.com/whatsapp.php?phone=${this.phone}&text=${message}&apikey=${this.apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`CallMeBot error: ${res.status}`);
    }
  }
}
