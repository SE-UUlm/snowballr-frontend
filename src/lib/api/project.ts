import type {
    Project,
    Project_Information,
    Project_Information_DecisionStatistics,
} from "snowballr-api/project";
import { client } from "./client";
import { call } from "./grpc";

/**
 * Loads a project.
 *
 * @param projectId - The ID of the project
 * @returns The project
 */
export async function getProject(projectId: string): Promise<Project> {
    return call(client.getProjectById({ id: projectId }));
}

/**
 * Loads the active projects that a user is a member of. Projects the user is only invited to are
 * left out.
 *
 * @param userId - The ID of the user
 * @returns The active projects of the user
 */
export async function listProjectsForUser(userId: string): Promise<Project[]> {
    const { projects } = await call(client.getAllProjectsForUser({ id: userId }));
    return projects;
}

/**
 * Loads the archived projects that a user is a member of.
 *
 * @param userId - The ID of the user
 * @returns The archived projects of the user
 */
export async function listArchivedProjectsForUser(userId: string): Promise<Project[]> {
    const { projects } = await call(client.getAllArchivedProjectsForUser({ id: userId }));
    return projects;
}

/**
 * Loads the information about a project's progress, such as its creation date and the start of
 * its current stage.
 *
 * @param projectId - The ID of the project
 * @returns The project information
 */
export async function getProjectInformation(projectId: string): Promise<Project_Information> {
    return call(client.getProjectInformation({ projectId }));
}

/**
 * Loads how many papers of a stage have each decision.
 *
 * @param projectId - The ID of the project
 * @param stage - The stage
 * @returns The decision statistics of the stage
 */
export async function getDecisionStatisticsForStage(
    projectId: string,
    stage: bigint,
): Promise<Project_Information_DecisionStatistics> {
    return call(client.getDecisionStatisticsForStage({ projectId, stage }));
}

/**
 * Creates a project.
 *
 * @param name - The name of the project
 * @returns The created project
 */
export async function createProject(name: string): Promise<Project> {
    return call(client.createProject({ name }));
}

/**
 * Deletes a project. The backend only marks it as deleted, so it can be restored later.
 *
 * @param projectId - The ID of the project
 */
export async function deleteProject(projectId: string): Promise<void> {
    await call(client.softDeleteProject({ id: projectId }));
}
