import { verifyEmail } from "#lib/api/auth.js";
import { redirectIfAuthenticated } from "#lib/utils/auth-redirect.js";
import type { PageLoad } from "./$types";
import { createActionError } from "#lib/model/action-error.js";

export const load: PageLoad = async ({ url }) => {
    // Only verify if the user is not signed in yet
    await redirectIfAuthenticated();

    const token = url.searchParams.get("token");

    if (!token) {
        return {
            verificationPromise: Promise.reject(
                createActionError("Email Verification Failed", {
                    customDetails:
                        "The verification link is missing a token. Please check the link provided in your email.",
                }),
            ),
        };
    }

    return {
        verificationPromise: verifyEmail(token),
    };
};
