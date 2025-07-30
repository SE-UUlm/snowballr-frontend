import { describe, test, beforeEach, afterEach, vi, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import InviteUsersDialog from "$lib/components/composites/settings/project-settings/members/InviteUsersDialog.svelte";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { Members, Users } from "$tests/example-data";
import userEvent from "@testing-library/user-event";
import { mockUserContext } from "$tests/integration/test-helper";

describe("InviteUsersDialog", () => {
    beforeEach(() => {
        mockApiCall("inviteUserToProject", {});
        mockApiCall("getInviteCandidates", {
            users: [Users.johnDoe, Users.janeDoe, Users.henryMoore],
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("When all props are provided, then the invite users dialog renders correctly", async () => {
        render(InviteUsersDialog, {
            target: document.body,
            props: {
                projectId: "1",
                loadingMembers: Promise.resolve([]),
            },
            context: mockUserContext,
        });

        expect(screen.getByText("Invite Users")).toBeInTheDocument();
    });

    test("When trigger is clicked, then the dialog is opened", async () => {
        const user = userEvent.setup();
        render(InviteUsersDialog, {
            target: document.body,
            props: {
                projectId: "1",
                loadingMembers: Promise.resolve([]),
            },
            context: mockUserContext,
        });

        const trigger = await screen.findByRole("button", { name: "Invite Users" });
        expect(trigger).toBeInTheDocument();
        await waitFor(() => expect(trigger).not.toHaveAttribute("disabled"));
        await waitFor(async () => user.click(trigger));

        expect(trigger).toHaveAttribute("aria-expanded", "true");
        expect(trigger).toHaveAttribute("data-state", "open");

        const inviteUsersTexts = screen.getAllByText("Invite Users");
        expect(inviteUsersTexts).toHaveLength(2);
        expect(
            screen.getByText("Search for an existing user or invite a new user by email."),
        ).toBeInTheDocument();
        const actionButton = screen.getByRole("button", { name: "Send Invitations" });
        expect(actionButton).toBeInTheDocument();
        expect(actionButton).toHaveAttribute("disabled");
    });

    test("When a user is invited successfully, then a success message is displayed", async () => {
        const user = userEvent.setup();
        let invitedUsers: string[] = [];
        render(InviteUsersDialog, {
            target: document.body,
            props: {
                projectId: "1",
                loadingMembers: Promise.resolve([]),
                onUsersInvited: (users: string[]) => {
                    invitedUsers = users;
                },
            },
            context: mockUserContext,
        });

        const trigger = await screen.findByRole("button", { name: "Invite Users" });
        await waitFor(async () => user.click(trigger));

        const emailInput = screen.getByRole("textbox");
        await user.type(emailInput, Members.demoMember1.user.email);
        await user.tab();

        const inviteButton = screen.getByRole("button", { name: "Send Invitations" });
        await user.click(inviteButton);

        expect(invitedUsers).toEqual([Members.demoMember1.user.email]);
    });

    test("When inviting a user fails, then an error message is displayed", async () => {
        mockFailedApiCall("inviteUserToProject");

        const user = userEvent.setup();
        render(InviteUsersDialog, {
            target: document.body,
            props: {
                projectId: "1",
                loadingMembers: Promise.resolve([]),
            },
            context: mockUserContext,
        });

        const trigger = await screen.findByRole("button", { name: "Invite Users" });
        await waitFor(async () => user.click(trigger));

        const emailInput = screen.getByRole("textbox");
        await user.type(emailInput, Members.demoMember1.user.email);
        await user.tab();

        const inviteButton = screen.getByRole("button", { name: "Send Invitations" });
        await user.click(inviteButton);

        expect(await screen.findByRole("alert", { name: "Invitation Failed" })).toBeInTheDocument();
        expect(
            screen.getByText(
                "Something went wrong while inviting the users. Please make sure your internet connection is stable, then try again.",
            ),
        ).toBeInTheDocument();
    });
});
