import { backendService } from "$lib/grpc-api";
import { MemberRole, type Project_Member } from "$api/project";
import type { User } from "$api/user";
import { resource } from "$lib/resource.svelte";
import { getUserContext } from "$lib/custom-context/user-context";

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

/**
 * Checks if the current user is an admin of the project.
 *
 * @param loadingMembers - Promise that resolves to the list of members
 * @returns An object with a boolean value indicating if the user is an admin of the project
 */
export function isCurrentUserProjectAdmin(loadingMembers: Promise<MemberInfo[]>) {
    const user = getUserContext();
    const loadingIsCurrentMemberAdmin = loadingMembers.then(
        (members) =>
            members.find((member) => member.user!.id === user.id)?.role === MemberRole.ADMIN,
    );

    return resource(loadingIsCurrentMemberAdmin, {
        initialValue: undefined,
        onErrorValue: false,
        resourceName: "isCurrentUserAdmin",
    });
}
