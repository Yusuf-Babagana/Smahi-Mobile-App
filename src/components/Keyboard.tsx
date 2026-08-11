import React from 'react';
import Constants from 'expo-constants';
import { Keyboard, KeyboardEvent, Platform, View, ViewStyle } from 'react-native';

// react-native-keyboard-controller fixes the keyboard covering the chat
// composer on Android 15 edge-to-edge, but it is a NATIVE module — it does
// not exist inside Expo Go and would crash every screen there. Use it in
// real builds (APK/dev client) and fall back to a manual, event-driven
// KeyboardAvoidingView in Expo Go so development keeps working.

const isExpoGo = Constants.appOwnership === 'expo';

// React Native's own built-in KeyboardAvoidingView computes its "padding"
// offset from the view's own measured screen position (onLayout), and that
// measurement goes wrong under Android edge-to-edge — which Android 15
// force-enables even inside Expo Go's own host shell, regardless of this
// project's app.json. The result: the padding it adds is too small and the
// composer stays partly behind the keyboard. Driving the offset directly
// from the OS-reported keyboard height (via Keyboard.addListener) sidesteps
// that broken measurement entirely.
interface FallbackKAVProps {
    children: React.ReactNode;
    style?: ViewStyle;
    keyboardVerticalOffset?: number;
    behavior?: 'height' | 'padding' | 'position';
}

const ManualKeyboardAvoidingView: React.FC<FallbackKAVProps> = ({
    children,
    style,
    keyboardVerticalOffset = 0,
}) => {
    const [bottomOffset, setBottomOffset] = React.useState(0);

    React.useEffect(() => {
        const showEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
        const hideEvent = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';

        const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
            setBottomOffset(Math.max(0, e.endCoordinates.height - keyboardVerticalOffset));
        });
        const hideSub = Keyboard.addListener(hideEvent, () => setBottomOffset(0));

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [keyboardVerticalOffset]);

    return (
        <View style={[style, { paddingBottom: bottomOffset }]}>
            {children}
        </View>
    );
};

let Provider: React.ComponentType<{ children: React.ReactNode }> =
    ({ children }) => <>{children}</>;
let KAV: React.ComponentType<any> = ManualKeyboardAvoidingView;

if (!isExpoGo) {
    try {
        const kc = require('react-native-keyboard-controller');
        Provider = kc.KeyboardProvider;
        KAV = kc.KeyboardAvoidingView;
    } catch {
        // Native module unavailable (e.g. outdated dev client): keep fallback.
    }
}

export const KeyboardProvider = Provider;
export const KeyboardAvoidingView = KAV;
