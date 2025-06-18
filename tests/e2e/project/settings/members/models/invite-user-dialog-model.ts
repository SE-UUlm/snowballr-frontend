import { expect, type Locator, type Page } from "@playwright/test";

export class InviteUserDialogModel {
    readonly page: Page;
    readonly dialog: Locator;
    readonly inviteUsersInput: Locator;
    readonly confirmInviteUsersButton: Locator;
    readonly cancelInviteUsersButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dialog = page.getByRole("dialog", { name: "Invite Users" });
        this.inviteUsersInput = this.dialog.getByLabel("Members");
        this.confirmInviteUsersButton = this.dialog.getByRole("button", {
            name: "Send Invitations",
        });
        this.cancelInviteUsersButton = this.dialog.getByRole("button", {
            name: "Cancel",
        });
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
    async fillUserInvite(userId: string, useSuggestion: boolean = false) {
        await expect(this.dialog).toBeVisible();
        await expect(this.inviteUsersInput).toBeVisible();

        // Fill the input field and either select the suggestion or press Tab to confirm the input
        await this.inviteUsersInput.fill(userId);
        if (useSuggestion) {
            await this.inviteUsersInput.press("ArrowDown");
            await this.inviteUsersInput.press("Enter");
        } else {
            await this.inviteUsersInput.press("Tab");
        }
    }
}
