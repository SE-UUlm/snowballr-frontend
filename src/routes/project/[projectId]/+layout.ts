import { backendService } from "$lib/grpc-api";
import { PROJECT_DEPENDENCY_KEY, takePrimedProject } from "$lib/model/project-cache";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(PROJECT_DEPENDENCY_KEY);
    const projectId = params.projectId;
    const primedProject = takePrimedProject(projectId);
    const loadingProject = primedProject
        ? Promise.resolve(primedProject)
        : backendService.getProjectById({ id: projectId }).response;

    return {
        projectId,
        loadingProject,
    };
};
