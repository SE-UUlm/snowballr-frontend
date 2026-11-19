import type { Project_Paper } from "snowballr-api/project";
import { client } from "./client";
import { call } from "./grpc";

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
