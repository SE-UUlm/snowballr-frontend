import { backendService } from "$lib/grpc-api";
import { loadPrimedProject } from "$lib/model/cache/project-cache";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async (event) => {
    const loadingProject = loadPrimedProject(
        event,
        (id) => backendService.getProjectById({ id }).response,
    );

    return {
        projectId: event.params.projectId,
        loadingProject,
    };
};
