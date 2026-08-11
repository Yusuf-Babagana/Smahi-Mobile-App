import React, { createContext, useCallback, useContext, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { Button } from './Button';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as a destructive (danger) action. */
  destructive?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

// Mounted once at the app root (see app/_layout.tsx). Replaces the
// Cancel/Confirm flavor of Alert.alert with an on-brand modal — call
// `await confirm({ title, message, destructive })` and branch on the result.
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handle = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal visible={!!state} transparent animationType="fade" onRequestClose={() => handle(false)} statusBarTranslucent>
        <Pressable style={styles.backdrop} onPress={() => handle(false)} accessibilityRole="none">
          <Pressable style={styles.card} onPress={() => {}}>
            {state?.destructive && (
              <View style={styles.iconTile}>
                <MaterialIcons name="warning" size={22} color={color.danger600} />
              </View>
            )}
            <Text style={styles.title}>{state?.title}</Text>
            {state?.message ? <Text style={styles.message}>{state.message}</Text> : null}
            <View style={styles.actions}>
              <Button
                title={state?.cancelLabel ?? 'Cancel'}
                variant="secondary"
                onPress={() => handle(false)}
                style={styles.actionButton}
              />
              <Button
                title={state?.confirmLabel ?? 'Confirm'}
                onPress={() => handle(true)}
                style={[styles.actionButton, state?.destructive && styles.destructiveButton]}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,31,63,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.xxl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: color.surface,
    borderRadius: radius.xxl,
    padding: space.xxl,
    ...shadow.e3,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  title: { fontFamily: font.extrabold, fontSize: 17, letterSpacing: -0.17, color: color.ink900 },
  message: { fontFamily: font.medium, fontSize: 14, lineHeight: 21, color: color.ink600, marginTop: 8 },
  actions: { flexDirection: 'row', gap: space.md, marginTop: space.xl },
  actionButton: { flex: 1 },
  destructiveButton: { backgroundColor: color.danger600, shadowColor: color.danger600 },
});
