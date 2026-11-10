import { goto } from "$app/navigation";
import { getAuthenticationStatus } from "$lib/api/auth";
import { AuthenticationStatus } from "$lib/api/types";
import type { PageLoad } from "./$types";
import { resolve } from "$app/paths";

export const load: PageLoad = async () => {
    try {
        const authStatus = await getAuthenticationStatus();
        if (authStatus === AuthenticationStatus.AUTHENTICATED) {
            await goto(resolve("/"));
        }
    } catch (error) {
        console.error("There was an error acquiring the authentication status:", error);
    }

    return {};
};
