import { expect, type Locator, type Page } from "@playwright/test";

export class DevCreateProjectDialog {
    readonly page: Page;
    readonly createProjectDialog: Locator;
    readonly createProjectButton: Locator;
    readonly cancelProjectCreationButton: Locator;
    readonly projectNameInput: Locator;
    readonly projectMemberInput: Locator;

    constructor(page: Page) {
        this.page = page;
        this.createProjectDialog = page.getByRole("dialog", { name: "Create Project" });
        this.createProjectButton = page.locator("button[type=submit]", {
            hasText: "Create Project",
        });
        this.cancelProjectCreationButton = page.getByRole("button", { name: "Cancel" });
        this.projectNameInput = page.getByLabel("Name");
        this.projectMemberInput = page.getByLabel("Members");
    }

    /**
     * Closes the dialog for creating a new project, if it is open
     */
    async closeCreateProjectDialog() {
        await expect(this.createProjectDialog).toBeVisible();
        await this.cancelProjectCreationButton.click();
    }

    /**
     * Creates a new project called "Demo project 1" with the two members "max@mustermann.de" and "john.doe@example.com".
     *
     * @remarks
     * This function can only fill the input fields in the corresponding project creation dialog and submit the form.
     * It neither navigates to the newly created project nor close the dialog, but requires the dialog to be open.
     */
    async createProject() {
        await this.projectNameInput.fill("Demo project 1");
        await this.projectMemberInput.fill("max@mustermann.de");
        await this.projectMemberInput.pressSequentially("john");
        await this.projectMemberInput.press("Tab");

        await this.createProjectButton.click();
    }
}
