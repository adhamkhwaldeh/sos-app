import { theme as customTheme } from '@/src/styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  paperTheme: typeof MD3LightTheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light',
  isDark: false,
  paperTheme: MD3LightTheme,
  setThemeMode: async () => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isDark, setIsDark] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themeMode');
        if (savedTheme) {
          setThemeModeState(savedTheme as ThemeMode);
          updateTheme(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  const updateTheme = useCallback((mode: ThemeMode) => {
    if (mode === 'dark') {
      setIsDark(true);
    } else if (mode === 'light') {
      setIsDark(false);
    } else if (mode === 'system') {
      // In a real app, you'd use useColorScheme() from react-native
      // For now, default to light
      setIsDark(false);
    }
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      updateTheme(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, [updateTheme]);

  // Create paper theme based on isDark state
  const lightTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: customTheme.colors.primary,
      onPrimary: '#fff',
      primaryContainer: customTheme.colors.primaryLight,
      secondary: customTheme.colors.secondaryColor,
      background: '#fff',
      surface: '#f5f5f5',
    },
  };

  const darkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: customTheme.colors.primaryLight,
      onPrimary: '#000',
      primaryContainer: customTheme.colors.primaryDark,
      secondary: customTheme.colors.secondaryColor,
      background: '#121212',
      surface: '#1e1e1e',
    },
  };

  const paperTheme = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    themeMode,
    isDark,
    paperTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};
