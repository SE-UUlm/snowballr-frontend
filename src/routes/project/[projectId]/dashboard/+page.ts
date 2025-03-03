import { backendService } from "$lib/grpc-api";
import type { PageLoad } from "./$types";
import { PaperDecision, type Project } from "$lib/model/api/project";
import type {
    PaperListEntryInterface,
    ProjectInformationInterface,
    StageProgressInterface,
} from "$lib/model/component-interfaces";
import { exhaustiveCheck, groupBy } from "$lib/utils/common-helper";
import type { PaperStatus } from "$lib/model/general";

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

async function requestStageProgress(project: Project): Promise<StageProgressInterface> {
    const stage = project.currentStage;
    const papersOfStage = await backendService
        .getAllProjectPapersForProject({ id: project.id })
        .response.then((papers) =>
            papers.projectPapers.filter((projectPaper) => projectPaper.stage === stage),
        );
    const groupedPapersOfStage = groupBy(papersOfStage, (projectPaper): PaperStatus => {
        switch (projectPaper.decision) {
            case PaperDecision.ACCEPTED:
                return "Accepted";
            case PaperDecision.DECLINED:
                return "Declined";
            case PaperDecision.UNDECIDED:
            case PaperDecision.UNSPECIFIED:
                return projectPaper.reviews.length > 0 ? "Undecided" : "Not reviewed";
            default:
                exhaustiveCheck(projectPaper.decision);
        }
    });
    const decisions = {
        "Not reviewed": (groupedPapersOfStage["Not reviewed"] ?? []).length,
        Undecided: (groupedPapersOfStage["Undecided"] ?? []).length,
        Accepted: (groupedPapersOfStage["Accepted"] ?? []).length,
        Declined: (groupedPapersOfStage["Declined"] ?? []).length,
    };
    return {
        stage: stage,
        decisions: decisions,
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
            throw new Error("Couldn't load open reviews.");
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    openReviews.catch(() => {});

    /// TODO: delete delays before review (is used for only for testing purpose
    const projectInformation: Promise<ProjectInformationInterface> = loadingProject.then(
        (project) =>
            new Promise((resolve) =>
                setTimeout(() => resolve(requestProjectInformation(project)), 2000),
            ),
    );
    const stageProgress: Promise<StageProgressInterface> = loadingProject.then(
        (project) =>
            new Promise((resolve) =>
                setTimeout(() => resolve(requestStageProgress(project)), 2000),
            ),
    );

    return { openReviews, projectInformation, stageProgress };
};
