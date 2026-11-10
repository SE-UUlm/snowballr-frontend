import { goto } from "$app/navigation";
import { backendService } from "$lib/grpc-api";
import { AuthenticationStatus, Nothing } from "$lib/api/types";
import type { PageLoad } from "./$types";
import { resolve } from "$app/paths";

export const load: PageLoad = async () => {
    try {
        const authStatus = (await backendService.getAuthenticationStatus(Nothing).response)
            .authenticationStatus;
        if (authStatus === AuthenticationStatus.AUTHENTICATED) {
            await goto(resolve("/"));
        }
    } catch (error) {
        console.error("There was an error acquiring the authentication status:", error);
    }

    return {};
};
