import type { PageLoad } from "./$types";
import { loadMembers } from "../helper";

export const load: PageLoad = ({ params }) => {
    const loadingMembers = loadMembers({ id: params.projectId });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingMembers.catch(() => {});

    return {
        loadingMembers,
    };
};
