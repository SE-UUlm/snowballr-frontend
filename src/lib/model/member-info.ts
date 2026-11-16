import type { Project_Member } from "snowballr-api/project";

export type MemberInfo = Project_Member & {
    isInvitationPending: boolean;
};
