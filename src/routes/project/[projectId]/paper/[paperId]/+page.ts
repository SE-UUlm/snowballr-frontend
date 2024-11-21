import type { Paper } from "$lib/model/backend";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const paperId = Number(params.paperId);
    if (Number.isNaN(paperId)) {
        throw new Error(`Invalid paperId ${params.paperId}`);
    }
    const paper: Paper = {
        doi: "Doi",
        id: paperId,
        title: "Field-Sensitive Pointer Analysis for Static Dataflow in the R Programming Language",
        abstrakt: "Abstrakt",
        year: 2015,
        type: "Paper",
        authors: [
            { id: 0, firstName: "Foo", lastName: "Bar", orcid: "" },
            { id: 1, firstName: "Foo", lastName: "Bar", orcid: "" },
            { id: 2, firstName: "Foo", lastName: "Bar", orcid: "" },
            { id: 3, firstName: "Foo", lastName: "Bar", orcid: "" },
            { id: 4, firstName: "Foo", lastName: "Bar", orcid: "" },
        ],
        backwardReferencedPaperIds: [],
        forwardReferencedPaperIds: [],
    };
    return {
        paper,
        isReviewMode: true,
    };
};
