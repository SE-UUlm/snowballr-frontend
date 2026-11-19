import { describe, test, beforeEach, afterEach, vi, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import InviteUsersDialog from "$lib/components/composites/settings/project-settings/members/InviteUsersDialog.svelte";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { Members, Users } from "$tests/example-data";
import userEvent from "@testing-library/user-event";
import { mockUserContext, waitForDialogFocus } from "$tests/integration/test-helper";

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

    test("When dialog is closed, then entered invitation candidates are deleted", async () => {
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
        await waitForDialogFocus();

        const input = screen.getByRole("textbox");
        await user.type(input, Members.demoMember1.user!.email);
        await user.tab();

        const chip = screen.getByText(Members.demoMember1.user!.firstName, { exact: false });
        expect(chip).toBeInTheDocument();

        const cancelButton = screen.getByRole("button", { name: "Cancel" });
        await user.click(cancelButton);

        await waitFor(async () => user.click(trigger));
        const chipAfterCancel = screen.queryByText(Members.demoMember1.user!.firstName, {
            exact: false,
        });
        expect(chipAfterCancel).not.toBeInTheDocument();
    });

    test("When a user is invited successfully, then a success message is displayed", async () => {
        const inviteCall = mockApiCall("inviteUserToProject", {});
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
        await waitForDialogFocus();

        const emailInput = screen.getByRole("textbox");
        await user.type(emailInput, Members.demoMember1.user!.email);
        await user.tab();

        const inviteButton = screen.getByRole("button", { name: "Send Invitations" });
        await user.click(inviteButton);

        expect(invitedUsers).toEqual([Members.demoMember1.user!.email]);
        expect(inviteCall).toHaveBeenCalledExactlyOnceWith({
            projectId: "1",
            userEmail: Members.demoMember1.user!.email,
        });
    });

    describe("When some invitations fail", () => {
        const succeedingEmail = Members.demoMember1.user!.email;
        const failingEmail = Members.demoMember2.user!.email;

        /** Fails the invitation of `failingEmail` and lets every other one succeed. */
        function mockPartiallyFailingInvitations() {
            const inviteCall = mockApiCall("inviteUserToProject", {});
            const inviteSucceeds = inviteCall.getMockImplementation()!;
            const inviteFails = mockFailedApiCall("inviteUserToProject").getMockImplementation()!;
            return inviteCall.mockImplementation((request, options) =>
                request.userEmail === failingEmail
                    ? inviteFails(request, options)
                    : inviteSucceeds(request, options),
            );
        }

        async function inviteBothUsers() {
            const user = userEvent.setup();
            const trigger = await screen.findByRole("button", { name: "Invite Users" });
            await waitFor(async () => user.click(trigger));
            await waitForDialogFocus();

            const emailInput = screen.getByRole("textbox");
            for (const email of [succeedingEmail, failingEmail]) {
                await user.type(emailInput, email);
                await user.tab();
                await user.click(emailInput);
            }
            await user.click(screen.getByRole("button", { name: "Send Invitations" }));
            expect(
                await screen.findByRole("alert", { name: "Invitation Failed" }),
            ).toBeInTheDocument();
        }

        test("When the users were invited, then the callback gets the emails that were invited", async () => {
            mockPartiallyFailingInvitations();
            const onUsersInvited = vi.fn();
            render(InviteUsersDialog, {
                target: document.body,
                props: { projectId: "1", loadingMembers: Promise.resolve([]), onUsersInvited },
                context: mockUserContext,
            });

            await inviteBothUsers();

            expect(onUsersInvited).toHaveBeenCalledExactlyOnceWith([succeedingEmail]);
        });

        test("When the user tries again, then only the failed invitations are sent again", async () => {
            mockPartiallyFailingInvitations();
            const onUsersInvited = vi.fn();
            render(InviteUsersDialog, {
                target: document.body,
                props: { projectId: "1", loadingMembers: Promise.resolve([]), onUsersInvited },
                context: mockUserContext,
            });
            await inviteBothUsers();
            onUsersInvited.mockClear();

            const retriedInviteCall = mockApiCall("inviteUserToProject", {});
            const user = userEvent.setup();
            await user.click(screen.getByRole("button", { name: "Send Invitations" }));

            await waitFor(() =>
                expect(onUsersInvited).toHaveBeenCalledExactlyOnceWith([failingEmail]),
            );
            expect(retriedInviteCall).toHaveBeenCalledExactlyOnceWith({
                projectId: "1",
                userEmail: failingEmail,
            });
        });
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
        await waitForDialogFocus();

        const emailInput = screen.getByRole("textbox");
        await user.type(emailInput, Members.demoMember1.user!.email);
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
