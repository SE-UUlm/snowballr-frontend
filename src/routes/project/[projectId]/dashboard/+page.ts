import { backendService } from "$lib/grpc-api";
import type { PageLoad } from "./$types";
import {
    PaperDecision,
    type Project,
    type Project_Information_DecisionStatistics,
} from "$lib/model/api/project";
import type {
    PaperListEntryInterface,
    ProjectInformationInterface,
    StageProgressInterface,
} from "$lib/model/component-interfaces";
import type { Timestamp } from "$lib/model/api/google/protobuf/timestamp";

/**
 * Parses a Timestamp object into a date object.
 *
 * @param timestamp - The timestamp given as object of seconds and nanoseconds relative to an epoch of UTC
 * @param errorMessage - The message in the error thrown when the parsing is not possible
 */
function parseTimestamp(timestamp?: Timestamp, errorMessage: string = ""): Date {
    if (!timestamp) {
        throw new Error(errorMessage, { cause: "NoDate" });
    }

    return new Date(Number(timestamp.seconds) * 1000);
}

async function requestProjectInformation(
    project: Project,
    decisionStatistics: Project_Information_DecisionStatistics,
): Promise<ProjectInformationInterface> {
    const projectInformation = await backendService.getProjectInformation({ projectId: project.id })
        .response;
    if (!projectInformation.creationDate) {
        throw new Error("Couldn't load start date of project.", {
            cause: "NoDate",
        });
    }
    const startDate = parseTimestamp(
        projectInformation.creationDate,
        "Couldn't load start date of project.",
    );
    const startDateForStage = parseTimestamp(
        projectInformation.lastStageStarted,
        "Couldn't load start date of latest stage.",
    );
    const MILLIS_OF_ONE_DAY = 8.64e7;
    const daysInStage = Math.round(
        Math.abs(Date.now() - startDateForStage.getTime()) / MILLIS_OF_ONE_DAY,
    );

    const numberOfReviewedPapers = decisionStatistics.statistics.reduce(
        (acc, currentValue) =>
            [PaperDecision.IN_REVIEW, PaperDecision.UNREVIEWED].includes(currentValue.decision)
                ? acc + Number(currentValue.count)
                : acc,
        0,
    );
    const numberOfPapers = decisionStatistics.statistics.reduce(
        (acc, currentValue) => acc + Number(currentValue.count),
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

/**
 * Loads project information and open reviews for the currently opened project.
 */
export const load: PageLoad = async ({ params, parent }) => {
    const loadingProject = parent().then((project) => project.loadingProject);

    const openReviews: Promise<PaperListEntryInterface[]> = backendService
        .getPapersToReviewForProject({
            id: params.projectId,
        })
        .response.then((allUndecidedPapers) =>
            allUndecidedPapers.projectPapers.map((projectPaper) => ({
                projectId: params.projectId,
                paper: projectPaper,
                showReviewStatus: true,
            })),
        )
        .catch(() => {
            throw new Error("Couldn't load open reviews.");
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    openReviews.catch(() => {});

    const loadingDecisionStatistics = loadingProject.then(
        (project) =>
            backendService.getDecisionStatisticsForStage({
                projectId: project.id,
                stage: project.currentStage,
            }).response,
    );

    const projectInformation: Promise<ProjectInformationInterface> = Promise.all([
        loadingProject,
        loadingDecisionStatistics,
    ])
        .then(([project, decisionStatistics]) =>
            requestProjectInformation(project, decisionStatistics),
        )
        .catch((error) => {
            throw new Error(
                error.cause === "NoDate" ? error.message : "Couldn't load project information.",
            );
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    projectInformation.catch(() => {});

    const stageProgress: Promise<StageProgressInterface> = Promise.all([
        loadingProject,
        loadingDecisionStatistics,
    ])
        .then(([project, decisionStatistics]) => ({
            stage: project.currentStage,
            decisions: decisionStatistics,
        }))
        .catch(() => {
            throw new Error("Couldn't load stage progress.");
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    stageProgress.catch(() => {});

    return { openReviews, projectInformation, stageProgress };
};
