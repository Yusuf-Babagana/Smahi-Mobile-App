import { agentAPI, bookingAPI } from '@/src/api/client';
import type { Submitter } from './offlineQueue';

// One shared registry of "how to actually send this queue item to the
// server" — used both by the app-wide background sync (app/_layout.tsx)
// and by a screen that wants an immediate sync attempt right after
// queueing (app/agent/register.tsx, app/booking/[artisanId].tsx), so the
// two can never drift apart on how a given queue `type` is submitted.
export const syncSubmitters: Record<string, Submitter> = {
  agent_register_artisan: (payload, clientRequestId) =>
    agentAPI.registerArtisan({ ...payload, client_request_id: clientRequestId }),

  // photos are local file URIs, not something the booking-creation
  // endpoint itself accepts — uploaded as a best-effort follow-up here
  // (same sequence app/booking/[artisanId].tsx always used), so this
  // submitter behaves identically whether it runs immediately after
  // submit or much later from the background queue.
  service_booking: async (payload, clientRequestId) => {
    const { photos, ...bookingPayload } = payload;
    const booking = await bookingAPI.createBooking({ ...bookingPayload, client_request_id: clientRequestId });
    let failedPhotoCount = 0;
    if (photos?.length && booking?.id) {
      for (const uri of photos as string[]) {
        try {
          await bookingAPI.uploadPhoto(booking.id, uri);
        } catch {
          failedPhotoCount++;
        }
      }
    }
    return { ...booking, failedPhotoCount };
  },
};
