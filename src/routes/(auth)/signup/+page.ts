import { redirectIfAuthenticated } from "#lib/utils/auth-redirect.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
    await redirectIfAuthenticated();
    return {};
};
