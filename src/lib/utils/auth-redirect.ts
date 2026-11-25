import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { getAuthenticationStatus } from "#lib/api/auth.js";
import { AuthenticationStatus } from "#lib/api/types.js";

/**
 * Sends a signed-in user from a public auth page (sign in, sign up, ...) to the home page.
 * Call it first in the page's `load`: the thrown redirect stops the rest of the loader.
 *
 * If the authentication status can't be loaded, the error is logged and the page loads normally.
 *
 * @throws The SvelteKit redirect to the home page if the user is already signed in
 */
export async function redirectIfAuthenticated(): Promise<void> {
    let authStatus: AuthenticationStatus;
    try {
        authStatus = await getAuthenticationStatus();
    } catch (error) {
        console.error("There was an error acquiring the authentication status:", error);
        return;
    }

    // Outside the `try`, so the thrown redirect isn't logged and swallowed
    if (authStatus === AuthenticationStatus.AUTHENTICATED) {
        redirect(307, resolve("/"));
    }
}
