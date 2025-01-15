import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { jwtDecode } from "jwt-decode";
import type { LayoutLoad } from "./$types";
import type { User } from "$lib/model/backend";

export const ssr = false;
export const csr = true;

export const load: LayoutLoad = async () => {
    // If the script is not running in the browser, the local storage cannot be accessed
    if (!browser) {
        await goto("/signin");
    }

    const jwt = localStorage.getItem("token");
    if (jwt) {
        return {
            user: jwtDecode(jwt) as User,
        };
    }

    // When no JWT is stored, redirect to the sign-in page
    await goto("/signin");

    // The page should navigate before this point
    throw new Error("This point should never be reached");
};
