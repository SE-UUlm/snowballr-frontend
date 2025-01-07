import type { PageLoad } from "./$types";
import { BackendController } from "$lib/controller/backend-controller";
import {
    type Paper,
    type Project,
    type ProjectMetadata,
    type StageEntry,
    type User,
} from "$lib/model/backend";
import { calculateStageProgress, isPaperUndecided } from "$lib/utils/statistics-helper";

interface PaperInfos {
    paper: Paper;
    projectId: number;
    showReviewStatus: boolean;
}

async function requestProjectMetadata(project: Project): Promise<ProjectMetadata> {
    const projectController = BackendController.getInstance().project(project.id);
    const members: User[] = await projectController.getMembers();
    const currentStage: number = await projectController.getCurrentStage();
    const allPapersInCurrentStage: StageEntry[] = await projectController
        .stage(currentStage)
        .getPapers();

    return {
        project: project,
        members: members,
        stage: currentStage,
        stageProgress: calculateStageProgress(
            allPapersInCurrentStage.map((stageEntry: StageEntry): Paper => stageEntry.paper),
        ),
    };
}

async function requestUndecidedPapers(project: Project): Promise<PaperInfos[]> {
    const projectController = BackendController.getInstance().project(project.id);
    const currentStage: number = await projectController.getCurrentStage();
    const latestStage: number = await projectController.getStageCount();
    const allUndecidedPapers: PaperInfos[] = [];

    for (let i = currentStage; i <= latestStage; i++) {
        const allStageEntriesFromStageI: StageEntry[] = await projectController
            .stage(currentStage)
            .getPapers();
        allUndecidedPapers.push(
            ...allStageEntriesFromStageI
                .map((stageEntry) => ({
                    paper: stageEntry.paper,
                    projectId: project.id,
                    /// TODO: request this information, e.g. from local store
                    showReviewStatus: false,
                }))
                .filter((paperInfo: PaperInfos) => isPaperUndecided(paperInfo.paper)),
        );
    }
    return allUndecidedPapers;
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
 *
 * TODO: check, whether this can be handled with a single request, e.g. on route /projects/[id]/projectMetadata/.
 */
export const load: PageLoad = () => {
    const allUserProjects = BackendController.getInstance().thisUser().getAllProjects();

    const projectsMetadata: Promise<ProjectMetadata[]> = allUserProjects
        .then(async (projects: Project[]) => {
            try {
                return await Promise.all(
                    projects.map((project) => requestProjectMetadata(project)),
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

    const openReviews: Promise<PaperInfos[]> = allUserProjects
        .then(async (projects: Project[]) => {
            try {
                return await Promise.all(
                    projects.map((project) => requestUndecidedPapers(project)),
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
    projectsMetadata.catch(() => {});

    openReviews.catch(() => {});

    return { projectsMetadata, openReviews };
};
