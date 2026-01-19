import { db } from '@/db/client';
import { notifications } from '@/db/schema';
import { DB_EVENTS, dbEventEmitter } from '@/utils/eventEmitter';
import { clearAllNotifications, showLocalNotification } from '@/utils/notificationService';
import { desc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { AppState, FlatList, StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: logs } = useLiveQuery(
    db.select().from(notifications).orderBy(desc(notifications.id)),
    [refreshKey]
  );

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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

  return (
    <View style={{ flex: 1 }}>
      <Appbar style={{ backgroundColor: 'rgba(0, 210, 238, 1)' }}>
        <Appbar.Content title={`Notifications (${logs?.length || '0'})`} titleStyle={{ fontFamily: Fonts.rounded }} />
        <Appbar.Action icon="bell-ring" onPress={async () => {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            alert('Permission to show notifications was denied');
            return;
          }

          console.log("Attempting to show test notification...");
          const res = await showLocalNotification(
            "Test Notification",
            "This is a test notification from the app bar."
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
            <ThemedView style={styles.notificationItem}>
              <ThemedText type="defaultSemiBold" style={styles.notificationTitle}>
                {notification.title}
              </ThemedText>
              <ThemedText style={styles.notificationContent}>
                {notification.content}
              </ThemedText>
              <ThemedText style={styles.notificationTimestamp}>
                {new Date(notification.timestamp).toLocaleString()}
              </ThemedText>
            </ThemedView>
          )}
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ThemedText style={styles.noNotifications}>No notifications yet.</ThemedText>
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
