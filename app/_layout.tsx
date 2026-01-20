import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useBackgroundGeolocation } from '@/src/hooks/useBackgroundGeolocation';
import '@/src/services/tasks/HeadlessTask';

import { StatusBarContext, StatusBarProvider } from '@/src/context/StatusBarContext';
import { ThemeProvider, useThemeContext } from '@/src/context/ThemeContext';
import { migrationPromise, runMigrations } from '@/src/db/client';
import { LocalizationProvider } from '@/src/localization/LocalizationContext';
import { notificationService, saveNotification } from '@/src/services/notificationService';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { useContext, useEffect } from 'react';
import { PaperProvider as PaperProviderBase } from 'react-native-paper';

// Register background handler
setBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
  await saveNotification(remoteMessage);
});

function RootLayoutContent() {
  const { isDark, paperTheme } = useThemeContext();

  useEffect(() => {
    const init = async () => {
      await runMigrations();
    };
    init();
  }, []);

  useEffect(() => {
    const setup = async () => {
      await migrationPromise;
    };
    setup();
  }, []);

  useEffect(() => {
    notificationService.initialize();
  }, []);

  useBackgroundGeolocation();

  const navigationTheme = isDark ? DarkTheme : DefaultTheme;

  const { setStatusBarAll } = useContext(StatusBarContext);

  useEffect(() => {
    setTimeout(() => {
      setStatusBarAll(paperTheme.colors.primary, 'light-content', false);
    }, 500);
  }, [paperTheme.colors.primary, setStatusBarAll]);

  return (

    <NavigationThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationThemeProvider>


  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutWithTheme />
    </ThemeProvider>
  );
}

function RootLayoutWithTheme() {
  const { paperTheme } = useThemeContext();

  return (
    <PaperProviderBase theme={paperTheme}>
      <StatusBarProvider>
        <LocalizationProvider>
          <RootLayoutContent />
        </LocalizationProvider>
      </StatusBarProvider>
    </PaperProviderBase>
  );
}
