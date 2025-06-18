import { expect, type Locator, type Page } from "@playwright/test";
import { InviteUserDialogModel } from "$tests/e2e/project/settings/members/models/invite-user-dialog-model";
import { PromoteMemberDialogModel } from "$tests/e2e/project/settings/members/models/promote-member-dialog-model";
import { RemoveMemberDialogModel } from "$tests/e2e/project/settings/members/models/remove-member-dialog-model";

export interface ProjectMemberCounts {
    all: number;
    admins: number;
    members: number;
    invitees: number;
    invitedAdmins: number;
    invitedMembers: number;
}

export class ProjectMemberSettingsPageModel {
    readonly page: Page;
    readonly heading: Locator;

    readonly inviteUsersDialog: InviteUserDialogModel;
    promoteMemberDialog: PromoteMemberDialogModel;
    removeMemberDialog: RemoveMemberDialogModel;

    readonly openInviteUsersDialogButton: Locator;
    readonly userAlreadyInvitedToast: Locator;

    readonly projectName: string;
    readonly userEmail: string;

    projectId: string;

    constructor(page: Page, user: { firstName?: string; lastName?: string; email: string }) {
        this.page = page;
        this.projectName = "Project 1";
        this.userEmail = "john.doe@example.com";

        this.heading = page.getByRole("heading", { name: this.projectName });

        this.inviteUsersDialog = new InviteUserDialogModel(page);
        this.promoteMemberDialog = new PromoteMemberDialogModel(page, user);
        this.removeMemberDialog = new RemoveMemberDialogModel(page, user);

        this.openInviteUsersDialogButton = page.getByText("Invite Users");
        this.userAlreadyInvitedToast = page.getByText("User is already invited");

        this.projectId = "";
    }

    /**
     * Returns the locator for the button used to open the "Remove Member" dialog for a specific user.
     *
     * @param user - The user object containing the details of the member.
     */
    getOpenRemoveMemberDialogButton(user: {
        firstName?: string;
        lastName?: string;
        email: string;
    }): Locator {
        return this.page.locator(`button[aria-label="Remove member ${user.email}"]`);
    }

    /**
     * Returns the locator for the button used to open the "Promote Member" dialog for a specific user.
     *
     * @param user - The user object containing the details of the member.
     */
    getOpenPromoteMemberDialogButton(user: {
        firstName?: string;
        lastName?: string;
        email: string;
    }): Locator {
        return this.page.locator(`button[aria-label="Promote member ${user.email}"]`);
    }

    /**
     * Opens the dialog for inviting users to the project.
     */
    async openInviteUsersDialog() {
        await expect(this.inviteUsersDialog.dialog).not.toBeVisible();
        await this.openInviteUsersDialogButton.click();
        await expect(this.inviteUsersDialog.dialog).toBeVisible();
    }

    /**
     * Opens the dialog for promoting a user to an admin.
     */
    async openPromoteMemberDialog(user: { firstName?: string; lastName?: string; email: string }) {
        await expect(this.promoteMemberDialog.dialog).not.toBeVisible();
        this.promoteMemberDialog = new PromoteMemberDialogModel(this.page, user);
        await this.getOpenPromoteMemberDialogButton(user).click();
        await expect(this.promoteMemberDialog.dialog).toBeVisible();
    }

    /**
     * Opens the dialog for removing a user from the project.
     */
    async openRemoveMemberDialog(user: { firstName?: string; lastName?: string; email: string }) {
        await expect(this.removeMemberDialog.dialog).not.toBeVisible();
        this.removeMemberDialog = new RemoveMemberDialogModel(this.page, user);
        await this.getOpenRemoveMemberDialogButton(user).click();
        await expect(this.removeMemberDialog.dialog).toBeVisible();
    }

    /**
     * Returns the toast message indicating a user has been successfully invited to the project.
     *
     * @param email - The email address of the user who was invited to the project.
     */
    getUserSuccessFullyInvitedToast(email: string) {
        return this.page.getByText(`Invited ${email} to the project`);
    }

