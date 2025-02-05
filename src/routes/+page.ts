import type { PageLoad } from "./$types";
import { BACKEND } from "$lib/grpc-api";
import { Nothing } from "$lib/model/api/base";
import { type Project } from "$lib/model/api/project";
import type { PaperListEntryInterface, ProjectListEntryInterface } from "$lib/model/general";

async function requestProjectInformation(project: Project): Promise<ProjectListEntryInterface> {
    const members = await BACKEND.getProjectMembers({ id: project.id }).response;
    const statistics = await BACKEND.getProjectStatistics({
        projectId: project.id,
    }).response;

    return {
        project: project,
        membersList: members,
        statistics: statistics,
    };
}

async function requestUndecidedPapers(project: Project): Promise<PaperListEntryInterface[]> {
    const allUndecidedPapers = await BACKEND.getAllPapersToReview(Nothing).response;

    return allUndecidedPapers.projectPapers.map((projectPaper) => ({
        projectPaper: projectPaper,
        projectId: project.id,
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
export const load: PageLoad = async () => {
    const thisUserId = "0";
    const allUserProjects = BACKEND.getAllProjectsForUser({ id: thisUserId });

    const projectsMetadata: Promise<ProjectListEntryInterface[]> = allUserProjects.response
        .then(async (projectsResponse) => {
            try {
                return await Promise.all(
                    projectsResponse.projects.map((project) => requestProjectInformation(project)),
                );
            } catch {
                throw new Error("Could not load project details.");
            }
        })
        .catch(() => {
            throw new Error("Could not load projects.");
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    projectsMetadata.catch(() => {});

    const openReviews: Promise<PaperListEntryInterface[]> = allUserProjects.response
        .then(async (projectsResponse) => {
            try {
                return await Promise.all(
                    projectsResponse.projects.map((project) => requestUndecidedPapers(project)),
                );
            } catch {
                throw new Error("Could not load open reviews.");
            }
        })
        .then((openReviews) => openReviews.flat())
        .catch(() => {
            throw new Error("Could not load open reviews.");
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    openReviews.catch(() => {});

    return { projectsMetadata, openReviews };
};
