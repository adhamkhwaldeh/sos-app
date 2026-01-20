import { appendLocationLog } from '@/src/utils/locationLogger';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { runMigrations } from './src/db/client';

const HeadlessTask = async (event: any) => {
    console.log('[HeadlessTask] - Starting migrations...');
    await runMigrations();
    console.log('[HeadlessTask] - Migrations finished.');
    const params = event.params;
    console.log('[HeadlessTask] -', event.name, params);

    switch (event.name) {
        case 'location':
            const location = params;
            console.log('[HeadlessTask] - Location:', location);
            await appendLocationLog('Headless', location);
            break;
        case 'terminate':
            console.log('[HeadlessTask] - Terminate event');
            await appendLocationLog('Headless', { event: 'terminate' });
            break;
    }
};

BackgroundGeolocation.registerHeadlessTask(HeadlessTask);
