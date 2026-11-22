import type { PageLoad } from "./$types";
import {
    getProjectInformation,
    listArchivedProjectsForUser,
    listProjectsForUser,
} from "#lib/api/project.js";
import { getProjectMembers } from "#lib/api/project-member.js";
import { getPapersToReview } from "#lib/api/project-paper.js";
import type { Project, User } from "#lib/api/types.js";
import type { ProjectListEntryInterface } from "#lib/components/composites/project-components/ProjectListEntry.svelte";
import type { PaperListEntryInterface } from "#lib/components/composites/paper-components/PaperListEntry.svelte";

async function requestProjectInformation(project: Project): Promise<ProjectListEntryInterface> {
    const [members, information] = await Promise.all([
        getProjectMembers(project.id),
        getProjectInformation(project.id),
    ]);

    return { project, members, information };
}

async function requestUndecidedPapers(project: Project): Promise<PaperListEntryInterface[]> {
    const allUndecidedPapers = await getPapersToReview(project.id);

    return allUndecidedPapers.map((projectPaper) => ({
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

    const allActiveUserProjects = listProjectsForUser(userId);
    const allArchivedUserProjects = listArchivedProjectsForUser(userId);

    const projectsMetadata: Promise<ProjectListEntryInterface[]> = Promise.all([
        allActiveUserProjects,
        allArchivedUserProjects,
    ])
        .then(async ([active, archived]) => {
            try {
                return await Promise.all(
                    active.concat(archived).map((project) => requestProjectInformation(project)),
                );
            } catch {
                throw new Error("Couldn't load project details.");
            }
        })
        .catch(() => {
            throw new Error("Couldn't load projects.");
        });

    const openReviews: Promise<PaperListEntryInterface[]> = allActiveUserProjects
        .then(async (activeProjects) => {
            try {
                return await Promise.all(
                    activeProjects.map((project) => requestUndecidedPapers(project)),
                );
            } catch {
                throw new Error("Couldn't load open reviews.");
            }
        })
        .then((openReviews) => openReviews.flat())
        .catch(() => {
            throw new Error("Couldn't load open reviews.");
        });

    return { projectsMetadata, openReviews };
};
