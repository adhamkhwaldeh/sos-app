import { LocalizationContext } from '@/src/localization/LocalizationContext';
import { useNotificationStore } from '@/src/store/useNotificationStore';
import { Fonts } from '@/src/styles/theme';
import { DB_EVENTS, dbEventEmitter } from '@/src/utils/eventEmitter';
import { clearAllNotifications, showLocalNotification } from '@/src/utils/notificationService';
import * as Notifications from 'expo-notifications';
import { useContext, useEffect } from 'react';
import { AppState, FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export default function TabTwoScreen() {
  const { notifications: logs, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    fetchNotifications();
  };

  useEffect(() => {
    // 1. Listen for real-time DB updates
    const onNotificationsUpdated = () => {
      console.log('Notifications updated event received, refreshing UI...');
      handleRefresh();
    };

    dbEventEmitter.on(DB_EVENTS.NOTIFICATIONS_UPDATED, onNotificationsUpdated);

    // 2. Refresh when app comes to foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log('App came to foreground, refreshing notifications...');
        handleRefresh();
      }
    });

    return () => {
      dbEventEmitter.off(DB_EVENTS.NOTIFICATIONS_UPDATED, onNotificationsUpdated);
      subscription.remove();
    };
  }, []);

  const { translations } = useContext(LocalizationContext);

  return (
    <View style={{ flex: 1 }}>
      <Appbar style={{ backgroundColor: 'rgba(0, 210, 238, 1)' }}>
        <Appbar.Content title={`${translations.notifications} (${logs?.length || '0'})`} titleStyle={{ fontFamily: Fonts.rounded }} />
        <Appbar.Action icon="bell-ring" onPress={async () => {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            alert(translations.notificationPermissionDenied);
            return;
          }

          console.log("Attempting to show test notification...");
          const res = await showLocalNotification(
            translations.testNotificationTitle,
            translations.testNotificationBody
          );
          console.log('Notification result:', res);
          if (res) {
            console.log('Notification showed successfully with ID:', res);
          } else {
            console.log('Notification failed to show');
          }
        }} />
        <Appbar.Action icon="refresh" onPress={handleRefresh} />
        <Appbar.Action icon="delete" onPress={clearAllNotifications} />
      </Appbar>

      <View style={{ flex: 1 }}>
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: notification }) => (
            <View style={styles.notificationItem}>
              {/* type="defaultSemiBold"  */}
              <Text style={styles.notificationTitle}>
                {notification.title}
              </Text>
              <Text style={styles.notificationContent}>
                {notification.content}
              </Text>
              <Text style={styles.notificationTimestamp}>
                {new Date(notification.timestamp).toLocaleString()}
              </Text>
            </View>
          )}
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.noNotifications}>{translations.noNotifications}</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(0, 210, 238, 1)',
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  notificationContent: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  notificationTimestamp: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'right',
  },
  noNotifications: {
    textAlign: 'center',
    padding: 20,
    opacity: 0.5,
  },
});
