import { backendService } from "$lib/grpc-api";
import type { Project_Member } from "$lib/model/api/project";

export type MemberInfo = Project_Member & {
    isInvitationPending: boolean;
};

export async function loadMembers(projectId: { id: string }): Promise<MemberInfo[]> {
    const loadingMembers = backendService
        .getProjectMembers(projectId)
        .response.then(({ members }) => members);

    const loadingInvitees = backendService
        .getPendingInvitationsForProject(projectId)
        .response.then(({ users }) => users);

    const [members, invitees] = await Promise.all([loadingMembers, loadingInvitees]);

    return members.map((member) => {
        const isInvitationPending = invitees.some((invitee) => invitee.id === member.user?.id);
        return { ...member, isInvitationPending };
    });
}
