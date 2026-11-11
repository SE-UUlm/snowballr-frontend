import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemberRole, Project_Information } from "snowballr-api/project";
import { load } from "../../../src/routes/+page";
import { createProject, createProjectPaper, createUser } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

interface HomePageData {
    projectsMetadata: Promise<unknown[]>;
    openReviews: Promise<unknown[]>;
}

const user = createUser({ id: "user-1" });
const activeProject = createProject({ id: "active-1" });
const archivedProject = createProject({ id: "archived-1" });
const members = [{ user, role: MemberRole.ADMIN }];
const information = Project_Information.create({ projectProgress: 0.5 });
const paperToReview = createProjectPaper({ id: "paper-1" });

async function loadHomePage(signedInUser: typeof user | null = user): Promise<HomePageData> {
    const event = { depends: vi.fn(), parent: async () => ({ user: signedInUser }) };
    return (await load(event as unknown as Parameters<typeof load>[0])) as HomePageData;
}

describe("Home page loader", () => {
    beforeEach(() => {
        mockApiCall("getAllProjectsForUser", { projects: [activeProject] });
        mockApiCall("getAllArchivedProjectsForUser", { projects: [archivedProject] });
        mockApiCall("getProjectMembers", { members });
        mockApiCall("getProjectInformation", information);
        mockApiCall("getPapersToReviewForProject", { projectPapers: [paperToReview] });
    });

    test("When the projects load, then the active and archived ones come with their members and information", async () => {
        const { projectsMetadata } = await loadHomePage();

        await expect(projectsMetadata).resolves.toEqual([
            { project: activeProject, membersList: { members }, information },
            { project: archivedProject, membersList: { members }, information },
        ]);
    });

    test("When the projects load, then the papers to review of the active projects are listed", async () => {
        const getPapersCall = mockApiCall("getPapersToReviewForProject", {
            projectPapers: [paperToReview],
        });

        const { openReviews } = await loadHomePage();

        await expect(openReviews).resolves.toEqual([
            { paper: paperToReview, projectId: activeProject.id, showReviewStatus: false },
        ]);
        expect(getPapersCall).toHaveBeenCalledExactlyOnceWith({ id: activeProject.id });
    });

    test("When loading the projects fails, then both lists fail to load", async () => {
        mockFailedApiCall("getAllProjectsForUser", "backend down");

        const { projectsMetadata, openReviews } = await loadHomePage();

        await expect(projectsMetadata).rejects.toThrow("Couldn't load projects.");
        await expect(openReviews).rejects.toThrow("Couldn't load open reviews.");
    });

    test("When loading the members of a project fails, then only the projects fail to load", async () => {
        mockFailedApiCall("getProjectMembers", "backend down");

        const { projectsMetadata, openReviews } = await loadHomePage();

        await expect(projectsMetadata).rejects.toThrow("Couldn't load projects.");
        await expect(openReviews).resolves.toHaveLength(1);
    });

    test("When loading the papers to review fails, then only the open reviews fail to load", async () => {
        mockFailedApiCall("getPapersToReviewForProject", "backend down");

        const { projectsMetadata, openReviews } = await loadHomePage();

        await expect(openReviews).rejects.toThrow("Couldn't load open reviews.");
        await expect(projectsMetadata).resolves.toHaveLength(2);
    });

    test("When no user is signed in, then both lists are empty", async () => {
        const { projectsMetadata, openReviews } = await loadHomePage(null);

        await expect(projectsMetadata).resolves.toEqual([]);
        await expect(openReviews).resolves.toEqual([]);
    });
});
