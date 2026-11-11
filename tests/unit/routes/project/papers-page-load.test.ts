import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemberRole } from "snowballr-api/project";
import { load } from "../../../../src/routes/project/[projectId]/papers/+page";
import { createCriterion, createPaper, createProjectPaper, createUser } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

type PapersPageData = Record<
    "loadingCriteria" | "loadingStages" | "loadingYears" | "loadingPublishers" | "loadingReviewers",
    Promise<unknown>
>;

const PROJECT_ID = "project-1";

function loadPapersPage() {
    const depends = vi.fn();
    const event = { depends, params: { projectId: PROJECT_ID } };
    const data = load(event as unknown as Parameters<typeof load>[0]) as PapersPageData;
    return { data, depends };
}

/** Waits for every promise of the page data and reports which of them rejected. */
async function settle(data: PapersPageData) {
    const entries = Object.entries(data);
    const results = await Promise.allSettled(entries.map(([, promise]) => promise));
    return Object.fromEntries(entries.map(([key], i) => [key, results[i].status]));
}

describe("Papers page loader", () => {
    const criteria = [createCriterion({ id: "c1" })];
    const reviewer = createUser({ id: "u1" });

    beforeEach(() => {
        mockApiCall("getAllCriteriaForProject", { criteria });
        mockApiCall("getAllProjectPapersForProject", { projectPapers: [] });
        mockApiCall("getProjectMembers", { members: [{ user: reviewer, role: MemberRole.ADMIN }] });
    });

    test("When the page loads, then the criteria, papers and members of the project are requested", async () => {
        const getCriteriaCall = mockApiCall("getAllCriteriaForProject", { criteria });
        const getPapersCall = mockApiCall("getAllProjectPapersForProject", { projectPapers: [] });
        const getMembersCall = mockApiCall("getProjectMembers", { members: [] });

        const { data, depends } = loadPapersPage();
        await settle(data);

        expect(depends).toHaveBeenCalledExactlyOnceWith("data:getAllProjectPapersForProject");
        expect(getCriteriaCall).toHaveBeenCalledExactlyOnceWith({ id: PROJECT_ID });
        expect(getPapersCall).toHaveBeenCalledExactlyOnceWith({ id: PROJECT_ID });
        expect(getMembersCall).toHaveBeenCalledExactlyOnceWith({ id: PROJECT_ID });
    });

    test("When the page loads, then the criteria and the users of the members are returned", async () => {
        const { data } = loadPapersPage();

        await expect(data.loadingCriteria).resolves.toEqual(criteria);
        await expect(data.loadingReviewers).resolves.toEqual([reviewer]);
    });

    test("When the papers load, then they are grouped by stage and sorted by local ID", async () => {
        const papers = [
            createProjectPaper({ id: "a", stage: 1n, localId: "10" }),
            createProjectPaper({ id: "b", stage: 0n, localId: "5" }),
            createProjectPaper({ id: "c", stage: 1n, localId: "2" }),
        ];
        mockApiCall("getAllProjectPapersForProject", { projectPapers: papers });

        const { data } = loadPapersPage();

        await expect(data.loadingStages).resolves.toEqual([
            { stageIndex: 0n, papers: [papers[1]] },
            { stageIndex: 1n, papers: [papers[2], papers[0]] },
        ]);
    });

    test("When the project has no papers, then there is one empty stage 0", async () => {
        const { data } = loadPapersPage();

        await expect(data.loadingStages).resolves.toEqual([{ stageIndex: 0n, papers: [] }]);
    });

    test("When the papers load, then their distinct years and publishers are listed", async () => {
        mockApiCall("getAllProjectPapersForProject", {
            projectPapers: [
                createProjectPaper({ paper: createPaper({ year: 2020, publisher: "ACM" }) }),
                createProjectPaper({ paper: createPaper({ year: 2021, publisher: "ACM" }) }),
                createProjectPaper({ paper: createPaper({ year: 2020, publisher: "IEEE" }) }),
            ],
        });

        const { data } = loadPapersPage();

        await expect(data.loadingYears).resolves.toEqual([2020, 2021]);
        await expect(data.loadingPublishers).resolves.toEqual(["ACM", "IEEE"]);
    });

    test("When loading the papers fails, then only the stages, years and publishers fail to load", async () => {
        mockFailedApiCall("getAllProjectPapersForProject", "backend down");

        const { data } = loadPapersPage();

        expect(await settle(data)).toEqual({
            loadingCriteria: "fulfilled",
            loadingStages: "rejected",
            loadingYears: "rejected",
            loadingPublishers: "rejected",
            loadingReviewers: "fulfilled",
        });
    });

    test("When loading the criteria or the members fails, then only that part fails to load", async () => {
        mockFailedApiCall("getAllCriteriaForProject", "backend down");
        mockFailedApiCall("getProjectMembers", "backend down");

        const { data } = loadPapersPage();

        expect(await settle(data)).toEqual({
            loadingCriteria: "rejected",
            loadingStages: "fulfilled",
            loadingYears: "fulfilled",
            loadingPublishers: "fulfilled",
            loadingReviewers: "rejected",
        });
    });
});
