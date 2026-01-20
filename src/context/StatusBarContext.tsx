import React, { createContext, useState } from 'react';
// import i18n from 'i18n-js';
import { StatusBar, View } from 'react-native';
// import {I18nManager} from 'react-native';
// import * as RNLocalize from 'react-native-localize';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initialWindowMetrics,
  SafeAreaProvider,
  useSafeAreaInsets
} from 'react-native-safe-area-context';
import { theme } from '../styles/theme';

export const StatusBarContext = createContext({
  setStatusBarAll: (color: string, barStyle: string, isHidden: boolean) => { },
  setStatusBar: (color: string, barStyle: string) => { },
  setStatusBarHidden: (isHidden: boolean) => { },
});

const CustomStatusBar = ({
  backgroundColor,
  barStyle,
  isHidden,
  //add more props StatusBar
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ height: insets.top, backgroundColor }}>
      <StatusBar
        animated={true}
        backgroundColor={backgroundColor}
        barStyle={barStyle}
        hidden={isHidden}
      />
    </View>
  );
};

const BodyView = ({ children }: { children: React.ReactNode }) => {
  // const insets = useSafeAreaInsets();
  return (
    // <View style={{flex: 1, paddingBottom: Math.max(insets.bottom, 16)}}>
    <View style={{ flex: 1 }}>{children}</View>
  );
};

export const StatusBarProvider: React.FC<any> = ({ children }) => {
  const [statusBarColor, setStatusBarColor] = useState<string>(theme.colors.primary);

  const [statusBarStyle, setStatusBarStyle] = useState<string>('dark-content');

  const [statusBarHidden, setStatusBarHidden] = useState<boolean>(false);

  const setStatusBar = (color: string, barStyle: string) => {
    //,isHidden = false
    setStatusBarColor(color);
    setStatusBarStyle(barStyle);
    // setStatusBarHidden(false);
  };

  const setStatusBarHiddenStatus = (isHidden: boolean) => {
    setStatusBarHidden(isHidden);
  };

  const setStatusBarAll = (color: string, barStyle: string, isHidden: boolean) => {
    setStatusBarColor(color);
    setStatusBarStyle(barStyle);
    setStatusBarHidden(isHidden);
  };

  return (
    <StatusBarContext.Provider
      value={{
        setStatusBar: setStatusBar,
        setStatusBarHidden: setStatusBarHiddenStatus,
        setStatusBarAll: setStatusBarAll,
      }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        {/* style={{paddingBottom: DimensHelper.paddingLg}} */}
        <CustomStatusBar
          backgroundColor={statusBarColor}
          barStyle={statusBarStyle}
          isHidden={statusBarHidden}
        />
        {/* <SafeAreaView edges={['right', 'bottom', 'left']}> */}

        {/* <BodyView children={children} /> */}

        <View style={{ flex: 1 }}>{children}</View>

        {/* </SafeAreaView> */}
      </SafeAreaProvider>
    </StatusBarContext.Provider>
  );
};
