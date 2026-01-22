# SOS Responder App 🚨

An emergency response mobile application designed for first responders to receive SOS alerts and provide assistance with  real-time location tracking.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Location Tracking](#location-tracking)
  - [Health Check Status](#health-check-status)
  - [Incident Module](#incident-module)

---

## Overview

The SOS Responder App enables emergency responders to:
- Receive and respond to SOS alerts in real-time
- Share their location according to different modes
- Optimize battery usage through intelligent tracking modes

---

## Features

### Location Tracking

The app implements **intelligent location tracking** with different modes and update strategies to balance accuracy, responsiveness, and battery efficiency.

#### Tracking Modes

| Mode | Update Interval | Distance Threshold | Description |
|------|-----------------|--------------------|-------------|
| **Off Shift** | N/A (or 15 min) | N/A | No tracking (default) or periodic updates |
| **Idle** | 10 seconds | 10 meters | Updates every 5-10 minutes as bulk updates or after significant movement |
| **On Duty** | 5 seconds | 5 meters | High frequency for active availability |
| **Emergency** | 1 second | None | Real-time streaming for critical response |
| **Save Mode** | 15 minutes | N/A | Ultra-low power (auto-activated) - On demand - manual update |

#### Update Strategies

Each mode implements different update strategies:

**Off Shift Mode** *(Configurable)*
- Responder is off-duty but can configure tracking preferences:

| Option | Behavior | Battery Impact |
|--------|----------|----------------|
| **No Track** | No location updates, no background processes | None |
| **Periodic** | Location update once every 15 minutes | Minimal |
| **Idle Tracking** | Same behavior as Idle mode (significant changes only) | Low |

- Default: No Track
- Responder can change preference in settings

**Idle Mode**
- Update according configured criteria (time and distance)
- Bulk update periodically (5-10 minutes)
- Optimized for battery preservation
- Suitable for responders on standby

**On Duty Mode**
- Regular interval location updates (5-10 seconds)
- Balanced accuracy and battery usage
- Enables dispatch to see responder availability and proximity
- Automatic geofencing for coverage areas (configurable moving to Emergency mode)

**Emergency Mode** *(Real-Time)*
- **Instant location updates** - every 1 second, no distance threshold
- **Direct server sync** - location sent immediately via real-time connection
- **Maximum GPS accuracy** - WiFi enabled to assist GPS triangulation
- Continuous tracking during active response
- Shares precise ETA with SOS requester

**Real-Time Connection Protocol:**
Preferred protocols for instant location streaming (in order of preference):

| Protocol | Description | Use Case |
|----------|-------------|----------|
| **Socket.IO** | WebSocket-based, bi-directional | Primary choice for real-time updates |
| **gRPC** | High-performance RPC framework | Low-latency, efficient binary protocol |
| **MQTT** | Lightweight pub/sub messaging | IoT-optimized, low bandwidth |

> Fallback: If real-time connection fails, use HTTP POST with immediate retry.

| Parameter | Emergency Value | Standard Value |
|-----------|-----------------|----------------|
| Update Interval | 1 second | 5 seconds |
| Distance Threshold | None | 5 meters |
| Sync Method | Instant | Batch (5 min) |
| WiFi Assist | Enabled | Disabled |

> **Note:** Emergency mode prioritizes accuracy and responsiveness over battery efficiency.

**Save Mode** *(Auto-Activated)*

Save Mode is automatically activated when the device detects critical resource conditions:

| Trigger | Threshold | Description |
|---------|-----------|-------------|
| **Low Battery** | ≤ 15% | Battery level drops below threshold |
| **Device Overheating** | ≥ 42°C | Device temperature exceeds safe operating range |
| **Battery Saver Active** | OS-level | System battery saver mode is enabled |

**Save Mode Behavior:**

| Feature | Save Mode Value | Normal Value |
|---------|-----------------|--------------|
| Location Updates | Every 15 minutes | Per mode settings |
| GPS Usage | Minimal (network-based) | Full GPS |
| Sync Method | Batch only | Per mode settings |
| Health Monitoring | Disabled | Per mode settings |

**On-Demand Location Request:**

When in Save Mode, dispatch can request an immediate location update via push notification:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Dispatch  │ ──▶ │    Push     │ ──▶ │  Location   │
│   Request   │     │ Notification│     │   Update    │
└─────────────┘     └─────────────┘     └─────────────┘
```

| Request Type | Description |
|--------------|-------------|
| **Silent Push** | Triggers location capture without user interaction |
| **Interactive Push** | Notifies responder and requests location confirmation |

> **Warning:** Save Mode significantly reduces tracking accuracy. Dispatch is notified when a responder enters Save Mode.

#### Tracking Data Structure

Each tracking record contains the following data:

| Field | Type | Description |
|-------|------|-------------|
| `longitude` | Float | GPS longitude coordinate |
| `latitude` | Float | GPS latitude coordinate |
| `timestamp` | DateTime (UTC) | Time of location capture |
| `accuracy` | Float | Horizontal accuracy in meters |
| `altitude` | Float | Altitude in meters above sea level |
| `speed` | Float | Current speed (m/s or km/h) |
| `heading` | Float | Heading/bearing in degrees (0-360) |

#### Location Availability & Liveness

Ensuring continuous location visibility is paramount for responder safety and dispatch efficiency.

**Availability Detection Flow:**

1.  **Signal Loss**: If no location update is received within the expected interval (based on current Mode).
2.  **App Notification**: Local alert triggers to warn the responder of GPS/Network loss.
3.  **Manual Check-in**: Responder can manually send a "Check-in" location.
4.  **Backoffice Request**: Dispatch can request an immediate location update via push notification.

**Manual Location Check-in:**
Responders can force a location update when automated tracking is insufficient:
- **Action**: "Send Location" / "Check-in" button.
- **Use Case**: Verifying position when GPS is degraded or confirming arrival at a specific point.

**On-Demand Location Request:**
Dispatch can trigger a location poll independent of the current tracking mode:
- **Silent Request**: Triggers a background location capture.
- **Interactive Request**: Sends a high-priority notification requesting the responder to open the app and confirm their location.

---

### Health Check Status

In addition to geolocation data, the app logs health check status for both the **device** and the **individual responder** (when wearable devices are connected).

#### Device Health Monitoring

Device health telemetry is collected alongside location updates to ensure responder reachability and operational status.

| Field | Type | Description |
|-------|------|-------------|
| `batteryLevel` | Integer (0-100) | Current battery percentage |
| `batteryState` | Enum | `charging`, `discharging`, `full`, `unknown` |
| `temperature` | Float | Device temperature in Celsius (if available) |
| `networkType` | Enum | `wifi`, `cellular_4g`, `cellular_5g`, `offline` |
| `networkStrength` | Integer (0-4) | Signal strength bars |
| `gpsStatus` | Enum | `active`, `disabled`, `permission_denied`, `unavailable` |

#### Individual Health Monitoring (Wearable Integration)

For responders equipped with compatible wearable devices (smartwatches, fitness bands), the app can optionally collect vital signs.

| Field | Type | Description |
|-------|------|-------------|
| `heartRate` | Integer | Heart rate in BPM |
| `bloodPressureSystolic` | Integer | Systolic blood pressure (mmHg) |
| `bloodPressureDiastolic` | Integer | Diastolic blood pressure (mmHg) |
| `wearableConnected` | Boolean | Whether a wearable is currently connected |
| `wearableDeviceId` | String | Identifier of the connected wearable |
| `lastWearableSync` | DateTime (UTC) | Last successful data sync from wearable |

> **Note:** Wearable health data is optional and requires explicit responder consent. Data is only collected when a compatible device is paired and permissions are granted.

#### Health Data Collection Strategy

Health data collection intervals vary by responder mode to balance data freshness with battery efficiency:

| Mode | Device Health | Wearable Health | Rationale |
|------|---------------|-----------------|-----------|
| **Off Shift** | Every 30 min (if tracking enabled) | Not collected | Minimal monitoring when off-duty |
| **Idle** | Every 10 min | Every 10 min | Low-frequency background collection |
| **On Duty** | Every 2 min | Every 2 min | Regular monitoring for availability |
| **Emergency** | Every 30 sec | Every 30 sec | Real-time health status during response |

#### Health Data Structure

Combined health telemetry record sent with each sync:

```json
{
  "deviceHealth": {
    "batteryLevel": 85,
    "batteryState": "discharging",
    "temperature": 32.5,
    "networkType": "cellular_4g",
    "networkStrength": 3,
    "gpsStatus": "active"
  },
  "wearableHealth": {
    "connected": true,
    "deviceId": "WATCH-A1B2C3",
    "heartRate": 72,
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "lastSync": "2026-01-17T19:20:00Z"
  },
  "timestamp": "2026-01-17T19:20:30Z"
}
```

#### Health Data Sync Strategy

Health data syncs alongside location data using the same batch approach:

| Sync Mode | Description |
|-----------|-------------|
| **Standard Sync** | Health data bundled with location batch every 5 minutes |
| **Emergency Sync** | Health data sent immediately with real-time location updates |
| **Degraded Sync** | If network is poor, health data is queued and prioritized behind location |

#### Liveness & Reachability

Responder liveness is determined by the continuous receipt of **Health Monitoring data**.

**Liveness Detection Flow:**

1.  **Signal Loss**: If no health/location signal is received within the configured interval.
2.  **App Notification**: The application itself notifies the responder (local alert) to check connectivity.
3.  **Manual Report**: The responder can manually report their health status to confirm liveness.
4.  **Backoffice Escalation**: If the signal remains lost for a defined duration, the Backoffice initiates a status request via push notification to:
    *   The Responder (Targeted push)
    *   The Responder's Company (Admin alert)
    *   Nearby Responders (Geofence-based check)

**Manual Health Reporting:**
If the automated signal fails, the responder can use the **Manual Status Report** feature:
- **Status**: Safe / In Danger / Unknown
- **Vitals**: Manual entry of heart rate (optional)
- **Note**: Brief message to dispatch

**Backoffice Status Request:**
Dispatch can trigger a "Status Request" push notification.
- **Action**: Responder receives a high-priority notification.
- **Response**: Tapping the notification opens the Manual Status Report screen.



---

### In-App Alerts & Notifications

The app displays in-app alerts when degraded conditions are detected, ensuring responders are aware of connectivity or permission issues.

#### Alert Triggers

| Condition | Alert Type | Description |
|-----------|------------|-------------|
| **Permissions Revoked** | ⚠️ Warning | Location, notification, or background permissions disabled |
| **Connection Lost** | 🔴 Critical | No network connectivity (WiFi or cellular) |
| **GPS Unavailable** | ⚠️ Warning | Unable to acquire GPS signal (tunnel, garage, underground) |
| **GPS Degraded** | ℹ️ Info | GPS accuracy below threshold (poor signal) |
| **Low Battery** | ⚠️ Warning | Battery below 20%, may affect tracking reliability |
| **Wearable Disconnected** | ℹ️ Info | Paired wearable device lost connection |

#### Alert UI Behavior

| Behavior | Description |
|----------|-------------|
| **Persistent Banner** | Shows at top of screen until condition resolves |
| **Action Button** | Quick link to settings or troubleshooting |
| **Auto-Dismiss** | Clears automatically when condition is resolved |
| **Sound/Vibration** | Optional haptic feedback for critical alerts |

#### GPS Unavailable Scenarios

Common scenarios where GPS signal may be temporarily lost:

| Scenario | Detection | Recovery |
|----------|-----------|----------|
| **Tunnel** | GPS signal loss + speed maintained | Auto-resume when signal returns |
| **Parking Garage** | GPS signal loss + stationary | Last known location cached |
| **Indoor Building** | Degraded accuracy | WiFi-assisted positioning if available |
| **Dense Urban Area** | Signal reflection/multipath | Use averaged position |

> **Note:** During GPS unavailable periods, the app uses the last known good location and notifies dispatch of the degraded state.

---

### Incident Module

The Incident Module manages the assignment and acceptance workflow for emergency incidents.

#### Incident Assignment Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Incident   │ ──▶ │  Assignment │ ──▶ │   Accept/   │ ──▶ │   Mode      │
│  Created    │     │  (Auto/Man) │     │   Decline   │     │   Change    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

#### Assignment Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Automatic** | System assigns based on proximity, availability, and load | High-urgency incidents requiring fastest response |
| **Manual** | Dispatcher selects specific responder | Specialized incidents or dispatcher preference |

#### Notification & Acceptance

When an incident is assigned (automatically or manually):

1. **Push Notification** - Responder receives notification with incident details
2. **In-App Alert** - Modal displays incident summary, location, and urgency level
3. **Accept/Decline** - Responder can accept or decline the assignment

| Action | Result |
|--------|--------|
| **Accept** | Mode changes to **On Duty**, tracking frequency increases, responder receives full incident details |
| **Decline** | Incident returns to queue for reassignment, responder status unchanged |
| **Timeout** | After 60 seconds, treated as decline, incident reassigned |

#### Incident Acceptance Data

Upon acceptance, the following data is logged:

| Field | Type | Description |
|-------|------|-------------|
| `incidentId` | String | Unique identifier of the incident |
| `responderId` | String | Responder who accepted |
| `acceptedAt` | DateTime (UTC) | Timestamp of acceptance |
| `assignmentType` | Enum | `automatic`, `manual` |
| `previousMode` | Enum | Responder mode before acceptance |
| `responseTime` | Integer | Seconds between notification and acceptance |

#### Post-Acceptance Behavior

Once an incident is accepted:

- **Tracking Mode** → Automatically transitions to **On Duty**
- **Location Updates** → Frequency increases to On Duty parameters
- **Health Monitoring** → Collection interval reduces to 2 minutes
- **Navigation** → Turn-by-turn directions available to incident location
- **ETA Sharing** → Estimated arrival time shared with dispatch/requester

---

#### Multi-Responder Support

An incident can have multiple responders assigned, working in different collaboration modes.

##### Responder Work Modes

| Mode | Description | Tracking Source |
|------|-------------|-----------------|
| **Individual** | Responder works alone on the incident | Own device geolocation |
| **Accompany** | Responder joins a colleague on-site | Primary responder's geolocation |
| **Delegate** | Responder delegates mission to colleague | Delegated responder's geolocation |

```
┌─────────────────────────────────────────────────────────────┐
│                    INCIDENT #12345                          │
├─────────────────────────────────────────────────────────────┤
│  Responder A (Individual)  ──▶  📍 Own Location Tracked     │
│  Responder B (Accompany)   ──▶  📍 Uses Responder A's GPS   │
│  Responder C (Delegate)    ──▶  📍 Uses Responder D's GPS   │
│  Responder D (Individual)  ──▶  📍 Own Location Tracked     │
└─────────────────────────────────────────────────────────────┘
```

##### Accompany Mode

When a responder accompanies a colleague:

| Field | Description |
|-------|-------------|
| `primaryResponderId` | ID of the responder being accompanied |
| `accompanyStartedAt` | Timestamp when accompany mode started |
| `trackingSource` | Set to `delegated` |

**Behavior:**
- Location tracking on accompanying responder's device is **paused**
- System tracks primary responder's location for both
- Both responders shown at same position on dispatch map
- Battery saved on accompanying responder's device

##### Delegate Mode

When a responder delegates the mission:

| Field | Description |
|-------|-------------|
| `delegatedToResponderId` | ID of the responder receiving delegation |
| `delegatedAt` | Timestamp of delegation |
| `delegationReason` | Optional reason for delegation |
| `trackingSource` | Set to `delegated` |

**Delegation Flow:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Responder  │ ──▶ │  Select     │ ──▶ │  Colleague  │ ──▶ │  Tracking   │
│  Delegates  │     │  Colleague  │     │  Accepts    │     │  Switched   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

**Behavior:**
- Original responder's tracking for this incident **stops**
- Delegated responder's location used for incident tracking
- Original responder can remain available for other incidents
- Incident history shows delegation chain

##### Multi-Responder Data Structure

| Field | Type | Description |
|-------|------|-------------|
| `incidentId` | String | Incident identifier |
| `responders` | Array | List of assigned responders |
| `responders[].id` | String | Responder ID |
| `responders[].role` | Enum | `primary`, `secondary`, `delegated` |
| `responders[].workMode` | Enum | `individual`, `accompany`, `delegate` |
| `responders[].trackingSource` | Enum | `own`, `delegated` |
| `responders[].linkedResponderId` | String | ID of responder providing location (if delegated) |

---