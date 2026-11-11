import { describe, expect, test } from "vitest";
import {
    PaperDecision,
    Project,
    Project_Information,
    Project_Information_DecisionStatistics,
    Project_Settings,
    ProjectStatus,
} from "snowballr-api/project";
import { ApiError } from "$lib/api/errors";
import {
    createProject,
    deleteProject,
    emptyProject,
    getDecisionStatisticsForStage,
    getProject,
    getProjectInformation,
    listArchivedProjectsForUser,
    listProjectsForUser,
    renameProject,
    setProjectFetchers,
    setProjectStatus,
    updateProjectSettings,
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

describe("renameProject", () => {
    test("When a project is renamed, then only the name is masked", async () => {
        const renamedProject = buildProject({ id: PROJECT_ID, name: "New Name" });
        const updateProjectCall = mockApiCall("updateProject", renamedProject);

        await expect(renameProject(PROJECT_ID, "New Name")).resolves.toEqual(renamedProject);
        expect(updateProjectCall).toHaveBeenCalledExactlyOnceWith({
            project: Project.create({ id: PROJECT_ID, name: "New Name" }),
            mask: { paths: ["project.name"] },
        });
    });
});

describe("setProjectStatus", () => {
    test.each([ProjectStatus.ARCHIVED, ProjectStatus.ACTIVE])(
        "When the status is set to %s, then only the status is masked",
        async (status) => {
            const updateProjectCall = mockApiCall("updateProject", buildProject({ status }));

            await setProjectStatus(PROJECT_ID, status);

            expect(updateProjectCall).toHaveBeenCalledExactlyOnceWith({
                project: Project.create({ id: PROJECT_ID, status }),
                mask: { paths: ["project.status"] },
            });
        },
    );
});

describe("setProjectFetchers", () => {
    test("When the fetchers are set, then only the fetchers map is masked", async () => {
        const fetchers = { test: { options: { limit: "10" } } };
        const updatedProject = buildProject({ id: PROJECT_ID });
        const updateProjectCall = mockApiCall("updateProject", updatedProject);

        await expect(setProjectFetchers(PROJECT_ID, fetchers)).resolves.toEqual(updatedProject);
        expect(updateProjectCall).toHaveBeenCalledExactlyOnceWith({
            project: Project.create({
                id: PROJECT_ID,
                settings: Project_Settings.create({ fetchers }),
            }),
            mask: { paths: ["project.settings.fetchers"] },
        });
    });
});

describe("updateProjectSettings", () => {
    test("When a setting is updated, then the value is sent and only that setting is masked", async () => {
        const updateProjectCall = mockApiCall("updateProject", buildProject());

        await updateProjectSettings(PROJECT_ID, { similarityThreshold: 0.65 });

        expect(updateProjectCall).toHaveBeenCalledExactlyOnceWith({
            project: Project.create({ id: PROJECT_ID, settings: { similarityThreshold: 0.65 } }),
            mask: { paths: ["project.settings.similarity_threshold"] },
        });
    });

    test("When a nested setting is updated, then the masked path is nested and in snake_case", async () => {
        const updateProjectCall = mockApiCall("updateProject", buildProject());

        await updateProjectSettings(PROJECT_ID, { decisionMatrix: { numberOfReviewers: 3 } });

        expect(updateProjectCall).toHaveBeenCalledExactlyOnceWith({
            project: Project.create({
                id: PROJECT_ID,
                settings: { decisionMatrix: { numberOfReviewers: 3 } },
            }),
            mask: { paths: ["project.settings.decision_matrix.number_of_reviewers"] },
        });
    });
});

describe("emptyProject", () => {
    test("When an empty project is created, then every field has its default", () => {
        expect(emptyProject()).toEqual(Project.create());
    });
});

describe("project calls", () => {
    test.each([
        ["getProject", "getProjectById", () => getProject(PROJECT_ID)],
        ["listProjectsForUser", "getAllProjectsForUser", () => listProjectsForUser("user-1")],
        [
            "listArchivedProjectsForUser",
            "getAllArchivedProjectsForUser",
            () => listArchivedProjectsForUser("user-1"),
        ],
        ["getProjectInformation", "getProjectInformation", () => getProjectInformation(PROJECT_ID)],
        [
            "getDecisionStatisticsForStage",
            "getDecisionStatisticsForStage",
            () => getDecisionStatisticsForStage(PROJECT_ID, 0n),
        ],
        ["createProject", "createProject", () => createProject("Demo")],
        ["deleteProject", "softDeleteProject", () => deleteProject(PROJECT_ID)],
        ["renameProject", "updateProject", () => renameProject(PROJECT_ID, "New Name")],
        [
            "setProjectStatus",
            "updateProject",
            () => setProjectStatus(PROJECT_ID, ProjectStatus.ARCHIVED),
        ],
        ["setProjectFetchers", "updateProject", () => setProjectFetchers(PROJECT_ID, {})],
        [
            "updateProjectSettings",
            "updateProject",
            () => updateProjectSettings(PROJECT_ID, { similarityThreshold: 0.5 }),
        ],
    ] as const)("When %s fails, then it rejects with an ApiError", async (_, method, run) => {
        mockFailedApiCall(method, "backend down");

        await expect(run()).rejects.toBeInstanceOf(ApiError);
    });
});
