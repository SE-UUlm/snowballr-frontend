import { describe, expect, test } from "vitest";
import { ApiError } from "$lib/api/errors";
import {
    getPapersToReview,
    getProjectPaperByLocalId,
    listProjectPapers,
} from "$lib/api/project-paper";
import { createProjectPaper } from "$tests/model-builder";
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

describe("getPapersToReview", () => {
    test("When the papers to review are loaded, then they are requested by project ID and returned", async () => {
        const projectPapers = [createProjectPaper({ id: "1" }), createProjectPaper({ id: "2" })];
        const getPapersCall = mockApiCall("getPapersToReviewForProject", { projectPapers });

        await expect(getPapersToReview(PROJECT_ID)).resolves.toEqual(projectPapers);
        expect(getPapersCall).toHaveBeenCalledWith({ id: PROJECT_ID });
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
    ] as const)("When %s fails, then it rejects with an ApiError", async (_, method, run) => {
        mockFailedApiCall(method, "backend down");

        await expect(run()).rejects.toBeInstanceOf(ApiError);
    });
});
