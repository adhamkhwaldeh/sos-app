import BackgroundGeolocation, {
    Location,
    Subscription,
} from 'react-native-background-geolocation';

/**
 * Geolocation Service Wrapper
 *
 * This service wraps react-native-background-geolocation to provide
 * a unified interface. By using this wrapper, future changes to the
 * geolocation provider will only require updates here.
 */

interface GeolocationConfig {
    desiredAccuracy?: 'High' | 'Medium' | 'Low' | 'PowerSaving';
    distanceFilter?: number;
    locationUpdateInterval?: number;
    fastestLocationUpdateInterval?: number;
    disableStopDetection?: boolean;
    allowIdenticalLocations?: boolean;
}

interface HeadlessTaskEvent {
    name: string;
    params: any;
}

type LocationCallback = (location: Location) => void;
type MotionChangeCallback = (event: any) => void;
type ActivityChangeCallback = (event: any) => void;
type ProviderChangeCallback = (event: any) => void;
type HeadlessTaskHandler = (event: HeadlessTaskEvent) => Promise<void>;

class GeolocationService {
    private subscriptions: Map<string, Subscription> = new Map();
    private isInitialized = false;

    /**
     * Initialize the geolocation service with configuration
     */
    async initialize(config: GeolocationConfig = {}): Promise<void> {
        if (this.isInitialized) {
            console.log('Geolocation service already initialized');
            return;
        }

        const {
            desiredAccuracy = 'High',
            distanceFilter = 0,
            locationUpdateInterval = 1000,
            fastestLocationUpdateInterval = 1000,
            disableStopDetection = true,
            allowIdenticalLocations = true,
        } = config;

        const accuracyMap = {
            High: BackgroundGeolocation.DesiredAccuracy.High,
            Medium: BackgroundGeolocation.DesiredAccuracy.Medium,
            Low: BackgroundGeolocation.DesiredAccuracy.Low,
            PowerSaving: BackgroundGeolocation.DesiredAccuracy.Lowest,
        };

        try {
            const state = await BackgroundGeolocation.ready({
                activity: {},
                persistence: {},
                geolocation: {
                    desiredAccuracy: accuracyMap[desiredAccuracy],
                    distanceFilter,
                    locationUpdateInterval,
                    fastestLocationUpdateInterval,
                    disableStopDetection,
                    allowIdenticalLocations,
                },
                app: {
                    startOnBoot: true,
                    stopOnTerminate: false,
                    heartbeatInterval: 60,
                    enableHeadless: true,
                },
                logger: {
                    debug: true,
                    logLevel: BackgroundGeolocation.LogLevel.Verbose,
                    logMaxDays: 5 * 24 * 60 * 60,
                },
                reset: true,
            });

            console.log('Geolocation service initialized:', state);

            if (!state.enabled) {
                await this.start();
            }

            // Force moving state
            await this.changePace(true);

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize geolocation service:', error);
            throw error;
        }
    }

    /**
     * Start background geolocation tracking
     */
    async start(): Promise<void> {
        try {
            const state = await BackgroundGeolocation.start();
            console.log('Geolocation tracking started:', state);
        } catch (error) {
            console.error('Failed to start geolocation tracking:', error);
            throw error;
        }
    }

    /**
     * Stop background geolocation tracking
     */
    async stop(): Promise<void> {
        try {
            const state = await BackgroundGeolocation.stop();
            console.log('Geolocation tracking stopped:', state);
        } catch (error) {
            console.error('Failed to stop geolocation tracking:', error);
            throw error;
        }
    }

    /**
     * Change pace state (moving/stationary)
     */
    async changePace(isMoving: boolean): Promise<void> {
        try {
            await BackgroundGeolocation.changePace(isMoving);
            console.log(`Pace changed to: ${isMoving ? 'moving' : 'stationary'}`);
        } catch (error) {
            console.error('Failed to change pace:', error);
            throw error;
        }
    }

    /**
     * Subscribe to location updates
     */
    onLocation(callback: LocationCallback): () => void {
        const subscription = BackgroundGeolocation.onLocation(callback);
        const id = `onLocation_${Date.now()}`;
        this.subscriptions.set(id, subscription);

        return () => {
            subscription.remove();
            this.subscriptions.delete(id);
        };
    }

    /**
     * Subscribe to motion change events
     */
    onMotionChange(callback: MotionChangeCallback): () => void {
        const subscription = BackgroundGeolocation.onMotionChange(callback);
        const id = `onMotionChange_${Date.now()}`;
        this.subscriptions.set(id, subscription);

        return () => {
            subscription.remove();
            this.subscriptions.delete(id);
        };
    }

    /**
     * Subscribe to activity change events
     */
    onActivityChange(callback: ActivityChangeCallback): () => void {
        const subscription = BackgroundGeolocation.onActivityChange(callback);
        const id = `onActivityChange_${Date.now()}`;
        this.subscriptions.set(id, subscription);

        return () => {
            subscription.remove();
            this.subscriptions.delete(id);
        };
    }

    /**
     * Subscribe to provider change events
     */
    onProviderChange(callback: ProviderChangeCallback): () => void {
        const subscription = BackgroundGeolocation.onProviderChange(callback);
        const id = `onProviderChange_${Date.now()}`;
        this.subscriptions.set(id, subscription);

        return () => {
            subscription.remove();
            this.subscriptions.delete(id);
        };
    }

    /**
     * Register headless task for background execution
     */
    registerHeadlessTask(handler: HeadlessTaskHandler): void {
        BackgroundGeolocation.registerHeadlessTask(async (event) => {
            try {
                await handler({
                    name: event.name,
                    params: event.params,
                });
            } catch (error) {
                console.error('Error in headless task:', error);
            }
        });
    }

    /**
     * Get current geolocation state
     */
    async getState(): Promise<any> {
        try {
            return await BackgroundGeolocation.getState();
        } catch (error) {
            console.error('Failed to get geolocation state:', error);
            throw error;
        }
    }

    /**
     * Reset the service
     */
    async reset(): Promise<void> {
        try {
            // Remove all subscriptions
            this.subscriptions.forEach((subscription) => {
                subscription.remove();
            });
            this.subscriptions.clear();

            // Reset tracking state
            await this.stop();
            this.isInitialized = false;
            console.log('Geolocation service reset');
        } catch (error) {
            console.error('Failed to reset geolocation service:', error);
            throw error;
        }
    }

    /**
     * Cleanup and remove all listeners
     */
    destroy(): void {
        this.subscriptions.forEach((subscription) => {
            subscription.remove();
        });
        this.subscriptions.clear();
        this.isInitialized = false;
        console.log('Geolocation service destroyed');
    }
}

// Export singleton instance
export const geolocationService = new GeolocationService();

// Export types
export type { ActivityChangeCallback, GeolocationConfig, HeadlessTaskEvent, HeadlessTaskHandler, LocationCallback, MotionChangeCallback, ProviderChangeCallback };

