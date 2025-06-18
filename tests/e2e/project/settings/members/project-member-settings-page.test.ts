import { test } from "./project-members-settings-page-fixtures";
import { expect } from "@playwright/test";
import { getNameOfCurrentUser } from "$tests/e2e/utils/helper/helper";
import { getName } from "$lib/utils/common-helper";

test.describe("Project Member Settings Navigation", () => {
    test("When navigating to the project member settings, then the page is displayed", async ({
        page,
        projectMembersSettingsPage,
        homePage,
        projectNavigationBar,
        projectSettingsSideBar,
    }) => {
        // Directly navigate to the project member settings
        await page.goto("/");

        await homePage.openProject(projectMembersSettingsPage.projectName);
        await projectNavigationBar.settingsTab.click();
        await projectSettingsSideBar.members.click();
        await expect(projectMembersSettingsPage.openInviteUsersDialogButton).toBeVisible();
    });
});

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

test.describe("Promote Members Tests", () => {
    test("When the current user is listed, then they can't promote themselves to a project admin.", async ({
        projectMembersSettingsPage,
        user,
    }) => {
        // obligatory check for the current user, so that projectMembersSettingsPage is used
        await projectMembersSettingsPage.checkForUser(user!.email, "email");

        await expect(
            projectMembersSettingsPage.getOpenPromoteMemberDialogButton(user!),
        ).toBeVisible();
        await expect(
            projectMembersSettingsPage.getOpenPromoteMemberDialogButton(user!),
        ).toBeDisabled();
        await expect(projectMembersSettingsPage.getOpenPromoteMemberDialogButton(user!)).toHaveText(
            "Role: Admin",
        );
    });

    test.fixme(
        "When the user promotes an invited user, then the user is correctly invited.",
        async () => {},
    );
    test.fixme(
        "When the promote user dialog is opened and cancelled, then the user is not promoted.",
        async ({ projectMembersSettingsPage, promoteMemberDialog }) => {
            await projectMembersSettingsPage.inviteUser(
                projectMembersSettingsPage.userEmail,
                projectMembersSettingsPage,
            );

            await projectMembersSettingsPage.openPromoteMemberDialog({
                email: projectMembersSettingsPage.userEmail,
            });
            await promoteMemberDialog.cancel();
            await expect(promoteMemberDialog.dialog).not.toBeVisible();
            await projectMembersSettingsPage.checkForUser(
                projectMembersSettingsPage.userEmail,
                "email",
            );
            await projectMembersSettingsPage.assertNumberOfProjectMembers({
                all: 2,
                admins: 1,
                members: 1,
                invitees: 1,
                invitedMembers: 1,
                invitedAdmins: 0,
            });
        },
    );

    test.fixme(
        "When other users are listed, then they can be promoted to project admins.",
        async ({ page, projectMembersSettingsPage, promoteMemberDialog }) => {
            await projectMembersSettingsPage.inviteUser(
                projectMembersSettingsPage.userEmail,
                projectMembersSettingsPage,
            );
            await projectMembersSettingsPage.openPromoteMemberDialog({
                email: projectMembersSettingsPage.userEmail,
            });

            await promoteMemberDialog.promote();
            await expect(promoteMemberDialog.dialog).not.toBeVisible();
            await expect(page.getByText(`Promoted John Doe to a Project Admin`)).toBeVisible();
            await projectMembersSettingsPage.checkForUser(
                projectMembersSettingsPage.userEmail,
                "email",
            );
            await expect(
                projectMembersSettingsPage.getOpenPromoteMemberDialogButton({
                    email: projectMembersSettingsPage.userEmail,
                }),
            ).toHaveText("Role: Admin");
            await expect(
                projectMembersSettingsPage.getOpenRemoveMemberDialogButton({
                    email: projectMembersSettingsPage.userEmail,
                }),
            ).toBeDisabled();
            await projectMembersSettingsPage.assertNumberOfProjectMembers({
                all: 2,
                admins: 2,
                members: 0,
                invitees: 1,
                invitedAdmins: 1,
                invitedMembers: 0,
            });
        },
    );
});

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
