import { backendService } from "$lib/grpc-api";
import { createActionError } from "$lib/model/action-error";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }) => {
    const token = url.searchParams.get("token");

    if (!token) {
        return {
            acceptancePromise: Promise.reject(
                createActionError("Accepting the Project Invitation Failed", {
                    customDetails:
                        "The acceptance link is missing a token. Please check the link provided in your email.",
                }),
            ),
        };
    }

    return {
        acceptancePromise: backendService.acceptProjectInvitation({ token }).response,
    };
};
