import { expect } from "@playwright/test";
import { test } from "./fixtures/project-members-settings-fixtures";
import { getName } from "$lib/utils/common-helper";
import { getCurrentUser } from "./helper";

test.describe("Inviting users to a project", () => {
    /**
     * Here we test for project members. In the fixture we create a project with one admin and one invitee.
     */

    test("When the members settings page is opened, then the current user is listed as a project admin.", async ({
        page,
        projectMembersSettingsPage,
        user,
    }) => {
        const actualUser = await getCurrentUser(page);

        await projectMembersSettingsPage.checkForUser(`${getName(actualUser)} - You`, "name");
        await projectMembersSettingsPage.checkForUser(user.email, "email");
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

        await expect(projectMembersSettingsPage.inviteUsersDialog).toBeVisible();
    });

    test("When the dialog is opened, then the user can close the dialog.", async ({
        page,
        projectMembersSettingsPage,
        user,
    }) => {
        const actualUser = await getCurrentUser(page);

        await projectMembersSettingsPage.openInviteUsersDialog();
        await projectMembersSettingsPage.inviteUsersDialogCancelButton.click();

        await expect(projectMembersSettingsPage.inviteUsersDialog).not.toBeVisible();

        // Check that the user is still listed as a project admin
        await projectMembersSettingsPage.checkForUser(`${getName(actualUser)} - You`, "name");
        await projectMembersSettingsPage.checkForUser(user.email, "email");
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
        const actualUser = await getCurrentUser(page);

        await projectMembersSettingsPage.openInviteUsersDialog();

        await projectMembersSettingsPage.inviteUser(user.email);
        await projectMembersSettingsPage.inviteUsersDialogButton.click();
        await expect(projectMembersSettingsPage.inviteUsersDialog).not.toBeVisible();
        await expect(page.getByText("User is already invited")).toBeVisible();

        // Check that the user is still listed as a project admin, and no invitation is sent
        await projectMembersSettingsPage.checkForUser(`${getName(actualUser)} - You`, "name");
        await projectMembersSettingsPage.checkForUser(user.email, "email");
        await projectMembersSettingsPage.assertNumberOfProjectMembers({
            all: 1,
            admins: 1,
            invitees: 0,
        });
    });

    test("When a non-existing member is invited, then they are listed on the page", async ({
        page,
        projectMembersSettingsPage,
    }) => {
        await projectMembersSettingsPage.openInviteUsersDialog();

        await projectMembersSettingsPage.inviteUser("jane.doe@example.com");
        await projectMembersSettingsPage.inviteUsersDialogButton.click();
        await expect(projectMembersSettingsPage.inviteUsersDialog).not.toBeVisible();
        await expect(page.getByText("Invited jane.doe@example.com to the project")).toBeVisible();

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

        await projectMembersSettingsPage.inviteUser("invalid-email", false);

        await projectMembersSettingsPage.checkForErrors();
    });
});
