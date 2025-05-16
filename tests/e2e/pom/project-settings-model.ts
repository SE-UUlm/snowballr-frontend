import { expect, type Locator, type Page } from "@playwright/test";

export class DevProjectSettingsPage {
    readonly page: Page;
    readonly projectNameInput: Locator;
    readonly renameButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.projectNameInput = page.getByLabel("Project Name");
        this.renameButton = page.getByRole("button", { name: "Rename" });
    }

    /**
     * Changes the name of the project.
     *
     * @param projectName - the new project name
     */
    async changeProjectName(projectName: string) {
        await this.projectNameInput.fill(projectName);
        await this.renameButton.click();
    }

    async checkForErrors() {
        await expect(this.page.getByRole("alert")).not.toBeVisible();
    }
}
