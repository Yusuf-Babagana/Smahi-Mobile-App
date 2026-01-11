import React, { createContext, useContext, useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { chatAPI } from '@/src/api/client';
import { storage } from '@/src/utils/storage';
import { InAppNotification } from '@/components/InAppNotification';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [lastMessageId, setLastMessageId] = useState<number | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    // Toast State
    const [toastVisible, setToastVisible] = useState(false);
    const [toastData, setToastData] = useState({ message: '', senderName: '', chatId: 0 });

    // 1. Load Current User
    useEffect(() => {
        storage.getCurrentUser().then(u => u && setCurrentUserId(u.id));
    }, []);

    // 2. Play Sound
    const playSound = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                require('@/assets/sounds/received.mp3')
            );
            await sound.playAsync();
        } catch (error) {
            // console.log("Sound error");
        }
    };

    // 3. Poll for New Messages
    useEffect(() => {
        const checkMessages = async () => {
            if (!currentUserId) return;

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
                    // Check if it is NEW and NOT from me
                    if (lastMessageId !== null && newestMsg.id > lastMessageId && Number(newestMsg.sender_id) !== currentUserId) {

                        // ✅ Trigger Custom Toast
                        playSound();
                        setToastData({
                            message: newestMsg.text,
                            senderName: `${relatedChat.other_user?.first_name} ${relatedChat.other_user?.last_name}`,
                            chatId: relatedChat.id
                        });
                        setToastVisible(true);
                    }

                    setLastMessageId(newestMsg.id);
                } else {
                    // First load initialization
                    if (lastMessageId === null && newestMsg) setLastMessageId(newestMsg.id);
                }

            } catch (error) {
                // Silent fail
            }
        };

        const interval = setInterval(checkMessages, 5000);
        return () => clearInterval(interval);
    }, [currentUserId, lastMessageId]);

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