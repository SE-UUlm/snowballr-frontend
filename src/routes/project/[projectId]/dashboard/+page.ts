import { backendService } from "$lib/grpc-api";
import type { PageLoad } from "./$types";
import { PaperDecision, type Project, type Project_Paper } from "$lib/model/api/project";
import type {
    PaperListEntryInterface,
    ProjectInformationInterface,
    StageProgressInterface,
} from "$lib/model/component-interfaces";
import { exhaustiveCheck, groupBy } from "$lib/utils/common-helper";
import type { PaperStatus } from "$lib/model/general";

async function groupProjectPapersInStageByDecision(
    project: Project,
): Promise<{ [key: string]: Project_Paper[] }> {
    const papersOfStage = await backendService
        .getAllProjectPapersForProject({ id: project.id })
        .response.then((papers) =>
            papers.projectPapers.filter(
                (projectPaper) => projectPaper.stage === project.currentStage,
            ),
        );

    return groupBy(papersOfStage, (projectPaper): PaperStatus => {
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
}

async function requestProjectInformation(project: Project): Promise<ProjectInformationInterface> {
    // TODO: add a real call to the backend (extend API + extend mock backend), waiting for #7 in snowballr-api
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);
    const daysInStage = 2;

    const papersByDecision = await groupProjectPapersInStageByDecision(project);
    const numberOfReviewedPapers =
        (papersByDecision["Accepted"] ?? []).length + (papersByDecision["Declined"] ?? []).length;
    const numberOfPapers = Object.entries(papersByDecision).reduce(
        (acc, currentValue) => acc + currentValue[1].length,
        0,
    );

    return {
        projectName: project.name,
        projectStart: startDate,
        projectStage: project.currentStage,
        daysInStage: daysInStage,
        estimatedRemainingDays:
            (daysInStage * numberOfPapers) / numberOfReviewedPapers - daysInStage,
        totalPapersInStage: numberOfPapers,
        reviewedPapersInStage: numberOfReviewedPapers,
    };
}

async function requestStageProgress(project: Project): Promise<StageProgressInterface> {
    const papersByDecision = await groupProjectPapersInStageByDecision(project);
    const decisions = {
        "Not reviewed": (papersByDecision["Not reviewed"] ?? []).length,
        Undecided: (papersByDecision["Undecided"] ?? []).length,
        Accepted: (papersByDecision["Accepted"] ?? []).length,
        Declined: (papersByDecision["Declined"] ?? []).length,
    };
    return {
        stage: project.currentStage,
        decisions: decisions,
    };
}

/**
 * Loads project information and open reviews for the currently opened project.
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

    const projectInformation: Promise<ProjectInformationInterface> = loadingProject.then(
        (project) => requestProjectInformation(project),
    );
    const stageProgress: Promise<StageProgressInterface> = loadingProject.then((project) =>
        requestStageProgress(project),
    );

    return { openReviews, projectInformation, stageProgress };
};
