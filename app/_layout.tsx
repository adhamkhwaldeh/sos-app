import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import '@/HeadlessTask';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBackgroundGeolocation } from '@/hooks/useBackgroundGeolocation';

import { migrationPromise, runMigrations } from '@/db/client';
import { notificationService, saveNotification } from '@/utils/notificationService';
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
  await saveNotification(remoteMessage);
});


export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      await runMigrations();
    };
    init();
  }, []);

  const colorScheme = useColorScheme();
  useEffect(() => {
    const setup = async () => {
      await migrationPromise;
      // useBackgroundGeolocation is a hook, it should be called at the top level.
      // However, if it internally starts tracking, we might need to ensure the DB is ready.
      // Since it's a hook, we can't await it inside useEffect like this if it returns something used in render.
      // But we can wrap the logic that uses the DB inside the hook or ensure the hook respects the promise.
    };
    setup();
  }, []);

  useEffect(() => {
    notificationService.initialize();
  }, []);

  useBackgroundGeolocation();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaView>
  );
}
