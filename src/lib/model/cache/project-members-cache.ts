import { invalidate } from "$app/navigation";
import type { MemberInfo } from "../../../routes/project/[projectId]/settings/helper";

export const MEMBERS_DEPENDENCY_KEY = "data:getProjectMembers";

/**
 * Members that are already known to be up to date, because they were just reloaded after a change.
 * They are handed to the next run of the settings layout's load function exactly once, so that the
 * layout does not have to fetch the members again.
 */
let primedMembers: { projectId: string; members: MemberInfo[] } | undefined = undefined;

/**
 * Takes the primed members, if they belong to the given project id.
 * This is primarily for use by the settings layout load function.
 *
 * The primed members are cleared in any case, so that later loads fetch the members again.
 *
 * @param projectId - The id of the project whose members are loaded
 * @returns The primed members, or undefined if there are none for the given id
 */
export function takePrimedMembers(projectId: string): MemberInfo[] | undefined {
    const primed = primedMembers;
    primedMembers = undefined;
    return primed?.projectId === projectId ? primed.members : undefined;
}

/**
 * Replaces the members loaded by the settings layout with the given, already up-to-date members.
 *
 * The members are primed and the layout is invalidated, so the layout picks up the given members
 * without fetching them again.
 *
 * @param projectId - The id of the project the members belong to
 * @param members - The up-to-date members, e.g. just reloaded after a member was invited
 */
export async function refreshMembers(projectId: string, members: MemberInfo[]): Promise<void> {
    primedMembers = { projectId, members };
    await invalidate(MEMBERS_DEPENDENCY_KEY);
}
