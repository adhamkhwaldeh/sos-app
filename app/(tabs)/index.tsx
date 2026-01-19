import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { db } from '@/db/client';
import { locations } from '@/db/schema';
import { DB_EVENTS, dbEventEmitter } from '@/utils/eventEmitter';
import { clearAllLogs } from '@/utils/locationLogger';
import { desc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect, useState } from 'react';
import { AppState, FlatList, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';


export default function HomeScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: logs } = useLiveQuery(
    db.select().from(locations).orderBy(desc(locations.id)),
    [refreshKey]
  );

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    // 1. Listen for real-time DB updates
    const onLogsUpdated = () => {
      console.log('Logs updated event received, refreshing UI...');
      handleRefresh();
    };

    dbEventEmitter.on(DB_EVENTS.LOGS_UPDATED, onLogsUpdated);

    // 2. Refresh when app comes to foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log('App came to foreground, refreshing logs...');
        handleRefresh();
      }
    });

    return () => {
      dbEventEmitter.off(DB_EVENTS.LOGS_UPDATED, onLogsUpdated);
      subscription.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, }}>
      <Appbar style={{ backgroundColor: 'rgba(0, 210, 238, 1)' }}>
        <Appbar.Content title={`Location Logs (${logs?.length || '0'})`} />
        <Appbar.Action icon="refresh" onPress={handleRefresh} />
        <Appbar.Action icon="delete" onPress={clearAllLogs} />
      </Appbar>

      <View style={{ flex: 1 }}>
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: log }) => (
            <ThemedView style={styles.logItem}>
              <ThemedText type="defaultSemiBold">
                {new Date(log.timestampUTC).toLocaleTimeString()} - {log.action}
              </ThemedText>
              <ThemedText style={styles.logCoords}>
                Lat: {log.latitude.toFixed(6)}, Lon: {log.longitude.toFixed(6)}
              </ThemedText>
              {log.batteryLevel !== null && (
                <ThemedText style={styles.logDetail}>
                  Battery: {(log.batteryLevel * 100).toFixed(0)}%
                </ThemedText>
              )}
            </ThemedView>
          )}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ThemedText style={styles.noLogs}>No logs yet. Start tracking!</ThemedText>
            </View>
          }
        />

      </View>

      <View style={{ flex: 0, padding: 16, backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Instructions</Text>
        <Text>
          Logs are saved every time a location update is received, even in the background or when the app is closed.
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  logsScroll: {
    maxHeight: 400,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 8,
  },
  logItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  logCoords: {
    fontSize: 14,
    opacity: 0.8,
  },
  logDetail: {
    fontSize: 12,
    opacity: 0.6,
  },
  noLogs: {
    textAlign: 'center',
    padding: 20,
    opacity: 0.5,
  },
});
