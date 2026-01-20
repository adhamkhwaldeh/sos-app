import { DB_EVENTS, emitter } from '@/src/eventBus/eventEmitter';
import { clearAllLogs } from '@/src/helpers/locationLogger';
import { LocalizationContext } from '@/src/localization/LocalizationContext';
import { useLocationStore } from '@/src/store/useLocationStore';
import { useContext, useEffect } from 'react';
import { AppState, FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';

export default function HomeScreen() {

  const theme = useTheme();

  const { translations } = useContext(LocalizationContext);

  const { logs, fetchLogs } = useLocationStore();

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = () => {
    fetchLogs();
  };

  useEffect(() => {
    // 1. Listen for real-time DB updates
    const onLogsUpdated = () => {
      console.log('Logs updated event received, refreshing UI...');
      handleRefresh();
    };

    const sub = emitter.on(DB_EVENTS.LOGS_UPDATED, onLogsUpdated);

    // 2. Refresh when app comes to foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log('App came to foreground, refreshing logs...');
        handleRefresh();
      }
    });

    return () => {
      emitter.off(DB_EVENTS.LOGS_UPDATED, onLogsUpdated);
      subscription.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, }}>
      <Appbar style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content title={`${translations.locationLogs} (${logs?.length || '0'})`} titleStyle={theme.fonts.titleLarge} />
        <Appbar.Action icon="refresh" onPress={handleRefresh} />
        <Appbar.Action icon="delete" onPress={clearAllLogs} />
      </Appbar>

      <View style={{ flex: 1 }}>
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: log }) => (
            <View style={styles.logItem}>
              {/* type="defaultSemiBold" */}
              <Text >
                {new Date(log.timestampUTC).toLocaleTimeString()} - {log.action}
              </Text>
              <Text style={styles.logCoords}>
                Lat: {log.latitude.toFixed(6)}, Lon: {log.longitude.toFixed(6)}
              </Text>
              {log.batteryLevel !== null && (
                <Text style={styles.logDetail}>
                  {translations.battery}: {(log.batteryLevel * 100).toFixed(0)}%
                </Text>
              )}
            </View>
          )}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.noLogs}>{translations.noLogs}</Text>
            </View>
          }
        />

      </View>

      <View style={{ flex: 0, padding: 16, backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{translations.Instructions}</Text>
        <Text>
          {translations.InstructionsMessage}
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
