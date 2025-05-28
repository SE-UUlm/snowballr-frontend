import { test as base } from "../../../utils/fixtures/shared-fixture";
import { DevPaperViewPage } from "../../paper/paper-view-model";
import { expect } from "@playwright/test";
import { slrProjectId, slrProjectName } from "./project-slr-settings.test";
import { DevProjectSLRSettingsPage } from "./project-slr-settings-model";

type SLRSettingsPageAndProjectPaperPage = {
    projectSLRSettingsPage: DevProjectSLRSettingsPage;
    projectPaperPage: DevPaperViewPage;
};

export const test = base.extend<{
    projectSLRSettingsPageAndProjectPaperPage: SLRSettingsPageAndProjectPaperPage;
}>({
    projectSLRSettingsPageAndProjectPaperPage: async ({ page }, use) => {
        await page.goto(`project/${slrProjectId}/settings/slr`);
        await expect(page.getByRole("heading", { name: slrProjectName })).toBeVisible();

        await use({
            projectSLRSettingsPage: new DevProjectSLRSettingsPage(page),
            projectPaperPage: new DevPaperViewPage(page),
        });
    },
});
