import type { Project_Paper } from "snowballr-api/project";
import { client } from "./client";
import { call } from "./grpc";

/**
 * Loads all papers of a project, from every stage.
 *
 * @param projectId - The ID of the project
 * @returns The papers of the project, possibly none
 */
export async function listProjectPapers(projectId: string): Promise<Project_Paper[]> {
    const { projectPapers } = await call(client.getAllProjectPapersForProject({ id: projectId }));
    return projectPapers;
}

/**
 * Loads a project paper by its local ID, the number that identifies it within its project and
 * appears in its URL.
 *
 * @param projectId - The ID of the project
 * @param localId - The local ID of the paper within the project
 * @returns The project paper
 */
export async function getProjectPaperByLocalId(
    projectId: string,
    localId: string,
): Promise<Project_Paper> {
    return call(client.getProjectPaperByRelativeId({ projectId, relativeProjectPaperId: localId }));
}

/**
 * Loads the paper that follows a project paper in its project, by local ID.
 *
 * Rejects with kind `"failed-precondition"` if the paper is the last one of the project.
 *
 * @param projectPaperId - The ID of the project paper
 * @returns The next project paper
 */
export async function getNextPaper(projectPaperId: string): Promise<Project_Paper> {
    return call(client.getNextPaper({ id: projectPaperId }));
}

/**
 * Loads the paper that precedes a project paper in its project, by local ID.
 *
 * Rejects with kind `"failed-precondition"` if the paper is the first one of the project.
 *
 * @param projectPaperId - The ID of the project paper
 * @returns The previous project paper
 */
export async function getPreviousPaper(projectPaperId: string): Promise<Project_Paper> {
    return call(client.getPreviousPaper({ id: projectPaperId }));
}

/**
 * Loads the next paper in the project of a project paper that the current user can review.
 * Papers with lower local IDs come first.
 *
 * Rejects with kind `"failed-precondition"` if there is no paper left to review.
 *
 * @param projectPaperId - The ID of the project paper to continue from
 * @returns The next project paper to review
 */
export async function getNextPaperToReview(projectPaperId: string): Promise<Project_Paper> {
    return call(client.getNextPaperToReview({ id: projectPaperId }));
}

/**
 * Adds a paper to a stage of a project.
 *
 * Rejects with kind `"already-exists"` if the paper is already in the project.
 *
 * @param projectId - The ID of the project
 * @param paperId - The ID of the paper
 * @param stage - The stage to add the paper to
 * @returns The new project paper
 */
export async function addPaperToProject(
    projectId: string,
    paperId: string,
    stage: bigint,
): Promise<Project_Paper> {
    return call(client.addPaperToProject({ projectId, paperId, stage }));
}

/**
 * Loads the papers of a project that the current user can review.
 *
 * @param projectId - The ID of the project
 * @returns The papers to review, possibly none
 */
export async function getPapersToReview(projectId: string): Promise<Project_Paper[]> {
    const { projectPapers } = await call(client.getPapersToReviewForProject({ id: projectId }));
    return projectPapers;
}
