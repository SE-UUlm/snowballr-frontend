import type { Paper } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const paperId = Number(params.paperId);
    if (Number.isNaN(paperId)) {
        throw new Error(`Invalid paperId ${params.paperId}`);
    }
    const paper: Paper = {
        id: paperId,
        title: "Field-Sensitive Pointer Analysis for Static Dataflow in the R Programming Language",
        authors: [
            "Author 1",
            "Author 2",
            "Author 3",
            "Author 4",
            "Author 5",
            "Author 6",
            "Author 7",
            "Author 8",
            "Author 9",
            "Author 10",
        ],
        isBookmarked: false,
    };
    return {
        paper,
    };
};
