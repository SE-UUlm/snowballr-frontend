import { loadPrimedMembers } from "#lib/model/cache/project-members-cache.js";
import type { LayoutLoad } from "./$types";
import { loadMembers } from "./helper";

export const load: LayoutLoad = async (event) => {
    const loadingMembers = loadPrimedMembers(event, loadMembers);

    return { loadingMembers };
};
