import type { PageLoad } from "./$types";
import { type Paper, ReviewDecision } from "$lib/model/backend";

export const load: PageLoad = async () => {
    const paper: Paper = {
        id: 12,
        title: "Field Sensitive Pointer Analysis for Static Data Flow in the R Programming Language",
        authors: [
            { id: 2, firstName: "Felix", lastName: "Schlegel" },
            { id: 3, firstName: "Florian", lastName: "Sihler" },
        ],
        backwardReferencedPaperIds: [],
        forwardReferencedPaperIds: [],
        reviewData: {
            finalDecision: ReviewDecision.Accepted,
            reviews: [
                {
                    userId: 1,
                    finished: true,
                    decision: ReviewDecision.Accepted,
                    selectedCriteriaIds: [],
                },
            ],
        },
    };
    return { paper };
};
