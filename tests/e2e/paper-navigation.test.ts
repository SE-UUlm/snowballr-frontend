import { test } from "./fixtures/paper-view-fixture";
import { createPaper } from "$tests/model-builder";
import { expect } from "@playwright/test";

test.describe("Navigate to referenced paper in paper view", () => {
    const paperIds: string[] = [];

    /** Create 2 papers in order to be able to switch from one paper to the other. */
    test.beforeAll(async ({ mockBackendService }) => {
        const papers = await Promise.all(
            Array.from(
                { length: 2 },
                (_, i) =>
                    mockBackendService.createPaper(
                        createPaper({ title: `Paper ${i} to be referenced` }),
                    ).response,
            ),
        );
        papers.forEach((paper) => paperIds.push(paper.id));
    });

    /**
     * TODO: Delete all papers after the test (Currently not supported by the mock backend).
     */

    test("When clicking on a referenced paper in the paper view (no project paper) the paper view of the referenced paper is shown", async ({
        page,
        paperViewPage,
    }) => {
        await paperViewPage.openPaperView(paperIds[0]);
        await paperViewPage.navigateToReferencedPaper();
        await expect(page.getByText("Paper 1 to be referenced").first()).toBeVisible();
    });
});
