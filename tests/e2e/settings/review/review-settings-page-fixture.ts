import { expect } from "@playwright/test";
import { test as base } from "../../utils/fixtures/shared-fixture";
import { NavigationBarModel } from "$tests/e2e/navigation-bar-model";
import { ReviewSettingsPageModel } from "$tests/e2e/settings/review/review-settings-page-model";
import { ProjectPaperViewPageModel } from "$tests/e2e/project/paper/project-paper-view-page-model";
import type { Project } from "$api/project";
import type { Paper } from "$api/paper";
import { createPaper } from "$tests/model-builder";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { SettingsSidebarModel } from "$tests/e2e/settings/settings-sidebar-model";

type ReviewSettingsPageFixtures = {
    reviewSettingsPage: ReviewSettingsPageModel;
    projectPaperViewPage: ProjectPaperViewPageModel;
    homePage: HomePageModel;
    navigationBar: NavigationBarModel;
    settingsSideBar: SettingsSidebarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - shortcuts settings page
 * - project paper view page
 * - home page
 * - navigation bar
 * - settings sidebar
 */
export const test = base.extend<ReviewSettingsPageFixtures>({
    reviewSettingsPage: async ({ page, apiClient }, use) => {
        const reviewSettingsPage = new ReviewSettingsPageModel(page);
        let project: Project | undefined = undefined;
        let paper: Paper | undefined = undefined;

        try {
            project = await apiClient.createProject({
                name: "Project 1",
            }).response;

            paper = await apiClient.createPaper(
                createPaper({ title: reviewSettingsPage.paperName }),
            ).response;

            await apiClient.addPaperToProject({
                projectId: project.id,
                paperId: paper.id,
                stage: 0n,
            }).response;

            await page.goto("/settings/review");
            await expect(reviewSettingsPage.reviewModeSwitch).toBeVisible();
            await use(reviewSettingsPage);
        } finally {
            if (paper) apiClient.removePaperFromProject({ id: paper.id });
            if (project) await apiClient.softDeleteProject({ id: project.id });
        }
    },

    projectPaperViewPage: async ({ page }, user) => {
        await user(new ProjectPaperViewPageModel(page));
    },

    homePage: async ({ page }, user) => {
        await user(new HomePageModel(page));
    },

    navigationBar: async ({ page }, use) => {
        await use(new NavigationBarModel(page));
    },

    settingsSideBar: async ({ page }, use) => {
        await use(new SettingsSidebarModel(page));
    },
});
