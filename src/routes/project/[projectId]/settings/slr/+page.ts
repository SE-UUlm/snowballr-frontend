import type { PageLoad } from "../../$types";
import { loadMembers } from "../members/helper";

export const load: PageLoad = ({ params }) => {
    const loadingMemebers = loadMembers({ id: params.projectId });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingMemebers.catch(() => {});

    return {
        loadingMemebers,
    };
};
