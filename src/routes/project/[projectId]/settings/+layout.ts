import { MEMBERS_DEPENDENCY_KEY, takePrimedMembers } from "$lib/model/cache/project-members-cache";
import type { LayoutLoad } from "./$types";
import { loadMembers } from "./helper";

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(MEMBERS_DEPENDENCY_KEY);
    const primedMembers = takePrimedMembers(params.projectId);
    const loadingMembers = primedMembers
        ? Promise.resolve(primedMembers)
        : loadMembers({ id: params.projectId });

    return { loadingMembers };
};
