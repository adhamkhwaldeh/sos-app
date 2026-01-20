import * as FileSystem from 'expo-file-system';
// import { File, Directory, Paths } from      'expo-file-system';


// const LOG_FILE_URI = (FileSystem as any).cacheDirectory + 'location_logs.txt';
const LOG_FILE_URI = FileSystem.Paths.cache.info().uri + 'location_logs.txt';

import { db } from '../db/client';
import { locations } from '../db/schema';
import { useLocationStore } from '../store/useLocationStore';
import { DB_EVENTS, dbEventEmitter } from './eventEmitter';


export const appendLocationLog = async (source: string, location: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${source}] ${JSON.stringify(location)}\n`;

    try {
        // 1. File Logging (Legacy/Current)
        const file = new FileSystem.File(FileSystem.Paths.cache, 'location_logs.txt');
        const fileInfo = await file.info();
        if (!fileInfo.exists) {
            await file.write(logEntry);
        } else {
            const existingContent = await file.textSync();
            await file.write(existingContent + logEntry);
        }

        // 2. ORM Logging
        await db.insert(locations).values({
            latitude: location.coords?.latitude ?? 0,
            longitude: location.coords?.longitude ?? 0,
            timestampUTC: location.timestamp || timestamp,
            speed: location.coords?.speed,
            heading: location.coords?.heading,
            accuracy: location.coords?.accuracy,
            altitude: location.coords?.altitude,
            batteryLevel: location.battery?.level,
            action: source,
            rawJson: JSON.stringify(location),
        });

        // 3. Update Zustand Store
        useLocationStore.getState().fetchLogs();

        dbEventEmitter.emit(DB_EVENTS.LOGS_UPDATED);


        console.log(`Logged to DB and file: ${logEntry.trim()}`);
    } catch (error) {
        console.error('Failed to write location log:', error);
    }
};

export const getLogFileUri = () => LOG_FILE_URI;

export const clearAllLogs = async () => {
    try {
        // Clear file
        new FileSystem.File(FileSystem.Paths.cache, 'location_logs.txt').delete();

        // Clear DB
        await db.delete(locations);

        // 3. Update Zustand Store
        useLocationStore.getState().clearLogs();

        console.log('All logs cleared (File and DB)');

    } catch (error) {
        console.error('Failed to clear logs:', error);
    }
};
