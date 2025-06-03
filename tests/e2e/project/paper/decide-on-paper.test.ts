import { test } from "./paper-view-fixture";
import { createPaper } from "$tests/model-builder";
import { Project, SnowballingType } from "$lib/model/api/project";
import { ReviewDecision } from "$lib/model/api/review";
import { expect } from "@playwright/test";
import type { Paper } from "$lib/model/api/paper";
import { generateFieldMask } from "protobuf-fieldmask";
import { Criteria } from "$tests/example-data";

test.describe("Decide on paper", () => {
    let projectId = "";
    const projectPaperIds: string[] = [];
    const localProjectPaperIds: string[] = [];

    test.beforeAll(async ({ apiClient }) => {
        const project: Project = await apiClient.createProject({
            name: "Project paper decision",
        }).response;
        projectId = project.id;

        const projectSettings: Partial<Project> = {
            id: project.id,
            settings: {
                reviewMaybeAllowed: true,
                similarityThreshold: 0,
                fetcherApis: [],
                snowballingType: SnowballingType.UNSPECIFIED,
            },
        };
        await apiClient.updateProject({
            project: Project.create(projectSettings),
            mask: {
                paths: generateFieldMask(projectSettings),
            },
        }).response;

        await apiClient.createCriterion({
            ...Criteria.demoCriterion1,
            projectId: project.id,
        });
        await apiClient.createCriterion({
            ...Criteria.demoCriterion2,
            projectId: project.id,
        });
        await apiClient.createCriterion({
            ...Criteria.demoCriterion3,
            projectId: project.id,
        });

        const papers: Paper[] = await Promise.all(
            Array.from(
                { length: 3 },
                (_, i) =>
                    apiClient.createPaper(createPaper({ title: `Paper ${i} to decide on` }))
                        .response,
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
        }
    });

    test.afterAll(async ({ apiClient }) => {
        for (const paperId of projectPaperIds) {
            await apiClient.removePaperFromProject({ id: paperId });
        }
        apiClient.softDeleteProject({ id: projectId });
    });

    test(
        "When the user decides on a paper by clicking the corresponding decision button, " +
            "then a review is submitted and the next paper to review is opened",
        async ({ page, paperViewPage }) => {
            await paperViewPage.openProjectPaperView(projectId, localProjectPaperIds[0]);

            await paperViewPage.decideOnPaper(ReviewDecision.ACCEPTED);
            await expect(
                page.getByRole("heading", {
                    name: `Paper ${localProjectPaperIds[1]} to decide on`,
                }),
            ).toBeVisible();
        },
    );

    test(
        "When the user presses one of the shortcuts for a decision, " +
            "then a review is submitted and the next paper to review is opened",
        async ({ page, paperViewPage }) => {
            await paperViewPage.openProjectPaperView(projectId, localProjectPaperIds[1]);
            await expect(paperViewPage.acceptButton).toBeEnabled();
            await expect(paperViewPage.nextPaperButton).toBeEnabled();
            await page.keyboard.press("Control+a");
            await expect(
                page.getByRole("heading", {
                    name: `Paper ${localProjectPaperIds[2]} to decide on`,
                }),
            ).toBeVisible();
        },
    );

    test(
        "When the user selects certain review criteria and clicks a decision button, " +
            "then a review is submitted and the decision is shown (because there is no" +
            "other paper to review).",
        async ({ page, paperViewPage }) => {
            await paperViewPage.openProjectPaperView(projectId, localProjectPaperIds[2]);

            await paperViewPage.decideOnPaper(ReviewDecision.ACCEPTED);
            await expect(page.getByText("Successfully submitted a review.")).toBeVisible();
            await expect(page.getByText("No more papers to review.")).toBeVisible();

            await expect(paperViewPage.acceptButton).toContainClass("ring-1");
            await expect(paperViewPage.declineButton).not.toContainClass("ring-1");
            await expect(paperViewPage.maybeButton).not.toContainClass("ring-1");

            await expect(
                paperViewPage.exampleHardExclusionCriterion.getByRole("checkbox"),
            ).not.toBeChecked();
            await expect(
                paperViewPage.exampleInclusionCriterion.getByRole("checkbox"),
            ).toBeChecked();
        },
    );

    test(
        "When the user opens a project paper in review mode that was already reviewed by " +
            "the user, then it is not possible to change any decision (including review criteria).",
        async ({ page, paperViewPage }) => {
            await paperViewPage.openProjectPaperView(projectId, localProjectPaperIds[2]);

            await page.reload();

            await expect(paperViewPage.acceptButton).toBeDisabled();
            await expect(paperViewPage.declineButton).toBeDisabled();
            await expect(paperViewPage.maybeButton).toBeDisabled();

            await expect(
                paperViewPage.exampleInclusionCriterion.getByRole("checkbox"),
            ).toBeDisabled();
            await expect(
                paperViewPage.exampleHardExclusionCriterion.getByRole("checkbox"),
            ).toBeDisabled();
            await expect(
                paperViewPage.exampleInclusionCriterion.getByRole("checkbox"),
            ).toBeChecked();
        },
    );
});
