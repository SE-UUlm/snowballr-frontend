import { describe, expect, test } from "vitest";
import { Paper } from "snowballr-api/paper";
import { ApiError } from "$lib/api/errors";
import {
    createPaper as createPaperInBackend,
    emptyPaper,
    getBackwardReferencedPapers,
    getForwardReferencedPapers,
    getPaper,
    updatePaperDetails,
} from "$lib/api/paper";
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

describe("createPaper", () => {
    test("When a paper is created, then the paper with defaults for the missing fields is sent", async () => {
        const createdPaper = createPaper({ id: PAPER_ID, title: "New Paper" });
        const createPaperCall = mockApiCall("createPaper", createdPaper);

        await expect(createPaperInBackend({ title: "New Paper", year: 2024 })).resolves.toEqual(
            createdPaper,
        );
        expect(createPaperCall).toHaveBeenCalledExactlyOnceWith(
            Paper.create({ title: "New Paper", year: 2024 }),
        );
    });

    test("When a paper that already exists is created, then it rejects with an already-exists error", async () => {
        mockFailedApiCall("createPaper", "duplicate", "ALREADY_EXISTS");

        await expect(createPaperInBackend({ title: "New Paper" })).rejects.toMatchObject({
            kind: "already-exists",
        });
    });
});

describe("updatePaperDetails", () => {
    test("When all details are updated, then each of them is sent and masked, but not the ID", async () => {
        const details = {
            externalIds: [{ type: "DOI", displayType: "DOI", value: "10.1/x" }],
            title: "Title",
            abstrakt: "Abstract",
            year: 2024,
            publisher: "Publisher",
            publicationName: "Journal",
            publicationType: "Article",
            authors: [{ firstName: "Jane", lastName: "Doe" }],
        };
        const updatedPaper = createPaper({ id: PAPER_ID, ...details });
        const updatePaperCall = mockApiCall("updatePaper", updatedPaper);

        await expect(updatePaperDetails(PAPER_ID, details)).resolves.toEqual(updatedPaper);
        expect(updatePaperCall).toHaveBeenCalledExactlyOnceWith({
            paper: Paper.create({ id: PAPER_ID, ...details }),
            mask: {
                paths: [
                    "paper.external_ids",
                    "paper.title",
                    "paper.abstrakt",
                    "paper.year",
                    "paper.publisher",
                    "paper.publication_name",
                    "paper.publication_type",
                    "paper.authors",
                ],
            },
        });
    });

    test("When some details are updated, then only those are masked", async () => {
        const updatePaperCall = mockApiCall("updatePaper", createPaper());

        await updatePaperDetails(PAPER_ID, { title: "Title", authors: [] });

        expect(updatePaperCall).toHaveBeenCalledExactlyOnceWith({
            paper: Paper.create({ id: PAPER_ID, title: "Title", authors: [] }),
            mask: { paths: ["paper.title", "paper.authors"] },
        });
    });
});

describe("emptyPaper", () => {
    test("When an empty paper is created, then every field has its default", () => {
        expect(emptyPaper()).toEqual(Paper.create());
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
        ["createPaper", "createPaper", () => createPaperInBackend({ title: "New Paper" })],
        [
            "updatePaperDetails",
            "updatePaper",
            () => updatePaperDetails(PAPER_ID, { title: "Title" }),
        ],
    ] as const)("When %s fails, then it rejects with an ApiError", async (_, method, run) => {
        mockFailedApiCall(method, "backend down");

        await expect(run()).rejects.toBeInstanceOf(ApiError);
    });
});
