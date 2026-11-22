import type { Project_Member } from "$lib/api/types";

export type MemberInfo = Project_Member & {
    isInvitationPending: boolean;
};
