import React from 'react';
import Constants from 'expo-constants';
import { KeyboardAvoidingView as RNKeyboardAvoidingView } from 'react-native';

// react-native-keyboard-controller fixes the keyboard covering the chat
// composer on Android 15 edge-to-edge, but it is a NATIVE module — it does
// not exist inside Expo Go and would crash every screen there. Use it in
// real builds (APK/dev client) and fall back to React Native's built-in
// KeyboardAvoidingView in Expo Go so development keeps working.

const isExpoGo = Constants.appOwnership === 'expo';

let Provider: React.ComponentType<{ children: React.ReactNode }> =
    ({ children }) => <>{children}</>;
let KAV: React.ComponentType<any> = RNKeyboardAvoidingView;

if (!isExpoGo) {
    try {
        const kc = require('react-native-keyboard-controller');
        Provider = kc.KeyboardProvider;
        KAV = kc.KeyboardAvoidingView;
    } catch {
        // Native module unavailable (e.g. outdated dev client): keep fallbacks.
    }
}

export const KeyboardProvider = Provider;
export const KeyboardAvoidingView = KAV;
