// import { geolocationService } from '@/src/services/geolocationService';
import { expoGeolocationService as geolocationService } from '@/src/services/expoGeolocationService';

import { appendLocationLog } from '@/src/helpers/locationLogger';
import { runMigrations } from '../../db/client';

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

geolocationService.registerHeadlessTask(HeadlessTask);
