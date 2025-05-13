import { expect, type Locator, type Page } from "@playwright/test";

export interface ProjectMemberCounts {
    all: number;
    admins: number;
    members: number;
    invitees: number;
    invitedAdmins: number;
    invitedMembers: number;
}

export class DevProjectMemberSettingsPage {
    readonly page: Page;
    readonly inviteUsersDialog: Locator;
    readonly openInviteUsersDialogButton: Locator;
    readonly inviteUsersDialogInput: Locator;
    readonly inviteUsersDialogButton: Locator;
    readonly inviteUsersDialogCancelButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.inviteUsersDialog = page.getByRole("dialog", { name: "Invite Users" });
        this.openInviteUsersDialogButton = page.getByText("Invite Users");
        this.inviteUsersDialogInput = this.inviteUsersDialog.getByLabel("Members");
        this.inviteUsersDialogButton = this.inviteUsersDialog.getByRole("button", {
            name: "Send Invitations",
        });
        this.inviteUsersDialogCancelButton = this.inviteUsersDialog.getByRole("button", {
            name: "Cancel",
        });
    }

    /**
     * Opens the dialog for inviting users to the project.
     */
    async openInviteUsersDialog() {
        await expect(this.inviteUsersDialog).not.toBeVisible();
        await this.openInviteUsersDialogButton.click();
    }

    /**
     * Invites a user with the passed userId to the project.
     *
     * It is expected that the dialog for inviting users is open and the input field for the userId is visible.
     *
     * The userId can be either an email address or a username. If useSuggestion is set to true,
     * only a part of the userId may be required.
     *
     * @param userId - the userId of the user to be invited
     * @param useSuggestion - whether to use the suggestion for the userId
     */
    async inviteUser(userId: string, useSuggestion: boolean = false) {
        await expect(this.inviteUsersDialog).toBeVisible();
        await expect(this.inviteUsersDialogInput).toBeVisible();

        // Fill the input field and either select the suggestion or press Tab to confirm the input
        await this.inviteUsersDialogInput.fill(userId);
        if (useSuggestion) {
            await this.inviteUsersDialogInput.press("ArrowDown");
            await this.inviteUsersDialogInput.press("Enter");
        } else {
            await this.inviteUsersDialogInput.press("Tab");
        }
    }

    /**
     * Checks whether the user with the passed userId is listed in the project members.
     */
    async checkForUser(userId: string, mode: "name" | "email") {
        switch (mode) {
            case "name":
                await expect(
                    this.page.getByRole("heading", { name: userId, level: 3 }),
                ).toBeVisible();
                break;
            case "email":
                // Get the last element with the userId as text
                // This is necessary when the user name is the same as the email address
                await expect(this.page.getByText(userId, { exact: true }).last()).toBeVisible();
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
}
