import { useEffect } from 'react';
import BackgroundGeolocation, {
    Location,
    Subscription,
} from 'react-native-background-geolocation';

import { appendLocationLog } from '@/utils/locationLogger';

export const useBackgroundGeolocation = () => {
    useEffect(() => {
        const onLocation: Subscription = BackgroundGeolocation.onLocation((location: Location) => {
            console.log('[onLocation]', location);
            appendLocationLog('Foreground', location);
        });

        const onMotionChange: Subscription = BackgroundGeolocation.onMotionChange((event) => {
            console.log('[onMotionChange]', event);
        });

        const onActivityChange: Subscription = BackgroundGeolocation.onActivityChange((event) => {
            console.log('[onActivityChange]', event);
        });

        const onProviderChange: Subscription = BackgroundGeolocation.onProviderChange((event) => {
            console.log('[onProviderChange]', event);
        });

        // const onHeartbeat: Subscription = BackgroundGeolocation.onHeartbeat((event) => {
        //     console.log('[onHeartbeat]', event);
        // });


        BackgroundGeolocation.ready({
            activity: {

            },
            persistence: {

            },
            geolocation: {
                desiredAccuracy: BackgroundGeolocation.DesiredAccuracy.High,
                // distanceFilter: 10,

                distanceFilter: 0,
                locationUpdateInterval: 1000,
                fastestLocationUpdateInterval: 1000,
                disableStopDetection: true,
                allowIdenticalLocations: true,
            },
            // heartbeatInterval: 60,
            // foregroundService: true,
            app: {
                startOnBoot: true,
                stopOnTerminate: false,
                heartbeatInterval: 60,
                enableHeadless: true,

                // notification: {

                // },
            },
            logger: {
                debug: true,
                logLevel: BackgroundGeolocation.LogLevel.Verbose,
                logMaxDays: 5 * 24 * 60 * 60,
            },
            reset: true, // Reset config on every app launch for development
        }).then(async (state) => {
            console.log('- BackgroundGeolocation is ready: ', state);
            if (!state.enabled) {
                const state = await BackgroundGeolocation.start();
                console.log('- Start success');
            }

            // Force the plugin to enter "moving" state immediately
            await BackgroundGeolocation.changePace(true);
            console.log('- changePace(true) executed');
        });

        return () => {
            console.log('- Clear the hook');
            onLocation.remove();
            onMotionChange.remove();
            onActivityChange.remove();
            onProviderChange.remove();
            // onHeartbeat.remove();
        };
    }, []);
};

