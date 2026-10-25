import { test } from "./project-review-settings-page-fixture";
import { expect } from "@playwright/test";
import { reloadWait } from "$tests/e2e/utils/helper/helper";
import { CriterionCategory } from "$api/criterion";
import { Project } from "$api/project";

test.describe("Project Review Settings Navigation", () => {
    test("When navigating to the project review settings, then the page is displayed", async ({
        page,
        projectReviewSettingsPage,
        homePage,
        projectNavigationBar,
        projectSettingsSideBar,
    }) => {
        // Directly navigate to the project review settings
        await page.goto("/");

        await homePage.openProject(projectReviewSettingsPage.projectName);
        await projectNavigationBar.settingsTab.click();
        await projectSettingsSideBar.review.click();
        await expect(projectReviewSettingsPage.tagInputField).toBeVisible();
    });
});

test.describe("Keyword Settings Tests", () => {
    test("When the user creates a new tag and deletes this tag, then the tag is correctly added and deleted", async ({
        projectReviewSettingsPage,
    }) => {
        await projectReviewSettingsPage.addTag("New Tag");
        const newTag = await projectReviewSettingsPage.getTag("New Tag");
        await expect(newTag).toBeVisible();
        await projectReviewSettingsPage.deleteTag("New Tag");
        await expect(newTag).not.toBeVisible();
    });

    test("When the user navigates to another page and comes back to the review settings, then the previously defined keyword tags are still available", async ({
        page,
        projectReviewSettingsPage,
    }) => {
        await projectReviewSettingsPage.addTag("New Tag 1");
        await expect(await projectReviewSettingsPage.getTag("New Tag 1")).toBeVisible();
        await projectReviewSettingsPage.addTag("New Tag 2");
        await expect(await projectReviewSettingsPage.getTag("New Tag 2")).toBeVisible();

        await reloadWait(page, projectReviewSettingsPage.heading);

        await expect(await projectReviewSettingsPage.getTag("New Tag 1")).toBeVisible();
        await expect(await projectReviewSettingsPage.getTag("New Tag 2")).toBeVisible();
    });
});

