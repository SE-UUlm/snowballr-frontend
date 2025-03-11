import { backendService } from "$lib/grpc-api";
import { Project_Paper } from "$lib/model/api/project";
import { type Stage } from "$lib/model/general";
import type { PageLoad } from "./$types";
import { asPaper } from "$lib/utils/model-helper";

export const load: PageLoad = ({ params }) => {
    const projectId = { id: params.projectId };

    const loadingCriteria = backendService
        .getAllCriteriaForProject(projectId)
        .response.then(({ criteria }) => criteria);
    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingCriteria.catch(() => {});

    const loadingPapers = backendService
        .getAllProjectPapersForProject(projectId)
        .response.then(({ projectPapers }) => projectPapers);
    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingPapers.catch(() => {});

    const loadingStages = loadingPapers.then(organizePapersByStage);
    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingStages.catch(() => {});

    const loadingYears = loadingPapers.then((projectPapers) => {
        const allYears = projectPapers.map((projectPaper) => asPaper(projectPaper).year);
        const uniqueYears = new Set(allYears);
        return Array.from(uniqueYears);
    });
    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingYears.catch(() => {});

    const loadingPublishers = loadingPapers.then((projectPapers) => {
        const allPublishers = projectPapers.map((projectPaper) => asPaper(projectPaper).publisher);
        const uniquePublishers = new Set(allPublishers);
        return Array.from(uniquePublishers);
    });
    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingPublishers.catch(() => {});

    const loadingReviewers = backendService
        .getProjectMembers({ id: params.projectId })
        .response.then(({ members }) => members.flatMap((member) => member.user!));
    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingReviewers.catch(() => {});

    return {
        loadingCriteria,
        loadingStages,
        loadingYears,
        loadingPublishers,
        loadingReviewers,
    };
};

/**
 * Organizes the papers by their stage. The stages are determined by the stageIndex of the papers.
 *
 * @param papers - The papers of a project from different stages.
 * @returns A list of stages with the papers of the respective stage.
 */
function organizePapersByStage(papers: Project_Paper[]): Stage[] {
    const stages: Stage[] = [];
    for (const paper of papers) {
        let stage = stages.find((stage) => stage.stageIndex === paper.stage);
        if (!stage) {
            stage = { stageIndex: paper.stage, papers: [] };
            stages.push(stage);
        }

        stage.papers.push(paper);
    }
    return stages;
}
