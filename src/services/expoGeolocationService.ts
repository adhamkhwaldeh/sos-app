/**
 * Alternative Geolocation Service Implementation
 *
 * This is a proof-of-concept showing how the GeolocationService wrapper
 * makes it easy to swap implementations. This uses expo-location and
 * expo-task-manager instead of react-native-background-geolocation.
 *
 * To use this implementation:
 * 1. Install: npm install expo-location expo-task-manager
 * 2. Replace the imports in geolocationService.ts to use this implementation
 * 3. No changes needed in consuming code (hooks, components, etc.)
 *
 * Note: This is a simplified POC. Some features may need adjustment based
 * on specific requirements.
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'sos-app-location-tracking';
const MOTION_CHANGE_TASK_NAME = 'sos-app-motion-change';

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

type LocationCallback = (location: any) => void;
type MotionChangeCallback = (event: any) => void;
type ActivityChangeCallback = (event: any) => void;
type ProviderChangeCallback = (event: any) => void;
type HeadlessTaskHandler = (event: HeadlessTaskEvent) => Promise<void>;

class ExpoGeolocationService {
    private locationCallbacks: Set<LocationCallback> = new Set();
    private motionChangeCallbacks: Set<MotionChangeCallback> = new Set();
    private activityChangeCallbacks: Set<ActivityChangeCallback> = new Set();
    private providerChangeCallbacks: Set<ProviderChangeCallback> = new Set();
    private headlessTaskHandler: HeadlessTaskHandler | null = null;
    private isInitialized = false;

    /**
     * Convert expo accuracy to our accuracy format
     */
    private getExpoAccuracy(accuracy: string): number {
        const accuracyMap: Record<string, number> = {
            PowerSaving: Location.Accuracy.Lowest,
            Low: Location.Accuracy.Low,
            Medium: Location.Accuracy.Balanced,
            High: Location.Accuracy.High,
        };
        return accuracyMap[accuracy] || Location.Accuracy.High;
    }

    /**
     * Register background task for location updates
     */
    private async registerLocationTask(): Promise<void> {
        TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
            if (error) {
                console.error('Location task error:', error);
                return;
            }

            if (data) {
                const { locations } = data as any;
                if (locations && locations.length > 0) {
                    const location = locations[0];
                    console.log('[Location Update]', location);

                    // Call registered callbacks
                    this.locationCallbacks.forEach((callback) => {
                        callback(location);
                    });

                    // Call headless task handler if registered
                    if (this.headlessTaskHandler) {
                        await this.headlessTaskHandler({
                            name: 'location',
                            params: location,
                        });
                    }
                }
            }
        });
    }

    /**
     * Register motion change task
     */
    private async registerMotionChangeTask(): Promise<void> {
        TaskManager.defineTask(MOTION_CHANGE_TASK_NAME, async ({ data, error }) => {
            if (error) {
                console.error('Motion change task error:', error);
                return;
            }

            if (data) {
                console.log('[Motion Change]', data);
                this.motionChangeCallbacks.forEach((callback) => {
                    callback(data);
                });
            }
        });
    }

    /**
     * Initialize the geolocation service with configuration
     */
    async initialize(config: GeolocationConfig = {}): Promise<void> {
        if (this.isInitialized) {
            console.log('Expo geolocation service already initialized');
            return;
        }

        const {
            desiredAccuracy = 'High',
            distanceFilter = 0,
            locationUpdateInterval = 1000,
            disableStopDetection = true,
            allowIdenticalLocations = true,
        } = config;

        try {
            // Request permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Location permission not granted');
                return;
            }

            // Request background permission
            const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
            if (backgroundStatus.status !== 'granted') {
                console.warn('Background location permission not granted');
            }

            // Register background tasks
            await this.registerLocationTask();
            await this.registerMotionChangeTask();

            // Start background location tracking
            await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                accuracy: this.getExpoAccuracy(desiredAccuracy),
                distanceInterval: distanceFilter || 0,
                timeInterval: locationUpdateInterval || 1000,
                showsBackgroundLocationIndicator: true,
            });

            console.log('Expo geolocation service initialized');
            this.isInitialized = true;

            // Simulate motion change (always moving for this POC)
            this.motionChangeCallbacks.forEach((callback) => {
                callback({ isMoving: true });
            });
        } catch (error) {
            console.error('Failed to initialize expo geolocation service:', error);
            throw error;
        }
    }

    /**
     * Start background geolocation tracking
     */
    async start(): Promise<void> {
        try {
            const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
            if (!isTracking) {
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 0,
                    timeInterval: 1000,
                });
            }
            console.log('Expo location tracking started');
        } catch (error) {
            console.error('Failed to start expo location tracking:', error);
            throw error;
        }
    }

    /**
     * Stop background geolocation tracking
     */
    async stop(): Promise<void> {
        try {
            const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
            if (isTracking) {
                await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            }
            console.log('Expo location tracking stopped');
        } catch (error) {
            console.error('Failed to stop expo location tracking:', error);
            throw error;
        }
    }

    /**
     * Change pace state (moving/stationary)
     * Note: expo-location doesn't have native pace control, this is simulated
     */
    async changePace(isMoving: boolean): Promise<void> {
        try {
            console.log(`Pace changed to: ${isMoving ? 'moving' : 'stationary'}`);
            this.motionChangeCallbacks.forEach((callback) => {
                callback({ isMoving });
            });
        } catch (error) {
            console.error('Failed to change pace:', error);
            throw error;
        }
    }

    /**
     * Subscribe to location updates
     */
    onLocation(callback: LocationCallback): () => void {
        this.locationCallbacks.add(callback);
        return () => {
            this.locationCallbacks.delete(callback);
        };
    }

    /**
     * Subscribe to motion change events
     */
    onMotionChange(callback: MotionChangeCallback): () => void {
        this.motionChangeCallbacks.add(callback);
        return () => {
            this.motionChangeCallbacks.delete(callback);
        };
    }

    /**
     * Subscribe to activity change events
     */
    onActivityChange(callback: ActivityChangeCallback): () => void {
        this.activityChangeCallbacks.add(callback);
        return () => {
            this.activityChangeCallbacks.delete(callback);
        };
    }

    /**
     * Subscribe to provider change events
     */
    onProviderChange(callback: ProviderChangeCallback): () => void {
        this.providerChangeCallbacks.add(callback);
        return () => {
            this.providerChangeCallbacks.delete(callback);
        };
    }

    /**
     * Register headless task for background execution
     */
    registerHeadlessTask(handler: HeadlessTaskHandler): void {
        this.headlessTaskHandler = handler;
    }

    /**
     * Get current geolocation state
     */
    async getState(): Promise<any> {
        try {
            const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
            const lastLocation = await Location.getLastKnownPositionAsync();

            return {
                enabled: isTracking,
                isMoving: true,
                location: lastLocation,
            };
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
            // Stop tracking
            await this.stop();

            // Clear callbacks
            this.locationCallbacks.clear();
            this.motionChangeCallbacks.clear();
            this.activityChangeCallbacks.clear();
            this.providerChangeCallbacks.clear();

            // Clear headless task handler
            this.headlessTaskHandler = null;

            this.isInitialized = false;
            console.log('Expo geolocation service reset');
        } catch (error) {
            console.error('Failed to reset expo geolocation service:', error);
            throw error;
        }
    }

    /**
     * Cleanup and remove all listeners
     */
    destroy(): void {
        this.locationCallbacks.clear();
        this.motionChangeCallbacks.clear();
        this.activityChangeCallbacks.clear();
        this.providerChangeCallbacks.clear();
        this.headlessTaskHandler = null;
        this.isInitialized = false;
        console.log('Expo geolocation service destroyed');
    }
}

export const expoGeolocationService = new ExpoGeolocationService();

export type { ActivityChangeCallback, GeolocationConfig, HeadlessTaskEvent, HeadlessTaskHandler, LocationCallback, MotionChangeCallback, ProviderChangeCallback };

