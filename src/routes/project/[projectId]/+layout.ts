import { getProject } from "$lib/api/project";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ params, depends }) => {
    depends("data:getProjectById");
    const projectId = params.projectId;
    const loadingProject = getProject(projectId);

    return {
        projectId,
        loadingProject,
    };
};
