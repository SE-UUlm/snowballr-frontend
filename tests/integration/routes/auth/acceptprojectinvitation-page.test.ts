import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import AcceptProjectInvitationPage from "../../../../src/routes/(auth)/acceptprojectinvitation/+page.svelte";
import { load } from "../../../../src/routes/(auth)/acceptprojectinvitation/+page";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

/**
 * Runs the page's loader for the given URL and renders the page with the loaded data, because the
 * page shows whatever the loader's acceptance promise rejects with.
 */
async function openAcceptanceLink(link: string) {
    const data = await load({ url: new URL(link) } as Parameters<typeof load>[0]);
    render(AcceptProjectInvitationPage, { target: document.body, props: { data } as never });
}

describe("Accept-project-invitation page", () => {
    test("When the token is accepted, then the token is sent and a success message is shown", async () => {
        const acceptCall = mockApiCall("acceptProjectInvitation", {});

        await openAcceptanceLink("http://localhost/acceptprojectinvitation?token=abc");

        expect(await screen.findByText("Success!")).toBeInTheDocument();
        expect(acceptCall).toHaveBeenCalledExactlyOnceWith({ token: "abc" });
    });

    test("When the token is invalid, then the link is reported as invalid", async () => {
        mockFailedApiCall("acceptProjectInvitation", "invalid token", "INVALID_ARGUMENT");

        await openAcceptanceLink("http://localhost/acceptprojectinvitation?token=abc");

        expect(await screen.findByText(/This acceptance link is invalid/)).toBeInTheDocument();
    });

    test("When the token is unknown, then the link is reported as expired", async () => {
        mockFailedApiCall("acceptProjectInvitation", "unknown token", "NOT_FOUND");

        await openAcceptanceLink("http://localhost/acceptprojectinvitation?token=abc");

        expect(await screen.findByText(/has probably expired/)).toBeInTheDocument();
    });

    test("When the user isn't registered, then they are asked to register first", async () => {
        mockFailedApiCall("acceptProjectInvitation", "not registered", "FAILED_PRECONDITION");

        await openAcceptanceLink("http://localhost/acceptprojectinvitation?token=abc");

        expect(
            await screen.findByText("Please register before accepting the invitation."),
        ).toBeInTheDocument();
    });

    test("When accepting fails for another reason, then a server error is shown", async () => {
        mockFailedApiCall("acceptProjectInvitation", "backend down", "UNAVAILABLE");

        await openAcceptanceLink("http://localhost/acceptprojectinvitation?token=abc");

        expect(await screen.findByText("Server Error")).toBeInTheDocument();
    });

    test("When the link has no token, then the missing token is reported", async () => {
        await openAcceptanceLink("http://localhost/acceptprojectinvitation");

        expect(await screen.findByText(/missing a token/)).toBeInTheDocument();
    });
});
