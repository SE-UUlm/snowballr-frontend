import type { PageLoad } from "./$types";
import { BackendController } from "$lib/controller/backend-controller";
import {
    type Paper,
    type Project,
    type ProjectMetadata,
    type StageEntry,
    type User,
} from "$lib/model/backend";
import { calculateStageProgress } from "$lib/utils/statistics-helper";

async function requestProjectMetadata(project: Project): Promise<ProjectMetadata> {
    const projectController = BackendController.getInstance().project(project.id);
    const members: User[] = await projectController.getMembers();
    const currentStage: number = await projectController.getStageCount();
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

/**
 * Loads projects for the user logged in.
 *
 * Therefore, request the project ids of the projects, the user logged in is member of and use
 * these ids to request:
 * - the project members
 * - the current project stage
 * - the progress of the current stage
 *
 * TODO: check, whether this can be handled with a single request, e.g. on route /projects/[id]/projectMetadata/.
 */
export const load: PageLoad = () => {
    const projectsMetadata = BackendController.getInstance()
        .thisUser()
        .getAllProjects()
        .then(async (projects: Project[]) => {
            try {
                return await Promise.all(
                    projects.map((project: Project) => requestProjectMetadata(project)),
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

    return { projectsMetadata };
};
