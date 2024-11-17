import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ params }) => {
    const projectId = Number(params.projectId);
    if (Number.isNaN(projectId)) {
        throw new Error(`Invalid projectId ${params.projectId}`);
    }
    return {
        projectId: projectId,
    };
};
