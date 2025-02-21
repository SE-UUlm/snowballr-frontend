import { type User } from "$lib/model/api/user";
import { backendService, setFetch } from "$lib/grpc-api";
import { redirect } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { Nothing } from "$lib/model/api/base";
import { AuthenticationStatus } from "$lib/model/api/authentication";

export const ssr = false;

export const load: LayoutLoad = async ({ depends, url, fetch }) => {
    depends("data:getCurrentUser");
    setFetch(fetch);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const undefinedUser: User = undefined as any;

    const uncheckedPaths = ["/signin", "/signup", "/resetpassword"];
    const onUncheckedPath = uncheckedPaths.includes(url.pathname);
    if (onUncheckedPath) {
        return {
            user: undefinedUser,
        };
    }

    const authStatus = (await backendService.getAuthenticationStatus(Nothing).response)
        .authenticationStatus;

    if (authStatus === AuthenticationStatus.ACCESS_TOKEN_EXPIRED) {
        await backendService.renewSession({});
    } else if (authStatus !== AuthenticationStatus.AUTHENTICATED && !onUncheckedPath) {
        redirect(307, "/signin");
    }

    /// TODO: exchange this logic in !220 or !124 with better handling of the case, the user could not be loaded
    let user: User;
    try {
        user = await backendService.getCurrentUser(Nothing).response;
        return { user };
    } catch (err) {
        console.error(`Current user could not be loaded ${err}`);
        return {
            user: undefinedUser,
        };
    }
};
