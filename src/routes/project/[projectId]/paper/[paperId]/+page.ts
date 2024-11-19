import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const projectId = Number(params.projectId);
    if (Number.isNaN(projectId)) {
        throw new Error(`Invalid projectId ${params.projectId}`);
    }
    const paperId = Number(params.paperId);
    if (Number.isNaN(paperId)) {
        throw new Error(`Invalid paperId ${params.paperId}`);
    }
    return {
        projectId: projectId,
        paperId: paperId,
    };
};
