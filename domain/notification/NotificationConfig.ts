export interface NotificationConfig {
  id: string;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappPhone?: string | null;
  reminderHour: number; // 0-23
}

export type UpdateNotificationConfigDTO = Partial<
  Pick<NotificationConfig, "emailEnabled" | "whatsappEnabled" | "whatsappPhone" | "reminderHour">
>;
