import { Linking } from 'react-native';

/**
 * Opens the device's native maps app with directions from the user's
 * current location to (latitude, longitude) — the "Route idan an buƙata"
 * (route when needed) part of the Map + Location Markers feature.
 *
 * Deliberately a deep link rather than an in-app route: free, zero new
 * infrastructure, and the standard pattern most marketplace apps use for
 * anything beyond their own live map — Google Maps/Apple Maps already do
 * turn-by-turn navigation far better than re-implementing it in-app would.
 *
 * The universal `https://www.google.com/maps/dir/...` link opens the
 * Google Maps app if installed, or a fully working route in the browser
 * otherwise — one link covers both platforms without branching on
 * `comgooglemaps://` vs `geo:` scheme differences, and Google Maps is the
 * dominant app in Nigeria (this app's target market).
 */
export async function openDirections(latitude: number, longitude: number): Promise<boolean> {
  return openMapsUrl(`${latitude},${longitude}`);
}

/** Fallback for when no coordinates are known yet (e.g. a booking's saved
 * address before the artisan's live location arrives) — Google's directions
 * endpoint accepts free-text destinations too, not just "lat,lng". */
export async function openDirectionsToAddress(address: string): Promise<boolean> {
  return openMapsUrl(address);
}

async function openMapsUrl(destination: string): Promise<boolean> {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
