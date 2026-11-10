import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { AuthenticationStatus } from "snowballr-api/authentication";
import VerifyEmailPage from "../../../../src/routes/(auth)/verifyemail/+page.svelte";
import { load } from "../../../../src/routes/(auth)/verifyemail/+page";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

/**
 * Runs the page's loader for the given URL and renders the page with the loaded data, because the
 * page shows whatever the loader's verification promise rejects with.
 */
async function openVerificationLink(link: string) {
    mockApiCall("getAuthenticationStatus", {
        authenticationStatus: AuthenticationStatus.UNAUTHENTICATED,
    });
    const data = await load({ url: new URL(link) } as Parameters<typeof load>[0]);
    render(VerifyEmailPage, { target: document.body, props: { data } as never });
}

describe("Verify-email page", () => {
    test("When the token is invalid, then the link is reported as invalid", async () => {
        mockFailedApiCall("verifyEmail", "invalid token", "INVALID_ARGUMENT");

        await openVerificationLink("http://localhost/verifyemail?token=abc");

        expect(await screen.findByText(/This verification link is invalid/)).toBeInTheDocument();
    });

    test("When the token is unknown, then the link is reported as expired", async () => {
        mockFailedApiCall("verifyEmail", "unknown token", "NOT_FOUND");

        await openVerificationLink("http://localhost/verifyemail?token=abc");

        expect(await screen.findByText(/has probably expired/)).toBeInTheDocument();
    });

    test("When verifying fails for another reason, then a server error is shown", async () => {
        mockFailedApiCall("verifyEmail", "backend down", "UNAVAILABLE");

        await openVerificationLink("http://localhost/verifyemail?token=abc");

        expect(await screen.findByText("Server Error")).toBeInTheDocument();
    });

    test("When the link has no token, then the missing token is reported", async () => {
        await openVerificationLink("http://localhost/verifyemail");

        expect(await screen.findByText(/missing a token/)).toBeInTheDocument();
    });
});
