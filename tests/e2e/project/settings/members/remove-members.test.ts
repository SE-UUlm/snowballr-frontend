import { expect } from "@playwright/test";
import { test } from "./project-members-settings-fixtures";
import type { DevProjectMemberSettingsPage } from "./project-member-settings-page-model";
import { DevRemoveMemberDialog } from "./remove-member-dialog-model";

test.describe("Removing members from a project", () => {
    async function inviteUser(
        email: string,
        projectMembersSettingsPage: DevProjectMemberSettingsPage,
        useSuggestion: boolean = false,
    ) {
        await projectMembersSettingsPage.openInviteUsersDialog();
        await projectMembersSettingsPage.inviteUser(email, useSuggestion);
        await projectMembersSettingsPage.inviteUsersDialogButton.click();
        await expect(projectMembersSettingsPage.inviteUsersDialog).not.toBeVisible();
        await projectMembersSettingsPage.assertNumberOfProjectMembers({
            all: 2,
            admins: 1,
            members: 1,
            invitees: 1,
            invitedAdmins: 0,
            invitedMembers: 1,
        });
    }

    test("When the current user is listed, then they can't remove themselves from the project.", async ({
        page,
        projectMembersSettingsPage,
        user,
    }) => {
        // obligatory check for the current user, so that projectMembersSettingsPage is used
        await projectMembersSettingsPage.checkForUser(user!.email, "email");

        const dialog = new DevRemoveMemberDialog(page, user!);
        await expect(dialog.openButton).toBeVisible();
        await expect(dialog.openButton).toBeDisabled();
    });

    test("When other users are listed, then they can be removed from the project.", async ({
        projectMembersSettingsPage,
        page,
    }) => {
        const userEmail = "john.doe@example.com";
        await inviteUser(userEmail, projectMembersSettingsPage);

        const dialog = new DevRemoveMemberDialog(page, { email: userEmail });

        await dialog.open();
        await dialog.remove();
        await expect(dialog.dialog).not.toBeVisible();
        await expect(page.getByText(`Removed ${userEmail} from the project`)).toBeVisible();
        await projectMembersSettingsPage.checkForUser(userEmail, "email", false);
        await projectMembersSettingsPage.assertNumberOfProjectMembers({
            all: 1,
            admins: 1,
            members: 0,
            invitees: 0,
            invitedAdmins: 0,
            invitedMembers: 0,
        });
    });

    test("When the remove user dialog is opened and cancelled, then the user is not removed.", async ({
        page,
        projectMembersSettingsPage,
    }) => {
        const userEmail = "john.doe@example.com";
        await inviteUser(userEmail, projectMembersSettingsPage);

        const dialog = new DevRemoveMemberDialog(page, { email: userEmail });

        await dialog.open();
        await dialog.cancel();
        await expect(dialog.dialog).not.toBeVisible();
        await projectMembersSettingsPage.checkForUser(userEmail, "email");
        await projectMembersSettingsPage.assertNumberOfProjectMembers({
            all: 2,
            admins: 1,
            members: 1,
            invitees: 1,
            invitedAdmins: 0,
            invitedMembers: 1,
        });
    });

    test("When a registered user is removed from the project, then they can be invited again", async ({
        page,
        projectMembersSettingsPage,
        apiClient,
    }) => {
        const user = {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            password: "password",
        };
        await apiClient.register(user);
        await inviteUser(user.email, projectMembersSettingsPage, true);

        const dialog = new DevRemoveMemberDialog(page, user);

        await dialog.open();
        await dialog.remove();
        await expect(dialog.dialog).not.toBeVisible();
        await expect(page.getByText(`Removed John Doe from the project`)).toBeVisible();
        await projectMembersSettingsPage.checkForUser("John Doe", "name", false);
        await projectMembersSettingsPage.assertNumberOfProjectMembers({
            all: 1,
            admins: 1,
            members: 0,
            invitees: 0,
            invitedAdmins: 0,
            invitedMembers: 0,
        });

        // Invite the user again, this fails when no suggestion is shown
        await inviteUser(user.email, projectMembersSettingsPage, true);
        await expect(page.getByText(`Invited ${user.email} to the project`).last()).toBeVisible();
        await projectMembersSettingsPage.checkForUser("John Doe", "name");
    });
});
