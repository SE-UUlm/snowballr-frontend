import { backendService } from "$lib/grpc-api";
import type { PageLoad } from "./$types";
import {
    PaperDecision,
    type Project,
    type Project_Information_DecisionStatistics,
} from "$api/project";
import type { Timestamp } from "$api/google/protobuf/timestamp";
import type { ProjectInformationInterface } from "$lib/components/composites/statistics/ProjectInformation.svelte";
import type { PaperListEntryInterface } from "$lib/components/composites/paper-components/PaperListEntry.svelte";
import type { StageProgressInterface } from "$lib/components/composites/statistics/StageProgress.svelte";

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
            allUndecidedPapers.projectPapers
                .map((projectPaper) => ({
                    projectId: params.projectId,
                    paper: projectPaper,
                    showReviewStatus: true,
                }))
                .sort((a, b) => {
                    const stageComparison = Number(a.paper.stage - b.paper.stage);
                    if (stageComparison !== 0) return stageComparison;

                    const localIdComparison = a.paper.localId.localeCompare(b.paper.localId);
                    return localIdComparison;
                }),
        )
        .catch(() => {
            throw new Error("Couldn't load open reviews.");
        });

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

    return { openReviews, projectInformation, stageProgress };
};
