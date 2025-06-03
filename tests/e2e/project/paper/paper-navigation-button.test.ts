import { test } from "./paper-view-fixture";
import { createPaper } from "$tests/model-builder";
import { Project } from "$lib/model/api/project";
import type { Paper } from "$lib/model/api/paper";
import { expect } from "@playwright/test";
import { Reviews } from "$tests/example-data";

test.describe("Go to next/previous paper", () => {
    let projectId = "";
    const projectPaperIds: string[] = [];
    const localProjectPaperIds: string[] = [];

    test.beforeAll(async ({ apiClient }) => {
        const project: Project = await apiClient.createProject({
            name: "Project paper navigation",
        }).response;
        projectId = project.id;
        const papers: Paper[] = await Promise.all(
            Array.from(
                { length: 3 },
                (_, i) =>
                    apiClient.createPaper(
                        createPaper({ title: `Paper ${i} to navigate`, id: i.toString() }),
                    ).response,
            ),
        );
        for (const paper of papers) {
            const projectPaper = await apiClient.addPaperToProject({
                projectId: projectId,
                paperId: paper.id,
                stage: 0n,
            }).response;
            projectPaperIds.push(projectPaper.id);
            localProjectPaperIds.push(projectPaper.localId);
            if (parseInt(projectPaper.localId) % 2 !== 0) {
                await apiClient.createReview({
                    projectPaperId: projectPaper.id,
                    ...Reviews.demoReview1,
                });
            }
        }
    });

    test.afterAll(async ({ apiClient }) => {
        for (const paperId of projectPaperIds) {
            await apiClient.removePaperFromProject({ id: paperId });
        }
        apiClient.softDeleteProject({ id: projectId });
    });

    test(
        "When the user is not in review mode and clicks the next paper button, " +
            "then the next paper in the same project with the succeeding localId is shown.",
        async ({ page, paperViewPage }) => {
            await page.evaluate(() => {
                localStorage.setItem("reviewMode", JSON.stringify(false));
            });
            await paperViewPage.openProjectPaperView(projectId, localProjectPaperIds[0]);
            await paperViewPage.goToNextPaper();
            await expect(paperViewPage.nextPaperButton).toBeEnabled();
            await expect(
                page
                    .getByRole("heading", { name: `Paper ${localProjectPaperIds[1]} to navigate` })
                    .first(),
            ).toBeVisible();
        },
    );
    test(
        "When the user is not in review mode and clicks the previous paper button, " +
            "then the previous paper in the same project with the preceeding localId is shown.",
        async ({ page, paperViewPage }) => {
            await page.evaluate(() => {
                localStorage.setItem("reviewMode", JSON.stringify(false));
            });
            await paperViewPage.openProjectPaperView(projectId, localProjectPaperIds[2]);
            await paperViewPage.goToPreviousPaper();
            await expect(paperViewPage.previousPaperButton).toBeEnabled();
            await expect(
                page
                    .getByRole("heading", { name: `Paper ${localProjectPaperIds[1]} to navigate` })
                    .first(),
            ).toBeVisible();
        },
    );
    test(
        "When the user is in review mode and clicks the next paper button, " +
            "then the next paper in the same project without submitted review is shown.",
        async ({ page, paperViewPage }) => {
            await paperViewPage.openProjectPaperView(projectId, localProjectPaperIds[0]);
            await paperViewPage.goToNextPaper();
            await expect(
                page.getByRole("heading", { name: `Paper ${localProjectPaperIds[2]} to navigate` }),
            ).toBeVisible();
        },
    );
    test(
        "When the user is in review mode and clicks the previous paper button, " +
            "then the last visited paper in the same project is shown.",
        async ({ page, paperViewPage }) => {
            await paperViewPage.openProjectPaperView(projectId, localProjectPaperIds[0]);
            await paperViewPage.goToNextPaper();
            await expect(
                page.getByRole("heading", { name: `Paper ${localProjectPaperIds[2]} to navigate` }),
            ).toBeVisible();
            await paperViewPage.goToPreviousPaper();
            await expect(
                page.getByRole("heading", { name: `Paper ${localProjectPaperIds[0]} to navigate` }),
            ).toBeVisible();
        },
    );
});
