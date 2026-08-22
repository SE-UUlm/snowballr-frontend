import { expect } from "@playwright/test";
import { test, LOCAL_CANDIDATE_TITLES, SEARCH_QUERY } from "./add-paper-dialog-fixtures";
import { fetcherOnlyPaperTitles } from "./add-paper-dialog-model";
import { reloadWait } from "$tests/e2e/utils/helper/helper";

test.describe("Add Paper Dialog", () => {
    test("When both sources are searched, then local papers and fetcher-only papers are offered", async ({
        addPaperDialog,
    }) => {
        await addPaperDialog.open();
        await addPaperDialog.setSources({ local: true, fetchers: true });
        await addPaperDialog.search(SEARCH_QUERY);

        for (const title of LOCAL_CANDIDATE_TITLES) {
            await expect(addPaperDialog.getAvailablePaper(title)).toBeVisible();
        }
        // None of the papers only the fetchers know about may be dropped, whatever their position
        // in the fetcher response is.
        for (const title of fetcherOnlyPaperTitles(SEARCH_QUERY)) {
            await expect(addPaperDialog.getAvailablePaper(title)).toBeVisible();
        }
    });

    test("When only the local database is searched, then no fetcher-only paper is offered", async ({
        addPaperDialog,
    }) => {
        await addPaperDialog.open();
        await addPaperDialog.setSources({ local: true, fetchers: false });
        await addPaperDialog.search(SEARCH_QUERY);

        await expect(addPaperDialog.getAvailablePaper(LOCAL_CANDIDATE_TITLES[0])).toBeVisible();
        await expect(
            addPaperDialog.getAvailablePaper(fetcherOnlyPaperTitles(SEARCH_QUERY)[0]),
        ).toBeHidden();
    });

    // A paper that only a fetcher knows has to be created before it can be added, and the id it is
    // created with is the one the backend must accept. The unit tests cannot show that: they assert
    // the id against a value they made up themselves.
    test("When a paper only the fetchers know is added, then it is stored in the stage", async ({
        page,
        addPaperDialog,
    }) => {
        const [fetcherOnlyTitle] = fetcherOnlyPaperTitles(SEARCH_QUERY);

        await addPaperDialog.open();
        await addPaperDialog.setSources({ local: false, fetchers: true });
        await addPaperDialog.search(SEARCH_QUERY);
        await addPaperDialog.selectPaper(fetcherOnlyTitle);
        await addPaperDialog.addSelectedPapers();

        await addPaperDialog.openStage();
        await expect(addPaperDialog.getPaperInStage(fetcherOnlyTitle)).toBeVisible();

        // It survives a reload, so it really reached the backend rather than only the page.
        await reloadWait(page, addPaperDialog.stageTrigger);
        await addPaperDialog.openStage();
        await expect(addPaperDialog.getPaperInStage(fetcherOnlyTitle)).toBeVisible();
    });

    // Papers that already exist are adopted rather than created a second time. If they were created
    // again, the project would hold a copy and the original would still be offered as a candidate.
    test("When a paper from the local database is added, then it is no longer offered", async ({
        addPaperDialog,
    }) => {
        const [localTitle] = LOCAL_CANDIDATE_TITLES;

        await addPaperDialog.open();
        await addPaperDialog.setSources({ local: true, fetchers: false });
        await addPaperDialog.search(SEARCH_QUERY);
        await addPaperDialog.selectPaper(localTitle);
        await addPaperDialog.addSelectedPapers();

        await addPaperDialog.openStage();
        await expect(addPaperDialog.getPaperInStage(localTitle)).toBeVisible();

        await addPaperDialog.open();
        await addPaperDialog.setSources({ local: true, fetchers: false });
        await addPaperDialog.search(SEARCH_QUERY);

        await expect(addPaperDialog.getAvailablePaper(localTitle)).toBeHidden();
        await expect(addPaperDialog.getAvailablePaper(LOCAL_CANDIDATE_TITLES[1])).toBeVisible();
    });

    test("When a selected paper is deselected, then it is not added", async ({
        addPaperDialog,
    }) => {
        const [fetcherOnlyTitle, otherFetcherOnlyTitle] = fetcherOnlyPaperTitles(SEARCH_QUERY);

        await addPaperDialog.open();
        await addPaperDialog.setSources({ local: false, fetchers: true });
        await addPaperDialog.search(SEARCH_QUERY);
        await addPaperDialog.selectPaper(fetcherOnlyTitle);
        await addPaperDialog.selectPaper(otherFetcherOnlyTitle);
        await addPaperDialog.deselectPaper(fetcherOnlyTitle);
        await addPaperDialog.addSelectedPapers();

        await addPaperDialog.openStage();
        await expect(addPaperDialog.getPaperInStage(otherFetcherOnlyTitle)).toBeVisible();
        await expect(addPaperDialog.getPaperInStage(fetcherOnlyTitle)).toBeHidden();
    });
});
