import { setProjectFetchers } from "$lib/api/project";
import { createActionError, type ActionError } from "$lib/model/action-error";
import type { Fetchers } from "$lib/api/fetcher";
import { Project } from "$lib/api/types";
import { toast } from "svelte-sonner";

export async function updateFetchers(
    projectId: string,
    fetchers: Fetchers,
    onSuccess: (updatedProject: Project) => void = () => {},
    onError: (error: ActionError) => void = () => {},
) {
    function onFulfilled(project: Project) {
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
