import { goto } from "$app/navigation";
import { jwtDecode } from "jwt-decode";
import type { User } from "./model/backend";
import { browser } from "$app/environment";

/**
 * Resolves the current user from the local storage token
 *
 * @param redirectOnMissing - When true, and the jwt is missing, the page will be redirected to the sign-in page
 * @returns The currently signed in user - if they exist, otherwise undefined
 */
export function getCurrentUser(redirectOnMissing: boolean = true): User | undefined {
    // If the script is not running in the browser, the local storage cannot be accessed
    if (!browser) {
        return undefined;
    }

    const jwt = localStorage.getItem("token");
    if (jwt) {
        return jwtDecode(jwt) as User;
    }

    // When no JWT is stored, redirect to the sign-in page
    if (redirectOnMissing) {
        goto("/signin");
    }
    return undefined;
}
