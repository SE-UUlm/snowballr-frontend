import { backendService } from "$lib/grpc-api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }) => {
    const token = url.searchParams.get("token");

    if (!token) {
        return {
            acceptancePromise: Promise.reject({
                errorTitle: "Accepting the Project Invitation Failed",
                errorDetails:
                    "The acceptance link is missing a token. Please check the link provided in your email.",
            }),
        };
    }

    return {
        acceptancePromise: backendService.acceptProjectInvitation({ token }).response,
    };
};
