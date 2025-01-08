import { backendService } from "$lib/grpc-api";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const loadingPaper =  backendService.getPaperById({ id: params.paperId }).response

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingPaper.catch(() => {});

    return {
        loadingPaper,
    };
};
