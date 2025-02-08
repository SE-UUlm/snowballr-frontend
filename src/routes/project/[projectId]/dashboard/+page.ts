import type { PaperListEntryInterface } from "$lib/model/general";
import { backendService } from "$lib/grpc-api";
import type { PageLoad } from "./$types";
import type { Project } from "$lib/model/api/project";
import type { ProjectInformationInterface } from "$lib/model/component-interfaces";

function requestProjectInformation(project: Project): ProjectInformationInterface {
    // TODO: add a real call to the backend (extend API + extend mock backend)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);

    return {
        projectName: project.name,
        projectStart: startDate,
        projectStage: project.currentStage,
        daysInStage: 2,
        estimatedRemainingDays: 14,
        totalPapersInStage: 100,
        reviewedPapersInStage: 20,
    };
}

/**
 * Loads open reviews for the currently opened project.
 */
export const load: PageLoad = async ({ params, parent }) => {
    const { loadingProject } = await parent();
    const openReviews: Promise<PaperListEntryInterface[]> = backendService
        .getPapersToReviewForProject({
            id: params.projectId,
        })
        .response.then((allUndecidedPapers) =>
            allUndecidedPapers.projectPapers.map((projectPaper) => ({
                projectId: params.projectId,
                paper: projectPaper,
                showReviewStatus: false,
            })),
        )
        .catch(() => {
            throw new Error("Could not load open reviews.");
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    openReviews.catch(() => {});

    const projectInformation = loadingProject.then((project) => requestProjectInformation(project));

    return { openReviews, projectInformation };
};