    /**
     * Checks whether the user with the passed userId is listed in the project members.
     *
     * When `mode` is set to "name", the userId is checked as a name.
     * When `mode` is set to "email", the userId is checked as an email address.
     * When `visible` is set to false, it is checked whether the user isn't listed.
     *
     * @param userId - the userId of the user to be checked
     * @param mode - whether to check for the userId as name or email
     * @param visible - whether the user should be visible or not
     * @returns - true, if the user is listed, otherwise false (negated by `visible`)
     */
    async checkForUser(userId: string, mode: "name" | "email", visible: boolean = true) {
        switch (mode) {
            case "name":
                await expect(
                    this.page.getByRole("heading", { name: userId, level: 3 }),
                ).toBeVisible({ visible });
                break;
            case "email":
                // Get the last element with the userId as text
                // This is necessary when the user name is the same as the email address
                await expect(this.page.getByText(userId, { exact: true }).last()).toBeVisible({
                    visible,
                });
                break;
        }
    }

    /**
     * Checks whether the page shows the correct number of project members.
     *
     * The expectedCounts parameter is a partial object of ProjectMemberCount, which means that
     * only the properties that are passed will be checked. The other properties will be ignored.
     *
     * @param expectedCounts - the expected counts of project members
     */
    async assertNumberOfProjectMembers(expectedCounts: Partial<ProjectMemberCounts>) {
        const allEntries = this.page.getByRole("listitem");
        const admins = allEntries.filter({ hasText: "Role: Admin" });
        const members = allEntries.filter({ hasText: "Role: Member" });
        const invitees = allEntries.filter({ hasText: "Invitation Pending ..." });
        const invitedAdmins = admins.filter({ hasText: "Invitation Pending ..." });
        const invitedMembers = members.filter({ hasText: "Invitation Pending ..." });

        const actualCounts: ProjectMemberCounts = {
            all: await allEntries.count(),
            admins: await admins.count(),
            members: await members.count(),
            invitees: await invitees.count(),
            invitedAdmins: await invitedAdmins.count(),
            invitedMembers: await invitedMembers.count(),
        };

        for (const [key, value] of Object.entries(expectedCounts)) {
            if (value !== undefined) {
                expect(actualCounts[key as keyof ProjectMemberCounts]).toEqual(value);
            }
        }
    }

    /**
     * Checks whether an error message is shown or not.
     *
     * @param expectErrors - whether to expect an error message or not
     */
    async checkForErrors(expectErrors: boolean = true) {
        const alert = this.page.getByRole("alert");
        const errorMessage = this.page.getByText("Please enter a valid name or email.");

        if (expectErrors) {
            // An alert or an error message is shown
            await expect(alert.or(errorMessage)).toBeVisible();
        } else {
            // No alert and no error message is shown
            await expect(alert.and(errorMessage)).not.toBeVisible();
        }
    }

    /**
     * Invites a user to a project by sending an invitation through the project members settings page.
     *
     * @param email - The email address of the user to invite.
     * @param projectMembersSettingsPage - The page model for managing project member settings.
     * @param useSuggestion - Determines whether to use email suggestions when filling in the invite form.
     */
    async inviteUser(
        email: string,
        projectMembersSettingsPage: ProjectMemberSettingsPageModel,
        useSuggestion: boolean = false,
    ) {
        await projectMembersSettingsPage.openInviteUsersDialog();
        await projectMembersSettingsPage.inviteUsersDialog.fillUserInvite(email, useSuggestion);
        await projectMembersSettingsPage.inviteUsersDialog.confirmInviteUsersButton.click();
        await expect(projectMembersSettingsPage.inviteUsersDialog.dialog).not.toBeVisible();
        await projectMembersSettingsPage.assertNumberOfProjectMembers({
            all: 2,
            admins: 1,
            members: 1,
            invitees: 1,
            invitedAdmins: 0,
            invitedMembers: 1,
        });
    }
}
