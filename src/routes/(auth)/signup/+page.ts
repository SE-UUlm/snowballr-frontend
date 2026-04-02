import { goto } from "$app/navigation";
import { backendService } from "$lib/grpc-api";
import { AuthenticationStatus } from "$api/authentication";
import { Nothing } from "$api/base";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
    try {
        const authStatus = (await backendService.getAuthenticationStatus(Nothing).response)
            .authenticationStatus;
        if (authStatus === AuthenticationStatus.AUTHENTICATED) {
            await goto("/");
        }
    } catch (error) {
        console.error("There was an error acquiring the authentication status:", error);
    }

    return {};
};
