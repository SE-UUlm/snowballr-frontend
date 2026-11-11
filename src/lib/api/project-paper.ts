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
 * Loads the papers of a project that the current user can review.
 *
 * @param projectId - The ID of the project
 * @returns The papers to review, possibly none
 */
export async function getPapersToReview(projectId: string): Promise<Project_Paper[]> {
    const { projectPapers } = await call(client.getPapersToReviewForProject({ id: projectId }));
    return projectPapers;
}
