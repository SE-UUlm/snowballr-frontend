import { backendService } from "$lib/grpc-api";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const loadingProjectPaper = backendService.getProjectPaperById({ id: params.paperId }).response;

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingProjectPaper.catch(() => {});

    const backwardReferencedPapers = loadingProjectPaper
        .then(({ paper }) => backendService.getBackwardReferencedPapers({ id: paper!.id }).response)
        .then((paperList) => paperList.papers);

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    backwardReferencedPapers.catch(() => {});

    const forwardReferencedPapers = loadingProjectPaper
        .then(({ paper }) => backendService.getForwardReferencedPapers({ id: paper!.id }).response)
        .then((paperList) => paperList.papers);

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    forwardReferencedPapers.catch(() => {});

    return {
        loadingProjectPaper,
        backwardReferencedPapers,
        forwardReferencedPapers,
        isReviewMode: true,
    };
};
