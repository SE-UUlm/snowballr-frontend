import { type User } from "$lib/model/api/user";
import { backendService, setFetch } from "$lib/grpc-api";
import type { LayoutLoad } from "./$types";
import { Nothing } from "$lib/model/api/base";
import { AuthenticationStatus } from "$lib/model/api/authentication";
import { StatusCodes } from "$lib/model/error-codes";
import { goto } from "$app/navigation";

export const ssr = false;

export const load: LayoutLoad = async ({ depends, url, fetch }) => {
    depends("data:getCurrentUser");
    setFetch(fetch);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const undefinedUser: User = undefined as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nullUser: User = null as any;

    const uncheckedPaths = ["/signin", "/signup", "/resetpassword"];
    const onUncheckedPath = uncheckedPaths.includes(url.pathname);
    if (onUncheckedPath) {
        return { user: nullUser };
    }

    const authStatusCall = await backendService.getAuthenticationStatus(Nothing).then(
        (x) => x,
        () => undefined,
    );

    if (authStatusCall === undefined) {
        return { user: undefinedUser };
    }

    if (authStatusCall.status.code !== StatusCodes.OK) {
        return { user: undefinedUser };
    }

    const authStatus = authStatusCall.response.authenticationStatus;

    if (authStatus === AuthenticationStatus.ACCESS_TOKEN_EXPIRED) {
        await backendService.renewSession(Nothing);
    } else if (authStatus !== AuthenticationStatus.AUTHENTICATED && !onUncheckedPath) {
        throw goto("/signin");
    }

    let user: User;
    try {
        user = await backendService.getCurrentUser(Nothing).response;
        return { user };
    } catch (err) {
        console.error(`Current user could not be loaded ${err}`);
        throw goto("/signin");
    }
};
