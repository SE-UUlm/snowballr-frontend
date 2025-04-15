import { expect } from "@playwright/test";
import { test } from "./fixtures/projects-pages-fixture";
import type { Paper } from "$lib/model/api/paper";
import { createPaper } from "$tests/model-builder";
import type { Project_Paper } from "$lib/model/api/project";

test.describe("View all papers of a project", () => {
    let projectId: string = "";
    let projectPaperIds: string[] = [];

    test.beforeAll(async ({ mockBackendService }) => {
        mockBackendService
            .createProject({ name: "Project 1" })
            .then((project) => (projectId = project.response.id));

        const papers: Promise<Paper>[] = Array.from(
            { length: 10 },
            (_, i) =>
                mockBackendService.createPaper(
                    createPaper({ title: `Paper ${Math.floor(i / 5)}/${i % 5}` }),
                ).response,
        );
        const createdPapers = await Promise.all(papers);
        const projectPaper: Promise<Project_Paper>[] = createdPapers.map(
            (paper) =>
                mockBackendService.addPaperToProject({
                    projectId: projectId,
                    stage: paper.title.includes("0/") ? 0n : 1n,
                    paperId: paper.id,
                }).response,
        );
        projectPaperIds = (await Promise.all(projectPaper)).map((projectPaper) => projectPaper.id);
    });

    test.afterAll(async ({ mockBackendService }) => {
        projectPaperIds.forEach((id) => mockBackendService.removePaperFromProject({ id: id }));
        mockBackendService.softDeleteProject({ id: projectId });
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(`/project/${projectId}/papers`);
        await expect(page.getByRole("tab", { name: "Papers" })).toBeVisible();
    });

    test("When opening the project papers page, then the user sees all stages and the stage accordion items are closed.", async ({
        page,
        projectPapersPage,
    }) => {
        // expect two stages to be visible and the stages have consecutive, ascending numbers starting at 0
        await expect(page.getByRole("button", { name: "Stage -1", exact: false })).toBeHidden();
        await expect(projectPapersPage.stage0).toBeVisible();
        await expect(projectPapersPage.stage1).toBeVisible();
        await expect(page.getByRole("button", { name: "Stage 2", exact: false })).toBeHidden();

        await expect(projectPapersPage.paper0FromStage0).toBeHidden();
        await expect(projectPapersPage.paper0FromStage1).toBeHidden();

        await expect(page.getByText("2 Stages")).toBeVisible();
    });

    test("When the user opens the stage 0 section, then the papers from stage 0 are visible.", async ({
        page,
        projectPapersPage,
    }) => {
        await projectPapersPage.openStage0();
        // expect stage 0 to be visible
        await expect(projectPapersPage.stage0).toBeInViewport();
        await expect(projectPapersPage.stage1).not.toBeInViewport();

        await expect(projectPapersPage.paper0FromStage0).toBeInViewport();
        await expect(projectPapersPage.paper0FromStage1).not.toBeInViewport();

        await expect(page.getByText("2 Stages")).toBeVisible();

        await projectPapersPage.stage1.scrollIntoViewIfNeeded();
        await expect(projectPapersPage.stage1).toBeInViewport();
    });

    test(
        "When the user clicks a paper, then the paper details are shown next to the stage accordion " +
            "and can be closed when the user clicks outside the card or presses escape",
        async ({ page, projectPapersPage }) => {
            await projectPapersPage.openPaper0FromStage0(true);

            // paper details are shown next to the paper list entries
            await expect(projectPapersPage.paper0FromStage0).toBeVisible();
            await expect(projectPapersPage.paperDetailsCard).toBeVisible();

            // simulate click anywhere
            await page.mouse.click(800, 50);
            await expect(projectPapersPage.paper0FromStage0).toBeVisible();
            await expect(projectPapersPage.paperDetailsCard).toBeHidden();

            await projectPapersPage.openPaper0FromStage0(true);
            await expect(projectPapersPage.paper0FromStage0).toBeVisible();
            await expect(projectPapersPage.paperDetailsCard).toBeVisible();

            // simulate escape
            await page.keyboard.press("Escape");
            await expect(projectPapersPage.paper0FromStage0).toBeVisible();
            await expect(projectPapersPage.paperDetailsCard).toBeHidden();
        },
    );

    test("When the user use the 'Open' icon button in the paper details card, then the paper view of this paper is opened.", async ({
        page,
        projectPapersPage,
    }) => {
        await expect(page.getByRole("heading", { name: "Paper 0/0" })).toBeHidden();

        await projectPapersPage.openPaper0FromStage0(true);
        await page.getByRole("button", { name: "Open paper" }).click();

        // paper view was opened
        await expect(page.getByRole("heading", { name: "Paper 0/0" })).toBeVisible();
        await expect(projectPapersPage.paper0FromStage0).toBeHidden();
    });

    test("When the user double clicks a paper, then the paper view of this paper is opened.", async ({
        page,
        projectPapersPage,
    }) => {
        await expect(page.getByRole("heading", { name: "Paper 0/0" })).toBeHidden();

        await projectPapersPage.openPaper0FromStage0();

        // paper view was opened
        await expect(page.getByRole("heading", { name: "Paper 0/0" })).toBeVisible();
        await expect(projectPapersPage.paper0FromStage0).toBeHidden();
    });
});
