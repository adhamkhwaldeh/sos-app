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

// Forward declaration - will be set in ExpoGeolocationService
let serviceInstance: ExpoGeolocationService;

/**
 * Define TaskManager tasks at module load time (REQUIRED by Expo)
 * This MUST happen synchronously before any async operations
 */
const initializeModuleTasks = () => {
    try {
        console.log('🔄 Initializing TaskManager tasks...');

        // Define location update task
        TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
            console.log('🎯 [LOCATION TASK TRIGGERED] ' + LOCATION_TASK_NAME);
            console.log('📍 Data:', JSON.stringify(data));
            console.log('⚠️ Error:', error);

            if (error) {
                console.error('❌ Location task error:', error);
                return;
            }

            if (data) {
                const { locations } = data as any;
                if (locations && locations.length > 0) {
                    const location = locations[0];
                    console.log('✅ [Location Update from Task]', {
                        latitude: location.coords?.latitude,
                        longitude: location.coords?.longitude,
                        accuracy: location.coords?.accuracy,
                        timestamp: location.timestamp,
                    });

                    // Update background task status
                    if (serviceInstance) {
                        serviceInstance.getBackgroundTaskStatus().lastUpdate = new Date();
                        serviceInstance.getBackgroundTaskStatus().updateCount++;
                        serviceInstance.getBackgroundTaskStatus().isTracking = true;
                        console.log('📊 Background Task Status Update #' + serviceInstance.getBackgroundTaskStatus().updateCount);
                    }

                    // Call registered callbacks
                    if (serviceInstance) {
                        console.log('📢 Calling location callbacks, count:', serviceInstance.locationCallbacks.size);
                        serviceInstance.locationCallbacks.forEach((callback) => {
                            try {
                                callback(location);
                            } catch (err) {
                                console.error('❌ Callback error:', err);
                            }
                        });

                        // Call headless task handler if registered
                        if (serviceInstance.headlessTaskHandler) {
                            try {
                                await serviceInstance.headlessTaskHandler({
                                    name: 'location',
                                    params: location,
                                });
                            } catch (err) {
                                console.error('❌ Headless handler error:', err);
                            }
                        }
                    } else {
                        console.warn('⚠️ serviceInstance is null - callbacks not called!');
                    }
                } else {
                    console.log('⚠️ No locations in data');
                }
            } else {
                console.log('⚠️ Data is null');
            }
        });

        // Define motion change task
        TaskManager.defineTask(MOTION_CHANGE_TASK_NAME, async ({ data, error }) => {
            console.log('🎯 [MOTION CHANGE TASK TRIGGERED] ' + MOTION_CHANGE_TASK_NAME);
            if (error) {
                console.error('❌ Motion change task error:', error);
                return;
            }

            if (data) {
                console.log('✅ [Motion Change from Task]', data);
                if (serviceInstance) {
                    console.log('📢 Calling motion change callbacks, count:', serviceInstance.motionChangeCallbacks.size);
                    serviceInstance.motionChangeCallbacks.forEach((callback) => {
                        try {
                            callback(data);
                        } catch (err) {
                            console.error('❌ Motion callback error:', err);
                        }
                    });
                }
            }
        });

        console.log('✅ TaskManager tasks defined at module load');
    } catch (error) {
        console.error('❌ Error defining TaskManager tasks:', error);
    }
};

class ExpoGeolocationService {
    public locationCallbacks: Set<LocationCallback> = new Set();
    public motionChangeCallbacks: Set<MotionChangeCallback> = new Set();
    public activityChangeCallbacks: Set<ActivityChangeCallback> = new Set();
    public providerChangeCallbacks: Set<ProviderChangeCallback> = new Set();
    public headlessTaskHandler: HeadlessTaskHandler | null = null;
    private isInitialized = false;
    private foregroundWatcherUnsubscribe: Location.LocationSubscription | null = null;
    private backgroundTaskStatus = {
        lastUpdate: null as Date | null,
        updateCount: 0,
        isTracking: false,
    };

