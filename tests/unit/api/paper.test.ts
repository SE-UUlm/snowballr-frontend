import { describe, expect, test } from "vitest";
import { ApiError } from "$lib/api/errors";
import { getBackwardReferencedPapers, getForwardReferencedPapers, getPaper } from "$lib/api/paper";
import { createPaper } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

const PAPER_ID = "paper-1";

describe("getPaper", () => {
    test("When a paper is loaded, then it is requested by its ID and returned", async () => {
        const paper = createPaper({ id: PAPER_ID });
        const getPaperCall = mockApiCall("getPaperById", paper);

        await expect(getPaper(PAPER_ID)).resolves.toEqual(paper);
        expect(getPaperCall).toHaveBeenCalledExactlyOnceWith({ id: PAPER_ID });
    });
});

describe("getBackwardReferencedPapers", () => {
    test("When the references of a paper are loaded, then they are requested by its ID and returned", async () => {
        const papers = [createPaper({ id: "backward-1" })];
        const getBackwardCall = mockApiCall("getBackwardReferencedPapers", { papers });

        await expect(getBackwardReferencedPapers(PAPER_ID)).resolves.toEqual(papers);
        expect(getBackwardCall).toHaveBeenCalledExactlyOnceWith({ id: PAPER_ID });
    });
});

describe("getForwardReferencedPapers", () => {
    test("When the citing papers of a paper are loaded, then they are requested by its ID and returned", async () => {
        const papers = [createPaper({ id: "forward-1" })];
        const getForwardCall = mockApiCall("getForwardReferencedPapers", { papers });

        await expect(getForwardReferencedPapers(PAPER_ID)).resolves.toEqual(papers);
        expect(getForwardCall).toHaveBeenCalledExactlyOnceWith({ id: PAPER_ID });
    });
});

describe("paper calls", () => {
    test.each([
        ["getPaper", "getPaperById", () => getPaper(PAPER_ID)],
        [
            "getBackwardReferencedPapers",
            "getBackwardReferencedPapers",
            () => getBackwardReferencedPapers(PAPER_ID),
        ],
        [
            "getForwardReferencedPapers",
            "getForwardReferencedPapers",
            () => getForwardReferencedPapers(PAPER_ID),
        ],
    ] as const)("When %s fails, then it rejects with an ApiError", async (_, method, run) => {
        mockFailedApiCall(method, "backend down");

        await expect(run()).rejects.toBeInstanceOf(ApiError);
    });
});
