import { backendService } from "$lib/grpc-api";
import { Project_Paper } from "$lib/model/api/project";
import { type Stage } from "$lib/model/general";
import { comparePaperId } from "$lib/utils/common-helper";
import type { PageLoad } from "./$types";
import { asPaper } from "$lib/utils/model-helper";

export const load: PageLoad = ({ params }) => {
    const projectId = { id: params.projectId };

    const loadingCriteria = backendService
        .getAllCriteriaForProject(projectId)
        .response.then(({ criteria }) => criteria);

    const loadingPapers = backendService
        .getAllProjectPapersForProject(projectId)
        .response.then(({ projectPapers }) => projectPapers);

    const loadingStages = loadingPapers.then(organizePapersByStage);

    const loadingYears = loadingPapers.then((projectPapers) => {
        const allYears = projectPapers.map((projectPaper) => asPaper(projectPaper).year);
        const uniqueYears = new Set(allYears);
        return Array.from(uniqueYears);
    });

    const loadingPublishers = loadingPapers.then((projectPapers) => {
        const allPublishers = projectPapers.map((projectPaper) => asPaper(projectPaper).publisher);
        const uniquePublishers = new Set(allPublishers);
        return Array.from(uniquePublishers);
    });

    const loadingReviewers = backendService
        .getProjectMembers({ id: params.projectId })
        .response.then(({ members }) => members.flatMap((member) => member.user!));

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
 * If no papers are provided, a stage with an index of 0 is returned to allow the user to add initial papers.
 *
 * @param papers - The papers of a project from different stages.
 * @returns A list of stages with the papers of the respective stage.
 */
function organizePapersByStage(papers: Project_Paper[]): Stage[] {
    const stages: Stage[] = [];
    for (const paper of papers) {
        let stage = stages.find((s) => s.stageIndex === paper.stage);
        if (!stage) {
            stage = { stageIndex: paper.stage, papers: [] };
            stages.push(stage);
        }

        stage.papers.push(paper);
    }
    stages.forEach((stage) => stage.papers.sort((a, b) => comparePaperId(a.localId, b.localId)));
    stages.sort((a, b) => Number(a.stageIndex - b.stageIndex));

    if (stages.length === 0) {
        stages.push({ stageIndex: 0n, papers: [] });
    }

    return stages;
}
