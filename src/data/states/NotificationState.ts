import { NotificationLog } from "@/src/data/entities/NotificationLog";

export interface NotificationState {
    notifications: NotificationLog[];
    setNotifications: (notifications: NotificationLog[]) => void;
    addNotification: (notification: NotificationLog) => void;
    clearNotifications: () => void;
    fetchNotifications: () => Promise<void>;
}
