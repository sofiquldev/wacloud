/** Default member portrait (public/images/default-avatar.webp). */
export const DEFAULT_MEMBER_PHOTO_URL = '/images/default-avatar.webp';

/** Strip placeholder URL for edit forms (do not persist default as upload). */
export function memberPhotoForForm(stored) {
    if (!stored || stored === DEFAULT_MEMBER_PHOTO_URL) {
        return '';
    }
    return stored;
}

/** Omit placeholder when saving — backend serves default when photo_path is null. */
export function memberPhotoForSubmit(photoUrl) {
    if (!photoUrl || photoUrl === DEFAULT_MEMBER_PHOTO_URL) {
        return undefined;
    }
    return photoUrl;
}
