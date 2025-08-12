import { type User } from "$lib/model/api/user";
import { backendService, setFetch } from "$lib/grpc-api";
import type { LayoutLoad } from "./$types";
import { Nothing } from "$lib/model/api/base";
import { AuthenticationStatus } from "$lib/model/api/authentication";
import { goto } from "$app/navigation";
import { getCachedUser, setCachedUser, USER_DEPENDENCY_KEY } from "$lib/current-user/userCache";
import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";

export const ssr = false;

const PUBLIC_PATHS = ["/signin", "/signup", "/resetpassword", "/verifyemail"];

export const load: LayoutLoad = async ({ depends, url, fetch }) => {
    depends(USER_DEPENDENCY_KEY);
    setFetch(fetch);

    // Allow access to public paths without checks
    if (PUBLIC_PATHS.includes(url.pathname)) {
        setCachedUser(null);
        return { user: null };
    }

    const authStatusCall = await backendService.getAuthenticationStatus(Nothing).then(
        (x) => x,
        () => undefined,
    );

    // Redirect on gRPC/network failure
    if (authStatusCall === undefined) {
        console.error("Authentication status could not be determined. Redirecting to sign-in.");
        return await redirectToSignIn();
    }

    // Redirect on backend business logic failure
    let errorCodeValue = GrpcStatusCode[authStatusCall.status.code as keyof typeof GrpcStatusCode];
    if (errorCodeValue !== GrpcStatusCode.OK) {
        console.error(
            `Authentication status call failed with status: ${authStatusCall.status.code}. Redirecting to sign-in.`,
        );
        return await redirectToSignIn();
    }

    const authStatus = authStatusCall.response.authenticationStatus;

    if (authStatus === AuthenticationStatus.ACCESS_TOKEN_EXPIRED) {
        try {
            const renewResponse = await backendService.renewSession(Nothing);
            errorCodeValue =
                GrpcStatusCode[authStatusCall.status.code as keyof typeof GrpcStatusCode];
            if (errorCodeValue !== GrpcStatusCode.OK) {
                console.error(`Session renewal failed with status: ${renewResponse.status.code}`);
                return await redirectToSignIn();
            }
            // Renewal successful, proceed to fetch current user
        } catch (error) {
            console.error(`Session renewal failed: ${error}`);
            return await redirectToSignIn();
        }
    } else if (authStatus !== AuthenticationStatus.AUTHENTICATED) {
        return await redirectToSignIn();
    }

    // If the user is cached, return it
    const cachedUser = getCachedUser();
    if (cachedUser) return { user: cachedUser };

    try {
        const user: User = await backendService.getCurrentUser(Nothing).response;
        setCachedUser(user);
        return { user };
    } catch (error) {
        console.error(`Current user could not be loaded ${error}`);
        return await redirectToSignIn();
    }
};

/**
 * Redirects to the sign-in page and clears the user cache.
 * This function is used when the user is not authenticated or when an error occurs
 * that implies the user is not authenticated.
 *
 * @returns An empty user object.
 */
async function redirectToSignIn() {
    setCachedUser(null);
    await goto("/signin");
    return { user: null };
}
