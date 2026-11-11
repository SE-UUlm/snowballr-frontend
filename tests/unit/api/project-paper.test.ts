import { describe, expect, test } from "vitest";
import { ApiError } from "$lib/api/errors";
import {
    addPaperToProject,
    getNextPaper,
    getNextPaperToReview,
    getPapersToReview,
    getPreviousPaper,
    getProjectPaperByLocalId,
    listProjectPapers,
    searchFetcherPaperCandidates,
    searchLocalPaperCandidates,
} from "$lib/api/project-paper";
import { createPaper, createProjectPaper } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

const PROJECT_ID = "project-1";

describe("listProjectPapers", () => {
    test("When the papers of a project are loaded, then they are requested by project ID and returned", async () => {
        const projectPapers = [createProjectPaper({ id: "1" }), createProjectPaper({ id: "2" })];
        const getPapersCall = mockApiCall("getAllProjectPapersForProject", { projectPapers });

        await expect(listProjectPapers(PROJECT_ID)).resolves.toEqual(projectPapers);
        expect(getPapersCall).toHaveBeenCalledExactlyOnceWith({ id: PROJECT_ID });
    });
});

describe("getProjectPaperByLocalId", () => {
    test("When a project paper is loaded by its local ID, then the project and the local ID are sent", async () => {
        const projectPaper = createProjectPaper({ id: "pp-1", localId: "7" });
        const getProjectPaperCall = mockApiCall("getProjectPaperByRelativeId", projectPaper);

        await expect(getProjectPaperByLocalId(PROJECT_ID, "7")).resolves.toEqual(projectPaper);
        expect(getProjectPaperCall).toHaveBeenCalledExactlyOnceWith({
            projectId: PROJECT_ID,
            relativeProjectPaperId: "7",
        });
    });
});

describe.each([
    ["getNextPaper", "getNextPaper", getNextPaper],
    ["getPreviousPaper", "getPreviousPaper", getPreviousPaper],
    ["getNextPaperToReview", "getNextPaperToReview", getNextPaperToReview],
] as const)("%s", (_, method, navigate) => {
    test("When a neighboring paper is loaded, then the current project paper ID is sent", async () => {
        const neighbor = createProjectPaper({ id: "pp-2" });
        const navigationCall = mockApiCall(method, neighbor);

        await expect(navigate("pp-1")).resolves.toEqual(neighbor);
        expect(navigationCall).toHaveBeenCalledExactlyOnceWith({ id: "pp-1" });
    });

    test("When there is no neighboring paper, then it rejects with a failed-precondition error", async () => {
        mockFailedApiCall(method, "no paper left", "FAILED_PRECONDITION");

        await expect(navigate("pp-1")).rejects.toMatchObject({ kind: "failed-precondition" });
    });
});

describe("addPaperToProject", () => {
    test("When a paper is added to a project, then the project, the paper and the stage are sent", async () => {
        const projectPaper = createProjectPaper({ id: "pp-1", stage: 2n });
        const addPaperCall = mockApiCall("addPaperToProject", projectPaper);

        await expect(addPaperToProject(PROJECT_ID, "paper-1", 2n)).resolves.toEqual(projectPaper);
        expect(addPaperCall).toHaveBeenCalledExactlyOnceWith({
            projectId: PROJECT_ID,
            paperId: "paper-1",
            stage: 2n,
        });
    });
});

describe("getPapersToReview", () => {
    test("When the papers to review are loaded, then they are requested by project ID and returned", async () => {
        const projectPapers = [createProjectPaper({ id: "1" }), createProjectPaper({ id: "2" })];
        const getPapersCall = mockApiCall("getPapersToReviewForProject", { projectPapers });

        await expect(getPapersToReview(PROJECT_ID)).resolves.toEqual(projectPapers);
        expect(getPapersCall).toHaveBeenCalledWith({ id: PROJECT_ID });
    });
});

describe.each([
    ["searchLocalPaperCandidates", "searchLocalProjectPaperCandidates", searchLocalPaperCandidates],
    [
        "searchFetcherPaperCandidates",
        "searchFetcherProjectPaperCandidates",
        searchFetcherPaperCandidates,
    ],
] as const)("%s", (_, method, search) => {
    test("When candidates are searched, then the query and the project ID are sent", async () => {
        const papers = [createPaper({ id: "1" }), createPaper({ id: "" })];
        const searchCall = mockApiCall(method, { papers });

        await expect(search("snowballing", PROJECT_ID)).resolves.toEqual(papers);
        expect(searchCall).toHaveBeenCalledExactlyOnceWith({
            query: "snowballing",
            projectId: PROJECT_ID,
        });
    });
});

describe("project paper calls", () => {
    test.each([
        ["listProjectPapers", "getAllProjectPapersForProject", () => listProjectPapers(PROJECT_ID)],
        [
            "getProjectPaperByLocalId",
            "getProjectPaperByRelativeId",
            () => getProjectPaperByLocalId(PROJECT_ID, "7"),
        ],
        ["getPapersToReview", "getPapersToReviewForProject", () => getPapersToReview(PROJECT_ID)],
        [
            "addPaperToProject",
            "addPaperToProject",
            () => addPaperToProject(PROJECT_ID, "paper-1", 0n),
        ],
        [
            "searchLocalPaperCandidates",
            "searchLocalProjectPaperCandidates",
            () => searchLocalPaperCandidates("snowballing", PROJECT_ID),
        ],
        [
            "searchFetcherPaperCandidates",
            "searchFetcherProjectPaperCandidates",
            () => searchFetcherPaperCandidates("snowballing", PROJECT_ID),
        ],
    ] as const)("When %s fails, then it rejects with an ApiError", async (_, method, run) => {
        mockFailedApiCall(method, "backend down");

        await expect(run()).rejects.toBeInstanceOf(ApiError);
    });
});
