import { expect } from "@playwright/test";
import { test } from "./fixtures/project-members-settings-fixtures";
import type { DevProjectMemberSettingsPage } from "./pom/project-member-settings-page-model";
import { DevRemoveMemberDialog } from "./pom/remove-member-dialog-model";

test.describe("Removing members from a project", () => {
    async function inviteUser(
        email: string,
        projectMembersSettingsPage: DevProjectMemberSettingsPage,
    ) {
        await projectMembersSettingsPage.openInviteUsersDialog();
        await projectMembersSettingsPage.inviteUser(email);
        await projectMembersSettingsPage.inviteUsersDialogButton.click();
        await expect(projectMembersSettingsPage.inviteUsersDialog).not.toBeVisible();
        await projectMembersSettingsPage.assertNumberOfProjectMembers({
            all: 2,
            admins: 1,
            invitees: 1,
        });
    }

    test("When the current user is listed, then they can't remove themselves from the project.", async ({
        page,
        projectMembersSettingsPage,
        user,
    }) => {
        // obligatory check for the current user, so that projectMembersSettingsPage is used
        await projectMembersSettingsPage.checkForUser(user.email, "email");

        const dialog = new DevRemoveMemberDialog(page, user);
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
            invitees: 0,
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
            invitees: 1,
        });
    });
});
