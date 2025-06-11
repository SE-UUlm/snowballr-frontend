import { type User } from "$lib/model/api/user";
import { backendService, setFetch } from "$lib/grpc-api";
import type { LayoutLoad } from "./$types";
import { Nothing } from "$lib/model/api/base";
import { AuthenticationStatus } from "$lib/model/api/authentication";
import { StatusCodes } from "$lib/model/error-codes";
import { goto } from "$app/navigation";
import { getCachedUser, setCachedUser, USER_DEPENDENCY_KEY } from "$lib/current-user/userCache";

export const ssr = false;

const emptyUser: User = null as unknown as User;

export const load: LayoutLoad = async ({ depends, url, fetch }) => {
    depends(USER_DEPENDENCY_KEY);
    setFetch(fetch);

    // If the user is on a path that does not require authentication, we return an empty user
    const uncheckedPaths = ["/signin", "/signup", "/resetpassword"];
    const onUncheckedPath = uncheckedPaths.includes(url.pathname);
    if (onUncheckedPath) {
        return { user: emptyUser };
    }

    // If the user is already cached, we return the cached user
    // If the user is not cached (undefined or null), we will fetch the user
    const cachedUser = getCachedUser();
    if (cachedUser) {
        return { user: cachedUser };
    }

    const authStatusCall = await backendService.getAuthenticationStatus(Nothing).then(
        (x) => x,
        () => undefined,
    );

    if (authStatusCall === undefined) {
        setCachedUser(null);
        return { user: emptyUser };
    }

    if (authStatusCall.status.code !== StatusCodes.OK) {
        setCachedUser(null);
        return { user: emptyUser };
    }

    const authStatus = authStatusCall.response.authenticationStatus;

    if (authStatus === AuthenticationStatus.ACCESS_TOKEN_EXPIRED) {
        try {
            const renewResponse = await backendService.renewSession(Nothing);
            if (renewResponse.status.code !== StatusCodes.OK) {
                console.error(`Session renewal failed with status: ${renewResponse.status.code}`);
                return await redirectToSignIn();
            }
            // Renewal successful, proceed to fetch current user
        } catch (error) {
            console.error(`Session renewal failed: ${error}`);
            return await redirectToSignIn();
        }
    } else if (authStatus !== AuthenticationStatus.AUTHENTICATED && !onUncheckedPath) {
        return await redirectToSignIn();
    }

    try {
        const user: User = await backendService.getCurrentUser(Nothing).response;
        setCachedUser(user);
        return { user };
    } catch (error) {
        console.error(`Current user could not be loaded ${error}`);
        return await redirectToSignIn();
    }
};

/**
 * Redirects to the sign-in page and clears the user cache.
 * This function is used when the user is not authenticated or when an error occurs
 * that implies the user is not authenticated.
 *
 * @returns An empty user object.
 */
async function redirectToSignIn() {
    setCachedUser(null);
    await goto("/signin");
    return { user: emptyUser };
}
