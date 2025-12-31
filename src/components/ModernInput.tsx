import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles'; // Import fixed colors

interface ModernInputProps extends TextInputProps {
    label: string;
    error?: string;
    icon?: string;
    isPassword?: boolean;
}

export const ModernInput = ({ label, error, icon, isPassword, style, ...props }: ModernInputProps) => {
    const [secure, setSecure] = useState(isPassword);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {/* FORCE DARK TEXT COLOR */}
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>

            <View style={[
                styles.inputWrapper,
                {
                    borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
                    backgroundColor: colors.inputBackground // Force White
                }
            ]}>
                {icon && <IconSymbol name={icon as any} size={20} color={colors.textSecondary} style={styles.icon} />}

                <TextInput
                    style={[styles.input, { color: colors.text }]} // Force Dark Text
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry={secure}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    cursorColor={colors.primary}
                    {...props}
                />

                {isPassword && (
                    <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeIcon}>
                        <IconSymbol name={secure ? "eye.slash" : "eye"} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        height: 56,
        paddingHorizontal: 16,
        // Android Shadow
        elevation: 2,
        // iOS Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    icon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, height: '100%' },
    eyeIcon: { padding: 8 },
    errorText: { color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
});