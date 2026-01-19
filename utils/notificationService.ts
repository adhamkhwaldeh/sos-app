import { db } from '@/db/client';
import { notifications } from '@/db/schema';
import { DB_EVENTS, dbEventEmitter } from '@/utils/eventEmitter';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { PermissionsAndroid, Platform } from 'react-native';

// Configure expo-notifications to show notifications in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => {
        console.log('[NotificationHandler] Triggered!');
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        };
    },
});

// Create a notification channel for Android
if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
    }).then(() => {
        console.log('[NotificationChannel] "default" created successfully');
    }).catch(error => {
        console.error('[NotificationChannel] Failed to create channel:', error);
    });
}

export const showLocalNotification = async (title: string, body: string, data?: any) => {
    try {
        console.log(`[showLocalNotification] Scheduling: "${title}"`);

        // Check permissions first
        const settings = await Notifications.getPermissionsAsync();
        console.log('[showLocalNotification] Current permissions:', settings.status);

        if (settings.status !== 'granted') {
            console.log('[showLocalNotification] Permissions not granted, requesting...');
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.error('[showLocalNotification] Permissions still not granted');
                return null;
            }
        }

        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: data || {},
                sound: true,
                priority: Notifications.AndroidNotificationPriority.MAX,
                // channelId: 'default',
            },
            trigger: null, // show immediately
        });
        console.log('[showLocalNotification] Scheduled successfully, ID:', identifier);
        return identifier;
    } catch (error) {
        console.error('[showLocalNotification] Error:', error);
        return null;
    }
};

export const saveNotification = async (remoteMessage: any) => {
    console.log('[saveNotification] Saving to DB:', JSON.stringify(remoteMessage));
    const { notification, sentTime } = remoteMessage;
    if (notification) {
        try {
            await db.insert(notifications).values({
                title: notification.title || 'No Title',
                content: notification.body || 'No Content',
                timestamp: sentTime ? new Date(sentTime).toISOString() : new Date().toISOString(),
            });
            console.log('[saveNotification] Saved to database');
            dbEventEmitter.emit(DB_EVENTS.NOTIFICATIONS_UPDATED);

            // Show local notification using expo-notifications
            await showLocalNotification(
                notification.title || 'No Title',
                notification.body || 'No Content',
                remoteMessage.data
            );
        } catch (error) {
            console.error('[saveNotification] Failed to save to database:', error);
        }
    }
};

class NotificationService {
    async requestUserPermission() {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;
            return enabled;
        }
    }

    async getFcmToken() {
        try {
            const fcmToken = await messaging().getToken();
            if (fcmToken) {
                console.log('FCM Token:', fcmToken);
                return fcmToken;
            }
        } catch (error) {
            console.error('Failed to get FCM token:', error);
        }
        return null;
    }

    setupListeners() {
        // Foreground message listener
        const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
            console.log('Foreground Message received:', JSON.stringify(remoteMessage));
            await saveNotification(remoteMessage);
        });

        // Background/Quit state message listener (when app is opened via notification)
        messaging().onNotificationOpenedApp((remoteMessage) => {
            console.log('Notification caused app to open from background state:', remoteMessage.notification);
        });

        // Check if app was opened from a quit state
        messaging()
            .getInitialNotification()
            .then((remoteMessage) => {
                if (remoteMessage) {
                    console.log('Notification caused app to open from quit state:', remoteMessage.notification);
                }
            });

        return unsubscribeForeground;
    }

    async initialize() {
        console.log('Initializing NotificationService...');
        const hasPermission = await this.requestUserPermission();
        if (hasPermission) {
            console.log('Notification permission granted');
            await this.getFcmToken();
            return this.setupListeners();
        } else {
            console.log('Notification permission denied');
        }
        return null;
    }
}

export const clearAllNotifications = async () => {
    try {
        await db.delete(notifications);
        console.log('All notifications cleared');
        dbEventEmitter.emit(DB_EVENTS.NOTIFICATIONS_UPDATED);
    } catch (error) {
        console.error('Failed to clear notifications:', error);
    }
};

export const notificationService = new NotificationService();
