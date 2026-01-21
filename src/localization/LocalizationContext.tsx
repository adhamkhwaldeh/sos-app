import React, { createContext, useState } from "react";
// import i18n from 'i18n-js';
import LoggingHelper from "@/src/helpers/LoggingHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { I18nManager } from "react-native";
import * as RNLocalize from "react-native-localize";
import translations, { DEFAULT_LANGUAGE } from "./translations";

const APP_LANGUAGE = "appLanguage";

export const LocalizationContext = createContext({
  translations,
  setAppLanguage: async (language: string) => { },
  appLanguage: DEFAULT_LANGUAGE,
  initializeAppLanguage: async () => { },
});

export const LocalizationProvider: React.FC<any> = ({ children }) => {
  const [appLanguage, setAppLanguage] = useState(DEFAULT_LANGUAGE);
  const [forceUpdate, setForceUpdate] = useState(0); // Force UI refresh
  // const [appRTL, setAppRTL] = useState(appLanguage == 'ar');

  const applyLanguage = (language: string) => {
    translations.setLanguage(language);
    let isRTL = language == "ar";
    LoggingHelper.log("is RTL: " + isRTL);
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
    setAppLanguage(language);
    // Force UI refresh by triggering a state update
    setForceUpdate((prev) => prev + 1);
  };

  const setLanguage = async (language: string) => {
    applyLanguage(language);

    await AsyncStorage.setItem(APP_LANGUAGE, language);

    // Restart the app to apply RTL changes and refresh the UI
    try {
      // Only use Updates.reloadAsync() in production builds
      if (__DEV__) {
        LoggingHelper.log(
          "Development mode: Skipping app reload. Changes applied locally.",
        );
      } else {
        await Updates.reloadAsync();
      }
    } catch (error) {
      LoggingHelper.log("Error reloading app: " + error);
    }
  };

  const initializeAppLanguage = async () => {
    const currentLanguage = await AsyncStorage.getItem(APP_LANGUAGE);

    if (!currentLanguage) {
      let localeCode = DEFAULT_LANGUAGE;
      const supportedLocaleCodes = translations.getAvailableLanguages();
      const phoneLocaleCodes = RNLocalize.getLocales().map(
        (locale) => locale.languageCode,
      );
      phoneLocaleCodes.some((code) => {
        if (supportedLocaleCodes.includes(code)) {
          localeCode = code;
          return true;
        }
      });
      applyLanguage(localeCode);
      await AsyncStorage.setItem(APP_LANGUAGE, localeCode);
    } else {
      applyLanguage(currentLanguage);
    }
  };

  return (
    <LocalizationContext.Provider
      value={{
        translations,
        setAppLanguage: setLanguage,
        appLanguage,
        initializeAppLanguage,
      }}
      key={forceUpdate}
    >
      {children}
    </LocalizationContext.Provider>
  );
};
