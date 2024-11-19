import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const paperId = Number(params.paperId);
    if (Number.isNaN(paperId)) {
        throw new Error(`Invalid paperId ${params.paperId}`);
    }
    return {
        paperId: paperId,
    };
};
