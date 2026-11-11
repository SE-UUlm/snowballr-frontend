import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
    PaperDecision,
    Project_Information,
    Project_Information_DecisionStatistics,
} from "snowballr-api/project";
import { Timestamp } from "snowballr-api/google/protobuf/timestamp";
import { load } from "../../../../src/routes/project/[projectId]/dashboard/+page";
import { createProject, createProjectPaper } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

interface DashboardData {
    openReviews: Promise<unknown[]>;
    projectInformation: Promise<unknown>;
    stageProgress: Promise<unknown>;
}

const project = createProject({ id: "project-1", name: "Demo", currentStage: 1n });
const information = Project_Information.create({
    creationDate: Timestamp.fromDate(new Date("2026-01-01T00:00:00Z")),
    lastStageStarted: Timestamp.fromDate(new Date("2026-01-06T00:00:00Z")),
});
// 3 of 6 papers in the stage are reviewed.
const statistics = Project_Information_DecisionStatistics.create({
    statistics: [
        { decision: PaperDecision.ACCEPTED, count: 2n },
        { decision: PaperDecision.DECLINED, count: 1n },
        { decision: PaperDecision.UNREVIEWED, count: 3n },
    ],
});

async function loadDashboard(): Promise<DashboardData> {
    const event = {
        params: { projectId: project.id },
        parent: async () => ({ loadingProject: Promise.resolve(project) }),
    };
    return (await load(event as unknown as Parameters<typeof load>[0])) as DashboardData;
}

describe("Dashboard page loader", () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2026-01-11T00:00:00Z"));
        mockApiCall("getProjectInformation", information);
        mockApiCall("getDecisionStatisticsForStage", statistics);
        mockApiCall("getPapersToReviewForProject", { projectPapers: [] });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test("When the dashboard loads, then the information and statistics of the current stage are requested", async () => {
        const getInformationCall = mockApiCall("getProjectInformation", information);
        const getStatisticsCall = mockApiCall("getDecisionStatisticsForStage", statistics);

        const { projectInformation } = await loadDashboard();
        await projectInformation;

        expect(getInformationCall).toHaveBeenCalledExactlyOnceWith({ projectId: project.id });
        expect(getStatisticsCall).toHaveBeenCalledExactlyOnceWith({
            projectId: project.id,
            stage: 1n,
        });
    });

    test("When the dashboard loads, then the project information is computed from the information and statistics", async () => {
        const { projectInformation } = await loadDashboard();

        await expect(projectInformation).resolves.toEqual({
            projectName: "Demo",
            projectStart: new Date("2026-01-01T00:00:00Z"),
            projectStage: 1n,
            daysInStage: 5,
            estimatedRemainingDays: 5,
            totalPapersInStage: 6,
            reviewedPapersInStage: 3,
        });
    });

    test("When the dashboard loads, then the stage progress shows the statistics of the current stage", async () => {
        const { stageProgress } = await loadDashboard();

        await expect(stageProgress).resolves.toEqual({ stage: 1n, decisions: statistics });
    });

    test("When the dashboard loads, then the papers to review are sorted by stage and then by local ID", async () => {
        const papers = [
            createProjectPaper({ id: "a", stage: 1n, localId: "2" }),
            createProjectPaper({ id: "b", stage: 0n, localId: "5" }),
            createProjectPaper({ id: "c", stage: 1n, localId: "10" }),
        ];
        const getPapersCall = mockApiCall("getPapersToReviewForProject", { projectPapers: papers });

        const { openReviews } = await loadDashboard();

        await expect(openReviews).resolves.toEqual(
            [papers[1], papers[2], papers[0]].map((paper) => ({
                projectId: project.id,
                paper,
                showReviewStatus: true,
            })),
        );
        expect(getPapersCall).toHaveBeenCalledExactlyOnceWith({ id: project.id });
    });

    test("When the project has no creation date, then the missing start date is reported", async () => {
        mockApiCall("getProjectInformation", { ...information, creationDate: undefined });

        const { projectInformation } = await loadDashboard();

        await expect(projectInformation).rejects.toThrow("Couldn't load start date of project.");
    });

    test("When loading the project information fails, then only the project information fails to load", async () => {
        mockFailedApiCall("getProjectInformation", "backend down");

        const { projectInformation, stageProgress } = await loadDashboard();

        await expect(projectInformation).rejects.toThrow("Couldn't load project information.");
        await expect(stageProgress).resolves.toBeDefined();
    });

    test("When loading the statistics fails, then the information and the stage progress fail to load", async () => {
        mockFailedApiCall("getDecisionStatisticsForStage", "backend down");

        const { projectInformation, stageProgress } = await loadDashboard();

        await expect(projectInformation).rejects.toThrow("Couldn't load project information.");
        await expect(stageProgress).rejects.toThrow("Couldn't load stage progress.");
    });

    test("When loading the papers to review fails, then the open reviews fail to load", async () => {
        mockFailedApiCall("getPapersToReviewForProject", "backend down");

        const { openReviews } = await loadDashboard();

        await expect(openReviews).rejects.toThrow("Couldn't load open reviews.");
    });
});
