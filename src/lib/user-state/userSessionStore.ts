import { invalidate } from "$app/navigation";
import type { User } from "$lib/model/api/user";

export const USER_SESSION_DEPENDENCY_KEY = "data:getCurrentUser";

/** Cache for the user object.
 * | Value | Description |
 * | ----- | ----------- |
 * | undefined | the state is unknown, the user never was fetched, or the cache has explicitly invalidated |
 * | null | the user was attempted to be fetched, but user is confirmed not authenticated, or an error implies no user |
 * | User | the user was fetched successfully and is authenticated |
 */
let cachedUser: User | null | undefined = undefined;

/**
 * Retrieves the cached user object.
 * This is primarily for use by the root layout load function.
 *
 * @returns The cached user object, or null if the user is not authenticated or
 *          undefined if the user state is unknown (e.g., not yet fetched or cache invalidated).
 */
export function getCachedUser(): User | null | undefined {
    return cachedUser;
}

/**
 * Updates the user cache.
 * This is primarily for use by the root layout load function after a successful fetch or auth check.
 *
 * @param user - The user object to cache, or null if the user is not authenticated.
 */
export function setCachedUser(user: User | null): void {
    cachedUser = user;
}

/**
 * Invalidate the client-side user cache and trigger a re-fetch of the user session in the root layout.
 */
export function triggerUserSessionRefresh(): void {
    cachedUser = undefined;
    invalidate(USER_SESSION_DEPENDENCY_KEY);
}
