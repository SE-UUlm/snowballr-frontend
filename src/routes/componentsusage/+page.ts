import type { PageLoad } from "./$types";
import { type Paper, ReviewDecision, type User } from "$lib/model/backend";

export const load: PageLoad = async () => {
    const user: User = {
        id: 0,
        status: "active",
        firstName: "John",
        lastName: "Doe",
        isAdmin: false,
        email: "john.doe@example.com",
    };

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
                    user: user,
                    finished: true,
                    decision: ReviewDecision.Accepted,
                    selectedCriteriaIds: [],
                },
                {
                    user: user,
                    finished: true,
                    decision: ReviewDecision.Maybe,
                    selectedCriteriaIds: [],
                },
            ],
        },
    };

    const paper2: Paper = {
        id: 13,
        title: "How to Drawjectory? Trajectory Planning using Programming by Demonstration",
        authors: [
            { id: 10, firstName: "Leonhard", lastName: "Alkewitz" },
            { id: 11, firstName: "Timo", lastName: "Zuccarello" },
            { id: 12, firstName: "Alexander", lastName: "Raschke" },
            { id: 13, firstName: "Matthias", lastName: "Tichy" },
        ],
        backwardReferencedPaperIds: [],
        forwardReferencedPaperIds: [],
        reviewData: {
            finalDecision: ReviewDecision.Declined,
            reviews: [
                {
                    user: user,
                    finished: true,
                    decision: ReviewDecision.Declined,
                    selectedCriteriaIds: [],
                },
            ],
        },
    };
    return { paper, paper2 };
};
