import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { notificationAPI } from '@/src/api/client';
import { color as themeColor, font } from '@/constants/theme';

interface NotificationBellProps {
    /** Icon (and badge outline) color — pass white on a dark header, ink900 on light. */
    iconColor?: string;
    size?: number;
    /** Applied to the outer Pressable — pass whatever icon-button container
     * style this dashboard already uses (translucent circle, bordered
     * square, etc.) so the bell fits right in next to the other header icons. */
    style?: StyleProp<ViewStyle>;
}

// Every Dashboard Must Be Connected (item 10) — one shared bell, dropped
// into every role's dashboard header, all pointing at the same
// /notifications inbox. Refetches the unread count whenever the screen
// regains focus (e.g. coming back from the inbox after reading some),
// not just on mount.
export function NotificationBell({ iconColor = themeColor.ink900, size = 20, style }: NotificationBellProps) {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    const refresh = useCallback(() => {
        notificationAPI.getUnreadCount()
            .then((data) => setUnreadCount(data?.unread_count || 0))
            .catch(() => {});
    }, []);

    useFocusEffect(refresh);

    return (
        <Pressable
            onPress={() => router.push('/notifications')}
            style={style}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
        >
            <MaterialIcons name="notifications" size={size} color={iconColor} />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        minWidth: 15,
        height: 15,
        borderRadius: 8,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: themeColor.surface,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 9,
        fontFamily: font.extrabold,
    },
});

export default NotificationBell;
