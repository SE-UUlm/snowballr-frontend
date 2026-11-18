import { expect } from "@playwright/test";
import { test } from "$tests/visual/utils/visual-fixture";
import { expandViewportToFitScrollAreas, gotoAndSettle } from "$tests/visual/utils/helper";
import { ProjectGeneralSettingsPageModel } from "$tests/e2e/project/settings/general/project-general-settings-page-model";
import { ProjectMemberSettingsPageModel } from "$tests/e2e/project/settings/members/models/project-member-settings-page-model";
import { ProjectReviewSettingsPageModel } from "$tests/e2e/project/settings/review/project-review-settings-page-model";
import { ProjectSLRSettingsPageModel } from "$tests/e2e/project/settings/slr/project-slr-settings-page-model";
import { INVITED_USER_EMAIL } from "$tests/visual/utils/visual-data";

test.describe("Project settings", () => {
    test("When the general settings are opened, then all sections match the baseline", async ({
        page,
        visualData,
    }) => {
        const generalPage = new ProjectGeneralSettingsPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/settings/general`,
            generalPage.archiveButton,
        );

        await expandViewportToFitScrollAreas(page);

        await expect(page).toHaveScreenshot("general.png", { fullPage: true });
    });

    test("When the general settings of an archived project are opened, then all sections match the baseline", async ({
        page,
        visualData,
    }) => {
        const generalPage = new ProjectGeneralSettingsPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.archivedProjectId}/settings/general`,
            generalPage.reactivateButton,
        );

        await expandViewportToFitScrollAreas(page);

        await expect(page).toHaveScreenshot("general-archived.png", { fullPage: true });
    });

    test("When the delete-project dialog is opened, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        const generalPage = new ProjectGeneralSettingsPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/settings/general`,
            generalPage.deleteButton,
        );
        await generalPage.deleteButton.click();
        await expect(generalPage.deleteProjectDialog).toBeVisible();

        await expect(generalPage.deleteProjectDialog).toHaveScreenshot("delete-project-dialog.png");
    });

    test("When the member settings are opened, then all sections match the baseline", async ({
        page,
        visualData,
    }) => {
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/settings/members`,
            page.getByText(INVITED_USER_EMAIL).first(),
        );

        await expandViewportToFitScrollAreas(page);

        await expect(page).toHaveScreenshot("members.png", { fullPage: true });
    });

    test("When the invite-users dialog is opened, then it matches the baseline", async ({
        page,
        visualData,
        user,
    }) => {
        const membersPage = new ProjectMemberSettingsPageModel(page, user!);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/settings/members`,
            membersPage.openInviteUsersDialogButton,
        );
        await membersPage.openInviteUsersDialog();
        await expect(membersPage.inviteUsersDialog.dialog).toBeVisible();

        await expect(membersPage.inviteUsersDialog.dialog).toHaveScreenshot(
            "invite-users-dialog.png",
        );
    });

    test("When the review settings are opened, then all sections match the baseline", async ({
        page,
        visualData,
    }) => {
        const reviewPage = new ProjectReviewSettingsPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/settings/review`,
            reviewPage.numberOfReviewersSlider,
        );

        await expandViewportToFitScrollAreas(page);

        await expect(page).toHaveScreenshot("review.png", { fullPage: true });
    });

    test("When the SLR settings are opened, then all sections match the baseline", async ({
        page,
        visualData,
        apiClient,
    }) => {
        const slrPage = new ProjectSLRSettingsPageModel(page, apiClient);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/settings/slr`,
            slrPage.similarityThresholdSlider,
        );
        await expandViewportToFitScrollAreas(page);

        await expect(page).toHaveScreenshot("slr.png", { fullPage: true });
    });

    test("When 'Maybe' as decision is switched off, then the confirmation dialog matches the baseline", async ({
        page,
        apiClient,
    }) => {
        // The SLR settings are locked once a project has reviews, so a fresh project is used.
        const project = await apiClient.createProject({ name: "New Project" }).response;
        const slrPage = new ProjectSLRSettingsPageModel(page, apiClient);
        await gotoAndSettle(
            page,
            `/project/${project.id}/settings/slr`,
            slrPage.maybeAsDecisionSwitch,
        );
        await expect(slrPage.maybeAsDecisionSwitch).toBeEnabled();
        await slrPage.maybeAsDecisionSwitch.click();
        // New projects allow 'Maybe' by default, so the click asks to disable it.
        const dialog = slrPage.confirmMaybeDecisionDialog.getDialog(false);
        await expect(dialog).toBeVisible();

        await expect(dialog).toHaveScreenshot("maybe-decision-dialog.png");
    });
});
