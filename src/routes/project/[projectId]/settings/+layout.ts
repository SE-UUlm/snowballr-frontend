import type { LayoutLoad } from "./$types";
import { loadMembers } from "./helper";

export const load: LayoutLoad = async ({ params, depends }) => {
    depends("data:getProjectById");
    const loadingMembers = loadMembers({ id: params.projectId });

    return { loadingMembers };
};
