import { beforeEach, describe, expect, test, vi } from "vitest";
import { ReviewDecision } from "snowballr-api/review";
import { client } from "$lib/api/client";
import { load } from "../../../../src/routes/project/[projectId]/paper/[paperId]/+page";
import {
    createCriterion,
    createPaper,
    createProjectPaper,
    createReview,
    createUser,
} from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

type ProjectPaperPageData = Record<
    | "loadingProjectPaper"
    | "backwardReferencedPapers"
    | "forwardReferencedPapers"
    | "reviewers"
    | "criteriaWithReviews",
    Promise<unknown>
>;

const PROJECT_ID = "project-1";
const LOCAL_ID = "7";

const firstReview = createReview({
    id: "r1",
    userId: "u1",
    decision: ReviewDecision.ACCEPTED,
    selectedCriteriaIds: ["c1"],
});
const secondReview = createReview({
    id: "r2",
    userId: "u2",
    decision: ReviewDecision.DECLINED,
    selectedCriteriaIds: ["c1", "c2"],
});
const projectPaper = createProjectPaper({
    id: "pp-1",
    localId: LOCAL_ID,
    paper: createPaper({ id: "paper-1" }),
    reviews: [firstReview, secondReview],
});
const criteria = [createCriterion({ id: "c1" }), createCriterion({ id: "c2" })];
const backwardPapers = [createPaper({ id: "backward-1" })];
const forwardPapers = [createPaper({ id: "forward-1" })];

function loadProjectPaperPage(): ProjectPaperPageData {
    const event = { params: { projectId: PROJECT_ID, paperId: LOCAL_ID } };
    return load(event as unknown as Parameters<typeof load>[0]) as ProjectPaperPageData;
}

/** Waits for every promise of the page data and reports which of them rejected. */
async function settle(data: ProjectPaperPageData) {
    const entries = Object.entries(data);
    const results = await Promise.allSettled(entries.map(([, promise]) => promise));
    return Object.fromEntries(entries.map(([key], i) => [key, results[i].status]));
}

describe("Project paper page loader", () => {
    beforeEach(() => {
        mockApiCall("getProjectPaperByRelativeId", projectPaper);
        mockApiCall("getBackwardReferencedPapers", { papers: backwardPapers });
        mockApiCall("getForwardReferencedPapers", { papers: forwardPapers });
        mockApiCall("getAllCriteriaForProject", { criteria });
    });

    test("When the page loads, then the project paper is requested by the local ID from the URL", async () => {
        const getProjectPaperCall = mockApiCall("getProjectPaperByRelativeId", projectPaper);
        const getCriteriaCall = mockApiCall("getAllCriteriaForProject", { criteria });

        const data = loadProjectPaperPage();
        await settle(data);

        await expect(data.loadingProjectPaper).resolves.toEqual(projectPaper);
        expect(getProjectPaperCall).toHaveBeenCalledExactlyOnceWith({
            projectId: PROJECT_ID,
            relativeProjectPaperId: LOCAL_ID,
        });
        expect(getCriteriaCall).toHaveBeenCalledExactlyOnceWith({ id: PROJECT_ID });
    });

    test("When the page loads, then the references of the paper are requested by its paper ID", async () => {
        const getBackwardCall = mockApiCall("getBackwardReferencedPapers", {
            papers: backwardPapers,
        });
        const getForwardCall = mockApiCall("getForwardReferencedPapers", { papers: forwardPapers });

        const data = loadProjectPaperPage();

        await expect(data.backwardReferencedPapers).resolves.toEqual(backwardPapers);
        await expect(data.forwardReferencedPapers).resolves.toEqual(forwardPapers);
        expect(getBackwardCall).toHaveBeenCalledExactlyOnceWith({ id: "paper-1" });
        expect(getForwardCall).toHaveBeenCalledExactlyOnceWith({ id: "paper-1" });
    });

    test("When the page loads, then each criterion lists the reviews that selected it", async () => {
        const data = loadProjectPaperPage();

        await expect(data.criteriaWithReviews).resolves.toEqual([
            {
                ...criteria[0],
                reviews: [
                    { id: "r1", decision: ReviewDecision.ACCEPTED, userId: "u1" },
                    { id: "r2", decision: ReviewDecision.DECLINED, userId: "u2" },
                ],
            },
            {
                ...criteria[1],
                reviews: [{ id: "r2", decision: ReviewDecision.DECLINED, userId: "u2" }],
            },
        ]);
    });

    test("When the page loads, then each reviewer is loaded once", async () => {
        // The setup's mock returns a user with the requested ID.
        const getUserCall = vi.mocked(client.getUserById).mockClear();

        const data = loadProjectPaperPage();

        await expect(data.reviewers).resolves.toEqual([
            createUser({ id: "u1" }),
            createUser({ id: "u2" }),
        ]);
        expect(getUserCall).toHaveBeenCalledTimes(2);
        expect(getUserCall).toHaveBeenCalledWith({ id: "u1" });
        expect(getUserCall).toHaveBeenCalledWith({ id: "u2" });
    });

    test("When loading the criteria fails, then only the criteria and reviewers fail to load", async () => {
        mockFailedApiCall("getAllCriteriaForProject", "backend down");

        const data = loadProjectPaperPage();

        expect(await settle(data)).toEqual({
            loadingProjectPaper: "fulfilled",
            backwardReferencedPapers: "fulfilled",
            forwardReferencedPapers: "fulfilled",
            reviewers: "rejected",
            criteriaWithReviews: "rejected",
        });
    });

    test("When loading the references fails, then only the references fail to load", async () => {
        mockFailedApiCall("getBackwardReferencedPapers", "backend down");
        mockFailedApiCall("getForwardReferencedPapers", "backend down");

        const data = loadProjectPaperPage();

        expect(await settle(data)).toEqual({
            loadingProjectPaper: "fulfilled",
            backwardReferencedPapers: "rejected",
            forwardReferencedPapers: "rejected",
            reviewers: "fulfilled",
            criteriaWithReviews: "fulfilled",
        });
    });

    test("When loading the project paper fails, then nothing loads", async () => {
        mockFailedApiCall("getProjectPaperByRelativeId", "backend down");

        const data = loadProjectPaperPage();

        expect(await settle(data)).toEqual({
            loadingProjectPaper: "rejected",
            backwardReferencedPapers: "rejected",
            forwardReferencedPapers: "rejected",
            reviewers: "rejected",
            criteriaWithReviews: "rejected",
        });
    });
});
