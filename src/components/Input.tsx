import React, { useState } from "react";
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    TextInputProps,
    Pressable,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    FadeIn
} from "react-native-reanimated";
import { IconSymbol, IconSymbolName } from "./IconSymbol";

interface InputProps extends TextInputProps {
    label: string;
    icon?: IconSymbolName;
    error?: string;
    isPassword?: boolean;
}

export function Input({
    label,
    icon,
    error,
    isPassword,
    style,
    value,
    onBlur,
    onFocus,
    ...props
}: InputProps) {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Animation value for the label position/scale could go here
    // For now, we animate the border color and background

    const handleFocus = (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    const borderColor = error
        ? theme.colors.notification
        : isFocused
            ? theme.colors.primary
            : theme.colors.border;

    const backgroundColor = theme.dark ? '#1C1C1E' : '#F2F2F7';

    return (
        <Animated.View entering={FadeIn} style={[styles.container, style]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>

            <View style={[
                styles.inputWrapper,
                {
                    backgroundColor,
                    borderColor,
                    borderWidth: isFocused ? 2 : 1,
                }
            ]}>
                {icon && (
                    <View style={styles.iconContainer}>
                        <IconSymbol name={icon} size={20} color={isFocused ? theme.colors.primary : '#999'} />
                    </View>
                )}

                <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholderTextColor="#999"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={isPassword && !showPassword}
                    value={value}
                    {...props}
                />

                {isPassword && (
                    <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.rightIcon}
                    >
                        <IconSymbol
                            name={showPassword ? "eye.slash.fill" : "eye.fill"}
                            size={20}
                            color="#999"
                        />
                    </Pressable>
                )}
            </View>

            {error && (
                <Animated.Text entering={FadeIn} style={[styles.errorText, { color: theme.colors.notification }]}>
                    {error}
                </Animated.Text>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16, // Softer corners
        height: 56, // Taller touch target
        paddingHorizontal: 16,
    },
    iconContainer: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: "100%",
    },
    rightIcon: {
        padding: 4,
    },
    errorText: {
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
});