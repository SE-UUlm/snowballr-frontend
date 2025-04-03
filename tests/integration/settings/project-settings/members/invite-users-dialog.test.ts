import { describe, test, beforeEach, afterEach, vi, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import InviteUsersDialog from "$lib/components/composites/settings/project-settings/members/InviteUsersDialog.svelte";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { Members, Users } from "$tests/example-data";
import userEvent from "@testing-library/user-event";

describe("InviteUsersDialog", () => {
    beforeEach(() => {
        mockApiCall("inviteUserToProject", {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("When all props are provided, then it renders correctly", async () => {
        render(InviteUsersDialog, {
            target: document.body,
            props: {
                user: Users.johnDoe,
                projectId: "1",
                loadingMembers: Promise.resolve([]),
            },
        });

        expect(screen.getByText("Invite Users")).toBeInTheDocument();
    });

    test("When trigger is clicked, then dialog is opened", async () => {
        const user = userEvent.setup();
        render(InviteUsersDialog, {
            target: document.body,
            props: {
                user: Users.johnDoe,
                projectId: "1",
                loadingMembers: Promise.resolve([]),
            },
        });

        const trigger = await screen.findByTestId("dialog-trigger");
        expect(trigger).toBeInTheDocument();
        expect(trigger).not.toHaveAttribute("disabled");
        await waitFor(async () => user.click(trigger));

        expect(trigger).toHaveAttribute("aria-expanded", "true");
        expect(trigger).toHaveAttribute("data-state", "open");

        const inviteUsersTexts = screen.getAllByText("Invite Users");
        expect(inviteUsersTexts).toHaveLength(3);
        expect(
            screen.getByText("Search for an existing user or invite a new user by email."),
        ).toBeInTheDocument();
    });

    test("When a user is invited successfully, then a success message is displayed", async () => {
        const user = userEvent.setup();
        let invitedUsers: string[] = [];
        render(InviteUsersDialog, {
            target: document.body,
            props: {
                user: Users.johnDoe,
                projectId: "1",
                loadingMembers: Promise.resolve([]),
                onUsersInvited: (users: string[]) => {
                    invitedUsers = users;
                },
            },
        });

        const trigger = await screen.findByTestId("dialog-trigger");
        await waitFor(async () => user.click(trigger));

        const emailInput = screen.getByRole("textbox");
        await user.type(emailInput, Members.demoMember1.user.email);
        await user.tab();

        const inviteButton = screen.getByTestId("invite-users-button");
        await user.click(inviteButton);

        expect(invitedUsers).toEqual([Members.demoMember1.user.email]);
    });

    test("When inviting a user fails, then an error message is displayed", async () => {
        mockFailedApiCall("inviteUserToProject");

        const user = userEvent.setup();
        render(InviteUsersDialog, {
            target: document.body,
            props: {
                user: Users.johnDoe,
                projectId: "1",
                loadingMembers: Promise.resolve([]),
            },
        });

        const trigger = await screen.findByTestId("dialog-trigger");
        await waitFor(async () => user.click(trigger));

        const emailInput = screen.getByRole("textbox");
        await user.type(emailInput, Members.demoMember1.user.email);
        await user.tab();

        const inviteButton = screen.getByTestId("invite-users-button");
        await user.click(inviteButton);

        expect(
            screen.getByText("Something went wrong while inviting the users."),
        ).toBeInTheDocument();
    });
});
