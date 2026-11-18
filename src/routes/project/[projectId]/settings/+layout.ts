import { loadPrimedMembers } from "$lib/model/cache/project-members-cache";
import type { LayoutLoad } from "./$types";
import { loadMembers } from "./helper";

export const load: LayoutLoad = async (event) => {
    const loadingMembers = loadPrimedMembers(event, (id) => loadMembers({ id }));

    return { loadingMembers };
};
