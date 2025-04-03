import { backendService } from "$lib/grpc-api";
import type { Project_Member } from "$lib/model/api/project";
import type { PageLoad } from "./$types";

export type MemberInfo = Project_Member & {
    isInvitationPending: boolean;
};

export const load: PageLoad = ({ params }) => {
    const loadingMembers = loadMembers({ id: params.projectId });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingMembers.catch(() => {});

    return {
        loadingMembers,
    };
};

async function loadMembers(projectId: { id: string }): Promise<MemberInfo[]> {
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
