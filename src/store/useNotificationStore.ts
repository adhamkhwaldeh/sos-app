import { NotificationState } from '@/src/data/states/NotificationState';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { desc } from 'drizzle-orm';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { db } from '../db/client';
import { notifications } from '../db/schema';

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            notifications: [],
            setNotifications: (notifications) => set({ notifications }),
            addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
            clearNotifications: () => set({ notifications: [] }),
            fetchNotifications: async () => {
                try {
                    const allNotifications = await db.select().from(notifications).orderBy(desc(notifications.id));
                    set({ notifications: allNotifications });
                } catch (error) {
                    console.error('Failed to fetch notifications from DB:', error);
                }
            },
        }),
        {
            name: 'notification-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
