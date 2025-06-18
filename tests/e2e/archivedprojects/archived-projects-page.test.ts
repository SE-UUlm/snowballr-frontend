import { test } from "./archived-projects-page-fixture";
import { expect } from "@playwright/test";

test.describe("Archived Projects Navigation", () => {
    test("When navigating to the archived projects, then the page is displayed", async ({
        page,
        archivedProjectsPage,
        navigationBar,
    }) => {
        // Directly navigate to the archived projects
        await page.goto("/");

        await navigationBar.getUserAvatarButton().click();
        await navigationBar.getArchivedProjectsLink().click();
        await expect(archivedProjectsPage.heading).toBeVisible();
    });
});
