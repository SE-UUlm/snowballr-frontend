import { backendService } from "$lib/grpc-api";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ params }) => {
    const projectId = Number(params.projectId);
    if (Number.isNaN(projectId)) {
        throw new Error(`Invalid projectId ${params.projectId}`);
    }

    const loadingProject = backendService.getProjectById({ id: "123" }).response;

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingProject.catch(() => {});

    return {
        projectId,
        loadingProject,
    };
};
