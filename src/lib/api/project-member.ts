import type { Project_Member } from "snowballr-api/project";
import { client } from "./client";
import { call } from "./grpc";

/**
 * Loads the members of a project.
 *
 * @param projectId - The ID of the project
 * @returns The members with their roles
 */
export async function getProjectMembers(projectId: string): Promise<Project_Member[]> {
    const { members } = await call(client.getProjectMembers({ id: projectId }));
    return members;
}
