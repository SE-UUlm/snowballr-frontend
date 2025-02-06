import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const paperId = Number(params.paperId);
    if (Number.isNaN(paperId)) {
        throw new Error(`Invalid paperId ${params.paperId}`);
    }
    return {
        paper: {
            id: `${paperId}`,
            externalId: "EXT12345",
            title: "An Analysis of TypeScript Performance",
            abstrakt:
                "This paper examines the performance characteristics of TypeScript in large-scale applications.",
            year: 2023,
            publisher: "Tech Journal",
            publicationName: "Journal of Modern Programming",
            publicationType: "Journal Article",
            hasPdf: true,
            authors: [
                { firstName: "John", lastName: "Doe", orcid: "0000-0001-2345-6789" },
                { firstName: "Jane", lastName: "Smith", orcid: "0000-0002-3456-7890" },
            ],
            backwardReferencedIds: ["1", "2"],
        },
        isReviewMode: true,
    };
};
