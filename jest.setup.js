import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiSet: jest.fn(),
  multiGet: jest.fn(),
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 0,
      longitude: 0,
      accuracy: 0,
      altitude: 0,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  })),
  watchPositionAsync: jest.fn(() => Promise.resolve('subscription')),
  removeWatchAsync: jest.fn(),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  getLastNotificationResponseAsync: jest.fn(() => Promise.resolve(null)),
}));

// Mock expo-task-manager
jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
}));

// Mock AsyncStorage in context
global.AsyncStorage = require('@react-native-async-storage/async-storage').default;
