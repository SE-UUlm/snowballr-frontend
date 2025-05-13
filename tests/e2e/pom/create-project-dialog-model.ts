import { expect, type Locator, type Page } from "@playwright/test";
import type { TestUser } from "../fixtures/general-fixture";

export class DevCreateProjectDialog {
    readonly page: Page;
    readonly createProjectDialog: Locator;
    readonly createProjectButton: Locator;
    readonly cancelProjectCreationButton: Locator;
    readonly projectNameInput: Locator;
    readonly projectMemberInput: Locator;
    readonly createdProjectDialog: Locator;

    constructor(page: Page) {
        this.page = page;
        this.createProjectDialog = page.getByRole("dialog", { name: "Create Project" });
        this.createProjectButton = page.locator("button[type=submit]", {
            hasText: "Create Project",
        });
        this.cancelProjectCreationButton = page.getByRole("button", { name: "Cancel" });
        this.projectNameInput = page.getByLabel("Name");
        this.projectMemberInput = page.getByLabel("Members");
        this.createdProjectDialog = page.getByRole("alertdialog", {
            name: "Success! Your new project has been created successfully.",
        });
    }

    /**
     * Closes the dialog for creating a new project, if it is open.
     */
    async closeCreateProjectDialog() {
        await expect(this.createProjectDialog).toBeVisible();
        await this.cancelProjectCreationButton.click();
    }

    /**
     * Creates a new project with the two members "john\@doe.com" and "alice.smith\@example.com".
     *
     * @remarks
     * This function can only fill the input fields in the corresponding project creation dialog and submit the form.
     * It neither navigates to the newly created project nor close the dialog, but requires the dialog to be open.
     *
     * @param projectName - the name of the project
     * @param user - the user to be added as a member
     */
    async createProject(projectName: string, user: TestUser) {
        await this.projectNameInput.fill(projectName);
        await this.projectMemberInput.fill("john@doe.com");
        await this.projectMemberInput.press("Tab");
        await this.projectMemberInput.fill(user.firstName);
        await this.projectMemberInput.press("ArrowDown");
        await this.projectMemberInput.press("Enter");

        await this.createProjectButton.click();
    }

    /**
     * Checks, whether an error occurred during the process of the project creation, i.e. whether
     * an error alert is shown in the dialog.
     */
    async checkForErrors() {
        await expect(this.page.getByRole("alert")).not.toBeVisible();
    }

    /**
     * Closes the alert dialog, which is opened when a project is created successfully.
     *
     * @param mode - whether the user wants to open the project or cancel the dialog
     */
    async closeCreatedProjectDialog(mode: "cancel" | "open") {
        await expect(this.createdProjectDialog).toBeVisible();
        if (mode === "open") {
            await this.createdProjectDialog.getByRole("button", { name: "Open" }).click();
        } else {
            await this.createdProjectDialog.getByRole("button", { name: "Cancel" }).click();
        }
    }
}
