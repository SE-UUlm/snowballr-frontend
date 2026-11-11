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
