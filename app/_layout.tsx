import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import '@/HeadlessTask';
import { useBackgroundGeolocation } from '@/src/hooks/useBackgroundGeolocation';

// import { ThemeProvider, useTheme } from '@/src/context/ThemeContext';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { migrationPromise, runMigrations } from '@/src/db/client';
import { LocalizationProvider } from '@/src/localization/LocalizationContext';
import { StatusBarContext, StatusBarProvider } from '@/src/status_bar/StatusBarContext';
import { notificationService, saveNotification } from '@/src/utils/notificationService';
import messaging from '@react-native-firebase/messaging';
import { useContext, useEffect } from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, useTheme } from 'react-native-paper';

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
  await saveNotification(remoteMessage);
});

function RootLayoutContent() {
  // const { theme } = useTheme();

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

  const theme = useTheme();

  const navigationTheme = theme.dark ? DarkTheme : DefaultTheme;

  const { setStatusBarAll } = useContext(StatusBarContext);

  useEffect(() => {
    setTimeout(() => {
      setStatusBarAll(theme.colors.primary, 'light-content', false);
    }, 500);
  }, []);

  return (

    <NavigationThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
    </NavigationThemeProvider>


  );
}

export default function RootLayout() {
  const theme = useTheme();
  const paperTheme = theme.dark ? MD3DarkTheme : MD3LightTheme;

  return (

    <StatusBarProvider>
      {/* <Provider store={Store}> */}
      {/* theme={currentTheme.dark ? darkTheme : theme} */}
      <ThemeProvider>
        <PaperProvider theme={paperTheme} >
          <LocalizationProvider>
            <RootLayoutContent />
          </LocalizationProvider>
        </PaperProvider>
      </ThemeProvider>
      {/* </Provider> */}
    </StatusBarProvider>

    // 
    // <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    //   <RootLayoutContent />
    // </SafeAreaView>
    // </ThemeProvider>
  );
}
