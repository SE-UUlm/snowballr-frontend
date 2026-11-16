import type { MemberInfo } from "$lib/model/member-info";
import { createPrimedCache } from "$lib/model/cache/primed-cache";

export const MEMBERS_DEPENDENCY_KEY = "data:getProjectMembers";

const membersCache = createPrimedCache<MemberInfo[]>(MEMBERS_DEPENDENCY_KEY);

/**
 * Takes the primed members, if they belong to the given project id.
 * This is primarily for use by the settings layout load function.
 *
 * @see PrimedCache.take
 */
export function takePrimedMembers(projectId: string): MemberInfo[] | undefined {
    return membersCache.take(projectId);
}

/**
 * Replaces the members loaded by the settings layout with the given, already up-to-date members,
 * without fetching them again.
 *
 * @param projectId - The id of the project the members belong to
 * @param members - The up-to-date members, e.g. just reloaded after a member was invited
 * @see PrimedCache.refresh
 */
export function refreshMembers(projectId: string, members: MemberInfo[]): Promise<void> {
    return membersCache.refresh(projectId, members);
}
