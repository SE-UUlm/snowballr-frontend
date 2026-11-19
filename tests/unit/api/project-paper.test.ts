import { describe, expect, test } from "vitest";
import { ApiError } from "$lib/api/errors";
import { getPapersToReview } from "$lib/api/project-paper";
import { createProjectPaper } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("getPapersToReview", () => {
    test("When the papers to review are loaded, then they are requested by project ID and returned", async () => {
        const projectPapers = [createProjectPaper({ id: "1" }), createProjectPaper({ id: "2" })];
        const getPapersCall = mockApiCall("getPapersToReviewForProject", { projectPapers });

        await expect(getPapersToReview("project-1")).resolves.toEqual(projectPapers);
        expect(getPapersCall).toHaveBeenCalledWith({ id: "project-1" });
    });

    test("When loading the papers to review fails, then it rejects with an ApiError", async () => {
        mockFailedApiCall("getPapersToReviewForProject", "backend down");

        await expect(getPapersToReview("project-1")).rejects.toBeInstanceOf(ApiError);
    });
});
