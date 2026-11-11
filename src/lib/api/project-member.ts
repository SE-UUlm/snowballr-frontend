import type { MemberRole, Project_Member } from "snowballr-api/project";
import { client } from "./client";
import { call } from "./grpc";

/**
 * Loads the members of a project. Users with a pending invitation are left out.
 *
 * @param projectId - The ID of the project
 * @returns The members with their roles
 */
export async function getProjectMembers(projectId: string): Promise<Project_Member[]> {
    const { members } = await call(client.getProjectMembers({ id: projectId }));
    return members;
}

/**
 * Removes a member or an invitee from a project. Members can remove themselves to leave the
 * project.
 *
 * Rejects with kind `"failed-precondition"` if the member is the last admin of the project.
 *
 * @param projectId - The ID of the project
 * @param email - The email address of the member to remove
 */
export async function removeProjectMember(projectId: string, email: string): Promise<void> {
    await call(client.removeProjectMember({ projectId, userEmail: email }));
}

/**
 * Sets the role of a project member, for example to promote them to an admin.
 *
 * @param projectId - The ID of the project
 * @param userId - The ID of the member
 * @param role - The new role
 */
export async function setProjectMemberRole(
    projectId: string,
    userId: string,
    role: MemberRole,
): Promise<void> {
    await call(client.updateProjectMemberRole({ projectId, userId, newRole: role }));
}
