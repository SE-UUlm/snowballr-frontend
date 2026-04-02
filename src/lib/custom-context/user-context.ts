import { User } from "$api/user";
import { getContext, setContext } from "svelte";
import { getCachedUser } from "$lib/current-user/userCache";

export type UserContext = () => User | null;
/**
 * Key for context storing a user.
 */
export const USER_KEY = Symbol("userContext");

/**
 * Sets the user context.
 *
 * @param user - User context to set
 */
export function setUserContext(user: UserContext) {
    setContext(USER_KEY, user);
}

/**
 * Retrieves the user from context or cache.
 * If no user is found in context, it falls back to the cached user.
 *
 * @returns The user from context or cache.
 */
export function getUserContext(): User {
    const ctx: UserContext | undefined = getContext(USER_KEY);
    let user: User | null | undefined = null;
    if (ctx && typeof ctx === "function") {
        user = ctx();
    }

    user ??= getCachedUser();

    return user!;
}
