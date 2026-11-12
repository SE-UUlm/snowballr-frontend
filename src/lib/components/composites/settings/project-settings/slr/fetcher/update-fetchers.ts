import { backendService } from "$lib/grpc-api";
import { createActionError, type ActionError } from "$lib/model/action-error";
import type { Fetchers } from "$lib/components/composites/settings/fetcher/fetcher";
import { Project, Project_Settings } from "$lib/api/types";
import { toast } from "svelte-sonner";

export async function updateFetchers(
    projectId: string,
    fetchers: Fetchers,
    onSuccess: (updatedProject: Project) => void = () => {},
    onError: (error: ActionError) => void = () => {},
) {
    const projectData: Partial<Project> = {
        id: projectId,
        settings: Project_Settings.create({
            fetchers: fetchers,
        }),
    };

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

    await backendService
        .updateProject({
            project: Project.create(projectData),
            // Manually set the path list because the generated field mask does not detect that the
            // map for the fetchers is set.
            mask: { paths: ["project.settings.fetchers"] },
        })
        .response.then(onFulfilled, onRejected);
}
