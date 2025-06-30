import { backendService } from "$lib/grpc-api";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const loadingPaper = backendService.getPaperById({ id: params.paperId }).response;

    const backwardReferencedPapers = loadingPaper
        .then((paper) => backendService.getBackwardReferencedPapers({ id: paper.id }).response)
        .then((paperList) => paperList.papers);

    const forwardReferencedPapers = loadingPaper
        .then((paper) => backendService.getForwardReferencedPapers({ id: paper.id }).response)
        .then((paperList) => paperList.papers);

    return {
        loadingPaper,
        backwardReferencedPapers,
        forwardReferencedPapers,
    };
};
