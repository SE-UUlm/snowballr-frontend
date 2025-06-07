import { type Locator, type Page } from "@playwright/test";

export class AccountSettingsPageModel {
    readonly page: Page;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly renameButton: Locator;

    readonly userNameUpdatedToast: Locator;
    readonly emptyFirstNameAlert: Locator;
    readonly emptyLastNameAlert: Locator;
    readonly noChangesDetectedAlert: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstNameInput = page.getByLabel("First Name");
        this.lastNameInput = page.getByLabel("Last Name");
        this.renameButton = page.getByRole("button", { name: "Rename" });

        this.userNameUpdatedToast = page.getByText("Successfully updated your name.");
        this.emptyFirstNameAlert = page.getByText("First Name cannot start or end with whitespace");
        this.emptyLastNameAlert = page.getByText("Last Name cannot start or end with whitespace");
        this.noChangesDetectedAlert = page.getByRole("alert", {
            name: "No Changes Detected",
        });
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
