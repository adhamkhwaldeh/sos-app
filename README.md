# SOS App 👋

An emergency response mobile application built with **Expo** and **React Native**, designed to help users quickly send and respond to SOS alerts with real-time location tracking.

## 📱 Features

- **Cross-Platform Support** - Runs on iOS, Android, and Web
- **Background Geolocation** - Continuous location tracking even when app is in background
- **Dark/Light Mode** - Automatic theme switching based on system preferences
- **Tab Navigation** - Intuitive bottom tab navigation with haptic feedback
- **Parallax Scrolling** - Smooth parallax effects for enhanced user experience
- **Modal Support** - Native modal presentations for additional screens
- **File-Based Routing** - Modern routing using Expo Router

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Expo | ~54.0.31 | Development framework |
| React Native | 0.81.5 | Cross-platform mobile development |
| React | 19.1.0 | UI library |
| Expo Router | ~6.0.21 | File-based navigation |
| React Navigation | 7.x | Navigation infrastructure |
| React Native Reanimated | ~4.1.1 | Animations |
| Background Geolocation | ^5.0.0 | Location tracking |
| TypeScript | ~5.9.2 | Type safety |

## 📂 Project Structure

```
sos-app/
├── app/                    # Application screens (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── _layout.tsx    # Tab navigator configuration
│   │   ├── index.tsx      # Home screen
│   │   └── explore.tsx    # Explore screen
│   ├── _layout.tsx        # Root layout with theme provider
│   └── modal.tsx          # Modal screen
├── assets/                 # Static assets (images, fonts)
├── components/            # Reusable UI components
│   ├── ui/               # Core UI components (Collapsible, IconSymbol)
│   ├── external-link.tsx # External link component
│   ├── haptic-tab.tsx    # Tab with haptic feedback
│   ├── hello-wave.tsx    # Animated wave component
│   ├── parallax-scroll-view.tsx # Parallax scroll container
│   ├── themed-text.tsx   # Theme-aware text component
│   └── themed-view.tsx   # Theme-aware view component
├── constants/             # App constants
│   └── theme.ts          # Colors and fonts configuration
├── hooks/                 # Custom React hooks
│   ├── use-color-scheme.ts     # Color scheme detection
│   └── use-theme-color.ts      # Theme color utilities
└── scripts/               # Utility scripts
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For iOS: macOS with Xcode installed
- For Android: Android Studio with an emulator or physical device

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sos-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

### Running the App

After starting the development server, you can run the app on:

- **iOS Simulator** (macOS only)
  ```bash
  npm run ios
  ```

- **Android Emulator**
  ```bash
  npm run android
  ```

- **Web Browser**
  ```bash
  npm run web
  ```

- **Physical Device**: Scan the QR code with [Expo Go](https://expo.dev/go)

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the Expo development server |
| `npm run android` | Start on Android emulator/device |
| `npm run ios` | Start on iOS simulator/device |
| `npm run web` | Start in web browser |
| `npm run lint` | Run ESLint for code quality |
| `npm run reset-project` | Reset to a fresh project structure |

## 🎨 Theming

The app supports both **light** and **dark** modes with automatic detection based on system preferences.

### Color Palette

| Theme | Background | Text | Tint |
|-------|------------|------|------|
| Light | `#ffffff` | `#11181C` | `#0a7ea4` |
| Dark | `#151718` | `#ECEDEE` | `#ffffff` |

### Font Families

The app uses platform-specific system fonts for optimal native appearance:

- **Sans**: System default
- **Serif**: UI Serif
- **Rounded**: SF Pro Rounded (iOS) / System default (Android)
- **Mono**: System monospace

## 🔧 Configuration

### App Configuration (`app.json`)

| Setting | Value |
|---------|-------|
| App Name | `sos-app` |
| Version | `1.0.0` |
| Orientation | Portrait |
| URL Scheme | `sosapp` |
| New Architecture | Enabled |
| Typed Routes | Enabled |
| React Compiler | Enabled |

### Platform-Specific Settings

**iOS:**
- Tablet support enabled

**Android:**
- Adaptive icon with custom foreground/background
- Edge-to-edge display enabled
- Background color: `#E6F4FE`

## 📦 Key Dependencies

### Production
- `expo` - Core Expo SDK
- `expo-router` - File-based routing
- `react-native-background-geolocation` - Background location tracking
- `react-native-reanimated` - Performance animations
- `react-native-gesture-handler` - Native gesture handling
- `expo-haptics` - Haptic feedback

### Development
- `typescript` - Static type checking
- `eslint` - Code linting

## 🔒 Permissions

The app requires the following permissions:

- **Location** (Background) - For SOS location tracking
- **Vibration** - For haptic feedback

## 🧪 Development Tips

1. **Hot Reload**: Changes to files auto-refresh in the app
2. **Developer Tools**: Press `cmd + d` (iOS) / `cmd + m` (Android) / `F12` (Web)
3. **Shake Device**: Opens the developer menu on physical devices

## � License

This project is private and not licensed for public distribution.

## 🤝 Contributing

This is a private project. Please contact the project maintainers for contribution guidelines.

---

Built with ❤️ using [Expo](https://expo.dev)
