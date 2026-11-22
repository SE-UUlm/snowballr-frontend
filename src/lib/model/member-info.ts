import type { Project_Member } from "#lib/api/types.js";

export type MemberInfo = Project_Member & {
    isInvitationPending: boolean;
};
