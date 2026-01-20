# Geolocation Service - Implementation Guide

This document explains how to swap between different geolocation implementations thanks to the wrapper pattern.

## Current Architecture

The geolocation wrapper (`src/services/geolocationService.ts`) provides a unified interface that abstracts the underlying implementation. This allows you to change providers without modifying any consuming code.

## Available Implementations

### 1. react-native-background-geolocation (Current)

**File:** `src/services/geolocationService.ts`

**Features:**
- Advanced motion detection
- Activity classification
- Excellent battery optimization
- Headless task support
- Rich provider change events

**Pros:**
- Production-ready
- Well-maintained
- Comprehensive features

**Cons:**
- Paid license for premium features
- Larger bundle size

### 2. expo-location + expo-task-manager (POC)

**File:** `src/services/expoGeolocationService.ts`

**Features:**
- Built into Expo ecosystem
- Simpler implementation
- No external dependencies beyond Expo
- Task Manager for background execution

**Pros:**
- Lightweight
- Consistent with Expo ecosystem
- Easier testing

**Cons:**
- Less sophisticated motion detection
- Limited activity classification
- Requires Expo managed workflow

## How to Switch Implementations

### Step 1: Update the Service Export

Edit `src/services/geolocationService.ts` and change the import at the top:

**From (react-native-background-geolocation):**
```typescript
import BackgroundGeolocation from 'react-native-background-geolocation';
// ... implementation code
```

**To (expo-location):**
```typescript
import { expoGeolocationService } from './expoGeolocationService';
export const geolocationService = expoGeolocationService;
```

### Step 2: Install Dependencies (if switching to Expo)

```bash
npm install expo-location expo-task-manager
# or
yarn add expo-location expo-task-manager
```

### Step 3: No Changes Required in Consuming Code!

The following files will work without any modifications:

- `src/hooks/useBackgroundGeolocation.ts`
- `HeadlessTask.ts`
- Any other components using `geolocationService`

## Quick Comparison

| Feature | react-native | expo-location |
|---------|-------------|----------------|
| Background tracking | ✅ Advanced | ✅ Basic |
| Motion detection | ✅ Native | ⚠️ Simulated |
| Activity classification | ✅ Yes | ❌ No |
| Headless tasks | ✅ Yes | ✅ Yes |
| Battery optimization | ✅ Excellent | ✅ Good |
| Learning curve | ⚠️ Moderate | ✅ Easy |
| Cost | ⚠️ Paid features | ✅ Free |

## Implementation Details

Both implementations provide the same interface:

```typescript
// Configuration
await geolocationService.initialize(config);

// Control
await geolocationService.start();
await geolocationService.stop();
await geolocationService.changePace(true);

// Subscriptions
geolocationService.onLocation((location) => {});
geolocationService.onMotionChange((event) => {});
geolocationService.onActivityChange((event) => {});
geolocationService.onProviderChange((event) => {});

// Headless tasks
geolocationService.registerHeadlessTask(handler);

// State
const state = await geolocationService.getState();
```

## Testing Implementation Swaps

To test with the Expo implementation:

1. Create a branch for testing
2. Update the service export to use `expoGeolocationService`
3. Install `expo-location` and `expo-task-manager`
4. Run the app and verify all functionality works
5. No changes needed in UI or business logic!

## Creating New Implementations

To add another implementation (e.g., Google Play Services Geofencing):

1. Create a new file: `src/services/alternativeGeolocationService.ts`
2. Implement the same interface with all methods
3. Export the interface types from the new service
4. Update the service export in `geolocationService.ts`

Example structure:

```typescript
class AlternativeGeolocationService {
    async initialize(config: GeolocationConfig): Promise<void> { }
    async start(): Promise<void> { }
    async stop(): Promise<void> { }
    async changePace(isMoving: boolean): Promise<void> { }
    onLocation(callback: LocationCallback): () => void { }
    onMotionChange(callback: MotionChangeCallback): () => void { }
    onActivityChange(callback: ActivityChangeCallback): () => void { }
    onProviderChange(callback: ProviderChangeCallback): () => void { }
    registerHeadlessTask(handler: HeadlessTaskHandler): void { }
    async getState(): Promise<any> { }
    async reset(): Promise<void> { }
    destroy(): void { }
}
```

## Best Practices

1. **Keep the interface consistent** - All implementations must provide the same methods
2. **Document differences** - Note any limitations in each implementation
3. **Test thoroughly** - Verify all features work with each provider
4. **Handle edge cases** - Different platforms may have different capabilities
5. **Version lock** - When switching providers, ensure compatible versions

## Notes

- The Expo implementation (`expoGeolocationService.ts`) is a proof-of-concept
- Some features (like motion detection) are simulated
- For production use of Expo, enhance the implementation based on your specific needs
- Consider creating a feature matrix to track which features work with each implementation
