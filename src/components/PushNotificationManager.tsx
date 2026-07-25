import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { registerForPushNotifications } from '@/src/utils/pushNotifications';

// Mounted once near the root, inside AuthProvider. Registers this device
// for push once a user is present (fresh login, registration, or a
// restored session on cold start), and routes a tapped notification to
// the booking it's about when there's one to go to.
export function PushNotificationManager() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      registerForPushNotifications();
    }
  }, [user?.id]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, any>;
      if (data?.related_object_type === 'booking' && data?.related_object_id) {
        router.push(`/booking/detail/${data.related_object_id}`);
      }
    });
    return () => subscription.remove();
  }, [router]);

  return null;
}

export default PushNotificationManager;
