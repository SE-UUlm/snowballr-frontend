import { expect, type Locator, type Page } from "@playwright/test";

type LinkName = "Reading List" | "Archived Projects" | "Invitations" | "Settings" | "Sign Out";
type SettingName = "Account" | "Project Setup" | "Shortcuts" | "Review";

export class DevHomePage {
    readonly page: Page;
    readonly createProjectDialog: Locator;
    readonly openCreateProjectDialogButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.createProjectDialog = page.getByRole("dialog", { name: "Create Project" });
        this.openCreateProjectDialogButton = page.getByTestId("dialog-trigger");
    }

    /**
     * Opens the dialog for creating a new project.
     */
    async openCreateProjectDialog() {
        await expect(this.createProjectDialog).not.toBeVisible();
        await this.openCreateProjectDialogButton.click();
    }

    /**
     * Opens the user menu dialog and clicks on a specific link.
     *
     * @param linkName - The name of the link to be clicked in the user menu dialog.
     */
    async openLinkInUserMenuDialog(linkName: LinkName, checkDestination: boolean = true) {
        await this.page.getByRole("button", { name: /^[A-Z]{2}$/ }).click();
        await this.page.getByRole("link", { name: linkName }).click();
        if (checkDestination) {
            await expect(this.page.getByRole("heading", { name: linkName })).toBeVisible();
        }
    }

    /**
     * Opens the user menu dialog, opens the settings and clicks on a specific user setting in the sidebar, e.g. "Account".
     *
     * @param settingName - The name of the setting to be opened in the user settings sidebar.
     */
    async openUserSettingInSidebar(settingName: SettingName) {
        await this.openLinkInUserMenuDialog("Settings");
        await this.page.getByRole("link", { name: settingName }).click();
        await this.page.waitForURL(`**/settings/${settingName.toLowerCase()}`);
    }
}
