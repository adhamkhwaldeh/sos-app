/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */
import { Platform } from 'react-native';
import {
  configureFonts,
  DefaultTheme,
} from 'react-native-paper';

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

const fonts = {
  regular: {
    fontFamily: 'Ubuntu-Regular',
    // fontWeight: 'normal' as 'normal',
  },
  medium: {
    fontFamily: 'Ubuntu-Medium',
    // fontWeight: 'normal' as 'normal',
  },
  light: {
    fontFamily: 'Ubuntu-Light',
    // fontWeight: 'normal' as 'normal',
  },
  thin: {
    fontFamily: 'Ubuntu-Bold',
    // fontWeight: 'normal' as 'normal',
  },
};

const fontConfig = {
  web: fonts,
  ios: fonts,
  android: fonts,
};

const theme = {
  ...DefaultTheme,
  // Specify custom property
  // myOwnProperty: true,
  // Specify custom property in nested object
  colors: {
    ...DefaultTheme.colors,

    primary: '#0a7ea4',
    secondaryColor: '#455faf',
    primaryLight: '#566194',
    primaryDark: '#00123b',
    accent: '#00123b',
    accentTransparent: '#9000123B',
    statusbar: {
      color: '#353847',
    },

    secondaryColorTrans: 'rgba(61, 70, 102,0.6)', //B3095899
    primaryLightTrans: 'rgba(30, 41, 76,0.4)', //800D7AB90, 0, 0
    accentTrans: 'rgba(13, 122, 185,0.3)', //4D0D7AB9

    primaryTrans: 'rgba(30, 41, 76,0.5)',
    whiteTrans: 'rgba(255, 255, 255,0.4)',

    // primary: '#095899',
    // primaryLight: '#2ba0ff',
    // primaryDark: '#095899',
    // accent: '#0e7ab9',
    // statusbar: {
    //   color: '#095899',
    // },

    // primary: '#1e284b',
    // primaryLight: '#2ba0ff',
    // primaryDark: '#1e284b',
    // accent: '#0e7ab9',
    // statusbar: {
    //   color: '#1e284b',
    // },
    white: '#fff',
    green: '#00b579', //'#28a745',

    grey: '#f5f5f5',
    midGrey: '#e3e3e3',
    greyDark: '#cccccc',
    red: '#fc0303',
    black: '#000',
  },
  // fonts: fonts,
  fonts: configureFonts(fontConfig),
};

export { theme };


// const tintColorLight = ;
// const tintColorDark = '#fff';

// export const Colors = {
//   light: {
//     text: '#11181C',
//     background: '#fff',
//     tint: tintColorLight,
//     icon: '#687076',
//     tabIconDefault: '#687076',
//     tabIconSelected: tintColorLight,
//   },
//   dark: {
//     text: '#ECEDEE',
//     background: '#151718',
//     tint: tintColorDark,
//     icon: '#9BA1A6',
//     tabIconDefault: '#9BA1A6',
//     tabIconSelected: tintColorDark,
//   },
// };


