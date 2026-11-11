import { getProject } from "$lib/api/project";
import { loadPrimedProject } from "$lib/model/cache/project-cache";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async (event) => {
    const loadingProject = loadPrimedProject(event, getProject);

    return {
        projectId: event.params.projectId,
        loadingProject,
    };
};
