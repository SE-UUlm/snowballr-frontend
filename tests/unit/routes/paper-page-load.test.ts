import { beforeEach, describe, expect, test } from "vitest";
import { load } from "../../../src/routes/paper/[paperId]/+page";
import { createPaper } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

type PaperPageData = Record<
    "loadingPaper" | "backwardReferencedPapers" | "forwardReferencedPapers",
    Promise<unknown>
>;

const paper = createPaper({ id: "paper-1" });
const backwardPapers = [createPaper({ id: "backward-1" })];
const forwardPapers = [createPaper({ id: "forward-1" })];

function loadPaperPage(): PaperPageData {
    const event = { params: { paperId: paper.id } };
    return load(event as unknown as Parameters<typeof load>[0]) as PaperPageData;
}

/** Waits for every promise of the page data and reports which of them rejected. */
async function settle(data: PaperPageData) {
    const entries = Object.entries(data);
    const results = await Promise.allSettled(entries.map(([, promise]) => promise));
    return Object.fromEntries(entries.map(([key], i) => [key, results[i].status]));
}

describe("Paper page loader", () => {
    beforeEach(() => {
        mockApiCall("getPaperById", paper);
        mockApiCall("getBackwardReferencedPapers", { papers: backwardPapers });
        mockApiCall("getForwardReferencedPapers", { papers: forwardPapers });
    });

    test("When the page loads, then the paper and its references are requested by the paper ID", async () => {
        const getPaperCall = mockApiCall("getPaperById", paper);
        const getBackwardCall = mockApiCall("getBackwardReferencedPapers", {
            papers: backwardPapers,
        });
        const getForwardCall = mockApiCall("getForwardReferencedPapers", { papers: forwardPapers });

        const data = loadPaperPage();

        await expect(data.loadingPaper).resolves.toEqual(paper);
        await expect(data.backwardReferencedPapers).resolves.toEqual(backwardPapers);
        await expect(data.forwardReferencedPapers).resolves.toEqual(forwardPapers);
        expect(getPaperCall).toHaveBeenCalledExactlyOnceWith({ id: "paper-1" });
        expect(getBackwardCall).toHaveBeenCalledExactlyOnceWith({ id: "paper-1" });
        expect(getForwardCall).toHaveBeenCalledExactlyOnceWith({ id: "paper-1" });
    });

    test("When loading the references fails, then only the references fail to load", async () => {
        mockFailedApiCall("getBackwardReferencedPapers", "backend down");
        mockFailedApiCall("getForwardReferencedPapers", "backend down");

        const data = loadPaperPage();

        expect(await settle(data)).toEqual({
            loadingPaper: "fulfilled",
            backwardReferencedPapers: "rejected",
            forwardReferencedPapers: "rejected",
        });
    });

    test("When loading the paper fails, then nothing loads", async () => {
        mockFailedApiCall("getPaperById", "backend down");

        const data = loadPaperPage();

        expect(await settle(data)).toEqual({
            loadingPaper: "rejected",
            backwardReferencedPapers: "rejected",
            forwardReferencedPapers: "rejected",
        });
    });
});
