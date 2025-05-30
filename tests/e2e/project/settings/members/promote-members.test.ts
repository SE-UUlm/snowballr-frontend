import { expect } from "@playwright/test";
import { test } from "./project-members-settings-fixtures";
import { DevPromoteMemberDialog } from "./promote-member-dialog-model";

test.describe("Promoting members to project admins", () => {
    // async function inviteUser(
    //     email: string,
    //     projectMembersSettingsPage: DevProjectMemberSettingsPage,
    //     useSuggestion: boolean = false,
    // ) {
    //     await projectMembersSettingsPage.openInviteUsersDialog();
    //     await projectMembersSettingsPage.inviteUser(email, useSuggestion);
    //     await projectMembersSettingsPage.inviteUsersDialogButton.click();
    //     await expect(projectMembersSettingsPage.inviteUsersDialog).not.toBeVisible();
    //     await projectMembersSettingsPage.assertNumberOfProjectMembers({
    //         all: 2,
    //         admins: 1,
    //         members: 1,
    //         invitees: 1,
    //         invitedAdmins: 0,
    //         invitedMembers: 1,
    //     });
    // }

    test("When the current user is listed, then they can't promote themselves to a project admin.", async ({
        page,
        projectMembersSettingsPage,
        user,
    }) => {
        // obligatory check for the current user, so that projectMembersSettingsPage is used
        await projectMembersSettingsPage.checkForUser(user!.email, "email");

        const dialog = new DevPromoteMemberDialog(page, user!);
        await expect(dialog.openButton).toBeVisible();
        await expect(dialog.openButton).toBeDisabled();
        await expect(dialog.openButton).toHaveText("Role: Admin");
    });

    // TODO: Currently, we cannot promote invited users. Only when they are in the project.
    // test("When the promote user dialog is opened and cancelled, then the user is not promoted.", async ({
    //     page,
    //     projectMembersSettingsPage,
    // }) => {
    //     const userEmail = "john.doe@example.com";
    //     await inviteUser(userEmail, projectMembersSettingsPage);

    //     const dialog = new DevPromoteMemberDialog(page, { email: userEmail });

    //     await dialog.open();
    //     await dialog.cancel();
    //     await expect(dialog.dialog).not.toBeVisible();
    //     await projectMembersSettingsPage.checkForUser(userEmail, "email");
    //     await projectMembersSettingsPage.assertNumberOfProjectMembers({
    //         all: 2,
    //         admins: 1,
    //         members: 1,
    //         invitees: 1,
    //         invitedMembers: 1,
    //         invitedAdmins: 0,
    //     });
    // });

    // test("When other users are listed, then they can be promoted to project admins.", async ({
    //     projectMembersSettingsPage,
    //     page,
    // }) => {
    //     const userEmail = "john.doe@example.com";
    //     await inviteUser(userEmail, projectMembersSettingsPage);

    //     const dialog = new DevPromoteMemberDialog(page, { email: userEmail });

    //     await dialog.open();
    //     await dialog.promote();
    //     await expect(dialog.dialog).not.toBeVisible();
    //     await expect(page.getByText(`Promoted John Doe to a Project Admin`)).toBeVisible();
    //     await projectMembersSettingsPage.checkForUser(userEmail, "email");
    //     await expect(dialog.openButton).toHaveText("Role: Admin");
    //     const removeMemberDialog = new DevRemoveMemberDialog(page, { email: userEmail });
    //     await expect(removeMemberDialog.openButton).toBeDisabled();
    //     await projectMembersSettingsPage.assertNumberOfProjectMembers({
    //         all: 2,
    //         admins: 2,
    //         members: 0,
    //         invitees: 1,
    //         invitedAdmins: 1,
    //         invitedMembers: 0,
    //     });
    // });
});
