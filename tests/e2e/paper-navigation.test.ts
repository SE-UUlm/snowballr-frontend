import { test } from "./fixtures/paper-view-fixture";
import { createPaper } from "$tests/model-builder";
import { expect } from "@playwright/test";
import type { Paper } from "$lib/model/api/paper";

test.describe("Navigate to referenced paper in paper view", () => {
    const paperIds: string[] = [];
    let papers: Paper[] = [];

    test.beforeAll(async ({ mockBackendService }) => {
        papers = await Promise.all(
            Array.from(
                { length: 3 },
                (_, i) =>
                    mockBackendService.createPaper(
                        createPaper({ title: `Paper ${i} to be referenced` }),
                    ).response,
            ),
        );
        papers.forEach((paper) => paperIds.push(paper.id));
    });

    test("When clicking on a referenced paper in the paper view (no project paper) the paper view of the referenced paper is shown", async ({
        page,
        paperViewPage,
    }) => {
        await paperViewPage.openPaperView(paperIds[1]);
        await paperViewPage.navigateToReferencedPaper();
        await expect(page.getByText("Paper 0 to be referenced").first()).toBeVisible();
    });
});
