import type { MemberInfo } from "#lib/model/member-info.js";
import { createPrimedCache, type ProjectLoadEvent } from "#lib/model/cache/primed-cache.js";

const membersCache = createPrimedCache<MemberInfo[]>("data:getProjectMembers");

/**
 * Loads the members for the settings layout load function: the primed members, if there are any, and
 * the fetched members otherwise.
 *
 * @param event - The event of the settings layout load function
 * @param fetchMembers - Fetches the members of the project with the given id, if none are primed for it
 * @see PrimedCache.load
 */
export function loadPrimedMembers(
    event: ProjectLoadEvent,
    fetchMembers: (projectId: string) => Promise<MemberInfo[]>,
): Promise<MemberInfo[]> {
    return membersCache.load(event, fetchMembers);
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