test.describe("Review Criteria Settings Tests", () => {
    test("When the admin adds a criterion in stage 0 and saves, then it is stored without asking for confirmation", async ({
        page,
        projectReviewSettingsPage,
    }) => {
        await projectReviewSettingsPage.addCriterion(
            "Inclusion",
            "Peer reviewed",
            "The paper was published in a peer reviewed venue.",
        );
        await expect(projectReviewSettingsPage.getCriterionRow("I1")).toContainText("New");

        await projectReviewSettingsPage.saveCriteriaButton.click();

        await expect(page.getByText("Successfully saved review criteria.")).toBeVisible();
        await expect(projectReviewSettingsPage.confirmDialog).toBeHidden();

        await reloadWait(page, projectReviewSettingsPage.criteriaHeading);
        await expect(projectReviewSettingsPage.getCriterionRow("I1")).toContainText(
            "Peer reviewed",
        );
        await expect(projectReviewSettingsPage.getCriterionRow("I1")).not.toContainText("New");
    });

    test("When the admin renames and removes criteria and saves, then both changes are stored", async ({
        page,
        apiClient,
        projectReviewSettingsPage,
    }) => {
        for (const [tag, name] of [
            ["E1", "Not in English"],
            ["E2", "Duplicate"],
        ]) {
            await apiClient.createCriterion({
                projectId: projectReviewSettingsPage.projectId,
                tag,
                name,
                description: "",
                category: CriterionCategory.EXCLUSION,
            }).response;
        }
        await reloadWait(page, projectReviewSettingsPage.criteriaHeading);

        await projectReviewSettingsPage.renameCriterion("E1", "Not written in English");
        await projectReviewSettingsPage.removeCriterion("E2");
        await expect(projectReviewSettingsPage.criteriaSection).toContainText(
            "Not saved yet: 1 edited, 1 removed.",
        );
        await projectReviewSettingsPage.saveCriteriaButton.click();
        await expect(page.getByText("Successfully saved review criteria.")).toBeVisible();

        await reloadWait(page, projectReviewSettingsPage.criteriaHeading);
        await expect(projectReviewSettingsPage.getCriterionRow("E1")).toContainText(
            "Not written in English",
        );
        await expect(projectReviewSettingsPage.getCriterionRow("E2")).toHaveCount(0);
    });

    test("When the admin discards their changes, then the stored criteria are shown again", async ({
        projectReviewSettingsPage,
    }) => {
        await projectReviewSettingsPage.addCriterion("Hard Exclusion", "Not a paper");
        await expect(projectReviewSettingsPage.getCriterionRow("HE1")).toBeVisible();

        await projectReviewSettingsPage.discardCriteriaChangesButton.click();

        await expect(projectReviewSettingsPage.criterionRows).toHaveCount(0);
        await expect(projectReviewSettingsPage.saveCriteriaButton).toBeHidden();
    });

    test("When the project is past stage 0, then saving asks for confirmation before storing the changes", async ({
        page,
        apiClient,
        projectReviewSettingsPage,
    }) => {
        await apiClient.updateProject({
            project: Project.create({ id: projectReviewSettingsPage.projectId, currentStage: 1n }),
            mask: { paths: ["project.current_stage"] },
        }).response;
        await reloadWait(page, projectReviewSettingsPage.criteriaHeading);

        await projectReviewSettingsPage.addCriterion("Soft Exclusion", "Too short");
        await projectReviewSettingsPage.saveCriteriaButton.click();

        const dialog = projectReviewSettingsPage.confirmDialog;
        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText("Change Criteria During Stage 1?");
        await expect(dialog).toContainText("Add E1 Too short");

        await dialog.getByRole("button", { name: "Keep editing" }).click();
        await expect(dialog).toBeHidden();
        await expect(projectReviewSettingsPage.getCriterionRow("E1")).toContainText("New");

        await projectReviewSettingsPage.saveCriteriaButton.click();
        await dialog.getByRole("button", { name: "Save criteria" }).click();
        await expect(page.getByText("Successfully saved review criteria.")).toBeVisible();
        await expect(dialog).toBeHidden();

        await reloadWait(page, projectReviewSettingsPage.criteriaHeading);
        await expect(projectReviewSettingsPage.getCriterionRow("E1")).toContainText("Too short");
    });
});

test.describe("Number of Reviewers Settings Tests", () => {
    test("When navigating to the review settings as a project admin, then the number of reviewers section is visible", async ({
        projectReviewSettingsPage,
    }) => {
        await expect(projectReviewSettingsPage.numberOfReviewersHeading).toBeVisible();
        await expect(projectReviewSettingsPage.numberOfReviewersSlider).toBeVisible();
        await expect(projectReviewSettingsPage.numberOfReviewersSlider).toBeEnabled();
    });

    test("When the user changes the number of reviewers using the slider, then a success notification is shown", async ({
        projectReviewSettingsPage,
        page,
    }) => {
        await expect(projectReviewSettingsPage.getNumberOfReviewers()).resolves.toBe(2);

        // We only change the value by one, because we can only do one step at a time
        await projectReviewSettingsPage.setNumberOfReviewers(3);

        await expect(page.getByText("Successfully updated the project settings.")).toBeVisible();
    });

    test("When the user changes the number of reviewers and reloads the page, then the new value is persisted", async ({
        page,
        projectReviewSettingsPage,
    }) => {
        await expect(projectReviewSettingsPage.getNumberOfReviewers()).resolves.toBe(2);

        // We only change the value by one, because we can only do one step at a time
        await projectReviewSettingsPage.setNumberOfReviewers(3);

        await reloadWait(page, projectReviewSettingsPage.numberOfReviewersHeading);

        await expect(projectReviewSettingsPage.numberOfReviewersSlider).toHaveAttribute(
            "aria-valuenow",
            "3",
        );
    });

    test.fixme("When the project status is 'ACTIVE_LOCKED', then the number of reviewers slider is disabled", async () => {});
});
