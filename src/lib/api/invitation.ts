import type { User } from "snowballr-api/user";
import { client } from "./client";
import { call } from "./grpc";

/**
 * Invites a user to a project by email. The backend sends the invitation email.
 *
 * @param projectId - The ID of the project
 * @param email - The email address of the user to invite
 */
export async function inviteUserToProject(projectId: string, email: string): Promise<void> {
    await call(client.inviteUserToProject({ projectId, userEmail: email }));
}

/**
 * Loads the users with a pending invitation to a project. A user who was invited by email and
 * hasn't registered yet has an empty ID.
 *
 * @param projectId - The ID of the project
 * @returns The invited users
 */
export async function getPendingInvitations(projectId: string): Promise<User[]> {
    const { users } = await call(client.getPendingInvitationsForProject({ id: projectId }));
    return users;
}

/**
 * Searches the users that can be invited. The backend matches and ranks them and never suggests
 * the current user.
 *
 * @param query - The search string, for example part of a name or an email address
 * @param projectId - The project to invite to, whose members are left out. Without it, nobody else
 * is left out.
 * @returns The matching users, none if the query is too short
 */
export async function getInviteCandidates(query: string, projectId?: string): Promise<User[]> {
    const { users } = await call(client.getInviteCandidates({ query, projectId: projectId ?? "" }));
    return users;
}

/**
 * Accepts a project invitation with the token from the invitation email.
 *
 * Rejects with kind `"invalid-argument"` if the token is empty, `"not-found"` if it is unknown or
 * expired, and `"failed-precondition"` if the user isn't registered or active.
 *
 * @param token - The token from the invitation link
 */
export async function acceptProjectInvitation(token: string): Promise<void> {
    await call(client.acceptProjectInvitation({ token }));
}
