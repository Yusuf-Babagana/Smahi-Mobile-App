import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, space } from '@/constants/theme';

export type ToastType = 'success' | 'error' | 'info' | 'warn';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, keyof typeof MaterialIcons.glyphMap> = {
  success: 'check-circle',
  error: 'error-outline',
  info: 'info-outline',
  warn: 'warning',
};

const TONES: Record<ToastType, string> = {
  success: color.accent600,
  error: color.danger600,
  info: color.brand900,
  warn: color.warn600,
};

let idCounter = 0;

// Mounted once at the app root (see app/_layout.tsx). Replaces Alert.alert
// for non-blocking feedback — one toast on screen at a time, newest wins.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback((message: string, options?: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const id = ++idCounter;
    setToast({ id, message, type: options?.type ?? 'info' });
    const duration = options?.duration ?? 2800;
    timerRef.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          key={toast.id}
          entering={FadeInDown.duration(220)}
          exiting={FadeOutDown.duration(180)}
          style={[styles.wrap, { bottom: insets.bottom + space.xl }]}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={() => setToast(null)}
            style={[styles.toast, { backgroundColor: TONES[toast.type] }]}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <MaterialIcons name={ICONS[toast.type]} size={18} color="#FFFFFF" />
            <Text style={styles.message} numberOfLines={3}>{toast.message}</Text>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: space.xl,
    right: space.xl,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    maxWidth: 480,
    width: '100%',
    ...shadow.e3,
  },
  message: { flex: 1, fontFamily: font.bold, fontSize: 13.5, lineHeight: 18, color: '#FFFFFF' },
});
