import { LocationState } from '@/src/data/states/LocationState';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { desc } from 'drizzle-orm';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { db } from '../db/client';
import { locations } from '../db/schema';

export const useLocationStore = create<LocationState>()(
    persist(
        (set) => ({
            logs: [],
            setLogs: (logs) => set({ logs }),
            addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
            clearLogs: () => set({ logs: [] }),
            fetchLogs: async () => {
                try {
                    const allLogs = await db.select().from(locations).orderBy(desc(locations.id));
                    set({ logs: allLogs });
                } catch (error) {
                    console.error('Failed to fetch logs from DB:', error);
                }
            },
        }),
        {
            name: 'location-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
