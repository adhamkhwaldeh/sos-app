# SOS App - Technical Documentation

## Table of Contents
1. [Background Location Service](#background-location-service)
2. [App Theme & Wrapper](#app-theme--wrapper)
3. [Firebase Notifications](#firebase-notifications)
4. [Local Database & ORM](#local-database--orm)
5. [State Management](#state-management)
6. [Internationalization & Theme](#internationalization--theme)
7. [Form Handling](#form-handling)

---

## Background Location Service

### Overview
The app implements background location tracking using multiple strategies to ensure reliable geolocation updates even when the app is in the background.

### Implementation Approaches

#### 1. **Background Location with Background Tasks**
- **Library**: `expo-location` with `expo-task-manager`
- **Purpose**: Continuous location tracking in the background
- **Key Features**:
  - Tracks location updates at specified intervals
  - Stores location data when network is unavailable
  - Syncs data when connection is restored
  - Battery-efficient with configurable accuracy

**Configuration**:
```typescript
// src/hooks/useBackgroundGeolocation.ts
// Registers background task for location updates
// Handles location permissions (iOS: Always, Android: Always)
// Stores location logs in local database
```

#### 2. **Expo Geolocation Service**
- **Library**: `expo-location`
- **Purpose**: Foreground location tracking and one-time position requests
- **Key Features**:
  - High-precision location data
  - Real-time tracking when app is active
  - Fallback for background location service

**Service Location**: `src/services/expoGeolocationService.ts`
- Methods for getting current position
- Subscribe to real-time location updates
- Request location permissions

#### 3. **Custom Geolocation Service**
- **Location**: `src/services/geolocationService.ts`
- **Purpose**: Abstraction layer for all geolocation operations
- **Integration**: Works with both background and foreground services

### Architecture Diagram
```
┌─────────────────────────────────────────┐
│    App Background/Foreground            │
└────────────────┬────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
┌─────▼────────┐   ┌─────────▼────────┐
│ Foreground   │   │ Background Tasks │
│ Location     │   │ (Task Manager)   │
│ Service      │   │                  │
└─────┬────────┘   └─────────┬────────┘
      │                     │
      └──────────┬──────────┘
               │
    ┌──────────▼───────────┐
    │ Geolocation Service  │
    │ (Abstraction Layer)  │
    └──────────┬───────────┘
               │
    ┌──────────▼───────────┐
    │  Local Database      │
    │  (Location Logs)     │
    └──────────────────────┘
```

### Data Flow
1. **Background Task Trigger**: System calls background task at intervals
2. **Location Capture**: Service retrieves current location
3. **Data Storage**: Location logged to local database
4. **Sync**: When online, sync logs to backend

### Location Log Entity
**File**: `src/data/entities/LocationLog.ts`
```typescript
interface LocationLog {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  isSynced: boolean;
}
```

---

## App Theme & Wrapper

### Theme System

#### Theme Configuration
**File**: `src/styles/theme.ts`
- Defines color palettes (light/dark modes)
- Typography scales
- Spacing and sizing constants
- Component styling variables

#### Theme Context
**File**: `src/context/StatusBarContext.tsx`
- Manages theme state globally
- Provides theme switching functionality
- Updates StatusBar styling based on theme

### App Wrapper Architecture

#### Root Layout
**File**: `app/_layout.tsx`
- Wraps entire app with necessary providers
- Initializes global context

#### Provider Stack Structure
```
┌────────────────────────────────┐
│   StatusBar Context Provider   │
├────────────────────────────────┤
│   Localization Provider        │
├────────────────────────────────┤
│   Zustand Store Provider       │
├────────────────────────────────┤
│   Tab Navigator                │
└────────────────────────────────┘
```

### Theme Features
- Light and dark mode support
- Real-time theme switching
- Persisted theme preferences
- Dynamic color adjustments based on system settings

---

## Firebase Notifications

### Overview
Firebase Cloud Messaging (FCM) integration for push notifications and in-app messaging.

### Implementation

**Service File**: `src/services/notificationService.ts`

#### Key Features
1. **Notification Permissions**: Request user permission for notifications
2. **Device Token Management**: Register and manage FCM device tokens
3. **Notification Handling**:
   - Foreground notifications (app active)
   - Background notifications (app backgrounded)
   - Cold start notifications (app terminated)

#### Notification Log Entity
**File**: `src/data/entities/NotificationLog.ts`
```typescript
interface NotificationLog {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  metadata?: Record<string, any>;
}
```

#### Setup Steps
1. **Firebase Configuration**:
   - Add `google-services.json` to `android/app/`
   - Configure Firebase in app initialization

2. **Permission Handling**:
   - Request notification permissions on app start
   - Handle permission denial gracefully

3. **Token Management**:
   - Retrieve device token from FCM
   - Send token to backend for user mapping
   - Handle token refresh

4. **Notification Listeners**:
   - Setup foreground listener for active app
   - Setup background listener for inactive app
   - Log all notifications to local database

#### Notification Flow
```
Firebase Cloud Messaging
        │
        ├─→ Foreground (App Active)
        │   └─→ Display in-app notification
        │
        ├─→ Background (App Backgrounded)
        │   └─→ System notification tray
        │
        └─→ Cold Start (App Terminated)
            └─→ Notification triggers app launch
```

---

## Local Database & ORM

### Database Technology
**Type**: SQLite with Drizzle ORM
**Purpose**: Local persistence of location logs and notifications

### Setup

#### Drizzle Configuration
**File**: `drizzle.config.ts`
- Database URL configuration
- Migration settings
- Schema generation

#### Database Client
**File**: `src/db/client.ts`
- SQLite database initialization
- Connection management
- Query execution

### Schema

**File**: `src/db/schema.ts`

#### Tables

1. **location_logs**
   ```sql
   CREATE TABLE location_logs (
     id TEXT PRIMARY KEY,
     latitude REAL NOT NULL,
     longitude REAL NOT NULL,
     accuracy REAL,
     timestamp TEXT NOT NULL,
     is_synced BOOLEAN DEFAULT FALSE
   );
   ```

2. **notification_logs**
   ```sql
   CREATE TABLE notification_logs (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     body TEXT NOT NULL,
     timestamp TEXT NOT NULL,
     is_read BOOLEAN DEFAULT FALSE,
     metadata TEXT
   );
   ```

### Migrations
**Directory**: `drizzle/`
- Tracks schema changes
- Enables version control of database structure
- Automatic migration on app updates

### Data Entities
- **LocationLog**: `src/data/entities/LocationLog.ts`
- **NotificationLog**: `src/data/entities/NotificationLog.ts`

### Usage Example
```typescript
import { db } from '@/db/client';
import { locationLogs } from '@/db/schema';

// Insert location
await db.insert(locationLogs).values({
  id: generateId(),
  latitude: 25.1234,
  longitude: 55.5678,
  timestamp: new Date(),
  isSynced: false
});

// Query locations
const logs = await db.select().from(locationLogs);
```

---

## State Management

### Zustand Configuration

#### Overview
Zustand is used for lightweight, efficient state management without boilerplate.

### Store Structure

#### 1. Location Store
**File**: `src/store/useLocationStore.ts`

**State**:
```typescript
interface LocationState {
  locations: LocationLog[];
  currentLocation: Location | null;
  isTracking: boolean;
  
  // Actions
  addLocation: (location: LocationLog) => void;
  setCurrentLocation: (location: Location) => void;
  setTracking: (isTracking: boolean) => void;
  clearLocations: () => void;
}
```

**Usage**:
```typescript
const { locations, currentLocation, setTracking } = useLocationStore();
```

#### 2. Notification Store
**File**: `src/store/useNotificationStore.ts`

**State**:
```typescript
interface NotificationState {
  notifications: NotificationLog[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: NotificationLog) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}
```

### Store Features
- Immutable state updates
- Persist state to storage
- Devtools integration for debugging
- Selective subscription to state changes

### Architecture
```
┌──────────────────────────────┐
│    Zustand Store             │
├──────────────────────────────┤
│ • useLocationStore           │
│ • useNotificationStore       │
│ • useThemeStore (optional)   │
└──────────────────────────────┘
         │
         ├─→ React Components
         │
         └─→ Local Storage
```

---

## Internationalization & Theme

### Localization System

#### Localization Context
**File**: `src/localization/LocalizationContext.tsx`
- Manages current language
- Provides translation function
- Persists language preference

#### Supported Languages
- **English**: `src/localization/en.tsx`
- **Arabic**: `src/localization/ar.tsx`
- **German**: `src/localization/de.tsx`

#### Language Model
**File**: `src/localization/localization_model.tsx`
- Defines all translatable strings
- Type-safe translations
- Fallback to default language

#### Usage
```typescript
import { useLocalization } from '@/localization/LocalizationContext';

const { t, language, setLanguage } = useLocalization();

return (
  <View>
    <Text>{t('welcome')}</Text>
    <Button onPress={() => setLanguage('ar')} title="العربية" />
  </View>
);
```

### Theme Management

#### Dynamic Theme Switching
- Store theme preference in device storage
- Update app colors in real-time
- Sync with system theme preference (optional)

#### Theme Layers
1. **Color Palette**: Light/dark mode colors
2. **Typography**: Font sizes, weights, line heights
3. **Spacing**: Margins, paddings, gaps
4. **Component Styles**: Pre-defined component styling

---

## Form Handling

### React Hook Form Integration

#### Overview
React Hook Form provides efficient form state management with minimal re-renders.

### Form Implementation

#### Key Features
1. **Minimal Re-renders**: Only modified fields re-render
2. **Built-in Validation**: Support for complex validation rules
3. **Error Handling**: Automatic error message display
4. **Submission**: Handle form submission with validation

#### Basic Form Structure

```typescript
import { useForm, Controller } from 'react-hook-form';

export function MyForm() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      // Submit form data
      await submitToBackend(data);
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="name"
        rules={{ 
          required: 'Name is required',
          minLength: { value: 3, message: 'Minimum 3 characters' }
        }}
        render={({ field }) => (
          <>
            <TextInput {...field} placeholder="Enter name" />
            {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
          </>
        )}
      />

      <Controller
        control={control}
        name="email"
        rules={{ 
          required: 'Email is required',
          pattern: { 
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
            message: 'Invalid email' 
          }
        }}
        render={({ field }) => (
          <>
            <TextInput {...field} placeholder="Enter email" keyboardType="email-address" />
            {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
          </>
        )}
      />

      <Button onPress={handleSubmit(onSubmit)} title="Submit" />
    </form>
  );
}
```

### Form Validation Rules

#### Common Validation Patterns
```typescript
// Required field
rules={{ required: 'This field is required' }}

// Email validation
rules={{ 
  pattern: { 
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  }
}}

// Phone number
rules={{ 
  pattern: { 
    value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
    message: 'Invalid phone number'
  }
}}

// Custom validation
rules={{
  validate: (value) => value !== '' || 'Field cannot be empty'
}}

// Dependent field validation
rules={{
  validate: (value) => value === watchedField || 'Fields must match'
}}
```

### Form Submission Flow

```
┌─────────────────────────────┐
│   User Submits Form         │
└────────────┬────────────────┘
             │
    ┌────────▼─────────┐
    │ Validate Fields  │
    └────────┬─────────┘
             │
      ┌──────┴──────┐
      │             │
   Valid       Invalid
      │             │
      │        ┌────▼────┐
      │        │ Show    │
      │        │ Errors  │
      │        └─────────┘
      │
┌─────▼──────────────────┐
│ Prepare Form Data      │
└─────┬──────────────────┘
      │
┌─────▼──────────────────┐
│ Submit to Backend      │
└─────┬──────────────────┘
      │
 ┌────┴────┐
 │          │
Success   Error
 │          │
 └──────────┘
      │
┌─────▼──────────────────┐
│ Show Result Toast      │
└───────────────────────┘
```

### Advanced Features

#### Dependent Field Validation
```typescript
const { watch } = useForm();
const password = watch('password');

// In password confirmation field
rules={{
  validate: (value) => value === password || 'Passwords do not match'
}}
```

#### Dynamic Fields
```typescript
const { fields, append, remove } = useFieldArray({
  control,
  name: 'addresses' // Array field name
});

return (
  <>
    {fields.map((field, index) => (
      <Controller
        key={field.id}
        control={control}
        name={`addresses.${index}.street`}
        render={({ field }) => <TextInput {...field} />}
      />
    ))}
    <Button onPress={() => append({ street: '' })} title="Add Address" />
  </>
);
```

### Error Handling Best Practices

1. **Field-level Errors**: Display below/beside form field
2. **Form-level Errors**: Display at top of form
3. **Server Errors**: Map backend errors to form fields
4. **Loading State**: Disable form during submission

---

## Project Structure Summary

```
src/
├── components/           # Reusable UI components
├── context/             # React Context providers
├── data/
│   ├── entities/        # Data models
│   └── states/          # Complex state logic
├── db/                  # Database config & schema
├── eventBus/            # Event emitter system
├── helpers/             # Utility functions
├── hooks/               # Custom React hooks
├── localization/        # Multi-language support
├── services/            # Business logic services
├── store/               # Zustand stores
└── styles/              # Theme & styling
```

---

## Integration Checklist

- [ ] Background location service configured
- [ ] Firebase notifications set up
- [ ] Local database and migrations created
- [ ] Zustand stores initialized
- [ ] Localization system configured
- [ ] Theme provider wrapped around app
- [ ] Form components integrated with React Hook Form
- [ ] Event bus for component communication
- [ ] Background tasks registered for iOS and Android

---

## Next Steps

1. Configure Firebase project and add credentials
2. Test background location on physical devices
3. Implement API endpoints for data sync
4. Add error logging and analytics
5. Optimize battery usage for background tasks
6. Implement offline-first data sync strategy
