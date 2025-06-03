import { createPaper } from "$tests/model-builder";
import { expect } from "@playwright/test";
import { reloadWait } from "$tests/e2e/utils/helper/helper";
import { test } from "./project-slr-settings-fixture";

export let slrProjectId: string = "";
export const slrProjectName = "Project SLR Settings";
let projectPaperId: string;

test.describe("Changing SLR settings", () => {
    test.beforeAll(async ({ apiClient }) => {
        await apiClient
            .createProject({ name: slrProjectName })
            .response.then((project) => (slrProjectId = project.id));

        const paper = await apiClient.createPaper(
            createPaper({ title: "Maybe as Decision Setting Test Paper" }),
        ).response;

        await apiClient
            .addPaperToProject({ projectId: slrProjectId, stage: 0n, paperId: paper.id })
            .response.then((projectPaper) => {
                projectPaperId = projectPaper.localId;
            });
    });

    test.afterAll(async ({ apiClient }) => {
        apiClient.removePaperFromProject({ id: projectPaperId });
        apiClient.softDeleteProject({ id: slrProjectId });
    });

    // --- Maybe as Decision ---
    test("When the 'Maybe as Decision' option is turned on, then the option 'Maybe' should be visible", async ({
        projectSLRSettingsPageAndProjectPaperPage,
    }) => {
        const { projectSLRSettingsPage, projectPaperPage } =
            projectSLRSettingsPageAndProjectPaperPage;

        await projectSLRSettingsPage.openSLRProjectSettings(slrProjectId, slrProjectName);
        await projectSLRSettingsPage.toggleMaybeAsDecisionSwitch(true);

        await projectPaperPage.openProjectPaperView(slrProjectId, projectPaperId);

        await expect(projectPaperPage.maybeButton).toBeVisible();
    });

    test("When the 'Maybe as Decision' option is turned off, then the option 'Maybe' should not be visible", async ({
        projectSLRSettingsPageAndProjectPaperPage,
    }) => {
        const { projectSLRSettingsPage, projectPaperPage } =
            projectSLRSettingsPageAndProjectPaperPage;

        await projectSLRSettingsPage.openSLRProjectSettings(slrProjectId, slrProjectName);
        await projectSLRSettingsPage.toggleMaybeAsDecisionSwitch(false);

        await projectPaperPage.openProjectPaperView(slrProjectId, projectPaperId);

        await expect(projectPaperPage.maybeButton).not.toBeVisible();
    });

    test("When the user reloads the page, then the 'Maybe as Decision' setting is persisted", async ({
        page,
        projectSLRSettingsPageAndProjectPaperPage,
    }) => {
        const { projectSLRSettingsPage } = projectSLRSettingsPageAndProjectPaperPage;

        await projectSLRSettingsPage.openSLRProjectSettings(slrProjectId, slrProjectName);
        await projectSLRSettingsPage.toggleMaybeAsDecisionSwitch(true);
        await reloadWait(page, page.getByRole("heading", { name: slrProjectName }));
        await expect(projectSLRSettingsPage.maybeAsDecisionSwitch).toBeChecked();

        await projectSLRSettingsPage.toggleMaybeAsDecisionSwitch(false);
        await reloadWait(page, page.getByRole("heading", { name: slrProjectName }));
        await expect(projectSLRSettingsPage.maybeAsDecisionSwitch).not.toBeChecked();
    });

    // TODO: Implement tests, as soon as the backend supports the update of states of the project to `ACTIVE_LOCKED`
    test.skip("When the project is set to 'ACTIVE_LOCKED', then a warning is shown, that the SLR settings cannot be changed", async () => {});
    test.skip("When the project is set to 'ACTIVE_LOCKED', then the 'Maybe as Decision' setting cannot be changed", async () => {});
});
