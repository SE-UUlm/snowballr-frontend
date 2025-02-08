import { backendService } from "$lib/grpc-api";
import type { LayoutLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: LayoutLoad = async ({ params }) => {
    const projectId = params.projectId;
    const loadingProject = backendService.getProjectById({ id: projectId }).response;

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingProject.catch((err) => {
        console.error(`Could not load project with id ${projectId} (${err})`);
        error(404, { message: "Project not found" });
    });

    return {
        projectId,
        loadingProject,
    };
};
