import { BACKEND_URL } from '@/src/constants/env';

/** Normalizes a photo URL from the API: makes a relative /media/ path
 * absolute, upgrades Cloudinary URLs to https, and asks Cloudinary for a
 * reasonably-sized thumbnail instead of the full upload. Shared by
 * ArtisanCard and AIActionCard so both render photos the same way. */
export function optimizedPhotoUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  let finalUrl = url;
  if (finalUrl.startsWith('/')) finalUrl = `${BACKEND_URL}${finalUrl}`;
  if (finalUrl.includes('res.cloudinary.com')) {
    if (finalUrl.startsWith('http:')) finalUrl = finalUrl.replace('http:', 'https:');
    if (finalUrl.includes('upload/') && !finalUrl.includes('w_')) {
      finalUrl = finalUrl.replace('upload/', 'upload/w_250,h_250,c_fill,q_auto,f_auto/');
    }
  }
  return finalUrl;
}

export default optimizedPhotoUrl;
