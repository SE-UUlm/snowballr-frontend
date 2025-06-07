import { type User } from "$lib/model/api/user";
import { backendService, setFetch } from "$lib/grpc-api";
import type { LayoutLoad } from "./$types";
import { Nothing } from "$lib/model/api/base";
import { AuthenticationStatus } from "$lib/model/api/authentication";
import { StatusCodes } from "$lib/model/error-codes";
import { goto } from "$app/navigation";
import {
    getCachedUser,
    setCachedUser,
    USER_SESSION_DEPENDENCY_KEY,
} from "$lib/current-user/userSessionStore";

export const ssr = false;

export const load: LayoutLoad = async ({ depends, url, fetch }) => {
    depends(USER_SESSION_DEPENDENCY_KEY);
    setFetch(fetch);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const undefinedUser: User = undefined as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nullUser: User = null as any;

    // If the user is on a path that does not require authentication, we return nullUser
    const uncheckedPaths = ["/signin", "/signup", "/resetpassword"];
    const onUncheckedPath = uncheckedPaths.includes(url.pathname);
    if (onUncheckedPath) {
        return { user: nullUser };
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
        return { user: undefinedUser };
    }

    if (authStatusCall.status.code !== StatusCodes.OK) {
        setCachedUser(null);
        return { user: undefinedUser };
    }

    const authStatus = authStatusCall.response.authenticationStatus;

    if (authStatus === AuthenticationStatus.ACCESS_TOKEN_EXPIRED) {
        try {
            const renewResponse = await backendService.renewSession(Nothing);
            if (renewResponse.status.code !== StatusCodes.OK) {
                console.error(`Session renewal failed with status: ${renewResponse.status.code}`);
                setCachedUser(null);
                await goto("/signin");
                return { user: nullUser };
            }
            // Renewal successful, proceed to fetch current user
        } catch (error) {
            console.error(`Session renewal failed: ${error}`);
            setCachedUser(null);
            await goto("/signin");
            return { user: nullUser };
        }
    } else if (authStatus !== AuthenticationStatus.AUTHENTICATED && !onUncheckedPath) {
        setCachedUser(null);
        await goto("/signin");
        return { user: nullUser };
    }

    try {
        const user: User = await backendService.getCurrentUser(Nothing).response;
        setCachedUser(user);
        return { user };
    } catch (error) {
        console.error(`Current user could not be loaded ${error}`);
        setCachedUser(null);
        await goto("/signin");
        return { user: nullUser };
    }
};
