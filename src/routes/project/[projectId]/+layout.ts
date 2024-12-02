import type { Project } from "$lib/types";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ params }) => {
    const projectId = Number(params.projectId);
    if (Number.isNaN(projectId)) {
        throw new Error(`Invalid projectId ${params.projectId}`);
    }
    const project: Project = {
        id: projectId,
        name: "Project " + projectId,
    };
    return {
        project,
    };
};
