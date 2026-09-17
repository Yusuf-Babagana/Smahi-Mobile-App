import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Vibration } from 'react-native';
import { chatAPI } from '@/src/api/client';
import { InAppNotification } from '@/src/components/InAppNotification';
import { useAuth } from '@/src/contexts/AuthContext';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [lastMessageId, setLastMessageId] = useState<number | null>(null);
    // Derived from useAuth() (not a one-time storage read) so it updates
    // immediately on login/logout — this context is mounted once, app-wide,
    // for the whole session, so a stale id here previously kept pointing at
    // whoever was logged in FIRST: on a shared device, switching accounts
    // made every incoming message from the old user look like "from me"
    // (toast wrongly suppressed) and every message the new user sent look
    // like "not from me" (toast wrongly shown for their own outgoing text).
    const { user } = useAuth();
    const currentUserId = user?.id ?? null;

    // Toast State
    const [toastVisible, setToastVisible] = useState(false);
    const [toastData, setToastData] = useState({ message: '', senderName: '', chatId: 0 });

    // 2. Play Sound / Haptic
    const playSound = () => {
        try {
            Vibration.vibrate(200);
        } catch {
            // ignore vibration error
        }
    };

    // 3. Poll for New Messages
    const lastMsgIdRef = React.useRef<number | null>(null);

    useEffect(() => {
        const checkMessages = async () => {
            if (!currentUserId || AppState.currentState !== 'active') return;

            try {
                const conversations = await chatAPI.getConversations();
                let newestMsg: any = null;
                let relatedChat: any = null;

                conversations.forEach((conv: any) => {
                    if (conv.last_message) {
                        if (!newestMsg || new Date(conv.last_message.created_at) > new Date(newestMsg.created_at)) {
                            newestMsg = conv.last_message;
                            relatedChat = conv;
                        }
                    }
                });

                if (newestMsg) {
                    const prevId = lastMsgIdRef.current;
                    // Check if it is NEW and NOT from me
                    if (prevId !== null && newestMsg.id > prevId && Number(newestMsg.sender_id) !== currentUserId) {
                        playSound();
                        setToastData({
                            message: newestMsg.text,
                            senderName: `${relatedChat.other_user?.first_name || 'Artisan'} ${relatedChat.other_user?.last_name || ''}`,
                            chatId: relatedChat.id
                        });
                        setToastVisible(true);
                    }
                    lastMsgIdRef.current = newestMsg.id;
                    setLastMessageId(newestMsg.id); // Still sync state for UI if needed
                }
            } catch (error) { /* Silent fail */ }
        };

        // Widened from 6s to 12s (Aug 2026): this poll runs globally, on
        // every screen, for the entire time the app is foregrounded — not
        // just while a chat is open (app/chat/index.tsx and app/chat/[id].tsx
        // poll separately, on top of this one, only while those screens are
        // actually visible). Being the one poll every user always has
        // running, it was the single biggest contributor to request volume
        // against PythonAnywhere's free-tier daily CPU-seconds quota. A new-
        // message toast arriving up to 12s late is an acceptable trade.
        const interval = setInterval(checkMessages, 12000);
        return () => clearInterval(interval);
    }, [currentUserId]);

    return (
        <NotificationContext.Provider value={{}}>
            {children}

            {/* ✅ Render the Toast Globally here */}
            <InAppNotification
                visible={toastVisible}
                message={toastData.message}
                senderName={toastData.senderName}
                chatId={toastData.chatId}
                onHide={() => setToastVisible(false)}
            />
        </NotificationContext.Provider>
    );
};