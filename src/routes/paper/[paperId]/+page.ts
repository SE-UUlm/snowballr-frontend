import { getBackwardReferencedPapers, getForwardReferencedPapers, getPaper } from "$lib/api/paper";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const loadingPaper = getPaper(params.paperId);

    const backwardReferencedPapers = loadingPaper.then((paper) =>
        getBackwardReferencedPapers(paper.id),
    );

    const forwardReferencedPapers = loadingPaper.then((paper) =>
        getForwardReferencedPapers(paper.id),
    );

    return {
        loadingPaper,
        backwardReferencedPapers,
        forwardReferencedPapers,
    };
};
