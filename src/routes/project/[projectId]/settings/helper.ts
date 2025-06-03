import { backendService } from "$lib/grpc-api";
import { MemberRole, type Project_Member } from "$lib/model/api/project";
import type { User } from "$lib/model/api/user";

export type MemberInfo = Project_Member & {
    isInvitationPending: boolean;
};

export async function loadMembers(projectId: { id: string }): Promise<MemberInfo[]> {
    const loadingMembers = backendService
        .getProjectMembers(projectId)
        .response.then(({ members }) => members)
        .then((members) => members.map((member) => ({ ...member, isInvitationPending: false })));

    const loadingInvitees = backendService
        .getPendingInvitationsForProject(projectId)
        .response.then(({ users }) => users)
        .then((users) =>
            users.map((user) => ({ ...inviteeToDefaultMember(user), isInvitationPending: true })),
        );

    const [members, invitees] = await Promise.all([loadingMembers, loadingInvitees]);
    return members.concat(invitees).toSorted(compareNames);
}

function inviteeToDefaultMember(invitee: User): Project_Member {
    return {
        user: invitee,
        role: MemberRole.DEFAULT,
    };
}

function compareNames(a: MemberInfo, b: MemberInfo): number {
    const firstNameCompare = a.user!.firstName.localeCompare(b.user!.firstName);
    if (firstNameCompare !== 0) {
        return firstNameCompare;
    }
    return a.user!.lastName.localeCompare(b.user!.lastName);
}
