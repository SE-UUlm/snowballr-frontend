import { backendService } from "$lib/grpc-api";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ params, depends }) => {
    depends("data:getProjectById");
    const projectId = params.projectId;
    const loadingProject = backendService.getProjectById({ id: projectId }).response;

    return {
        projectId,
        loadingProject,
    };
};
