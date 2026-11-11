import { describe, expect, test } from "vitest";
import {
    PaperDecision,
    Project_Information,
    Project_Information_DecisionStatistics,
} from "snowballr-api/project";
import { ApiError } from "$lib/api/errors";
import {
    createProject,
    deleteProject,
    getDecisionStatisticsForStage,
    getProject,
    getProjectInformation,
    listArchivedProjectsForUser,
    listProjectsForUser,
} from "$lib/api/project";
import { createProject as buildProject } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

const PROJECT_ID = "project-1";

describe("getProject", () => {
    test("When a project is loaded, then the project with that ID is requested and returned", async () => {
        const project = buildProject({ id: PROJECT_ID });
        const getProjectByIdCall = mockApiCall("getProjectById", project);

        await expect(getProject(PROJECT_ID)).resolves.toEqual(project);
        expect(getProjectByIdCall).toHaveBeenCalledWith({ id: PROJECT_ID });
    });
});

describe("listProjectsForUser", () => {
    test("When the projects of a user are loaded, then they are returned", async () => {
        const projects = [buildProject({ id: "1" }), buildProject({ id: "2" })];
        const getAllProjectsCall = mockApiCall("getAllProjectsForUser", { projects });

        await expect(listProjectsForUser("user-1")).resolves.toEqual(projects);
        expect(getAllProjectsCall).toHaveBeenCalledWith({ id: "user-1" });
    });
});

describe("listArchivedProjectsForUser", () => {
    test("When the archived projects of a user are loaded, then they are returned", async () => {
        const projects = [buildProject({ id: "1" })];
        const getArchivedProjectsCall = mockApiCall("getAllArchivedProjectsForUser", { projects });

        await expect(listArchivedProjectsForUser("user-1")).resolves.toEqual(projects);
        expect(getArchivedProjectsCall).toHaveBeenCalledWith({ id: "user-1" });
    });
});

describe("getProjectInformation", () => {
    test("When the information is loaded, then it is requested by project ID and returned", async () => {
        const information = Project_Information.create({ projectProgress: 0.3 });
        const getInformationCall = mockApiCall("getProjectInformation", information);

        await expect(getProjectInformation(PROJECT_ID)).resolves.toEqual(information);
        expect(getInformationCall).toHaveBeenCalledWith({ projectId: PROJECT_ID });
    });
});

describe("getDecisionStatisticsForStage", () => {
    test("When the statistics of a stage are loaded, then the project and stage are sent", async () => {
        const statistics = Project_Information_DecisionStatistics.create({
            statistics: [{ decision: PaperDecision.ACCEPTED, count: 3n }],
        });
        const getStatisticsCall = mockApiCall("getDecisionStatisticsForStage", statistics);

        await expect(getDecisionStatisticsForStage(PROJECT_ID, 2n)).resolves.toEqual(statistics);
        expect(getStatisticsCall).toHaveBeenCalledWith({ projectId: PROJECT_ID, stage: 2n });
    });
});

describe("createProject", () => {
    test("When a project is created, then its name is sent and the created project returned", async () => {
        const project = buildProject({ id: PROJECT_ID, name: "Demo" });
        const createProjectCall = mockApiCall("createProject", project);

        await expect(createProject("Demo")).resolves.toEqual(project);
        expect(createProjectCall).toHaveBeenCalledWith({ name: "Demo" });
    });
});

describe("deleteProject", () => {
    test("When a project is deleted, then its ID is sent", async () => {
        const softDeleteCall = mockApiCall("softDeleteProject", {});

        await expect(deleteProject(PROJECT_ID)).resolves.toBeUndefined();
        expect(softDeleteCall).toHaveBeenCalledWith({ id: PROJECT_ID });
    });
});

describe("project calls", () => {
    test.each([
        ["getProjectById", () => getProject(PROJECT_ID)],
        ["getAllProjectsForUser", () => listProjectsForUser("user-1")],
        ["getAllArchivedProjectsForUser", () => listArchivedProjectsForUser("user-1")],
        ["getProjectInformation", () => getProjectInformation(PROJECT_ID)],
        ["getDecisionStatisticsForStage", () => getDecisionStatisticsForStage(PROJECT_ID, 0n)],
        ["createProject", () => createProject("Demo")],
        ["softDeleteProject", () => deleteProject(PROJECT_ID)],
    ] as const)("When %s fails, then it rejects with an ApiError", async (method, run) => {
        mockFailedApiCall(method, "backend down");

        await expect(run()).rejects.toBeInstanceOf(ApiError);
    });
});
