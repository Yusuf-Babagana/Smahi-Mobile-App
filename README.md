# Smahi App (Natively)

A comprehensive service marketplace mobile application built with React Native and Expo. This application connects clients with artisans and agents, providing a platform for service discovery and management.

## Features

- **Role-Based Authentication**:
  - **Client**: Search for services, manage profile.
  - **Artisan**: Dashboard for managing services and requests.
  - **Agent**: Specialized dashboard for agents.
  - **Admin**: Administration capabilities.

- **Navigation**:
  - Powered by [Expo Router](https://docs.expo.dev/router/introduction/).
  - Tab-based navigation for clients.
  - Stack navigation for specific flows (Auth, Chat, etc.).

- **Tech Stack**:
  - **Framework**: React Native with Expo (SDK 50+)
  - **Language**: TypeScript
  - **State Management & Data**: React Hooks, Context API (implied)
  - **Styling**: React Native StyleSheet / Themed components
  - **Backend Integration**: Axios based API client
  - **Storage**: SecureStore for sensitive data

## Project Structure

```
c:\Users\DELL\Desktop\DESKTOP\smahiapp
├── app/                        # Expo Router pages and layouts
│   ├── (tabs)/                 # Client main tab navigation
│   │   ├── (home)/             # Home tab routes
│   │   ├── _layout.tsx
│   │   ├── bookings.tsx
│   │   └── profile.tsx
│   ├── admin/                  # Admin dashboard routes
│   │   └── dashboard.tsx
│   ├── agent/                  # Agent dashboard routes
│   │   └── dashboard.tsx
│   ├── artisan/                # Artisan dashboard routes
│   │   ├── dashboard.tsx
│   │   ├── portfolio.tsx       # Portfolio management
│   │   └── profile.tsx         # Artisan profile settings
│   ├── chat/                   # Chat functionality
│   │   ├── [id].tsx
│   │   └── index.tsx
│   ├── _layout.tsx             # Root layout configuration
│   ├── +not-found.tsx          # 404 screen
│   ├── activate.tsx            # Account activation
│   ├── artisan-profile.tsx     # Public artisan profile view
│   ├── index.tsx               # Entry point / Auth check
│   ├── login.tsx               # Login screen
│   └── register.tsx            # Register screen
├── assets/                     # Images, fonts, and static assets
├── src/                        # Source logic
│   ├── api/                    # API clients (axios)
│   │   ├── client.ts
│   │   ├── config.ts
│   │   └── seedData.ts         # Mock data seeding
│   ├── components/             # Reusable UI components
│   │   ├── ArtisanCard.tsx
│   │   ├── BodyScrollView.tsx
│   │   ├── BookingModal.tsx
│   │   ├── button.tsx
│   │   ├── CustomPicker.tsx
│   │   ├── FloatingTabBar.tsx
│   │   ├── InAppNotification.tsx
│   │   ├── Input.tsx
│   │   ├── LanguageToggle.tsx
│   │   ├── ListItem.tsx
│   │   ├── ModernInput.tsx
│   │   └── SearchBar.tsx
│   ├── constants/              # App constants
│   │   ├── config.ts
│   │   └── countries.ts
│   ├── contexts/               # Context Providers
│   │   ├── NotificationContext.tsx
│   │   └── WidgetContext.tsx
│   ├── i18n/                   # Internationalization
│   │   ├── en.json
│   │   ├── ha.json
│   │   └── index.ts
│   ├── types/                  # TypeScript definitions
│   │   └── index.ts
│   └── utils/                  # Utilities
│       └── storage.ts
├── styles/                     # Global styles
│   └── commonStyles.ts
├── utils/                      # Root utilities
│   └── errorLogger.ts
├── app.json
├── babel.config.js
├── package.json
├── tsconfig.json
└── workbox-config.js
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) app on your physical device or an Emulator (Android Studio / Xcode).

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory:
    ```bash
    cd smahiapp
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the development server**:
    ```bash
    npx expo start
    ```

4.  **Run on device/emulator**:
    -   Scan the QR code with **Expo Go** (Android) or Camera (iOS).
    -   Press `a` for Android Emulator.
    -   Press `i` for iOS Simulator.
    -   Press `w` for Web.

## key Scripts

-   `npm run dev` / `npx expo start`: Start the development server.
-   `npm run android`: Run on Android emulator/device.
-   `npm run ios`: Run on iOS simulator/device.
-   `npm run web`: Run on web browser.

## Configuration

-   **API Configuration**: Check `src/api/client.ts` for backend URL configuration.
-   **Navigation**: Defined in `app/_layout.tsx` and directory structure (file-based routing).

