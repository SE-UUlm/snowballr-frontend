import { type Locator, type Page } from "@playwright/test";

export class DevAccountSettingsPage {
    readonly page: Page;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly renameButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstNameInput = page.getByLabel("First Name");
        this.lastNameInput = page.getByLabel("Last Name");
        this.renameButton = page.getByRole("button", { name: "Rename" });
    }

    /**
     * Changes the username of the user.
     *
     * @param firstName - the first name of the user
     * @param lastName - the last name of the user
     */
    async changeUsername(firstName: string, lastName: string) {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.renameButton.click();
    }
}
