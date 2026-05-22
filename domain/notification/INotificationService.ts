export interface NotificationPayload {
  subject: string;
  body: string;
  tasks: Array<{ title: string; quadrant: string }>;
}

export interface INotificationService {
  send(payload: NotificationPayload): Promise<void>;
}
