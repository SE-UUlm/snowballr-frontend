import { expect } from "@playwright/test";
import { test } from "./project-members-settings-page-fixtures";

test.describe("Remove Members Tests", () => {
    test("When the current user is listed, then they can't remove themselves from the project.", async ({
        projectMembersSettingsPage,
        user,
    }) => {
        // obligatory check for the current user, so that projectMembersSettingsPage is used
        await projectMembersSettingsPage.checkForUser(user!.email, "email");

        await expect(
            projectMembersSettingsPage.getOpenRemoveMemberDialogButton(user!),
        ).toBeVisible();
        await expect(
            projectMembersSettingsPage.getOpenRemoveMemberDialogButton(user!),
        ).toBeDisabled();
    });

    test("When other users are listed, then they can be removed from the project.", async ({
        projectMembersSettingsPage,
        page,
    }) => {
        const userEmail = "john.doe@example.com";
        await projectMembersSettingsPage.inviteUser(userEmail, projectMembersSettingsPage);

        await projectMembersSettingsPage.openRemoveMemberDialog({ email: userEmail });
        await projectMembersSettingsPage.removeMemberDialog.remove();
        await expect(projectMembersSettingsPage.removeMemberDialog.dialog).not.toBeVisible();
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
        projectMembersSettingsPage,
    }) => {
        const userEmail = "john.doe@example.com";
        await projectMembersSettingsPage.inviteUser(userEmail, projectMembersSettingsPage);

        await projectMembersSettingsPage.openRemoveMemberDialog({ email: userEmail });
        await projectMembersSettingsPage.removeMemberDialog.cancel();
        await expect(projectMembersSettingsPage.removeMemberDialog.dialog).not.toBeVisible();
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
        await projectMembersSettingsPage.inviteUser(user.email, projectMembersSettingsPage, true);

        await projectMembersSettingsPage.openRemoveMemberDialog(user);
        await projectMembersSettingsPage.removeMemberDialog.remove();
        await expect(projectMembersSettingsPage.removeMemberDialog.dialog).not.toBeVisible();
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
        await projectMembersSettingsPage.inviteUser(user.email, projectMembersSettingsPage, true);
        await expect(page.getByText(`Invited ${user.email} to the project`).last()).toBeVisible();
        await projectMembersSettingsPage.checkForUser("John Doe", "name");
    });
});
