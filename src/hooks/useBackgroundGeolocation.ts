// import { geolocationService } from '@/src/services/geolocationService';
import { appendLocationLog } from '@/src/helpers/locationLogger';
import { expoGeolocationService as geolocationService } from '@/src/services/expoGeolocationService';
import { useEffect } from 'react';

export const useBackgroundGeolocation = () => {
    useEffect(() => {
        let unsubscribeLocation: (() => void) | null = null;
        let unsubscribeMotionChange: (() => void) | null = null;
        let unsubscribeActivityChange: (() => void) | null = null;
        let unsubscribeProviderChange: (() => void) | null = null;

        const initializeGeolocation = async () => {
            try {
                // Initialize the geolocation service
                await geolocationService.initialize({
                    desiredAccuracy: 'High',
                    distanceFilter: 0,
                    locationUpdateInterval: 1000,
                    fastestLocationUpdateInterval: 1000,
                    disableStopDetection: true,
                    allowIdenticalLocations: true,
                });

                // Log background task status
                console.log('📊', geolocationService.getBackgroundTaskStatusString());

                // Subscribe to location updates
                unsubscribeLocation = geolocationService.onLocation((location) => {
                    console.log('[onLocation]', location);
                    appendLocationLog('Foreground', location);
                });

                // Subscribe to motion change events
                unsubscribeMotionChange = geolocationService.onMotionChange((event) => {
                    console.log('[onMotionChange]', event);
                });

                // Subscribe to activity change events
                unsubscribeActivityChange = geolocationService.onActivityChange((event) => {
                    console.log('[onActivityChange]', event);
                });

                // Subscribe to provider change events
                unsubscribeProviderChange = geolocationService.onProviderChange((event) => {
                    console.log('[onProviderChange]', event);
                });
            } catch (error) {
                console.error('Failed to initialize geolocation:', error);
            }
        };

        initializeGeolocation();

        return () => {
            console.log('- Clear the hook');
            unsubscribeLocation?.();
            unsubscribeMotionChange?.();
            unsubscribeActivityChange?.();
            unsubscribeProviderChange?.();
        };
    }, []);
};

