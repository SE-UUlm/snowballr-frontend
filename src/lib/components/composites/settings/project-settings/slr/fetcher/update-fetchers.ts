import { setProjectFetchers } from "#lib/api/project.js";
import { createActionError, type ActionError } from "#lib/model/action-error.js";
import type { Fetchers } from "#lib/api/fetcher.js";
import type { Project } from "#lib/api/types.js";
import { toast } from "svelte-sonner";
import { refreshProject } from "#lib/model/cache/project-cache.js";

export async function updateFetchers(
    projectId: string,
    fetchers: Fetchers,
    onSuccess: (updatedProject: Project) => void = () => {},
    onError: (error: ActionError) => void = () => {},
) {
    async function onFulfilled(project: Project) {
        // The project is loaded once by the project layout and is not reloaded when navigating
        // between settings tabs, so it has to be refreshed for a remounted section to read it.
        await refreshProject(project);
        toast.success("Successfully updated project settings.");
        onSuccess(project);
    }

    function onRejected(error: Error) {
        toast.error("Error when updating project.", {
            description: error.message,
        });
        onError(
            createActionError(
                "Project Settings Update Failed",
                {
                    action: "updating the project settings",
                },
                error,
            ),
        );
    }

    await setProjectFetchers(projectId, fetchers).then(onFulfilled, onRejected);
}
