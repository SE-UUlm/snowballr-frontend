import type { PageLoad } from "../../$types";
import { loadMembers } from "../helper";

export const load: PageLoad = ({ params }) => {
    const loadingMembers = loadMembers({ id: params.projectId });

    return {
        loadingMembers: loadingMembers,
    };
};
