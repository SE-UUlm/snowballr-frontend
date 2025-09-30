import { goto } from "$app/navigation";
import { backendService } from "$lib/grpc-api";
import { AuthenticationStatus } from "$lib/model/api/authentication";
import { Nothing } from "$lib/model/api/base";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }) => {
    // Check if the user is already authenticated (only verify if user is not authenticated)
    try {
        const authStatus = (await backendService.getAuthenticationStatus(Nothing).response)
            .authenticationStatus;
        if (authStatus === AuthenticationStatus.AUTHENTICATED) {
            await goto("/");
        }
    } catch (error) {
        console.error("There was an error acquiring the authentication status:", error);
    }

    const token = url.searchParams.get("token");

    if (!token) {
        return {
            verificationPromise: Promise.reject({
                errorTitle: "Email Verification Failed",
                errorDetails: "The verification link is missing a token. Please check the link provided in your email.",
            }),
        };
    }

    return {
        verificationPromise: backendService.verifyEmail({ token }).response,
    };
};
