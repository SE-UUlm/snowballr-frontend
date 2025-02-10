import { backendService } from "$lib/grpc-api";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const loadingPaper = backendService.getPaperById({ id: params.paperId }).response;

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingPaper.catch(() => {});

    const backwardReferencedPapers = loadingPaper
        .then((paper) => backendService.getBackwardReferencedPapers({ id: paper.id }).response)
        .then((paperList) => paperList.papers);

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    backwardReferencedPapers.catch(() => {});

    const forwardReferencedPapers = loadingPaper
        .then((paper) => backendService.getForwardReferencedPapers({ id: paper.id }).response)
        .then((paperList) => paperList.papers);

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    forwardReferencedPapers.catch(() => {});

    return {
        loadingPaper,
        backwardReferencedPapers,
        forwardReferencedPapers,
        isReviewMode: true,
    };
};
