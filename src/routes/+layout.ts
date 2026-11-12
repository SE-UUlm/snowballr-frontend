import { type User, AuthenticationStatus } from "$lib/api/types";
import { getAuthenticationStatus, renewSession } from "$lib/api/auth";
import { getCurrentUser } from "$lib/api/user";
import { setFetch } from "$lib/api/fetch";
import type { LayoutLoad } from "./$types";
import { goto } from "$app/navigation";
import { getCachedUser, setCachedUser, USER_DEPENDENCY_KEY } from "$lib/current-user/userCache";
import { addRedirectUrlIfExists } from "$lib/utils/search-parameters";
import { resolve } from "$app/paths";

export const ssr = false;

const PUBLIC_PATHS = [
    "/signin",
    "/signup",
    "/resetpassword",
    "/verifyemail",
    "/acceptprojectinvitation",
];

export const load: LayoutLoad = async ({ depends, url, fetch }) => {
    depends(USER_DEPENDENCY_KEY);
    setFetch(fetch);

    // Allow access to public paths without checks
    if (isPublicPath(url.pathname)) {
        setCachedUser(null);
        return { user: null };
    }

    const authStatus = await getAuthenticationStatus().catch(() => undefined);

    // Redirect on a network or backend failure, which includes every non-OK status
    if (authStatus === undefined) {
        console.error("Authentication status could not be determined. Redirecting to sign-in.");
        return await redirectToSignIn(url);
    }

    if (authStatus === AuthenticationStatus.ACCESS_TOKEN_EXPIRED) {
        try {
            await renewSession();
            // Renewal successful, proceed to fetch current user
        } catch (error) {
            console.error(`Session renewal failed: ${error}`);
            return await redirectToSignIn(url);
        }
    } else if (authStatus !== AuthenticationStatus.AUTHENTICATED) {
        return await redirectToSignIn(url);
    }

    // If the user is cached, return it
    const cachedUser = getCachedUser();
    if (cachedUser) return { user: cachedUser };

    try {
        const user: User = await getCurrentUser();
        setCachedUser(user);
        return { user };
    } catch (error) {
        console.error(`Current user could not be loaded ${error}`);
        return await redirectToSignIn(url);
    }
};

function isPublicPath(path: string) {
    const normalizedPath = path.replace(/\/+$/, ""); // Remove trailing slashes
    return PUBLIC_PATHS.includes(normalizedPath);
}

/**
 * Redirects to the sign-in page and clears the user cache.
 * This function is used when the user is not authenticated or when an error occurs
 * that implies the user is not authenticated.
 *
 * @param url - The current URL object to preserve redirect information.
 * @returns An empty user object.
 */
async function redirectToSignIn(url: URL) {
    setCachedUser(null);
    const redirectUrl = encodeURIComponent(addRedirectUrlIfExists(url.pathname + url.search));
    const path = resolve("/signin");
    await goto(`${path}?redirect=${redirectUrl}`);
    return { user: null };
}
