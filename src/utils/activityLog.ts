import { MaterialIcons } from '@expo/vector-icons';
import type { BadgeStatus } from '@/src/components/ui';

// Shared between app/coordinator/activity-log.tsx (the full list) and
// app/agent/dashboard.tsx (the "Recent Activities" preview) so the two
// never drift on how an ActivityLog row is displayed — see
// core.models.ActivityLog / CoordinatorActivityLogView on the backend.

export const ACTIVITY_ACTION_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    agent_created: 'person-add-alt',
    agent_approved: 'check-circle',
    agent_rejected: 'cancel',
    agent_suspended: 'pause-circle-outline',
    agent_reactivated: 'play-circle-outline',
    agent_dismissed: 'remove-circle-outline',
    artisan_registered: 'person-add',
    artisan_verified: 'verified',
    artisan_verification_rejected: 'gpp-bad',
};

export function activityBadgeStatus(resultingStatus: string): BadgeStatus {
    if (['active', 'approved'].includes(resultingStatus)) return 'verified';
    if (['pending_approval', 'pending'].includes(resultingStatus)) return 'pending';
    if (['suspended', 'rejected', 'dismissed'].includes(resultingStatus)) return 'cancelled';
    return 'confirmed';
}

// Matches the spec's example row shape: Actor -> action -> LGA -> date -> time.
export function formatActivityWhen(iso: string): { date: string; time: string } {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: '', time: '' };
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return { date, time: `${String(hours).padStart(2, '0')}:${minutes} ${ampm}` };
}