    constructor() {
        // Set the global service instance so TaskManager tasks can access it
        serviceInstance = this;
    }

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
     * Initialize the geolocation service with configuration
     */
    async initialize(config: GeolocationConfig = {}): Promise<void> {
        if (this.isInitialized) {
            console.log('ℹ️ Expo geolocation service already initialized');
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
            console.log('🚀 Starting Expo geolocation initialization...');

            // Request permissions
            console.log('📍 Requesting foreground location permission...');
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('❌ Location permission NOT granted:', status);
                return;
            }
            console.log('✅ Foreground permission granted');

            // Request background permission
            console.log('📍 Requesting background location permission...');
            const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
            console.log('Background permission result:', backgroundStatus);

            if (backgroundStatus.status !== 'granted') {
                console.error('❌ ❌ ❌ CRITICAL: Background location permission DENIED ❌ ❌ ❌');
                console.error('Permission status:', backgroundStatus.status);
                console.error('Permissions object:', JSON.stringify(backgroundStatus, null, 2));
                console.error('\n🚨 IMPORTANT NOTICE:');
                console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.error('Background location permission is REQUIRED for TaskManager tasks to work!');
                console.error('Tasks will NOT trigger when the app is backgrounded.');
                console.error('\nHow to fix (Android):');
                console.error('1. Open Settings');
                console.error('2. Go to Apps > SOS App > Permissions > Location');
                console.error('3. Select "Allow all the time" (NOT "Allow only while using the app")');
                console.error('\nHow to fix (iOS):');
                console.error('1. Open Settings > SOS App > Location');
                console.error('2. Select "Always" (NOT "While Using")');
                console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                throw new Error('Background location permission required but was denied');
            } else {
                console.log('✅ Background permission granted - TaskManager tasks will work!');
            }

            // Check if already tracking
            console.log('🔍 Checking if already tracking...');
            const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
            console.log('📊 Already tracking:', isTracking);

            if (isTracking) {
                console.log('🛑 Stopping existing location tracking...');
                await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                console.log('✅ Stopped existing tracking');
            }

            // Start background location tracking
            console.log('▶️ Starting new location tracking with config:', {
                accuracy: 'High',
                timeInterval: 10000,
            });
            // await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            //     accuracy: Location.Accuracy.High,
            //     timeInterval: 10000,      // Android (ms)
            //     showsBackgroundLocationIndicator: true, // iOS
            //     foregroundService: {
            //         notificationTitle: 'Tracking location',
            //         notificationBody: 'Location tracking is active',
            //     },
            // });

            console.log('✅ Expo geolocation service initialized successfully');
            this.isInitialized = true;

            // Start foreground location watching for real-time updates
            console.log('👀 Starting foreground location watcher...');
            await this.startForegroundLocationWatcher();

            // Force moving state
            console.log('🏃 Setting pace to moving...');
            await this.changePace(true);

            // Simulate motion change (always moving for this POC)
            this.motionChangeCallbacks.forEach((callback) => {
                try {
                    callback({ isMoving: true });
                } catch (err) {
                    console.error('❌ Motion callback error:', err);
                }
            });

            console.log('✅ Initialization complete. Tracking active in foreground and background!');

            await this.diagnoseTaskStatus();
        } catch (error) {
            console.error('❌ Failed to initialize expo geolocation service:', error);
            throw error;
        }
    }

    /**
     * Start background geolocation tracking
     */
    async start(): Promise<void> {
        try {
            console.log('▶️ Attempting to start location tracking...');
            const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
            console.log('📊 Already tracking:', isTracking);

            if (isTracking) {
                console.log('ℹ️ Already tracking, skipping start');
                return;
            }

            console.log('⏳ Starting location updates...');
            await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                accuracy: Location.Accuracy.High,
                timeInterval: 10000,      // Android (ms)
                showsBackgroundLocationIndicator: true, // iOS
                foregroundService: {
                    notificationTitle: 'Tracking location',
                    notificationBody: 'Location tracking is active',
                },
            });
            console.log('✅ Location tracking started successfully');
        } catch (error) {
            console.error('❌ Failed to start location tracking:', error);
            throw error;
        }
    }

    /**
     * Stop background geolocation tracking
     */
    async stop(): Promise<void> {
        try {
            // Stop foreground watcher
            if (this.foregroundWatcherUnsubscribe) {
                this.foregroundWatcherUnsubscribe?.remove();
                this.foregroundWatcherUnsubscribe = null;
                console.log('✅ Foreground watcher stopped');
            }

            // Stop background tracking
            const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
            if (isTracking) {
                await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            }
            console.log('✅ Expo location tracking stopped');
        } catch (error) {
            console.error('❌ Failed to stop location tracking:', error);
            throw error;
        }
    }

    /**
     * Start foreground location watcher for real-time updates while app is in foreground
     */
    private async startForegroundLocationWatcher(): Promise<void> {
        try {
            console.log('👀 Starting foreground location watcher...');

            // Stop existing watcher if any
            if (this.foregroundWatcherUnsubscribe) {
                this.foregroundWatcherUnsubscribe?.remove();
            }

            // Watch location with high accuracy while app is in foreground
            this.foregroundWatcherUnsubscribe = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000,  // 5 seconds
                    distanceInterval: 0, // 10 meters
                },
                (location) => {
                    console.log('👁️ [FOREGROUND Location Update]', {
                        latitude: location.coords?.latitude,
                        longitude: location.coords?.longitude,
                        accuracy: location.coords?.accuracy,
                        timestamp: location.timestamp ?? Date.now(),
                    });

                    // Call location callbacks
                    this.locationCallbacks.forEach((callback) => {
                        try {
                            callback(location);
                        } catch (err) {
                            console.error('❌ Foreground callback error:', err);
                        }
                    });
                }
            );

            console.log('✅ Foreground location watcher started successfully');
        } catch (error) {
            console.error('❌ Failed to start foreground location watcher:', error);
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
            // Stop foreground watcher
            if (this.foregroundWatcherUnsubscribe) {
                this.foregroundWatcherUnsubscribe?.remove();
                this.foregroundWatcherUnsubscribe = null;
                console.log('✅ Foreground watcher stopped');
            }
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
     * Get background task status
     */
    getBackgroundTaskStatus(): {
        lastUpdate: Date | null;
        updateCount: number;
        isTracking: boolean;
    } {
        return {
            lastUpdate: this.backgroundTaskStatus.lastUpdate,
            updateCount: this.backgroundTaskStatus.updateCount,
            isTracking: this.backgroundTaskStatus.isTracking,
        };
    }

    /**
     * Get formatted background task status as string
     */
    getBackgroundTaskStatusString(): string {
        return `Background Updates: ${this.backgroundTaskStatus.updateCount} | Last: ${this.backgroundTaskStatus.lastUpdate
            ? this.backgroundTaskStatus.lastUpdate.toLocaleTimeString()
            : 'Never'
            } | Tracking: ${this.backgroundTaskStatus.isTracking ? '✅' : '❌'}`;
    }

    /**
     * Diagnostic method to check task status and permissions
     */
    async diagnoseTaskStatus(): Promise<void> {
        try {
            console.log('\n📋 === DIAGNOSTIC REPORT ===\n');

            // Check if task is running
            const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
            console.log(`🎯 Task "${LOCATION_TASK_NAME}" is running:`, isTracking);

            // Check permissions
            const fgPerm = await Location.getForegroundPermissionsAsync();
            console.log('📍 Foreground permission status:', fgPerm.status, fgPerm.granted);

            const bgPerm = await Location.getBackgroundPermissionsAsync();
            console.log('📍 Background permission status:', bgPerm.status, bgPerm.granted);

            // Get last known location
            const lastLocation = await Location.getLastKnownPositionAsync();
            console.log('📍 Last known location:', lastLocation ? {
                lat: lastLocation.coords?.latitude,
                lon: lastLocation.coords?.longitude,
                timestamp: new Date(lastLocation.timestamp || 0).toISOString(),
            } : 'NULL');

            // Check registered callbacks
            console.log('📢 Registered callbacks:');
            console.log('   - Location callbacks:', this.locationCallbacks.size);
            console.log('   - Motion change callbacks:', this.motionChangeCallbacks.size);
            console.log('   - Headless handler:', this.headlessTaskHandler ? 'YES' : 'NO');

            // Background task status
            console.log('\n📊 BACKGROUND TASK STATUS:');
            console.log('   - Updates received:', this.backgroundTaskStatus.updateCount);
            console.log('   - Last update:', this.backgroundTaskStatus.lastUpdate ? new Date(this.backgroundTaskStatus.lastUpdate).toISOString() : 'NEVER');
            console.log('   - Is tracking:', this.backgroundTaskStatus.isTracking);

            // Foreground status
            console.log('\n👀 FOREGROUND STATUS:');
            console.log('   - Watcher active:', this.foregroundWatcherUnsubscribe ? 'YES' : 'NO');

            console.log('\n⚠️  IMPORTANT NOTES:');
            console.log('✅ Foreground: Updates should happen every 5 seconds while app is active');
            console.log('✅ Background: Updates only trigger when app is backgrounded (tap home button)');
            console.log('💡 To test background: Background the app and move around, then reopen');
            console.log('💡 Check "Background Updates received" counter to verify background task is working\n');

        } catch (error) {
            console.error('❌ Diagnostic error:', error);
        }
    }    /**
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

            // Reset background task status
            this.backgroundTaskStatus = {
                lastUpdate: null,
                updateCount: 0,
                isTracking: false,
            };

            this.isInitialized = false;
            console.log('✅ Expo geolocation service reset');
        } catch (error) {
            console.error('❌ Failed to reset expo geolocation service:', error);
            throw error;
        }
    }

    /**
     * Cleanup and remove all listeners
     */
    destroy(): void {
        // Stop foreground watcher
        if (this.foregroundWatcherUnsubscribe) {
            this.foregroundWatcherUnsubscribe?.remove();
            this.foregroundWatcherUnsubscribe = null;
        }

        this.locationCallbacks.clear();
        this.motionChangeCallbacks.clear();
        this.activityChangeCallbacks.clear();
        this.providerChangeCallbacks.clear();
        this.headlessTaskHandler = null;
        this.isInitialized = false;
        console.log('✅ Expo geolocation service destroyed');
    }
}

export const expoGeolocationService = new ExpoGeolocationService();

// Initialize TaskManager tasks at module load time (CRITICAL for Expo)
initializeModuleTasks();

export type { ActivityChangeCallback, GeolocationConfig, HeadlessTaskEvent, HeadlessTaskHandler, LocationCallback, MotionChangeCallback, ProviderChangeCallback };

