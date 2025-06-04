import { expect } from "@playwright/test";
import { test } from "./project-members-settings-page-fixtures";
import { getName } from "$lib/utils/common-helper";
import { getNameOfCurrentUser } from "../../../utils/helper/helper";

test.describe("Invite User Tests", () => {
    /**
     * Here we test for project members. In the fixture we create a project with one admin and one invitee.
     */

    test("When the members settings page is opened, then the current user is listed as a project admin.", async ({
        page,
        projectMembersSettingsPage,
        user,
    }) => {
        const actualUser = await getNameOfCurrentUser(page);

        await projectMembersSettingsPage.checkForUser(`${getName(actualUser)} - You`, "name");
        await projectMembersSettingsPage.checkForUser(user!.email, "email");
        await projectMembersSettingsPage.assertNumberOfProjectMembers({
            all: 1,
            admins: 1,
            invitees: 0,
        });
    });

    test("When clicking on the 'Invite Users' button, then the dialog for inviting users is opened.", async ({
        projectMembersSettingsPage,
    }) => {
        await projectMembersSettingsPage.openInviteUsersDialog();

        await expect(projectMembersSettingsPage.inviteUsersDialog.dialog).toBeVisible();
    });

    test("When the dialog is opened, then the user can close the dialog.", async ({
        page,
        projectMembersSettingsPage,
        user,
    }) => {
        const actualUser = await getNameOfCurrentUser(page);

        await projectMembersSettingsPage.openInviteUsersDialog();
        await projectMembersSettingsPage.inviteUsersDialog.cancelInviteUsersButton.click();

        await expect(projectMembersSettingsPage.inviteUsersDialog.dialog).not.toBeVisible();

        // Check that the user is still listed as a project admin
        await projectMembersSettingsPage.checkForUser(`${getName(actualUser)} - You`, "name");
        await projectMembersSettingsPage.checkForUser(user!.email, "email");
        await projectMembersSettingsPage.assertNumberOfProjectMembers({
            all: 1,
            admins: 1,
            invitees: 0,
        });
    });

    test("When an already existing member is invited, then the members list doesn't change", async ({
        page,
        projectMembersSettingsPage,
        user,
    }) => {
        const actualUser = await getNameOfCurrentUser(page);

        await projectMembersSettingsPage.openInviteUsersDialog();

        await projectMembersSettingsPage.inviteUsersDialog.fillUserInvite(user!.email);
        await projectMembersSettingsPage.inviteUsersDialog.confirmInviteUsersButton.click();
        await expect(projectMembersSettingsPage.inviteUsersDialog.dialog).not.toBeVisible();
        await expect(projectMembersSettingsPage.userAlreadyInvitedToast).toBeVisible();

        // Check that the user is still listed as a project admin, and no invitation is sent
        await projectMembersSettingsPage.checkForUser(`${getName(actualUser)} - You`, "name");
        await projectMembersSettingsPage.checkForUser(user!.email, "email");
        await projectMembersSettingsPage.assertNumberOfProjectMembers({
            all: 1,
            admins: 1,
            invitees: 0,
        });
    });

    test("When a non-existing member is invited, then they are listed on the page", async ({
        projectMembersSettingsPage,
    }) => {
        await projectMembersSettingsPage.openInviteUsersDialog();

        await projectMembersSettingsPage.inviteUsersDialog.fillUserInvite("jane.doe@example.com");
        await projectMembersSettingsPage.inviteUsersDialog.confirmInviteUsersButton.click();
        await expect(projectMembersSettingsPage.inviteUsersDialog.dialog).not.toBeVisible();
        await expect(
            projectMembersSettingsPage.getUserSuccessFullyInvitedToast("jane.doe@example.com"),
        ).toBeVisible();

        await projectMembersSettingsPage.checkForUser("jane.doe@example.com", "name");
        await projectMembersSettingsPage.checkForUser("jane.doe@example.com", "email");
        await projectMembersSettingsPage.assertNumberOfProjectMembers({
            all: 2,
            admins: 1,
            members: 1,
            invitees: 1,
            invitedMembers: 1,
        });
    });

    test("When the user is invited, but the email address is invalid, then an error message is shown.", async ({
        projectMembersSettingsPage,
    }) => {
        await projectMembersSettingsPage.openInviteUsersDialog();

        await projectMembersSettingsPage.inviteUsersDialog.fillUserInvite("invalid-email", false);

        await projectMembersSettingsPage.checkForErrors();
    });
});
