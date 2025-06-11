import type { PageLoad } from "./$types";
import { backendService } from "$lib/grpc-api";
import { type Project } from "$lib/model/api/project";
import type { ProjectListEntryInterface } from "$lib/components/composites/project-components/ProjectListEntry.svelte";
import type { PaperListEntryInterface } from "$lib/components/composites/paper-components/PaperListEntry.svelte";
import type { User } from "$lib/model/api/user";

async function requestProjectInformation(project: Project): Promise<ProjectListEntryInterface> {
    const members = await backendService.getProjectMembers({ id: project.id }).response;
    const projectInformation = await backendService.getProjectInformation({
        projectId: project.id,
    }).response;

    return {
        project: project,
        membersList: members,
        information: projectInformation,
    };
}

async function requestUndecidedPapers(project: Project): Promise<PaperListEntryInterface[]> {
    const allUndecidedPapers = await backendService.getPapersToReviewForProject({ id: project.id })
        .response;

    return allUndecidedPapers.projectPapers.map((projectPaper) => ({
        paper: projectPaper,
        projectId: project.id,
        showReviewStatus: false,
    }));
}

/**
 * Loads projects and open reviews for the user logged in.
 *
 * Therefore, request the project ids of the projects, the user logged in is member of and use
 * these ids to request:
 * - the project members
 * - the current project stage
 * - the progress of the current stage
 * - open reviews from the project
 */
export const load: PageLoad = async ({ depends, parent }) => {
    depends("data:allProjectsForUser");

    const parentData = await parent();
    const user = parentData.user as User | null;

    // If the user is not logged in, we return empty arrays for projects and open reviews
    // This is to ensure that the page can still render without errors
    if (!user) {
        return {
            projectsMetadata: Promise.resolve([]),
            openReviews: Promise.resolve([]),
        };
    }

    const userId = user.id;

    const allUserProjects = backendService.getAllProjectsForUser({ id: userId }).response;

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    allUserProjects.catch(() => {});

    const projectsMetadata: Promise<ProjectListEntryInterface[]> = allUserProjects
        .then(async (projectsResponse) => {
            try {
                return await Promise.all(
                    projectsResponse.projects.map((project) => requestProjectInformation(project)),
                );
            } catch {
                throw new Error("Couldn't load project details.");
            }
        })
        .catch(() => {
            throw new Error("Couldn't load projects.");
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    projectsMetadata.catch(() => {});

    const openReviews: Promise<PaperListEntryInterface[]> = allUserProjects
        .then(async (projectsResponse) => {
            try {
                return await Promise.all(
                    projectsResponse.projects.map((project) => requestUndecidedPapers(project)),
                );
            } catch {
                throw new Error("Couldn't load open reviews.");
            }
        })
        .then((openReviews) => openReviews.flat())
        .catch(() => {
            throw new Error("Couldn't load open reviews.");
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    openReviews.catch(() => {});

    return { projectsMetadata, openReviews };
};
