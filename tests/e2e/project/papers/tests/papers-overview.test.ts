import { expect } from "@playwright/test";
import { test } from "../fixtures/projects-papers-fixture";
import { Author, type Paper } from "$lib/model/api/paper";
import { createAuthor, createPaper } from "$tests/model-builder";
import type { Project_Paper } from "$lib/model/api/project";
import { getUniqueSequence, NUM_PAPERS_PER_STAGE } from "../pom/project-papers-page-model";

export let projectId: string = "";

test.describe("View all papers of a project", () => {
    let projectPaperIds: string[] = [];

    const TOTAL_PAPERS = NUM_PAPERS_PER_STAGE * 2;

    /**
     * Create a project with 2 stages and `NUM_PAPERS_PER_STAGE` papers in each stage.
     * The papers are created with unique titles and authors.
     * The papers are added to the project in the order they are created.
     * The project paper ids are stored in `projectPaperIds` for later use.
     */
    test.beforeAll(async ({ apiClient }) => {
        apiClient
            .createProject({ name: "Project 1" })
            .then((project) => (projectId = project.response.id));

        const papers: Promise<Paper>[] = [];
        for (let i = 0; i < TOTAL_PAPERS; i++) {
            const stageIndex = Math.floor(i / NUM_PAPERS_PER_STAGE);
            const paperIndex = i % NUM_PAPERS_PER_STAGE;
            const uniqueSequence = getUniqueSequence(i);
            const title = `Paper ${stageIndex}/${paperIndex} (${uniqueSequence})`;

            const authors: Author[] = [
                {
                    firstName: stageIndex === 0 ? `Alpha${paperIndex}` : `Beta${paperIndex}`,
                    lastName: "Author",
                    orcid: "",
                },
            ];

            papers.push(apiClient.createPaper(createPaper({ title, authors })).response);
        }
        const createdPapers = await Promise.all(papers);

        const projectPaperPromises: Promise<Project_Paper>[] = createdPapers.map((paper, i) => {
            const stageIndex = Math.floor(i / NUM_PAPERS_PER_STAGE) === 0 ? 0n : 1n;
            return apiClient.addPaperToProject({
                projectId: projectId,
                stage: stageIndex,
                paperId: paper.id,
            }).response;
        });
        projectPaperIds = (await Promise.all(projectPaperPromises)).map((pp) => pp.id);
    });

    /**
     * Remove the project papers and soft delete the project after all tests.
     * TODO: Delete all papers from the mock backend (Currently not supported).
     */
    test.afterAll(async ({ apiClient }) => {
        projectPaperIds.forEach((id) => apiClient.removePaperFromProject({ id: id }));
        apiClient.softDeleteProject({ id: projectId });
    });

    test("When opening the project papers page, then the user sees all stages and the stage accordion items are closed.", async ({
        page,
        projectPapersPage,
    }) => {
        await expect(page.getByText("2 Stages")).toBeVisible();

        // expect two stages to be visible and the stages have consecutive, ascending numbers starting at 0
        await expect(projectPapersPage.getStageTrigger(-1)).toBeHidden();
        await expect(projectPapersPage.getStageTrigger(0)).toBeVisible();
        await expect(projectPapersPage.getStageTrigger(1)).toBeVisible();
        await expect(projectPapersPage.getStageTrigger(2)).toBeHidden();

        // expect the stage accordion items to be closed
        await expect(projectPapersPage.getPaper(0, 0)).toBeHidden();
        await expect(projectPapersPage.getPaper(1, 0)).toBeHidden();
    });

    test("When the user opens the stage 0 section, then the papers from stage 0 are visible.", async ({
        projectPapersPage,
    }) => {
        await projectPapersPage.openStage(0);

        // expect papers from stage 0 to be visible
        await expect(projectPapersPage.getPaper(0, 0)).toBeInViewport();
        await expect(projectPapersPage.getPaper(0, 1)).toBeInViewport();

        // expect papers from stage 1 to be hidden
        await expect(projectPapersPage.getPaper(1, 0)).toBeHidden();
    });

    test("When the user clicks a paper, then the paper details are shown next to the stage accordion and can be closed when the user clicks outside the card or presses escape", async ({
        page,
        projectPapersPage,
    }) => {
        const stageIndex = 0;
        const paperIndexInStage = 2;
        const paperLocator = projectPapersPage.getPaper(stageIndex, paperIndexInStage);

        await projectPapersPage.openPaperPreview(stageIndex, paperIndexInStage);

        await expect(paperLocator).toBeVisible();
        await expect(projectPapersPage.paperDetailsCard).toBeVisible();

        await page.mouse.click(800, 50);
        await expect(paperLocator).toBeVisible();
        await expect(projectPapersPage.paperDetailsCard).toBeHidden();

        await projectPapersPage.openPaperPreview(stageIndex, paperIndexInStage);
        await expect(paperLocator).toBeVisible();
        await expect(projectPapersPage.paperDetailsCard).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(paperLocator).toBeVisible();
        await expect(projectPapersPage.paperDetailsCard).toBeHidden();
    });

    test("When the user use the 'Open' icon button in the paper details card, then the paper view of this paper is opened.", async ({
        page,
        projectPapersPage,
    }) => {
        const stageIndex = 1;
        const paperIndexInStage = 3;
        const totalPaperIndex = stageIndex * NUM_PAPERS_PER_STAGE + paperIndexInStage;
        const paperLocator = projectPapersPage.getPaper(stageIndex, paperIndexInStage);
        const paperTitle = `Paper ${stageIndex}/${paperIndexInStage} (${getUniqueSequence(totalPaperIndex)})`;

        await expect(page.getByRole("heading", { name: paperTitle })).toBeHidden();

        await projectPapersPage.openPaperPreview(stageIndex, paperIndexInStage);
        await page.getByRole("button", { name: "Open paper" }).click();

        // paper view was opened
        await expect(page.getByRole("heading", { name: paperTitle })).toBeVisible();
        await expect(paperLocator).toBeHidden();
    });

    test("When the user double clicks a paper, then the paper view of this paper is opened.", async ({
        page,
        projectPapersPage,
    }) => {
        const stageIndex = 0;
        const paperIndexInStage = 4;
        const totalPaperIndex = stageIndex * NUM_PAPERS_PER_STAGE + paperIndexInStage;
        const paperLocator = projectPapersPage.getPaper(stageIndex, paperIndexInStage);
        const paperTitle = `Paper ${stageIndex}/${paperIndexInStage} (${getUniqueSequence(totalPaperIndex)})`;

        await expect(page.getByRole("heading", { name: paperTitle })).toBeHidden();

        await projectPapersPage.openPaperView(stageIndex, paperIndexInStage);

        // paper view was opened
        await expect(page.getByRole("heading", { name: paperTitle })).toBeVisible();
        await expect(paperLocator).toBeHidden();
    });

    // --- Search Tests ---

    test("When the user searches for a specific paper id, then only matching papers are shown in open stages.", async ({
        page,
        projectPapersPage,
        apiClient,
    }) => {
        // create a new paper with total paper id + 1
        const title = "TotalPaperIdPlusOne";
        const author = createAuthor({
            firstName: "New",
            lastName: "Author",
            orcid: "",
        });
        const newPaper = await apiClient.createPaper(createPaper({ title, authors: [author] }))
            .response;
        const newProjectPaper = await apiClient.addPaperToProject({
            projectId: projectId,
            stage: 0n,
            paperId: newPaper.id,
        }).response;
        const newProjectPaperId = newProjectPaper.id;

        await page.reload();

        await projectPapersPage.openStage(0);
        await projectPapersPage.openStage(1);
        await projectPapersPage.search(`#${newProjectPaper.localId}`);
        await projectPapersPage.expectStageCounts(0, `(1 / ${NUM_PAPERS_PER_STAGE + 1} papers)`);
        await projectPapersPage.expectStageCounts(1, `(0 / ${NUM_PAPERS_PER_STAGE} papers)`);
        await expect(projectPapersPage.getPaperByTitle(title)).toBeVisible();
        await expect(projectPapersPage.getNoSearchResultsText().first()).toBeVisible();

        // remove the new paper from the project
        await apiClient.removePaperFromProject({ id: newProjectPaperId });
    });

    test("When the user searches for a specific paper title (unique sequence), then only matching papers are shown in open stages.", async ({
        projectPapersPage,
    }) => {
        const searchPaperIndex = 2; // Paper 0/2
        const hiddenPaperIndexStage0 = 4; // Paper 0/4
        const hiddenPaperIndexStage1 = NUM_PAPERS_PER_STAGE + 1; // Paper 1/1

        const uniqueSequenceSearch = getUniqueSequence(searchPaperIndex);
        const fullTitleSearch = `Paper 0/2 (${uniqueSequenceSearch})`;
        const fullTitleHidden0 = `Paper 0/4 (${getUniqueSequence(hiddenPaperIndexStage0)})`;
        const fullTitleHidden1 = `Paper 1/1 (${getUniqueSequence(hiddenPaperIndexStage1)})`;

        await projectPapersPage.openStage(0);
        await projectPapersPage.openStage(1);

        await projectPapersPage.search(uniqueSequenceSearch);

        // Stage 0 checks
        await projectPapersPage.expectStageCounts(0, `(1 / ${NUM_PAPERS_PER_STAGE} papers)`);
        await expect(projectPapersPage.getPaperByTitle(fullTitleSearch)).toBeVisible();
        await expect(projectPapersPage.getPaperByTitle(fullTitleHidden0)).toBeHidden();

        // Stage 1 checks (no matches)
        await projectPapersPage.expectStageCounts(1, `(0 / ${NUM_PAPERS_PER_STAGE} papers)`);
        await expect(projectPapersPage.getPaperByTitle(fullTitleHidden1)).toBeHidden();
        await expect(projectPapersPage.getNoSearchResultsText().last()).toBeVisible();
    });

    test("When the user searches for a specific author, then only papers with matching authors are shown in open stages.", async ({
        projectPapersPage,
    }) => {
        await projectPapersPage.openStage(0);
        await projectPapersPage.openStage(1);

        // Search for part of the author name unique to stage 1 papers
        await projectPapersPage.search("Beta Author");

        // Stage 0 checks (no matches)
        await projectPapersPage.expectStageCounts(0, `(0 / ${NUM_PAPERS_PER_STAGE} papers)`);
        const paper0Title = `Paper 0/0 (${getUniqueSequence(0)})`;
        await expect(projectPapersPage.getPaperByTitle(paper0Title)).toBeHidden();
        await expect(projectPapersPage.getNoSearchResultsText().first()).toBeVisible();

        // Stage 1 checks (all should match)
        await projectPapersPage.expectStageCounts(
            1,
            `(${NUM_PAPERS_PER_STAGE} / ${NUM_PAPERS_PER_STAGE} papers)`,
        );
        for (let i = 0; i < NUM_PAPERS_PER_STAGE; i++) {
            const paperIndexInTotal = NUM_PAPERS_PER_STAGE + i;
            const paperTitle = `Paper 1/${i} (${getUniqueSequence(paperIndexInTotal)})`;
            await expect(projectPapersPage.getPaperByTitle(paperTitle)).toBeVisible();
        }
    });

    test("When the user performs a search yielding no results, then the 'no results' message is shown.", async ({
        projectPapersPage,
    }) => {
        await projectPapersPage.openStage(0);
        await projectPapersPage.openStage(1);

        await projectPapersPage.search("ThisWillYieldNoResults");

        // Check counts
        await projectPapersPage.expectStageCounts(0, `(0 / ${NUM_PAPERS_PER_STAGE} papers)`);
        await projectPapersPage.expectStageCounts(1, `(0 / ${NUM_PAPERS_PER_STAGE} papers)`);

        // Check messages
        await expect(projectPapersPage.getNoSearchResultsText().first()).toBeVisible();
        await expect(projectPapersPage.getNoSearchResultsText().last()).toBeVisible();
    });

    test("When the user clears the search using Escape, then all papers are shown again.", async ({
        projectPapersPage,
    }) => {
        const searchPaperIndex = 3; // Paper 0/3
        const hiddenPaperIndexStage0 = 1; // Paper 0/1

        const uniqueSequenceSearch = getUniqueSequence(searchPaperIndex);
        const fullTitleSearch = `Paper 0/3 (${uniqueSequenceSearch})`;
        const fullTitleHidden0 = `Paper 0/1 (${getUniqueSequence(hiddenPaperIndexStage0)})`;

        await projectPapersPage.openStage(0);
        await projectPapersPage.search(uniqueSequenceSearch);

        // Verify filtered state
        await projectPapersPage.expectStageCounts(0, `(1 / ${NUM_PAPERS_PER_STAGE} papers)`);
        await expect(projectPapersPage.getPaperByTitle(fullTitleSearch)).toBeVisible();
        await expect(projectPapersPage.getPaperByTitle(fullTitleHidden0)).toBeHidden();

        await projectPapersPage.clearSearchViaEscape();

        // Verify reset state
        await projectPapersPage.expectStageCounts(0, `(${NUM_PAPERS_PER_STAGE} papers)`);
        for (let i = 0; i < NUM_PAPERS_PER_STAGE; i++) {
            const paperTitle = `Paper 0/${i} (${getUniqueSequence(i)})`;
            await expect(projectPapersPage.getPaperByTitle(paperTitle)).toBeVisible();
        }
    });
});
