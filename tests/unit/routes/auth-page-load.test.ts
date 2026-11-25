import { describe, expect, test } from "vitest";
import { isRedirect } from "@sveltejs/kit";
import { AuthenticationStatus } from "@se-uulm/snowballr-grpc-client/authentication";
import { load as loadSignIn } from "#routes/(auth)/signin/+page.js";
import { load as loadSignUp } from "#routes/(auth)/signup/+page.js";
import { load as loadVerifyEmail } from "#routes/(auth)/verifyemail/+page.js";
import { mockApiCall, mockFailedApiCall } from "#tests/setupTest.js";

type AnyLoad = (event: never) => unknown;

async function runLoad(load: AnyLoad): Promise<unknown> {
    const event = { url: new URL("http://localhost/page?token=abc") };
    return await load(event as never);
}

/** Runs the loader and returns what it threw, or fails if it didn't throw. */
async function loadAndCatch(load: AnyLoad): Promise<unknown> {
    try {
        await runLoad(load);
    } catch (error) {
        return error;
    }
    throw new Error("Expected the loader to throw");
}

const loaders: [string, AnyLoad][] = [
    ["sign-in", loadSignIn],
    ["sign-up", loadSignUp],
    ["verify-email", loadVerifyEmail],
];

describe.each(loaders)("The %s page loader", (_, load) => {
    test("When the user is already signed in, then it redirects to the home page", async () => {
        mockApiCall("getAuthenticationStatus", {
            authenticationStatus: AuthenticationStatus.AUTHENTICATED,
        });

        const error = await loadAndCatch(load);

        expect(isRedirect(error)).toBe(true);
        expect(error).toMatchObject({ status: 307, location: "/" });
    });

    test("When the user is not signed in, then it doesn't redirect", async () => {
        mockApiCall("getAuthenticationStatus", {
            authenticationStatus: AuthenticationStatus.UNAUTHENTICATED,
        });
        mockApiCall("verifyEmail", {});

        await expect(runLoad(load)).resolves.toBeDefined();
    });

    test("When the authentication status can't be loaded, then it doesn't redirect", async () => {
        mockFailedApiCall("getAuthenticationStatus", "backend down");
        mockApiCall("verifyEmail", {});

        await expect(runLoad(load)).resolves.toBeDefined();
    });
});

describe("The verify-email page loader", () => {
    test("When the user is already signed in, then no verification request is sent", async () => {
        mockApiCall("getAuthenticationStatus", {
            authenticationStatus: AuthenticationStatus.AUTHENTICATED,
        });
        const verifyCall = mockApiCall("verifyEmail", {});

        await loadAndCatch(loadVerifyEmail);

        expect(verifyCall).not.toHaveBeenCalled();
    });

    test("When the user is not signed in, then the token from the link is verified", async () => {
        mockApiCall("getAuthenticationStatus", {
            authenticationStatus: AuthenticationStatus.UNAUTHENTICATED,
        });
        const verifyCall = mockApiCall("verifyEmail", {});

        const data = (await runLoad(loadVerifyEmail)) as {
            verificationPromise: Promise<void>;
        };

        await expect(data.verificationPromise).resolves.toBeUndefined();
        expect(verifyCall).toHaveBeenCalledExactlyOnceWith({ token: "abc" });
    });
});
